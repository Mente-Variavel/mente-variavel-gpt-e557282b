import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Wand2, Layers, DollarSign, ImageOff, CreditCard, Sparkles, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function Index() {
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    navigate("/assistente", { state: { initialMessage: chatInput.trim() } });
    setChatInput("");
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

        {/* Chat rápido */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Assistente Inteligente</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Pergunte qualquer coisa, peça para gerar imagens ou obtenha ajuda com suas tarefas.
                </p>
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite sua pergunta..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!chatInput.trim()}>
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
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-center mb-12"
            >
              Nossas Ferramentas
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.to}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Link
                    to={tool.to}
                    className="group block h-full p-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
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
