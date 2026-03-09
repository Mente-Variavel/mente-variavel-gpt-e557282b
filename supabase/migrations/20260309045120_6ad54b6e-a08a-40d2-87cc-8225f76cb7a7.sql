-- Remove overly permissive policy (service role bypasses RLS naturally)
DROP POLICY IF EXISTS "Service role can manage IP conversations" ON public.chat_conversations;