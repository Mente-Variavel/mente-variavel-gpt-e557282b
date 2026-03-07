import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { description, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um especialista em tributação brasileira para pequenos negócios e autônomos (MEI, Simples Nacional, etc).

O usuário vai descrever o serviço ou produto que oferece. Você deve responder APENAS com um JSON no formato:
{"tax": <número>, "justification": "<explicação curta em português>"}

Onde "tax" é a alíquota estimada de impostos em porcentagem (número inteiro ou decimal) que a pessoa provavelmente paga considerando o regime tributário mais comum para esse tipo de atividade no Brasil.

Faixas comuns:
- MEI (serviços): 5-6%
- MEI (comércio): 4-5%
- Simples Nacional (serviços): 6-15%
- Simples Nacional (comércio): 4-11%
- Alimentação: 6-12%
- Consultoria/profissional liberal: 8-15%

Se a descrição for vaga, use a categoria como contexto adicional. Se não conseguir estimar, retorne {"tax": 6, "justification": "Alíquota padrão MEI para serviços gerais."}`;

    const userPrompt = `Categoria: ${category || "Outro"}
Descrição do serviço: ${description || "Não informada"}

Qual a alíquota de imposto estimada?`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "estimate_tax",
                description:
                  "Return the estimated tax percentage and a short justification.",
                parameters: {
                  type: "object",
                  properties: {
                    tax: { type: "number", description: "Tax percentage" },
                    justification: {
                      type: "string",
                      description: "Short justification in Portuguese",
                    },
                  },
                  required: ["tax", "justification"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "estimate_tax" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*?"tax"[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ tax: 6, justification: "Alíquota padrão estimada." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("estimate-tax error:", e);
    return new Response(
      JSON.stringify({ tax: 6, justification: "Não foi possível estimar. Usando alíquota padrão." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
