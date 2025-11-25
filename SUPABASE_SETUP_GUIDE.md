# Supabase Setup Guide for Profile Updates and Account Deletion

## Overview
This guide will help you set up Supabase policies and functions to:
1. Allow users to update their profile (photo, name, gender, country)
2. Permanently delete all user data when they delete their account

---

## PART 1: Profile Update Policies

### Step 1: Enable Row Level Security (RLS) on `profiles` table

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **profiles** table
3. Click on **Settings** (gear icon)
4. Enable **Row Level Security (RLS)**

### Step 2: Create RLS Policies for `profiles` table

Go to **Authentication** → **Policies** → Select `profiles` table, then create these policies:

#### Policy 1: Users can SELECT their own profile
```sql
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

#### Policy 2: Users can INSERT their own profile
```sql
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
```

#### Policy 3: Users can UPDATE their own profile
```sql
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

#### Policy 4: Users can DELETE their own profile
```sql
CREATE POLICY "Users can delete their own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);
```

### Step 3: Create Storage Policies for `avatars` bucket

1. Go to **Storage** → **avatars** bucket
2. Click **Policies** tab
3. Create these policies:

#### Policy 1: Users can SELECT their own avatar
```sql
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 2: Users can INSERT their own avatar
```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 3: Users can UPDATE their own avatar
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 4: Users can DELETE their own avatar
```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Note:** If your avatars are stored directly in the bucket root (not in user folders), use this instead:
```sql
-- For avatars stored as: {userId}-{timestamp}.{ext}
CREATE POLICY "Users can manage their own avatars"
ON storage.objects
FOR ALL
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '-%');
```

---

## PART 2: Account Deletion Setup

### Step 4: Create RLS Policies for `generated_assets` table

#### Policy 1: Users can SELECT their own assets
```sql
CREATE POLICY "Users can view their own generated assets"
ON generated_assets
FOR SELECT
USING (auth.uid() = user_id);
```

#### Policy 2: Users can DELETE their own assets
```sql
CREATE POLICY "Users can delete their own generated assets"
ON generated_assets
FOR DELETE
USING (auth.uid() = user_id);
```

### Step 5: Create RLS Policies for `asset_collection` table

#### Policy 1: Users can SELECT their own collection assets
```sql
CREATE POLICY "Users can view their own collection assets"
ON asset_collection
FOR SELECT
USING (auth.uid() = user_id);
```

#### Policy 2: Users can DELETE their own collection assets
```sql
CREATE POLICY "Users can delete their own collection assets"
ON asset_collection
FOR DELETE
USING (auth.uid() = user_id);
```

### Step 6: Create Storage Policies for `generated_assets` bucket

#### Policy 1: Users can SELECT their own generated assets
```sql
CREATE POLICY "Users can view their own generated assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generated_assets' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 2: Users can DELETE their own generated assets
```sql
CREATE POLICY "Users can delete their own generated assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'generated_assets' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Step 7: Create Storage Policies for `Asset_Collection` bucket

#### Policy 1: Users can SELECT their own collection assets
```sql
CREATE POLICY "Users can view their own collection assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'Asset_Collection' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 2: Users can DELETE their own collection assets
```sql
CREATE POLICY "Users can delete their own collection assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'Asset_Collection' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## PART 3: Database Function for Complete Account Deletion

### Step 8: Create a Database Function to Delete All User Data

Go to **SQL Editor** in Supabase Dashboard and run this function:

```sql
-- Function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from generated_assets table
  DELETE FROM generated_assets WHERE user_id = user_id_to_delete;
  
  -- Delete from asset_collection table
  DELETE FROM asset_collection WHERE user_id = user_id_to_delete;
  
  -- Delete from profiles table
  DELETE FROM profiles WHERE id = user_id_to_delete;
  
  -- Note: Storage files will be deleted by the application code
  -- The auth user deletion must be done through Supabase Admin API or Dashboard
END;
$$;
```

**Note:** The application code will handle deletion of storage files from:
- `generated_assets` bucket
- `Asset_Collection` bucket
- `style_scene_collections` bucket
- `catalog_forged_outputs` bucket
- `avatars` bucket

### Step 9: Grant Execute Permission

```sql
-- Grant execute permission to authenticated users (they can only delete their own data)
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
```

### Step 10: Create Supabase Edge Function to Delete Auth User

To completely delete the user from Supabase Authentication (so they disappear from the Users page), you need to create a Supabase Edge Function that uses the Admin API.

#### Step 10.1: Install Supabase CLI (if not already installed)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref wtxwgkiiwibgfnpfkckx
   ```
   (Replace `wtxwgkiiwibgfnpfkckx` with your actual project reference if different)

#### Step 10.2: Create the Edge Function

1. Initialize Edge Functions (if not already done):
   ```bash
   supabase functions new delete-auth-user
   ```

2. Navigate to the function directory:
   ```bash
   cd supabase/functions/delete-auth-user
   ```

