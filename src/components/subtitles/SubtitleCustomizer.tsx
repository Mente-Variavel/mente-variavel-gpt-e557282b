import {
  type SubtitleStyleConfig,
  type SubtitlePosition,
  type SubtitleFontId,
  SUBTITLE_STYLES,
  HIGHLIGHT_COLORS,
  SUBTITLE_FONTS,
  DEFAULT_STYLE_CONFIG,
} from "@/lib/subtitle-styles";
import { Palette, Type, ArrowUpDown, Sparkles, Square, Minus, ArrowLeftRight, Save, RotateCcw, LetterText } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "mv-subtitle-full-settings";

interface SubtitleCustomizerProps {
  config: SubtitleStyleConfig;
  onChange: (config: SubtitleStyleConfig) => void;
  watermarkEnabled?: boolean;
}

const positions: { id: SubtitlePosition; label: string }[] = [
  { id: "top", label: "Topo" },
  { id: "center", label: "Centro" },
  { id: "bottom", label: "Baixo" },
];

const SubtitleCustomizer = ({ config, onChange, watermarkEnabled }: SubtitleCustomizerProps) => {
  const set = <K extends keyof SubtitleStyleConfig>(key: K, value: SubtitleStyleConfig[K]) =>
    onChange({ ...config, [key]: value });

  const hasSaved = (() => { try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; } })();

  const saveConfig = () => {
    try {
      const fullSettings = { styleConfig: config, watermarkEnabled: watermarkEnabled ?? true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullSettings));
      toast.success("Todas as configurações salvas!");
    } catch { toast.error("Erro ao salvar"); }
  };

  const restoreConfig = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        onChange({ ...DEFAULT_STYLE_CONFIG, ...(parsed.styleConfig || parsed) });
        toast.success("Configurações restauradas!");
      }
    } catch { toast.error("Erro ao restaurar"); }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      {/* Header + Save/Restore */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold font-display uppercase tracking-wider text-primary">
          <Palette className="h-4 w-4" /> Personalização
        </h3>
        <div className="flex gap-1.5">
          <button onClick={saveConfig} className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-[10px] font-semibold text-primary transition-all hover:bg-primary/10">
            <Save className="h-3 w-3" /> Salvar
          </button>
          {hasSaved && (
            <button onClick={restoreConfig} className="flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-[10px] font-semibold text-accent transition-all hover:bg-accent/10">
              <RotateCcw className="h-3 w-3" /> Restaurar
            </button>
          )}
        </div>
      </div>

      {/* Font Selection — horizontal row */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><LetterText className="h-3 w-3" /> Fonte</label>
        <div className="flex flex-wrap gap-1.5">
          {SUBTITLE_FONTS.map((font) => (
            <button key={font.id} onClick={() => set("fontId", font.id as SubtitleFontId)}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${config.fontId === font.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
              style={{ fontFamily: font.cssFamily }}>
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection — horizontal row */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Estilo da Legenda</label>
        <div className="flex flex-wrap gap-1.5">
          {SUBTITLE_STYLES.map((style) => (
            <button key={style.id} onClick={() => set("styleId", style.id)}
              className={`relative rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap ${config.styleId === style.id ? "border-primary bg-primary/10 text-primary glow-cyan" : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
              {style.badge && <span className="absolute -top-1.5 -right-1 rounded-full bg-accent px-1 py-0.5 text-[7px] font-bold text-accent-foreground leading-none">{style.badge}</span>}
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight Color — horizontal row */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><Sparkles className="h-3 w-3" /> Cor de Destaque</label>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_COLORS.map((c) => (
            <button key={c.id} onClick={() => set("highlightColor", c.id)} title={c.name}
              className={`h-7 w-7 rounded-full border-2 transition-all ${config.highlightColor === c.id ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground"} ${c.id === "black" ? "ring-1 ring-muted-foreground/30" : ""}`}
              style={{ backgroundColor: c.color }} />
          ))}
        </div>
      </div>

      {/* Font Size + Position + Vertical Offset — compact row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide"><Type className="h-3 w-3" /> Tamanho — {config.fontSize}px</label>
          <input type="range" min={14} max={32} step={1} value={config.fontSize} onChange={(e) => set("fontSize", Number(e.target.value))} className="w-full accent-primary" />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide"><ArrowUpDown className="h-3 w-3" /> Posição</label>
          <div className="flex gap-1">
            {positions.map((p) => (
              <button key={p.id} onClick={() => set("position", p.id)}
                className={`flex-1 rounded-lg border py-1.5 text-[10px] font-semibold transition-all ${config.position === p.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide"><Minus className="h-3 w-3" /> Vertical — {config.verticalOffset}%</label>
          <input type="range" min={0} max={40} step={1} value={config.verticalOffset} onChange={(e) => set("verticalOffset", Number(e.target.value))} className="w-full accent-primary" />
        </div>
      </div>

      {/* Background — collapsible compact */}
      <div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><Square className="h-3 w-3" /> Fundo da Legenda</label>
          <button onClick={() => set("showBackground", !config.showBackground)}
            className={`relative h-5 w-9 rounded-full border transition-all ${config.showBackground ? "border-primary bg-primary/30" : "border-border bg-secondary/50"}`}>
            <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${config.showBackground ? "left-[18px] bg-primary" : "left-0.5 bg-muted-foreground"}`} />
          </button>
        </div>
        {config.showBackground && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-border bg-secondary/20 p-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Opacidade — {config.backgroundOpacity}%</label>
              <input type="range" min={10} max={100} step={5} value={config.backgroundOpacity} onChange={(e) => set("backgroundOpacity", Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Padding — {config.backgroundPadding}px</label>
              <input type="range" min={2} max={24} step={1} value={config.backgroundPadding} onChange={(e) => set("backgroundPadding", Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide"><ArrowLeftRight className="h-2.5 w-2.5" /> Largura — {config.backgroundMaxWidth}%</label>
              <input type="range" min={30} max={100} step={5} value={config.backgroundMaxWidth} onChange={(e) => set("backgroundMaxWidth", Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleCustomizer;
