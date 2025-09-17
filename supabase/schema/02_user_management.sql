-- ============================================================================
-- USER MANAGEMENT SCHEMA
-- ============================================================================
-- This file contains all user-related tables and configurations

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

-- Create user profiles table to extend auth.users
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
    
    -- Constraints
    CONSTRAINT unique_user_profile UNIQUE(user_id),
    CONSTRAINT valid_display_name CHECK (display_name IS NULL OR length(trim(display_name)) >= 2),
    CONSTRAINT valid_avatar_url CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://')
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON public.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- AI Model Preferences
    selected_model VARCHAR(50) NOT NULL DEFAULT 'openai' 
        CHECK (selected_model IN ('openai', 'gemini', 'anthropic')),
    
    -- Framework Preferences
    selected_framework VARCHAR(50) NOT NULL DEFAULT 'roses' 
        CHECK (selected_framework IN ('roses', 'ape', 'tag', 'era', 'race', 'rise', 'care', 'coast', 'trace')),
    
    -- UI Preferences
    theme VARCHAR(20) DEFAULT 'light' 
        CHECK (theme IN ('light', 'dark', 'system')),
    
    language VARCHAR(10) DEFAULT 'en' 
        CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko')),
    
    -- Feature Preferences
    enable_notifications BOOLEAN DEFAULT true,
    enable_analytics BOOLEAN DEFAULT false,
    enable_history BOOLEAN DEFAULT true,
    enable_feedback BOOLEAN DEFAULT true,
    
    -- Advanced Preferences
    max_history_days INTEGER DEFAULT 30 CHECK (max_history_days > 0 AND max_history_days <= 365),
    auto_cleanup BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_selected_model ON public.user_preferences(selected_model);
CREATE INDEX IF NOT EXISTS idx_user_preferences_selected_framework ON public.user_preferences(selected_framework);

-- Create trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- USER SESSIONS TABLE (Optional - for session tracking)
-- ============================================================================

-- Create user sessions table for tracking user activity
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_session_token UNIQUE(session_token),
    CONSTRAINT valid_expires_at CHECK (expires_at > created_at)
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for user sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR USER MANAGEMENT
-- ============================================================================

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles 
    SET last_login_at = timezone('utc'::text, now())
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE(
    total_prompts BIGINT,
    total_feedback BIGINT,
    favorite_framework VARCHAR(50),
    favorite_model VARCHAR(50),
    account_age_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.prompt_history WHERE user_id = user_uuid) as total_prompts,
        (SELECT COUNT(*) FROM public.feedback WHERE user_id = user_uuid) as total_feedback,
        (SELECT selected_framework FROM public.user_preferences WHERE user_id = user_uuid) as favorite_framework,
        (SELECT selected_model FROM public.user_preferences WHERE user_id = user_uuid) as favorite_model,
        EXTRACT(DAY FROM (now() - (SELECT created_at FROM auth.users WHERE id = user_uuid)))::INTEGER as account_age_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
