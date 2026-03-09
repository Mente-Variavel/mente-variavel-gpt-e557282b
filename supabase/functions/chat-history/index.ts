import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-forwarded-for",
};

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const ip = getClientIp(req);
    const { action, messages } = await req.json();

    if (action === "load") {
      // Load latest conversation for this IP
      const { data } = await sb
        .from("chat_conversations")
        .select("id, messages")
        .eq("ip_address", ip)
        .is("user_id", null)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        return new Response(JSON.stringify({ id: data[0].id, messages: data[0].messages }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ id: null, messages: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "save") {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if conversation exists for this IP
      const { data: existing } = await sb
        .from("chat_conversations")
        .select("id")
        .eq("ip_address", ip)
        .is("user_id", null)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        await sb
          .from("chat_conversations")
          .update({ messages, updated_at: new Date().toISOString() })
          .eq("id", existing[0].id);

        return new Response(JSON.stringify({ ok: true, id: existing[0].id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const { data: newRow } = await sb
          .from("chat_conversations")
          .insert({ ip_address: ip, messages, user_id: null })
          .select("id")
          .single();

        return new Response(JSON.stringify({ ok: true, id: newRow?.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "clear") {
      await sb
        .from("chat_conversations")
        .delete()
        .eq("ip_address", ip)
        .is("user_id", null);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-history error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
