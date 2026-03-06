import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Trash2, Info, Gift, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import type { ChatAttachment } from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import Navbar from "@/components/Navbar";
import chatLogo from "@/assets/logo.png";

import ReferenceAnalysis, { type AnalysisData } from "@/components/ReferenceAnalysis";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; attachments?: string[]; analysis?: AnalysisData; retryPrompt?: string; retryRefs?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

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
];

// If user attached images, also check these lighter triggers
const IMAGE_WITH_ATTACHMENT_TRIGGERS = [
  "camiseta", "camisa", "caneca", "boné", "adesivo", "banner", "cartão",
  "logo", "imagem", "foto", "design", "arte", "produto", "capa",
  "poster", "cartaz", "flyer", "panfleto", "embalagem",
  "t-shirt", "shirt", "mug", "cup", "sticker",
];

function isImageRequest(text: string, hasAttachments: boolean): boolean {
  const lower = text.toLowerCase();
  if (IMAGE_TRIGGERS.some((t) => lower.includes(t))) return true;
  // If user attached images, use lighter triggers — they likely want image generation
  if (hasAttachments && IMAGE_WITH_ATTACHMENT_TRIGGERS.some((t) => lower.includes(t))) return true;
  return false;
}

const tips = [
  "Seja específico: quanto mais detalhes, melhor a resposta.",
  "Peça para reformular se a resposta não ficou clara.",
  "Use para estudos, redação, ideias e programação.",
  "Diga 'gere uma imagem de...' para criar imagens com IA! 🎨",
  "Anexe imagens como referência usando o clipe 📎",
];

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
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

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

  const generateImage = async (prompt: string, referenceImages?: string[]) => {
    setIsLoading(true);
    try {
      // Validate references before sending
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

      // Show generating state
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "🎨 **Gerando imagem…** Isso pode levar alguns segundos." },
      ]);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const resp = await fetch(IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt, referenceImages }),
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

      // Remove the "generating" message and add the real results
      setMessages((prev) => {
        const withoutGenerating = prev.slice(0, -1); // remove "Gerando imagem…"
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

        return result;
      });
    } catch (e: any) {
      console.error("[Chat] Image generation error:", e);
      const errorMsg = e.name === "AbortError"
        ? "⏱️ **Tempo limite atingido** (60s). A geração demorou demais."
        : `❌ **Falha ao gerar a imagem:** ${e.message}`;

      // Remove the "generating" message and add error with retry
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
    // Convert attachments to base64 previews for display
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

    console.log("[Chat] sendMessage called, input:", input, "attachments:", attachments?.length ?? 0, "imageBase64List:", imageBase64List.length);

    const userMsg: Msg = {
      role: "user",
      content: input,
      attachments: attachmentPreviews.length > 0 ? attachmentPreviews : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);

    const hasImages = imageBase64List.length > 0;
    const triggerMatch = isImageRequest(input, hasImages);

    // CRITICAL: If user attached images, ALWAYS route to image generation
    if (hasImages || triggerMatch) {
      console.log("[Chat] Routing to image generation. hasImages:", hasImages, "triggerMatch:", triggerMatch, "refImages count:", imageBase64List.length);
      await generateImage(input, hasImages ? imageBase64List : undefined);
      return;
    }

    setIsLoading(true);
    let assistantSoFar = "";

    try {
      // No images here (they were routed to generateImage above)
      const lastUserContent = input;

      const apiMessages = [
        ...messages.map(({ role, content }) => ({ role, content })),
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

      <div className="flex-1 flex flex-col pt-16 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h1 className="font-display text-sm font-semibold text-primary text-glow-cyan">
            Assistente Inteligente
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Chat
            </button>
            <button
              onClick={() => setMessages([])}
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

              <div className="glass rounded-lg px-4 py-3 max-w-md">
                <p className="text-xs text-muted-foreground/70">
                  ⚠️ O assistente pode não possuir informações em tempo real. As respostas geradas podem conter limitações e não substituem aconselhamento profissional.
                </p>
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
  );
};

export default Chat;
