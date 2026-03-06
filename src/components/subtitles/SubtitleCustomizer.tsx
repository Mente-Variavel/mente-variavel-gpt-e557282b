import {
  type SubtitleStyleConfig,
  type SubtitleFontId,
  SUBTITLE_FONTS,
  STYLE_PRESETS,
  COLOR_PRESETS,
  DEFAULT_STYLE_CONFIG,
} from "@/lib/subtitle-styles";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "mv-subtitle-full-settings";

interface SubtitleCustomizerProps {
  config: SubtitleStyleConfig;
  onChange: (config: SubtitleStyleConfig) => void;
  watermarkEnabled?: boolean;
  onResegment?: () => void;
}

const SubtitleCustomizer = ({ config, onChange, watermarkEnabled, onResegment }: SubtitleCustomizerProps) => {
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

  const applyPreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const newConfig = { ...DEFAULT_STYLE_CONFIG, ...preset.config };
    onChange(newConfig);
    // If layout mode changed, trigger re-segmentation
    if (preset.config.layoutMode && preset.config.layoutMode !== config.layoutMode) {
      onResegment?.();
    }
    toast.success(`Preset "${preset.name}" aplicado!`);
  };

  const activePresetId = STYLE_PRESETS.find(p => {
    const c = p.config;
    return c.styleId === config.styleId && c.fontId === config.fontId && c.layoutMode === config.layoutMode;
  })?.id;

  const activeColorPresetId = COLOR_PRESETS.find(
    p => p.highlightColor === config.highlightColor && p.backgroundColorId === config.backgroundColorId
  )?.id;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3">
      {/* Header + Save/Restore */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Estilo da Legenda</span>
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

      {/* Style Presets */}
      <div>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Preset</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`relative rounded-lg border px-2 py-1 text-[9px] font-semibold whitespace-nowrap transition-all ${
                activePresetId === preset.id
                  ? "border-primary bg-primary/15 text-primary shadow-sm"
                  : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              {preset.badge && (
                <span className="absolute -top-1.5 -right-1 rounded-full bg-accent px-1 text-[6px] font-bold text-accent-foreground leading-tight">
                  {preset.badge}
                </span>
              )}
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font selector */}
      <div>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Fonte</span>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {SUBTITLE_FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => set("fontId", font.id as SubtitleFontId)}
              className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold transition-all ${
                config.fontId === font.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: font.cssFamily }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color presets */}
      <div>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Cor</span>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {COLOR_PRESETS.map((cp) => (
            <button
              key={cp.id}
              onClick={() => {
                onChange({ ...config, highlightColor: cp.highlightColor, backgroundColorId: cp.backgroundColorId });
              }}
              className={`rounded-lg border px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap transition-all ${
                activeColorPresetId === cp.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Size */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Tamanho</span>
          <span className="text-[9px] text-muted-foreground">{config.fontSize}px</span>
        </div>
        <input
          type="range"
          min={14}
          max={32}
          step={1}
          value={config.fontSize}
          onChange={(e) => set("fontSize", Number(e.target.value))}
          className="mt-0.5 w-full accent-primary h-3"
        />
      </div>

      {/* Vertical Offset */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Altura</span>
          <span className="text-[9px] text-muted-foreground">{config.verticalOffset ?? 0}%</span>
        </div>
        <input
          type="range"
          min={-40}
          max={40}
          step={1}
          value={config.verticalOffset ?? 0}
          onChange={(e) => set("verticalOffset", Number(e.target.value))}
          className="mt-0.5 w-full accent-primary h-3"
        />
      </div>

      {/* Position - simple 3 buttons */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Posição</span>
        <div className="flex gap-0.5">
          {(["top", "center", "bottom"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => set("position", pos)}
              className={`rounded border px-2 py-0.5 text-[8px] font-semibold transition-all ${
                config.position === pos
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground"
              }`}
            >
              {pos === "top" ? "Topo" : pos === "center" ? "Centro" : "Baixo"}
            </button>
          ))}
        </div>
        {/* Background toggle */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">Fundo</span>
          <button
            onClick={() => set("showBackground", !config.showBackground)}
            className={`relative h-3.5 w-6 rounded-full border transition-all ${
              config.showBackground ? "border-primary bg-primary/30" : "border-border bg-secondary/50"
            }`}
          >
            <span
              className={`absolute top-0.5 h-2 w-2 rounded-full transition-all ${
                config.showBackground ? "left-[12px] bg-primary" : "left-0.5 bg-muted-foreground"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Full-width bar (anti-watermark) */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Barra Anti-Marca</span>
          <button
            onClick={() => set("fullWidthBackground", !config.fullWidthBackground)}
            className={`relative h-3.5 w-6 rounded-full border transition-all ${
              config.fullWidthBackground ? "border-primary bg-primary/30" : "border-border bg-secondary/50"
            }`}
          >
            <span
              className={`absolute top-0.5 h-2 w-2 rounded-full transition-all ${
                config.fullWidthBackground ? "left-[12px] bg-primary" : "left-0.5 bg-muted-foreground"
              }`}
            />
          </button>
        </div>
        {config.fullWidthBackground && (
          <div className="mt-1 flex flex-col gap-1.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-muted-foreground">Espessura</span>
                <span className="text-[8px] text-muted-foreground">{config.fullWidthBarHeight ?? 60}px</span>
              </div>
              <input
                type="range"
                min={30}
                max={150}
                step={2}
                value={config.fullWidthBarHeight ?? 60}
                onChange={(e) => set("fullWidthBarHeight", Number(e.target.value))}
                className="mt-0.5 w-full accent-primary h-3"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-muted-foreground">Largura</span>
                <span className="text-[8px] text-muted-foreground">{config.fullWidthBarWidth ?? 100}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                step={1}
                value={config.fullWidthBarWidth ?? 100}
                onChange={(e) => set("fullWidthBarWidth", Number(e.target.value))}
                className="mt-0.5 w-full accent-primary h-3"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-muted-foreground">Posição da Barra</span>
                <span className="text-[8px] text-muted-foreground">{config.fullWidthBarOffset ?? 10}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={config.fullWidthBarOffset ?? 10}
                onChange={(e) => set("fullWidthBarOffset", Number(e.target.value))}
                className="mt-0.5 w-full accent-primary h-3"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleCustomizer;
