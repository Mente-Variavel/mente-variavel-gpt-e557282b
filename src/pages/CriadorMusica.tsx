import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Copy, ExternalLink, Sparkles, Loader2, AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const genres = ["Sertanejo", "Gospel", "Pop", "Rock", "Trap", "Funk", "MPB"];
const themeSuggestions = ["amor", "superação", "história", "vida", "traição", "motivação"];

const SUNO_REFERRAL = "https://suno.com/invite/@vibrantsaturation527";

// Map known artist names to musical characteristics
function sanitizeArtistReferences(text: string): string {
  const artistMap: Record<string, string> = {
    "gusttavo lima": "sertanejo moderno com voz masculina grave, violão marcante, batida rítmica e refrão emocional",
    "adele": "voz feminina potente com piano emocional, crescendo dramático e atmosfera intensa",
    "marília mendonça": "sertanejo sofrência com voz feminina emocional, violão acústico e letra de dor",
    "jorge e mateus": "sertanejo universitário com harmonia vocal dupla e batida animada",
    "jorge & mateus": "sertanejo universitário com harmonia vocal dupla e batida animada",
    "anavitória": "pop folk brasileiro com vocais femininos suaves e violão acústico delicado",
    "henrique e juliano": "sertanejo moderno com voz masculina marcante e arranjo eletrônico",
    "henrique & juliano": "sertanejo moderno com voz masculina marcante e arranjo eletrônico",
    "luísa sonza": "pop brasileiro dançante com vocais femininos e batida eletrônica",
    "anitta": "pop funk brasileiro com vocais femininos sensuais e batida pesada",
    "drake": "hip hop melódico com vocais masculinos suaves e produção atmosférica",
    "taylor swift": "pop com narrativa lírica, vocais femininos claros e melodia cativante",
    "ed sheeran": "pop acústico com voz masculina suave e violão fingerstyle",
    "billie eilish": "pop alternativo minimalista com vocais sussurrados e graves profundos",
    "the weeknd": "pop moderno com influência synthwave, vocais masculinos suaves e atmosfera noturna",
    "bruno mars": "pop funk retrô com vocais masculinos vibrantes e groove dançante",
    "coldplay": "rock alternativo com sintetizadores atmosféricos e vocais emotivos",
    "linkin park": "rock alternativo com guitarras pesadas e vocais intensos",
    "beyoncé": "r&b pop com voz feminina poderosa e arranjos elaborados",
    "michael jackson": "pop dançante com vocais masculinos expressivos e groove irresistível",
    "luan santana": "sertanejo romântico com voz masculina suave e melodia envolvente",
    "zé neto e cristiano": "sertanejo sofrência com vocais masculinos emotivos e violão forte",
    "maiara e maraisa": "sertanejo feminino com harmonia vocal dupla e letra emocional",
    "alok": "eletrônica brasileira com batida envolvente e melodia cativante",
    "post malone": "pop rock melódico com vocais masculinos rasgados e produção moderna",
    "dua lipa": "pop dançante com vocais femininos fortes e batida disco moderna",
    "ariana grande": "pop com vocais femininos agudos potentes e produção polida",
    "kendrick lamar": "hip hop lírico com flow complexo e produção experimental",
    "bad bunny": "reggaeton e trap latino com vocais masculinos e ritmo contagiante",
    "rihanna": "pop r&b com vocais femininos versáteis e produção cinematográfica",
    "eminem": "rap veloz com vocais masculinos intensos e letras complexas",
    "lady gaga": "pop artístico com vocais femininos dramáticos e produção ousada",
    "sia": "pop emocional com vocais femininos poderosos e melodia marcante",
    "imagine dragons": "rock alternativo com percussão forte e refrão épico",
    "maroon 5": "pop rock com vocais masculinos suaves e groove funk leve",
    "sam smith": "pop emocional com vocais masculinos altos e arranjo minimalista",
  };

  let result = text;
  for (const [artist, description] of Object.entries(artistMap)) {
    const regex = new RegExp(`\\b${artist}\\b`, "gi");
    result = result.replace(regex, description);
  }
  // Catch remaining "estilo [Name]" / "inspirado em [Name]" / "como [Name]" / "tipo [Name]"
  result = result.replace(/(?:estilo|inspirado em|como|tipo)\s+[A-Z][a-záéíóúãõê]+(?:\s+(?:e|&)\s+[A-Z][a-záéíóúãõê]+)?/gi, (match) => {
    if (Object.keys(artistMap).some(a => match.toLowerCase().includes(a))) return match;
    return "estilo característico com elementos vocais e instrumentais marcantes";
  });
  return result;
}

