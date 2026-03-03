import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Expense = { id: string; category: string; month: string; year: string; value: number };

const categories = ["Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Vestuário", "Outros"];
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function loadExpenses(): Expense[] {
  try { return JSON.parse(localStorage.getItem("mv_expenses") || "[]"); } catch { return []; }
}

export default function ControleGastos() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Compound interest calculator
  const [ciInitial, setCiInitial] = useState("");
  const [ciMonthly, setCiMonthly] = useState("");
  const [ciRate, setCiRate] = useState("");
  const [ciMonths, setCiMonths] = useState("");

  useEffect(() => { localStorage.setItem("mv_expenses", JSON.stringify(expenses)); }, [expenses]);

  const addExpense = () => {
    if (!category || !month || !year || !value) return;
    if (editingId) {
      setExpenses(prev => prev.map(e => e.id === editingId ? { ...e, category, month, year, value: parseFloat(value) } : e));
      setEditingId(null);
    } else {
      setExpenses(prev => [...prev, { id: crypto.randomUUID(), category, month, year, value: parseFloat(value) }]);
    }
    setCategory(""); setMonth(""); setValue("");
  };

  const editExpense = (e: Expense) => {
    setCategory(e.category); setMonth(e.month); setYear(e.year); setValue(e.value.toString()); setEditingId(e.id);
  };

  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  const totalByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.value; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const totalMonth = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { const key = `${e.month}/${e.year}`; map[key] = (map[key] || 0) + e.value; });
    return Object.entries(map);
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.value, 0);

  const ciResult = useMemo(() => {
    const p = parseFloat(ciInitial) || 0;
    const m = parseFloat(ciMonthly) || 0;
    const r = (parseFloat(ciRate) || 0) / 100;
    const n = parseInt(ciMonths) || 0;
    if (n <= 0) return 0;
    let total = p;
    for (let i = 0; i < n; i++) { total = (total + m) * (1 + r); }
    return total;
  }, [ciInitial, ciMonthly, ciRate, ciMonths]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Controle de Gastos</h1>
            <p className="text-muted-foreground mb-8">Gerencie suas despesas mensais com um dashboard visual.</p>
          </motion.div>

          {/* Add Form */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mês</label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger><SelectValue placeholder="Mês" /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ano</label>
                  <Input value={year} onChange={e => setYear(e.target.value)} placeholder="2026" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)</label>
                  <Input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" />
                </div>
                <Button onClick={addExpense} className="h-10">
                  {editingId ? <><Save className="w-4 h-4 mr-1" /> Salvar</> : <><Plus className="w-4 h-4 mr-1" /> Adicionar</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Geral</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Categorias</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{totalByCategory.length}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Registros</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{expenses.length}</p></CardContent>
            </Card>
          </div>

          {/* By Category */}
          {totalByCategory.length > 0 && (
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-lg">Total por Categoria</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {totalByCategory.map(([cat, val]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat}</span>
                        <span className="font-medium">R$ {val.toFixed(2)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(val / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records */}
          {expenses.length > 0 && (
            <Card className="mb-8">
              <CardHeader><CardTitle className="text-lg">Registros</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2">Categoria</th><th className="text-left py-2">Mês/Ano</th><th className="text-right py-2">Valor</th><th className="text-right py-2">Ações</th>
                    </tr></thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e.id} className="border-b border-border/50">
                          <td className="py-2">{e.category}</td>
                          <td className="py-2">{e.month}/{e.year}</td>
                          <td className="py-2 text-right font-medium">R$ {e.value.toFixed(2)}</td>
                          <td className="py-2 text-right">
                            <button onClick={() => editExpense(e)} className="p-1 hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteExpense(e.id)} className="p-1 hover:text-destructive ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compound Interest Calculator */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calculator className="w-5 h-5 text-primary" /> Calculadora de Juros Compostos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor inicial (R$)</label>
                  <Input type="number" value={ciInitial} onChange={e => setCiInitial(e.target.value)} placeholder="1000" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Aporte mensal (R$)</label>
                  <Input type="number" value={ciMonthly} onChange={e => setCiMonthly(e.target.value)} placeholder="200" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Taxa mensal (%)</label>
                  <Input type="number" value={ciRate} onChange={e => setCiRate(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Meses</label>
                  <Input type="number" value={ciMonths} onChange={e => setCiMonths(e.target.value)} placeholder="12" />
                </div>
              </div>
              {ciResult > 0 && (
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Montante final estimado</p>
                  <p className="text-2xl font-bold text-primary">R$ {ciResult.toFixed(2)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
