import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Trash2, Clock, Sparkles, Loader2, Zap, Mic, MicOff, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import AudioVisualizer from "@/components/AudioVisualizer";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;

const promptTypes = [
  { name: "Prompt para Sites / Aplicativos / Ferramentas", desc: "Software, websites, apps, interfaces, funcionalidades e instruções técnicas", systemHint: "Gere um prompt focado em: ferramentas de software, websites, aplicativos, interfaces de sistema, funcionalidades de produto e instruções técnicas detalhadas." },
  { name: "Prompt para Imagens", desc: "Descrição visual, estilo, iluminação, composição e direção artística", systemHint: "Gere um prompt focado em: descrição visual detalhada, estilo artístico, iluminação, composição, direção artística e detalhes visuais para geração de imagem." },
  { name: "Prompt para Vídeos", desc: "Cenas, movimentos de câmera, storytelling e sequências visuais", systemHint: "Gere um prompt focado em: descrição de cenas, movimentos de câmera, storytelling visual, sequências cinematográficas e instruções de direção de vídeo." },
  { name: "Prompt para Letras de Música", desc: "Estrutura lírica, tema musical, ritmo, emoção e narrativa", systemHint: "Gere um prompt focado em: estrutura de letras (versos, refrão, ponte), tema musical, ritmo, emoção, narrativa em formato de canção e estilo musical." },
];

