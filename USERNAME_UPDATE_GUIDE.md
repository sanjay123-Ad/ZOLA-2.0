# Username Update Setup Guide

This guide explains how to set up username editing in your Supabase database.

## Overview

Users can now edit their username in the Profile page. The username will be:
- Saved to Supabase `profiles` table
- Validated for uniqueness (no duplicates)
- Validated for format (3-30 characters, alphanumeric + underscores only)

## Step 1: Run SQL Script in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `supabase_username_setup.sql` from this project
4. Copy and paste the entire SQL script
5. Click **Run** to execute

This will:
- Ensure `username` column exists in `profiles` table
- Add unique constraint (prevents duplicate usernames)
- Add format validation (3-30 chars, alphanumeric + underscores)
- Create index for faster username lookups
- Verify RLS policies allow users to update their own username

## Step 2: Verify Setup

Run this query to verify the username column:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'username';
```

You should see:
- `column_name`: username
- `data_type`: text
- `is_nullable`: YES (or NO, depending on your setup)

## Step 3: Test Username Update

1. Go to Profile page in your app
2. Click "Edit"
3. Change the username field
4. Click "Save Changes"
5. The username should be saved to Supabase

## Code Changes Made

### ProfilePage.tsx
1. **Username field is now editable** when in edit mode
2. **Added validation**:
   - Minimum 3 characters
   - Maximum 30 characters
   - Only letters, numbers, and underscores allowed
3. **Added to change detection** - username changes are now tracked
4. **Username is saved** in the `handleSaveChanges` function (already was saving, now it's editable)

## Validation Rules

- **Length**: 3-30 characters
- **Format**: Only `a-z`, `A-Z`, `0-9`, and `_` (underscore)
- **Uniqueness**: Must be unique across all users
- **Required**: Username is required (marked with *)

## Error Handling

If a username update fails:
- **Duplicate username**: "This username is already taken. Please choose another."
- **Invalid format**: Browser validation will show the pattern error
- **Too short/long**: Browser validation will show min/max length error

## Database Constraints

The SQL script adds:
1. **Unique constraint**: Prevents duplicate usernames
2. **Format check**: Ensures username matches pattern `^[a-zA-Z0-9_]+$`
3. **Length check**: Ensures username is between 3-30 characters

## RLS Policies

The existing "Users can update their own profile" policy already covers username updates. Users can only:
- Update their own username
- Not update other users' usernames

## Troubleshooting

### Username update fails with "duplicate key" error
- The username is already taken by another user
- User needs to choose a different username

### Username update fails with "check constraint" error
- Username doesn't match the format requirements
- Make sure it's 3-30 characters and only contains letters, numbers, and underscores

### Username field is still disabled
- Make sure you're in edit mode (click "Edit" button)
- Check that the code changes were applied correctly

## Notes

- Username changes are immediate and permanent
- The username is used throughout the app for display purposes
- Consider adding a "username change history" if you need to track changes
- Username validation happens both client-side (browser) and server-side (database)

