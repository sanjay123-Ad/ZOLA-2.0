# Step-by-Step Supabase Theme Setup Guide

Follow these exact steps to set up the theme preference feature in your Supabase database.

## Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (the one you're using for this application)

## Step 2: Navigate to SQL Editor

1. In the left sidebar, click on **"SQL Editor"** (it has a database icon)
2. You'll see a list of saved queries or an empty editor

## Step 3: Create New Query

1. Click the **"New query"** button (usually at the top right)
2. A new SQL editor window will open

## Step 4: Copy the SQL Script

1. Open the file `supabase_theme_setup.sql` from your project
2. **Select ALL** the content (Ctrl+A or Cmd+A)
3. **Copy** it (Ctrl+C or Cmd+C)

## Step 5: Paste and Run the SQL

1. **Paste** the SQL script into the Supabase SQL Editor (Ctrl+V or Cmd+V)
2. Review the script - it should contain:
   - ALTER TABLE statement to add `theme_preference` column
   - UPDATE statement to set default values
   - CREATE POLICY statements for RLS
3. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
4. Wait for the execution to complete (usually takes 1-2 seconds)

## Step 6: Verify the Column Was Added

1. In the left sidebar, click on **"Table Editor"**
2. Find and click on the **"profiles"** table
3. Look for a column named **"theme_preference"**
4. It should show:
   - **Type**: text
   - **Default**: system
   - **Nullable**: No

## Step 7: Verify RLS Policies

1. In the left sidebar, click on **"Authentication"**
2. Click on **"Policies"** tab
3. In the dropdown, select **"profiles"** table
4. You should see these policies (they may already exist):
   - ✅ "Users can view their own profile" (SELECT)
   - ✅ "Users can update their own profile" (UPDATE)
   - ✅ "Users can insert their own profile" (INSERT)

**Note:** If these policies already exist from your previous setup, that's fine! The SQL script uses `IF NOT EXISTS` so it won't create duplicates.

## Step 8: Test with a Query (Optional)

1. Go back to **SQL Editor**
2. Run this test query to see existing theme preferences:

```sql
SELECT id, username, theme_preference 
FROM profiles 
LIMIT 5;
```

3. You should see all users have `theme_preference = 'system'` by default

## Step 9: Verify Everything Works

1. Go back to your application
2. Log in (or refresh if already logged in)
3. Click on **Settings** in the sidebar
4. You should see the Theme selector with three options
5. Try changing the theme - it should save and persist

## Troubleshooting

### If you get an error "column already exists"
- This means the column was already added
- You can skip the ALTER TABLE part, or just run the UPDATE and policy parts

### If you get an error about policies
- Check if the policies already exist
- If they do, you can skip those CREATE POLICY statements
- The important part is the ALTER TABLE to add the column

### If theme doesn't persist after logout
- Check that the UPDATE policy exists for profiles table
- Verify the user can update their own profile
- Check browser console for any errors

## What the SQL Script Does

1. **Adds `theme_preference` column** to profiles table
   - Type: TEXT
   - Default: 'system'
   - Constraint: Only allows 'light', 'dark', or 'system'

2. **Updates existing users** to have 'system' as default theme

3. **Ensures column is NOT NULL** so every user has a theme preference

4. **Creates/verifies RLS policies** so users can:
   - Read their own theme preference
   - Update their own theme preference

## That's It! 🎉

Once you've completed these steps, the theme feature will be fully functional. Users can now:
- Select their preferred theme in Settings
- Have their theme persist across sessions
- Use system theme to match their OS preference

