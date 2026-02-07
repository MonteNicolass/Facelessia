/**
 * Parser de guiones — detecta timestamps o divide por párrafos.
 * Soporta: [0:12], (0:12), 0:12 -, 0:12:, 00:01:05
 */

export function timeToSeconds(ts) {
  const clean = ts.replace(/[\[\]()]/g, "").trim();
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function estimateDuration(text) {
  // ~2.5 palabras/seg narración español
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 2.5));
}

function tryParseTimestamped(text) {
  const patterns = [
    /\[(\d{1,2}:\d{2}(?:\.\d+)?)\]\s*/g,
    /\((\d{1,2}:\d{2}(?:\.\d+)?)\)\s*/g,
    /^(\d{1,2}:\d{2}(?:\.\d+)?)\s*[-–—:]\s*/gm,
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = pattern.exec(text)) !== null) {
      matches.push({
        timestamp: m[1],
        index: m.index,
        len: m[0].length,
      });
    }

    if (matches.length >= 2) {
      return matches.map((match, i) => {
        const startIdx = match.index + match.len;
        const endIdx =
          i + 1 < matches.length ? matches[i + 1].index : text.length;
        const narration = text.slice(startIdx, endIdx).trim();
        const startSec = timeToSeconds(match.timestamp);
        const endSec =
          i + 1 < matches.length
            ? timeToSeconds(matches[i + 1].timestamp)
            : startSec + estimateDuration(narration);

        return {
          id: i + 1,
          startSec,
          endSec,
          narration,
          visualPrompt: "",
          onScreenText: "",
        };
      });
    }
  }
  return null;
}

function parseByParagraphs(text, targetDuration) {
  let paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length < 2) {
    paragraphs = text
      .split(/\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  if (paragraphs.length === 0) return [];

  const totalWords = paragraphs.reduce(
    (sum, p) => sum + p.split(/\s+/).length,
    0
  );

  const scenes = [];
  let cursor = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const words = paragraphs[i].split(/\s+/).length;
    const proportion =
      totalWords > 0 ? words / totalWords : 1 / paragraphs.length;
    const dur = Math.max(3, Math.round(proportion * targetDuration));

    scenes.push({
      id: i + 1,
      startSec: Math.round(cursor),
      endSec: Math.round(cursor + dur),
      narration: paragraphs[i],
      visualPrompt: "",
      onScreenText: "",
    });
    cursor += dur;
  }

  // Normalizar al target
  if (scenes.length > 0) {
    const factor = targetDuration / cursor;
    let acc = 0;
    for (const scene of scenes) {
      const newStart = Math.round(acc);
      acc += (scene.endSec - scene.startSec) * factor;
      scene.startSec = newStart;
      scene.endSec = Math.round(acc);
    }
    scenes[scenes.length - 1].endSec = targetDuration;
  }

  return scenes;
}

/**
 * Parser principal.
 * Si detecta timestamps, los usa. Si no, divide por párrafos.
 */
export function parseScript(text, targetDurationSec = 60) {
  if (!text || !text.trim()) return [];

  const timestamped = tryParseTimestamped(text);
  if (timestamped && timestamped.length >= 2) return timestamped;

  return parseByParagraphs(text, targetDurationSec);
}
