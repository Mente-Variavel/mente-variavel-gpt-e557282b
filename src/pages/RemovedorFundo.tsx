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
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida."); return; }
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeBg = async () => {
    if (!preview) return;
    setLoading(true);
    // Placeholder: In production, call a background removal API
    await new Promise(r => setTimeout(r, 2000));
    // For demo, just show the same image with a note
    setResult(preview);
    setLoading(false);
    toast.info("Demonstração: conecte uma API de remoção de fundo para resultado real.");
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `sem-fundo-${fileName}`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Removedor de Fundo</h1>
            <p className="text-muted-foreground mb-8">Remova o fundo de imagens com um clique.</p>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Upload */}
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 transition-colors"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique ou arraste uma imagem</p>
                <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </div>

              {/* Preview */}
              {preview && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Original</p>
                    <img src={preview} alt="Original" className="w-full rounded-xl border border-border" />
                  </div>
                  {result && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Sem fundo</p>
                      <img src={result} alt="Resultado" className="w-full rounded-xl border border-border bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')]" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={removeBg} disabled={!preview || loading} className="flex-1">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</> : <><ImageOff className="w-4 h-4 mr-2" /> Remover Fundo</>}
                </Button>
                {result && (
                  <Button variant="outline" onClick={download}>
                    <Download className="w-4 h-4 mr-2" /> Baixar
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
