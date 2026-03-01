import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Find active ads with expired plans
    const { data: expiredAds, error: fetchError } = await supabase
      .from("ads")
      .select("id, title, client_name, slot")
      .eq("is_active", true)
      .not("plan_end", "is", null)
      .lt("plan_end", today);

    if (fetchError) throw fetchError;

    if (expiredAds && expiredAds.length > 0) {
      const ids = expiredAds.map((ad) => ad.id);
      const { error: updateError } = await supabase
        .from("ads")
        .update({ is_active: false })
        .in("id", ids);

      if (updateError) throw updateError;

      console.log(`Deactivated ${expiredAds.length} expired ads:`, expiredAds.map((a) => a.client_name || a.title || a.slot));
    } else {
      console.log("No expired ads to deactivate.");
    }

    return new Response(
      JSON.stringify({ deactivated: expiredAds?.length || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deactivating expired ads:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
