-- Simple Database Setup for Prompt History
-- Run this in your Supabase SQL Editor

-- Step 1: Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.prompt_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    framework_id VARCHAR(50) NOT NULL,
    framework_name VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    user_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    tone VARCHAR(50),
    length VARCHAR(50),
    vibe_coding BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can insert own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can update own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can delete own prompt history" ON public.prompt_history;

-- Step 4: Create all necessary policies
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt history" ON public.prompt_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt history" ON public.prompt_history
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_framework_id ON public.prompt_history(framework_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_model ON public.prompt_history(model);

-- Step 6: Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_prompt_history()
RETURNS void AS $$
BEGIN
    DELETE FROM public.prompt_history 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for cleanup
CREATE OR REPLACE FUNCTION trigger_cleanup_old_prompt_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run cleanup occasionally to avoid performance issues
    IF (NEW.id::text)::bigint % 50 = 0 THEN
        PERFORM cleanup_old_prompt_history();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create the trigger
DROP TRIGGER IF EXISTS cleanup_prompt_history_trigger ON public.prompt_history;
CREATE TRIGGER cleanup_prompt_history_trigger
    AFTER INSERT ON public.prompt_history
    FOR EACH ROW EXECUTE FUNCTION trigger_cleanup_old_prompt_history();

-- Step 9: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'prompt_history' 
ORDER BY ordinal_position;

-- Step 10: Test insert (this will be rolled back automatically)
-- INSERT INTO public.prompt_history (user_id, framework_id, framework_name, model, user_input, ai_response, tone, length, vibe_coding, status)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000', -- dummy UUID
--     'test-framework',
--     'Test Framework',
--     'test-model',
--     'Test input',
--     'Test response',
--     'professional',
--     'medium',
--     false,
--     'completed'
-- );
