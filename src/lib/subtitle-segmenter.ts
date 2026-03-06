import type { SubtitleLine } from "@/components/subtitles/SubtitleEditor";

const MAX_WORDS_PER_SEGMENT = 4;
const MAX_CHARS_PER_SEGMENT = 26;

/**
 * Splits long subtitle lines into short phrase segments
 * so they display as ONE centered line at a time.
 * 
 * Rules:
 * - Max 4 words per segment
 * - Max ~26 characters per segment
 * - Never breaks words in the middle
 * - Time is distributed proportionally across segments
 */
export function segmentSubtitles(subtitles: SubtitleLine[]): SubtitleLine[] {
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
        (currentChunk.length >= MAX_WORDS_PER_SEGMENT || candidate.length > MAX_CHARS_PER_SEGMENT)
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
