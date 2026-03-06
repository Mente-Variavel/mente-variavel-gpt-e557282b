import { useState } from "react";
import { Check, Megaphone, ArrowRight, Shield, Star, FileText, Building2, Lock, Eye, MousePointer, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlanForm from "@/components/AdPlanForm";

const pricingSlots = [
  {
    page: "Ferramentas",
    slots: [
      { position: "Banner Topo", price: "R$ 189,90", priceNum: "189.90", desc: "Primeiro elemento visível, máxima exposição" },
      { position: "Rodapé", price: "R$ 99,90", priceNum: "99.90", desc: "Final da página, exposição complementar" },
    ],
  },
  {
    page: "Blog",
    slots: [
      { position: "Banner Topo", price: "R$ 169,90", priceNum: "169.90", desc: "Destaque antes dos artigos" },
      { position: "Inline", price: "R$ 129,90", priceNum: "129.90", desc: "Entre os artigos do blog" },
      { position: "Sidebar", price: "R$ 109,90", priceNum: "109.90", desc: "Coluna lateral fixa" },
      { position: "Rodapé", price: "R$ 89,90", priceNum: "89.90", desc: "Parte inferior da página" },
    ],
  },
  {
    page: "Guias de IA",
    slots: [
      { position: "Banner Topo", price: "R$ 159,90", priceNum: "159.90", desc: "Antes da lista de guias" },
      { position: "Inline", price: "R$ 119,90", priceNum: "119.90", desc: "Entre os guias" },
      { position: "Rodapé", price: "R$ 89,90", priceNum: "89.90", desc: "Final da página de guias" },
    ],
  },
];

const exclusivityRules = [
  "Apenas 1 anunciante por segmento em cada página",
  "Sem concorrência direta no mesmo espaço",
  "Vagas limitadas — máximo de 4 por página",
  "Prioridade para contratos de maior duração",
];

export interface SelectedPlan {
  label: string;
  price: string;
  priceNum: string;
  details: string;
}

const Anuncie = () => {
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);

  const openForm = (plan: SelectedPlan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      document.getElementById("ad-plan-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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
            <button
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
            >
              <Megaphone className="w-4 h-4" />
              Ver planos e contratar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </section>

        {/* Exclusividade */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 md:p-10 max-w-4xl mx-auto border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Exclusividade Garantida
              </h2>
            </div>
            <p className="text-foreground/70 mb-6">
              Diferente de plataformas convencionais, nossos espaços são <strong className="text-foreground">limitados e exclusivos</strong>. 
              Isso garante que seu anúncio receba atenção real, sem competir com dezenas de outros.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {exclusivityRules.map((rule) => (
                <div key={rule} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  {rule}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Tabela de Preços por Posição */}
        <section id="pricing" className="container mx-auto px-4 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Valores por Posição
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Cada posição tem um preço mensal fixo. Quanto maior a visibilidade, maior o investimento — e o retorno.
          </p>

          <div className="max-w-5xl mx-auto space-y-10">
            {pricingSlots.map((group, gi) => (
              <motion.div
                key={group.page}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.1 }}
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  Página: {group.page}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.slots.map((slot, si) => (
                    <div
                      key={slot.position}
                      className={`glass rounded-xl p-5 flex flex-col border ${
                        si === 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-border/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {si === 0 ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <MousePointer className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-semibold text-foreground">{slot.position}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 flex-1">{slot.desc}</p>
                      <div className="mb-3">
                        <span className="text-2xl font-black text-primary">{slot.price}</span>
                        <span className="text-xs text-muted-foreground">/mês</span>
                      </div>
                      <button
                        onClick={() => openForm({
                          label: `${slot.position} — ${group.page}`,
                          price: slot.price,
                          priceNum: slot.priceNum,
                          details: `Posição: ${slot.position} | Página: ${group.page}`,
                        })}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs transition-all"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        Contratar posição
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Ferramenta Patrocinada */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass rounded-2xl p-8 md:p-12 border border-accent/30 ring-1 ring-accent/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <LayoutGrid className="w-6 h-6 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">Novo</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Ferramenta Patrocinada
                </h2>
                <p className="text-foreground/70 max-w-2xl mb-8">
                  Sua ferramenta ou serviço listado <strong className="text-foreground">junto com as ferramentas gratuitas</strong> do site, 
                  com selo de parceiro e link direto para sua plataforma. Ideal para empresas de tecnologia que oferecem SaaS, geradores de conteúdo, 
                  editores de imagem/vídeo e ferramentas similares.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="glass rounded-xl p-6 border border-border/50">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">Plano Mensal</h3>
                    <div className="mb-3">
                      <span className="text-2xl font-black text-primary">R$ 129,90</span>
                      <span className="text-xs text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Cancele quando quiser. Sem fidelidade.</p>
                    <button
                      onClick={() => openForm({
                        label: "Ferramenta Patrocinada — Mensal",
                        price: "R$ 129,90",
                        priceNum: "129.90",
                        details: "Ferramenta Patrocinada na página de Ferramentas (mensal)",
                      })}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs transition-all"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      Contratar mensal
                    </button>
                  </div>
                  <div className="glass rounded-xl p-6 border border-primary/40 ring-1 ring-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">Plano Vitalício</h3>
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <div className="mb-3">
                      <span className="text-2xl font-black text-primary">R$ 3.499,90</span>
                      <span className="text-xs text-muted-foreground"> único</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Equivalente a ~27 meses. Sua ferramenta para sempre no site.</p>
                    <button
                      onClick={() => openForm({
                        label: "Ferramenta Patrocinada — Vitalício",
                        price: "R$ 3.499,90",
                        priceNum: "3499.90",
                        details: "Ferramenta Patrocinada na página de Ferramentas (vitalício)",
                      })}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      Contratar vitalício
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  * O serviço/ferramenta deve ser relacionado a tecnologia (IA, produtividade, desenvolvimento, design, etc.). Sujeito a análise.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Plano Vitalício — Barra de Ferramentas */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass rounded-2xl p-8 md:p-12 border border-primary/30 ring-1 ring-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Exclusivo</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Plano Vitalício — Barra de Ferramentas
                </h2>
                <p className="text-foreground/70 max-w-2xl mb-8">
                  Sua empresa permanentemente na nossa <strong className="text-foreground">Barra de Ferramentas</strong>, 
                  visível em todas as páginas do site. Um espaço premium reservado para empresas do setor de tecnologia.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" /> O que está incluso
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Inclusão vitalícia na Barra de Ferramentas",
                        "Link direto para o site da empresa",
                        "Ícone personalizado com identidade visual",
                        "Visibilidade em todas as páginas do site",
                        "Menção nos guias e conteúdos do blog",
                        "Prioridade máxima no suporte",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                          <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" /> Requisitos e análise
                    </h3>
                    <div className="space-y-3 text-sm text-foreground/80">
                      <p>
                        Por se tratar de um espaço premium e vitalício, a inclusão na Barra de Ferramentas 
                        passa por uma <strong className="text-foreground">análise de compatibilidade</strong>. 
                        Aceitamos exclusivamente empresas do segmento de tecnologia:
                      </p>
                      <ul className="space-y-2 ml-1">
                        {[
                          "Provedores de internet e telecomunicações",
                          "Empresas de software e SaaS",
                          "Consultorias de TI e segurança digital",
                          "Startups e ferramentas de IA",
                          "Agências de marketing digital e desenvolvimento",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Building2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-muted-foreground italic text-xs mt-3">
                        Empresas fora do segmento de tecnologia (varejo, alimentação, etc.) não são elegíveis para este plano.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documentos necessários */}
                <div className="rounded-xl border border-border/50 bg-card/30 p-6 mb-8">
                  <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Para análise, envie:
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      "Nome da empresa e CNPJ",
                      "Ramo de atuação detalhado",
                      "Site oficial da empresa",
                      "Breve descrição dos serviços",
                      "Logo em alta resolução (PNG/SVG)",
                      "Contato do responsável",
                    ].map((doc) => (
                      <span key={doc} className="flex items-center gap-2 text-sm text-foreground/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preço e CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-2xl font-black text-primary">Valor sob consulta</span>
                    <p className="text-xs text-muted-foreground mt-1">O valor é definido após a análise de compatibilidade</p>
                  </div>
                  <button
                    onClick={() => openForm({
                      label: "Plano Vitalício — Barra de Ferramentas",
                      price: "Sob consulta",
                      priceNum: "",
                      details: "Plano Vitalício com inclusão na Barra de Ferramentas (sujeito a análise)",
                    })}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group shrink-0"
                  >
                    <Megaphone className="w-4 h-4" />
                    Solicitar análise
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Formulário de contratação */}
        <AnimatePresence>
          {selectedPlan && (
            <section id="ad-plan-form" className="container mx-auto px-4 py-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="max-w-2xl mx-auto"
              >
                <AdPlanForm plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
              </motion.div>
            </section>
          )}
        </AnimatePresence>

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
              Preencha o formulário acima ou entre em contato diretamente pelo email.
            </p>
            <a
              href="mailto:comercial@klickviews.com?subject=Quero%20anunciar%20no%20Mente%20Vari%C3%A1vel%20GPT"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group"
            >
              <Megaphone className="w-4 h-4" />
              comercial@klickviews.com
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
