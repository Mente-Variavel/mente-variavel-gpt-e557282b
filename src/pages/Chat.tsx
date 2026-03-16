import { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { Plus, Trash2, Info, Gift, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import type { ChatAttachment } from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import Navbar from "@/components/Navbar";
import ChatSidebar, { type ChatConversation } from "@/components/ChatSidebar";
import chatLogo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";

import ReferenceAnalysis, { type AnalysisData } from "@/components/ReferenceAnalysis";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; attachments?: string[]; analysis?: AnalysisData; retryPrompt?: string; retryRefs?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;
const HISTORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-history`;

const IMAGE_TRIGGERS = [
  "gere uma imagem", "gerar imagem", "crie uma imagem", "criar imagem",
  "desenhe", "desenhar", "faça uma imagem", "fazer imagem",
  "generate image", "create image", "draw", "make an image",
  "gere a imagem", "gera uma imagem", "gera imagem", "gera a imagem",
  "gera a imagem de", "gere imagem", "cria uma imagem", "cria a imagem",
  "faz uma imagem", "faz a imagem", "faz imagem",
  "ilustre", "ilustrar", "imagine", "imaginar",
  "ajustar imagem", "ajuste a imagem", "melhorar imagem", "melhore a imagem",
  "trocar fundo", "troque o fundo", "alterar iluminação", "altere a iluminação",
  "editar imagem", "edite a imagem", "modificar imagem", "modifique a imagem",
  "criar ilustração", "crie uma ilustração", "gerar arte", "gere uma arte",
  "coloque na imagem", "colocar na imagem", "coloca na imagem", "aplique na imagem", "aplicar na imagem",
  "na camiseta", "numa camiseta", "em uma camiseta", "na camisa",
  "usar esse logo", "use esse logo", "com esse logo", "usando esse logo",
  "usar essa imagem", "use essa imagem", "com essa imagem", "usando essa imagem",
  "mockup", "estampa", "estampar", "personalizar", "personalização",
  "quero uma arte", "quero uma imagem", "quero uma ilustração",
  "faça uma capa", "gere um desenho", "crie um desenho",
];

const IMAGE_FOLLOWUP_TRIGGERS = [
  "gere a imagem referente", "gera a imagem referente",
  "gere a imagem do prompt", "gera a imagem do prompt",
  "gere a imagem acima", "gera a imagem acima",
  "a imagem acima", "o prompt acima", "isso que eu pedi",
  "o que eu falei antes", "o que pedi antes", "o que eu pedi acima",
  "gere essa imagem", "gera essa imagem", "faça essa imagem",
  "crie essa imagem", "agora gere", "agora crie", "agora faça",
  "pode gerar", "pode criar", "gere agora", "crie agora",
];

const IMAGE_BROAD_TRIGGERS = [
  "cria um", "cria uma", "crie um", "crie uma",
  "gera um", "gera uma", "gere um", "gere uma",
  "faz um", "faz uma", "faça um", "faça uma",
  "desenho de", "desenho do", "desenho da",
  "imagem de", "imagem do", "imagem da", "imagem com",
  "foto de", "foto do", "foto da",
  "arte de", "arte do", "arte da",
  "ilustração de", "ilustração do", "ilustração da",
  "picture of", "image of", "photo of",
];

const TEXT_ONLY_INDICATORS = [
  "descrição", "descreva", "descrever", "texto", "escreva", "escrever",
  "redação", "artigo", "roteiro", "script", "copy", "legenda",
  "resumo", "resumir", "traduz", "traduzir", "tradução",
  "explique", "explicar", "explicação", "analise", "analisar", "análise",
  "liste", "listar", "lista de", "enumere", "enumerar",
  "sugira", "sugerir", "sugestão", "sugestões",
  "crie um texto", "crie uma descrição", "crie um roteiro", "crie um artigo",
  "crie uma legenda", "crie um resumo", "crie uma copy",
  "gere um texto", "gere uma descrição", "gere um roteiro", "gere um artigo",
  "faça um texto", "faça uma descrição", "faça um roteiro", "faça um artigo",
  "description", "describe", "write", "text", "article", "script",
  "summarize", "summary", "translate", "explain", "list",
  "título", "hashtag", "hashtags", "caption", "bio",
  "plano de", "planejamento", "estratégia", "ideia", "ideias",
  "nome para", "nomes para", "slogan",
];

const IMAGE_WITH_ATTACHMENT_TRIGGERS = [
  "camiseta", "camisa", "caneca", "boné", "adesivo", "banner", "cartão",
  "logo", "imagem", "foto", "design", "arte", "produto", "capa",
  "poster", "cartaz", "flyer", "panfleto", "embalagem",
  "t-shirt", "shirt", "mug", "cup", "sticker",
  "coloca", "coloque", "aplica", "aplique", "usa", "use",
  "edita", "edite", "melhora", "melhore", "ajusta", "ajuste",
];

const IMAGE_PROMPT_INDICATORS = [
  "estilo visual:", "configuração da cena:", "composição técnica",
  "proporção: 16:9", "proporção: 9:16", "proporção: 1:1",
  "proporção 16:9", "proporção 9:16", "proporção 1:1",
  "fotorrealismo", "fotorrealista", "renderização",
  "resolução 8k", "resolução 4k", "iluminação e cor",
  "enquadramento:", "golden hour", "hora dourada",
  "gere a imagem estritamente", "gere a imagem na proporção",
  "visual style:", "scene setup:", "aspect ratio:",
];

function isImageRequest(text: string, hasAttachments: boolean): boolean {
  const lower = text.toLowerCase();
  const isTextRequest = TEXT_ONLY_INDICATORS.some((t) => lower.includes(t));
  if (!isTextRequest && IMAGE_TRIGGERS.some((t) => lower.includes(t))) return true;
  if (hasAttachments && IMAGE_WITH_ATTACHMENT_TRIGGERS.some((t) => lower.includes(t))) return true;
  if (hasAttachments) return true;
  if (!isTextRequest && IMAGE_BROAD_TRIGGERS.some((t) => lower.includes(t))) return true;
  const indicatorCount = IMAGE_PROMPT_INDICATORS.filter((t) => lower.includes(t)).length;
  if (indicatorCount >= 2) return true;
  return false;
}

const tips = [
  "Seja específico: quanto mais detalhes, melhor a resposta.",
  "Peça para reformular se a resposta não ficou clara.",
  "Use para estudos, redação, ideias e programação.",
  "Diga 'gere uma imagem de...' para criar imagens com IA! 🎨",
  "Anexe imagens como referência usando o clipe 📎",
];

const ASPECT_RATIO_PATTERNS: { pattern: RegExp; ratio: string }[] = [
  { pattern: /16[:\s]*9|widescreen|paisagem|landscape|capa.*youtube|youtube.*capa|banner|thumbnail/i, ratio: "16:9" },
  { pattern: /9[:\s]*16|vertical|portrait|retrato|reels|stories|tiktok/i, ratio: "9:16" },
  { pattern: /1[:\s]*1|quadrad[ao]|square/i, ratio: "1:1" },
];

function detectAspectRatio(text: string): string | undefined {
  for (const { pattern, ratio } of ASPECT_RATIO_PATTERNS) {
    if (pattern.test(text)) return ratio;
  }
  return undefined;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const Chat = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);
  const conversationId = useRef<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sidebar state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return true;
    return localStorage.getItem("mv_chat_sidebar") === "collapsed";
  });

  // Fetch conversation list
  const fetchConversations = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from("chat_conversations")
        .select("id, title, updated_at, messages")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50);
      if (data) {
        setConversations(data.map((c: any) => ({
          id: c.id,
          title: c.title || "Nova conversa",
          updatedAt: c.updated_at,
          messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
        })));
      }
    } else {
      try {
        const resp = await fetch(HISTORY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "list" }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setConversations(data.conversations || []);
        }
      } catch (e) {
        console.error("Failed to fetch conversations:", e);
      }
    }
  }, [user]);

  // Load specific conversation
  const loadConversation = useCallback(async (id?: string) => {
    if (user) {
      const query = supabase
        .from("chat_conversations")
        .select("id, title, messages")
        .eq("user_id", user.id);
      
      const { data } = id 
        ? await query.eq("id", id).single()
        : await query.order("updated_at", { ascending: false }).limit(1).then(r => ({ data: r.data?.[0] }));

      if (data) {
        conversationId.current = data.id;
        setMessages((data.messages as any[]) || []);
      } else {
        conversationId.current = null;
        setMessages([]);
      }
    } else {
      try {
        const resp = await fetch(HISTORY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "load", conversationId: id }),
        });
        if (resp.ok) {
          const data = await resp.json();
          conversationId.current = data.id || null;
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error("Failed to load conversation:", e);
      }
    }
  }, [user]);

  // Initial load — no longer load previous conversations
  useEffect(() => {
    // Stateless: start fresh every time
    conversationId.current = null;
    setMessages([]);
  }, []);

  // Save conversation with debounce
  const saveConversation = useCallback((msgs: Msg[]) => {
    if (msgs.length === 0) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const toSave = msgs.map(({ role, content, imageUrl }) => ({ role, content, imageUrl }));
      const firstUserMsg = msgs.find(m => m.role === "user");
      const autoTitle = firstUserMsg ? firstUserMsg.content.slice(0, 50) : "Nova conversa";

      if (user) {
        if (conversationId.current) {
          const { data: existing } = await supabase
            .from("chat_conversations")
            .select("title")
            .eq("id", conversationId.current)
            .single();

          const newTitle = existing?.title === "Nova conversa" ? autoTitle : existing?.title;

          await supabase
            .from("chat_conversations")
            .update({ messages: toSave as any, title: newTitle, updated_at: new Date().toISOString() })
            .eq("id", conversationId.current);
        } else {
          const { data } = await supabase
            .from("chat_conversations")
            .insert({ user_id: user.id, messages: toSave as any, title: autoTitle })
            .select("id")
            .single();
          if (data) conversationId.current = data.id;
        }
        fetchConversations();
      } else {
        try {
          const resp = await fetch(HISTORY_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ action: "save", messages: toSave, conversationId: conversationId.current }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.id) conversationId.current = data.id;
            fetchConversations();
          }
        } catch (e) {
          console.error("Failed to save conversation:", e);
        }
      }
    }, 1500);
  }, [user, fetchConversations]);

  // Sidebar toggle persistence
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("mv_chat_sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }, []);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    conversationId.current = null;
    setMessages([]);
  }, []);

  // Handle select conversation
  const handleSelectConversation = useCallback((id: string) => {
    loadConversation(id);
  }, [loadConversation]);

  // Handle rename
  const handleRename = useCallback(async (id: string, title: string) => {
    if (user) {
      await supabase
        .from("chat_conversations")
        .update({ title })
        .eq("id", id);
    } else {
      await fetch(HISTORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "rename", conversationId: id, title }),
      });
    }
    fetchConversations();
  }, [user, fetchConversations]);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    if (user) {
      await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id);
    } else {
      await fetch(HISTORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "delete", conversationId: id }),
      });
    }
    if (conversationId.current === id) {
      conversationId.current = null;
      setMessages([]);
    }
    fetchConversations();
  }, [user, fetchConversations]);

  // Show welcome popup once
  useEffect(() => {
    const key = "mv_welcome_shown";
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
      localStorage.setItem(key, "true");
    }
  }, []);

  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialSent.current) {
      initialSent.current = true;
      sendMessage(state.initialMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const generateImage = async (prompt: string, referenceImages?: string[], aspectRatio?: string) => {
    setIsLoading(true);
    try {
      if (referenceImages && referenceImages.length > 0) {
        for (const img of referenceImages) {
          if (!img || !img.startsWith("data:image")) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "❌ **Imagem de referência não foi recebida.** Por favor, tente anexar a imagem novamente." },
            ]);
            setIsLoading(false);
            return;
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "🎨 **Gerando imagem…** Isso pode levar alguns segundos." },
      ]);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt, referenceImages, aspectRatio }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: `Erro HTTP ${resp.status}` }));
        throw new Error(err.error || `Erro ao gerar imagem (${resp.status})`);
      }

      const data = await resp.json();

      if (!data.imageUrl) {
        throw new Error("Nenhuma imagem foi retornada pela API.");
      }

      const hasAnalysis = data.analysis && referenceImages && referenceImages.length > 0;

      setMessages((prev) => {
        const withoutGenerating = prev.slice(0, -1);
        const result: Msg[] = [...withoutGenerating];

        if (hasAnalysis) {
          result.push({
            role: "assistant",
            content: "🔍 **Análise da imagem de referência concluída.**",
            analysis: data.analysis,
          });
        }

        result.push({
          role: "assistant",
          content: `🎨 **Imagem gerada${hasAnalysis ? " usando sua referência" : ""}!**`,
          imageUrl: data.imageUrl,
        });

        saveConversation(result);
        return result;
      });
    } catch (e: any) {
      console.error("[Chat] Image generation error:", e);
      const errorMsg = e.name === "AbortError"
        ? "⏱️ **Tempo limite atingido** (60s). A geração demorou demais."
        : `❌ **Falha ao gerar a imagem:** ${e.message}`;

      setMessages((prev) => {
        const withoutGenerating = prev[prev.length - 1]?.content?.includes("Gerando imagem")
          ? prev.slice(0, -1)
          : prev;
        return [
          ...withoutGenerating,
          {
            role: "assistant",
            content: errorMsg,
            retryPrompt: prompt,
            retryRefs: referenceImages,
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryImageGeneration = (prompt: string, refs?: string[]) => {
    generateImage(prompt, refs);
  };

  const sendMessage = async (input: string, attachments?: ChatAttachment[]) => {
    const attachmentPreviews: string[] = [];
    const imageBase64List: string[] = [];

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.type === "image") {
          const base64 = await fileToBase64(att.file);
          attachmentPreviews.push(att.preview);
          imageBase64List.push(base64);
        }
      }
    }

    const userMsg: Msg = {
      role: "user",
      content: input,
      attachments: attachmentPreviews.length > 0 ? attachmentPreviews : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);

    const hasImages = imageBase64List.length > 0;
    const triggerMatch = isImageRequest(input, hasImages);

    if (hasImages || triggerMatch) {
      const detectedRatio = detectAspectRatio(input);
      await generateImage(input, hasImages ? imageBase64List : undefined, detectedRatio);
      return;
    }

    setIsLoading(true);
    let assistantSoFar = "";

    try {
      const lastUserContent = input;

      const apiMessages = [
        { role: "user" as const, content: lastUserContent },
      ];

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Erro ao conectar com o assistente");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Stateless: no longer saving conversation history
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    handleNewChat();
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* Welcome popup */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="glass rounded-2xl p-8 max-w-sm w-full text-center border border-primary/30 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                🎉 Bem-vindo ao MV GPT!
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Você ganhou <span className="text-primary font-bold">100 créditos gratuitos</span> para usar o assistente de IA todos os dias!
              </p>
              <p className="text-xs text-muted-foreground/70 mb-6">
                Seus créditos são renovados diariamente. Aproveite!
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan w-full"
              >
                Começar a usar! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeId={conversationId.current}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onRename={handleRename}
          onDelete={handleDelete}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <h1 className="font-display text-sm font-semibold text-primary text-glow-cyan">
              Assistente Inteligente
            </h1>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Chat
              </button>
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-border/50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <img src={chatLogo} alt="Mente Variável" className="w-20 h-20 rounded-full mb-4 glow-cyan" />
                <h2 className="font-display text-lg font-bold text-foreground mb-2">
                  Assistente Inteligente
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  Seu assistente de IA em tempo real. Pergunte sobre notícias, esportes, câmbio, eventos recentes ou diga <span className="text-primary font-medium">"gere uma imagem de..."</span> para criar imagens! 🎨
                </p>

                <div className="w-full max-w-md space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">Dicas de uso</span>
                  </div>
                  {tips.map((tip) => (
                    <div key={tip} className="glass rounded-lg px-4 py-2.5 text-xs text-muted-foreground text-left">
                      {tip}
                    </div>
                  ))}
                </div>

              </motion.div>
            )}
            {messages.map((msg, i) => (
              <div key={i}>
                <ChatMessage role={msg.role} content={msg.content} imageUrl={msg.imageUrl} attachments={msg.attachments} />
                {msg.analysis && <ReferenceAnalysis analysis={msg.analysis} />}
                {msg.retryPrompt && (
                  <div className="mt-2 ml-11">
                    <button
                      onClick={() => retryImageGeneration(msg.retryPrompt!, msg.retryRefs)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      🔄 Tentar novamente
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && !messages.some((m) => m.role === "assistant" && m === messages[messages.length - 1]) && (
              <TypingIndicator />
            )}
          </div>

          <div className="px-4 pb-4 pt-2">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
            <p className="text-center text-xs text-muted-foreground mt-2">
              Assistente Inteligente pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