function buildSunoPrompt(genero: string, tema: string, titulo: string, estilo: string): string {
  const sanitizedEstilo = estilo ? sanitizeArtistReferences(estilo) : "";
  
  let prompt = `${genero}, ${tema}, emotional, Portuguese lyrics. Title: "${titulo}".`;
  if (sanitizedEstilo) prompt += ` Style: ${sanitizedEstilo}.`;
  prompt += ` Full band arrangement with verse-chorus-bridge structure.`;

  // Compress if over 1000 chars
  if (prompt.length > 1000) {
    prompt = `${genero}, ${tema}, Portuguese. "${titulo}".`;
    if (sanitizedEstilo && prompt.length + sanitizedEstilo.length + 10 < 1000) {
      prompt += ` ${sanitizedEstilo}.`;
    }
    prompt += ` Full arrangement.`;
  }

  return prompt.slice(0, 1000);
}

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
${estilo ? `Estilo ou inspiração: ${sanitizeArtistReferences(estilo)}` : ""}

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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setLyrics(full);
            }
          } catch {}
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
    const prompt = buildSunoPrompt(genero, tema, titulo, estilo);
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
          {/* SEO intro */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Gerador de Letras de <span className="text-primary text-glow-cyan">Música com IA</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Crie letras de música rapidamente usando inteligência artificial. Escolha o gênero musical, defina o tema e gere uma letra completa em segundos. Depois utilize o prompt gerado para criar sua música no Suno.
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
                  <Input value={estilo} onChange={e => setEstilo(e.target.value)} placeholder="Ex: sertanejo moderno com voz grave, pop acústico..." />
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
                </CardContent>
              </Card>

              {/* Suno CTA Card */}
              <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Transforme sua letra em uma música real
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Agora você pode transformar a letra criada em uma música completa utilizando Inteligência Artificial.
                    Com o Suno é possível gerar vocais realistas, escolher diferentes estilos musicais e criar músicas completas em poucos segundos.
                  </p>

                  <h4 className="font-display text-sm font-semibold text-foreground mb-2">Vantagens do Suno Pro</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 mb-6 list-none">
                    <li>• Acesso ao modelo mais avançado de geração de músicas (v5)</li>
                    <li>• 2.500 créditos por mês (até aproximadamente 500 músicas)</li>
                    <li>• Direitos de uso comercial para novas músicas criadas</li>
                    <li>• Recursos avançados como personas musicais e edição avançada</li>
                    <li>• Separação da música em até 12 faixas (vocais e instrumentos)</li>
                    <li>• Upload de até 8 minutos de áudio para remix ou continuação</li>
                    <li>• Possibilidade de adicionar novos vocais ou instrumentos em músicas já existentes</li>
                    <li>• Acesso antecipado a novos recursos da plataforma</li>
                    <li>• Possibilidade de comprar créditos adicionais quando necessário</li>
                    <li>• Fila prioritária para geração de músicas</li>
                    <li>• Criação de até 10 músicas simultaneamente</li>
                  </ul>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <Button onClick={() => window.open(SUNO_REFERRAL, "_blank")} className="gap-2">
                      🎵 Transformar essa letra em música no Suno
                    </Button>
                    <Button onClick={generateSunoPrompt} variant="outline" className="gap-2">
                      ✨ Gerar Prompt para Suno
                    </Button>
                    <Button onClick={copyLyrics} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" /> Copiar letra
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    Dica: Usuários do plano Suno Pro podem criar mais músicas por mês, utilizar recursos avançados e gerar faixas com qualidade profissional.
                  </p>
                </CardContent>
              </Card>

              {showSunoPrompt && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Prompt para Suno</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary/50 rounded-lg p-4 text-sm text-foreground mb-3 font-mono break-all">{sunoPrompt}</div>
                      <p className="text-xs text-muted-foreground mb-3">{sunoPrompt.length}/1000 caracteres</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-secondary/30 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500" />
                        <span>⚠️ Prompt para Suno: máximo 1000 caracteres. Evite nomes de artistas — use apenas características do estilo.</span>
                      </div>
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
