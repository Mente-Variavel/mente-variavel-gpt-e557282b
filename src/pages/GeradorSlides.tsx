import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Plus, Trash2, Copy, ChevronDown, ChevronUp, Loader2, Download,
  ImageIcon, Lock, CreditCard, Check, BookOpen, Presentation, Sparkles,
  FileText, RotateCcw, ArrowRight, ArrowLeft, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;
const PROJECT_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-project-image`;
const PAYMENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-image-payment`;
const VERIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-image-payment`;

type Slide = { id: string; title: string; bullets: string[]; visual: string; notes: string; imageUrl?: string; imageLoading?: boolean };
type EbookChapter = { id: string; title: string; content: string; subchapters: string[]; imageUrl?: string; imageLoading?: boolean };

const tones = ["Profissional", "Informal", "Acadêmico", "Persuasivo", "Inspiracional"];

const steps = [
  { id: 1, label: "Configurar", icon: FileText },
  { id: 2, label: "Estrutura", icon: Layers },
  { id: 3, label: "Imagens", icon: ImageIcon },
  { id: 4, label: "Exportar", icon: Download },
];

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, max_tokens: 8192 }),
  });
  if (res.status === 429) throw new Error("Limite de requisições excedido.");
  if (res.status === 402) throw new Error("Créditos insuficientes.");
  if (!res.ok) throw new Error("Erro ao conectar com o serviço de IA.");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content;
}

async function generateProjectImage(prompt: string, projectId: string, isCover: boolean): Promise<string> {
  const res = await fetch(PROJECT_IMAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ prompt, projectId, isCover }),
  });
  const data = await res.json();
  if (res.status === 402 && data.error === "PAYMENT_REQUIRED") {
    throw new Error("PAYMENT_REQUIRED");
  }
  if (!res.ok) throw new Error(data.error || "Erro ao gerar imagem");
  return data.imageUrl || "";
}

function extractJson(text: string): any {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.search(/[\[{]/);
  if (start === -1) throw new Error("JSON não encontrado na resposta");
  const isArray = cleaned[start] === "[";
  const end = cleaned.lastIndexOf(isArray ? "]" : "}");
  if (end === -1) throw new Error("JSON incompleto");
  cleaned = cleaned.substring(start, end + 1);
  cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
  return JSON.parse(cleaned);
}

export default function GeradorSlides() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [tema, setTema] = useState("");
  const [publico, setPublico] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [tom, setTom] = useState("Profissional");
  const [numSlides, setNumSlides] = useState("");
  const [tipo, setTipo] = useState<"Slides" | "E-book">("Slides");
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [chapters, setChapters] = useState<EbookChapter[]>([]);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [isPaid, setIsPaid] = useState(false);
  const [imagesGenerated, setImagesGenerated] = useState(0);
  const [coverGenerated, setCoverGenerated] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Generate project ID on mount
  useEffect(() => {
    const saved = localStorage.getItem("mv_project_id");
    if (saved) {
      setProjectId(saved);
    } else {
      const newId = crypto.randomUUID();
      setProjectId(newId);
      localStorage.setItem("mv_project_id", newId);
    }
  }, []);

  // Load saved data
  useEffect(() => {
    const savedSlides = localStorage.getItem("mv_slides_data");
    const savedChapters = localStorage.getItem("mv_chapters_data");
    if (savedSlides) try { setSlides(JSON.parse(savedSlides)); setStep(2); } catch {}
    if (savedChapters) try { setChapters(JSON.parse(savedChapters)); setStep(2); } catch {}
  }, []);

  // Save data
  useEffect(() => { if (slides.length) localStorage.setItem("mv_slides_data", JSON.stringify(slides)); }, [slides]);
  useEffect(() => { if (chapters.length) localStorage.setItem("mv_chapters_data", JSON.stringify(chapters)); }, [chapters]);

  // Handle payment return
  useEffect(() => {
    const payment = searchParams.get("payment");
    const returnProject = searchParams.get("project");
    if (payment === "success" && returnProject) {
      setProjectId(returnProject);
      localStorage.setItem("mv_project_id", returnProject);
      verifyPayment(returnProject);
      toast.success("Pagamento confirmado! Imagens desbloqueadas.");
    }
  }, [searchParams]);

  // Verify payment status
  const verifyPayment = useCallback(async (pid?: string) => {
    const id = pid || projectId;
    if (!id) return;
    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      setIsPaid(data.isPaid || false);
      setImagesGenerated(data.imagesGenerated || 0);
    } catch {}
  }, [projectId]);

  useEffect(() => { if (projectId) verifyPayment(); }, [projectId, verifyPayment]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const sessionId = localStorage.getItem("mv_session_id") || crypto.randomUUID();
      localStorage.setItem("mv_session_id", sessionId);

      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ projectId, sessionId }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Erro ao iniciar pagamento.");
      }
    } catch {
      toast.error("Erro ao processar pagamento.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const generateCover = async () => {
    if (coverGenerated && !isPaid) return;
    const items = tipo === "Slides" ? slides : chapters;
    if (items.length === 0) return;

    const firstItem = items[0];
    const setter = tipo === "Slides" ? setSlides : setChapters;

    setter((prev: any[]) => prev.map((item: any, i: number) =>
      i === 0 ? { ...item, imageLoading: true } : item
    ));

    try {
      const coverPrompt = `Professional ${tipo === "Slides" ? "presentation" : "e-book"} cover image for: "${title}". Theme: ${tema}. Style: photorealistic, premium, modern, professional lighting.`;
      const url = await generateProjectImage(coverPrompt, projectId, true);
      setter((prev: any[]) => prev.map((item: any, i: number) =>
        i === 0 ? { ...item, imageUrl: url, imageLoading: false } : item
      ));
      setCoverGenerated(true);
      setImagesGenerated(prev => prev + 1);
      toast.success("Imagem de capa gerada!");
    } catch (err: any) {
      setter((prev: any[]) => prev.map((item: any, i: number) =>
        i === 0 ? { ...item, imageLoading: false } : item
      ));
      if (err.message === "PAYMENT_REQUIRED") {
        toast.error("Limite gratuito atingido. Desbloqueie para gerar mais imagens.");
      } else {
        toast.error("Erro ao gerar capa.");
      }
    }
  };

  const generateSingleImage = async (id: string) => {
    const isSlides = tipo === "Slides";
    const items = isSlides ? slides : chapters;
    const setter = isSlides ? setSlides : setChapters;
    const item = items.find((i: any) => i.id === id);
    if (!item) return;

    setter((prev: any[]) => prev.map((i: any) =>
      i.id === id ? { ...i, imageLoading: true } : i
    ));

    try {
      const prompt = isSlides
        ? `Professional presentation slide illustration for: "${(item as Slide).title}". Topics: ${(item as Slide).bullets.join(", ")}. Visual: ${(item as Slide).visual}.`
        : `Professional e-book chapter illustration for: "${(item as EbookChapter).title}". Content: ${(item as EbookChapter).content.slice(0, 200)}.`;

      const url = await generateProjectImage(prompt, projectId, false);
      setter((prev: any[]) => prev.map((i: any) =>
        i.id === id ? { ...i, imageUrl: url, imageLoading: false } : i
      ));
      setImagesGenerated(prev => prev + 1);
      toast.success("Ilustração gerada!");
    } catch (err: any) {
      setter((prev: any[]) => prev.map((i: any) =>
        i.id === id ? { ...i, imageLoading: false } : i
      ));
      if (err.message === "PAYMENT_REQUIRED") {
        toast.error("Desbloqueie imagens adicionais por US$ 1");
      } else {
        toast.error("Erro ao gerar ilustração.");
      }
    }
  };

  const generate = async () => {
    if (!title || !tema) { toast.error("Preencha pelo menos título e tema."); return; }
    setLoading(true);
    setSlides([]);
    setChapters([]);
    setCoverGenerated(false);

    // New project ID for each generation
    const newId = crypto.randomUUID();
    setProjectId(newId);
    localStorage.setItem("mv_project_id", newId);
    setImagesGenerated(0);
    setIsPaid(false);

    try {
      if (tipo === "Slides") {
        const slideCount = numSlides ? parseInt(numSlides) : 8;
        const content = await callAI([{
          role: "user",
          content: `Gere uma apresentação de slides com exatamente ${slideCount} slides.
