import {
  type SubtitleStyleConfig,
  type SubtitlePosition,
  type SubtitleFontId,
  type BackgroundColorId,
  type TextAlign,
  SUBTITLE_STYLES,
  HIGHLIGHT_COLORS,
  BACKGROUND_COLORS,
  SUBTITLE_FONTS,
  DEFAULT_STYLE_CONFIG,
} from "@/lib/subtitle-styles";
import { Save, RotateCcw, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
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

const alignOptions: { id: TextAlign; icon: typeof AlignCenter }[] = [
  { id: "left", icon: AlignLeft },
  { id: "center", icon: AlignCenter },
  { id: "right", icon: AlignRight },
];

const SubtitleCustomizer = ({ config, onChange, watermarkEnabled }: SubtitleCustomizerProps) => {
  const set = <K extends keyof SubtitleStyleConfig>(key: K, value: SubtitleStyleConfig[K]) =>
    onChange({ ...config, [key]: value });

  const hasSaved = (() => { try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; } })();

  const saveConfig = () => {
    try {
      const fullSettings = { styleConfig: config, watermarkEnabled: watermarkEnabled ?? true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullSettings));
      toast.success("Configurações salvas!");
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
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2.5">
      {/* Header + Save/Restore */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Personalização</span>
        <div className="flex gap-1">
          <button onClick={saveConfig} className="flex items-center gap-1 rounded border border-primary/30 bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary hover:bg-primary/10">
            <Save className="h-2.5 w-2.5" /> Salvar
          </button>
          {hasSaved && (
            <button onClick={restoreConfig} className="flex items-center gap-1 rounded border border-accent/30 bg-accent/5 px-2 py-0.5 text-[9px] font-semibold text-accent hover:bg-accent/10">
              <RotateCcw className="h-2.5 w-2.5" /> Restaurar
            </button>
          )}
        </div>
      </div>

      {/* Fonte */}
      <div>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Fonte</span>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {SUBTITLE_FONTS.map((font) => (
            <button key={font.id} onClick={() => set("fontId", font.id as SubtitleFontId)}
              className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold transition-all ${config.fontId === font.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"}`}
              style={{ fontFamily: font.cssFamily }}>
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Estilo */}
      <div>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Estilo</span>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {SUBTITLE_STYLES.map((style) => (
            <button key={style.id} onClick={() => set("styleId", style.id)}
              className={`relative rounded border px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap transition-all ${config.styleId === style.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"}`}>
              {style.badge && <span className="absolute -top-1 -right-1 rounded-full bg-accent px-0.5 text-[5px] font-bold text-accent-foreground leading-none">{style.badge}</span>}
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cor da Letra + Cor do Fundo — side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Cor da Letra</span>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c.id} onClick={() => set("highlightColor", c.id)} title={c.name}
                className={`h-4 w-4 rounded-full border-2 transition-all ${config.highlightColor === c.id ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground"} ${c.id === "black" ? "ring-1 ring-muted-foreground/30" : ""}`}
                style={{ backgroundColor: c.color }} />
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Cor do Fundo</span>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {BACKGROUND_COLORS.map((c) => (
              <button key={c.id} onClick={() => set("backgroundColorId", c.id as BackgroundColorId)} title={c.name}
                className={`h-4 w-4 rounded-full border-2 transition-all ${config.backgroundColorId === c.id ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground"} ${c.id === "dark" ? "ring-1 ring-muted-foreground/30" : ""}`}
                style={{ backgroundColor: c.color }} />
            ))}
          </div>
        </div>
      </div>

      {/* Text controls row: Tamanho, Altura Linha, Espaçamento, Alinhamento */}
      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Tamanho</span>
          <input type="range" min={12} max={36} step={1} value={config.fontSize}
            onChange={(e) => set("fontSize", Number(e.target.value))}
            className="mt-0.5 w-full accent-primary h-3" />
          <span className="text-[8px] text-muted-foreground block text-center">{config.fontSize}px</span>
        </div>
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Linha</span>
          <input type="range" min={1} max={2.2} step={0.1} value={config.lineHeight}
            onChange={(e) => set("lineHeight", Number(e.target.value))}
            className="mt-0.5 w-full accent-primary h-3" />
          <span className="text-[8px] text-muted-foreground block text-center">{config.lineHeight.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Espaço</span>
          <input type="range" min={-1} max={5} step={0.5} value={config.letterSpacing}
            onChange={(e) => set("letterSpacing", Number(e.target.value))}
            className="mt-0.5 w-full accent-primary h-3" />
          <span className="text-[8px] text-muted-foreground block text-center">{config.letterSpacing}px</span>
        </div>
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Alinhar</span>
          <div className="mt-0.5 flex gap-0.5">
            {alignOptions.map((a) => (
              <button key={a.id} onClick={() => set("textAlign", a.id)}
                className={`flex-1 flex items-center justify-center rounded border py-0.5 transition-all ${config.textAlign === a.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground"}`}>
                <a.icon className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Position + Vertical + Max Width */}
      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Posição</span>
          <div className="mt-0.5 flex gap-0.5">
            {positions.map((p) => (
              <button key={p.id} onClick={() => set("position", p.id)}
                className={`flex-1 rounded border py-0.5 text-[8px] font-semibold transition-all ${config.position === p.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Vertical</span>
          <input type="range" min={2} max={40} step={1} value={config.verticalOffset}
            onChange={(e) => set("verticalOffset", Number(e.target.value))}
            className="mt-0.5 w-full accent-primary h-3" />
          <span className="text-[8px] text-muted-foreground block text-center">{config.verticalOffset}%</span>
        </div>
        <div>
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Largura</span>
          <input type="range" min={30} max={100} step={5} value={config.backgroundMaxWidth}
            onChange={(e) => set("backgroundMaxWidth", Number(e.target.value))}
            className="mt-0.5 w-full accent-primary h-3" />
          <span className="text-[8px] text-muted-foreground block text-center">{config.backgroundMaxWidth}%</span>
        </div>
      </div>

      {/* Background controls — single compact row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Fundo</span>
          <button onClick={() => set("showBackground", !config.showBackground)}
            className={`relative h-3.5 w-6 rounded-full border transition-all ${config.showBackground ? "border-primary bg-primary/30" : "border-border bg-secondary/50"}`}>
            <span className={`absolute top-0.5 h-2 w-2 rounded-full transition-all ${config.showBackground ? "left-[12px] bg-primary" : "left-0.5 bg-muted-foreground"}`} />
          </button>
        </div>
        {config.showBackground && (
          <>
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] text-muted-foreground">Opac.</span>
              <input type="range" min={10} max={100} step={5} value={config.backgroundOpacity}
                onChange={(e) => set("backgroundOpacity", Number(e.target.value))}
                className="w-12 accent-primary h-2.5" />
              <span className="text-[8px] text-muted-foreground">{config.backgroundOpacity}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] text-muted-foreground">Pad.</span>
              <input type="range" min={2} max={24} step={1} value={config.backgroundPadding}
                onChange={(e) => set("backgroundPadding", Number(e.target.value))}
                className="w-12 accent-primary h-2.5" />
              <span className="text-[8px] text-muted-foreground">{config.backgroundPadding}px</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] text-muted-foreground">Borda</span>
              <input type="range" min={0} max={20} step={1} value={config.borderRadius}
                onChange={(e) => set("borderRadius", Number(e.target.value))}
                className="w-12 accent-primary h-2.5" />
              <span className="text-[8px] text-muted-foreground">{config.borderRadius}px</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubtitleCustomizer;
