-- ============================================
-- SUPABASE THEME PREFERENCE SETUP
-- ============================================
-- This SQL script adds theme preference support to your Supabase profiles table
-- Run this in your Supabase SQL Editor
--
-- NOTE: This only adds the theme column. Your existing profile policies
-- already cover theme_preference since it's part of the profiles table.
-- No need to modify policies!

-- Step 1: Add theme_preference column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Step 2: Update existing profiles to have 'system' as default theme
UPDATE public.profiles
SET theme_preference = 'system'
WHERE theme_preference IS NULL;

-- Step 3: Ensure the column is NOT NULL (after setting defaults)
ALTER TABLE public.profiles
ALTER COLUMN theme_preference SET NOT NULL;
