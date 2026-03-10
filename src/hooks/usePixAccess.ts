import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

export type PixAccessStatus = "loading" | "free" | "trial" | "active" | "expired";

export const usePixAccess = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isRoleLoading } = useUserRole();
  const [status, setStatus] = useState<PixAccessStatus>("loading");
  const [trialEnd, setTrialEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || isRoleLoading) return;

    // Admin always has full access
    if (isAdmin) {
      setStatus("active");
      setLoading(false);
      return;
    }

    // Not logged in = free access (no gate)
    if (!user) {
      setStatus("free");
      setLoading(false);
      return;
    }

    const check = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("pix_checkout_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) {
        // No subscription exists — create a trial
        const { data: newSub } = await supabase
          .from("pix_checkout_subscriptions")
          .insert({ user_id: user.id, plan: "mensal", status: "trial" })
          .select()
          .single();

        if (newSub) {
          setTrialEnd(new Date(newSub.trial_end));
          setStatus("trial");
        } else {
          setStatus("free");
        }
        setLoading(false);
        return;
      }

      if (data.status === "active") {
        if (data.subscription_end && new Date(data.subscription_end) < new Date()) {
          setStatus("expired");
        } else {
          setStatus("active");
        }
      } else if (data.status === "trial") {
        const end = new Date(data.trial_end);
        setTrialEnd(end);
        if (end < new Date()) {
          setStatus("expired");
        } else {
          setStatus("trial");
        }
      } else if (data.status === "pending") {
        const end = new Date(data.trial_end);
        setTrialEnd(end);
        if (end < new Date()) {
          setStatus("expired");
        } else {
          setStatus("trial");
        }
      } else {
        setStatus("expired");
      }

      setLoading(false);
    };

    check();
  }, [user, authLoading, isAdmin, isRoleLoading]);

  return { status, trialEnd, loading };
};
