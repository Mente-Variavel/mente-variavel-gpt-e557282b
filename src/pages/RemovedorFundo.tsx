import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, ImageOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function RemovedorFundo() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [fileName, setFileName] = useState("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 10MB."); return; }
    setFileName(file.name);
    setOriginalFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeBg = async () => {
    if (!originalFile) return;
    setLoading(true);
    setProgress("Carregando modelo de IA...");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Processando imagem...");
      const blob = await removeBackground(originalFile, {
        progress: (key, current, total) => {
          if (key === "compute:inference") {
            setProgress(`Removendo fundo... ${Math.round((current / total) * 100)}%`);
          }
        }
      });
      const url = URL.createObjectURL(blob);
      setResult(url);
      toast.success("Fundo removido com sucesso!");
    } catch (err) {
      console.error("Background removal error:", err);
      toast.error("Erro ao remover fundo. Tente com outra imagem.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `sem-fundo-${fileName.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Removedor de Fundo</h1>
            <p className="text-muted-foreground mb-8">Remova o fundo de imagens com IA diretamente no navegador.</p>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 transition-colors"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique ou arraste uma imagem (máx 10MB)</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP</p>
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="hidden" />
              </div>

              {preview && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Original</p>
                    <img src={preview} alt="Original" className="w-full rounded-xl border border-border object-contain max-h-64" />
                  </div>
                  {result && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Sem fundo</p>
                      <div className="rounded-xl border border-border overflow-hidden" style={{
                        backgroundImage: "linear-gradient(45deg, hsl(var(--secondary)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--secondary)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--secondary)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--secondary)) 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                      }}>
                        <img src={result} alt="Resultado" className="w-full object-contain max-h-64" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loading && progress && (
                <div className="text-center py-2">
                  <p className="text-sm text-primary animate-pulse">{progress}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={removeBg} disabled={!preview || loading} className="flex-1">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {progress || "Processando..."}</> : <><ImageOff className="w-4 h-4 mr-2" /> Remover Fundo</>}
                </Button>
                {result && (
                  <Button variant="outline" onClick={download}>
                    <Download className="w-4 h-4 mr-2" /> Baixar PNG
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
