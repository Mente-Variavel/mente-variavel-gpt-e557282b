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
    const { base } = await req.json();
    const baseCurrency = base || "USD";

    // Try primary API first
    let rates: Record<string, number> | null = null;
    let source = "";
    let lastUpdated = "";

    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      if (res.ok) {
        const data = await res.json();
        rates = data.rates;
        source = "ExchangeRate-API";
        lastUpdated = data.date || new Date().toISOString().split("T")[0];
      }
    } catch (e) {
      console.error("Primary API failed:", e);
    }

    // If primary fails, try to get rates via Tavily search
    if (!rates) {
      const tavilyKey = Deno.env.get("TAVILY_API_KEY");
      if (tavilyKey) {
        try {
          console.log("Fetching rates via Tavily...");
          const tavilyRes = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: tavilyKey,
              query: `current exchange rate ${baseCurrency} to BRL USD EUR GBP JPY today ${new Date().toISOString().split("T")[0]}`,
              search_depth: "basic",
              include_answer: true,
              max_results: 3,
            }),
          });

          if (tavilyRes.ok) {
            const tavilyData = await tavilyRes.json();
            source = "Tavily Search (estimated)";
            lastUpdated = new Date().toISOString().split("T")[0];

            // Use Lovable AI to parse the search results into rates
            const lovableKey = Deno.env.get("LOVABLE_API_KEY");
            if (lovableKey && tavilyData.answer) {
              const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash-lite",
                  messages: [
                    {
                      role: "user",
                      content: `Extract exchange rates from this text. Base currency: ${baseCurrency}. Return ONLY a JSON object with currency codes as keys and numeric rates as values. Include at least: BRL, USD, EUR, GBP, JPY. Text: ${tavilyData.answer}`,
                    },
                  ],
                  tools: [
                    {
                      type: "function",
                      function: {
                        name: "return_rates",
                        description: "Return parsed exchange rates",
                        parameters: {
                          type: "object",
                          properties: {
                            BRL: { type: "number" },
                            USD: { type: "number" },
                            EUR: { type: "number" },
                            GBP: { type: "number" },
                            JPY: { type: "number" },
                          },
                          required: ["BRL", "USD", "EUR", "GBP", "JPY"],
                        },
                      },
                    },
                  ],
                  tool_choice: { type: "function", function: { name: "return_rates" } },
                }),
              });

              if (aiRes.ok) {
                const aiData = await aiRes.json();
                const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
                if (toolCall?.function?.arguments) {
                  rates = JSON.parse(toolCall.function.arguments);
                }
              }
            }
          }
        } catch (e) {
          console.error("Tavily fallback failed:", e);
        }
      }
    }

    // Final fallback
    if (!rates) {
      rates = { BRL: 5.18, USD: 1, EUR: 0.85, GBP: 0.74, JPY: 157.0 };
      source = "fallback (offline)";
      lastUpdated = "N/A";
    }

    // Ensure base currency is 1
    rates[baseCurrency] = 1;

    return new Response(JSON.stringify({ rates, source, lastUpdated, base: baseCurrency }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("exchange-rates error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
