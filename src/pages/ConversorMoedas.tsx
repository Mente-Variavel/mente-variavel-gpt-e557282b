import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, RefreshCw, AlertTriangle, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const currencies = [
  { code: "BRL", name: "Real Brasileiro", symbol: "R$", flag: "🇧🇷" },
  { code: "USD", name: "Dólar Americano", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Iene Japonês", symbol: "¥", flag: "🇯🇵" },
  { code: "BTC", name: "Bitcoin", symbol: "₿", flag: "₿" },
];

const BTC_RATE_IN_USD = 85000;

export default function ConversorMoedas() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BRL");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [manualRate, setManualRate] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      // Fetch with USD as base for more accurate cross-rates
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ base: "USD" }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      // Add BTC rate
      const usdRate = 1;
      const btcRate = usdRate / BTC_RATE_IN_USD;
      const allRates = { ...data.rates, BTC: btcRate, USD: 1 };

      setRates(allRates);
      setSource(data.source || "");
      setLastUpdated(data.lastUpdated || new Date().toLocaleDateString("pt-BR"));
      toast({ title: "✅ Taxas atualizadas!", description: `Fonte: ${data.source || "API"}` });
    } catch {
      setApiError(true);
      // Use hardcoded fallback rates (USD base)
      setRates({ USD: 1, BRL: 5.18, EUR: 0.85, GBP: 0.74, JPY: 157.0, BTC: 1 / BTC_RATE_IN_USD });
      setSource("fallback (offline)");
      setLastUpdated("N/A");
      toast({ title: "⚠️ Erro ao buscar taxas", description: "Usando valores aproximados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchRates(); }, []);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const clear = () => {
    setAmount("1");
    setFrom("USD");
    setTo("BRL");
    setManualRate("");
    setResult(null);
  };

  const convert = () => {
    const a = parseFloat(amount) || 0;
    if (manualRate) {
      const r = a * parseFloat(manualRate);
      setResult(r);
      return r;
    }
    if (!rates[from] || !rates[to]) return 0;
    // All rates are USD-based, so: amount in FROM → USD → TO
    const inUsd = a / rates[from];
    const converted = inUsd * rates[to];
    setResult(converted);
    return converted;
  };

  // Auto-convert when inputs change
  useEffect(() => {
    if (Object.keys(rates).length > 0 && amount) {
      const a = parseFloat(amount) || 0;
      if (manualRate) {
        setResult(a * parseFloat(manualRate));
      } else if (rates[from] && rates[to]) {
        const inUsd = a / rates[from];
        setResult(inUsd * rates[to]);
      }
    }
  }, [amount, from, to, rates, manualRate]);

  const fromCurrency = currencies.find(c => c.code === from);
  const toCurrency = currencies.find(c => c.code === to);
  const displayResult = result ?? 0;

  // Show the rate: 1 FROM = X TO
  const unitRate = rates[from] && rates[to] ? (1 / rates[from]) * rates[to] : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">💱 Conversor de Moedas</h1>
            <p className="text-muted-foreground mb-8">Taxas atualizadas em tempo real.</p>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="1"
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">De</label>
                  <Select value={from} onValueChange={setFrom}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={swap} className="mb-0.5" title="Inverter">
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Para</label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {apiError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>API indisponível. Usando taxas aproximadas ou insira manualmente:</span>
                </div>
              )}

              {apiError && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Taxa manual ({from} → {to})</label>
                  <Input type="number" value={manualRate} onChange={e => setManualRate(e.target.value)} placeholder="Ex: 5.18" />
                </div>
              )}

              <div className="p-5 rounded-xl bg-primary/10 text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  {fromCurrency?.flag} {fromCurrency?.symbol} {parseFloat(amount || "0").toLocaleString("pt-BR")} {from} =
                </p>
                <p className="text-3xl font-bold text-primary">
                  {toCurrency?.flag} {toCurrency?.symbol} {displayResult.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: to === "BTC" ? 8 : 2,
                  })} {to}
                </p>
                {unitRate > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    1 {from} = {unitRate.toLocaleString("pt-BR", {
                      minimumFractionDigits: to === "BTC" ? 8 : 4,
                      maximumFractionDigits: to === "BTC" ? 8 : 4,
                    })} {to}
                  </p>
                )}
              </div>

              {lastUpdated && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Atualizado: {lastUpdated} • Fonte: {source}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={fetchRates} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar Taxas
                </Button>
                <Button variant="ghost" onClick={clear} title="Limpar">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
