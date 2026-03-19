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
    const { businessName, profileType, niche, city, style, useEmojis, useCTA } = await req.json();

    if (!businessName || !niche) {
      return new Response(JSON.stringify({ error: "Nome do negócio e nicho são obrigatórios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key não configurada." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cityInfo = city ? ` localizada em ${city}` : "";
    const emojiInfo = useEmojis ? "Use emojis relevantes." : "NÃO use emojis.";
    const ctaInfo = useCTA ? "Inclua um call-to-action persuasivo." : "Não inclua call-to-action.";

    const systemPrompt = `Você é um especialista em marketing digital e Instagram. Gere bios profissionais para Instagram em português brasileiro. Responda APENAS com JSON válido, sem markdown.`;

    const userPrompt = `Gere bios para Instagram com estas informações:
- Nome do negócio/perfil: ${businessName}
- Tipo de perfil: ${profileType || "Empresa"}
- Nicho/profissão: ${niche}
- Localização: ${city || "não informada"}
- Estilo desejado: ${style || "Profissional"}
- ${emojiInfo}
- ${ctaInfo}

Regras:
- Cada bio deve ter NO MÁXIMO 150 caracteres
- Incorpore "${businessName}" naturalmente
- Seja profissional, natural e persuasivo
- Tudo em português brasileiro

Responda com este JSON exato:
{
  "mainBio": "bio principal recomendada",
  "alternativeBios": ["bio alternativa 1", "bio alternativa 2"],
  "suggestedUsername": "@username_sugerido",
  "ctaLine": "linha de CTA sugerida",
  "highlights": ["ideia destaque 1", "ideia destaque 2", "ideia destaque 3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        max_tokens: 2048,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_bio",
              description: "Generate Instagram bio data",
              parameters: {
                type: "object",
                properties: {
                  mainBio: { type: "string" },
                  alternativeBios: { type: "array", items: { type: "string" } },
                  suggestedUsername: { type: "string" },
                  ctaLine: { type: "string" },
                  highlights: { type: "array", items: { type: "string" } },
                },
                required: ["mainBio", "alternativeBios", "suggestedUsername", "ctaLine", "highlights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_bio" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Try tool call first, then fall back to message content
    let result;
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      const content = data.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-bio error:", e);
    return new Response(JSON.stringify({ error: "Erro ao gerar bio." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
