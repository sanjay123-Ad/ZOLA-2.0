-- Create a function to check if an email exists in auth.users
-- This function will be called from the client to check email existence

CREATE OR REPLACE FUNCTION public.email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if email exists in auth.users table
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;

-- Grant execute permission to anon role so client can call it
GRANT EXECUTE ON FUNCTION public.email_exists(TEXT) TO anon;

-- Grant execute permission to authenticated role as well
GRANT EXECUTE ON FUNCTION public.email_exists(TEXT) TO authenticated;


