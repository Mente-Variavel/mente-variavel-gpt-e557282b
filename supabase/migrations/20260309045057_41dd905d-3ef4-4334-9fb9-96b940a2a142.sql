-- Allow IP-based conversations for non-logged users
ALTER TABLE public.chat_conversations ALTER COLUMN user_id DROP NOT NULL;

-- Add ip_address column
ALTER TABLE public.chat_conversations ADD COLUMN ip_address TEXT;

-- Create index for IP lookups
CREATE INDEX idx_chat_conversations_ip ON public.chat_conversations (ip_address) WHERE ip_address IS NOT NULL;

-- RLS policy for service role to manage IP-based conversations
CREATE POLICY "Service role can manage IP conversations"
ON public.chat_conversations
FOR ALL
USING (true)
WITH CHECK (true);