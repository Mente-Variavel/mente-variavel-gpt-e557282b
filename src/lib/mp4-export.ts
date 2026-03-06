import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";
import type { SubtitleStyleConfig } from "./subtitle-styles";
import { HIGHLIGHT_COLORS, getCanvasFontFamily } from "./subtitle-styles";

const getColor = (colorId: string): string =>
  HIGHLIGHT_COLORS.find((c) => c.id === colorId)?.color ?? "hsl(185 100% 50%)";

const NEON_BLUE = "hsl(185, 100%, 50%)";
const NEON_GREEN = "hsl(155, 100%, 45%)";
const SAFE_MARGIN = 0.04; // 4% safe margin on each side

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

/** Break text into lines that fit within maxWidth */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
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
        const isEmphasis = i % 3 === 0 || word.length > 5;
        color = isEmphasis ? highlightColor : "white";
        wFontSize = isEmphasis ? fontSize * 1.3 : fontSize;
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
        wFontSize = isActive ? fontSize * 1.2 : fontSize;
        glow = isActive;
        break;
      }
      case "shorts": {
        const isActive = i === activeWordIndex;
        color = isActive ? highlightColor : "white";
        weight = "900";
        wFontSize = fontSize * 1.1;
        break;
      }
      case "podcast":
        color = "white";
        weight = "600";
        break;
      case "influencer": {
        const isActive = i === activeWordIndex;
        const colorWheel = [highlightColor, NEON_BLUE, NEON_GREEN, "hsl(50, 100%, 55%)"];
        color = isActive ? colorWheel[i % colorWheel.length] : "white";
        weight = isActive ? "900" : "bold";
        wFontSize = isActive ? fontSize * 1.2 : fontSize;
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
  const lineHeightMultiplier = config.lineHeight ?? 1.4;
  const letterSpacing = (config.letterSpacing ?? 0) * scale;
  const borderRadius = (config.borderRadius ?? 8) * scale;

  // Calculate safe area
  const safeLeft = canvasWidth * SAFE_MARGIN;
  const safeRight = canvasWidth * (1 - SAFE_MARGIN);
  const safeWidth = safeRight - safeLeft;
  const maxTextWidth = safeWidth * (config.backgroundMaxWidth / 100) - padding * 3;

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = config.textAlign ?? "center";
  ctx.textBaseline = "middle";

  // Wrap text into lines
  const lines = wrapText(ctx, sub.text, maxTextWidth);
  const lineHeight = fontSize * lineHeightMultiplier;
  const totalTextHeight = lines.length * lineHeight;
  const bgWidth = Math.min(
    safeWidth * (config.backgroundMaxWidth / 100),
    Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 3
  );
  const bgHeight = totalTextHeight + padding * 2;

  // Y position
  let blockY: number;
  const offsetPx = Math.max(config.verticalOffset, 4) / 100 * canvasHeight;
  switch (config.position) {
    case "top": blockY = offsetPx + bgHeight / 2; break;
    case "center": blockY = canvasHeight / 2; break;
    default: blockY = canvasHeight - offsetPx - bgHeight / 2; break;
  }

  // Clamp to safe area
  const minY = canvasHeight * SAFE_MARGIN + bgHeight / 2;
  const maxY = canvasHeight * (1 - SAFE_MARGIN) - bgHeight / 2;
  blockY = Math.max(minY, Math.min(maxY, blockY));

  const x = canvasWidth / 2;

  // Draw background
  if (config.showBackground) {
    const bgRgba = BACKGROUND_COLORS_MAP[config.backgroundColorId ?? "dark"] ?? "0, 0, 0";
    const opacity = config.backgroundOpacity / 100;
    const bgColor = `rgba(${bgRgba}, ${opacity})`;
    const bx = x - bgWidth / 2;
    const by = blockY - bgHeight / 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bgWidth, bgHeight, borderRadius);
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

  // Draw text line by line with word-level styling
  const wordStyles = getWordStyles(words, activeWordIndex, config, highlightColor, fontSize);
  let wordIndex = 0;
  const firstLineY = blockY - totalTextHeight / 2 + lineHeight / 2;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineText = lines[lineIdx];
    const lineWords = lineText.split(" ");
    const lineY = firstLineY + lineIdx * lineHeight;

    // Measure total line width for centering
    let totalLineWidth = 0;
    const lineWordWidths: number[] = [];
    for (let i = 0; i < lineWords.length; i++) {
      const ws = wordStyles[wordIndex + i];
      if (!ws) break;
      ctx.font = `${ws.weight} ${ws.fontSize}px ${fontFamily}`;
      const w = ctx.measureText(lineWords[i]).width + (i < lineWords.length - 1 ? fontSize * 0.3 + letterSpacing : 0);
      lineWordWidths.push(w);
      totalLineWidth += w;
    }

    // Starting x based on alignment
    let wx: number;
    const align = config.textAlign ?? "center";
    if (align === "left") {
      wx = x - bgWidth / 2 + padding * 1.5;
    } else if (align === "right") {
      wx = x + bgWidth / 2 - padding * 1.5 - totalLineWidth;
    } else {
      wx = x - totalLineWidth / 2;
    }

    for (let i = 0; i < lineWords.length; i++) {
      const ws = wordStyles[wordIndex + i];
      if (!ws) break;
      ctx.font = `${ws.weight} ${ws.fontSize}px ${fontFamily}`;
      ctx.fillStyle = ws.color;

      if (ws.glow) {
        ctx.shadowColor = ws.color;
        ctx.shadowBlur = 12 * scale;
      } else if (config.styleId === "podcast") {
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 8 * scale;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      const wordW = ctx.measureText(lineWords[i]).width;
      // Stroke outline
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 3 * scale;
      ctx.textAlign = "left";
      ctx.strokeText(lineWords[i], wx, lineY);
      ctx.fillText(lineWords[i], wx, lineY);
      wx += wordW + fontSize * 0.3 + letterSpacing;
    }
    wordIndex += lineWords.length;
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
