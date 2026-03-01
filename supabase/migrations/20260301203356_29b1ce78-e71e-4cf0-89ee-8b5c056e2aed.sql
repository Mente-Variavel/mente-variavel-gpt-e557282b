
-- Tabela para mensagens de contato
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode enviar mensagem (INSERT)
CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Apenas usuários autenticados (admin) podem ler
CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Apenas autenticados podem atualizar (marcar como lido)
CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
