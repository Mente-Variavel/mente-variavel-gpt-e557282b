import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if user is admin
    const authHeader = req.headers.get("authorization") ?? "";
    let isAdmin = false;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      if (token !== anonKey) {
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin");
          if (roles && roles.length > 0) {
            isAdmin = true;
          }
        }
      }
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Only check limit for non-admin users
    if (!isAdmin) {
      const { count, error: countError } = await supabase
        .from("subtitle_usage")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", startOfMonth);

      if (countError) throw countError;

      if ((count ?? 0) >= FREE_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Você atingiu o limite gratuito. Assine o plano para continuar gerando legendas.",
            limit_reached: true,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const formData = await req.formData();
    const audioFile = formData.get("file") as File | null;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, audioFile.name);
    whisperForm.append("model", "whisper-1");
    whisperForm.append("response_format", "verbose_json");
    whisperForm.append("timestamp_granularities[]", "segment");
    whisperForm.append("language", formData.get("language")?.toString() || "pt");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: whisperForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Whisper error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Whisper API error [${response.status}]: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    // Only track usage for non-admin users
    if (!isAdmin) {
      await supabase.from("subtitle_usage").insert({ ip_address: ip });
    }

    const subtitles = (result.segments || []).map((seg: any) => ({
      id: crypto.randomUUID(),
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));

    const { count: newCount } = await supabase
      .from("subtitle_usage")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", startOfMonth);

    const usageInfo = isAdmin
      ? { used: 0, limit: 999999, remaining: 999999 }
      : { used: newCount ?? 1, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - (newCount ?? 1)) };

    return new Response(
      JSON.stringify({
        subtitles,
        language: result.language,
        duration: result.duration,
        usage: usageInfo,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Transcription error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
