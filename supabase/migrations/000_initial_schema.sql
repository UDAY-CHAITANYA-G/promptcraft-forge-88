-- ============================================================================
-- INITIAL SCHEMA MIGRATION
-- ============================================================================
-- This migration creates the complete database schema for PromptCraft Forge
-- Run this migration to set up the entire database structure

-- ============================================================================
-- CORE FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate UUID v4
CREATE OR REPLACE FUNCTION public.generate_uuid_v4()
RETURNS UUID AS $$
BEGIN
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_user_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate email format
CREATE OR REPLACE FUNCTION public.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate API key format
CREATE OR REPLACE FUNCTION public.validate_api_key_format(
    provider_name TEXT,
    api_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    CASE provider_name
        WHEN 'openai' THEN
            RETURN api_key ~ '^sk-(proj-)?[a-zA-Z0-9_-]{32,}$';
        WHEN 'gemini' THEN
            RETURN api_key ~ '^AIza[a-zA-Z0-9_-]{35}$';
        WHEN 'anthropic' THEN
            RETURN api_key ~ '^sk-ant-[a-zA-Z0-9]{32,}$';
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to encrypt sensitive data (placeholder - use proper encryption in production)
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    -- This is a placeholder implementation
    -- In production, use proper encryption like pgcrypto
    RETURN encode(convert_to(data, 'UTF8'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data (placeholder - use proper decryption in production)
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    -- This is a placeholder implementation
    -- In production, use proper decryption like pgcrypto
    BEGIN
        RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8');
    EXCEPTION
        WHEN OTHERS THEN
            RETURN '';
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_user_profile UNIQUE(user_id),
    CONSTRAINT valid_display_name CHECK (display_name IS NULL OR length(trim(display_name)) >= 2),
    CONSTRAINT valid_avatar_url CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://')
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    selected_model VARCHAR(50) NOT NULL DEFAULT 'openai' 
        CHECK (selected_model IN ('openai', 'gemini', 'anthropic')),
    selected_framework VARCHAR(50) NOT NULL DEFAULT 'roses' 
        CHECK (selected_framework IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    theme VARCHAR(20) DEFAULT 'light' 
        CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'en' 
        CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko')),
    enable_notifications BOOLEAN DEFAULT true,
    enable_analytics BOOLEAN DEFAULT false,
    enable_history BOOLEAN DEFAULT true,
    enable_feedback BOOLEAN DEFAULT true,
    max_history_days INTEGER DEFAULT 30 CHECK (max_history_days > 0 AND max_history_days <= 365),
    auto_cleanup BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- ============================================================================
-- API MANAGEMENT TABLES
-- ============================================================================

-- API providers table
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
    
    CONSTRAINT valid_provider_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_base_url CHECK (base_url ~ '^https?://'),
    CONSTRAINT valid_limits CHECK (max_requests_per_minute > 0 AND max_requests_per_day > 0)
);

-- API configurations table
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
    
    CONSTRAINT unique_user_provider UNIQUE(user_id, provider),
    CONSTRAINT valid_provider CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    CONSTRAINT valid_usage_count CHECK (usage_count >= 0)
);

-- API usage logs table
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
    
    CONSTRAINT valid_provider CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    CONSTRAINT valid_sizes CHECK (request_size >= 0 AND response_size >= 0),
    CONSTRAINT valid_response_time CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
    CONSTRAINT valid_status_code CHECK (status_code IS NULL OR (status_code >= 100 AND status_code < 600))
);

-- ============================================================================
-- PROMPT MANAGEMENT TABLES
-- ============================================================================

-- Prompt frameworks table
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
    
    CONSTRAINT valid_framework_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_components CHECK (jsonb_typeof(components) = 'array'),
    CONSTRAINT valid_examples CHECK (jsonb_typeof(examples) = 'array'),
    CONSTRAINT valid_sort_order CHECK (sort_order >= 0)
);

