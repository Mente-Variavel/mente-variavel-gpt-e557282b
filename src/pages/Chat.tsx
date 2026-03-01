import { useRef, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import Navbar from "@/components/Navbar";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chat = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Erro ao conectar com o assistente");
      }

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
      <div className="flex-1 flex flex-col pt-16 max-w-3xl mx-auto w-full">
        {/* Header actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h1 className="font-display text-sm font-semibold text-primary text-glow-cyan">
            Mente Variável GPT
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

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 glow-cyan">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="font-display text-lg font-bold text-foreground mb-2">
                Olá! Sou o Mente Variável GPT
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Seu assistente inteligente gratuito. Pergunte qualquer coisa sobre ideias, textos, código ou soluções criativas.
              </p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && !messages.some((m) => m.role === "assistant" && m === messages[messages.length - 1]) && (
            <TypingIndicator />
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
          <p className="text-center text-xs text-muted-foreground mt-2">
            Mente Variável GPT pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
