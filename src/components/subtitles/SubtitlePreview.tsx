import { useRef, useState, useEffect, useMemo } from "react";
import { Play, Pause } from "lucide-react";
import type { SubtitleLine } from "./SubtitleEditor";
import type { SubtitleStyleConfig } from "@/lib/subtitle-styles";
import { HIGHLIGHT_COLORS } from "@/lib/subtitle-styles";

interface SubtitlePreviewProps {
  videoUrl: string;
  subtitles: SubtitleLine[];
  onTimeUpdate?: (time: number) => void;
  styleConfig: SubtitleStyleConfig;
}

const getHighlightCSS = (colorId: string): string =>
  HIGHLIGHT_COLORS.find((c) => c.id === colorId)?.color ?? "hsl(185 100% 50%)";

const SubtitlePreview = ({ videoUrl, subtitles, onTimeUpdate, styleConfig }: SubtitlePreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeLocal] = useState(0);
  const [activeSub, setActiveSub] = useState<SubtitleLine | null>(null);
  const [subKey, setSubKey] = useState(0);

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

  const positionStyle = useMemo((): React.CSSProperties => {
    const offset = `${styleConfig.verticalOffset}%`;
    switch (styleConfig.position) {
      case "top": return { top: offset, bottom: "auto" };
      case "center": return { top: "50%", transform: "translateY(-50%)" };
      default: return { bottom: offset, top: "auto" };
    }
  }, [styleConfig.position, styleConfig.verticalOffset]);

  const animationClass = useMemo(() => {
    switch (styleConfig.styleId) {
      case "animated-fade": return "animate-[subtitleFadeIn_0.4s_ease-out]";
      case "animated-slide": return "animate-[subtitleSlideUp_0.35s_ease-out]";
      case "mente-variavel": return "animate-[subtitleFadeIn_0.3s_ease-out]";
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

    switch (styleConfig.styleId) {
      case "dynamic-highlight":
        return <span>{words.map((word, i) => (
          <span key={i} style={{ color: i === activeWordIndex ? highlightColor : "hsl(0 0% 100%)", transition: "color 0.15s ease", fontWeight: i === activeWordIndex ? 800 : 700 }}>{word} </span>
        ))}</span>;
      case "alternating":
        return <span>{words.map((word, i) => {
          const colors = ["hsl(0 0% 100%)", neonBlue, neonGreen];
          return <span key={i} style={{ color: colors[i % 3], fontWeight: i % 3 !== 0 ? 800 : 700 }}>{word} </span>;
        })}</span>;
      case "emphasis":
        return <span>{words.map((word, i) => {
          const isEmphasis = i % 3 === 0 || word.length > 5;
          return <span key={i} style={{ color: isEmphasis ? highlightColor : "hsl(0 0% 100%)", fontSize: isEmphasis ? `${styleConfig.fontSize * 1.3}px` : `${styleConfig.fontSize}px`, fontWeight: isEmphasis ? 900 : 600, transition: "all 0.2s ease" }}>{word} </span>;
        })}</span>;
      case "mente-variavel":
        return <span>{words.map((word, i) => {
          const isHighlight = i === activeWordIndex;
          const highlightCol = i % 2 === 0 ? neonGreen : neonBlue;
          return <span key={i} style={{ color: isHighlight ? highlightCol : "hsl(0 0% 100%)", fontWeight: isHighlight ? 900 : 700, textShadow: isHighlight ? `0 0 12px ${highlightCol}, 0 0 24px ${highlightCol}40` : "none", transition: "all 0.15s ease" }}>{word} </span>;
        })}</span>;
      default:
        return <span style={{ color: "hsl(0 0% 100%)" }}>{activeSub.text}</span>;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background">
      <div className="relative aspect-[9/16] max-h-[500px] w-full bg-background">
        <video ref={videoRef} src={videoUrl} className="h-full w-full object-contain" onEnded={() => setIsPlaying(false)} />
        {activeSub && (
          <div className="absolute left-0 right-0 flex justify-center px-4" style={positionStyle}>
            <span
              key={subKey}
              className={`inline-block rounded-lg text-center font-bold ${animationClass}`}
              style={{
                fontSize: `${styleConfig.fontSize}px`,
                maxWidth: `${styleConfig.backgroundMaxWidth}%`,
                padding: styleConfig.showBackground ? `${styleConfig.backgroundPadding}px ${styleConfig.backgroundPadding * 1.5}px` : "0",
                backgroundColor: styleConfig.showBackground
                  ? styleConfig.styleId === "mente-variavel"
                    ? `hsla(222, 47%, 6%, ${styleConfig.backgroundOpacity / 100})`
                    : `hsla(0, 0%, 0%, ${styleConfig.backgroundOpacity / 100})`
                  : "transparent",
                backdropFilter: styleConfig.showBackground ? "blur(4px)" : "none",
                borderBottom: styleConfig.showBackground && styleConfig.styleId === "mente-variavel" ? `2px solid ${neonGreen}` : "none",
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
