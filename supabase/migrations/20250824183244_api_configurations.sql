-- Create api_configurations table to store user API keys securely
CREATE TABLE IF NOT EXISTS public.api_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own API configurations
CREATE POLICY "Users can view own api configurations" ON public.api_configurations
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own API configurations
CREATE POLICY "Users can insert own api configurations" ON public.api_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own API configurations
CREATE POLICY "Users can update own api configurations" ON public.api_configurations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own API configurations
CREATE POLICY "Users can delete own api configurations" ON public.api_configurations
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_configurations_user_id ON public.api_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_configurations_provider ON public.api_configurations(provider);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_configurations_updated_at 
    BEFORE UPDATE ON public.api_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
