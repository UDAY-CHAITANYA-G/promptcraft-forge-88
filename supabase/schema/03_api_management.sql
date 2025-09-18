-- ============================================================================
-- API MANAGEMENT SCHEMA
-- ============================================================================
-- This file contains all API-related tables and configurations

-- ============================================================================
-- API PROVIDERS TABLE
-- ============================================================================

-- Create API providers table to store provider configurations
CREATE TABLE IF NOT EXISTS public.api_providers (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    base_url TEXT NOT NULL,
    api_key_pattern TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    max_requests_per_minute INTEGER DEFAULT 60,
    max_requests_per_day INTEGER DEFAULT 1000,
    supported_models JSONB DEFAULT '[]',
    validation_rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_provider_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_base_url CHECK (base_url ~ '^https?://'),
    CONSTRAINT valid_limits CHECK (max_requests_per_minute > 0 AND max_requests_per_day > 0)
);

-- Enable RLS
ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for API providers (read-only for users)
CREATE POLICY "Anyone can view enabled providers" ON public.api_providers
    FOR SELECT USING (is_enabled = true);

-- Create indexes for API providers
CREATE INDEX IF NOT EXISTS idx_api_providers_name ON public.api_providers(name);
CREATE INDEX IF NOT EXISTS idx_api_providers_is_enabled ON public.api_providers(is_enabled);

-- Create trigger for updated_at
CREATE TRIGGER update_api_providers_updated_at
    BEFORE UPDATE ON public.api_providers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- API CONFIGURATIONS TABLE
-- ============================================================================

-- Create API configurations table to store user API keys
CREATE TABLE IF NOT EXISTS public.api_configurations (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_validated BOOLEAN DEFAULT false,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    validation_error TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_user_provider UNIQUE(user_id, provider),
    CONSTRAINT valid_provider CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    CONSTRAINT valid_usage_count CHECK (usage_count >= 0)
);

-- Enable RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for API configurations
CREATE POLICY "Users can view own api configurations" ON public.api_configurations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api configurations" ON public.api_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api configurations" ON public.api_configurations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api configurations" ON public.api_configurations
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for API configurations
CREATE INDEX IF NOT EXISTS idx_api_configurations_user_id ON public.api_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_configurations_provider ON public.api_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_api_configurations_is_active ON public.api_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_api_configurations_is_validated ON public.api_configurations(is_validated);

-- Create trigger for updated_at
CREATE TRIGGER update_api_configurations_updated_at
    BEFORE UPDATE ON public.api_configurations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- API USAGE TRACKING TABLE
-- ============================================================================

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    endpoint TEXT NOT NULL,
    request_size INTEGER DEFAULT 0,
    response_size INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_provider CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    CONSTRAINT valid_sizes CHECK (request_size >= 0 AND response_size >= 0),
    CONSTRAINT valid_response_time CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
    CONSTRAINT valid_status_code CHECK (status_code IS NULL OR (status_code >= 100 AND status_code < 600))
);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for API usage logs
CREATE POLICY "Users can view own usage logs" ON public.api_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" ON public.api_usage_logs
    FOR INSERT WITH CHECK (true);

-- Create indexes for API usage logs
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_provider ON public.api_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status_code ON public.api_usage_logs(status_code);

-- ============================================================================
-- FUNCTIONS FOR API MANAGEMENT
-- ============================================================================

-- Function to validate API key
CREATE OR REPLACE FUNCTION public.validate_api_key(
    user_uuid UUID,
    provider_name VARCHAR(50),
    api_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    is_valid BOOLEAN := FALSE;
    provider_pattern TEXT;
BEGIN
    -- Get provider pattern
    SELECT api_key_pattern INTO provider_pattern
    FROM public.api_providers
    WHERE name = provider_name AND is_enabled = true;
    
    IF provider_pattern IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate pattern
    is_valid := api_key ~ provider_pattern;
    
    -- Update validation status
    UPDATE public.api_configurations
    SET 
        is_validated = is_valid,
        last_validated_at = CASE WHEN is_valid THEN timezone('utc'::text, now()) ELSE last_validated_at END,
        validation_error = CASE WHEN is_valid THEN NULL ELSE 'Invalid API key format' END
    WHERE user_id = user_uuid AND provider = provider_name;
    
    RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API usage
CREATE OR REPLACE FUNCTION public.log_api_usage(
    user_uuid UUID,
    provider_name VARCHAR(50),
    endpoint_name TEXT,
    request_size_bytes INTEGER DEFAULT 0,
    response_size_bytes INTEGER DEFAULT 0,
    response_time_milliseconds INTEGER DEFAULT NULL,
    http_status_code INTEGER DEFAULT NULL,
    error_msg TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.api_usage_logs (
        user_id, provider, endpoint, request_size, response_size,
        response_time_ms, status_code, error_message
    ) VALUES (
        user_uuid, provider_name, endpoint_name, request_size_bytes, response_size_bytes,
        response_time_milliseconds, http_status_code, error_msg
    ) RETURNING id INTO log_id;
    
    -- Update usage count
    UPDATE public.api_configurations
    SET 
        usage_count = usage_count + 1,
        last_used_at = timezone('utc'::text, now())
    WHERE user_id = user_uuid AND provider = provider_name;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user API usage statistics
CREATE OR REPLACE FUNCTION public.get_user_api_usage_stats(
    user_uuid UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    provider VARCHAR(50),
    total_requests BIGINT,
    successful_requests BIGINT,
    failed_requests BIGINT,
    total_tokens BIGINT,
    avg_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aul.provider,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE aul.status_code BETWEEN 200 AND 299) as successful_requests,
        COUNT(*) FILTER (WHERE aul.status_code NOT BETWEEN 200 AND 299 OR aul.error_message IS NOT NULL) as failed_requests,
        COALESCE(SUM(aul.request_size + aul.response_size), 0) as total_tokens,
        ROUND(AVG(aul.response_time_ms), 2) as avg_response_time
    FROM public.api_usage_logs aul
    WHERE aul.user_id = user_uuid 
        AND aul.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY aul.provider
    ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check API rate limits
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
    user_uuid UUID,
    provider_name VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    requests_per_minute INTEGER;
    requests_per_day INTEGER;
    current_minute_requests INTEGER;
    current_day_requests INTEGER;
BEGIN
    -- Get rate limits for provider
    SELECT max_requests_per_minute, max_requests_per_day
    INTO requests_per_minute, requests_per_day
    FROM public.api_providers
    WHERE name = provider_name AND is_enabled = true;
    
    IF requests_per_minute IS NULL OR requests_per_day IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check minute limit
    SELECT COUNT(*) INTO current_minute_requests
    FROM public.api_usage_logs
    WHERE user_id = user_uuid 
        AND provider = provider_name
        AND created_at >= NOW() - INTERVAL '1 minute';
    
    -- Check day limit
    SELECT COUNT(*) INTO current_day_requests
    FROM public.api_usage_logs
    WHERE user_id = user_uuid 
        AND provider = provider_name
        AND created_at >= NOW() - INTERVAL '1 day';
    
    RETURN current_minute_requests < requests_per_minute AND current_day_requests < requests_per_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

