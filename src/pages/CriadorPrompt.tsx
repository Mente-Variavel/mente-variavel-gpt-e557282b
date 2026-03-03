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
import { supabase } from "@/integrations/supabase/client";

const frameworks = [
  "Standard", "RACE", "CARE", "APE", "CREATE", "TAG", "CREO", "RISE", "PAIN", "COAST", "ROSES"
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

export default function CriadorPrompt() {
  const [framework, setFramework] = useState("Standard");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [format, setFormat] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Improve section
  const [improveInput, setImproveInput] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [improvingLoading, setImprovingLoading] = useState(false);

  // History
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  useEffect(() => { localStorage.setItem("mv_prompt_history", JSON.stringify(history)); }, [history]);

  const generatePrompt = async () => {
    if (!description) { toast.error("Descreva o que deseja criar."); return; }
    setLoading(true);
    try {
      const msg = `Gere um prompt profissional e estruturado usando o framework "${framework}" para a seguinte necessidade:
Descrição: ${description}
${audience ? `Público-alvo: ${audience}` : ""}
${tone ? `Tom: ${tone}` : ""}
${format ? `Formato: ${format}` : ""}
${restrictions ? `Restrições: ${restrictions}` : ""}

Retorne APENAS o prompt gerado, pronto para usar. Em português do Brasil.`;

      const res = await supabase.functions.invoke("chat", { body: { messages: [{ role: "user", content: msg }] } });
      const text = typeof res.data === "string" ? res.data : res.data?.choices?.[0]?.message?.content || JSON.stringify(res.data);

      // Handle streaming response
      let finalText = text;
      if (text.includes("data: ")) {
        finalText = text.split("\n").filter((l: string) => l.startsWith("data: ") && !l.includes("[DONE]"))
          .map((l: string) => { try { return JSON.parse(l.slice(6))?.choices?.[0]?.delta?.content || ""; } catch { return ""; } }).join("");
      }

      setGeneratedPrompt(finalText);
      setHistory(prev => [{ id: crypto.randomUUID(), prompt: finalText, date: new Date().toLocaleString("pt-BR"), framework }, ...prev.slice(0, 49)]);
      toast.success("Prompt gerado!");
    } catch {
      toast.error("Erro ao gerar prompt.");
    } finally {
      setLoading(false);
    }
  };

  const improvePrompt = async () => {
    if (!improveInput) { toast.error("Cole um prompt para melhorar."); return; }
    setImprovingLoading(true);
    try {
      const msg = `Melhore o seguinte prompt, tornando-o mais estruturado, claro e profissional. Retorne APENAS o prompt melhorado em português do Brasil:\n\n${improveInput}`;
      const res = await supabase.functions.invoke("chat", { body: { messages: [{ role: "user", content: msg }] } });
      const text = typeof res.data === "string" ? res.data : res.data?.choices?.[0]?.message?.content || JSON.stringify(res.data);
      let finalText = text;
      if (text.includes("data: ")) {
        finalText = text.split("\n").filter((l: string) => l.startsWith("data: ") && !l.includes("[DONE]"))
          .map((l: string) => { try { return JSON.parse(l.slice(6))?.choices?.[0]?.delta?.content || ""; } catch { return ""; } }).join("");
      }
      setImprovedPrompt(finalText);
      toast.success("Prompt melhorado!");
    } catch {
      toast.error("Erro ao melhorar prompt.");
    } finally {
      setImprovingLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    setFramework("Standard");
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado!"); };
  const deleteHistory = (id: string) => setHistory(prev => prev.filter(h => h.id !== id));

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
                    <SelectContent>{frameworks.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
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
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Prompt</>}
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
              <Textarea value={improveInput} onChange={e => setImproveInput(e.target.value)} placeholder="Cole seu prompt aqui..." rows={4} />
              <Button onClick={improvePrompt} disabled={improvingLoading} variant="secondary" className="w-full">
                {improvingLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Melhorando...</> : "Melhorar Prompt"}
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
            <CardHeader><CardTitle className="text-lg">Sugestões Rápidas</CardTitle></CardHeader>
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
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-muted-foreground" /> Histórico</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map(h => (
                    <div key={h.id} className="p-3 rounded-xl border border-border/50 bg-secondary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{h.date} · {h.framework}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(h.prompt)}><Copy className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteHistory(h.id)}><Trash2 className="w-3 h-3" /></Button>
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
