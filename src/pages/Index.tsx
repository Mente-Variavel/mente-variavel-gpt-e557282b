import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const Index = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-16 overflow-hidden">
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
            Seu assistente inteligente gratuito para ideias, textos e soluções.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
          >
            Começar a conversar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="container mx-auto px-4 py-20">
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

    <div className="flex-1" />
    <Footer />
  </div>
);

export default Index;
