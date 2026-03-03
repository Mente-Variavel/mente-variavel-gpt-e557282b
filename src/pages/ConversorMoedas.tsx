import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const currencies = [
  { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£" },
  { code: "JPY", name: "Iene Japonês", symbol: "¥" },
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
];

const fallbackRates: Record<string, number> = {
  BRL: 1, USD: 0.193, EUR: 0.165, GBP: 0.144, JPY: 30.35, BTC: 0.0000023
};

// BTC is not available in the free exchange API, keep a separate estimate
const BTC_RATE_IN_USD = 85000; // approximate BTC price in USD

export default function ConversorMoedas() {
  const [from, setFrom] = useState("BRL");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [manualRate, setManualRate] = useState("");

  const fetchRates = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/BRL");
      if (!res.ok) throw new Error();
      const data = await res.json();
      // API doesn't include BTC, so calculate it from USD rate
      const usdRate = data.rates?.USD || 0.193;
      const btcRate = usdRate / BTC_RATE_IN_USD;
      setRates({ ...data.rates, BTC: btcRate });
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const swap = () => { setFrom(to); setTo(from); };

  const convert = () => {
    const a = parseFloat(amount) || 0;
    if (manualRate) return a * parseFloat(manualRate);
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return (a / fromRate) * toRate;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Conversor de Moedas</h1>
            <p className="text-muted-foreground mb-8">Converta entre moedas em tempo real.</p>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className="text-lg" />
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">De</label>
                  <Select value={from} onValueChange={setFrom}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={swap} className="mb-0.5"><ArrowRightLeft className="w-4 h-4" /></Button>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Para</label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}</SelectContent>
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
                  <Input type="number" value={manualRate} onChange={e => setManualRate(e.target.value)} placeholder="Ex: 0.17" />
                </div>
              )}

              <div className="p-5 rounded-xl bg-primary/10 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {currencies.find(c => c.code === from)?.symbol} {parseFloat(amount || "0").toLocaleString("pt-BR")} {from} =
                </p>
                <p className="text-3xl font-bold text-primary">
                  {currencies.find(c => c.code === to)?.symbol} {convert().toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: to === "BTC" ? 8 : 2 })} {to}
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={fetchRates} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar Taxas
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
