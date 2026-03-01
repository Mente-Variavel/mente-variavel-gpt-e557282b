import { Link } from "react-router-dom";
import { Check, Mail, Megaphone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CONTACT_EMAIL = "comercial@klickview.com.br";

const plans = [
  {
    name: "Mensal",
    price: "R$ 113,85",
    period: "/mês",
    features: [
      "Banner em 1 posição do site",
      "Link direto para seu site",
      "Relatório mensal de visualizações",
    ],
    highlight: false,
  },
  {
    name: "Trimestral",
    price: "R$ 90,85",
    period: "/mês",
    save: "Economize 20%",
    features: [
      "Banner em até 2 posições",
      "Link direto para seu site",
      "Relatório mensal de visualizações",
      "Destaque na página inicial",
    ],
    highlight: true,
  },
  {
    name: "Semestral",
    price: "R$ 67,85",
    period: "/mês",
    save: "Economize 40%",
    features: [
      "Banner em até 3 posições",
      "Link direto para seu site",
      "Relatório mensal de visualizações",
      "Destaque na página inicial",
      "Menção nos guias de IA",
    ],
    highlight: false,
  },
  {
    name: "Anual",
    price: "R$ 56,35",
    period: "/mês",
    save: "Melhor preço!",
    features: [
      "Banner em todas as posições",
      "Link direto para seu site",
      "Relatório mensal de visualizações",
      "Destaque na página inicial",
      "Menção nos guias e blog",
      "Prioridade na renovação",
    ],
    highlight: false,
  },
];

const Anuncie = () => {
  const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quero anunciar no Mente Variável GPT")}&body=${encodeURIComponent("Olá! Gostaria de saber mais sobre os planos de anúncio no site Mente Variável GPT.\n\nEmpresa:\nSite:\nPlano de interesse:\n\nAguardo retorno!")}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-black text-primary text-glow-cyan mb-4">
              Anuncie no Mente Variável GPT
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
              Alcance milhares de entusiastas de Inteligência Artificial. Divulgue sua empresa, produto ou serviço para um público engajado e qualificado.
            </p>
            <a
              href={mailtoLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
            >
              <Mail className="w-4 h-4" />
              Entrar em contato
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </section>

        {/* Plans */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Planos de Anúncio
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-xl p-6 flex flex-col relative ${
                  plan.highlight ? "border-primary/50 ring-1 ring-primary/30" : ""
                }`}
              >
                {plan.save && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.save}
                  </span>
                )}
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-black text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Interesse no plano ${plan.name} - Mente Variável GPT`)}&body=${encodeURIComponent(`Olá! Tenho interesse no plano ${plan.name} (${plan.price}${plan.period}).\n\nEmpresa:\nSite:\n\nAguardo retorno!`)}`}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Quero este plano
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 md:p-16 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Quer uma proposta personalizada?
            </h2>
            <p className="text-foreground/70 max-w-xl mx-auto mb-8">
              Entre em contato diretamente pelo email e montamos um plano sob medida para sua empresa.
            </p>
            <a
              href={mailtoLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
            >
              <Mail className="w-4 h-4" />
              {CONTACT_EMAIL}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Anuncie;
