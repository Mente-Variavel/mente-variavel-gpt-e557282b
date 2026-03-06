export type SubtitleLayoutMode = "single-line" | "two-line";

export type SubtitleStyleId =
  | "classic"
  | "dynamic-highlight"
  | "alternating"
  | "emphasis"
  | "animated-fade"
  | "animated-slide"
  | "mente-variavel"
  | "reels"
  | "shorts"
  | "podcast"
  | "influencer"
  | "educational";

export type SubtitlePosition = "top" | "center" | "bottom";

export type HighlightColor = "neon-blue" | "neon-green" | "white" | "yellow" | "pink" | "black" | "red";

export type SubtitleFontId =
  | "orbitron"
  | "montserrat"
  | "poppins"
  | "bebas-neue"
  | "anton"
  | "oswald"
  | "impact";

export type BackgroundColorId = "dark" | "neon-blue" | "neon-green" | "white" | "yellow" | "pink" | "black" | "red";

export type TextAlign = "center" | "left" | "right";

export interface SubtitleStyleConfig {
  styleId: SubtitleStyleId;
  highlightColor: HighlightColor;
  fontSize: number;
  position: SubtitlePosition;
  showBackground: boolean;
  backgroundOpacity: number;
  backgroundPadding: number;
  verticalOffset: number;
  backgroundMaxWidth: number;
  fontId: SubtitleFontId;
  backgroundColorId: BackgroundColorId;
  lineHeight: number;
  letterSpacing: number;
  textAlign: TextAlign;
  borderRadius: number;
  layoutMode: SubtitleLayoutMode;
  /** Full-width background bar to cover watermarks */
  fullWidthBackground: boolean;
  /** Height of the full-width bar in pixels (preview scale) */
  fullWidthBarHeight: number;
}

export interface SubtitlePresetInfo {
  id: string;
  name: string;
  description: string;
  badge?: string;
  config: Partial<SubtitleStyleConfig>;
}

export interface SubtitleStyleInfo {
  id: SubtitleStyleId;
  name: string;
  description: string;
  badge?: string;
}

export interface SubtitleFontInfo {
  id: SubtitleFontId;
  name: string;
  cssFamily: string;
  googleFont: string | null;
}

export const SUBTITLE_FONTS: SubtitleFontInfo[] = [
  { id: "montserrat", name: "Montserrat", cssFamily: '"Montserrat", sans-serif', googleFont: "Montserrat:wght@400;600;700;800;900" },
  { id: "poppins", name: "Poppins", cssFamily: '"Poppins", sans-serif', googleFont: "Poppins:wght@400;600;700;800;900" },
  { id: "bebas-neue", name: "Bebas Neue", cssFamily: '"Bebas Neue", sans-serif', googleFont: "Bebas+Neue" },
  { id: "anton", name: "Anton", cssFamily: '"Anton", sans-serif', googleFont: "Anton" },
  { id: "orbitron", name: "Orbitron", cssFamily: '"Orbitron", sans-serif', googleFont: "Orbitron:wght@400;600;700;800;900" },
  { id: "oswald", name: "Oswald", cssFamily: '"Oswald", sans-serif', googleFont: "Oswald:wght@400;600;700" },
  { id: "impact", name: "Impact", cssFamily: '"Impact", "Arial Black", sans-serif', googleFont: null },
];

export const SUBTITLE_STYLES: SubtitleStyleInfo[] = [
  { id: "classic", name: "Clássico", description: "Legenda simples e limpa" },
  { id: "dynamic-highlight", name: "Destaque Dinâmico", description: "Cada palavra muda de cor sequencialmente" },
  { id: "alternating", name: "Cores Alternadas", description: "Palavras alternam entre cores neon" },
  { id: "emphasis", name: "Ênfase", description: "Palavras-chave aparecem maiores e em negrito" },
  { id: "animated-fade", name: "Fade In", description: "Legendas entram com efeito de fade suave" },
  { id: "animated-slide", name: "Slide Up", description: "Legendas deslizam de baixo para cima" },
  { id: "mente-variavel", name: "Mente Variável", description: "Estilo exclusivo com neon verde e azul da marca", badge: "EXCLUSIVO" },
  { id: "reels", name: "Reels Style", description: "Texto grande e bold com keywords em destaque", badge: "NOVO" },
  { id: "shorts", name: "Shorts Style", description: "Legendas grandes centralizadas para vídeos verticais", badge: "NOVO" },
  { id: "podcast", name: "Podcast Style", description: "Legendas clean no rodapé com sombra suave" },
  { id: "influencer", name: "Influencer", description: "Palavras animadas com cores dinâmicas vibrantes" },
  { id: "educational", name: "Educacional", description: "Palavras-chave destacadas para retenção" },
];

