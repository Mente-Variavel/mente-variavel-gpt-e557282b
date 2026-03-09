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
    const { action, messages, conversationId, title } = await req.json();

    // List all conversations for this IP
    if (action === "list") {
      const { data } = await sb
        .from("chat_conversations")
        .select("id, title, updated_at, messages")
        .eq("ip_address", ip)
        .is("user_id", null)
        .order("updated_at", { ascending: false })
        .limit(50);

      const conversations = (data || []).map((c: any) => ({
        id: c.id,
        title: c.title || "Nova conversa",
        updatedAt: c.updated_at,
        messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
      }));

      return new Response(JSON.stringify({ conversations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load specific conversation or latest
    if (action === "load") {
      let query = sb
        .from("chat_conversations")
        .select("id, title, messages")
        .eq("ip_address", ip)
        .is("user_id", null);

      if (conversationId) {
        query = query.eq("id", conversationId);
      } else {
        query = query.order("updated_at", { ascending: false }).limit(1);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        return new Response(JSON.stringify({ 
          id: data[0].id, 
          title: data[0].title || "Nova conversa",
          messages: data[0].messages 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ id: null, title: null, messages: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save messages to a conversation
    if (action === "save") {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If conversationId provided, update that specific one
      if (conversationId) {
        // Auto-generate title from first user message if not set
        const firstUserMsg = messages.find((m: any) => m.role === "user");
        const autoTitle = firstUserMsg ? firstUserMsg.content.slice(0, 50) : "Nova conversa";

        const { data: existing } = await sb
          .from("chat_conversations")
          .select("id, title")
          .eq("id", conversationId)
          .single();

        if (existing) {
          const newTitle = existing.title === "Nova conversa" ? autoTitle : existing.title;
          await sb
            .from("chat_conversations")
            .update({ messages, title: newTitle, updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          return new Response(JSON.stringify({ ok: true, id: conversationId, title: newTitle }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Create new conversation
      const firstUserMsg = messages.find((m: any) => m.role === "user");
      const autoTitle = firstUserMsg ? firstUserMsg.content.slice(0, 50) : "Nova conversa";

      const { data: newRow } = await sb
        .from("chat_conversations")
        .insert({ ip_address: ip, messages, user_id: null, title: autoTitle })
        .select("id, title")
        .single();

      return new Response(JSON.stringify({ ok: true, id: newRow?.id, title: newRow?.title }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rename a conversation
    if (action === "rename") {
      if (!conversationId || !title) {
        return new Response(JSON.stringify({ error: "Missing conversationId or title" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await sb
        .from("chat_conversations")
        .update({ title })
        .eq("id", conversationId)
        .eq("ip_address", ip)
        .is("user_id", null);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete specific conversation
    if (action === "delete") {
      if (!conversationId) {
        return new Response(JSON.stringify({ error: "Missing conversationId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await sb
        .from("chat_conversations")
        .delete()
        .eq("id", conversationId)
        .eq("ip_address", ip)
        .is("user_id", null);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear all conversations for this IP
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
