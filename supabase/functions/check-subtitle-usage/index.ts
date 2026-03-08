import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT_MINUTES = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if user is admin via auth token
    const authHeader = req.headers.get("authorization") ?? "";
    let isAdmin = false;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      if (token !== anonKey) {
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin");
          if (roles && roles.length > 0) {
            isAdmin = true;
          }
        }
      }
    }

    if (isAdmin) {
      return new Response(
        JSON.stringify({ used: 0, limit: 999999, remaining: 999999 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usageRows, error } = await supabase
      .from("subtitle_usage")
      .select("minutes_used")
      .eq("ip_address", ip)
      .gte("created_at", startOfMonth);

    if (error) throw error;

    const totalMinutes = (usageRows || []).reduce((sum: number, r: any) => sum + (r.minutes_used || 0), 0);
    const used = Math.round(totalMinutes * 10) / 10;
    const remaining = Math.max(0, Math.round((FREE_LIMIT_MINUTES - totalMinutes) * 10) / 10);

    return new Response(
      JSON.stringify({ used, limit: FREE_LIMIT_MINUTES, remaining }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Check usage error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
