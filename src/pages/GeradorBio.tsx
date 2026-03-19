import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Crown, Sparkles, Loader2, Check, Instagram, Hash, Type, Subtitles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoMv3 from "@/assets/logo-mv3.png";
import { Link } from "react-router-dom";

const profileTypes = ["Empresa", "Profissional", "Loja", "Criador de Conteúdo", "Perfil Pessoal"];
const bioStyles = ["Profissional", "Criativa", "Comercial", "Moderna", "Elegante", "Simples"];

interface BioResult {
  mainBio: string;
  alternativeBios: string[];
  suggestedUsername: string;
  ctaLine: string;
  highlights: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function GeradorBio() {
  const [businessName, setBusinessName] = useState("");
  const [profileType, setProfileType] = useState("Empresa");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");
  const [style, setStyle] = useState("Profissional");
  const [useEmojis, setUseEmojis] = useState(true);
  const [useCTA, setUseCTA] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BioResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copiado!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    const full = `Bio Principal:\n${result.mainBio}\n\nAlternativa 1:\n${result.alternativeBios[0]}\n\nAlternativa 2:\n${result.alternativeBios[1]}\n\nUsername: ${result.suggestedUsername}\n\nCTA: ${result.ctaLine}\n\nDestaques:\n${result.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
    navigator.clipboard.writeText(full);
    toast.success("Tudo copiado!");
  };

  const handleGenerate = async () => {
    if (!businessName.trim() || !niche.trim()) {
      toast.error("Preencha o nome do negócio e o nicho.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bio", {
        body: { businessName: businessName.trim(), profileType, niche: niche.trim(), city: city.trim(), style, useEmojis, useCTA },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as BioResult);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar bio.");
    } finally {
      setLoading(false);
    }
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button onClick={() => copyText(text, id)} className="p-1.5 rounded-md hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-primary" title="Copiar">
      {copiedKey === id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );

  const Chip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selected ? "bg-primary/20 border-primary text-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
      {label}
    </button>
  );

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(true)} className={`px-3 py-1 rounded-l-md text-xs font-semibold transition-all border ${value ? "bg-primary/20 border-primary text-primary" : "border-border/50 text-muted-foreground"}`}>Sim</button>
        <button onClick={() => onChange(false)} className={`px-3 py-1 rounded-r-md text-xs font-semibold transition-all border ${!value ? "bg-primary/20 border-primary text-primary" : "border-border/50 text-muted-foreground"}`}>Não</button>
      </div>
    </div>
  );

  const otherTools = [
    { to: "/produtos/gerador-legendas", icon: Subtitles, title: "Gerador de Legendas", desc: "Crie legendas automáticas para vídeos" },
    { to: "/servicos/criador-prompt", icon: Type, title: "Criador de Títulos & Prompts", desc: "Gere títulos e prompts criativos com IA" },
    { to: "/ferramentas", icon: Hash, title: "Mais Ferramentas IA", desc: "Explore todas as ferramentas gratuitas" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gerador de Bio para Instagram Profissional",
    url: "https://mente-variavel-gpt.lovable.app/produtos/gerador-bio",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    description: "Crie bios profissionais para Instagram com inteligência artificial. Grátis e em português.",
  };

  return (
    <>
      <Helmet>
        <html lang="pt-BR" />
        <title>Gerador de Bio para Instagram Profissional (Grátis) | Mente Variável</title>
        <meta name="description" content="Crie bios profissionais para Instagram com IA. Ideal para empresas, criadores e lojas. 100% grátis, rápido e em português brasileiro." />
        <link rel="canonical" href="https://mente-variavel-gpt.lovable.app/produtos/gerador-bio" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-10">
            <img src={logoMv3} alt="Mente Variável" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.3)]" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Gerador de Bio para <span className="text-primary text-glow-cyan">Instagram</span> Profissional
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Crie bios profissionais para Instagram com IA. Ideal para empresas, criadores e lojas que querem atrair mais seguidores e clientes.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> 100% Grátis • Powered by AI
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="glass rounded-2xl p-6 border border-border/50 mb-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do negócio ou perfil *</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: Studio Bella Hair" className="w-full h-10 rounded-lg border border-border/50 bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tipo de perfil</label>
              <div className="flex flex-wrap gap-2">
                {profileTypes.map((t) => <Chip key={t} label={t} selected={profileType === t} onClick={() => setProfileType(t)} />)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nicho ou profissão *</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Ex: Cabeleireira, Marketing Digital" className="w-full h-10 rounded-lg border border-border/50 bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Cidade ou região (opcional)</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: São Paulo - SP" className="w-full h-10 rounded-lg border border-border/50 bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Estilo da bio</label>
              <div className="flex flex-wrap gap-2">
                {bioStyles.map((s) => <Chip key={s} label={s} selected={style === s} onClick={() => setStyle(s)} />)}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Toggle label="Incluir emojis?" value={useEmojis} onChange={setUseEmojis} />
              <Toggle label="Incluir CTA?" value={useCTA} onChange={setUseCTA} />
            </div>

            <button onClick={handleGenerate} disabled={loading} className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><Instagram className="w-4 h-4" /> Gerar Bio Profissional</>}
            </button>
          </motion.div>

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-12">
              {/* Main Bio */}
              <div className="glass rounded-xl p-5 border border-primary/40 relative">
                <div className="absolute -top-3 left-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                  <Crown className="w-3 h-3" /> Recomendada
                </div>
                <p className="text-foreground text-sm mt-2 leading-relaxed">{result.mainBio}</p>
                <div className="flex justify-end mt-2"><CopyBtn text={result.mainBio} id="main" /></div>
              </div>

              {/* Alternative bios */}
              {result.alternativeBios.map((bio, i) => (
                <div key={i} className="glass rounded-xl p-4 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Alternativa {i + 1}</p>
                  <p className="text-foreground text-sm leading-relaxed">{bio}</p>
                  <div className="flex justify-end mt-2"><CopyBtn text={bio} id={`alt-${i}`} /></div>
                </div>
              ))}

              {/* Username */}
              <div className="glass rounded-xl p-4 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-0.5">Username sugerido</p>
                  <p className="text-primary font-semibold text-sm">{result.suggestedUsername}</p>
                </div>
                <CopyBtn text={result.suggestedUsername} id="user" />
              </div>

              {/* CTA */}
              <div className="glass rounded-xl p-4 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-0.5">CTA sugerido</p>
                  <p className="text-foreground text-sm">{result.ctaLine}</p>
                </div>
                <CopyBtn text={result.ctaLine} id="cta" />
              </div>

              {/* Highlights */}
              <div className="glass rounded-xl p-4 border border-border/50">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Ideias de Destaques do Instagram</p>
                <div className="space-y-2">
                  {result.highlights.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-foreground text-sm">📌 {h}</span>
                      <CopyBtn text={h} id={`hl-${i}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={copyAll} className="flex-1 h-10 rounded-lg border border-primary/50 text-primary font-semibold text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copiar tudo
                </button>
                <button onClick={handleGenerate} disabled={loading} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  <Sparkles className="w-4 h-4" /> Gerar novas variações
                </button>
              </div>
            </motion.div>
          )}

          {/* Other tools */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="mb-12">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 text-center">Outras ferramentas do <span className="text-primary">Mente Variável</span></h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {otherTools.map((tool) => (
                <Link key={tool.to} to={tool.to} className="glass rounded-xl p-4 border border-border/50 hover:border-primary/40 transition-all group text-center">
                  <tool.icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-foreground">{tool.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* SEO Content */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="glass rounded-2xl p-6 border border-border/50 prose prose-invert prose-sm max-w-none">
            <h2 className="font-display text-lg font-bold text-foreground">Como criar uma bio profissional para Instagram</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A bio do Instagram é o primeiro contato que visitantes têm com seu perfil. Uma bio bem escrita pode aumentar seguidores, gerar cliques e converter visitantes em clientes. Com nosso gerador de bio com IA, você cria textos otimizados em segundos.
            </p>
            <h3 className="font-display text-base font-bold text-foreground mt-4">O que uma boa bio de Instagram deve ter?</h3>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>Descrição clara do que você faz ou oferece</li>
              <li>Diferencial competitivo ou proposta de valor</li>
              <li>Emojis estratégicos para facilitar a leitura</li>
              <li>Call-to-action direcionando para link, WhatsApp ou site</li>
              <li>Localização para negócios locais</li>
            </ul>
            <h3 className="font-display text-base font-bold text-foreground mt-4">Por que usar IA para criar sua bio?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A inteligência artificial analisa milhares de perfis de sucesso para gerar textos persuasivos e otimizados. Em vez de gastar horas pensando na bio perfeita, você recebe sugestões profissionais em segundos, adaptadas ao seu nicho e estilo.
            </p>
          </motion.section>
        </main>

        <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">© 2025 Mente Variável — Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
