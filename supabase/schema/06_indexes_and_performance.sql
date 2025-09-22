-- ============================================================================
-- INDEXES AND PERFORMANCE OPTIMIZATION
-- ============================================================================
-- This file contains all database indexes and performance optimizations

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- User-related composite indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_created 
ON public.user_profiles(is_active, created_at) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_preferences_model_framework 
ON public.user_preferences(selected_model, selected_framework);

-- API-related composite indexes
CREATE INDEX IF NOT EXISTS idx_api_configurations_user_active 
ON public.api_configurations(user_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_provider_date 
ON public.api_usage_logs(user_id, provider, created_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_provider_status_date 
ON public.api_usage_logs(provider, status_code, created_at);

-- Prompt-related composite indexes
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_framework_date 
ON public.prompt_history(user_id, framework_id, created_at);

CREATE INDEX IF NOT EXISTS idx_prompt_history_user_model_date 
ON public.prompt_history(user_id, model, created_at);

CREATE INDEX IF NOT EXISTS idx_prompt_history_user_status_date 
ON public.prompt_history(user_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_prompt_history_framework_model_date 
ON public.prompt_history(framework_id, model, created_at);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_framework_active 
ON public.prompt_templates(user_id, framework_id, is_active) 
WHERE is_active = true;

-- Feedback-related composite indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_type_date 
ON public.feedback(user_id, feedback_type, created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_status_priority_date 
ON public.feedback(status, priority, created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_type_status_date 
ON public.feedback(feedback_type, status, created_at);

-- ============================================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- ============================================================================

-- Active records only
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_only 
ON public.user_profiles(created_at) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_configurations_active_only 
ON public.api_configurations(user_id, provider) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_public_active 
ON public.prompt_templates(framework_id, usage_count) 
WHERE is_public = true AND is_active = true;

-- Recent records only (last 30 days)
CREATE INDEX IF NOT EXISTS idx_prompt_history_recent 
ON public.prompt_history(user_id, created_at) 
WHERE created_at >= NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_recent 
ON public.api_usage_logs(user_id, provider, created_at) 
WHERE created_at >= NOW() - INTERVAL '30 days';

CREATE INDEX IF NOT EXISTS idx_feedback_recent 
ON public.feedback(user_id, created_at) 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Successful operations only
CREATE INDEX IF NOT EXISTS idx_prompt_history_successful 
ON public.prompt_history(user_id, framework_id, created_at) 
WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_successful 
ON public.api_usage_logs(user_id, provider, created_at) 
WHERE status_code BETWEEN 200 AND 299;

-- ============================================================================
-- TEXT SEARCH INDEXES
-- ============================================================================

-- Full-text search indexes for searchable content
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_input_fts 
ON public.prompt_history USING gin(to_tsvector('english', user_input));

CREATE INDEX IF NOT EXISTS idx_prompt_history_ai_response_fts 
ON public.prompt_history USING gin(to_tsvector('english', ai_response));

CREATE INDEX IF NOT EXISTS idx_feedback_message_fts 
ON public.feedback USING gin(to_tsvector('english', message));

CREATE INDEX IF NOT EXISTS idx_prompt_templates_content_fts 
ON public.prompt_templates USING gin(to_tsvector('english', template_content));

-- ============================================================================
-- UNIQUE INDEXES FOR DATA INTEGRITY
-- ============================================================================

-- Ensure unique constraints are properly indexed
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id_unique 
ON public.user_profiles(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id_unique 
ON public.user_preferences(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_configurations_user_provider_unique 
ON public.api_configurations(user_id, provider);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_providers_name_unique 
ON public.api_providers(name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_frameworks_name_unique 
ON public.prompt_frameworks(name);

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View for monitoring slow queries
CREATE OR REPLACE VIEW public.slow_query_monitor AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- View for table sizes
CREATE OR REPLACE VIEW public.table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View for index usage statistics
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to analyze all tables
CREATE OR REPLACE FUNCTION public.analyze_all_tables()
RETURNS VOID AS $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE public.' || table_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to vacuum all tables
CREATE OR REPLACE FUNCTION public.vacuum_all_tables()
RETURNS VOID AS $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'VACUUM ANALYZE public.' || table_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        COALESCE(s.n_tup_ins - s.n_tup_del, 0) as row_count,
        pg_size_pretty(pg_relation_size('public.'||t.tablename)) as table_size,
        pg_size_pretty(pg_indexes_size('public.'||t.tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size('public.'||t.tablename)) as total_size
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size('public.'||t.tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTOMATED MAINTENANCE
-- ============================================================================

-- Function to run daily maintenance
CREATE OR REPLACE FUNCTION public.daily_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Analyze tables for better query planning
    PERFORM public.analyze_all_tables();
    
    -- Clean up old records
    PERFORM public.cleanup_old_records('public.api_usage_logs', 90);
    PERFORM public.cleanup_old_records('public.user_sessions', 30);
    
    -- Generate analytics
    PERFORM public.generate_daily_feedback_analytics();
    
    -- Log maintenance completion
    INSERT INTO public.feedback_analytics (date, feedback_type, total_feedback, resolved_feedback)
    VALUES (CURRENT_DATE, 'system', 1, 1)
    ON CONFLICT (date, feedback_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- QUERY OPTIMIZATION HINTS
-- ============================================================================

-- Create materialized view for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_activity_summary AS
SELECT 
    u.id as user_id,
    u.email,
    up.display_name,
    up.last_login_at,
    COUNT(DISTINCT ph.id) as total_prompts,
    COUNT(DISTINCT f.id) as total_feedback,
    MAX(ph.created_at) as last_prompt_at,
    MAX(f.created_at) as last_feedback_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.prompt_history ph ON u.id = ph.user_id
LEFT JOIN public.feedback f ON u.id = f.user_id
GROUP BY u.id, u.email, up.display_name, up.last_login_at;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_summary_user_id 
ON public.user_activity_summary(user_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_user_activity_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_activity_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

