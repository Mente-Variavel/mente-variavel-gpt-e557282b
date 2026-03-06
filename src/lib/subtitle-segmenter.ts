import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";
import type { SubtitleLayoutMode } from "./subtitle-styles";

const SINGLE_LINE_MAX_WORDS = 4;
const SINGLE_LINE_MAX_CHARS = 26;

const TWO_LINE_MAX_WORDS = 8;
const TWO_LINE_MAX_CHARS = 50;

/**
 * Splits long subtitle lines into short phrase segments.
 * 
 * - "single-line": Max 4 words / ~26 chars — ONE line at a time
 * - "two-line": Max 8 words / ~50 chars — up to TWO lines at a time
 * 
 * Time is distributed proportionally by character count.
 */
export function segmentSubtitles(
  subtitles: SubtitleLine[],
  mode: SubtitleLayoutMode = "single-line"
): SubtitleLine[] {
  const maxWords = mode === "two-line" ? TWO_LINE_MAX_WORDS : SINGLE_LINE_MAX_WORDS;
  const maxChars = mode === "two-line" ? TWO_LINE_MAX_CHARS : SINGLE_LINE_MAX_CHARS;

  const result: SubtitleLine[] = [];

  for (const sub of subtitles) {
    const words = sub.text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    // Build chunks respecting both word count and character limits
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    for (const word of words) {
      const candidate = [...currentChunk, word].join(" ");

      if (
        currentChunk.length > 0 &&
        (currentChunk.length >= maxWords || candidate.length > maxChars)
      ) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [word];
      } else {
        currentChunk.push(word);
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
    }

    // Single chunk that already fits
    if (chunks.length === 1) {
      result.push({ ...sub, text: chunks[0].toUpperCase() });
      continue;
    }

    // Distribute time proportionally by character count
    const totalChars = chunks.reduce((sum, c) => sum + c.length, 0);
    const duration = sub.end - sub.start;
    let offset = sub.start;

    for (let i = 0; i < chunks.length; i++) {
      const chunkDuration = (chunks[i].length / totalChars) * duration;
      result.push({
        id: `${sub.id}-seg${i}`,
        start: offset,
        end: offset + chunkDuration,
        text: chunks[i].toUpperCase(),
      });
      offset += chunkDuration;
    }
  }

  return result;
}
