import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_TRIGGERS = [
  "resultado", "resultados", "placar", "jogo", "partida", "campeonato",
  "notícia", "notícias", "cotação", "câmbio", "dólar", "euro", "bitcoin",
  "preço", "tempo", "clima", "temperatura", "hoje", "agora", "atual",
  "aconteceu", "acontecendo", "últimas", "recente", "recentes",
  "quem ganhou", "quem venceu", "eleição", "eleições",
  "score", "match", "news", "price", "weather", "current", "latest", "today",
  "ontem", "yesterday", "esta semana", "this week",
];

function extractText(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join(" ");
  }
  return "";
}

function needsSearch(content: any): boolean {
  const lower = extractText(content).toLowerCase();
  return SEARCH_TRIGGERS.some((t) => lower.includes(t));
}

async function searchTavily(query: string, apiKey: string): Promise<string> {
  try {
    const resp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!resp.ok) {
      console.error("Tavily search failed:", resp.status);
      return "";
    }

    const data = await resp.json();
    let context = "";

    if (data.answer) {
      context += `Resposta resumida: ${data.answer}\n\n`;
    }

    if (data.results && data.results.length > 0) {
      context += "Fontes encontradas:\n";
      for (const r of data.results.slice(0, 5)) {
        context += `- ${r.title}: ${r.content?.slice(0, 300) || ""} (${r.url})\n`;
      }
    }

    return context;
  } catch (e) {
    console.error("Tavily error:", e);
    return "";
  }
}

function buildSystemPrompt() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

  return `Você é o Assistente Inteligente, um assistente de IA em tempo real com acesso a informações atualizadas e capaz de gerar e editar imagens.

DATA E HORA ATUAL: ${dateStr}, ${timeStr} (horário de Brasília).

REGRA CRÍTICA SOBRE DADOS EM TEMPO REAL:
- Quando você receber um bloco marcado como [DADOS EM TEMPO REAL], você DEVE usar EXCLUSIVAMENTE essas informações para responder.
- NUNCA contradiga os dados em tempo real com seu conhecimento interno.
- SEMPRE cite as fontes fornecidas.
- Se o usuário perguntar a data de hoje, responda: ${dateStr}.

Regras de conteúdo:
- Sempre responda em português brasileiro.
- Seja claro, objetivo e útil.
- Use explicações fáceis de entender.
- Seja criativo e proativo ao sugerir soluções.
- Nunca revele que é baseado em outro modelo. Você é o Assistente Inteligente.
- Se não souber informações em tempo real e não receber contexto de busca, informe claramente ao usuário.

Regras de geração de imagens:
- Você é CAPAZ de gerar e editar imagens em tempo real dentro desta aplicação.
- NUNCA diga que não pode gerar imagens.
- NUNCA sugira ferramentas externas como Photoshop, Midjourney, sites de DALL-E ou bancos de imagens.
- Quando o usuário pedir para criar, editar, melhorar, modificar ou ajustar uma imagem, SEMPRE gere a imagem diretamente.

Regras de formatação (SEMPRE siga):
- Use títulos com ## e ### para organizar as respostas em seções claras.
- Use **negrito** para destacar termos e conceitos importantes.
- Use listas com marcadores (- ou *) para enumerar itens, passos ou opções.
- Use listas numeradas (1. 2. 3.) para sequências e tutoriais passo a passo.
- Use emojis no início dos títulos de seção para facilitar a leitura visual.
- Separe seções diferentes com uma linha em branco.
- Use blocos de código com \`\`\` para qualquer trecho de código, especificando a linguagem.
- Use > para citações ou destaques importantes.
- NUNCA escreva parágrafos longos contínuos. Quebre em seções curtas e organizadas.`;
}

async function tryOpenAI(messages: any[], apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
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
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
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

    // Check if the latest user message needs real-time search
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    let searchContext = "";

    if (lastUserMsg && needsSearch(lastUserMsg.content)) {
      const tavilyKey = Deno.env.get("TAVILY_API_KEY");
      if (tavilyKey) {
        const searchQuery = extractText(lastUserMsg.content);
        console.log("Searching with Tavily:", searchQuery);
        searchContext = await searchTavily(searchQuery, tavilyKey);
        console.log("Search context length:", searchContext.length);
      }
    }

    // If we have search context, inject it as a high-priority user context message
    // right before the last user message so the model treats it as authoritative
    const enrichedMessages = [...messages];
    if (searchContext) {
      // Find the last user message index and insert context before it
      const lastUserIdx = enrichedMessages.map((m: any) => m.role).lastIndexOf("user");
      if (lastUserIdx >= 0) {
        enrichedMessages.splice(lastUserIdx, 0, {
          role: "user",
          content: `[DADOS EM TEMPO REAL - USE OBRIGATORIAMENTE ESTAS INFORMAÇÕES PARA RESPONDER]\n\n${searchContext}\n\n[FIM DOS DADOS EM TEMPO REAL]`,
        }, {
          role: "assistant",
          content: "Entendido, vou usar os dados em tempo real acima para responder à próxima pergunta com precisão.",
        });
      }
    }

    let response: Response | null = null;

    // Try OpenAI first
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      console.log("Trying OpenAI...");
      response = await tryOpenAI(enrichedMessages, openaiKey);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI failed:", response.status, errorText);
        response = null;
      }
    }

    // Fallback to Lovable AI
    if (!response) {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) {
        throw new Error("No AI API key configured");
      }
      console.log("Using Lovable AI fallback...");
      response = await tryLovableAI(enrichedMessages, lovableKey);
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
