
-- Table for expense tracker private profiles (nick + PIN)
CREATE TABLE public.expense_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nick text NOT NULL,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(nick)
);

-- Table for expense entries linked to a profile
CREATE TABLE public.expense_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.expense_profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'despesa',
  category text NOT NULL DEFAULT '',
  month text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  value numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.expense_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;

-- Public can insert profiles (create account)
CREATE POLICY "Anyone can create expense profile" ON public.expense_profiles
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public can select profiles (to verify nick+pin)
CREATE POLICY "Anyone can read expense profiles" ON public.expense_profiles
  FOR SELECT TO anon, authenticated USING (true);

-- Public CRUD on entries (app validates via profile_id)
CREATE POLICY "Anyone can insert expense entries" ON public.expense_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read expense entries" ON public.expense_entries
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can update expense entries" ON public.expense_entries
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Anyone can delete expense entries" ON public.expense_entries
  FOR DELETE TO anon, authenticated USING (true);
