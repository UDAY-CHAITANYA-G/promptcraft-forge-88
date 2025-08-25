-- Create prompt_history table to store user inputs and AI responses
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own history
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own history
CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own history
CREATE POLICY "Users can delete own prompt history" ON public.prompt_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to update their own history
CREATE POLICY "Users can update own prompt history" ON public.prompt_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_framework_id ON public.prompt_history(framework_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_model ON public.prompt_history(model);

-- Create function to automatically delete old records (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_prompt_history()
RETURNS void AS $$
BEGIN
    DELETE FROM public.prompt_history 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a simple trigger that runs cleanup on insert (every 50th insert)
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

CREATE TRIGGER cleanup_prompt_history_trigger
    AFTER INSERT ON public.prompt_history
    FOR EACH ROW EXECUTE FUNCTION trigger_cleanup_old_prompt_history();
