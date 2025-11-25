# Edge Function Setup for Auth User Deletion

This guide will help you set up the Edge Function that deletes users from Supabase Authentication when they delete their account.

## Why This Is Needed

When a user deletes their account, all their data (profiles, assets, collections) gets deleted, but the user still appears in the Supabase Authentication → Users page. This Edge Function uses the Admin API to permanently delete the auth user, removing them from the Users page.

## Quick Setup (Using Supabase CLI)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
supabase link --project-ref wtxwgkiiwibgfnpfkckx
```

(Replace `wtxwgkiiwibgfnpfkckx` with your actual project reference if different)

### Step 4: Deploy the Edge Function

The Edge Function code is already in `supabase/functions/delete-auth-user/index.ts`. Deploy it:

```bash
supabase functions deploy delete-auth-user
```

That's it! The function is now live and will automatically have access to your service role key.

## Alternative: Deploy via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it: `delete-auth-user`
5. Copy the code from `supabase/functions/delete-auth-user/index.ts`
6. Paste it into the editor
7. Click **Deploy**

## How It Works

1. User clicks "Delete my account" in the Profile page
2. Application deletes all user data (profiles, assets, storage files)
3. Application calls the Edge Function: `supabase.functions.invoke('delete-auth-user', { body: { userId: user.id } })`
4. Edge Function verifies the user is authenticated and deleting their own account
5. Edge Function uses Admin API to delete the auth user
6. User is removed from Authentication → Users page

## Security

- The Edge Function verifies that users can only delete their own account
- It requires authentication (Bearer token)
- The service role key is automatically available to Edge Functions (no need to set it manually)

## Testing

After deployment, test by:
1. Creating a test account
2. Going to Profile page
3. Clicking "Delete my account"
4. Confirming deletion
5. Checking Supabase Dashboard → Authentication → Users
6. The user should no longer appear in the list

## Troubleshooting

**Function not found error:**
- Make sure you deployed the function: `supabase functions deploy delete-auth-user`
- Check the function name matches exactly: `delete-auth-user`

**Unauthorized error:**
- Make sure the user is logged in when calling the function
- Check that the Authorization header is being sent

**User not deleted:**
- Check Edge Functions logs in Supabase Dashboard
- Verify the service role key has proper permissions
- Check that the userId in the request matches the authenticated user's ID