export const HIGHLIGHT_COLORS: { id: HighlightColor; name: string; color: string }[] = [
  { id: "neon-blue", name: "Azul Neon", color: "hsl(185 100% 50%)" },
  { id: "neon-green", name: "Verde Neon", color: "hsl(155 100% 45%)" },
  { id: "white", name: "Branco", color: "hsl(0 0% 100%)" },
  { id: "yellow", name: "Amarelo", color: "hsl(50 100% 55%)" },
  { id: "pink", name: "Rosa Pink", color: "hsl(330 100% 50%)" },
  { id: "black", name: "Preto", color: "hsl(0 0% 0%)" },
  { id: "red", name: "Vermelho", color: "hsl(0 100% 50%)" },
];

export const BACKGROUND_COLORS: { id: BackgroundColorId; name: string; color: string; rgba: string }[] = [
  { id: "dark", name: "Escuro", color: "hsl(222 47% 5%)", rgba: "8, 12, 20" },
  { id: "black", name: "Preto", color: "hsl(0 0% 0%)", rgba: "0, 0, 0" },
  { id: "neon-blue", name: "Azul Neon", color: "hsl(185 100% 25%)", rgba: "0, 90, 128" },
  { id: "neon-green", name: "Verde Neon", color: "hsl(155 100% 20%)", rgba: "0, 102, 60" },
  { id: "pink", name: "Rosa Pink", color: "hsl(330 100% 25%)", rgba: "128, 0, 64" },
  { id: "red", name: "Vermelho", color: "hsl(0 100% 25%)", rgba: "128, 0, 0" },
  { id: "white", name: "Branco", color: "hsl(0 0% 100%)", rgba: "255, 255, 255" },
  { id: "yellow", name: "Amarelo", color: "hsl(50 100% 30%)", rgba: "153, 128, 0" },
];

/** Color presets for simplified UI */
export const COLOR_PRESETS: { id: string; name: string; highlightColor: HighlightColor; backgroundColorId: BackgroundColorId }[] = [
  { id: "white-only", name: "Branco", highlightColor: "white", backgroundColorId: "dark" },
  { id: "white-green", name: "Branco + Verde", highlightColor: "neon-green", backgroundColorId: "dark" },
  { id: "white-blue", name: "Branco + Azul", highlightColor: "neon-blue", backgroundColorId: "dark" },
  { id: "white-yellow", name: "Branco + Amarelo", highlightColor: "yellow", backgroundColorId: "dark" },
  { id: "white-pink", name: "Branco + Rosa", highlightColor: "pink", backgroundColorId: "dark" },
  { id: "white-red", name: "Branco + Vermelho", highlightColor: "red", backgroundColorId: "black" },
];

