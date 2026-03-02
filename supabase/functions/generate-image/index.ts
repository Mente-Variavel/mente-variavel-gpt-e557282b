import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReferenceAnalysis {
  detected_text: string;
  primary_colors: string[];
  logo_description: string;
  shape_notes: string;
  do_not_modify: string[];
  recommended_placement: string;
}

// Step 1: Analyze reference image using Lovable AI (Gemini vision)
async function analyzeReferenceImage(
  imageBase64: string,
  lovableKey: string
): Promise<ReferenceAnalysis> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a visual analysis expert. Analyze the uploaded image and return STRICT JSON with these fields:
{
  "detected_text": "any text found in the image",
  "primary_colors": ["#hex1","#hex2","#hex3"],
  "logo_description": "detailed description of the logo/design",
  "shape_notes": "geometric shapes, layout structure",
  "do_not_modify": ["preserve typography","preserve proportions","do not distort","do not recolor"],
  "recommended_placement": "where to place this on a product (e.g. centered on chest)"
}
Return ONLY the JSON object, no markdown, no extra text.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this reference image in detail. Return strict JSON." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_analysis",
            description: "Return structured analysis of the reference image",
            parameters: {
              type: "object",
              properties: {
                detected_text: { type: "string" },
                primary_colors: { type: "array", items: { type: "string" } },
                logo_description: { type: "string" },
                shape_notes: { type: "string" },
                do_not_modify: { type: "array", items: { type: "string" } },
                recommended_placement: { type: "string" },
              },
              required: ["detected_text", "primary_colors", "logo_description", "shape_notes", "do_not_modify", "recommended_placement"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_analysis" } },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Vision analysis error:", response.status, err);
    throw new Error("Falha na análise da imagem de referência");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments) as ReferenceAnalysis;
  }

  // Fallback: try parsing content directly
  const content = data.choices?.[0]?.message?.content || "";
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as ReferenceAnalysis;
  } catch {
    console.error("Failed to parse analysis:", content);
    throw new Error("Falha ao interpretar análise da imagem");
  }
}

// Step 2: Build reinforced prompt from analysis
function buildReinforcedPrompt(userPrompt: string, analysis: ReferenceAnalysis): string {
  const colors = analysis.primary_colors.join(", ");
  return `${userPrompt}.

CRITICAL REFERENCE REQUIREMENTS:
- Use EXACTLY the provided reference logo/image — do NOT invent or recreate any symbol or text.
- Logo description for verification: ${analysis.logo_description}
- Detected text that MUST appear exactly: "${analysis.detected_text}"
- Original colors to preserve: ${colors}
- Shape structure: ${analysis.shape_notes}
- Placement: ${analysis.recommended_placement}
- ${analysis.do_not_modify.join(". ")}

STYLE REQUIREMENTS:
- Photorealistic product mockup
- Studio lighting with natural shadows
- Real material textures
- DSLR photography style, 85mm lens
- High detail, no watermark, no additional text beyond the reference`;
}

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
    console.log(`Generating image — prompt: "${prompt}", ref images: ${hasRefImages ? referenceImages.length : 0}`);

    let imageData: string | null = null;
    let revisedPrompt = "";
    let analysis: ReferenceAnalysis | null = null;

    if (hasRefImages) {
      // Validate reference images are actual base64 data
      for (const img of referenceImages) {
        if (!img || !img.startsWith("data:image")) {
          return new Response(
            JSON.stringify({ error: "Imagem de referência não foi recebida pelo servidor." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // STEP 1: Analyze reference image
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (lovableKey) {
        try {
          console.log("Step 1: Analyzing reference image...");
          analysis = await analyzeReferenceImage(referenceImages[0], lovableKey);
          console.log("Analysis result:", JSON.stringify(analysis));
        } catch (e) {
          console.error("Analysis failed, proceeding with basic prompt:", e);
        }
      }

      // STEP 2: Generate with reinforced prompt + reference image
      const finalPrompt = analysis
        ? buildReinforcedPrompt(prompt, analysis)
        : `${prompt}. Use EXACTLY the provided reference image. Preserve all typography, shapes, colors. Photorealistic mockup, studio lighting, 85mm lens, high detail.`;

      console.log("Step 2: Generating image with reinforced prompt...");

      const inputContent: any[] = [{ type: "text", text: finalPrompt }];
      for (const img of referenceImages) {
        inputContent.push({ type: "input_image", image_url: img });
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
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes na OpenAI." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`Erro da API: ${response.status}`);
      }

      const data = await response.json();
      const imageOutput = data.output?.find((o: any) => o.type === "image_generation_call");
      if (imageOutput?.result) {
        imageData = `data:image/png;base64,${imageOutput.result}`;
      }
      revisedPrompt = finalPrompt;
    } else {
      // Standard generation without reference
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
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    return new Response(JSON.stringify({ imageUrl: imageData, revisedPrompt, analysis }), {
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
