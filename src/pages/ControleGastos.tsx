import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, Calculator, RefreshCw, TrendingUp, TrendingDown, DollarSign, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExpenseLoginScreen from "@/components/expense/ExpenseLoginScreen";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EntryType = "despesa" | "receita";
type Entry = { id: string; type: EntryType; category: string; month: string; year: string; value: number; description?: string };

const expenseCategories = [
  "Alimentação", "Moradia", "Transporte", "Saúde", "Educação",
  "Lazer", "Vestuário", "Internet", "Energia", "Água",
  "Gás de cozinha", "Telefone", "Assinaturas", "Impostos", "Outros"
];

const incomeCategories = [
  "Salário", "Freelance", "Investimentos", "Aluguel", "Vendas", "Outros"
];

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const SESSION_KEY = "mv_expense_session";

export default function ControleGastos() {
  const [profileId, setProfileId] = useState<string | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")?.profileId || null; } catch { return null; }
  });
  const [nick, setNick] = useState<string>(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")?.nick || ""; } catch { return ""; }
  });

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<EntryType>("despesa");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"todos" | EntryType>("todos");

  // Compound interest calculator
  const [ciInitial, setCiInitial] = useState("");
  const [ciMonthly, setCiMonthly] = useState("");
  const [ciRate, setCiRate] = useState("");
  const [ciMonths, setCiMonths] = useState("");

  const handleLogin = useCallback((id: string, nickName: string) => {
    setProfileId(id);
    setNick(nickName);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ profileId: id, nick: nickName }));
  }, []);

  const handleLogout = useCallback(() => {
    setProfileId(null);
    setNick("");
    setEntries([]);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // Load entries from DB
  useEffect(() => {
    if (!profileId) return;
    setLoadingEntries(true);
    supabase
      .from("expense_entries")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          toast.error("Erro ao carregar histórico.");
        } else {
          setEntries((data || []).map(d => ({
            id: d.id,
            type: d.type as EntryType,
            category: d.category,
            month: d.month,
            year: d.year,
            value: Number(d.value),
            description: d.description || "",
          })));
        }
        setLoadingEntries(false);
      });
  }, [profileId]);

  const currentCategories = type === "receita" ? incomeCategories : expenseCategories;

  const addEntry = async () => {
    if (!category || !month || !year || !value || parseFloat(value) <= 0 || !profileId) return;

    if (editingId) {
      const { error } = await supabase
        .from("expense_entries")
        .update({ type, category, month, year, value: parseFloat(value), description })
        .eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar."); return; }
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, type, category, month, year, value: parseFloat(value), description } : e));
      setEditingId(null);
    } else {
      const { data, error } = await supabase
        .from("expense_entries")
        .insert({ profile_id: profileId, type, category, month, year, value: parseFloat(value), description })
        .select("id")
        .single();
      if (error) { toast.error("Erro ao adicionar."); return; }
      setEntries(prev => [{ id: data.id, type, category, month, year, value: parseFloat(value), description }, ...prev]);
    }
    clearForm();
  };

  const clearForm = () => {
    setCategory(""); setValue(""); setDescription(""); setEditingId(null);
  };

  const editEntry = (e: Entry) => {
    setType(e.type); setCategory(e.category); setMonth(e.month); setYear(e.year);
    setValue(e.value.toString()); setDescription(e.description || ""); setEditingId(e.id);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("expense_entries").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir."); return; }
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const clearAll = async () => {
    if (!profileId || !confirm("Tem certeza que deseja apagar todos os registros?")) return;
    const { error } = await supabase.from("expense_entries").delete().eq("profile_id", profileId);
    if (error) { toast.error("Erro ao limpar."); return; }
    setEntries([]);
    clearForm();
  };

  const handleSaveHistory = useCallback(() => {
    toast.success("Histórico salvo com sucesso.");
  }, []);

  const filtered = useMemo(() => {
    if (filterType === "todos") return entries;
    return entries.filter(e => e.type === filterType);
  }, [entries, filterType]);

  const totalDespesas = useMemo(() => entries.filter(e => e.type === "despesa").reduce((s, e) => s + e.value, 0), [entries]);
  const totalReceitas = useMemo(() => entries.filter(e => e.type === "receita").reduce((s, e) => s + e.value, 0), [entries]);
  const saldo = totalReceitas - totalDespesas;

  const totalByCategory = useMemo(() => {
    const map: Record<string, { total: number; type: EntryType }> = {};
    filtered.forEach(e => {
      if (!map[e.category]) map[e.category] = { total: 0, type: e.type };
      map[e.category].total += e.value;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filtered]);

  const maxCatValue = totalByCategory.length > 0 ? Math.max(...totalByCategory.map(([, v]) => v.total)) : 1;

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

  if (!profileId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <ExpenseLoginScreen onLogin={handleLogin} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Controle de Gastos</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Olá, <span className="font-semibold text-primary">{nick}</span></span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-xs h-7">
                  <LogOut className="w-3.5 h-3.5" /> Sair
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mb-8">Gerencie suas despesas e receitas mensais com um dashboard visual.</p>
          </motion.div>

          {loadingEntries ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Add Form */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {editingId ? "Editar Registro" : "Adicionar Registro"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Button type="button" variant={type === "despesa" ? "default" : "outline"} onClick={() => { setType("despesa"); setCategory(""); }}
                      className={`flex-1 gap-2 ${type === "despesa" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}>
                      <TrendingDown className="w-4 h-4" /> Despesa
                    </Button>
                    <Button type="button" variant={type === "receita" ? "default" : "outline"} onClick={() => { setType("receita"); setCategory(""); }}
                      className={`flex-1 gap-2 ${type === "receita" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}>
                      <TrendingUp className="w-4 h-4" /> Receita
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{currentCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)</label>
                      <Input type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Descrição (opcional)</label>
                      <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Conta de luz" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addEntry} className="gap-2">
                      {editingId ? <><Save className="w-4 h-4" /> Salvar</> : <><Plus className="w-4 h-4" /> Adicionar</>}
                    </Button>
                    {editingId && <Button variant="outline" onClick={clearForm}>Cancelar</Button>}
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard */}
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-500" /> Receitas</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-bold text-green-500">R$ {totalReceitas.toFixed(2)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-destructive" /> Despesas</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-bold text-destructive">R$ {totalDespesas.toFixed(2)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Saldo</CardTitle></CardHeader>
                  <CardContent><p className={`text-xl font-bold ${saldo >= 0 ? "text-green-500" : "text-destructive"}`}>R$ {saldo.toFixed(2)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Registros</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{entries.length}</p>
                    {entries.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-destructive hover:text-destructive mt-1 h-6 px-2">
                        <RefreshCw className="w-3 h-3 mr-1" /> Limpar tudo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Save Button */}
              <div className="mb-6">
                <Button onClick={handleSaveHistory} className="w-full gap-2 bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4" /> Salvar Histórico
                </Button>
              </div>

              {/* By Category */}
              {totalByCategory.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Total por Categoria</CardTitle>
                      <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="despesa">Despesas</SelectItem>
                          <SelectItem value="receita">Receitas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {totalByCategory.map(([cat, data]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1.5">
                              {data.type === "receita" ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                              {cat}
                            </span>
                            <span className={`font-medium ${data.type === "receita" ? "text-green-500" : "text-destructive"}`}>
                              R$ {data.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${data.type === "receita" ? "bg-green-500" : "bg-destructive"}`}
                              style={{ width: `${(data.total / maxCatValue) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Records */}
              {filtered.length > 0 && (
                <Card className="mb-8">
                  <CardHeader><CardTitle className="text-lg">Registros</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2">Tipo</th>
                          <th className="text-left py-2">Categoria</th>
                          <th className="text-left py-2 hidden sm:table-cell">Descrição</th>
                          <th className="text-left py-2">Mês/Ano</th>
                          <th className="text-right py-2">Valor</th>
                          <th className="text-right py-2">Ações</th>
                        </tr></thead>
                        <tbody>
                          {filtered.map(e => (
                            <tr key={e.id} className="border-b border-border/50">
                              <td className="py-2">
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${e.type === "receita" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                                  {e.type === "receita" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {e.type === "receita" ? "Receita" : "Despesa"}
                                </span>
                              </td>
                              <td className="py-2">{e.category}</td>
                              <td className="py-2 hidden sm:table-cell text-muted-foreground">{e.description || "—"}</td>
                              <td className="py-2">{e.month}/{e.year}</td>
                              <td className={`py-2 text-right font-medium ${e.type === "receita" ? "text-green-500" : "text-destructive"}`}>
                                {e.type === "receita" ? "+" : "-"} R$ {e.value.toFixed(2)}
                              </td>
                              <td className="py-2 text-right">
                                <button onClick={() => editEntry(e)} className="p-1 hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteEntry(e.id)} className="p-1 hover:text-destructive ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
