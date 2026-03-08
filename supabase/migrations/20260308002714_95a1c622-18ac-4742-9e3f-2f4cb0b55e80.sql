
-- Chat conversations for logged-in users
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON public.chat_conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_chat_conversations_user ON public.chat_conversations (user_id);

-- Update subtitle_usage to track minutes instead of count
ALTER TABLE public.subtitle_usage ADD COLUMN IF NOT EXISTS minutes_used numeric NOT NULL DEFAULT 0;
