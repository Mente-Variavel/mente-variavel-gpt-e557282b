-- Add title column to chat_conversations for naming chats
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Nova conversa';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_conversations_ip_user 
ON public.chat_conversations (ip_address, user_id);