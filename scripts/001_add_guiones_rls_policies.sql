-- Add RLS policies for the guiones table
-- These policies allow users to only access their own guiones

-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.guiones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "guiones_select_own" ON public.guiones;
DROP POLICY IF EXISTS "guiones_insert_own" ON public.guiones;
DROP POLICY IF EXISTS "guiones_update_own" ON public.guiones;
DROP POLICY IF EXISTS "guiones_delete_own" ON public.guiones;

-- Allow users to view their own guiones
CREATE POLICY "guiones_select_own" ON public.guiones
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own guiones
CREATE POLICY "guiones_insert_own" ON public.guiones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own guiones
CREATE POLICY "guiones_update_own" ON public.guiones
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own guiones
CREATE POLICY "guiones_delete_own" ON public.guiones
  FOR DELETE USING (auth.uid() = user_id);
