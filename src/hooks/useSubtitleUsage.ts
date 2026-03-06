import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
}

export function useSubtitleUsage() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      // Get current session token to pass for admin check
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subtitle-usage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setUsage({ used: data.used, limit: data.limit, remaining: data.remaining });
      }
    } catch (err) {
      console.error("Failed to check subtitle usage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, loading, refetchUsage: fetchUsage };
}