const languages = [
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" },
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
  try {
    const saved = JSON.parse(localStorage.getItem("mv_prompt_history") || "[]") as HistoryItem[];
    // Clear history from previous days
    const today = new Date().toLocaleDateString("pt-BR");
    const todayItems = saved.filter((item) => item.date.startsWith(today));
    if (todayItems.length !== saved.length) {
      localStorage.setItem("mv_prompt_history", JSON.stringify(todayItems));
    }
    return todayItems;
  } catch { return []; }
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
  const [framework, setFramework] = useState(promptTypes[0].name);
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [format, setFormat] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [imageRatio, setImageRatio] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [improveInput, setImproveInput] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [improvingLoading, setImprovingLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  // Mic for description field
  const [micTarget, setMicTarget] = useState<"description" | "improve" | null>(null);
  const [pendingMicAction, setPendingMicAction] = useState<"description" | "improve" | null>(null);
  const { isListening, transcript, isSupported, error: micError, mediaStream, startListening, stopListening, cancelListening } = useSpeechRecognition();

  // When transcript arrives, set the field value and mark pending action
  useEffect(() => {
    if (transcript && transcript !== "Transcrevendo...") {
      if (micTarget === "description") {
        setDescription(transcript);
        setPendingMicAction("description");
      } else if (micTarget === "improve") {
        setImproveInput(transcript);
        setPendingMicAction("improve");
      }
    }
  }, [transcript, micTarget]);

  // Auto-trigger generation after voice transcription completes
  const generatePromptRef = useRef<() => void>();
  const improvePromptRef = useRef<() => void>();

  useEffect(() => {
    if (pendingMicAction === "description" && description && !loading) {
      setPendingMicAction(null);
      setMicTarget(null);
      setTimeout(() => generatePromptRef.current?.(), 300);
    } else if (pendingMicAction === "improve" && improveInput && !improvingLoading) {
      setPendingMicAction(null);
      setMicTarget(null);
      setTimeout(() => improvePromptRef.current?.(), 300);
    }
  }, [pendingMicAction, description, improveInput, loading, improvingLoading]);

  useEffect(() => { localStorage.setItem("mv_prompt_history", JSON.stringify(history)); }, [history]);

  const toggleMic = (target: "description" | "improve") => {
    if (isListening) {
      stopListening();
      // Don't clear micTarget here — the transcript arrives asynchronously
      // micTarget is cleared after the transcript is consumed in the useEffect
    } else {
      setMicTarget(target);
      startListening();
    }
  };

  const handleCancelMic = () => {
    cancelListening();
    setMicTarget(null);
  };

  const getLangName = (code: string) => languages.find(l => l.code === code)?.label || "Português (Brasil)";

  const generatePrompt = async () => {
    if (!description) { toast.error("Descreva o que deseja criar."); return; }
    setLoading(true);
    setGeneratedPrompt("");
    try {
      const typeInfo = promptTypes.find(f => f.name === framework);
      const langLabel = getLangName(language);
      const content = await callAI([{
        role: "user",
        content: `Você é um especialista em engenharia de prompts. Gere um prompt profissional e altamente estruturado usando o framework "${framework}" (${frameworkInfo?.desc || ""}).

Necessidade do usuário: ${description}
${audience ? `Público-alvo: ${audience}` : ""}
${tone ? `Tom desejado: ${tone}` : ""}
${format ? `Formato de saída: ${format}` : ""}
${restrictions ? `Restrições: ${restrictions}` : ""}
${imageRatio ? `Proporção de imagem desejada: ${imageRatio} — inclua esta informação de proporção no prompt gerado para que a IA gere a imagem no tamanho correto.` : ""}

INSTRUÇÕES:
- Retorne APENAS o prompt final, pronto para copiar e colar.
- O prompt DEVE ser gerado no idioma: ${langLabel} (código: ${language}).
- Estruture claramente seguindo o framework ${framework}.
- Seja detalhado e específico.${imageRatio ? `\n- INCLUA no prompt gerado a instrução explícita de que a imagem deve ser gerada na proporção ${imageRatio}.` : ""}
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
      const langLabel = getLangName(language);
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

Retorne APENAS o prompt melhorado no idioma ${langLabel}, pronto para uso. Não inclua explicações.`
      }]);

      setImprovedPrompt(content);
      toast.success("Prompt melhorado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao melhorar prompt.");
    } finally {
      setImprovingLoading(false);
    }
  };

  // Keep refs updated for auto-trigger after mic
  generatePromptRef.current = generatePrompt;
  improvePromptRef.current = improvePrompt;

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

          {/* Mic visualizer */}
          <AnimatePresence>
            {isListening && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Ouvindo ({micTarget === "description" ? "descrição" : "melhorar"})...
                  </span>
                  <button onClick={handleCancelMic} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                </div>
                <AudioVisualizer stream={mediaStream} isActive={isListening} barCount={32} className="rounded-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          {micError && <p className="text-xs text-destructive mb-4 px-1">{micError}</p>}

          {/* Section 1: Generate */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary" /> Gerar Prompt</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
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
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Globe className="w-3 h-3" /> Idioma</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map(l => (
                        <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Descreva o que você deseja criar *</label>
                  {isSupported && (
                    <button onClick={() => toggleMic("description")} className={`p-1.5 rounded-md transition-all ${isListening && micTarget === "description" ? "bg-destructive text-destructive-foreground animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-secondary"}`} title="Ditar com microfone">
                      {isListening && micTarget === "description" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Um artigo sobre produtividade com IA para empreendedores" rows={3} />
              </div>

              {/* Aspect Ratio selector */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Proporção da imagem (opcional)</label>
                <div className="flex gap-3">
                  {[
                    { ratio: "1:1", label: "1:1", desc: "Quadrada", w: "w-10", h: "h-10" },
                    { ratio: "9:16", label: "9:16", desc: "Vertical / Reels", w: "w-7", h: "h-12" },
                    { ratio: "16:9", label: "16:9", desc: "Paisagem / YouTube", w: "w-14", h: "h-8" },
                  ].map(({ ratio, label, desc, w, h }) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setImageRatio(imageRatio === ratio ? null : ratio)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        imageRatio === ratio
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <div className={`${w} ${h} rounded border-2 ${imageRatio === ratio ? "border-primary" : "border-muted-foreground/40"}`} />
                      <span className="text-xs font-semibold">{label}</span>
                      <span className="text-[10px] leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>
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
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Cole seu prompt aqui para melhorar</label>
                  {isSupported && (
                    <button onClick={() => toggleMic("improve")} className={`p-1.5 rounded-md transition-all ${isListening && micTarget === "improve" ? "bg-destructive text-destructive-foreground animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-secondary"}`} title="Ditar com microfone">
                      {isListening && micTarget === "improve" ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <Textarea value={improveInput} onChange={e => setImproveInput(e.target.value)} placeholder="Cole seu prompt aqui para melhorar..." rows={4} />
              </div>
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
