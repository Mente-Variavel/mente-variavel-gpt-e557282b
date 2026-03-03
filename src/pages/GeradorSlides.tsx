import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Trash2, Copy, GripVertical, ChevronDown, ChevronUp, Loader2, Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

type Slide = { id: string; title: string; bullets: string[]; visual: string; notes: string; imageUrl?: string; imageLoading?: boolean };
type EbookChapter = { id: string; title: string; content: string; subchapters: string[]; imageUrl?: string; imageLoading?: boolean };

const tones = ["Profissional", "Informal", "Acadêmico", "Persuasivo", "Inspiracional"];
const types = ["Slides", "E-book", "Ambos"];

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

async function generateImage(prompt: string): Promise<string> {
  const res = await fetch(IMAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ prompt, size: "1024x1024" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro" }));
    throw new Error(err.error || "Erro ao gerar imagem");
  }
  const data = await res.json();
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
  const [title, setTitle] = useState("");
  const [tema, setTema] = useState("");
  const [publico, setPublico] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [tom, setTom] = useState("Profissional");
  const [numSlides, setNumSlides] = useState("");
  const [tipo, setTipo] = useState("Slides");
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [chapters, setChapters] = useState<EbookChapter[]>([]);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mv_slides");
    if (saved) try { setSlides(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => { if (slides.length) localStorage.setItem("mv_slides", JSON.stringify(slides)); }, [slides]);

  const generateIllustrations = async (items: Slide[] | EbookChapter[], type: "slides" | "chapters") => {
    setGeneratingImages(true);
    const toastId = toast.loading(`Gerando ilustrações (0/${items.length})...`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      toast.loading(`Gerando ilustração ${i + 1}/${items.length}...`, { id: toastId });

      const imagePrompt = type === "slides"
        ? `Professional presentation slide illustration for: "${(item as Slide).title}". Topics: ${(item as Slide).bullets.join(", ")}. Visual suggestion: ${(item as Slide).visual}. Style: clean, modern, corporate, high quality digital illustration, no text overlay.`
        : `Professional e-book chapter illustration for: "${(item as EbookChapter).title}". Content: ${(item as EbookChapter).content.slice(0, 200)}. Style: clean, modern, editorial, high quality digital illustration, no text overlay.`;

      try {
        const url = await generateImage(imagePrompt);
        if (type === "slides") {
          setSlides(prev => prev.map(s => s.id === item.id ? { ...s, imageUrl: url, imageLoading: false } : s));
        } else {
          setChapters(prev => prev.map(c => c.id === item.id ? { ...c, imageUrl: url, imageLoading: false } : c));
        }
      } catch (err) {
        console.error(`Image gen failed for ${item.id}:`, err);
        if (type === "slides") {
          setSlides(prev => prev.map(s => s.id === item.id ? { ...s, imageLoading: false } : s));
        } else {
          setChapters(prev => prev.map(c => c.id === item.id ? { ...c, imageLoading: false } : c));
        }
      }
    }

    toast.success("Ilustrações geradas!", { id: toastId });
    setGeneratingImages(false);
  };

  const generateSingleImage = async (id: string, type: "slides" | "chapters") => {
    if (type === "slides") {
      const slide = slides.find(s => s.id === id);
      if (!slide) return;
      setSlides(prev => prev.map(s => s.id === id ? { ...s, imageLoading: true } : s));
      try {
        const url = await generateImage(`Professional presentation slide illustration for: "${slide.title}". Topics: ${slide.bullets.join(", ")}. Visual: ${slide.visual}. Style: clean, modern, corporate, high quality, no text.`);
        setSlides(prev => prev.map(s => s.id === id ? { ...s, imageUrl: url, imageLoading: false } : s));
        toast.success("Ilustração gerada!");
      } catch {
        setSlides(prev => prev.map(s => s.id === id ? { ...s, imageLoading: false } : s));
        toast.error("Erro ao gerar ilustração.");
      }
    } else {
      const ch = chapters.find(c => c.id === id);
      if (!ch) return;
      setChapters(prev => prev.map(c => c.id === id ? { ...c, imageLoading: true } : c));
      try {
        const url = await generateImage(`Professional e-book chapter illustration for: "${ch.title}". Content: ${ch.content.slice(0, 200)}. Style: clean, modern, editorial, high quality, no text.`);
        setChapters(prev => prev.map(c => c.id === id ? { ...c, imageUrl: url, imageLoading: false } : c));
        toast.success("Ilustração gerada!");
      } catch {
        setChapters(prev => prev.map(c => c.id === id ? { ...c, imageLoading: false } : c));
        toast.error("Erro ao gerar ilustração.");
      }
    }
  };

  const generate = async () => {
    if (!title || !tema) { toast.error("Preencha pelo menos título e tema."); return; }
    setLoading(true);
    setSlides([]);
    setChapters([]);
    try {
      let newSlides: Slide[] = [];
      let newChapters: EbookChapter[] = [];

      if (tipo === "Slides" || tipo === "Ambos") {
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
        newSlides = parsed.map((s: any, i: number) => ({
          id: crypto.randomUUID(),
          title: s.title || `Slide ${i + 1}`,
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
          visual: s.visual || "",
          notes: s.notes || "",
          imageLoading: true,
        }));
        setSlides(newSlides);
      }

      if (tipo === "E-book" || tipo === "Ambos") {
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
        newChapters = parsed.map((c: any) => ({
          id: crypto.randomUUID(),
          title: c.title || "Capítulo",
          content: c.content || "",
          subchapters: Array.isArray(c.subchapters) ? c.subchapters : [],
          imageLoading: true,
        }));
        setChapters(newChapters);
      }

      toast.success("Estrutura gerada! Gerando ilustrações...");

      // Generate illustrations in background
      if (newSlides.length > 0) generateIllustrations(newSlides, "slides");
      if (newChapters.length > 0) generateIllustrations(newChapters, "chapters");

    } catch (err: any) {
      console.error(err);
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
    const text = slides.map((s, i) => `## Slide ${i + 1}: ${s.title}\n${s.bullets.map(b => `- ${b}`).join("\n")}\n_Visual: ${s.visual}_\n_Notas: ${s.notes}_`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const exportMarkdown = () => {
    const md = `# ${title}\n\n` + slides.map((s, i) => `## Slide ${i + 1}: ${s.title}\n\n${s.bullets.map(b => `- ${b}`).join("\n")}\n\n> 🎨 Visual: ${s.visual}\n\n> 📝 Notas: ${s.notes}`).join("\n\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "slides"}.md`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Gerador de Slides & E-book Inteligente</h1>
            <p className="text-muted-foreground mb-8">Crie apresentações e e-books com textos estruturados e ilustrações geradas por IA.</p>
          </motion.div>

          <Card className="mb-8">
            <CardContent className="pt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Título *</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Marketing Digital 2026" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tema *</label>
                  <Input value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: Estratégias de crescimento" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Público-alvo</label>
                  <Input value={publico} onChange={e => setPublico(e.target.value)} placeholder="Ex: Empreendedores" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Objetivo</label>
                  <Input value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="Ex: Educar e vender" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tom</label>
                  <Select value={tom} onValueChange={setTom}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nº de slides (opcional)</label>
                  <Input type="number" value={numSlides} onChange={e => setNumSlides(e.target.value)} placeholder="8" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generate} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando estrutura...</> : <><Layers className="w-4 h-4 mr-2" /> Gerar com Ilustrações</>}
              </Button>
            </CardContent>
          </Card>

          {/* Slides */}
          {slides.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold">📊 Slides ({slides.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => generateIllustrations(slides.filter(s => !s.imageUrl), "slides")} disabled={generatingImages}>
                    <ImageIcon className="w-3.5 h-3.5 mr-1" /> Regerar Ilustrações
                  </Button>
                  <Button variant="outline" size="sm" onClick={addSlide}><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar</Button>
                  <Button variant="outline" size="sm" onClick={copyAll}><Copy className="w-3.5 h-3.5 mr-1" /> Copiar Tudo</Button>
                  <Button variant="outline" size="sm" onClick={exportMarkdown}><Download className="w-3.5 h-3.5 mr-1" /> Markdown</Button>
                </div>
              </div>
              <div className="space-y-4">
                {slides.map((slide, idx) => (
                  <Card key={slide.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">#{idx + 1}</span>
                        <Input
                          value={slide.title}
                          onChange={e => updateSlide(slide.id, "title", e.target.value)}
                          className="text-sm font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                        />
                        <Button variant="ghost" size="icon" onClick={() => deleteSlide(slide.id)} className="ml-auto shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Illustration */}
                      <div className="relative rounded-lg overflow-hidden bg-secondary/30 border border-border/50">
                        {slide.imageLoading ? (
                          <div className="flex items-center justify-center h-48 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Gerando ilustração...</span>
                          </div>
                        ) : slide.imageUrl ? (
                          <div className="relative group">
                            <img src={slide.imageUrl} alt={slide.title} className="w-full h-48 object-cover" />
                            <button
                              onClick={() => generateSingleImage(slide.id, "slides")}
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1"
                            >
                              <ImageIcon className="w-3 h-3" /> Regerar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => generateSingleImage(slide.id, "slides")} className="flex items-center justify-center h-32 w-full gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-sm">Gerar ilustração</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Tópicos (um por linha)</label>
                        <Textarea value={slide.bullets.join("\n")} onChange={e => updateSlide(slide.id, "bullets", e.target.value.split("\n"))} rows={3} className="text-sm" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">🎨 Ideia visual</label>
                          <Input value={slide.visual} onChange={e => updateSlide(slide.id, "visual", e.target.value)} className="text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">📝 Notas do apresentador</label>
                          <Input value={slide.notes} onChange={e => updateSlide(slide.id, "notes", e.target.value)} className="text-sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* E-book */}
          {chapters.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold">📖 E-book ({chapters.length} capítulos)</h2>
                <Button variant="outline" size="sm" onClick={() => generateIllustrations(chapters.filter(c => !c.imageUrl), "chapters")} disabled={generatingImages}>
                  <ImageIcon className="w-3.5 h-3.5 mr-1" /> Regerar Ilustrações
                </Button>
              </div>
              <div className="space-y-3">
                {chapters.map(ch => (
                  <div key={ch.id} className="border border-border/50 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenChapter(openChapter === ch.id ? null : ch.id)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors">
                      <span className="font-medium text-sm">{ch.title}</span>
                      {openChapter === ch.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openChapter === ch.id && (
                      <div className="px-5 pb-4">
                        {/* Chapter illustration */}
                        <div className="mb-4 rounded-lg overflow-hidden bg-secondary/30 border border-border/50">
                          {ch.imageLoading ? (
                            <div className="flex items-center justify-center h-40 gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">Gerando ilustração...</span>
                            </div>
                          ) : ch.imageUrl ? (
                            <div className="relative group">
                              <img src={ch.imageUrl} alt={ch.title} className="w-full h-40 object-cover" />
                              <button
                                onClick={() => generateSingleImage(ch.id, "chapters")}
                                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1"
                              >
                                <ImageIcon className="w-3 h-3" /> Regerar
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => generateSingleImage(ch.id, "chapters")} className="flex items-center justify-center h-24 w-full gap-2 text-muted-foreground hover:text-primary transition-colors">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-sm">Gerar ilustração</span>
                            </button>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground leading-relaxed">
                          <p className="whitespace-pre-wrap">{ch.content}</p>
                          {ch.subchapters.length > 0 && (
                            <ul className="mt-3 list-disc list-inside">
                              {ch.subchapters.map((sc, i) => <li key={i}>{sc}</li>)}
                            </ul>
                          )}
                          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { navigator.clipboard.writeText(ch.content); toast.success("Copiado!"); }}>
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
