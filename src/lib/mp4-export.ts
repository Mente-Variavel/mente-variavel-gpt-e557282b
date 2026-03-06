import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";
import type { SubtitleStyleConfig } from "./subtitle-styles";
import { HIGHLIGHT_COLORS, getCanvasFontFamily } from "./subtitle-styles";

const getColor = (colorId: string): string =>
  HIGHLIGHT_COLORS.find((c) => c.id === colorId)?.color ?? "hsl(185 100% 50%)";

const NEON_BLUE = "hsl(185, 100%, 50%)";
const NEON_GREEN = "hsl(155, 100%, 45%)";
const SAFE_MARGIN = 0.04;

const BACKGROUND_COLORS_MAP: Record<string, string> = {
  "dark": "8, 12, 20", "black": "0, 0, 0", "neon-blue": "0, 90, 128",
  "neon-green": "0, 102, 60", "pink": "128, 0, 64", "red": "128, 0, 0",
  "white": "255, 255, 255", "yellow": "153, 128, 0",
};

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

interface WordRenderInfo {
  word: string;
  color: string;
  weight: string;
  fontSize: number;
  glow: boolean;
}

function getWordStyles(
  words: string[], activeWordIndex: number, config: SubtitleStyleConfig,
  highlightColor: string, fontSize: number
): WordRenderInfo[] {
  return words.map((word, i) => {
    let color = "white";
    let weight = "bold";
    let wFontSize = fontSize;
    let glow = false;

    switch (config.styleId) {
      case "dynamic-highlight":
        color = i === activeWordIndex ? highlightColor : "white";
        weight = i === activeWordIndex ? "900" : "bold";
        glow = i === activeWordIndex;
        break;
      case "alternating": {
        const colors = ["white", NEON_BLUE, NEON_GREEN];
        color = colors[i % 3];
        break;
      }
      case "emphasis": {
        const isEmphasis = i % 3 === 0 || word.length > 4;
        color = isEmphasis ? highlightColor : "white";
        wFontSize = isEmphasis ? fontSize * 1.15 : fontSize;
        break;
      }
      case "mente-variavel": {
        const isActive = i === activeWordIndex;
        color = isActive ? (i % 2 === 0 ? NEON_GREEN : NEON_BLUE) : "white";
        weight = isActive ? "900" : "bold";
        glow = isActive;
        break;
      }
      case "reels": {
        const isActive = i === activeWordIndex;
        color = isActive ? highlightColor : "white";
        weight = "900";
        wFontSize = isActive ? fontSize * 1.15 : fontSize;
        glow = isActive;
        break;
      }
      case "shorts": {
        const isActive = i === activeWordIndex;
        color = isActive ? highlightColor : "white";
        weight = "900";
        break;
      }
      case "podcast":
        color = "white"; weight = "600";
        break;
      case "influencer": {
        const isActive = i === activeWordIndex;
        const colorWheel = [highlightColor, NEON_BLUE, NEON_GREEN, "hsl(50, 100%, 55%)"];
        color = isActive ? colorWheel[i % colorWheel.length] : "white";
        weight = isActive ? "900" : "bold";
        wFontSize = isActive ? fontSize * 1.15 : fontSize;
        glow = isActive;
        break;
      }
      case "educational": {
        const isKeyword = word.length > 4 || i % 4 === 0;
        color = isKeyword ? highlightColor : "white";
        weight = isKeyword ? "800" : "500";
        break;
      }
      default:
        color = "white";
        break;
    }

    return { word, color, weight, fontSize: wFontSize, glow };
  });
}

/**
 * Draw a single-line subtitle (already segmented into short phrases).
 * Text is rendered as ONE centered line — no wrapping.
 */
