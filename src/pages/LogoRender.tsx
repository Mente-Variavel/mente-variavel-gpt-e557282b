import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, Image as ImageIcon, Download, Loader2, X, RotateCw, Move, Maximize } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { compositeLogo, type CompositeMode } from "@/lib/logoComposite";
import { motion } from "framer-motion";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogoRender() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<CompositeMode>("auto");
  const [scale, setScale] = useState(0.3);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0.5);
  const [posY, setPosY] = useState(0.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "generating-scene" | "compositing" | "done">("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione um arquivo de imagem.", variant: "destructive" });
      return;
    }
    setLogoFile(file);
    const dataUrl = await fileToDataUrl(file);
    setLogoPreview(dataUrl);
    setFinalImage(null);
    setBaseImage(null);
    setStep("idle");
  }, []);

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFinalImage(null);
    setBaseImage(null);
    setStep("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!logoPreview) {
      toast({ title: "Erro", description: "Faça upload do logo primeiro.", variant: "destructive" });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Erro", description: "Descreva o que deseja criar.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setFinalImage(null);
    setBaseImage(null);

    try {
      // STEP 1: Generate base scene (NO logo)
      setStep("generating-scene");
      const scenePrompt = `Photorealistic image of ${prompt.trim()}. Leave a clean, visible, empty surface suitable for logo placement. Do NOT include any text, logo, branding, watermark, or symbol. Clean surface only. DSLR photography, 85mm lens, studio lighting, high detail.`;

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: scenePrompt },
      });

      if (error || !data?.imageUrl) {
        throw new Error(data?.error || error?.message || "Falha ao gerar cena base");
      }

      setBaseImage(data.imageUrl);

      // STEP 2: Composite logo client-side
      setStep("compositing");
      const result = await compositeLogo({
        baseImageUrl: data.imageUrl,
        logoDataUrl: logoPreview,
        mode,
        scale,
        rotation,
        positionX: posX,
        positionY: posY,
      });

      setFinalImage(result);
      setStep("done");
    } catch (err: any) {
      console.error("Logo render error:", err);
      toast({
        title: "Erro na geração",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      setStep("idle");
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-composite when controls change (if base image exists)
  const recomposite = useCallback(async () => {
    if (!baseImage || !logoPreview) return;
    setStep("compositing");
    try {
      const result = await compositeLogo({
        baseImageUrl: baseImage,
        logoDataUrl: logoPreview,
        mode,
        scale,
        rotation,
        positionX: posX,
        positionY: posY,
      });
      setFinalImage(result);
      setStep("done");
    } catch {
      toast({ title: "Erro", description: "Falha ao recompor imagem.", variant: "destructive" });
    }
  }, [baseImage, logoPreview, mode, scale, rotation, posX, posY]);

  const downloadImage = () => {
    if (!finalImage) return;
    const a = document.createElement("a");
    a.href = finalImage;
    a.download = "logo-render.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Aplicação Universal de <span className="text-primary">Logo</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Envie seu logo e descreva qualquer cena. A IA cria o cenário e seu logo <strong>exato</strong> é aplicado por composição digital.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT: Controls */}
          <div className="space-y-5">
            {/* Logo Upload */}
            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <Label className="text-foreground font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Upload do Logo (PNG recomendado)
                </Label>
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 rounded-lg border border-border bg-secondary/30 p-2"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para selecionar</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Prompt */}
            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <Label className="text-foreground font-semibold">Descreva o que deseja criar</Label>
                <Textarea
                  placeholder="Ex: uma camiseta branca, a fachada de um prédio, uma embalagem de café, uma caneca..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px] bg-input border-border"
                />
              </CardContent>
            </Card>

            {/* Mode */}
            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <Label className="text-foreground font-semibold">Modo de Aplicação</Label>
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as CompositeMode)} className="grid grid-cols-3 gap-2">
                  {([
                    ["auto", "Auto"],
                    ["sticker", "Adesivo"],
                    ["realistic", "Realista"],
                  ] as const).map(([val, label]) => (
                    <label
                      key={val}
                      className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors text-sm ${
                        mode === val ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={val} />
                      {label}
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Sliders */}
            <Card className="glass">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                  <Label className="text-foreground text-sm flex items-center gap-2">
                    <Maximize className="w-3.5 h-3.5 text-primary" /> Tamanho: {Math.round(scale * 100)}%
                  </Label>
                  <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={0.05} max={0.8} step={0.01} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-sm flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 text-primary" /> Rotação: {rotation}°
                  </Label>
                  <Slider value={[rotation]} onValueChange={([v]) => setRotation(v)} min={-180} max={180} step={1} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-sm flex items-center gap-2">
                    <Move className="w-3.5 h-3.5 text-primary" /> Posição X: {Math.round(posX * 100)}%
                  </Label>
                  <Slider value={[posX]} onValueChange={([v]) => setPosX(v)} min={0.05} max={0.95} step={0.01} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-sm flex items-center gap-2">
                    <Move className="w-3.5 h-3.5 text-primary" /> Posição Y: {Math.round(posY * 100)}%
                  </Label>
                  <Slider value={[posY]} onValueChange={([v]) => setPosY(v)} min={0.05} max={0.95} step={0.01} />
                </div>

                {baseImage && (
                  <Button variant="secondary" onClick={recomposite} className="w-full">
                    Reaplicar Logo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !logoPreview || !prompt.trim()}
              className="w-full h-12 text-base font-bold glow-cyan"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {step === "generating-scene" ? "Gerando cenário..." : "Aplicando logo..."}
                </>
              ) : (
                "GERAR COM LOGO EXATO"
              )}
            </Button>
          </div>

          {/* RIGHT: Result */}
          <div className="space-y-4">
            <Card className="glass min-h-[400px] flex items-center justify-center">
              <CardContent className="p-4 w-full">
                {finalImage ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <img
                      src={finalImage}
                      alt="Resultado final"
                      className="w-full rounded-lg border border-border"
                    />
                    <Button onClick={downloadImage} className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" /> Baixar Imagem
                    </Button>
                  </motion.div>
                ) : baseImage ? (
                  <div className="space-y-2 text-center">
                    <img src={baseImage} alt="Cena base" className="w-full rounded-lg border border-border opacity-60" />
                    <p className="text-sm text-muted-foreground">Aplicando logo...</p>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      {isGenerating ? "Gerando cenário sem logo..." : "O resultado aparecerá aqui"}
                    </p>
                    {isGenerating && <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-primary" />}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow info */}
            <div className="text-xs text-muted-foreground space-y-1 px-1">
              <p>✅ <strong>Etapa 1:</strong> IA gera o cenário/produto SEM logo</p>
              <p>✅ <strong>Etapa 2:</strong> Seu logo EXATO é sobreposto digitalmente</p>
              <p>✅ O logo nunca é recriado ou modificado pela IA</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
