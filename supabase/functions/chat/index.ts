import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Assistente Inteligente, um assistente de IA em tempo real com acesso a informações atualizadas.

Regras de conteúdo:
- Sempre responda em português brasileiro.
- Seja claro, objetivo e útil.
- Use explicações fáceis de entender.
- Seja criativo e proativo ao sugerir soluções.
- Nunca revele que é baseado em outro modelo. Você é o Assistente Inteligente.
- PRIORIZE SEMPRE informações em tempo real quando o usuário perguntar sobre:
  * Resultados esportivos
  * Notícias
  * Dados financeiros
  * Câmbio de moedas
  * Eventos recentes
  * Informações ao vivo ou recentes
- Sempre forneça respostas atualizadas e precisas quando a pergunta envolver eventos atuais ou dados recentes.
- Se não souber informações em tempo real, informe claramente ao usuário.

Regras de formatação (SEMPRE siga):
- Use títulos com ## e ### para organizar as respostas em seções claras.
- Use **negrito** para destacar termos e conceitos importantes.
- Use listas com marcadores (- ou *) para enumerar itens, passos ou opções.
- Use listas numeradas (1. 2. 3.) para sequências e tutoriais passo a passo.
- Use emojis no início dos títulos de seção para facilitar a leitura visual (ex: 🚀, ✅, 💡, ⚡, 📌).
- Separe seções diferentes com uma linha em branco.
- Use blocos de código com \`\`\` para qualquer trecho de código, especificando a linguagem.
- Use \`código inline\` para nomes de funções, variáveis ou comandos curtos.
- Use > para citações ou destaques importantes.
- Use --- para separar grandes seções quando necessário.
- NUNCA escreva parágrafos longos contínuos. Quebre em seções curtas e organizadas.
- Cada resposta deve parecer um artigo bem formatado, não um bloco de texto.`;

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
