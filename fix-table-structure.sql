-- Fix Table Structure Script
-- Run this in your Supabase SQL Editor to fix the prompt_history table

-- Step 1: Check current table status
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'prompt_history' 
ORDER BY ordinal_position;

-- Step 2: Drop the existing table completely
DROP TABLE IF EXISTS public.prompt_history CASCADE;

-- Step 3: Recreate the table with proper structure
CREATE TABLE public.prompt_history (
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

-- Step 4: Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Step 5: Create all necessary policies
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt history" ON public.prompt_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt history" ON public.prompt_history
    FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Create indexes
CREATE INDEX idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX idx_prompt_history_framework_id ON public.prompt_history(framework_id);
CREATE INDEX idx_prompt_history_model ON public.prompt_history(model);

-- Step 7: Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'prompt_history' 
ORDER BY ordinal_position;

-- Step 8: Test insert (this will be rolled back automatically)
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
