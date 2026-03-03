import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Wand2, Layers, DollarSign, ImageOff, CreditCard, Sparkles, Send, MessageSquare, Mic, MicOff, Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import AudioVisualizer from "@/components/AudioVisualizer";

const tools = [
  { icon: TrendingUp, title: "Educação Financeira", desc: "Simuladores, quizzes e artigos para dominar suas finanças.", to: "/financas/educacao", color: "text-accent" },
  { icon: DollarSign, title: "Controle de Gastos", desc: "Dashboard interativo para gerenciar receitas e despesas.", to: "/financas/controle", color: "text-primary" },
  { icon: Layers, title: "Conversor de Moedas", desc: "Converta entre BRL, USD, EUR, GBP, JPY e BTC em tempo real.", to: "/financas/conversor", color: "text-accent" },
  { icon: ImageOff, title: "Removedor de Fundo", desc: "Remova o fundo de qualquer imagem com um clique.", to: "/servicos/removedor-fundo", color: "text-primary" },
  { icon: Layers, title: "Gerador de Slides & E-book", desc: "Crie apresentações e e-books estruturados com IA.", to: "/servicos/gerador-slides", color: "text-accent" },
  { icon: CreditCard, title: "Pix Checkout", desc: "Gere cobranças via Pix com QR Code e link compartilhável.", to: "/servicos/pix-checkout", color: "text-primary" },
  { icon: Wand2, title: "Criador de Prompt", desc: "Gere prompts profissionais com frameworks avançados.", to: "/criador-prompt", color: "text-accent" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

interface HomeAttachment {
  file: File;
  preview: string;
  type: "image" | "file";
}

export default function Index() {
  const [chatInput, setChatInput] = useState("");
  const [attachments, setAttachments] = useState<HomeAttachment[]>([]);
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, isSupported, error: micError, mediaStream, startListening, stopListening, cancelListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && transcript !== "Transcrevendo...") setChatInput(transcript);
  }, [transcript]);

  const handleChatSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() && attachments.length === 0) return;
    if (isListening) stopListening();
    navigate("/assistente", { state: { initialMessage: chatInput.trim(), attachments } });
    setChatInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleTextareaInput = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 100) + "px"; }
  };

  const toggleMic = () => { isListening ? stopListening() : startListening(); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (attachments.length >= 5) return;
      const isImage = file.type.startsWith("image/");
      setAttachments((prev) => [...prev, { file, preview: isImage ? URL.createObjectURL(file) : "", type: isImage ? "image" : "file" }]);
    });
    e.target.value = "";
  };

  const removeAttachment = (i: number) => {
    setAttachments((prev) => {
      const removed = prev[i];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-xl sm:text-2xl font-bold text-primary text-glow-cyan mb-3">
                Mente Variável GPT
              </h2>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Plataforma Inteligente
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
                Plataforma Brasileira de Ferramentas com{" "}
                <span className="text-primary text-glow-cyan">Inteligência Artificial</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Soluções práticas para produtividade, finanças e criação de conteúdo.
              </p>
              <Button asChild size="lg" className="glow-cyan text-base px-8">
                <a href="#ferramentas">
                  Explorar Ferramentas <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Chat rápido com mic + anexos */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Assistente Inteligente</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Pergunte qualquer coisa, peça para gerar imagens ou obtenha ajuda com suas tarefas.
                </p>

                {/* Mic error */}
                <AnimatePresence>
                  {micError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-destructive mb-2">
                      {micError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Audio visualizer */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Ouvindo...
                        </span>
                        <button onClick={() => { cancelListening(); setChatInput(""); }} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                      <AudioVisualizer stream={mediaStream} isActive={isListening} barCount={32} className="rounded-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attachment previews */}
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2 mb-3 flex-wrap">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative group">
                          {att.type === "image" ? (
                            <img src={att.preview} alt={att.file.name} className="w-14 h-14 rounded-lg object-cover border border-border/50" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg border border-border/50 bg-secondary flex flex-col items-center justify-center gap-1 p-1">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-[7px] text-muted-foreground truncate w-full text-center">{att.file.name.split(".").pop()?.toUpperCase()}</span>
                            </div>
                          )}
                          <button onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input row */}
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />
                <form onSubmit={handleChatSubmit} className="flex items-end gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all shrink-0" title="Anexar arquivo">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleTextareaInput}
                    placeholder="Digite sua pergunta..."
                    rows={1}
                    className="flex-1 bg-secondary/50 rounded-lg resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 max-h-[100px] border border-border/50 focus:border-primary/40 transition-colors"
                  />
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`p-2.5 rounded-lg transition-all shrink-0 ${isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80"}`}
                      title={isListening ? "Parar de ouvir" : "Falar"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  <Button type="submit" size="icon" disabled={!chatInput.trim() && attachments.length === 0} className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="ferramentas" className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Nossas Ferramentas
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {tools.map((tool, i) => (
                <motion.div key={tool.to} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Link to={tool.to} className="group block h-full p-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <tool.icon className={`w-8 h-8 mb-4 ${tool.color}`} />
                    <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pronto para aumentar sua produtividade?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Explore todas as ferramentas gratuitamente e descubra como a IA pode transformar seu dia a dia.
              </p>
              <Button asChild size="lg">
                <Link to="/criador-prompt">
                  Começar Agora <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
