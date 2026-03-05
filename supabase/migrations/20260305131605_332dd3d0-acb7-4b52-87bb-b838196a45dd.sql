
-- Table to track project image unlocks (payment status)
CREATE TABLE public.project_image_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id text,
  images_generated integer NOT NULL DEFAULT 0,
  max_images integer NOT NULL DEFAULT 20,
  is_paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_project_unlocks_project ON public.project_image_unlocks(project_id);
CREATE INDEX idx_project_unlocks_session ON public.project_image_unlocks(session_id);

-- RLS
ALTER TABLE public.project_image_unlocks ENABLE ROW LEVEL SECURITY;

-- Service role full access (edge functions)
CREATE POLICY "Service role full access on project_image_unlocks"
  ON public.project_image_unlocks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users can read their own unlocks
CREATE POLICY "Users can read own unlocks"
  ON public.project_image_unlocks FOR SELECT
  USING (
    user_id = auth.uid() OR
    session_id IS NOT NULL
  );
