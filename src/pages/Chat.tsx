import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2, Info, Gift, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import chatLogo from "@/assets/logo.png";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

const IMAGE_TRIGGERS = [
  "gere uma imagem", "gerar imagem", "crie uma imagem", "criar imagem",
  "desenhe", "desenhar", "faça uma imagem", "fazer imagem",
  "generate image", "create image", "draw", "make an image",
  "gere a imagem", "gera uma imagem", "gera imagem",
  "ilustre", "ilustrar", "imagine", "imaginar",
  "ajustar imagem", "ajuste a imagem", "melhorar imagem", "melhore a imagem",
  "trocar fundo", "troque o fundo", "alterar iluminação", "altere a iluminação",
  "editar imagem", "edite a imagem", "modificar imagem", "modifique a imagem",
  "criar ilustração", "crie uma ilustração", "gerar arte", "gere uma arte",
];

function isImageRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return IMAGE_TRIGGERS.some((t) => lower.includes(t));
}

const tips = [
  "Seja específico: quanto mais detalhes, melhor a resposta.",
  "Peça para reformular se a resposta não ficou clara.",
  "Use para estudos, redação, ideias e programação.",
  "Diga 'gere uma imagem de...' para criar imagens com IA! 🎨",
];

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  // Show welcome popup once per user
  useEffect(() => {
    if (user) {
      const key = `mv_welcome_${user.id}`;
      if (!localStorage.getItem(key)) {
        setShowWelcome(true);
        localStorage.setItem(key, "true");
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialSent.current && user) {
      initialSent.current = true;
      sendMessage(state.initialMessage);
      window.history.replaceState({}, document.title);
    }
  }, [user, location.state]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const generateImage = async (prompt: string) => {
    setIsLoading(true);
    try {
      const resp = await fetch(IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Erro ao gerar imagem");
      }

      const data = await resp.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🎨 **Imagem gerada!**\n\n${data.revisedPrompt ? `> ${data.revisedPrompt}` : ""}`,
          imageUrl: data.imageUrl,
        },
      ]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Não foi possível gerar a imagem: ${e.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    if (isImageRequest(input)) {
      await generateImage(input);
      return;
    }

    setIsLoading(true);
    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        }),
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
            <ChatMessage key={i} role={msg.role} content={msg.content} imageUrl={msg.imageUrl} />
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
