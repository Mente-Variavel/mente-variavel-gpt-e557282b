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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeLocal] = useState(0);
  const [activeSub, setActiveSub] = useState<SubtitleLine | null>(null);
  const [subKey, setSubKey] = useState(0);

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

  const fontFamily = getFontFamily(styleConfig.fontId);
  const highlightColor = getHighlightCSS(styleConfig.highlightColor);
  const neonBlue = "hsl(185 100% 50%)";
  const neonGreen = "hsl(155 100% 45%)";

  const positionStyle = useMemo((): React.CSSProperties => {
    const offset = `${Math.max(styleConfig.verticalOffset, SAFE_MARGIN)}%`;
    switch (styleConfig.position) {
      case "top": return { top: offset, bottom: "auto" };
      case "center": return { top: "50%", transform: "translateY(-50%)" };
      default: return { bottom: offset, top: "auto" };
    }
  }, [styleConfig.position, styleConfig.verticalOffset]);

  const animationClass = useMemo(() => {
    switch (styleConfig.styleId) {
      case "animated-fade":
      case "influencer":
        return "animate-[subtitleFadeIn_0.3s_ease-out]";
      case "animated-slide":
      case "shorts":
        return "animate-[subtitleSlideUp_0.25s_ease-out]";
      case "mente-variavel":
      case "reels":
        return "animate-[subtitleFadeIn_0.2s_ease-out]";
      default: return "animate-[subtitleFadeIn_0.2s_ease-out]";
    }
  }, [styleConfig.styleId]);

  // Single-line word-level coloring
  const renderWords = () => {
    if (!activeSub) return null;
    const words = activeSub.text.split(" ");
    const progress = (currentTime - activeSub.start) / (activeSub.end - activeSub.start);
    const activeWordIndex = Math.floor(progress * words.length);

    const ws = (color: string, weight: number, extra?: React.CSSProperties): React.CSSProperties => ({
      color, fontWeight: weight, transition: "all 0.15s ease", display: "inline-block", ...extra,
    });

    switch (styleConfig.styleId) {
      case "dynamic-highlight":
        return words.map((w, i) => (
          <span key={i} style={ws(i === activeWordIndex ? highlightColor : "white", i === activeWordIndex ? 900 : 700)}>{w}&nbsp;</span>
        ));
      case "alternating":
        return words.map((w, i) => {
          const c = ["white", neonBlue, neonGreen][i % 3];
          return <span key={i} style={ws(c, 800)}>{w}&nbsp;</span>;
        });
      case "emphasis":
        return words.map((w, i) => {
          const em = i % 3 === 0 || w.length > 4;
          return <span key={i} style={ws(em ? highlightColor : "white", em ? 900 : 700, em ? { transform: "scale(1.15)", display: "inline-block" } : undefined)}>{w}&nbsp;</span>;
        });
      case "mente-variavel":
        return words.map((w, i) => {
          const active = i === activeWordIndex;
          const col = i % 2 === 0 ? neonGreen : neonBlue;
          return <span key={i} style={ws(active ? col : "white", active ? 900 : 700, active ? { textShadow: `0 0 12px ${col}, 0 0 24px ${col}40` } : undefined)}>{w}&nbsp;</span>;
        });
      case "reels":
        return words.map((w, i) => {
          const active = i === activeWordIndex;
          return <span key={i} style={ws(active ? highlightColor : "white", 900, active ? { transform: "scale(1.15)", display: "inline-block", textShadow: `0 0 8px ${highlightColor}60` } : { textShadow: "1px 2px 4px rgba(0,0,0,0.5)" })}>{w}&nbsp;</span>;
        });
      case "shorts":
        return words.map((w, i) => {
          const active = i === activeWordIndex;
          return <span key={i} style={ws(active ? highlightColor : "white", 900, { transform: active ? "scale(1.2)" : "scale(1)", display: "inline-block" })}>{w}&nbsp;</span>;
        });
      case "podcast":
        return words.map((w, i) => (
          <span key={i} style={ws("white", 600, { textShadow: "0 2px 8px rgba(0,0,0,0.7)" })}>{w}&nbsp;</span>
        ));
      case "influencer":
        return words.map((w, i) => {
          const active = i === activeWordIndex;
          const wheel = [highlightColor, neonBlue, neonGreen, "hsl(50 100% 55%)"];
          const col = active ? wheel[i % wheel.length] : "white";
          return <span key={i} style={ws(col, active ? 900 : 700, active ? { transform: "scale(1.2)", display: "inline-block", textShadow: `0 0 10px ${col}80` } : undefined)}>{w}&nbsp;</span>;
        });
      case "educational":
        return words.map((w, i) => {
          const kw = w.length > 4 || i % 4 === 0;
          return <span key={i} style={ws(kw ? highlightColor : "white", kw ? 800 : 500, kw ? { textDecoration: "underline", textDecorationColor: `${highlightColor}60`, textUnderlineOffset: "3px" } : undefined)}>{w}&nbsp;</span>;
        });
      default:
        return <span style={{ color: "white" }}>{activeSub.text}</span>;
    }
  };

  const bgColorEntry = BACKGROUND_COLORS.find(c => c.id === styleConfig.backgroundColorId);
  const bgRgba = bgColorEntry?.rgba ?? "0, 0, 0";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background">
      <div ref={containerRef} className="relative aspect-[9/16] max-h-[500px] w-full bg-background">
        <video ref={videoRef} src={videoUrl} className="h-full w-full object-contain" onEnded={() => setIsPlaying(false)} />
        {activeSub && (
          <div
            className="absolute flex justify-center"
            style={{
              ...positionStyle,
              left: `${SAFE_MARGIN}%`,
              right: `${SAFE_MARGIN}%`,
            }}
          >
            <span
              key={subKey}
              className={`inline-flex items-center justify-center text-center ${animationClass}`}
              style={{
                fontFamily,
                fontSize: `${styleConfig.fontSize}px`,
                lineHeight: 1.2,
                letterSpacing: `${styleConfig.letterSpacing}px`,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                maxWidth: `${styleConfig.backgroundMaxWidth}%`,
                overflow: "hidden",
                padding: styleConfig.showBackground
                  ? `${styleConfig.backgroundPadding}px ${styleConfig.backgroundPadding * 2}px`
                  : `${styleConfig.backgroundPadding * 0.5}px ${styleConfig.backgroundPadding}px`,
                backgroundColor: styleConfig.showBackground
                  ? `rgba(${bgRgba}, ${styleConfig.backgroundOpacity / 100})`
                  : "transparent",
                backdropFilter: styleConfig.showBackground ? "blur(4px)" : "none",
                borderRadius: `${styleConfig.borderRadius}px`,
                borderBottom: styleConfig.showBackground && styleConfig.styleId === "mente-variavel"
                  ? `2px solid ${neonGreen}` : "none",
                textShadow: !styleConfig.showBackground ? "0 2px 8px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)" : "none",
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
