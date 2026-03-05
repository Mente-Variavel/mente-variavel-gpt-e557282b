import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Copy, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const genres = ["Sertanejo", "Gospel", "Pop", "Rock", "Trap", "Funk", "MPB"];
const themeSuggestions = ["amor", "superação", "história", "vida", "traição", "motivação"];

export default function CriadorMusica() {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [tema, setTema] = useState("");
  const [estilo, setEstilo] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [sunoPrompt, setSunoPrompt] = useState("");
  const [showSunoPrompt, setShowSunoPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateLyrics = async () => {
    if (!titulo || !genero || !tema) {
      toast.error("Preencha o título, gênero e tema.");
      return;
    }
    setLoading(true);
    setLyrics("");
    setShowSunoPrompt(false);
    setSunoPrompt("");

    const prompt = `Crie uma letra de música completa em português com as seguintes informações:
Título: ${titulo}
Gênero musical: ${genero}
Tema: ${tema}
${estilo ? `Estilo ou inspiração: ${estilo}` : ""}

A letra deve seguir esta estrutura:
[Título]
[Verso 1]
[Refrão]
[Verso 2]
[Refrão]
[Ponte]
[Refrão Final]

A letra deve combinar perfeitamente com o gênero ${genero} e o tema "${tema}". Use linguagem natural, rimas e emoção. Escreva apenas a letra, sem explicações.`;

    try {
      const res = await supabase.functions.invoke("chat", {
        body: { messages: [{ role: "user", content: prompt }] },
      });

      if (res.error) throw res.error;

      const reader = res.data instanceof ReadableStream
        ? res.data.getReader()
        : new Response(res.data).body?.getReader();

      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                full += content;
                setLyrics(full);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar a letra. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyLyrics = () => {
    navigator.clipboard.writeText(lyrics);
    toast.success("Letra copiada!");
  };

  const generateSunoPrompt = () => {
    const prompt = `${genero} song, ${tema}, emotional, Portuguese lyrics. Title: "${titulo}".${estilo ? ` Style: ${estilo}.` : ""} Full band arrangement.`;
    setSunoPrompt(prompt);
    setShowSunoPrompt(true);
  };

  const copySunoPrompt = () => {
    navigator.clipboard.writeText(sunoPrompt);
    toast.success("Prompt para Suno copiado!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Criador de <span className="text-primary text-glow-cyan">Letra de Música</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Gere letras completas com Inteligência Artificial. Escolha o gênero, tema e deixe a IA criar para você.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Configurar Música
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Título da música</label>
                  <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Coração de Aço" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Gênero musical</label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                    <SelectContent>
                      {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Tema da música</label>
                  <Input value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: amor, superação, história, vida, traição, motivação" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {themeSuggestions.map(t => (
                      <button key={t} onClick={() => setTema(t)} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Estilo ou inspiração (opcional)</label>
                  <Input value={estilo} onChange={e => setEstilo(e.target.value)} placeholder="Ex: Jorge & Mateus, Anavitória..." />
                </div>
                <Button onClick={generateLyrics} disabled={loading} className="w-full gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                  {loading ? "Gerando letra..." : "Gerar letra de música"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {lyrics && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Letra Gerada</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-body">{lyrics}</pre>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button onClick={copyLyrics} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" /> Copiar letra
                    </Button>
                    <Button onClick={generateSunoPrompt} variant="outline" className="gap-2">
                      <Sparkles className="w-4 h-4" /> Gerar prompt para Suno
                    </Button>
                    <Button onClick={() => window.open("https://suno.com", "_blank")} className="gap-2">
                      <ExternalLink className="w-4 h-4" /> Criar música no Suno
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {showSunoPrompt && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Prompt para Suno</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary/50 rounded-lg p-4 text-sm text-foreground mb-4 font-mono">{sunoPrompt}</div>
                      <Button onClick={copySunoPrompt} variant="outline" className="gap-2">
                        <Copy className="w-4 h-4" /> Copiar prompt
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
