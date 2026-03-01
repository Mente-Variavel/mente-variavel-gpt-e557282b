
ALTER TABLE public.ads 
  ADD COLUMN plan_name TEXT,
  ADD COLUMN plan_start DATE,
  ADD COLUMN plan_end DATE,
  ADD COLUMN plan_value NUMERIC(10,2),
  ADD COLUMN client_name TEXT;
