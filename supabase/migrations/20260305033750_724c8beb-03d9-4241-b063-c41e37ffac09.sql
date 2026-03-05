ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS ad_format text NOT NULL DEFAULT 'horizontal';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'banner_top';

COMMENT ON COLUMN public.ads.ad_format IS 'horizontal, square, or vertical';
COMMENT ON COLUMN public.ads.placement IS 'banner_top, middle, sidebar, tools, footer';