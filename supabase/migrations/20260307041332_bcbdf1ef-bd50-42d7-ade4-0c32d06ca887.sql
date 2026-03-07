
CREATE TABLE public.visit_counter (
  id integer PRIMARY KEY DEFAULT 1,
  total_visits bigint NOT NULL DEFAULT 0
);

INSERT INTO public.visit_counter (id, total_visits) VALUES (1, 0);

ALTER TABLE public.visit_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visit counter"
  ON public.visit_counter FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total bigint;
BEGIN
  UPDATE public.visit_counter SET total_visits = total_visits + 1 WHERE id = 1
  RETURNING total_visits INTO new_total;
  RETURN new_total;
END;
$$;
