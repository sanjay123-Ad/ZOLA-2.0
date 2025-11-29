-- ============================================
-- SUPABASE USERNAME UPDATE SETUP
-- ============================================
-- This SQL script ensures username can be updated by users
-- Run this in your Supabase SQL Editor

-- Step 1: Ensure username column exists in profiles table
-- (This should already exist, but we're checking)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN username TEXT;
    END IF;
END $$;

-- Step 2: Add constraints for username (optional but recommended)
-- Make username unique (if not already)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Step 3: Add check constraint for username format (optional)
-- Username should be 3-30 characters, alphanumeric and underscores only
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_format_check'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_username_format_check 
        CHECK (
            username IS NULL OR (
                LENGTH(username) >= 3 AND 
                LENGTH(username) <= 30 AND 
                username ~ '^[a-zA-Z0-9_]+$'
            )
        );
    END IF;
END $$;

-- Step 4: Create index for faster username lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) 
WHERE username IS NOT NULL;

-- ============================================
-- RLS POLICIES FOR USERNAME UPDATE
-- ============================================
-- These policies should already exist if you have profile policies,
-- but we're verifying they allow username updates.

-- Policy: Users can update their own profile (including username)
-- This should already exist, but if not, create it:
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup:

-- Check if username column exists and has constraints:
-- SELECT 
--     column_name, 
--     data_type, 
--     is_nullable,
--     character_maximum_length
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'profiles' 
--   AND column_name = 'username';

-- Check unique constraint:
-- SELECT conname, contype 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.profiles'::regclass 
--   AND conname = 'profiles_username_key';

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- ============================================
-- NOTES
-- ============================================
-- 1. Username must be unique across all users
-- 2. Username must be 3-30 characters
-- 3. Username can only contain letters, numbers, and underscores
-- 4. Users can only update their own username
-- 5. If username update fails due to uniqueness constraint, 
--    the application should show an appropriate error message

