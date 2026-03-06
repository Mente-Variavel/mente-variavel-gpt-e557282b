import { useRef, useState, useEffect, useMemo } from "react";
import { Play, Pause } from "lucide-react";
import type { SubtitleLine } from "./SubtitleEditor";
import type { SubtitleStyleConfig } from "@/lib/subtitle-styles";
import { HIGHLIGHT_COLORS, BACKGROUND_COLORS, getFontFamily } from "@/lib/subtitle-styles";
import { loadSubtitleFonts } from "@/lib/subtitle-fonts-loader";

interface SubtitlePreviewProps {
  videoUrl: string;
  subtitles: SubtitleLine[];
  onTimeUpdate?: (time: number) => void;
  styleConfig: SubtitleStyleConfig;
}

const getHighlightCSS = (colorId: string): string =>
  HIGHLIGHT_COLORS.find((c) => c.id === colorId)?.color ?? "hsl(185 100% 50%)";

const SAFE_MARGIN = 4; // percent

const SubtitlePreview = ({ videoUrl, subtitles, onTimeUpdate, styleConfig }: SubtitlePreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeLocal] = useState(0);
  const [activeSub, setActiveSub] = useState<SubtitleLine | null>(null);
  const [subKey, setSubKey] = useState(0);
  const [textScale, setTextScale] = useState(1);

  useEffect(() => { loadSubtitleFonts(); }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTimeLocal(t);
      onTimeUpdate?.(t);
      const active = subtitles.find((s) => t >= s.start && t <= s.end) || null;
      setActiveSub((prev) => {
        if (active?.id !== prev?.id) setSubKey((k) => k + 1);
        return active;
      });
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [subtitles, onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setIsPlaying(true); }
    else { video.pause(); setIsPlaying(false); }
  };

  // Auto-scale subtitle text to fit within container
  useEffect(() => {
    const span = subtitleRef.current;
    const container = containerRef.current;
    if (!span || !container || !activeSub) { setTextScale(1); return; }
    requestAnimationFrame(() => {
      const containerWidth = container.clientWidth;
      const safeWidth = containerWidth * (1 - 2 * SAFE_MARGIN / 100);
      const spanWidth = span.scrollWidth;
      if (spanWidth > safeWidth) {
        setTextScale(Math.max(0.55, safeWidth / spanWidth));
      } else {
        setTextScale(1);
      }
    });
  }, [activeSub, subKey, styleConfig.fontSize, styleConfig.fontId]);

  const fontFamily = getFontFamily(styleConfig.fontId);
  const highlightColor = getHighlightCSS(styleConfig.highlightColor);
  const neonBlue = "hsl(185 100% 50%)";
  const neonGreen = "hsl(155 100% 45%)";
  const isTwoLine = styleConfig.layoutMode === "two-line";

  const positionStyle = useMemo((): React.CSSProperties => {
    const offset = `${Math.max(styleConfig.verticalOffset, SAFE_MARGIN)}%`;
    switch (styleConfig.position) {
      case "top": return { top: offset, bottom: "auto" };
      case "center": return { top: "50%", transform: "translateY(-50%)" };
      default: return { bottom: offset, top: "auto" };
    }
  }, [styleConfig.position, styleConfig.verticalOffset]);

  const barPositionStyle = useMemo((): React.CSSProperties => {
    const offset = `${Math.max(styleConfig.fullWidthBarOffset ?? styleConfig.verticalOffset, SAFE_MARGIN)}%`;
    switch (styleConfig.position) {
      case "top": return { top: offset, bottom: "auto" };
      case "center": return { top: "50%", transform: "translateY(-50%)" };
      default: return { bottom: offset, top: "auto" };
    }
  }, [styleConfig.position, styleConfig.fullWidthBarOffset, styleConfig.verticalOffset]);

  const animationClass = useMemo(() => {
    switch (styleConfig.styleId) {
      case "animated-fade":
      case "influencer":
        return "animate-[subtitleFadeIn_0.3s_ease-out]";
      case "animated-slide":
      case "shorts":
        return "animate-[subtitleSlideUp_0.25s_ease-out]";
      default: return "animate-[subtitleFadeIn_0.2s_ease-out]";
    }
  }, [styleConfig.styleId]);

  // Split text for two-line mode
  const getLines = (text: string): string[] => {
    if (!isTwoLine) return [text];
    const words = text.split(" ");
    if (words.length <= 3) return [text];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  };

  // Word-level coloring for a single word
  const getWordStyle = (wordIndex: number, totalWords: number, activeWordIndex: number): React.CSSProperties => {
    const ws = (color: string, weight: number, extra?: React.CSSProperties): React.CSSProperties => ({
      color, fontWeight: weight, transition: "all 0.15s ease", display: "inline-block", ...extra,
    });

    switch (styleConfig.styleId) {
      case "dynamic-highlight":
        return ws(wordIndex === activeWordIndex ? highlightColor : "white", wordIndex === activeWordIndex ? 900 : 700);
      case "alternating": {
        const c = ["white", neonBlue, neonGreen][wordIndex % 3];
        return ws(c, 800);
      }
      case "emphasis": {
        const em = wordIndex % 3 === 0;
        return ws(em ? highlightColor : "white", em ? 900 : 700, em ? { transform: "scale(1.1)", display: "inline-block" } : undefined);
      }
      case "mente-variavel": {
        const active = wordIndex === activeWordIndex;
        const col = wordIndex % 2 === 0 ? neonGreen : neonBlue;
        return ws(active ? col : "white", active ? 900 : 700, active ? { textShadow: `0 0 12px ${col}, 0 0 24px ${col}40` } : undefined);
      }
      case "reels": {
        const active = wordIndex === activeWordIndex;
        return ws(active ? highlightColor : "white", 900, active ? { transform: "scale(1.1)", display: "inline-block", textShadow: `0 0 8px ${highlightColor}60` } : { textShadow: "1px 2px 4px rgba(0,0,0,0.5)" });
      }
      case "shorts": {
        const active = wordIndex === activeWordIndex;
        return ws(active ? highlightColor : "white", 900, { transform: active ? "scale(1.15)" : "scale(1)", display: "inline-block" });
      }
      case "podcast":
        return ws("white", 600, { textShadow: "0 2px 8px rgba(0,0,0,0.7)" });
      case "influencer": {
        const active = wordIndex === activeWordIndex;
        const wheel = [highlightColor, neonBlue, neonGreen, "hsl(50 100% 55%)"];
        const col = active ? wheel[wordIndex % wheel.length] : "white";
        return ws(col, active ? 900 : 700, active ? { transform: "scale(1.15)", display: "inline-block", textShadow: `0 0 10px ${col}80` } : undefined);
      }
      case "educational": {
        const kw = wordIndex % 4 === 0;
        return ws(kw ? highlightColor : "white", kw ? 800 : 500, kw ? { textDecoration: "underline", textDecorationColor: `${highlightColor}60`, textUnderlineOffset: "3px" } : undefined);
      }
      default:
        return { color: "white" };
    }
  };

  const renderWords = () => {
    if (!activeSub) return null;
    const allWords = activeSub.text.split(" ");
    const progress = (currentTime - activeSub.start) / (activeSub.end - activeSub.start);
    const activeWordIndex = Math.floor(progress * allWords.length);
    const lines = getLines(activeSub.text);

    let globalIndex = 0;
    return lines.map((line, lineIdx) => {
      const lineWords = line.split(" ");
      const rendered = lineWords.map((w) => {
        const idx = globalIndex++;
        return (
          <span key={idx} style={getWordStyle(idx, allWords.length, activeWordIndex)}>
            {w}&nbsp;
          </span>
        );
      });
      return (
        <span key={lineIdx} style={{ display: "block", textAlign: "center" }}>
          {rendered}
        </span>
      );
    });
  };

  const bgColorEntry = BACKGROUND_COLORS.find(c => c.id === styleConfig.backgroundColorId);
  const bgRgba = bgColorEntry?.rgba ?? "0, 0, 0";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background">
      <div ref={containerRef} className="relative aspect-[9/16] max-h-[500px] w-full bg-background">
        <video ref={videoRef} src={videoUrl} className="h-full w-full object-contain" onEnded={() => setIsPlaying(false)} />
        {/* Full-width anti-watermark bar — always visible */}
        {styleConfig.fullWidthBackground && (
          <div
            className="absolute"
            style={{
              ...barPositionStyle,
              left: `${(100 - (styleConfig.fullWidthBarWidth ?? 100)) / 2}%`,
              right: `${(100 - (styleConfig.fullWidthBarWidth ?? 100)) / 2}%`,
              height: `${styleConfig.fullWidthBarHeight ?? 60}px`,
              backgroundColor: `rgba(${bgRgba}, ${styleConfig.backgroundOpacity / 100})`,
              backdropFilter: "blur(4px)",
              borderRadius: (styleConfig.fullWidthBarWidth ?? 100) < 100 ? `${styleConfig.borderRadius}px` : undefined,
              transform: styleConfig.position === "center" ? "translateY(-50%)" : undefined,
            }}
          />
        )}
        {activeSub && (
          <div
            className="absolute flex justify-center"
            style={{
              ...positionStyle,
              left: `${SAFE_MARGIN}%`,
              right: `${SAFE_MARGIN}%`,
              zIndex: 1,
            }}
          >
            <span
              ref={subtitleRef}
              key={subKey}
              className={`inline-flex flex-col items-center justify-center text-center ${animationClass}`}
              style={{
                fontFamily,
                fontSize: `${styleConfig.fontSize}px`,
                lineHeight: isTwoLine ? 1.3 : 1.2,
                letterSpacing: 0,
                textTransform: "uppercase",
                whiteSpace: isTwoLine ? "normal" : "nowrap",
                overflow: "visible",
                transform: `scale(${textScale})`,
                transformOrigin: "center center",
                padding: styleConfig.showBackground && !styleConfig.fullWidthBackground
                  ? `${styleConfig.backgroundPadding}px ${styleConfig.backgroundPadding * 2}px`
                  : `${styleConfig.backgroundPadding * 0.5}px ${styleConfig.backgroundPadding}px`,
                backgroundColor: styleConfig.showBackground && !styleConfig.fullWidthBackground
                  ? `rgba(${bgRgba}, ${styleConfig.backgroundOpacity / 100})`
                  : "transparent",
                backdropFilter: styleConfig.showBackground && !styleConfig.fullWidthBackground ? "blur(4px)" : "none",
                borderRadius: `${styleConfig.borderRadius}px`,
                borderBottom: styleConfig.showBackground && styleConfig.styleId === "mente-variavel"
                  ? `2px solid ${neonGreen}` : "none",
                textShadow: (!styleConfig.showBackground && !styleConfig.fullWidthBackground) ? "0 2px 8px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)" : "none",
              }}
            >
              {renderWords()}
            </span>
          </div>
        )}
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
            {isPlaying ? <Pause className="h-6 w-6 text-primary" /> : <Play className="h-6 w-6 text-primary ml-0.5" />}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SubtitlePreview;
