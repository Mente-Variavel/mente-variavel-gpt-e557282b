import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    if (!projectId) throw new Error("projectId is required");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if already verified
    const { data: unlock } = await sb
      .from("project_image_unlocks")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (!unlock) {
      return new Response(JSON.stringify({ isPaid: false, imagesGenerated: 0, maxImages: 20 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (unlock.is_paid) {
      return new Response(
        JSON.stringify({ isPaid: true, imagesGenerated: unlock.images_generated, maxImages: unlock.max_images }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Stripe if we have a session
    if (unlock.stripe_session_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const session = await stripe.checkout.sessions.retrieve(unlock.stripe_session_id);
      if (session.payment_status === "paid") {
        await sb
          .from("project_image_unlocks")
          .update({ is_paid: true, updated_at: new Date().toISOString() })
          .eq("project_id", projectId);

        return new Response(
          JSON.stringify({ isPaid: true, imagesGenerated: unlock.images_generated, maxImages: unlock.max_images }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ isPaid: false, imagesGenerated: unlock.images_generated, maxImages: unlock.max_images }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[verify-image-payment] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
