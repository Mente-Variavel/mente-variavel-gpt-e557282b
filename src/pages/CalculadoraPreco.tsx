import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, RefreshCw, TrendingUp, DollarSign, Percent, Package, Briefcase, Sparkles, Loader2, FileText, Save, Trash2, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MicInput from "@/components/MicInput";
import logoMv2 from "@/assets/logo-mv2.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SERVICE_CATEGORIES = [
  { label: "Serviço manual / técnico (instalação, manutenção, envelopamento, pintura)", tax: 6, range: [150, 800] },
  { label: "Serviço criativo / digital (design, social media, marketing)", tax: 6, range: [200, 2000] },
  { label: "Alimentação / produção (doces, marmitas, restaurante)", tax: 8, range: [80, 500] },
  { label: "Atendimento / consultoria (advogado, contador, consultor)", tax: 10, range: [300, 3000] },
  { label: "Outro", tax: 6, range: [100, 1000] },
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ESTIMATE_TAX_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/estimate-tax`;

interface SavedCalc {
  id: string;
  category: string;
  service_description: string;
  material_cost: number;
  labor_cost: number;
  other_costs: number;
  tax_pct: number;
  profit_pct: number;
  final_price: number;
  created_at: string;
}

export default function CalculadoraPreco() {
  const { user } = useAuth();
  const [serviceIdx, setServiceIdx] = useState(0);
  const [serviceDescription, setServiceDescription] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [profitPct, setProfitPct] = useState("40");
  const [customTax, setCustomTax] = useState<number | null>(null);
  const [taxJustification, setTaxJustification] = useState("");
  const [estimatingTax, setEstimatingTax] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalc[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const selected = SERVICE_CATEGORIES[serviceIdx];
  const activeTax = customTax !== null ? customTax : selected.tax;

  const calc = useMemo(() => {
    const mat = parseFloat(materialCost) || 0;
    const lab = parseFloat(laborCost) || 0;
    const oth = parseFloat(otherCosts) || 0;
    const profit = parseFloat(profitPct) || 0;
    const totalCost = mat + lab + oth;
    const taxValue = totalCost * (activeTax / 100);
    const profitValue = totalCost * (profit / 100);
    const finalPrice = totalCost + taxValue + profitValue;
    const profitBar = totalCost > 0 ? Math.min((profitValue / finalPrice) * 100, 100) : 0;
    return { totalCost, taxValue, profitValue, finalPrice, profitBar };
  }, [materialCost, laborCost, otherCosts, profitPct, activeTax]);

  const hasInput = calc.totalCost > 0;

  // Load saved calculations
  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_calculations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setSavedCalcs(data as SavedCalc[]);
      });
  }, [user]);

  const estimateTax = useCallback(async (description?: string) => {
    const desc = description ?? serviceDescription;
    if (!desc.trim()) {
      toast.info("Descreva seu serviço para estimar o imposto com IA.");
      return;
    }
    setEstimatingTax(true);
    try {
      const resp = await fetch(ESTIMATE_TAX_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          description: desc,
          category: selected.label,
        }),
      });

      if (resp.status === 429) {
        toast.error("Muitas requisições. Tente novamente em alguns segundos.");
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos insuficientes para IA.");
        return;
      }

      const data = await resp.json();
      if (data.error) {
        toast.error("Não foi possível estimar o imposto agora.");
        return;
      }
      setCustomTax(data.tax);
      setTaxJustification(data.justification || "");
      toast.success(`Imposto estimado em ${data.tax}%`);
    } catch {
      toast.error("Erro ao estimar imposto. Tente novamente.");
    } finally {
      setEstimatingTax(false);
    }
  }, [serviceDescription, selected.label]);

  const saveCalculation = async () => {
    if (!user) {
      toast.error("Faça login para salvar seus cálculos.");
      return;
    }
    if (!hasInput) return;

    setSaving(true);
    const { error } = await supabase.from("saved_calculations").insert({
      user_id: user.id,
      category: selected.label,
      service_description: serviceDescription,
      material_cost: parseFloat(materialCost) || 0,
      labor_cost: parseFloat(laborCost) || 0,
      other_costs: parseFloat(otherCosts) || 0,
      tax_pct: activeTax,
      profit_pct: parseFloat(profitPct) || 0,
      final_price: calc.finalPrice,
    });
    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar. Tente novamente.");
    } else {
      toast.success("Cálculo salvo com sucesso!");
      // Refresh list
      const { data } = await supabase
        .from("saved_calculations")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setSavedCalcs(data as SavedCalc[]);
    }
  };

  const deleteCalc = async (id: string) => {
    await supabase.from("saved_calculations").delete().eq("id", id);
    setSavedCalcs((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cálculo removido.");
  };

  const reset = () => {
    setMaterialCost("");
    setLaborCost("");
    setOtherCosts("");
    setProfitPct("40");
    setServiceIdx(0);
    setServiceDescription("");
    setCustomTax(null);
    setTaxJustification("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <img src={logoMv2} alt="Mente Variável" className="w-16 h-16 mx-auto mb-4 rounded-full" />
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Mente Variável</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
              Calculadora de Lucro
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Descubra quanto cobrar pelo seu serviço em segundos.
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg p-6 sm:p-8 space-y-6"
          >
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Categoria
              </label>
              <select
                value={serviceIdx}
                onChange={(e) => {
                  setServiceIdx(Number(e.target.value));
                  setCustomTax(null);
                  setTaxJustification("");
                }}
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              >
                {SERVICE_CATEGORIES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Service description + mic */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Descreva seu serviço
              </label>
              <div className="relative">
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Ex: Faço envelopamento automotivo completo, trabalho com vinil importado..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-3 pr-20 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50 transition-all resize-none"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <MicInput
                    onTranscript={(text) => {
                      setServiceDescription((prev) => (prev ? prev + " " + text : text));
                    }}
                  />
                  <button
                    onClick={() => estimateTax()}
                    disabled={estimatingTax || !serviceDescription.trim()}
                    className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Estimar imposto com IA"
                  >
                    {estimatingTax ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Descreva o que faz e clique em <Sparkles className="w-3 h-3 inline text-primary" /> para estimar o imposto com IA.
              </p>
            </div>

            {/* Tax info */}
            <div className="rounded-lg bg-secondary/40 border border-border/30 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                Imposto estimado: <span className="text-primary font-bold text-sm">{activeTax}%</span>
                {customTax !== null && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary/70">
                    <Sparkles className="w-3 h-3" /> estimado por IA
                  </span>
                )}
              </p>
              {taxJustification && (
                <p className="text-xs text-muted-foreground/80 italic">{taxJustification}</p>
              )}
            </div>

            {/* Cost fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CostField
                icon={<Package className="w-4 h-4 text-primary" />}
                label="Custo do material (R$)"
                value={materialCost}
                onChange={setMaterialCost}
                placeholder="0,00"
              />
              <CostField
                icon={<DollarSign className="w-4 h-4 text-primary" />}
                label="Custo da mão de obra (R$)"
                value={laborCost}
                onChange={setLaborCost}
                placeholder="0,00"
              />
              <CostField
                icon={<DollarSign className="w-4 h-4 text-primary" />}
                label="Outros custos (R$)"
                value={otherCosts}
                onChange={setOtherCosts}
                placeholder="0,00"
              />
              <CostField
                icon={<Percent className="w-4 h-4 text-primary" />}
                label="Lucro desejado (%)"
                value={profitPct}
                onChange={setProfitPct}
                placeholder="40"
              />
            </div>

            {/* Result */}
            {hasInput && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4"
              >
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Preço ideal para cobrar
                  </p>
                  <p className="text-3xl sm:text-4xl font-display font-bold text-primary text-glow-cyan">
                    {formatBRL(calc.finalPrice)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-secondary/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Custo total</p>
                    <p className="text-sm font-semibold text-foreground">{formatBRL(calc.totalCost)}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Impostos</p>
                    <p className="text-sm font-semibold text-foreground">{formatBRL(calc.taxValue)}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Lucro</p>
                    <p className="text-sm font-semibold text-accent">{formatBRL(calc.profitValue)}</p>
                  </div>
                </div>

                {/* Profit bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Margem de lucro</span>
                    <span>{calc.profitBar.toFixed(1)}% do preço final</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calc.profitBar}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>

                {/* Market hint */}
                <div className="rounded-lg bg-secondary/30 border border-border/30 p-3">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Na maioria dos casos, serviços desse tipo costumam cobrar entre{" "}
                    <span className="font-semibold text-foreground">
                      {formatBRL(selected.range[0])}
                    </span>{" "}
                    e{" "}
                    <span className="font-semibold text-foreground">
                      {formatBRL(selected.range[1])}
                    </span>{" "}
                    dependendo da região.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={saveCalculation}
                    disabled={saving}
                    className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar cálculo
                  </button>
                  <button
                    onClick={reset}
                    className="h-11 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Limpar
                  </button>
                </div>
              </motion.div>
            )}

            {!hasInput && (
              <div className="text-center py-6 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Calculator className="w-8 h-8 text-primary/40" />
                Preencha os custos acima para ver o preço ideal.
              </div>
            )}
          </motion.div>

          {/* Saved calculations */}
          {user && savedCalcs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card/80 border border-border/50 text-sm font-medium text-foreground hover:bg-secondary/50 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-primary" />
                  Meus cálculos salvos ({savedCalcs.length})
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showHistory ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-2">
                      {savedCalcs.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-border/50 bg-card/60 p-4 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-primary truncate">
                              {formatBRL(c.final_price)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.service_description || c.category}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                              {new Date(c.created_at).toLocaleDateString("pt-BR")} • Imposto: {c.tax_pct}% • Lucro: {c.profit_pct}%
                            </p>
                          </div>
                          <button
                            onClick={() => deleteCalc(c.id)}
                            className="shrink-0 h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Ferramenta criada por <span className="text-primary font-semibold">Mente Variável</span> para ajudar profissionais a cobrarem o preço justo.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CostField({ icon, label, value, onChange, placeholder }: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50 transition-all"
      />
    </div>
  );
}
