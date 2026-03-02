import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield, Brain, BookOpen, MessageSquare, Lightbulb, Users, TrendingUp, Send, Mic, MicOff, Paperclip, X, FileText } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import AudioVisualizer from "@/components/AudioVisualizer";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

const features = [
  {
    icon: Sparkles,
    title: "Criatividade Ilimitada",
    desc: "Gere ideias, textos, roteiros e soluções criativas para qualquer projeto.",
  },
  {
    icon: Zap,
    title: "Respostas Instantâneas",
    desc: "Assistente rápido e inteligente, pronto para ajudar em tempo real.",
  },
  {
    icon: Shield,
    title: "Gratuito e Seguro",
    desc: "Use sem custo. Seus dados são protegidos e nunca compartilhados.",
  },
];

const useCases = [
  { icon: BookOpen, title: "Estudos", desc: "Resumos, explicações e materiais de estudo personalizados." },
  { icon: MessageSquare, title: "Redação", desc: "E-mails, artigos, posts e textos profissionais." },
  { icon: Lightbulb, title: "Ideias", desc: "Brainstorming e soluções criativas para seus projetos." },
  { icon: Brain, title: "Programação", desc: "Ajuda com código, debugging e aprendizado de programação." },
];

const benefits = [
  { icon: Users, title: "Acessível a todos", desc: "Qualquer pessoa pode usar, sem necessidade de conhecimentos técnicos." },
  { icon: TrendingUp, title: "Aumenta produtividade", desc: "Realize em minutos tarefas que levariam horas." },
  { icon: Shield, title: "Privacidade garantida", desc: "Seus dados são protegidos e nunca compartilhados com terceiros." },
  { icon: Zap, title: "Sempre disponível", desc: "Acesse 24 horas por dia, 7 dias por semana, de qualquer dispositivo." },
];

interface QuickAttachment {
  file: File;
  preview: string;
  type: "image" | "file";
}

const Index = () => {
  const [quickMsg, setQuickMsg] = useState("");
  const [quickAttachments, setQuickAttachments] = useState<QuickAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isListening, transcript, isSupported, mediaStream, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setQuickMsg(transcript);
  }, [transcript]);

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (quickAttachments.length >= 5) return;
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : "";
      setQuickAttachments((prev) => [...prev, { file, preview, type: isImage ? "image" : "file" }]);
    });
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setQuickAttachments((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleQuickSend = () => {
    const trimmed = quickMsg.trim();
    if (!trimmed && quickAttachments.length === 0) return;
    // Pass attachments via state to the chat page
    navigate("/assistente", {
      state: {
        initialMessage: trimmed || "Analise os arquivos anexados.",
        initialAttachments: quickAttachments.map((a) => ({
          name: a.file.name,
          type: a.type,
          preview: a.preview,
        })),
      },
    });
  };

  return (
  <div className="flex flex-col min-h-screen">
    <Navbar />

    <div className="pt-16" />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 md:py-36 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img src={logo} alt="Mente Variável GPT" className="w-28 h-28 mx-auto mb-6 rounded-full glow-cyan" />
          <h1 className="font-display text-4xl md:text-6xl font-black text-primary text-glow-cyan mb-6 leading-tight">
            Mente Variável GPT
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Seu assistente inteligente gratuito para ideias, textos, estudos e soluções com Inteligência Artificial.
          </p>
          <Link
            to="/assistente"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group mb-8"
          >
            Usar o Assistente
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick chat input */}
          <div className="max-w-xl mx-auto w-full">
            {/* Attachment previews */}
            {quickAttachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap justify-center">
                {quickAttachments.map((att, i) => (
                  <div key={i} className="relative group">
                    {att.type === "image" ? (
                      <img src={att.preview} alt={att.file.name} className="w-14 h-14 rounded-lg object-cover border border-border/50" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg border border-border/50 bg-secondary flex flex-col items-center justify-center gap-1 p-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[7px] text-muted-foreground truncate w-full text-center">{att.file.name.split(".").pop()?.toUpperCase()}</span>
                      </div>
                    )}
                    <button onClick={() => removeAttachment(i)} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />

            <div className="glass rounded-xl p-2 flex items-center gap-2 border border-border/50">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-lg transition-all shrink-0 bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80"
                title="Anexar arquivo"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={quickMsg}
                onChange={(e) => setQuickMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickSend()}
                placeholder="Pergunte algo à IA..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground px-3 py-2"
              />
              {isSupported && (
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-lg transition-all shrink-0 ${
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80"
                  }`}
                  title={isListening ? "Parar de ouvir" : "Falar"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={handleQuickSend}
                disabled={!quickMsg.trim() && quickAttachments.length === 0}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all glow-cyan shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {isListening && (
              <AudioVisualizer stream={mediaStream} isActive={isListening} barCount={32} className="rounded-lg mt-2" />
            )}
            <p className="text-xs text-muted-foreground/60 mt-2">
              {isListening ? "Falando... clique no microfone para parar" : "Pressione Enter ou clique no botão para iniciar o chat"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>

    {/* What is */}
    <section className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
          O que é o Mente Variável GPT?
        </h2>
        <p className="text-foreground/70 leading-relaxed mb-4">
          O Mente Variável GPT é uma plataforma gratuita de Inteligência Artificial que combina um assistente de chat avançado com conteúdo educacional sobre IA. Nossa missão é democratizar o acesso à inteligência artificial, oferecendo uma ferramenta poderosa e intuitiva em português brasileiro.
        </p>
        <p className="text-foreground/70 leading-relaxed">
          Seja para estudar, criar conteúdo, programar ou simplesmente explorar o potencial da IA, o Mente Variável GPT está aqui para ajudar — sempre gratuitamente.
        </p>
      </motion.div>
    </section>

    

    {/* How it helps */}
    <section className="container mx-auto px-4 py-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
        Como o assistente pode te ajudar
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {useCases.map((uc, i) => (
          <motion.div
            key={uc.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-6 hover:border-primary/30 transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <uc.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground mb-2">{uc.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="container mx-auto px-4 py-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
        Por que escolher o Mente Variável GPT
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-xl p-6 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    

    {/* Benefits */}
    <section className="container mx-auto px-4 py-20">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
        Benefícios da Inteligência Artificial
      </h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 glass rounded-xl p-6"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <b.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-10 md:p-16 text-center"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
          Pronto para experimentar?
        </h2>
        <p className="text-foreground/70 max-w-xl mx-auto mb-8">
          Comece agora mesmo a usar o assistente de IA gratuito do Mente Variável GPT. Sem cadastro obrigatório, sem custos.
        </p>
        <Link
          to="/assistente"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
        >
          Usar o Assistente
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>

    <Footer />
  </div>
  );
};

export default Index;
