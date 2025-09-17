-- ============================================================================
-- PROMPT MANAGEMENT SCHEMA
-- ============================================================================
-- This file contains all prompt-related tables and configurations

-- ============================================================================
-- PROMPT FRAMEWORKS TABLE
-- ============================================================================

-- Create prompt frameworks table to store framework configurations
CREATE TABLE IF NOT EXISTS public.prompt_frameworks (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    components JSONB NOT NULL DEFAULT '[]',
    template TEXT NOT NULL,
    examples JSONB DEFAULT '[]',
    is_enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_framework_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_components CHECK (jsonb_typeof(components) = 'array'),
    CONSTRAINT valid_examples CHECK (jsonb_typeof(examples) = 'array'),
    CONSTRAINT valid_sort_order CHECK (sort_order >= 0)
);

-- Enable RLS
ALTER TABLE public.prompt_frameworks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prompt frameworks (read-only for users)
CREATE POLICY "Anyone can view enabled frameworks" ON public.prompt_frameworks
    FOR SELECT USING (is_enabled = true);

-- Create indexes for prompt frameworks
CREATE INDEX IF NOT EXISTS idx_prompt_frameworks_name ON public.prompt_frameworks(name);
CREATE INDEX IF NOT EXISTS idx_prompt_frameworks_is_enabled ON public.prompt_frameworks(is_enabled);
CREATE INDEX IF NOT EXISTS idx_prompt_frameworks_sort_order ON public.prompt_frameworks(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_prompt_frameworks_updated_at
    BEFORE UPDATE ON public.prompt_frameworks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PROMPT HISTORY TABLE
-- ============================================================================

-- Create prompt history table to store user prompts and AI responses
CREATE TABLE IF NOT EXISTS public.prompt_history (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Framework Information
    framework_id VARCHAR(50) NOT NULL,
    framework_name VARCHAR(100) NOT NULL,
    
    -- Model Information
    model VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    
    -- Prompt Content
    user_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    
    -- Prompt Settings
    tone VARCHAR(50),
    length VARCHAR(50),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    
    -- Metadata
    vibe_coding BOOLEAN DEFAULT false,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' 
        CHECK (status IN ('generating', 'completed', 'failed', 'cancelled')),
    
    -- Error Information
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_framework CHECK (framework_id IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    CONSTRAINT valid_model CHECK (model IN ('gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gemini-pro', 'gemini-pro-vision', 'claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku')),
    CONSTRAINT valid_provider CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    CONSTRAINT valid_temperature CHECK (temperature >= 0.0 AND temperature <= 2.0),
    CONSTRAINT valid_max_tokens CHECK (max_tokens > 0 AND max_tokens <= 10000),
    CONSTRAINT valid_processing_time CHECK (processing_time_ms IS NULL OR processing_time_ms >= 0),
    CONSTRAINT valid_tokens_used CHECK (tokens_used IS NULL OR tokens_used >= 0),
    CONSTRAINT valid_cost CHECK (cost_usd IS NULL OR cost_usd >= 0)
);

-- Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prompt history
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt history" ON public.prompt_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt history" ON public.prompt_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for prompt history
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_framework_id ON public.prompt_history(framework_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_model ON public.prompt_history(model);
CREATE INDEX IF NOT EXISTS idx_prompt_history_provider ON public.prompt_history(provider);
CREATE INDEX IF NOT EXISTS idx_prompt_history_status ON public.prompt_history(status);
CREATE INDEX IF NOT EXISTS idx_prompt_history_tone ON public.prompt_history(tone);
CREATE INDEX IF NOT EXISTS idx_prompt_history_length ON public.prompt_history(length);

-- Create trigger for updated_at
CREATE TRIGGER update_prompt_history_updated_at
    BEFORE UPDATE ON public.prompt_history
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PROMPT TEMPLATES TABLE
-- ============================================================================

-- Create prompt templates table for reusable prompt templates
CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    framework_id VARCHAR(50) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_framework CHECK (framework_id IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    CONSTRAINT valid_usage_count CHECK (usage_count >= 0),
    CONSTRAINT valid_variables CHECK (jsonb_typeof(variables) = 'array')
);

-- Enable RLS
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prompt templates
CREATE POLICY "Users can view own templates" ON public.prompt_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates" ON public.prompt_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.prompt_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.prompt_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for prompt templates
CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON public.prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_framework_id ON public.prompt_templates(framework_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_public ON public.prompt_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_active ON public.prompt_templates(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON public.prompt_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR PROMPT MANAGEMENT
-- ============================================================================

-- Function to get prompt statistics
CREATE OR REPLACE FUNCTION public.get_prompt_stats(
    user_uuid UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_prompts BIGINT,
    successful_prompts BIGINT,
    failed_prompts BIGINT,
    total_tokens BIGINT,
    total_cost_usd DECIMAL(10,6),
    avg_processing_time NUMERIC,
    most_used_framework VARCHAR(50),
    most_used_model VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_prompts,
        COUNT(*) FILTER (WHERE status = 'completed') as successful_prompts,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_prompts,
        COALESCE(SUM(tokens_used), 0) as total_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost_usd,
        ROUND(AVG(processing_time_ms), 2) as avg_processing_time,
        (SELECT framework_id FROM public.prompt_history 
         WHERE user_id = user_uuid AND created_at >= NOW() - INTERVAL '1 day' * days_back
         GROUP BY framework_id ORDER BY COUNT(*) DESC LIMIT 1) as most_used_framework,
        (SELECT model FROM public.prompt_history 
         WHERE user_id = user_uuid AND created_at >= NOW() - INTERVAL '1 day' * days_back
         GROUP BY model ORDER BY COUNT(*) DESC LIMIT 1) as most_used_model
    FROM public.prompt_history
    WHERE user_id = user_uuid 
        AND created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old prompt history
CREATE OR REPLACE FUNCTION public.cleanup_old_prompt_history(
    retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.prompt_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get framework usage statistics
CREATE OR REPLACE FUNCTION public.get_framework_usage_stats(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    framework_id VARCHAR(50),
    framework_name VARCHAR(100),
    usage_count BIGINT,
    success_rate NUMERIC,
    avg_processing_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.framework_id,
        ph.framework_name,
        COUNT(*) as usage_count,
        ROUND(
            (COUNT(*) FILTER (WHERE ph.status = 'completed')::NUMERIC / COUNT(*)) * 100, 
            2
        ) as success_rate,
        ROUND(AVG(ph.processing_time_ms), 2) as avg_processing_time
    FROM public.prompt_history ph
    WHERE ph.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY ph.framework_id, ph.framework_name
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get model performance statistics
CREATE OR REPLACE FUNCTION public.get_model_performance_stats(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    model VARCHAR(50),
    provider VARCHAR(50),
    usage_count BIGINT,
    success_rate NUMERIC,
    avg_processing_time NUMERIC,
    avg_tokens_used NUMERIC,
    total_cost_usd DECIMAL(10,6)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.model,
        ph.provider,
        COUNT(*) as usage_count,
        ROUND(
            (COUNT(*) FILTER (WHERE ph.status = 'completed')::NUMERIC / COUNT(*)) * 100, 
            2
        ) as success_rate,
        ROUND(AVG(ph.processing_time_ms), 2) as avg_processing_time,
        ROUND(AVG(ph.tokens_used), 2) as avg_tokens_used,
        COALESCE(SUM(ph.cost_usd), 0) as total_cost_usd
    FROM public.prompt_history ph
    WHERE ph.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY ph.model, ph.provider
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.prompt_templates
    SET usage_count = usage_count + 1
    WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
