-- ============================================================================
-- CLEANUP OLD MIGRATION FILES
-- ============================================================================
-- This script helps clean up old migration files after the new structure is in place
-- Run this ONLY after verifying the new schema is working correctly

-- ============================================================================
-- BACKUP OLD MIGRATIONS (Optional)
-- ============================================================================
-- Before running this cleanup, consider backing up old migrations:
-- 
-- CREATE SCHEMA IF NOT EXISTS old_migrations;
-- 
-- -- Move old migration files to backup schema
-- ALTER TABLE IF EXISTS old_migration_table RENAME TO old_migrations.old_migration_table;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the new schema is working:

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles', 'user_preferences', 'api_providers', 
    'api_configurations', 'api_usage_logs', 'prompt_frameworks',
    'prompt_history', 'prompt_templates', 'feedback'
)
ORDER BY table_name;

-- Check if new functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_updated_at_column', 'generate_uuid_v4', 'get_current_user_id',
    'is_user_authenticated', 'validate_api_key_format', 'encrypt_sensitive_data',
    'decrypt_sensitive_data'
)
ORDER BY routine_name;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- Check if indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- CLEANUP INSTRUCTIONS
-- ============================================================================
-- After verifying the new schema is working correctly, you can:

-- 1. Remove old migration files from the filesystem:
--    - 20250101000000_user_preferences.sql
--    - 20250101000001_add_vibe_coding.sql
--    - 20250101000002_prompt_history.sql
--    - 20250101000003_feedback.sql
--    - 20250824183127_48de65ef-9a3e-4c38-a787-2f3f28513ca2.sql
--    - 20250824183209_6d95b285-c869-4f84-b4bb-bb9ec22e0517.sql
--    - 20250824183243_01c5ac2b-0a58-47a7-9fba-90a7a732edd5.sql
--    - 20250824183244_api_configurations.sql
--    - database-setup-simple.sql
--    - fix-table-structure.sql

-- 2. Update your application code to use the new table structure

-- 3. Test all functionality thoroughly

-- 4. Update documentation

-- ============================================================================
-- MIGRATION STATUS CHECK
-- ============================================================================

-- Check migration status
SELECT 
    'Schema Status' as check_type,
    CASE 
        WHEN COUNT(*) = 9 THEN 'PASS - All new tables exist'
        ELSE 'FAIL - Missing tables: ' || (9 - COUNT(*))::text
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles', 'user_preferences', 'api_providers', 
    'api_configurations', 'api_usage_logs', 'prompt_frameworks',
    'prompt_history', 'prompt_templates', 'feedback'
)

UNION ALL

SELECT 
    'Functions Status' as check_type,
    CASE 
        WHEN COUNT(*) >= 7 THEN 'PASS - Core functions exist'
        ELSE 'FAIL - Missing functions: ' || (7 - COUNT(*))::text
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_updated_at_column', 'generate_uuid_v4', 'get_current_user_id',
    'is_user_authenticated', 'validate_api_key_format', 'encrypt_sensitive_data',
    'decrypt_sensitive_data'
)

UNION ALL

SELECT 
    'RLS Status' as check_type,
    CASE 
        WHEN COUNT(*) >= 8 THEN 'PASS - RLS enabled on tables'
        ELSE 'FAIL - RLS not enabled on all tables: ' || (8 - COUNT(*))::text
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename IN (
    'user_profiles', 'user_preferences', 'api_providers', 
    'api_configurations', 'api_usage_logs', 'prompt_frameworks',
    'prompt_history', 'prompt_templates', 'feedback'
)

UNION ALL

SELECT 
    'Indexes Status' as check_type,
    CASE 
        WHEN COUNT(*) >= 20 THEN 'PASS - Indexes created'
        ELSE 'FAIL - Missing indexes: ' || (20 - COUNT(*))::text
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Test basic functionality
DO $$
BEGIN
    -- Test function calls
    PERFORM public.generate_uuid_v4();
    PERFORM public.is_user_authenticated();
    PERFORM public.validate_api_key_format('openai', 'sk-test123456789012345678901234567890');
    
    RAISE NOTICE 'All basic functions are working correctly';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing functions: %', SQLERRM;
END $$;

-- Check seed data
SELECT 
    'Seed Data Status' as check_type,
    CASE 
        WHEN COUNT(*) >= 3 THEN 'PASS - API providers seeded'
        ELSE 'FAIL - Missing API providers: ' || (3 - COUNT(*))::text
    END as status
FROM public.api_providers

UNION ALL

SELECT 
    'Seed Data Status' as check_type,
    CASE 
        WHEN COUNT(*) >= 9 THEN 'PASS - Frameworks seeded'
        ELSE 'FAIL - Missing frameworks: ' || (9 - COUNT(*))::text
    END as status
FROM public.prompt_frameworks;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database restructuring completed successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your application code to use new table structure';
    RAISE NOTICE '2. Test all functionality thoroughly';
    RAISE NOTICE '3. Remove old migration files from filesystem';
    RAISE NOTICE '4. Update documentation';
    RAISE NOTICE '========================================';
END $$;

