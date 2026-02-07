/**
 * Parser de guiones — detecta timestamps o divide por párrafos.
 * Soporta: [0:12], (0:12), 0:12 -, 0:12:, 00:01:05, 00:12-00:18 (rango)
 *
 * Contract: celeste_scriptpack_v1
 * ScriptPack JSON shape:
 * {
 *   _format: "celeste_scriptpack_v1",
 *   title: string,
 *   durationSec: number,
 *   tone: string,
 *   scenes: [{ id, startSec, endSec, narration, visualPrompt?, onScreenText? }]
 * }
 */

// --- Contract: celeste_scriptpack_v1 ---

export const SCRIPTPACK_FORMAT = "celeste_scriptpack_v1";

/**
 * Valida un objeto contra el contrato celeste_scriptpack_v1.
 * Retorna { valid: boolean, data?: object, error?: string }
 */
export function validateScriptPack(obj) {
  if (!obj || typeof obj !== "object") {
    return { valid: false, error: "No es un objeto válido" };
  }
  if (obj._format !== SCRIPTPACK_FORMAT) {
    return { valid: false, error: `Formato no reconocido: esperado "${SCRIPTPACK_FORMAT}", recibido "${obj._format || "ninguno"}"` };
  }
  if (!Array.isArray(obj.scenes) || obj.scenes.length === 0) {
    return { valid: false, error: "El ScriptPack no tiene escenas" };
  }
  for (let i = 0; i < obj.scenes.length; i++) {
    const s = obj.scenes[i];
    if (typeof s.startSec !== "number" || typeof s.endSec !== "number" || typeof s.narration !== "string") {
      return { valid: false, error: `Escena ${i + 1}: faltan campos requeridos (startSec, endSec, narration)` };
    }
  }
  return {
    valid: true,
    data: {
      title: obj.title || "",
      durationSec: obj.durationSec || obj.scenes[obj.scenes.length - 1].endSec,
      tone: obj.tone || "informativo",
      scenes: obj.scenes.map((s, i) => ({
        id: s.id || i + 1,
        startSec: s.startSec,
        endSec: s.endSec,
        narration: s.narration,
        visualPrompt: s.visualPrompt || "",
        onScreenText: s.onScreenText || "",
      })),
    },
  };
}

/**
 * Crea un ScriptPack JSON exportable desde state.
 */
export function buildScriptPack(project, scenes) {
  return {
    _format: SCRIPTPACK_FORMAT,
    title: project.title,
    durationSec: project.durationSec,
    tone: project.tone,
    scenes: scenes.map((s) => ({
      id: s.id,
      startSec: s.startSec,
      endSec: s.endSec,
      narration: s.narration,
      visualPrompt: s.visualPrompt || "",
      onScreenText: s.onScreenText || "",
    })),
  };
}

// --- Utilidades de tiempo ---

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
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 2.5));
}

// --- Detección de timestamps ---

function tryParseTimestamped(text) {
  // Patrón rango: 00:12-00:18 texto
  const rangePattern = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)/gm;
  const rangeMatches = [];
  let rm;
  while ((rm = rangePattern.exec(text)) !== null) {
    rangeMatches.push({
      startTs: rm[1],
      endTs: rm[2],
      narration: rm[3].trim(),
    });
  }
  if (rangeMatches.length >= 2) {
    return rangeMatches.map((m, i) => ({
      id: i + 1,
      startSec: timeToSeconds(m.startTs),
      endSec: timeToSeconds(m.endTs),
      narration: m.narration,
      visualPrompt: "",
      onScreenText: "",
    }));
  }

  // Patrones de timestamp simple
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
 * Intenta: 1) ScriptPack JSON, 2) timestamps, 3) párrafos.
 */
export function parseScript(text, targetDurationSec = 60) {
  if (!text || !text.trim()) return [];

  // Intentar parsear como JSON (podría ser un ScriptPack pegado)
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed);
      const result = validateScriptPack(obj);
      if (result.valid) return result.data.scenes;
    } catch {
      // No es JSON válido, seguir con parsing de texto
    }
  }

  const timestamped = tryParseTimestamped(text);
  if (timestamped && timestamped.length >= 2) return timestamped;

  return parseByParagraphs(text, targetDurationSec);
}
