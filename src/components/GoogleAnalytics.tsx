import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GoogleAnalytics = () => {
  const location = useLocation();
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "google_analytics_id")
      .single()
      .then(({ data }) => {
        if (data?.value) setGaId(data.value);
      });
  }, []);

  useEffect(() => {
    if (!gaId) return;

    // Load script if not already present
    if (!document.getElementById("ga-script")) {
      const s = document.createElement("script");
      s.id = "ga-script";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);

      const s2 = document.createElement("script");
      s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
      document.head.appendChild(s2);
    }
  }, [gaId]);

  // Track page views on route change
  useEffect(() => {
    if (gaId && (window as any).gtag) {
      (window as any).gtag("config", gaId, { page_path: location.pathname });
    }
  }, [location.pathname, gaId]);

  return null;
};

export default GoogleAnalytics;