/** Style presets that auto-configure everything */
export const STYLE_PRESETS: SubtitlePresetInfo[] = [
  {
    id: "single-viral",
    name: "Single Line Viral",
    description: "Uma linha por vez, estilo Zemo",
    badge: "POPULAR",
    config: {
      layoutMode: "single-line",
      styleId: "dynamic-highlight",
      fontId: "montserrat",
      fontSize: 22,
      position: "bottom",
      showBackground: true,
      backgroundOpacity: 70,
      backgroundPadding: 8,
      backgroundColorId: "dark",
      borderRadius: 8,
      verticalOffset: 10,
      backgroundMaxWidth: 90,
      highlightColor: "neon-green",
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: "center",
    },
  },
  {
    id: "two-line-viral",
    name: "Two Line Viral",
    description: "Duas linhas, estilo Opus",
    badge: "NOVO",
    config: {
      layoutMode: "two-line",
      styleId: "dynamic-highlight",
      fontId: "bebas-neue",
      fontSize: 24,
      position: "bottom",
      showBackground: true,
      backgroundOpacity: 60,
      backgroundPadding: 10,
      backgroundColorId: "dark",
      borderRadius: 8,
      verticalOffset: 10,
      backgroundMaxWidth: 90,
      highlightColor: "yellow",
      lineHeight: 1.3,
      letterSpacing: 0,
      textAlign: "center",
    },
  },
  {
    id: "podcast-clean",
    name: "Podcast Clean",
    description: "Legendas limpas para podcasts",
    config: {
      layoutMode: "two-line",
      styleId: "podcast",
      fontId: "poppins",
      fontSize: 18,
      position: "bottom",
      showBackground: true,
      backgroundOpacity: 80,
      backgroundPadding: 10,
      backgroundColorId: "black",
      borderRadius: 12,
      verticalOffset: 8,
      backgroundMaxWidth: 85,
      highlightColor: "white",
      lineHeight: 1.3,
      letterSpacing: 0,
      textAlign: "center",
    },
  },
  {
    id: "highlight-words",
    name: "Highlight Words",
    description: "Palavras-chave em destaque",
    config: {
      layoutMode: "single-line",
      styleId: "emphasis",
      fontId: "anton",
      fontSize: 24,
      position: "center",
      showBackground: false,
      backgroundOpacity: 60,
      backgroundPadding: 8,
      backgroundColorId: "dark",
      borderRadius: 8,
      verticalOffset: 10,
      backgroundMaxWidth: 90,
      highlightColor: "neon-blue",
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: "center",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simples e discreto",
    config: {
      layoutMode: "single-line",
      styleId: "classic",
      fontId: "poppins",
      fontSize: 16,
      position: "bottom",
      showBackground: true,
      backgroundOpacity: 50,
      backgroundPadding: 6,
      backgroundColorId: "dark",
      borderRadius: 6,
      verticalOffset: 8,
      backgroundMaxWidth: 80,
      highlightColor: "white",
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: "center",
    },
  },
  {
    id: "mente-variavel",
    name: "Mente Variável",
    description: "Estilo exclusivo da marca",
    badge: "EXCLUSIVO",
    config: {
      layoutMode: "single-line",
      styleId: "mente-variavel",
      fontId: "orbitron",
      fontSize: 20,
      position: "bottom",
      showBackground: true,
      backgroundOpacity: 70,
      backgroundPadding: 8,
      backgroundColorId: "dark",
      borderRadius: 8,
      verticalOffset: 10,
      backgroundMaxWidth: 90,
      highlightColor: "neon-green",
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: "center",
    },
  },
];

export const DEFAULT_STYLE_CONFIG: SubtitleStyleConfig = {
  styleId: "dynamic-highlight",
  highlightColor: "neon-green",
  fontSize: 22,
  position: "bottom",
  showBackground: true,
  backgroundOpacity: 70,
  backgroundPadding: 8,
  verticalOffset: 10,
  backgroundMaxWidth: 90,
  fontId: "montserrat",
  backgroundColorId: "dark",
  lineHeight: 1.2,
  letterSpacing: 0,
  textAlign: "center",
  borderRadius: 8,
  layoutMode: "single-line",
};

/** Get the CSS font-family string for a given fontId */
export const getFontFamily = (fontId: SubtitleFontId): string =>
  SUBTITLE_FONTS.find((f) => f.id === fontId)?.cssFamily ?? '"Montserrat", sans-serif';

/** Get a canvas-friendly font-family string */
export const getCanvasFontFamily = (fontId: SubtitleFontId): string => {
  const font = SUBTITLE_FONTS.find((f) => f.id === fontId);
  if (!font) return '"Montserrat", sans-serif';
  return font.cssFamily;
};
