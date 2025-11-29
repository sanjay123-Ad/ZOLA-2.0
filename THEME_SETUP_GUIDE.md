# Theme Setup Guide

This guide explains how to set up the theme preference feature in your Supabase database.

## Overview

The theme feature allows users to choose between:
- **Light**: Always use light theme
- **Dark**: Always use dark theme  
- **System**: Match the user's operating system preference

The theme preference is stored in the `profiles` table and persists across sessions.

## Step 1: Run SQL Script in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `supabase_theme_setup.sql` from this project
4. Copy and paste the entire SQL script
5. Click **Run** to execute

This will:
- Add `theme_preference` column to the `profiles` table
- Set default value to 'system' for all existing users
- Ensure proper constraints and policies

## Step 2: Verify RLS Policies

The SQL script includes RLS policies, but verify they exist:

### Policy 1: Users can view their own profile
```sql
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
```

### Policy 2: Users can update their own profile
```sql
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Policy 3: Users can insert their own profile
```sql
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
```

## Step 3: Verify Setup

Run this query to verify the column was added:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'theme_preference';
```

You should see:
- `column_name`: theme_preference
- `data_type`: text
- `column_default`: 'system'
- `is_nullable`: NO

## How It Works

1. **On Login**: The app loads the user's theme preference from Supabase and applies it
2. **Theme Selection**: When a user changes theme in Settings, it's immediately applied and saved to Supabase
3. **Persistence**: The theme preference persists across logout/login sessions
4. **System Theme**: When "System" is selected, the app listens to OS theme changes and updates automatically

## Database Schema

The `theme_preference` column:
- **Type**: TEXT
- **Allowed Values**: 'light', 'dark', 'system'
- **Default**: 'system'
- **Nullable**: NO
- **Constraint**: CHECK constraint ensures only valid values

## Troubleshooting

### Theme not persisting after logout
- Check that RLS policies are correctly set
- Verify the user can UPDATE their own profile
- Check browser console for errors

### Theme not applying on login
- Ensure `theme_preference` column exists in profiles table
- Check that the user's profile has a theme_preference value
- Verify the App.tsx is loading theme on user session

### Dark mode not working
- Ensure Tailwind dark mode is configured (already done in index.html)
- Check that dark mode classes are being applied to the HTML element
- Verify your Tailwind config has `darkMode: 'class'`

## Notes

- The theme is applied immediately when changed (no page reload needed)
- System theme automatically updates when OS theme changes
- All existing users default to 'system' theme
- The theme preference is user-specific and private (RLS ensures this)

