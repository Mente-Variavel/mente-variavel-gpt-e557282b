import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, RefreshCw, TrendingUp, DollarSign, Percent, Package, Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logoMv2 from "@/assets/logo-mv2.png";

const SERVICE_TYPES = [
  { label: "Serviço manual / técnico (instalação, manutenção, envelopamento, pintura)", tax: 6, range: [150, 800] },
  { label: "Serviço criativo / digital (design, social media, marketing)", tax: 6, range: [200, 2000] },
  { label: "Alimentação / produção (doces, marmitas, restaurante)", tax: 8, range: [80, 500] },
  { label: "Atendimento / consultoria (advogado, contador, consultor)", tax: 10, range: [300, 3000] },
  { label: "Outro", tax: 6, range: [100, 1000] },
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CalculadoraPreco() {
  const [serviceIdx, setServiceIdx] = useState(0);
  const [materialCost, setMaterialCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [profitPct, setProfitPct] = useState("40");

  const selected = SERVICE_TYPES[serviceIdx];

  const calc = useMemo(() => {
    const mat = parseFloat(materialCost) || 0;
    const lab = parseFloat(laborCost) || 0;
    const oth = parseFloat(otherCosts) || 0;
    const profit = parseFloat(profitPct) || 0;
    const totalCost = mat + lab + oth;
    const taxValue = totalCost * (selected.tax / 100);
    const profitValue = totalCost * (profit / 100);
    const finalPrice = totalCost + taxValue + profitValue;
    const profitBar = totalCost > 0 ? Math.min((profitValue / finalPrice) * 100, 100) : 0;
    return { totalCost, taxValue, profitValue, finalPrice, profitBar };
  }, [materialCost, laborCost, otherCosts, profitPct, selected]);

  const hasInput = calc.totalCost > 0;

  const reset = () => {
    setMaterialCost("");
    setLaborCost("");
    setOtherCosts("");
    setProfitPct("40");
    setServiceIdx(0);
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
              Service Price Calculator
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
            {/* Service type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Tipo de serviço
              </label>
              <select
                value={serviceIdx}
                onChange={(e) => setServiceIdx(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              >
                {SERVICE_TYPES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Imposto estimado: <span className="text-primary font-semibold">{selected.tax}%</span>
              </p>
            </div>

            {/* Cost fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                icon={<Package className="w-4 h-4 text-primary" />}
                label="Custo do material (R$)"
                value={materialCost}
                onChange={setMaterialCost}
                placeholder="0,00"
              />
              <Field
                icon={<DollarSign className="w-4 h-4 text-primary" />}
                label="Custo da mão de obra (R$)"
                value={laborCost}
                onChange={setLaborCost}
                placeholder="0,00"
              />
              <Field
                icon={<DollarSign className="w-4 h-4 text-primary" />}
                label="Outros custos (R$)"
                value={otherCosts}
                onChange={setOtherCosts}
                placeholder="0,00"
              />
              <Field
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

                {/* Recalculate */}
                <button
                  onClick={reset}
                  className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recalcular
                </button>
              </motion.div>
            )}

            {!hasInput && (
              <div className="text-center py-6 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Calculator className="w-8 h-8 text-primary/40" />
                Preencha os custos acima para ver o preço ideal.
              </div>
            )}
          </motion.div>

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

function Field({ icon, label, value, onChange, placeholder }: {
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