function drawSubtitle(
  ctx: CanvasRenderingContext2D, sub: SubtitleLine, time: number,
  config: SubtitleStyleConfig, canvasWidth: number, canvasHeight: number
) {
  const text = sub.text.toUpperCase();
  const words = text.split(" ");
  const progress = (time - sub.start) / (sub.end - sub.start);
  const activeWordIndex = Math.floor(progress * words.length);
  const highlightColor = getColor(config.highlightColor);
  const scale = canvasWidth / 360;
  const fontSize = config.fontSize * scale;
  const padding = config.backgroundPadding * scale;
  const fontFamily = getCanvasFontFamily(config.fontId);
  const borderRadius = (config.borderRadius ?? 8) * scale;
  const letterSpacing = (config.letterSpacing ?? 0) * scale;

  const safeLeft = canvasWidth * SAFE_MARGIN;
  const safeWidth = canvasWidth * (1 - 2 * SAFE_MARGIN);
  const maxWidth = safeWidth * (config.backgroundMaxWidth / 100);

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";

  // Measure full text width
  const wordStyles = getWordStyles(words, activeWordIndex, config, highlightColor, fontSize);
  let totalTextWidth = 0;
  for (let i = 0; i < words.length; i++) {
    const ws = wordStyles[i];
    ctx.font = `${ws.weight} ${ws.fontSize}px ${fontFamily}`;
    totalTextWidth += ctx.measureText(words[i]).width + (i < words.length - 1 ? fontSize * 0.3 + letterSpacing : 0);
  }

  // Text should already be pre-segmented to fit; only minor scale if needed
  let renderScale = 1;
  if (totalTextWidth > maxWidth - padding * 3) {
    renderScale = Math.max(0.75, (maxWidth - padding * 3) / totalTextWidth);
  }

  const scaledTextWidth = totalTextWidth * renderScale;
  const bgWidth = scaledTextWidth + padding * 4;
  const bgHeight = fontSize * renderScale * 1.6 + padding * 2;
  const x = canvasWidth / 2;

  // Y position
  let blockY: number;
  const offsetPx = Math.max(config.verticalOffset, 4) / 100 * canvasHeight;
  switch (config.position) {
    case "top": blockY = offsetPx + bgHeight / 2; break;
    case "center": blockY = canvasHeight / 2; break;
    default: blockY = canvasHeight - offsetPx - bgHeight / 2; break;
  }

  // Clamp
  const minY = canvasHeight * SAFE_MARGIN + bgHeight / 2;
  const maxY = canvasHeight * (1 - SAFE_MARGIN) - bgHeight / 2;
  blockY = Math.max(minY, Math.min(maxY, blockY));

  // Background
  if (config.showBackground) {
    const bgRgba = BACKGROUND_COLORS_MAP[config.backgroundColorId ?? "dark"] ?? "0, 0, 0";
    const opacity = config.backgroundOpacity / 100;
    ctx.fillStyle = `rgba(${bgRgba}, ${opacity})`;
    ctx.beginPath();
    ctx.roundRect(x - bgWidth / 2, blockY - bgHeight / 2, bgWidth, bgHeight, borderRadius);
    ctx.fill();
    if (config.styleId === "mente-variavel") {
      ctx.strokeStyle = NEON_GREEN;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(x - bgWidth / 2, blockY + bgHeight / 2);
      ctx.lineTo(x + bgWidth / 2, blockY + bgHeight / 2);
      ctx.stroke();
    }
  }

  // Draw words in a single line
  let wx = x - scaledTextWidth / 2;

  for (let i = 0; i < words.length; i++) {
    const ws = wordStyles[i];
    const actualFontSize = ws.fontSize * renderScale;
    ctx.font = `${ws.weight} ${actualFontSize}px ${fontFamily}`;
    ctx.fillStyle = ws.color;
    ctx.textAlign = "left";

    if (ws.glow) {
      ctx.shadowColor = ws.color;
      ctx.shadowBlur = 12 * scale;
    } else if (config.styleId === "podcast") {
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 8 * scale;
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4 * scale;
    }

    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2.5 * scale * renderScale;
    ctx.strokeText(words[i], wx, blockY);
    ctx.fillText(words[i], wx, blockY);

    const wordW = ctx.measureText(words[i]).width;
    wx += wordW + (fontSize * 0.3 + letterSpacing) * renderScale;
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
