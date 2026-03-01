import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield, Brain, BookOpen, MessageSquare, Lightbulb, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
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

const Index = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />

    {/* Ad Banner Top */}
    <div className="pt-16">
      <AdPlaceholder format="banner" className="container mx-auto px-4 mt-4" />
    </div>

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
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
          >
            Usar o Assistente
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
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

    <AdPlaceholder format="inline" className="container mx-auto px-4" />

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

    <AdPlaceholder format="inline" className="container mx-auto px-4" />

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

    <AdPlaceholder format="footer" className="container mx-auto px-4 mb-8" />

    <Footer />
  </div>
);

export default Index;