3. Create/update `index.ts` with this code:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     // Handle CORS preflight requests
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       // Get the authorization header
       const authHeader = req.headers.get('Authorization')
       if (!authHeader) {
         return new Response(
           JSON.stringify({ error: 'Missing authorization header' }),
           { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Create Supabase client with service role key (from environment variable)
       const supabaseAdmin = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
         {
           auth: {
             autoRefreshToken: false,
             persistSession: false
           }
         }
       )

       // Verify the requesting user is authenticated
       const token = authHeader.replace('Bearer ', '')
       const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
       
       if (userError || !user) {
         return new Response(
           JSON.stringify({ error: 'Unauthorized' }),
           { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Get the userId from request body
       const { userId } = await req.json()
       
       if (!userId) {
         return new Response(
           JSON.stringify({ error: 'Missing userId in request body' }),
           { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Verify the user is deleting their own account
       if (user.id !== userId) {
         return new Response(
           JSON.stringify({ error: 'You can only delete your own account' }),
           { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Delete the auth user using Admin API
       const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

       if (deleteError) {
         console.error('Error deleting auth user:', deleteError)
         return new Response(
           JSON.stringify({ error: deleteError.message }),
           { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       return new Response(
         JSON.stringify({ success: true, message: 'Auth user deleted successfully' }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     } catch (error) {
       console.error('Unexpected error:', error)
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   })
   ```

#### Step 10.3: Deploy the Edge Function

1. Deploy the function:
   ```bash
   supabase functions deploy delete-auth-user
   ```

2. The function will automatically have access to these environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (automatically injected)

#### Step 10.4: Alternative - Deploy via Supabase Dashboard

If you prefer using the Dashboard:

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **Create a new function**
3. Name it `delete-auth-user`
4. Paste the TypeScript code from Step 10.2
5. Click **Deploy**

**Important:** The service role key is automatically available to Edge Functions, so you don't need to set it manually.

#### Step 10.5: Test the Edge Function

You can test it using curl or Postman:

```bash
curl -X POST 'https://wtxwgkiiwibgfnpfkckx.supabase.co/functions/v1/delete-auth-user' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "USER_ID_TO_DELETE"}'
```

**Note:** Replace `YOUR_ANON_KEY` with your anon key and `USER_ID_TO_DELETE` with a test user ID.

---

## PART 4: Update Application Code

### Step 11: Update ProfilePage.tsx Delete Account Function

✅ **Already Updated!** The `ProfilePage.tsx` file has been updated with a comprehensive delete account function that:
1. Deletes all generated assets from storage
2. Deletes all collection assets from storage
3. Deletes style scene collections
4. Deletes catalog forged outputs
5. Deletes avatar
6. Calls the database function (or manually deletes records)
7. **Calls the Edge Function to delete the auth user** (NEW!)
8. Signs out the user
9. Navigates to landing page

The code is already in place and ready to use once you complete the Supabase setup steps above, including the Edge Function setup in Step 10.

---

## PART 5: Verify Table Structure

### Step 12: Ensure `profiles` table has these columns

Make sure your `profiles` table has these columns:
- `id` (UUID, primary key, references auth.users)
- `username` (TEXT)
- `first_name` (TEXT, nullable)
- `last_name` (TEXT, nullable)
- `gender` (TEXT, nullable) - should be 'Male' or 'Female'
- `country` (TEXT, nullable)
- `avatar_url` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

If `country` column doesn't exist, add it:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
```

---

## PART 6: Testing

### Step 13: Test Profile Update
1. Login to your app
2. Go to Profile page
3. Update first name, last name, gender, country
4. Upload/change avatar
5. Click "Save Changes"
6. Verify data is saved in Supabase Dashboard

### Step 14: Test Account Deletion
1. Create a test account
2. Add some assets to gallery and collection
3. Upload an avatar
4. Go to Profile page
5. Click "Delete my account"
6. Confirm deletion
7. Verify in Supabase Dashboard:
   - All records deleted from `generated_assets`
   - All records deleted from `asset_collection`
   - Profile deleted from `profiles`
   - All files deleted from storage buckets
   - **User deleted from Authentication → Users page** (if Edge Function is set up)

---

## Important Notes

1. **Auth User Deletion**: Supabase doesn't allow deleting auth users from client-side. The Edge Function (Step 10) uses the Admin API to delete the auth user, which will remove them from the Authentication → Users page. If you don't set up the Edge Function, the user will remain in the Users page but won't be able to login (since their profile and data are deleted).

2. **Storage File Paths**: Make sure your storage file paths match the policy patterns. If files are stored differently, adjust the policies accordingly.

3. **Backup**: Before implementing account deletion, ensure you have backups or understand that this is permanent.

4. **Cascading Deletes**: If you have foreign key constraints, you may need to adjust the deletion order or add CASCADE options.

---

## Quick SQL Script (All-in-One)

Run this in Supabase SQL Editor to set up everything at once:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_collection ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- Generated assets policies
CREATE POLICY "Users can view their own generated assets" ON generated_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own generated assets" ON generated_assets FOR DELETE USING (auth.uid() = user_id);

-- Asset collection policies
CREATE POLICY "Users can view their own collection assets" ON asset_collection FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collection assets" ON asset_collection FOR DELETE USING (auth.uid() = user_id);

-- Add country column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Create delete function
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM generated_assets WHERE user_id = user_id_to_delete;
  DELETE FROM asset_collection WHERE user_id = user_id_to_delete;
  DELETE FROM profiles WHERE id = user_id_to_delete;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
```

Then set up storage policies manually through the Dashboard UI as described in Steps 3, 6, and 7.

