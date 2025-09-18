-- ============================================================================
-- CORE DATABASE FUNCTIONS
-- ============================================================================
-- This file contains reusable database functions used across the application
-- Run this first before any table creation

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

-- Function to clean up old records (generic)
CREATE OR REPLACE FUNCTION public.cleanup_old_records(
    table_name TEXT,
    retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    sql_query TEXT;
BEGIN
    sql_query := format('DELETE FROM %I WHERE created_at < NOW() - INTERVAL ''%s days''', 
                       table_name, retention_days);
    EXECUTE sql_query;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION public.get_table_stats(table_name TEXT)
RETURNS TABLE(
    total_rows BIGINT,
    oldest_record TIMESTAMP WITH TIME ZONE,
    newest_record TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    sql_query TEXT;
BEGIN
    sql_query := format('
        SELECT 
            COUNT(*) as total_rows,
            MIN(created_at) as oldest_record,
            MAX(created_at) as newest_record
        FROM %I', table_name);
    
    RETURN QUERY EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

