import { SUBTITLE_FONTS } from "./subtitle-styles";

let loaded = false;

/** Injects a single <link> for all Google Fonts used by the subtitle system */
export function loadSubtitleFonts() {
  if (loaded) return;
  loaded = true;

  const families = SUBTITLE_FONTS
    .filter((f) => f.googleFont)
    .map((f) => `family=${f.googleFont}`)
    .join("&");

  if (!families) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}
