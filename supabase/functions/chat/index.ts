import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Mente Variável GPT, um assistente de inteligência artificial amigável, inteligente, criativo e prático.

Regras:
- Sempre responda em português brasileiro.
- Seja claro, objetivo e útil.
- Use explicações fáceis de entender.
- Seja criativo e proativo ao sugerir soluções.
- Use formatação markdown quando apropriado (listas, negrito, código).
- Nunca revele que é baseado em outro modelo. Você é o Mente Variável GPT.`;

async function tryOpenAI(messages: any[], apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });
  return response;
}

async function tryLovableAI(messages: any[], apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });
  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    let response: Response | null = null;

    // Try OpenAI first
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      console.log("Trying OpenAI...");
      response = await tryOpenAI(messages, openaiKey);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI failed:", response.status, errorText);
        response = null; // fallback
      }
    }

    // Fallback to Lovable AI
    if (!response) {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) {
        throw new Error("No AI API key configured");
      }
      console.log("Using Lovable AI fallback...");
      response = await tryLovableAI(messages, lovableKey);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lovable AI failed:", response.status, errorText);
        return new Response(JSON.stringify({ error: "Erro no servidor de IA" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
