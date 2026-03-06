import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";
import type { SubtitleStyleConfig } from "./subtitle-styles";
import { HIGHLIGHT_COLORS, getCanvasFontFamily } from "./subtitle-styles";

const getColor = (colorId: string): string =>
  HIGHLIGHT_COLORS.find((c) => c.id === colorId)?.color ?? "hsl(185 100% 50%)";

const NEON_BLUE = "hsl(185, 100%, 50%)";
const NEON_GREEN = "hsl(155, 100%, 45%)";

function drawWatermark(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
  const scale = canvasWidth / 360;
  const fontSize = 12 * scale;
  ctx.save();
  ctx.font = `600 ${fontSize}px "Orbitron", "Inter", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = canvasWidth / 2;
  const y = canvasHeight - 30 * scale;
  ctx.globalAlpha = 0.35;
  ctx.shadowColor = NEON_BLUE;
  ctx.shadowBlur = 8 * scale;
  ctx.fillStyle = "white";
  ctx.fillText("MENTE VARIÁVEL", x, y);
  const textWidth = ctx.measureText("MENTE VARIÁVEL").width;
  ctx.strokeStyle = NEON_GREEN;
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(x - textWidth / 2, y + fontSize * 0.7);
  ctx.lineTo(x + textWidth / 2, y + fontSize * 0.7);
  ctx.stroke();
  ctx.restore();
}

function drawSubtitle(
  ctx: CanvasRenderingContext2D, sub: SubtitleLine, time: number,
  config: SubtitleStyleConfig, canvasWidth: number, canvasHeight: number
) {
  const words = sub.text.split(" ");
  const progress = (time - sub.start) / (sub.end - sub.start);
  const activeWordIndex = Math.floor(progress * words.length);
  const highlightColor = getColor(config.highlightColor);
  const scale = canvasWidth / 360;
  const fontSize = config.fontSize * scale;
  const padding = config.backgroundPadding * scale;
  const fontFamily = getCanvasFontFamily(config.fontId);

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textMetrics = ctx.measureText(sub.text);
  const textWidth = textMetrics.width;
  const bgWidth = textWidth + padding * 3;
  const bgHeight = fontSize + padding * 2;

  let y: number;
  const offsetPx = (config.verticalOffset / 100) * canvasHeight;
  switch (config.position) {
    case "top": y = offsetPx + bgHeight / 2; break;
    case "center": y = canvasHeight / 2; break;
    default: y = canvasHeight - offsetPx - bgHeight / 2; break;
  }
  const x = canvasWidth / 2;

  if (config.showBackground) {
    const opacity = config.backgroundOpacity / 100;
    const bgColor = config.styleId === "mente-variavel" ? `rgba(8, 12, 20, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
    const radius = 8 * scale;
    const bx = x - bgWidth / 2;
    const by = y - bgHeight / 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bgWidth, bgHeight, radius);
    ctx.fillStyle = bgColor;
    ctx.fill();
    if (config.styleId === "mente-variavel") {
      ctx.strokeStyle = NEON_GREEN;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(bx, by + bgHeight);
      ctx.lineTo(bx + bgWidth, by + bgHeight);
      ctx.stroke();
    }
  }

  const wordWidths = words.map((w) => ctx.measureText(w + " ").width);
  const totalWordsWidth = wordWidths.reduce((a, b) => a + b, 0);
  let wx = x - totalWordsWidth / 2;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let color = "white";
    let weight = "bold";
    let wFontSize = fontSize;

    switch (config.styleId) {
      case "dynamic-highlight":
        color = i === activeWordIndex ? highlightColor : "white";
        weight = i === activeWordIndex ? "900" : "bold";
        break;
      case "alternating": {
        const colors = ["white", NEON_BLUE, NEON_GREEN];
        color = colors[i % 3];
        break;
      }
      case "emphasis": {
        const isEmphasis = i % 3 === 0 || word.length > 5;
        color = isEmphasis ? highlightColor : "white";
        wFontSize = isEmphasis ? fontSize * 1.3 : fontSize;
        break;
      }
      case "mente-variavel": {
        const isActive = i === activeWordIndex;
        color = isActive ? (i % 2 === 0 ? NEON_GREEN : NEON_BLUE) : "white";
        weight = isActive ? "900" : "bold";
        break;
      }
      case "reels": {
        const isActive = i === activeWordIndex;
        color = isActive ? highlightColor : "white";
        weight = "900";
        wFontSize = isActive ? fontSize * 1.2 : fontSize;
        break;
      }
      case "shorts": {
        const isActive = i === activeWordIndex;
        color = isActive ? highlightColor : "white";
        weight = "900";
        wFontSize = fontSize * 1.1;
        break;
      }
      case "podcast": {
        color = "white";
        weight = "600";
        break;
      }
      case "influencer": {
        const isActive = i === activeWordIndex;
        const colorWheel = [highlightColor, NEON_BLUE, NEON_GREEN, "hsl(50, 100%, 55%)"];
        color = isActive ? colorWheel[i % colorWheel.length] : "white";
        weight = isActive ? "900" : "bold";
        wFontSize = isActive ? fontSize * 1.2 : fontSize;
        break;
      }
      case "educational": {
        const isKeyword = word.length > 4 || i % 4 === 0;
        color = isKeyword ? highlightColor : "white";
        weight = isKeyword ? "800" : "500";
        break;
      }
      default: color = "white"; break;
    }

    ctx.font = `${weight} ${wFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;

    const needsGlow = (config.styleId === "mente-variavel" && i === activeWordIndex) ||
                      (config.styleId === "influencer" && i === activeWordIndex) ||
                      (config.styleId === "reels" && i === activeWordIndex);

    if (needsGlow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * scale;
    } else if (config.styleId === "podcast") {
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 8 * scale;
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 3 * scale;
    ctx.strokeText(word, wx + ctx.measureText(word).width / 2, y);
    ctx.fillText(word, wx + ctx.measureText(word).width / 2, y);
    wx += wordWidths[i];
  }

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

export interface ExportProgress { percent: number; phase: "rendering" | "encoding" | "done"; }
export interface ExportOptions { showWatermark?: boolean; }

export async function exportVideoWithSubtitles(
  videoUrl: string, subtitles: SubtitleLine[], config: SubtitleStyleConfig,
  onProgress?: (p: ExportProgress) => void, options?: ExportOptions
): Promise<void> {
  const showWatermark = options?.showWatermark ?? true;
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.preload = "auto";

    video.onloadedmetadata = () => {
      const w = video.videoWidth || 1080;
      const h = video.videoHeight || 1920;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      const mimeType = MediaRecorder.isTypeSupported("video/mp4; codecs=avc1")
        ? "video/mp4"
        : MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
        ? "video/webm; codecs=vp9"
        : "video/webm";

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        onProgress?.({ percent: 100, phase: "encoding" });
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `video-legendado.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        onProgress?.({ percent: 100, phase: "done" });
        resolve();
      };

      recorder.onerror = (e) => reject(e);
      recorder.start();
      const duration = video.duration;

      const drawFrame = () => {
        if (video.ended || video.paused) { recorder.stop(); return; }
        const t = video.currentTime;
        onProgress?.({ percent: Math.round((t / duration) * 100), phase: "rendering" });
        ctx.drawImage(video, 0, 0, w, h);
        const activeSub = subtitles.find((s) => t >= s.start && t <= s.end);
        if (activeSub) drawSubtitle(ctx, activeSub, t, config, w, h);
        if (showWatermark) drawWatermark(ctx, w, h);
        requestAnimationFrame(drawFrame);
      };

      video.play().then(() => drawFrame());
    };
    video.onerror = () => reject(new Error("Failed to load video"));
  });
}
