# Supabase Setup Checklist

## ✅ What You Already Have

### Profiles Table Policies
- ✅ Users can view their own profile (SELECT)
- ✅ Users can create their own profile (INSERT)
- ✅ Users can update their own profile (UPDATE)
- ❌ **MISSING:** Users can delete their own profile (DELETE) ← **ADD THIS**

---

## 🔴 What You Need to Add

### 1. Profiles Table - DELETE Policy (REQUIRED)

**Action:** Go to Supabase Dashboard → Authentication → Policies → profiles table → Create policy

**SQL:**
```sql
CREATE POLICY "Users can delete their own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);
```

---

### 2. Storage Policies for `avatars` Bucket (REQUIRED)

**Action:** Go to Storage → avatars → Policies tab → Create 4 policies

**Policy 1 - SELECT:**
```sql
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Policy 2 - INSERT:**
```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Policy 3 - UPDATE:**
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Policy 4 - DELETE:**
```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Note:** If your avatars are stored directly in bucket root (not in user folders), use this instead:
```sql
CREATE POLICY "Users can manage their own avatars"
ON storage.objects
FOR ALL
USING (bucket_id = 'avatars' AND (name LIKE auth.uid()::text || '-%'));
```

---

### 3. RLS Policies for `generated_assets` Table (REQUIRED)

**Action:** Go to Table Editor → generated_assets → Enable RLS → Create policies

**Enable RLS:**
```sql
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;
```

**Policy 1 - SELECT:**
```sql
CREATE POLICY "Users can view their own generated assets"
ON generated_assets
FOR SELECT
USING (auth.uid() = user_id);
```

**Policy 2 - DELETE:**
```sql
CREATE POLICY "Users can delete their own generated assets"
ON generated_assets
FOR DELETE
USING (auth.uid() = user_id);
```

---

### 4. RLS Policies for `asset_collection` Table (REQUIRED)

**Action:** Go to Table Editor → asset_collection → Enable RLS → Create policies

**Enable RLS:**
```sql
ALTER TABLE asset_collection ENABLE ROW LEVEL SECURITY;
```

**Policy 1 - SELECT:**
```sql
CREATE POLICY "Users can view their own collection assets"
ON asset_collection
FOR SELECT
USING (auth.uid() = user_id);
```

**Policy 2 - DELETE:**
```sql
CREATE POLICY "Users can delete their own collection assets"
ON asset_collection
FOR DELETE
USING (auth.uid() = user_id);
```

---

### 5. Storage Policies for `generated_assets` Bucket (REQUIRED)

**Action:** Go to Storage → generated_assets → Policies tab → Create 2 policies

**Policy 1 - SELECT:**
```sql
CREATE POLICY "Users can view their own generated assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generated_assets' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Policy 2 - DELETE:**
```sql
CREATE POLICY "Users can delete their own generated assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'generated_assets' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

### 6. Storage Policies for `Asset_Collection` Bucket (REQUIRED)

**Action:** Go to Storage → Asset_Collection → Policies tab → Create 2 policies

**Policy 1 - SELECT:**
```sql
CREATE POLICY "Users can view their own collection assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'Asset_Collection' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Policy 2 - DELETE:**
```sql
CREATE POLICY "Users can delete their own collection assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'Asset_Collection' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

### 7. Add `country` Column to Profiles Table (REQUIRED)

**Action:** Go to SQL Editor → Run this:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
```

---

### 8. Create Database Function for Account Deletion (REQUIRED)

**Action:** Go to SQL Editor → Run this:

```sql
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

---

### 9. Optional: Storage Policies for Other Buckets

If you want users to delete their own files from these buckets:

**style_scene_collections:**
```sql
CREATE POLICY "Users can delete their own style scene files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'style_scene_collections' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**catalog_forged_outputs:**
```sql
CREATE POLICY "Users can delete their own catalog files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'catalog_forged_outputs' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 🎯 Quick Test

After completing all steps:

1. **Test Profile Update:**
   - Login → Go to Profile page
   - Update first name, last name, gender, country
   - Upload/change avatar
   - Click "Save Changes"
   - ✅ Should save successfully

2. **Test Account Deletion:**
   - Create a test account
   - Add some assets
   - Go to Profile → Delete account
   - ✅ All data should be deleted

---

## 📝 Notes

- Make sure RLS is enabled on all tables (profiles, generated_assets, asset_collection)
- Storage policies are separate from table policies
- The database function is optional but recommended for cleaner deletion
- If policies fail, check that `auth.uid()` matches your user ID format


