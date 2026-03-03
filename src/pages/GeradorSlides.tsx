import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Trash2, Copy, GripVertical, ChevronDown, ChevronUp, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Slide = { id: string; title: string; bullets: string[]; visual: string; notes: string };
type EbookChapter = { id: string; title: string; content: string; subchapters: string[] };

const tones = ["Profissional", "Informal", "Acadêmico", "Persuasivo", "Inspiracional"];
const types = ["Slides", "E-book", "Ambos"];

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

  useEffect(() => {
    const saved = localStorage.getItem("mv_slides");
    if (saved) try { setSlides(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => { if (slides.length) localStorage.setItem("mv_slides", JSON.stringify(slides)); }, [slides]);

  const generate = async () => {
    if (!title || !tema) { toast.error("Preencha pelo menos título e tema."); return; }
    setLoading(true);
    try {
      const prompt = `Gere uma estrutura de ${tipo === "Slides" ? "apresentação em slides" : tipo === "E-book" ? "e-book" : "apresentação em slides E e-book"} com o seguinte:
Título: ${title}
Tema: ${tema}
Público-alvo: ${publico || "Geral"}
Objetivo: ${objetivo || "Informar"}
Tom: ${tom}
${numSlides ? `Número de slides: ${numSlides}` : ""}

${tipo !== "E-book" ? `Para slides, retorne um JSON array com objetos: { "title": string, "bullets": string[], "visual": string, "notes": string }. Inclua: Capa, Agenda, slides de desenvolvimento, Conclusão e CTA.` : ""}
${tipo !== "Slides" ? `Para e-book, retorne um JSON array com objetos: { "title": string, "content": string, "subchapters": string[] }. Inclua: Capa, Sumário, Capítulos, Conclusão e CTA final.` : ""}
Retorne APENAS o JSON, sem markdown.`;

      const res = await supabase.functions.invoke("chat", {
        body: { messages: [{ role: "user", content: prompt }] },
      });

      const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Resposta inválida");

      const parsed = JSON.parse(jsonMatch[0]);

      if (tipo === "E-book") {
        setChapters(parsed.map((c: any, i: number) => ({ id: crypto.randomUUID(), title: c.title || `Capítulo ${i + 1}`, content: c.content || "", subchapters: c.subchapters || [] })));
        setSlides([]);
      } else {
        setSlides(parsed.map((s: any, i: number) => ({ id: crypto.randomUUID(), title: s.title || `Slide ${i + 1}`, bullets: s.bullets || [], visual: s.visual || "", notes: s.notes || "" })));
        if (tipo === "Ambos") {
          // Also generate ebook from same response or second call
          setChapters(parsed.map((s: any) => ({ id: crypto.randomUUID(), title: s.title, content: s.bullets?.join("\n") || "", subchapters: [] })));
        } else {
          setChapters([]);
        }
      }
      toast.success("Estrutura gerada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar. Tente novamente.");
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
    const text = slides.map(s => `## ${s.title}\n${s.bullets.map(b => `- ${b}`).join("\n")}\n_Visual: ${s.visual}_\n_Notas: ${s.notes}_`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const exportMarkdown = () => {
    const md = slides.map(s => `## ${s.title}\n\n${s.bullets.map(b => `- ${b}`).join("\n")}\n\n> Visual: ${s.visual}\n\n> Notas: ${s.notes}`).join("\n\n---\n\n");
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
            <p className="text-muted-foreground mb-8">Crie apresentações e e-books estruturados com IA.</p>
          </motion.div>

          {/* Form */}
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
                  <Input type="number" value={numSlides} onChange={e => setNumSlides(e.target.value)} placeholder="10" />
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
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</> : <><Layers className="w-4 h-4 mr-2" /> Gerar Estrutura</>}
              </Button>
            </CardContent>
          </Card>

          {/* Slides */}
          {slides.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Slides ({slides.length})</h2>
                <div className="flex gap-2">
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
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
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
                      <div>
                        <label className="text-xs text-muted-foreground">Tópicos (um por linha)</label>
                        <Textarea
                          value={slide.bullets.join("\n")}
                          onChange={e => updateSlide(slide.id, "bullets", e.target.value.split("\n"))}
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Ideia visual</label>
                          <Input value={slide.visual} onChange={e => updateSlide(slide.id, "visual", e.target.value)} className="text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Notas do apresentador</label>
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
              <h2 className="text-xl font-bold mb-4">E-book ({chapters.length} capítulos)</h2>
              <div className="space-y-3">
                {chapters.map(ch => (
                  <div key={ch.id} className="border border-border/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <span className="font-medium text-sm">{ch.title}</span>
                      {openChapter === ch.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openChapter === ch.id && (
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
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