Título: ${title}
Tema: ${tema}
Público-alvo: ${publico || "Geral"}
Objetivo: ${objetivo || "Informar e engajar"}
Tom: ${tom}

ESTRUTURA OBRIGATÓRIA:
- Slide 1: Capa (título principal e subtítulo)
- Slide 2: Agenda/Sumário
- Slides 3 a ${slideCount - 2}: Desenvolvimento do conteúdo
- Slide ${slideCount - 1}: Conclusão
- Slide ${slideCount}: CTA (chamada para ação)

Retorne APENAS um JSON array válido, sem markdown. Cada elemento deve ter:
{
  "title": "Título do slide",
  "bullets": ["Tópico 1", "Tópico 2", "Tópico 3"],
  "visual": "Descrição detalhada da imagem ilustrativa sugerida para este slide",
  "notes": "Notas do apresentador"
}`
        }]);
        const parsed = extractJson(content);
        const newSlides = parsed.map((s: any, i: number) => ({
          id: crypto.randomUUID(),
          title: s.title || `Slide ${i + 1}`,
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
          visual: s.visual || "",
          notes: s.notes || "",
        }));
        setSlides(newSlides);
      } else {
        const content = await callAI([{
          role: "user",
          content: `Gere a estrutura de um e-book completo.
Título: ${title}
Tema: ${tema}
Público-alvo: ${publico || "Geral"}
Objetivo: ${objetivo || "Educar"}
Tom: ${tom}

