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
  /** Google Fonts import name (null = system font) */
  googleFont: string | null;
}

export const SUBTITLE_FONTS: SubtitleFontInfo[] = [
  { id: "orbitron", name: "Orbitron", cssFamily: '"Orbitron", sans-serif', googleFont: "Orbitron:wght@400;600;700;800;900" },
  { id: "montserrat", name: "Montserrat", cssFamily: '"Montserrat", sans-serif', googleFont: "Montserrat:wght@400;600;700;800;900" },
  { id: "poppins", name: "Poppins", cssFamily: '"Poppins", sans-serif', googleFont: "Poppins:wght@400;600;700;800;900" },
  { id: "bebas-neue", name: "Bebas Neue", cssFamily: '"Bebas Neue", sans-serif', googleFont: "Bebas+Neue" },
  { id: "anton", name: "Anton", cssFamily: '"Anton", sans-serif', googleFont: "Anton" },
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

export const DEFAULT_STYLE_CONFIG: SubtitleStyleConfig = {
  styleId: "mente-variavel",
  highlightColor: "neon-green",
  fontSize: 20,
  position: "bottom",
  showBackground: true,
  backgroundOpacity: 70,
  backgroundPadding: 8,
  verticalOffset: 10,
  backgroundMaxWidth: 90,
  fontId: "orbitron",
};

/** Get the CSS font-family string for a given fontId */
export const getFontFamily = (fontId: SubtitleFontId): string =>
  SUBTITLE_FONTS.find((f) => f.id === fontId)?.cssFamily ?? '"Orbitron", sans-serif';

/** Get a canvas-friendly font-family string (no CSS quotes needed for canvas) */
export const getCanvasFontFamily = (fontId: SubtitleFontId): string => {
  const font = SUBTITLE_FONTS.find((f) => f.id === fontId);
  if (!font) return '"Orbitron", sans-serif';
  return font.cssFamily;
};
