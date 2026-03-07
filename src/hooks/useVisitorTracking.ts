import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LOG_VISIT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-visit`;

export function useVisitorTracking() {
  const location = useLocation();

  useEffect(() => {
    const logVisit = async () => {
      try {
        await fetch(LOG_VISIT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            page: location.pathname,
            userAgent: navigator.userAgent,
          }),
        });
      } catch {
        // silent fail
      }
    };
    logVisit();
  }, [location.pathname]);
}
