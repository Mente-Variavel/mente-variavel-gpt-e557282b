import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";

const formatSrtTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
};

export function exportSRT(subtitles: SubtitleLine[]): string {
  return subtitles
    .map((sub, i) => `${i + 1}\n${formatSrtTime(sub.start)} --> ${formatSrtTime(sub.end)}\n${sub.text}`)
    .join("\n\n");
}

export function downloadSRT(subtitles: SubtitleLine[], filename = "legendas.srt") {
  const content = exportSRT(subtitles);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTXT(subtitles: SubtitleLine[]): string {
  return subtitles.map((s) => s.text).join("\n");
}

export function downloadTXT(subtitles: SubtitleLine[], filename = "legendas.txt") {
  const content = exportTXT(subtitles);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