ESTRUTURA OBRIGATÓRIA:
- Capa
- Sumário
- 5 a 8 capítulos com conteúdo detalhado
- Conclusão
- CTA final

Retorne APENAS um JSON array válido, sem markdown. Cada elemento:
{
  "title": "Título do capítulo",
  "content": "Conteúdo detalhado do capítulo com pelo menos 3 parágrafos",
  "subchapters": ["Subtópico 1", "Subtópico 2"]
}`
        }]);
        const parsed = extractJson(content);
        const newChapters = parsed.map((c: any) => ({
          id: crypto.randomUUID(),
          title: c.title || "Capítulo",
          content: c.content || "",
          subchapters: Array.isArray(c.subchapters) ? c.subchapters : [],
        }));
        setChapters(newChapters);
      }

      toast.success("Estrutura gerada com sucesso!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (id: string, field: keyof Slide, value: any) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSlide = () => {
    setSlides(prev => [...prev, { id: crypto.randomUUID(), title: "Novo Slide", bullets: [""], visual: "", notes: "" }]);
  };

  const deleteSlide = (id: string) => setSlides(prev => prev.filter(s => s.id !== id));

  const copyAll = () => {
    const items = tipo === "Slides" ? slides : chapters;
    const text = tipo === "Slides"
      ? slides.map((s, i) => `## Slide ${i + 1}: ${s.title}\n${s.bullets.map(b => `- ${b}`).join("\n")}\n_Visual: ${s.visual}_\n_Notas: ${s.notes}_`).join("\n\n---\n\n")
      : chapters.map((c, i) => `## ${c.title}\n\n${c.content}\n\n${c.subchapters.map(sc => `- ${sc}`).join("\n")}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const exportPDF = async () => {
    const items = tipo === "Slides" ? slides : chapters;
    // Build HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #222; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 8px; color: #111; }
  h2 { font-size: 20px; margin-top: 32px; border-bottom: 2px solid #0ff; padding-bottom: 4px; }
  .slide-card { page-break-inside: avoid; margin: 24px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
  .slide-num { font-size: 12px; color: #888; font-weight: bold; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
  .visual { font-style: italic; color: #666; font-size: 13px; margin-top: 8px; }
  .notes { background: #f5f5f5; padding: 8px 12px; border-radius: 4px; font-size: 13px; margin-top: 8px; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
  .chapter { margin: 32px 0; }
  .chapter p { line-height: 1.7; }
  @media print { .slide-card { page-break-inside: avoid; } }
</style>
</head><body>
<h1>${title}</h1>
<p style="color:#666">${tema} • ${publico || "Geral"} • Tom: ${tom}</p>
<hr />
${tipo === "Slides"
  ? slides.map((s, i) => `
    <div class="slide-card">
      <span class="slide-num">SLIDE ${i + 1}</span>
      <h2>${s.title}</h2>
      ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.title}" />` : ""}
      <ul>${s.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      ${s.visual ? `<p class="visual">🎨 ${s.visual}</p>` : ""}
      ${s.notes ? `<div class="notes">📝 ${s.notes}</div>` : ""}
    </div>`).join("")
  : chapters.map((c, i) => `
    <div class="chapter">
      <h2>${c.title}</h2>
      ${c.imageUrl ? `<img src="${c.imageUrl}" alt="${c.title}" />` : ""}
      <p>${c.content.replace(/\n/g, "<br/>")}</p>
      ${c.subchapters.length ? `<ul>${c.subchapters.map(sc => `<li>${sc}</li>`).join("")}</ul>` : ""}
    </div>`).join("")
}
</body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    toast.success("PDF pronto para impressão!");
  };

  const exportMarkdown = () => {
    const md = tipo === "Slides"
      ? `# ${title}\n\n` + slides.map((s, i) => `## Slide ${i + 1}: ${s.title}\n\n${s.bullets.map(b => `- ${b}`).join("\n")}\n\n> 🎨 Visual: ${s.visual}\n\n> 📝 Notas: ${s.notes}`).join("\n\n---\n\n")
      : `# ${title}\n\n` + chapters.map(c => `## ${c.title}\n\n${c.content}\n\n${c.subchapters.map(sc => `- ${sc}`).join("\n")}`).join("\n\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "projeto"}.md`;
    a.click();
  };

  const resetProject = () => {
    setSlides([]);
    setChapters([]);
    setTitle("");
    setTema("");
    setPublico("");
    setObjetivo("");
    setTom("Profissional");
    setNumSlides("");
    setCoverGenerated(false);
    setStep(1);
    localStorage.removeItem("mv_slides_data");
    localStorage.removeItem("mv_chapters_data");
    const newId = crypto.randomUUID();
    setProjectId(newId);
    localStorage.setItem("mv_project_id", newId);
    setImagesGenerated(0);
    setIsPaid(false);
  };

  const hasContent = slides.length > 0 || chapters.length > 0;
  const items = tipo === "Slides" ? slides : chapters;
  const freeImageUsed = imagesGenerated >= 1;
  const canGenerateMore = isPaid || !freeImageUsed;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Gerador de {tipo === "Slides" ? "Slides" : "E-book"} com IA
                </h1>
                <p className="text-sm text-muted-foreground">Crie conteúdo profissional com ilustrações realistas</p>
              </div>
            </div>
          </motion.div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex items-center">
                    <button
                      onClick={() => {
                        if (s.id === 1 || hasContent) setStep(s.id);
                      }}
                      className={`flex flex-col items-center gap-1.5 transition-all ${
                        isActive ? "text-primary" : isDone ? "text-primary/60" : "text-muted-foreground/40"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                        : isDone ? "border-primary/50 bg-primary/5"
                        : "border-border bg-secondary/30"
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-medium hidden sm:block">{s.label}</span>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 rounded ${
                        step > s.id ? "bg-primary/50" : "bg-border"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1: Configuration */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Card className="border-primary/10 shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      Configuração do Projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Type selector */}
                    <div className="flex gap-3">
                      <Button
                        variant={tipo === "Slides" ? "default" : "outline"}
                        onClick={() => setTipo("Slides")}
                        className="flex-1 gap-2"
                      >
                        <Presentation className="w-4 h-4" /> Slides
                      </Button>
                      <Button
                        variant={tipo === "E-book" ? "default" : "outline"}
                        onClick={() => setTipo("E-book")}
                        className="flex-1 gap-2"
                      >
                        <BookOpen className="w-4 h-4" /> E-book
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Título *</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Marketing Digital 2026" className="bg-secondary/30 border-border/50" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Tema *</label>
                        <Input value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: Estratégias de crescimento" className="bg-secondary/30 border-border/50" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Público-alvo</label>
                        <Input value={publico} onChange={e => setPublico(e.target.value)} placeholder="Ex: Empreendedores" className="bg-secondary/30 border-border/50" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Objetivo</label>
                        <Input value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="Ex: Educar e vender" className="bg-secondary/30 border-border/50" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Tom</label>
                        <Select value={tom} onValueChange={setTom}>
                          <SelectTrigger className="bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                          <SelectContent>{tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    {tipo === "Slides" && (
                      <div className="max-w-xs">
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Nº de slides</label>
                        <Input type="number" value={numSlides} onChange={e => setNumSlides(e.target.value)} placeholder="8" className="bg-secondary/30 border-border/50" />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button onClick={generate} disabled={loading || !title || !tema} className="flex-1 gap-2 h-12 text-base">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando...</> : <><Zap className="w-5 h-5" /> Gerar Estrutura</>}
                      </Button>
                      <Button variant="outline" onClick={resetProject} className="gap-2">
                        <RotateCcw className="w-4 h-4" /> Limpar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Structure */}
            {step === 2 && hasContent && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {tipo === "Slides" ? <Presentation className="w-5 h-5 text-primary" /> : <BookOpen className="w-5 h-5 text-primary" />}
                    {tipo === "Slides" ? `Slides (${slides.length})` : `E-book (${chapters.length} capítulos)`}
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    {tipo === "Slides" && (
                      <Button variant="outline" size="sm" onClick={addSlide} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5">
                      <Copy className="w-3.5 h-3.5" /> Copiar Tudo
                    </Button>
                  </div>
                </div>

                {/* Slides list */}
                {tipo === "Slides" && (
                  <div className="space-y-3">
                    {slides.map((slide, idx) => (
                      <Card key={slide.id} className="border-border/30 hover:border-primary/20 transition-colors">
                        <CardHeader className="pb-2 px-4 pt-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">#{idx + 1}</Badge>
                            <Input
                              value={slide.title}
                              onChange={e => updateSlide(slide.id, "title", e.target.value)}
                              className="text-sm font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                            />
                            <Button variant="ghost" size="icon" onClick={() => deleteSlide(slide.id)} className="ml-auto shrink-0 h-8 w-8">
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-4">
                          <div>
                            <label className="text-xs text-muted-foreground font-medium">Tópicos</label>
                            <Textarea value={slide.bullets.join("\n")} onChange={e => updateSlide(slide.id, "bullets", e.target.value.split("\n"))} rows={3} className="text-sm bg-secondary/20" />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground font-medium">🎨 Ideia visual</label>
                              <Input value={slide.visual} onChange={e => updateSlide(slide.id, "visual", e.target.value)} className="text-sm bg-secondary/20" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-medium">📝 Notas</label>
                              <Input value={slide.notes} onChange={e => updateSlide(slide.id, "notes", e.target.value)} className="text-sm bg-secondary/20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Chapters list */}
                {tipo === "E-book" && (
                  <div className="space-y-2">
                    {chapters.map((ch, idx) => (
                      <div key={ch.id} className="border border-border/30 rounded-xl overflow-hidden hover:border-primary/20 transition-colors">
                        <button onClick={() => setOpenChapter(openChapter === ch.id ? null : ch.id)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] font-mono px-2">{idx + 1}</Badge>
                            <span className="font-medium text-sm">{ch.title}</span>
                          </div>
                          {openChapter === ch.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <AnimatePresence>
                          {openChapter === ch.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4">
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                  <p className="whitespace-pre-wrap">{ch.content}</p>
                                  {ch.subchapters.length > 0 && (
                                    <ul className="mt-3 list-disc list-inside">
                                      {ch.subchapters.map((sc, i) => <li key={i}>{sc}</li>)}
                                    </ul>
                                  )}
                                  <Button variant="ghost" size="sm" className="mt-2 gap-1.5" onClick={() => { navigator.clipboard.writeText(ch.content); toast.success("Copiado!"); }}>
                                    <Copy className="w-3.5 h-3.5" /> Copiar
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button onClick={() => { setStep(3); if (!coverGenerated) generateCover(); }} className="gap-2">
                    Imagens <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Images */}
            {step === 3 && hasContent && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Ilustrações
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1.5">
                      <ImageIcon className="w-3 h-3" />
                      {imagesGenerated} gerada{imagesGenerated !== 1 ? "s" : ""}
                    </Badge>
                    {isPaid && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 gap-1">
                        <Check className="w-3 h-3" /> Desbloqueado
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Free/Paid Status Card */}
                {!isPaid && (
                  <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
                    <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {!freeImageUsed
                            ? "🎁 Você tem 1 imagem gratuita (capa do projeto)"
                            : "🔒 Imagens adicionais requerem desbloqueio"
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Desbloqueie todas as imagens do projeto por apenas US$ 1
                        </p>
                      </div>
                      <Button onClick={handlePayment} disabled={paymentLoading} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shrink-0">
                        {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Desbloquear por US$ 1
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Image Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item: any, idx: number) => {
                    const isCoverSlot = idx === 0;
                    const isLocked = !isCoverSlot && !isPaid && freeImageUsed;

                    return (
                      <Card key={item.id} className="overflow-hidden border-border/30">
                        <div className="relative aspect-[4/3] bg-secondary/20">
                          {item.imageLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">Gerando...</span>
                            </div>
                          ) : item.imageUrl ? (
                            <div className="relative group h-full">
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button size="sm" variant="secondary" onClick={() => generateSingleImage(item.id)} className="gap-1.5">
                                  <RotateCcw className="w-3.5 h-3.5" /> Regerar
                                </Button>
                              </div>
                              {isCoverSlot && (
                                <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-[10px]">CAPA</Badge>
                              )}
                            </div>
                          ) : isLocked ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/40 backdrop-blur-sm">
                              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <span className="text-xs text-muted-foreground text-center px-4">Desbloqueie para gerar</span>
                              <Button size="sm" onClick={handlePayment} disabled={paymentLoading} className="gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                                <CreditCard className="w-3 h-3" /> US$ 1
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => isCoverSlot ? generateCover() : generateSingleImage(item.id)}
                              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-xs">{isCoverSlot ? "Gerar capa" : "Gerar ilustração"}</span>
                            </button>
                          )}
                        </div>
                        <div className="px-3 py-2">
                          <p className="text-xs font-medium truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {tipo === "Slides" ? `Slide ${idx + 1}` : `Capítulo ${idx + 1}`}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Estrutura
                  </Button>
                  <Button onClick={() => setStep(4)} className="gap-2">
                    Exportar <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Export */}
            {step === 4 && hasContent && (
              <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Download className="w-5 h-5 text-primary" />
                  Exportar Projeto
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                  <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group" onClick={exportPDF}>
                    <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Exportar como PDF</p>
                        <p className="text-xs text-muted-foreground mt-1">Baixe o conteúdo completo com imagens</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/30 hover:border-primary/20 transition-colors cursor-pointer group" onClick={exportMarkdown}>
                    <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
                        <Download className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">Exportar Markdown</p>
                        <p className="text-xs text-muted-foreground mt-1">Texto formatado para uso em outras ferramentas</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Imagens
                  </Button>
                  <Button variant="outline" onClick={resetProject} className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Novo Projeto
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
