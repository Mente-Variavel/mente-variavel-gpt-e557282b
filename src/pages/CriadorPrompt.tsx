import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, Copy, Trash2, Clock, Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;

const frameworks = [
  { name: "Standard", desc: "Prompt direto e claro" },
  { name: "RACE", desc: "Role, Action, Context, Expect" },
  { name: "CARE", desc: "Context, Action, Result, Example" },
  { name: "APE", desc: "Action, Purpose, Expectation" },
  { name: "CREATE", desc: "Character, Request, Examples, Adjustments, Type, Extras" },
  { name: "TAG", desc: "Task, Action, Goal" },
  { name: "CREO", desc: "Context, Request, Expectation, Output" },
  { name: "RISE", desc: "Role, Input, Steps, Expectation" },
  { name: "PAIN", desc: "Problem, Action, Information, Next steps" },
  { name: "COAST", desc: "Context, Objective, Actions, Scenario, Task" },
  { name: "ROSES", desc: "Role, Objective, Scenario, Expected Solution, Steps" },
];

const quickSuggestions = [
  "Criar roteiro para vídeo",
  "Criar copy de vendas",
  "Criar descrição para produto",
  "Criar artigo SEO",
  "Criar prompt para imagem realista",
];

type HistoryItem = { id: string; prompt: string; date: string; framework: string };

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem("mv_prompt_history") || "[]"); } catch { return []; }
}

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (res.status === 429) throw new Error("Limite de requisições excedido. Tente novamente em instantes.");
  if (res.status === 402) throw new Error("Créditos insuficientes.");
  if (!res.ok) throw new Error("Erro ao conectar com o serviço de IA.");

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content;
}

export default function CriadorPrompt() {
  const [framework, setFramework] = useState("Standard");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [format, setFormat] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [improveInput, setImproveInput] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [improvingLoading, setImprovingLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  useEffect(() => { localStorage.setItem("mv_prompt_history", JSON.stringify(history)); }, [history]);

  const generatePrompt = async () => {
    if (!description) { toast.error("Descreva o que deseja criar."); return; }
    setLoading(true);
    setGeneratedPrompt("");
    try {
      const frameworkInfo = frameworks.find(f => f.name === framework);
      const content = await callAI([{
        role: "user",
        content: `Você é um especialista em engenharia de prompts. Gere um prompt profissional e altamente estruturado usando o framework "${framework}" (${frameworkInfo?.desc || ""}).

Necessidade do usuário: ${description}
${audience ? `Público-alvo: ${audience}` : ""}
${tone ? `Tom desejado: ${tone}` : ""}
${format ? `Formato de saída: ${format}` : ""}
${restrictions ? `Restrições: ${restrictions}` : ""}

INSTRUÇÕES:
- Retorne APENAS o prompt final, pronto para copiar e colar.
- O prompt deve ser em português do Brasil.
- Estruture claramente seguindo o framework ${framework}.
- Seja detalhado e específico.
- NÃO inclua explicações sobre o framework, apenas o prompt gerado.`
      }]);

      setGeneratedPrompt(content);
      setHistory(prev => [{ id: crypto.randomUUID(), prompt: content, date: new Date().toLocaleString("pt-BR"), framework }, ...prev.slice(0, 49)]);
      toast.success("Prompt gerado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar prompt.");
    } finally {
      setLoading(false);
    }
  };

  const improvePrompt = async () => {
    if (!improveInput.trim()) { toast.error("Cole um prompt para melhorar."); return; }
    setImprovingLoading(true);
    setImprovedPrompt("");
    try {
      const content = await callAI([{
        role: "user",
        content: `Você é um especialista em engenharia de prompts. Melhore significativamente o prompt abaixo, tornando-o:
- Mais estruturado e organizado
- Mais claro e específico
- Mais profissional
- Com instruções mais detalhadas

Prompt original:
"""
${improveInput}
"""

Retorne APENAS o prompt melhorado em português do Brasil, pronto para uso. Não inclua explicações.`
      }]);

      setImprovedPrompt(content);
      toast.success("Prompt melhorado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao melhorar prompt.");
    } finally {
      setImprovingLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    setFramework("Standard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado!"); };
  const deleteHistory = (id: string) => setHistory(prev => prev.filter(h => h.id !== id));
  const reuseHistory = (h: HistoryItem) => { setImproveInput(h.prompt); toast.info("Prompt carregado na seção Melhorar."); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Gerador Inteligente de Prompts</h1>
            <p className="text-muted-foreground text-lg">Crie prompts estruturados e profissionais em segundos.</p>
          </motion.div>

          {/* Section 1: Generate */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary" /> Gerar Prompt</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Framework</label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {frameworks.map(f => (
                        <SelectItem key={f.name} value={f.name}>
                          <span className="font-medium">{f.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">({f.desc})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tom</label>
                  <Input value={tone} onChange={e => setTone(e.target.value)} placeholder="Profissional, casual, persuasivo..." />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Descreva o que você deseja criar *</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Um artigo sobre produtividade com IA para empreendedores" rows={3} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Público-alvo</label>
                  <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Empreendedores" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Formato</label>
                  <Input value={format} onChange={e => setFormat(e.target.value)} placeholder="Artigo, lista, script..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Restrições</label>
                  <Input value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="Máx 500 palavras..." />
                </div>
              </div>
              <Button onClick={generatePrompt} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando prompt...</> : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Prompt</>}
              </Button>
              {generatedPrompt && (
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-sm whitespace-pre-wrap leading-relaxed font-body">{generatedPrompt}</pre>
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyText(generatedPrompt)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Improve */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-accent" /> Melhorar Prompt</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={improveInput} onChange={e => setImproveInput(e.target.value)} placeholder="Cole seu prompt aqui para melhorar..." rows={4} />
              <Button onClick={improvePrompt} disabled={improvingLoading} variant="secondary" className="w-full">
                {improvingLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Melhorando...</> : <><Zap className="w-4 h-4 mr-2" /> Melhorar Prompt</>}
              </Button>
              {improvedPrompt && (
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-sm whitespace-pre-wrap leading-relaxed font-body">{improvedPrompt}</pre>
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyText(improvedPrompt)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Quick Suggestions */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="text-lg">⚡ Sugestões Rápidas</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map(s => (
                  <Button key={s} variant="outline" size="sm" onClick={() => handleQuickSuggestion(s)} className="text-xs">
                    {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: History */}
          {history.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-muted-foreground" /> Histórico ({history.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map(h => (
                    <div key={h.id} className="p-3 rounded-xl border border-border/50 bg-secondary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{h.date} · {h.framework}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => reuseHistory(h)} title="Reusar"><Zap className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(h.prompt)} title="Copiar"><Copy className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteHistory(h.id)} title="Excluir"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{h.prompt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
