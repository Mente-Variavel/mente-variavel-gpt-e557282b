import {
  type SubtitleStyleConfig,
  type SubtitlePosition,
  SUBTITLE_STYLES,
  HIGHLIGHT_COLORS,
  DEFAULT_STYLE_CONFIG,
} from "@/lib/subtitle-styles";
import { Palette, Type, ArrowUpDown, Sparkles, Square, Minus, ArrowLeftRight, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "mv-subtitle-style-memory";

interface SubtitleCustomizerProps {
  config: SubtitleStyleConfig;
  onChange: (config: SubtitleStyleConfig) => void;
}

const positions: { id: SubtitlePosition; label: string }[] = [
  { id: "top", label: "Topo" },
  { id: "center", label: "Centro" },
  { id: "bottom", label: "Baixo" },
];

const SubtitleCustomizer = ({ config, onChange }: SubtitleCustomizerProps) => {
  const set = <K extends keyof SubtitleStyleConfig>(key: K, value: SubtitleStyleConfig[K]) =>
    onChange({ ...config, [key]: value });

  const hasSaved = (() => { try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; } })();

  const saveConfig = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); toast.success("Configuração salva!"); }
    catch { toast.error("Erro ao salvar"); }
  };

  const restoreConfig = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { onChange({ ...DEFAULT_STYLE_CONFIG, ...JSON.parse(saved) }); toast.success("Configuração restaurada!"); }
    } catch { toast.error("Erro ao restaurar"); }
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold font-display uppercase tracking-wider text-primary">
            <Palette className="h-4 w-4" /> Personalização
          </h3>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <button onClick={saveConfig} className="flex w-full items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5 text-[10px] font-semibold text-primary transition-all hover:bg-primary/10">
            <Save className="h-3 w-3" /> Salvar
          </button>
          {hasSaved && (
            <button onClick={restoreConfig} className="flex w-full items-center justify-center gap-1 rounded-lg border border-accent/30 bg-accent/5 px-2 py-1.5 text-[10px] font-semibold text-accent transition-all hover:bg-accent/10">
              <RotateCcw className="h-3 w-3" /> Restaurar
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Estilo da Legenda</label>
        <div className="grid grid-cols-2 gap-2">
          {SUBTITLE_STYLES.map((style) => (
            <button key={style.id} onClick={() => set("styleId", style.id)}
              className={`relative flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${config.styleId === style.id ? "border-primary bg-primary/10 glow-cyan" : "border-border bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50"}`}>
              {style.badge && <span className="absolute -top-1.5 right-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">{style.badge}</span>}
              <span className="text-xs font-semibold text-foreground">{style.name}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><Sparkles className="h-3 w-3" /> Cor de Destaque</label>
        <div className="flex gap-2">
          {HIGHLIGHT_COLORS.map((c) => (
            <button key={c.id} onClick={() => set("highlightColor", c.id)} title={c.name}
              className={`h-8 w-8 rounded-full border-2 transition-all ${config.highlightColor === c.id ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground"}`}
              style={{ backgroundColor: c.color }} />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><Type className="h-3 w-3" /> Tamanho — {config.fontSize}px</label>
        <input type="range" min={14} max={32} step={1} value={config.fontSize} onChange={(e) => set("fontSize", Number(e.target.value))} className="w-full accent-primary" />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><ArrowUpDown className="h-3 w-3" /> Posição</label>
        <div className="flex gap-2">
          {positions.map((p) => (
            <button key={p.id} onClick={() => set("position", p.id)}
              className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all ${config.position === p.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><Minus className="h-3 w-3" /> Ajuste Vertical — {config.verticalOffset}%</label>
        <input type="range" min={0} max={40} step={1} value={config.verticalOffset} onChange={(e) => set("verticalOffset", Number(e.target.value))} className="w-full accent-primary" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide"><Square className="h-3 w-3" /> Fundo da Legenda</label>
          <button onClick={() => set("showBackground", !config.showBackground)}
            className={`relative h-6 w-11 rounded-full border transition-all ${config.showBackground ? "border-primary bg-primary/30" : "border-border bg-secondary/50"}`}>
            <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${config.showBackground ? "left-[22px] bg-primary" : "left-0.5 bg-muted-foreground"}`} />
          </button>
        </div>
        {config.showBackground && (
          <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Opacidade — {config.backgroundOpacity}%</label>
              <input type="range" min={10} max={100} step={5} value={config.backgroundOpacity} onChange={(e) => set("backgroundOpacity", Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Padding — {config.backgroundPadding}px</label>
              <input type="range" min={2} max={24} step={1} value={config.backgroundPadding} onChange={(e) => set("backgroundPadding", Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide"><ArrowLeftRight className="h-2.5 w-2.5" /> Largura Máx. — {config.backgroundMaxWidth}%</label>
              <input type="range" min={30} max={100} step={5} value={config.backgroundMaxWidth} onChange={(e) => set("backgroundMaxWidth", Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleCustomizer;