-- Prompt history table
CREATE TABLE IF NOT EXISTS public.prompt_history (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    framework_id VARCHAR(50) NOT NULL,
    framework_name VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    user_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    tone VARCHAR(50),
    length VARCHAR(50),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    vibe_coding BOOLEAN DEFAULT false,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    status VARCHAR(20) DEFAULT 'completed' 
        CHECK (status IN ('generating', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    error_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT valid_framework CHECK (framework_id IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    CONSTRAINT valid_model CHECK (model IN ('gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gemini-pro', 'gemini-pro-vision', 'claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku')),
    CONSTRAINT valid_provider CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    CONSTRAINT valid_temperature CHECK (temperature >= 0.0 AND temperature <= 2.0),
    CONSTRAINT valid_max_tokens CHECK (max_tokens > 0 AND max_tokens <= 10000),
    CONSTRAINT valid_processing_time CHECK (processing_time_ms IS NULL OR processing_time_ms >= 0),
    CONSTRAINT valid_tokens_used CHECK (tokens_used IS NULL OR tokens_used >= 0),
    CONSTRAINT valid_cost CHECK (cost_usd IS NULL OR cost_usd >= 0)
);

-- Prompt templates table
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
    
    CONSTRAINT valid_framework CHECK (framework_id IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    CONSTRAINT valid_usage_count CHECK (usage_count >= 0),
    CONSTRAINT valid_variables CHECK (jsonb_typeof(variables) = 'array')
);

-- ============================================================================
-- FEEDBACK SYSTEM TABLES
-- ============================================================================

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    feedback_type VARCHAR(50) DEFAULT 'general' 
        CHECK (feedback_type IN ('general', 'bug_report', 'feature_request', 'improvement', 'complaint', 'praise')),
    priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' 
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')),
    contact_email VARCHAR(255),
    contact_name VARCHAR(100),
    user_agent TEXT,
    browser_info JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    admin_response TEXT,
    admin_user_id UUID REFERENCES auth.users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT valid_message_length CHECK (length(trim(message)) >= 10),
    CONSTRAINT valid_contact_email CHECK (contact_email IS NULL OR public.is_valid_email(contact_email))
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id AND public.is_user_authenticated());

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id AND public.is_user_authenticated());

-- API providers policies (read-only for users)
CREATE POLICY "Anyone can view enabled providers" ON public.api_providers
    FOR SELECT USING (is_enabled = true);

-- API configurations policies
CREATE POLICY "Users can view own api configurations" ON public.api_configurations
    FOR SELECT USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can insert own api configurations" ON public.api_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can update own api configurations" ON public.api_configurations
    FOR UPDATE USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can delete own api configurations" ON public.api_configurations
    FOR DELETE USING (auth.uid() = user_id AND public.is_user_authenticated());

-- API usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.api_usage_logs
    FOR SELECT USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "System can insert usage logs" ON public.api_usage_logs
    FOR INSERT WITH CHECK (true);

-- Prompt frameworks policies (read-only for users)
CREATE POLICY "Anyone can view enabled frameworks" ON public.prompt_frameworks
    FOR SELECT USING (is_enabled = true);

-- Prompt history policies
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
    FOR SELECT USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can update own prompt history" ON public.prompt_history
    FOR UPDATE USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can delete own prompt history" ON public.prompt_history
    FOR DELETE USING (auth.uid() = user_id AND public.is_user_authenticated());

-- Prompt templates policies
CREATE POLICY "Users can view own templates" ON public.prompt_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates" ON public.prompt_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.prompt_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.prompt_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT USING ((auth.uid() = user_id AND public.is_user_authenticated()) OR (user_id IS NULL AND public.is_user_authenticated()));

CREATE POLICY "Users can insert own feedback" ON public.feedback
    FOR INSERT WITH CHECK ((auth.uid() = user_id AND public.is_user_authenticated()) OR (user_id IS NULL AND public.is_user_authenticated()));

CREATE POLICY "Users can update own feedback" ON public.feedback
    FOR UPDATE USING (auth.uid() = user_id AND public.is_user_authenticated());

CREATE POLICY "Users can delete own feedback" ON public.feedback
    FOR DELETE USING (auth.uid() = user_id AND public.is_user_authenticated());

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON public.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_selected_model ON public.user_preferences(selected_model);
CREATE INDEX IF NOT EXISTS idx_user_preferences_selected_framework ON public.user_preferences(selected_framework);

-- API providers indexes
CREATE INDEX IF NOT EXISTS idx_api_providers_name ON public.api_providers(name);
CREATE INDEX IF NOT EXISTS idx_api_providers_is_enabled ON public.api_providers(is_enabled);

-- API configurations indexes
CREATE INDEX IF NOT EXISTS idx_api_configurations_user_id ON public.api_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_configurations_provider ON public.api_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_api_configurations_is_active ON public.api_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_api_configurations_is_validated ON public.api_configurations(is_validated);

-- API usage logs indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_provider ON public.api_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status_code ON public.api_usage_logs(status_code);

-- Prompt frameworks indexes
CREATE INDEX IF NOT EXISTS idx_prompt_frameworks_name ON public.prompt_frameworks(name);
CREATE INDEX IF NOT EXISTS idx_prompt_frameworks_is_enabled ON public.prompt_frameworks(is_enabled);
CREATE INDEX IF NOT EXISTS idx_prompt_frameworks_sort_order ON public.prompt_frameworks(sort_order);

-- Prompt history indexes
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_framework_id ON public.prompt_history(framework_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_model ON public.prompt_history(model);
CREATE INDEX IF NOT EXISTS idx_prompt_history_provider ON public.prompt_history(provider);
CREATE INDEX IF NOT EXISTS idx_prompt_history_status ON public.prompt_history(status);

-- Prompt templates indexes
CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON public.prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_framework_id ON public.prompt_templates(framework_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_public ON public.prompt_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_active ON public.prompt_templates(is_active);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_feedback_type ON public.feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON public.feedback(priority);

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Update triggers for all tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_providers_updated_at
    BEFORE UPDATE ON public.api_providers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_configurations_updated_at
    BEFORE UPDATE ON public.api_configurations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_frameworks_updated_at
    BEFORE UPDATE ON public.prompt_frameworks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_history_updated_at
    BEFORE UPDATE ON public.prompt_history
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON public.prompt_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
