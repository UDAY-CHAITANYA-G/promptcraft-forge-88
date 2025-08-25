-- Add vibe_coding column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS vibe_coding BOOLEAN DEFAULT false;

-- Update existing rows to have vibe_coding set to false
UPDATE public.user_preferences 
SET vibe_coding = false 
WHERE vibe_coding IS NULL;
