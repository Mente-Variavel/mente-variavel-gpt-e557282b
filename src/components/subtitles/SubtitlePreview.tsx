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

const SAFE_MARGIN_PERCENT = 4; // 4% margin on each side

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

  const positionStyle = useMemo((): React.CSSProperties => {
    const safeMargin = `${SAFE_MARGIN_PERCENT}%`;
    const offset = `${Math.max(styleConfig.verticalOffset, SAFE_MARGIN_PERCENT)}%`;
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
        return "animate-[subtitleFadeIn_0.4s_ease-out]";
      case "animated-slide":
      case "shorts":
        return "animate-[subtitleSlideUp_0.35s_ease-out]";
      case "mente-variavel":
      case "reels":
        return "animate-[subtitleFadeIn_0.3s_ease-out]";
      default: return "";
    }
  }, [styleConfig.styleId]);

  const highlightColor = getHighlightCSS(styleConfig.highlightColor);
  const neonBlue = "hsl(185 100% 50%)";
  const neonGreen = "hsl(155 100% 45%)";

  const renderSubtitleContent = () => {
    if (!activeSub) return null;
    const words = activeSub.text.split(" ");
    const progress = (currentTime - activeSub.start) / (activeSub.end - activeSub.start);
    const activeWordIndex = Math.floor(progress * words.length);

    const wordStyle = (color: string, weight: number | string, extra?: React.CSSProperties): React.CSSProperties => ({
      color,
      fontWeight: weight as any,
      marginRight: "0.3em",
      transition: "all 0.15s ease",
      display: "inline",
      ...extra,
    });

    switch (styleConfig.styleId) {
      case "dynamic-highlight":
        return <span>{words.map((word, i) => (
          <span key={i} style={wordStyle(i === activeWordIndex ? highlightColor : "hsl(0 0% 100%)", i === activeWordIndex ? 800 : 700)}>{word} </span>
        ))}</span>;

      case "alternating":
        return <span>{words.map((word, i) => {
          const colors = ["hsl(0 0% 100%)", neonBlue, neonGreen];
          return <span key={i} style={wordStyle(colors[i % 3], i % 3 !== 0 ? 800 : 700)}>{word} </span>;
        })}</span>;

      case "emphasis":
        return <span>{words.map((word, i) => {
          const isEmphasis = i % 3 === 0 || word.length > 5;
          return <span key={i} style={wordStyle(
            isEmphasis ? highlightColor : "hsl(0 0% 100%)",
            isEmphasis ? 900 : 600,
            { fontSize: isEmphasis ? `${styleConfig.fontSize * 1.3}px` : undefined }
          )}>{word} </span>;
        })}</span>;

      case "mente-variavel":
        return <span>{words.map((word, i) => {
          const isHighlight = i === activeWordIndex;
          const highlightCol = i % 2 === 0 ? neonGreen : neonBlue;
          return <span key={i} style={wordStyle(
            isHighlight ? highlightCol : "hsl(0 0% 100%)",
            isHighlight ? 900 : 700,
            { textShadow: isHighlight ? `0 0 12px ${highlightCol}, 0 0 24px ${highlightCol}40` : "none" }
          )}>{word} </span>;
        })}</span>;

      case "reels":
        return <span>{words.map((word, i) => {
          const isHighlight = i === activeWordIndex;
          return <span key={i} style={wordStyle(
            isHighlight ? highlightColor : "hsl(0 0% 100%)", 900,
            {
              fontSize: isHighlight ? `${styleConfig.fontSize * 1.2}px` : undefined,
              textTransform: "uppercase",
              textShadow: isHighlight ? `0 0 8px ${highlightColor}60` : "1px 2px 4px rgba(0,0,0,0.5)",
            }
          )}>{word} </span>;
        })}</span>;

      case "shorts":
        return <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{words.map((word, i) => {
          const isHighlight = i === activeWordIndex;
          return <span key={i} style={wordStyle(
            isHighlight ? highlightColor : "hsl(0 0% 100%)", 900,
            {
              fontSize: `${styleConfig.fontSize * 1.1}px`,
              display: "inline-block",
              transform: isHighlight ? "scale(1.15)" : "scale(1)",
            }
          )}>{word} </span>;
        })}</span>;

      case "podcast":
        return <span style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)" }}>
          {words.map((word, i) => (
            <span key={i} style={wordStyle("hsl(0 0% 100%)", 600)}>{word} </span>
          ))}
        </span>;

      case "influencer":
        return <span>{words.map((word, i) => {
          const isHighlight = i === activeWordIndex;
          const colorWheel = [highlightColor, neonBlue, neonGreen, "hsl(50 100% 55%)"];
          const wordColor = isHighlight ? colorWheel[i % colorWheel.length] : "hsl(0 0% 100%)";
          return <span key={i} style={wordStyle(
            wordColor, isHighlight ? 900 : 700,
            {
              display: "inline-block",
              transform: isHighlight ? "scale(1.2)" : "scale(1)",
              textShadow: isHighlight ? `0 0 10px ${wordColor}80` : "none",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }
          )}>{word} </span>;
        })}</span>;

      case "educational":
        return <span>{words.map((word, i) => {
          const isKeyword = word.length > 4 || i % 4 === 0;
          return <span key={i} style={wordStyle(
            isKeyword ? highlightColor : "hsl(0 0% 100%)",
            isKeyword ? 800 : 500,
            {
              backgroundColor: isKeyword ? `${highlightColor}20` : "transparent",
              borderRadius: isKeyword ? "3px" : "0",
              padding: isKeyword ? "0 3px" : "0",
              textDecoration: isKeyword ? "underline" : "none",
              textDecorationColor: isKeyword ? `${highlightColor}60` : "transparent",
              textUnderlineOffset: "3px",
            }
          )}>{word} </span>;
        })}</span>;

      default:
        return <span style={{ color: "hsl(0 0% 100%)" }}>{activeSub.text}</span>;
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
              left: `${SAFE_MARGIN_PERCENT}%`,
              right: `${SAFE_MARGIN_PERCENT}%`,
            }}
          >
            <span
              key={subKey}
              className={`inline-block text-center font-bold ${animationClass}`}
              style={{
                fontFamily,
                fontSize: `${styleConfig.fontSize}px`,
                lineHeight: styleConfig.lineHeight,
                letterSpacing: `${styleConfig.letterSpacing}px`,
                textAlign: styleConfig.textAlign,
                maxWidth: `${styleConfig.backgroundMaxWidth}%`,
                wordBreak: "break-word" as const,
                overflowWrap: "break-word" as const,
                whiteSpace: "pre-wrap" as const,
                padding: styleConfig.showBackground
                  ? `${styleConfig.backgroundPadding}px ${styleConfig.backgroundPadding * 1.5}px`
                  : `${styleConfig.backgroundPadding * 0.5}px`,
                backgroundColor: styleConfig.showBackground
                  ? `rgba(${bgRgba}, ${styleConfig.backgroundOpacity / 100})`
                  : "transparent",
                backdropFilter: styleConfig.showBackground ? "blur(4px)" : "none",
                borderRadius: `${styleConfig.borderRadius}px`,
                borderBottom: styleConfig.showBackground && styleConfig.styleId === "mente-variavel"
                  ? `2px solid ${neonGreen}` : "none",
              }}
            >
              {renderSubtitleContent()}
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
