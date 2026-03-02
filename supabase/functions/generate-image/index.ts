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
    const { prompt, referenceImages } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasRefImages = referenceImages && referenceImages.length > 0;
    console.log(`Generating image for prompt: "${prompt}", ref images: ${hasRefImages ? referenceImages.length : 0}`);

    let imageData: string | null = null;
    let revisedPrompt = "";

    if (hasRefImages) {
      // Use Responses API with gpt-image-1 for image editing/reference
      const inputContent: any[] = [
        { type: "text", text: prompt },
      ];

      for (const img of referenceImages) {
        // img is a data:image/...;base64,... string
        inputContent.push({
          type: "input_image",
          image_url: img,
        });
      }

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          input: inputContent,
          tools: [{ type: "image_generation", quality: "high", size: "1024x1024" }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI Responses API error:", response.status, errorText);
        throw new Error(`Erro da API: ${response.status}`);
      }

      const data = await response.json();
      // Extract image from output
      const imageOutput = data.output?.find((o: any) => o.type === "image_generation_call");
      if (imageOutput?.result) {
        imageData = `data:image/png;base64,${imageOutput.result}`;
      }
    } else {
      // Standard image generation without reference
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "high",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI image error:", response.status, errorText);

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        throw new Error(`Erro da API: ${response.status}`);
      }

      const data = await response.json();
      imageData = data.data?.[0]?.b64_json
        ? `data:image/png;base64,${data.data[0].b64_json}`
        : data.data?.[0]?.url;
      revisedPrompt = data.data?.[0]?.revised_prompt || "";
    }

    if (!imageData) {
      return new Response(JSON.stringify({ error: "Nenhuma imagem foi gerada. Tente um prompt diferente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl: imageData, revisedPrompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
