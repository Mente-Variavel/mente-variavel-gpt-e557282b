export type SubtitleStyleId =
  | "classic"
  | "dynamic-highlight"
  | "alternating"
  | "emphasis"
  | "animated-fade"
  | "animated-slide"
  | "mente-variavel";

export type SubtitlePosition = "top" | "center" | "bottom";

export type HighlightColor = "neon-blue" | "neon-green" | "white" | "yellow";

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
}

export interface SubtitleStyleInfo {
  id: SubtitleStyleId;
  name: string;
  description: string;
  badge?: string;
}

export const SUBTITLE_STYLES: SubtitleStyleInfo[] = [
  { id: "classic", name: "Clássico", description: "Legenda simples e limpa" },
  { id: "dynamic-highlight", name: "Destaque Dinâmico", description: "Cada palavra muda de cor sequencialmente" },
  { id: "alternating", name: "Cores Alternadas", description: "Palavras alternam entre cores neon" },
  { id: "emphasis", name: "Ênfase", description: "Palavras-chave aparecem maiores e em negrito" },
  { id: "animated-fade", name: "Fade In", description: "Legendas entram com efeito de fade suave" },
  { id: "animated-slide", name: "Slide Up", description: "Legendas deslizam de baixo para cima" },
  { id: "mente-variavel", name: "Mente Variável", description: "Estilo exclusivo com neon verde e azul da marca", badge: "EXCLUSIVO" },
];

export const HIGHLIGHT_COLORS: { id: HighlightColor; name: string; color: string }[] = [
  { id: "neon-blue", name: "Azul Neon", color: "hsl(185 100% 50%)" },
  { id: "neon-green", name: "Verde Neon", color: "hsl(155 100% 45%)" },
  { id: "white", name: "Branco", color: "hsl(0 0% 100%)" },
  { id: "yellow", name: "Amarelo", color: "hsl(50 100% 55%)" },
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
};
