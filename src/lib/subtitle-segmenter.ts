import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";

const MAX_WORDS_PER_SEGMENT = 3;

/**
 * Splits long subtitle lines into short phrase segments (2-3 words each)
 * so they display as ONE centered line at a time.
 * Time is distributed proportionally across segments.
 */
export function segmentSubtitles(subtitles: SubtitleLine[]): SubtitleLine[] {
  const result: SubtitleLine[] = [];

  for (const sub of subtitles) {
    const words = sub.text.trim().split(/\s+/).filter(Boolean);

    if (words.length <= MAX_WORDS_PER_SEGMENT) {
      result.push({ ...sub, text: words.join(" ").toUpperCase() });
      continue;
    }

    // Split into chunks of MAX_WORDS_PER_SEGMENT
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += MAX_WORDS_PER_SEGMENT) {
      chunks.push(words.slice(i, i + MAX_WORDS_PER_SEGMENT).join(" "));
    }

    const duration = sub.end - sub.start;
    const chunkDuration = duration / chunks.length;

    for (let i = 0; i < chunks.length; i++) {
      result.push({
        id: `${sub.id}-seg${i}`,
        start: sub.start + i * chunkDuration,
        end: sub.start + (i + 1) * chunkDuration,
        text: chunks[i].toUpperCase(),
      });
    }
  }

  return result;
}
