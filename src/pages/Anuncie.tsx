import { Link } from "react-router-dom";
import { Check, Mail, Megaphone, ArrowRight, Shield, Star, FileText, Building2, Lock, Eye, MousePointer, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CONTACT_EMAIL = "comercial@klickview.com.br";

const pricingSlots = [
  {
    page: "Ferramentas",
    slots: [
      { position: "Banner Topo", price: "R$ 189,90", desc: "Primeiro elemento visível, máxima exposição" },
      { position: "Inline 1", price: "R$ 149,90", desc: "Entre as ferramentas, alto engajamento" },
      { position: "Inline 2", price: "R$ 139,90", desc: "Posição central, boa visibilidade" },
      { position: "Rodapé", price: "R$ 99,90", desc: "Final da página, exposição complementar" },
    ],
  },
  {
    page: "Blog",
    slots: [
      { position: "Banner Topo", price: "R$ 169,90", desc: "Destaque antes dos artigos" },
      { position: "Inline", price: "R$ 129,90", desc: "Entre os artigos do blog" },
      { position: "Sidebar", price: "R$ 109,90", desc: "Coluna lateral fixa" },
      { position: "Rodapé", price: "R$ 89,90", desc: "Parte inferior da página" },
    ],
  },
  {
    page: "Guias de IA",
    slots: [
      { position: "Banner Topo", price: "R$ 159,90", desc: "Antes da lista de guias" },
      { position: "Inline", price: "R$ 119,90", desc: "Entre os guias" },
      { position: "Rodapé", price: "R$ 89,90", desc: "Final da página de guias" },
    ],
  },
];

const exclusivityRules = [
  "Apenas 1 anunciante por segmento em cada página",
  "Sem concorrência direta no mesmo espaço",
  "Vagas limitadas — máximo de 4 por página",
  "Prioridade para contratos de maior duração",
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
        <section className="container mx-auto px-4 py-16">
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
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Interesse: ${slot.position} - ${group.page}`)}&body=${encodeURIComponent(`Olá! Tenho interesse na posição "${slot.position}" na página ${group.page} (${slot.price}/mês).\n\nEmpresa:\nSite:\nSegmento:\n\nAguardo retorno!`)}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reservar posição
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Plano Vitalício */}
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
                  {/* Benefícios */}
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

                  {/* Requisitos */}
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
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Interesse no Plano Vitalício - Barra de Ferramentas")}&body=${encodeURIComponent("Olá! Tenho interesse no Plano Vitalício com inclusão na Barra de Ferramentas.\n\nDados para análise:\n\nNome da empresa:\nCNPJ:\nRamo de atuação:\nSite:\nDescrição dos serviços:\nContato do responsável:\n\nAguardo retorno!")}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan group shrink-0"
                  >
                    <Mail className="w-4 h-4" />
                    Solicitar análise
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
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
