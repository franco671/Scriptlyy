-- Add RLS policies for guiones table
-- The table already exists with RLS enabled but no policies

-- Allow users to select their own guiones
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
