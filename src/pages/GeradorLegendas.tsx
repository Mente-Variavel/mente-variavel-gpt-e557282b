import { useState, useCallback, useEffect } from "react";
import { Download, Sparkles, FileText, ArrowLeft, Loader2, Film } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoUploader from "@/components/subtitles/VideoUploader";
import SubtitleEditor, { type SubtitleLine } from "@/components/subtitles/SubtitleEditor";
import SubtitlePreview from "@/components/subtitles/SubtitlePreview";
import SubtitleCustomizer from "@/components/subtitles/SubtitleCustomizer";
import SubtitlePlanModal from "@/components/subtitles/SubtitlePlanModal";
import WatermarkToggle from "@/components/subtitles/WatermarkToggle";
import UsageBadge from "@/components/subtitles/UsageBadge";
import { downloadSRT, downloadTXT } from "@/lib/srt-export";
import { exportVideoWithSubtitles } from "@/lib/mp4-export";
import { DEFAULT_STYLE_CONFIG, type SubtitleStyleConfig } from "@/lib/subtitle-styles";
import { useSubtitleUsage } from "@/hooks/useSubtitleUsage";
import { loadSubtitleFonts } from "@/lib/subtitle-fonts-loader";

const SETTINGS_STORAGE_KEY = "mv-subtitle-full-settings";

const MAX_DURATION_SECONDS = 60;

const GeradorLegendas = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [step, setStep] = useState<"upload" | "editor">("upload");
  const [styleConfig, setStyleConfig] = useState<SubtitleStyleConfig>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STYLE_CONFIG, ...parsed.styleConfig };
      }
    } catch {}
    return DEFAULT_STYLE_CONFIG;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.watermarkEnabled ?? true;
      }
    } catch {}
    return true;
  });

  const { usage, refetchUsage } = useSubtitleUsage();

  const handleExportMP4 = useCallback(async () => {
    if (!videoUrl || subtitles.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      await exportVideoWithSubtitles(videoUrl, subtitles, styleConfig, (p) => setExportProgress(p.percent), { showWatermark: watermarkEnabled });
      toast.success("Vídeo exportado com legendas!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Erro ao exportar vídeo");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [videoUrl, subtitles, styleConfig, watermarkEnabled]);

  const handleVideoSelect = useCallback((file: File, url: string) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      if (video.duration > MAX_DURATION_SECONDS) {
        toast.error(`Vídeo excede o limite de ${MAX_DURATION_SECONDS} segundos. Duração: ${Math.round(video.duration)}s`);
        URL.revokeObjectURL(url);
        return;
      }
      setVideoFile(file);
      setVideoUrl(url);
    };
  }, []);

  const handleClearVideo = useCallback(() => {
    setVideoFile(null);
    setVideoUrl("");
    setSubtitles([]);
    setStep("upload");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!videoFile) return;
    if (usage && usage.remaining <= 0) {
      toast.error("Você atingiu o limite gratuito. Assine o plano para continuar gerando legendas.");
      setShowPlanModal(true);
      return;
    }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile, videoFile.name);
      formData.append("language", "pt");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-video`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        if (err.limit_reached) {
          toast.error(err.error);
          setShowPlanModal(true);
          return;
        }
        throw new Error(err.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      setSubtitles(data.subtitles);
      setStep("editor");
      toast.success(`Transcrição concluída! ${data.subtitles.length} legendas geradas.`);
      refetchUsage();
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao transcrever vídeo");
    } finally {
      setIsProcessing(false);
    }
  }, [videoFile, usage, refetchUsage]);

  const handleWatermarkToggle = useCallback(() => {
    setShowPlanModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 pt-24">
        {step === "upload" ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Ferramenta IA
              </div>
              <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-primary text-glow-cyan sm:text-4xl">
                Gerador de Legendas
                <br />
                para Vídeos
              </h1>
              <p className="text-base text-muted-foreground">
                Crie legendas automáticas para seus vídeos em segundos usando inteligência artificial.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ideal para criadores de conteúdo que produzem vídeos para:
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">Instagram Reels</span>
                <span className="rounded-full border border-border px-3 py-1">TikTok</span>
                <span className="rounded-full border border-border px-3 py-1">YouTube Shorts</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Envie seu vídeo, gere a legenda automaticamente e exporte o vídeo pronto para postar.
              </p>
            </div>

            {usage && (
              <div className="mb-4">
                <UsageBadge used={usage.used} limit={usage.limit} onPlanClick={() => setShowPlanModal(true)} />
              </div>
            )}

            <VideoUploader onVideoSelect={handleVideoSelect} videoFile={videoFile} onClear={handleClearVideo} />

            {videoFile && (
              <button
                onClick={handleGenerate}
                disabled={isProcessing || (usage !== null && usage.remaining <= 0)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg glow-cyan disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Transcrevendo...</>
                ) : (
                  <><Sparkles className="h-5 w-5" /> Gerar Legendas</>
                )}
              </button>
            )}

            {/* Plan explanation */}
            <div className="mt-10 rounded-xl border border-border bg-card/50 p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-primary text-glow-cyan">
                Plano Criador — $5/mês
              </h2>
              <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>Por apenas <span className="font-semibold text-foreground">$5 por mês</span> você pode gerar até <span className="font-semibold text-primary">300 vídeos</span> com legendas automáticas.</p>
                <p>Cada vídeo pode ter até 60 segundos.</p>
                <p>Isso equivale a mais de <span className="font-semibold text-accent">5 horas</span> de vídeos legendados todos os meses usando inteligência artificial.</p>
                <p>Ideal para quem cria conteúdo frequentemente e precisa de uma solução rápida e profissional.</p>
              </div>
              <button onClick={() => setShowPlanModal(true)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20">
                <Sparkles className="h-4 w-4" /> Ver Plano Premium
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={handleClearVideo} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Novo vídeo
            </button>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr_1.2fr]">
              <div className="order-2 lg:order-1">
                <SubtitleCustomizer config={styleConfig} onChange={setStyleConfig} watermarkEnabled={watermarkEnabled} />
              </div>

              <div className="order-1 lg:order-2">
                <SubtitlePreview videoUrl={videoUrl} subtitles={subtitles} onTimeUpdate={setCurrentTime} styleConfig={styleConfig} />
              </div>

              <div className="order-3 flex flex-col gap-4">
                {usage && <UsageBadge used={usage.used} limit={usage.limit} onPlanClick={() => setShowPlanModal(true)} />}

                <SubtitleEditor subtitles={subtitles} onUpdate={setSubtitles} currentTime={currentTime} />

                {subtitles.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <WatermarkToggle watermarkEnabled={watermarkEnabled} onToggle={handleWatermarkToggle} onPlanClick={() => setShowPlanModal(true)} />

                    <div className="flex gap-3">
                      <button onClick={() => downloadSRT(subtitles)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 glow-cyan">
                        <Download className="h-4 w-4" /> .SRT
                      </button>
                      <button onClick={() => downloadTXT(subtitles)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 py-3 text-sm font-semibold text-accent transition-all hover:bg-accent/10 glow-green">
                        <FileText className="h-4 w-4" /> .TXT
                      </button>
                    </div>
                    <button onClick={handleExportMP4} disabled={isExporting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg glow-cyan disabled:opacity-50">
                      {isExporting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Exportando... {exportProgress}%</>
                      ) : (
                        <><Film className="h-4 w-4" /> Exportar MP4 com Legendas</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
      <SubtitlePlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} />
    </div>
  );
};

export default GeradorLegendas;
