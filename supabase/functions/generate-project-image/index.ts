import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-forwarded-for",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, projectId, isCover } = await req.json();
    if (!prompt) throw new Error("Prompt é obrigatório");
    if (!projectId) throw new Error("projectId é obrigatório");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("API key não configurada");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get or create unlock record
    let { data: unlock } = await sb
      .from("project_image_unlocks")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (!unlock) {
      const { data: newUnlock } = await sb
        .from("project_image_unlocks")
        .insert({ project_id: projectId, images_generated: 0 })
        .select()
        .single();
      unlock = newUnlock;
    }

    const imagesGenerated = unlock?.images_generated || 0;
    const isPaid = unlock?.is_paid || false;
    const maxImages = unlock?.max_images || 20;

    // Policy: 1 free image (cover), rest requires payment
    if (!isCover && imagesGenerated >= 1 && !isPaid) {
      return new Response(
        JSON.stringify({ error: "PAYMENT_REQUIRED", message: "Desbloqueie imagens adicionais por US$ 1" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Max images safety
    if (imagesGenerated >= maxImages) {
      return new Response(
        JSON.stringify({ error: "MAX_IMAGES_REACHED", message: "Limite máximo de imagens por projeto atingido." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: 1 image per 5 seconds per project
    if (unlock?.updated_at) {
      const lastGen = new Date(unlock.updated_at).getTime();
      if (Date.now() - lastGen < 5000) {
        return new Response(
          JSON.stringify({ error: "Aguarde alguns segundos antes de gerar outra imagem." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`[generate-project-image] project: ${projectId}, cover: ${isCover}, count: ${imagesGenerated}`);

    // Generate image
    const enhancedPrompt = `${prompt}. Style: photorealistic, high quality, professional lighting, consistent modern aesthetic, sharp details, 4K quality.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: `Generate a high-quality photorealistic image: ${enhancedPrompt}` }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-project-image] AI error:", response.status, errorText);
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
      return new Response(
        JSON.stringify({ error: "Nenhuma imagem foi gerada. Tente um prompt diferente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update counter
    await sb
      .from("project_image_unlocks")
      .update({
        images_generated: imagesGenerated + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", projectId);

    // Log usage
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await sb.from("api_usage").insert({
      tool: "project_image_generation",
      ip_address: ip,
      estimated_cost: 0.04,
    });

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[generate-project-image] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
