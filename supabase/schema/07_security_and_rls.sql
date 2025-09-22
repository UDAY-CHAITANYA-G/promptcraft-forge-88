-- ============================================================================
-- SECURITY AND ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This file contains comprehensive security configurations and RLS policies

-- ============================================================================
-- SECURITY CONFIGURATIONS
-- ============================================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADVANCED RLS POLICIES
-- ============================================================================

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Enhanced user profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Prevent duplicate profiles
        NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    ) WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

-- Enhanced user preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate preferences
        selected_model IN ('openai', 'gemini', 'anthropic') AND
        selected_framework IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace') AND
        -- Prevent duplicate preferences
        NOT EXISTS (SELECT 1 FROM public.user_preferences WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    ) WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate preferences
        selected_model IN ('openai', 'gemini', 'anthropic') AND
        selected_framework IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')
    );

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

-- Enhanced API configurations policies
DROP POLICY IF EXISTS "Users can view own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can insert own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can update own api configurations" ON public.api_configurations;
DROP POLICY IF EXISTS "Users can delete own api configurations" ON public.api_configurations;

CREATE POLICY "Users can view own api configurations" ON public.api_configurations
    FOR SELECT USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

CREATE POLICY "Users can insert own api configurations" ON public.api_configurations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate provider
        provider IN ('openai', 'gemini', 'anthropic') AND
        -- Validate API key format
        public.validate_api_key_format(provider, public.decrypt_sensitive_data(api_key_encrypted))
    );

CREATE POLICY "Users can update own api configurations" ON public.api_configurations
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    ) WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate provider
        provider IN ('openai', 'gemini', 'anthropic') AND
        -- Validate API key format if being updated
        (api_key_encrypted = OLD.api_key_encrypted OR 
         public.validate_api_key_format(provider, public.decrypt_sensitive_data(api_key_encrypted)))
    );

CREATE POLICY "Users can delete own api configurations" ON public.api_configurations
    FOR DELETE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

-- Enhanced prompt history policies
DROP POLICY IF EXISTS "Users can view own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can insert own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can update own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can delete own prompt history" ON public.prompt_history;

CREATE POLICY "Users can view own prompt history" ON public.prompt_history
    FOR SELECT USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate framework
        framework_id IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace') AND
        -- Validate model
        model IN ('gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gemini-pro', 'gemini-pro-vision', 'claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku') AND
        -- Validate provider
        provider IN ('openai', 'gemini', 'anthropic') AND
        -- Validate status
        status IN ('generating', 'completed', 'failed', 'cancelled')
    );

CREATE POLICY "Users can update own prompt history" ON public.prompt_history
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    ) WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate status
        status IN ('generating', 'completed', 'failed', 'cancelled')
    );

CREATE POLICY "Users can delete own prompt history" ON public.prompt_history
    FOR DELETE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

-- Enhanced feedback policies
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON public.feedback;

CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT USING (
        (auth.uid() = user_id AND public.is_user_authenticated()) OR
        (user_id IS NULL AND public.is_user_authenticated())
    );

CREATE POLICY "Users can insert own feedback" ON public.feedback
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id AND public.is_user_authenticated()) OR
        (user_id IS NULL AND public.is_user_authenticated()) AND
        -- Validate feedback type
        feedback_type IN ('general', 'bug_report', 'feature_request', 'improvement', 'complaint', 'praise') AND
        -- Validate priority
        priority IN ('low', 'medium', 'high', 'urgent') AND
        -- Validate status
        status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate') AND
        -- Validate message length
        length(trim(message)) >= 10
    );

CREATE POLICY "Users can update own feedback" ON public.feedback
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    ) WITH CHECK (
        auth.uid() = user_id AND 
        public.is_user_authenticated() AND
        -- Validate feedback type
        feedback_type IN ('general', 'bug_report', 'feature_request', 'improvement', 'complaint', 'praise') AND
        -- Validate priority
        priority IN ('low', 'medium', 'high', 'urgent') AND
        -- Validate status
        status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')
    );

CREATE POLICY "Users can delete own feedback" ON public.feedback
    FOR DELETE USING (
        auth.uid() = user_id AND 
        public.is_user_authenticated()
    );

-- ============================================================================
-- ADMIN POLICIES
-- ============================================================================

-- Create admin role and policies
CREATE ROLE IF NOT EXISTS app_admin;
GRANT USAGE ON SCHEMA public TO app_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO app_admin;

-- Admin policies for system management
CREATE POLICY "Admins can manage all data" ON public.feedback_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view all feedback" ON public.feedback
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update feedback status" ON public.feedback
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access resource
CREATE OR REPLACE FUNCTION public.can_access_resource(
    resource_user_id UUID,
    required_permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin can access everything
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- User can access their own resources
    IF auth.uid() = resource_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Public resources (where user_id is NULL)
    IF resource_user_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to audit data access
CREATE OR REPLACE FUNCTION public.audit_data_access(
    table_name TEXT,
    operation TEXT,
    record_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Log data access for security monitoring
    INSERT INTO public.feedback (
        user_id,
        message,
        feedback_type,
        priority
    ) VALUES (
        auth.uid(),
        format('Data access: %s.%s on record %s', table_name, operation, COALESCE(record_id::TEXT, 'N/A')),
        'system',
        'low'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATA ENCRYPTION AND SECURITY
-- ============================================================================

-- Function to securely hash sensitive data
CREATE OR REPLACE FUNCTION public.secure_hash(data TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Use pgcrypto for secure hashing in production
    -- This is a placeholder implementation
    RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION public.validate_data_integrity()
RETURNS TABLE(
    table_name TEXT,
    integrity_check TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'user_profiles'::TEXT,
        'All users have unique profiles'::TEXT,
        CASE 
            WHEN COUNT(*) = COUNT(DISTINCT user_id) THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END
    FROM public.user_profiles
    
    UNION ALL
    
    SELECT 
        'api_configurations'::TEXT,
        'All API keys are encrypted'::TEXT,
        CASE 
            WHEN COUNT(*) = COUNT(CASE WHEN api_key_encrypted IS NOT NULL AND length(api_key_encrypted) > 0 THEN 1 END) THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END
    FROM public.api_configurations
    
    UNION ALL
    
    SELECT 
        'prompt_history'::TEXT,
        'All prompts have valid frameworks'::TEXT,
        CASE 
            WHEN COUNT(*) = COUNT(CASE WHEN framework_id IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace') THEN 1 END) THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END
    FROM public.prompt_history;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECURITY MONITORING
-- ============================================================================

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TABLE(
    user_id UUID,
    activity_type TEXT,
    severity TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    -- Detect rapid API usage
    SELECT 
        aul.user_id,
        'rapid_api_usage'::TEXT,
        'high'::TEXT,
        jsonb_build_object(
            'requests_per_minute', COUNT(*),
            'timeframe', '1 minute'
        )
    FROM public.api_usage_logs aul
    WHERE aul.created_at >= NOW() - INTERVAL '1 minute'
    GROUP BY aul.user_id
    HAVING COUNT(*) > 10
    
    UNION ALL
    
    -- Detect failed API attempts
    SELECT 
        aul.user_id,
        'failed_api_attempts'::TEXT,
        'medium'::TEXT,
        jsonb_build_object(
            'failed_requests', COUNT(*),
            'timeframe', '1 hour'
        )
    FROM public.api_usage_logs aul
    WHERE aul.created_at >= NOW() - INTERVAL '1 hour'
        AND aul.status_code NOT BETWEEN 200 AND 299
    GROUP BY aul.user_id
    HAVING COUNT(*) > 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

