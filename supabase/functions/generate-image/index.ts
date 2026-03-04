import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { prompt, referenceImages, size } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "API key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasRefImages = referenceImages && referenceImages.length > 0;
    console.log(`[generate-image] prompt: "${prompt.slice(0, 80)}...", refs: ${hasRefImages ? referenceImages.length : 0}`);

    // Build messages for Gemini image generation
    const userContent: any[] = [];

    if (hasRefImages) {
      userContent.push({
        type: "text",
        text: `Generate an image based on this instruction: ${prompt}. Use the provided reference image(s) as visual guidance. Preserve key elements from the reference. Create a high-quality, professional result.`,
      });
      for (const img of referenceImages) {
        if (img && img.startsWith("data:image")) {
          userContent.push({ type: "image_url", image_url: { url: img } });
        }
      }
    } else {
      userContent.push({
        type: "text",
        text: `Generate a high-quality image: ${prompt}`,
      });
    }

    console.log("[generate-image] Calling Lovable AI (gemini-2.5-flash-image)...");

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
    console.log("[generate-image] Response received, checking for images...");

    // Extract image from the response
    const message = data.choices?.[0]?.message;
    let imageUrl: string | null = null;

    if (message?.images && message.images.length > 0) {
      imageUrl = message.images[0]?.image_url?.url || null;
    }

    if (!imageUrl) {
      console.error("[generate-image] No image in response. Content:", message?.content?.slice(0, 200));
      return new Response(
        JSON.stringify({ error: "Nenhuma imagem foi gerada. Tente um prompt diferente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[generate-image] Success! Image data length:", imageUrl.length);

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
