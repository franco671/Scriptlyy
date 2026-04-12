-- Add credits column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS creditos integer DEFAULT 5;

-- Update trigger to give 5 credits to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, es_premium, creditos)
  VALUES (new.id, false, 5)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Give existing users 5 credits if they have none
UPDATE public.profiles 
SET creditos = 5 
WHERE creditos IS NULL;
