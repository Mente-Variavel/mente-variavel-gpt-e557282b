import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { description, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um especialista em tributação brasileira para MEI e Simples Nacional.
O usuário descreve seu serviço. Responda APENAS com JSON puro (sem markdown, sem \`\`\`):
{"tax": <número>, "justification": "<uma frase curta>"}

Faixas comuns: MEI serviços 5-6%, MEI comércio 4-5%, Simples serviços 6-15%, Simples comércio 4-11%, Alimentação 6-12%, Consultoria 8-15%.
Se não souber, use {"tax": 6, "justification": "Alíquota padrão MEI."}`;

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
            { role: "user", content: `Categoria: ${category || "Outro"}\nServiço: ${description || "Não informado"}` },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status === 402) {
        return new Response(
          JSON.stringify({ error: status === 429 ? "Rate limit" : "Payment required" }),
          { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI error:", status, await response.text());
      throw new Error("AI error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const cleaned = content.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*?"tax"[\s\S]*?\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify({ tax: Number(parsed.tax), justification: parsed.justification || "" }), {
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
      JSON.stringify({ tax: 6, justification: "Não foi possível estimar. Usando padrão." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
