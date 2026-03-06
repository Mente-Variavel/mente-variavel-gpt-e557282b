import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-forwarded-for",
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
    const { prompt, referenceImages, size, aspectRatio } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "API key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, serviceKey);
    const ip = getClientIp(req);

    // Check if user is admin — skip rate limit for admins
    let isAdmin = false;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await anonClient.auth.getUser();
      if (user) {
        const { data: hasRole } = await sb.rpc("has_role", { _user_id: user.id, _role: "admin" });
        if (hasRole) isAdmin = true;
      }
    }

    // Rate limit: 3 images per IP per 24h (skip for admins)
    if (!isAdmin) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await sb
        .from("image_rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("generated_at", since);

      if ((count || 0) >= 3) {
        return new Response(
          JSON.stringify({ error: "Limite diário gratuito atingido. Volte amanhã para gerar mais imagens." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const hasRefImages = referenceImages && referenceImages.length > 0;
    
    // Build aspect ratio instruction
    const ratioMap: Record<string, string> = {
      "16:9": "wide landscape format (16:9 aspect ratio, like a YouTube thumbnail or banner)",
      "9:16": "tall vertical/portrait format (9:16 aspect ratio, like Instagram Reels or TikTok)",
      "1:1": "square format (1:1 aspect ratio)",
    };
    const ratioInstruction = aspectRatio && ratioMap[aspectRatio] 
      ? ` The image MUST be in ${ratioMap[aspectRatio]}.` 
      : "";

    console.log(`[generate-image] prompt: "${prompt.slice(0, 80)}...", refs: ${hasRefImages ? referenceImages.length : 0}, ip: ${ip}, ratio: ${aspectRatio || "default"}`);

    const userContent: any[] = [];
    if (hasRefImages) {
      userContent.push({
        type: "text",
        text: `Generate an image based on this instruction: ${prompt}.${ratioInstruction} Use the provided reference image(s) as visual guidance. Preserve key elements from the reference. Create a high-quality, professional result.`,
      });
      for (const img of referenceImages) {
        if (img && img.startsWith("data:image")) {
          userContent.push({ type: "image_url", image_url: { url: img } });
        }
      }
    } else {
      userContent.push({ type: "text", text: `Generate a high-quality image: ${prompt}${ratioInstruction}` });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-image] Lovable AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Erro ao gerar imagem (${response.status}). Tente novamente.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    let imageUrl: string | null = null;

    if (message?.images && message.images.length > 0) {
      imageUrl = message.images[0]?.image_url?.url || null;
    }

    if (!imageUrl) {
      console.error("[generate-image] No image in response.");
      return new Response(
        JSON.stringify({ error: "Nenhuma imagem foi gerada. Tente um prompt diferente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log rate limit + usage
    await sb.from("image_rate_limits").insert({ ip_address: ip });
    await sb.from("api_usage").insert({
      tool: "image_generation",
      ip_address: ip,
      estimated_cost: 0.04,
    });

    console.log("[generate-image] Success!");

    return new Response(
      JSON.stringify({ imageUrl, revisedPrompt: prompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[generate-image] Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido ao gerar imagem" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
