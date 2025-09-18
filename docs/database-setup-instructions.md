# Database Setup Instructions

## Issue Identified
The API key saving is failing because the `api_configurations` table doesn't exist in your Supabase database.

## Solution: Manual Database Setup

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `slvjvjwrkesjfzxcygdp`

### Step 2: Run the Migration SQL
1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the following SQL code:

```sql
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
```

4. Click **"Run"** to execute the SQL

### Step 3: Verify Table Creation
1. Go to **"Table Editor"** in the left sidebar
2. You should see a new table called `api_configurations`
3. Click on it to verify the structure

### Step 4: Test the Application
1. Refresh your application
2. Try to save a Gemini API key again
3. Check the browser console for any remaining errors

## Alternative: Quick Test Table
If you want to test with a minimal setup first, you can create just the basic table:

```sql
-- Minimal test table
CREATE TABLE IF NOT EXISTS public.api_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Basic RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own configs" ON public.api_configurations
    FOR ALL USING (auth.uid() = user_id);
```

## Troubleshooting
- **Error: "relation does not exist"** - The table wasn't created properly
- **Error: "permission denied"** - RLS policies aren't working correctly
- **Error: "foreign key constraint"** - The auth.users reference might be incorrect

## Next Steps
After setting up the table:
1. The application will automatically detect the table exists
2. API key saving should work properly
3. You can remove the database status alert from the UI
4. All API configurations will be stored securely per user

Let me know if you encounter any issues during the setup!
