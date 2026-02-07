/**
 * Edit Map generator — heuristic analysis of script text into editorial segments.
 * Produces motion, b-roll, SFX, on-screen text, and editor notes per segment.
 */

/* ── Keyword dictionaries ── */

const EMOTION_KEYWORDS = {
  impacto: ["cambia", "revolucion", "increible", "impactante", "nunca", "jamas", "shockeante", "quiebre"],
  tension: ["pero", "sin embargo", "aunque", "contra", "conflicto", "problema", "crisis", "guerra"],
  revelacion: ["secreto", "verdad", "nadie", "oculto", "descubri", "revela", "dato", "clave"],
  calma: ["tranquil", "paz", "suave", "simple", "lento", "natural", "calm"],
  energia: ["rapido", "boom", "explosi", "power", "fuerza", "energia", "intenso", "accion"],
  cierre: ["final", "conclusion", "resume", "segui", "suscrib", "compartir", "proxim"],
};

const MOTION_MAP = {
  impacto: { type: "push_in_fast", label: "Push In Fast", reason: "Enfatiza el momento de impacto" },
  tension: { type: "micro_shake", label: "Micro Shake", reason: "Genera tension visual" },
  revelacion: { type: "slow_zoom_in", label: "Slow Zoom In", reason: "Acercamiento para revelar informacion clave" },
  calma: { type: "pan_left_soft", label: "Pan Left Soft", reason: "Movimiento suave para narración calma" },
  energia: { type: "whip_pan_soft", label: "Whip Pan Soft", reason: "Transicion energetica" },
  cierre: { type: "slow_zoom_out", label: "Slow Zoom Out", reason: "Alejamiento para cerrar el bloque" },
  default: { type: "slow_zoom_in", label: "Slow Zoom In", reason: "Movimiento base por defecto" },
};

const BROLL_MAP = {
  impacto: { query: "dramatic impact slow motion dark cinematic", type: "stock" },
  tension: { query: "dramatic tension dark shadows cinematic 4K", type: "stock" },
  revelacion: { query: "revealing light through darkness cinematic", type: "stock" },
  calma: { query: "calm nature landscape soft light peaceful", type: "stock" },
  energia: { query: "fast motion energy particles dynamic light", type: "stock" },
  cierre: { query: "sunset horizon hopeful cinematic wide shot", type: "stock" },
  default: { query: "atmospheric dark cinematic b-roll footage", type: "stock" },
};

const SFX_MAP = {
  impacto: { effect: "boom cinematografico", intensity: "fuerte" },
  tension: { effect: "riser tension", intensity: "medio" },
  revelacion: { effect: "whoosh suave", intensity: "sutil" },
  calma: { effect: "ambiente oscuro", intensity: "sutil" },
  energia: { effect: "impact bajo", intensity: "medio" },
  cierre: { effect: "reverse cymbal", intensity: "medio" },
  default: { effect: "transicion swoosh", intensity: "sutil" },
};

/* ── Timestamp parsing ── */

function tryParseTimestamps(text) {
  // Range format: 0:00-0:08 or (0:00-0:08) or [0:00-0:08]
  const rangeRx = /[\[(]?(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)[\])]?\s+(.+)/gm;
  const ranges = [];
  let m;
  while ((m = rangeRx.exec(text)) !== null) {
    ranges.push({ startTs: m[1], endTs: m[2], text: m[3].trim() });
  }
  if (ranges.length >= 2) {
    return ranges.map((r, i) => ({
      id: i + 1,
      start: tsToSec(r.startTs),
      end: tsToSec(r.endTs),
      text: r.text,
    }));
  }

  // Single timestamp formats
  const patterns = [
    /\[(\d{1,2}:\d{2}(?:\.\d+)?)\]\s*/g,
    /\((\d{1,2}:\d{2}(?:\.\d+)?)\)\s*/g,
    /^(\d{1,2}:\d{2}(?:\.\d+)?)\s*[-–—:]\s*/gm,
  ];

  for (const rx of patterns) {
    rx.lastIndex = 0;
    const matches = [];
    while ((m = rx.exec(text)) !== null) {
      matches.push({ ts: m[1], idx: m.index, len: m[0].length });
    }
    if (matches.length >= 2) {
      return matches.map((match, i) => {
        const startIdx = match.idx + match.len;
        const endIdx = i + 1 < matches.length ? matches[i + 1].idx : text.length;
        const segText = text.slice(startIdx, endIdx).trim();
        const startSec = tsToSec(match.ts);
        const endSec = i + 1 < matches.length ? tsToSec(matches[i + 1].ts) : startSec + estimateDur(segText);
        return { id: i + 1, start: startSec, end: endSec, text: segText };
      });
    }
  }
  return null;
}

function tsToSec(ts) {
  const parts = ts.replace(/[\[\]()]/g, "").trim().split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function estimateDur(text) {
  return Math.max(3, Math.round(text.split(/\s+/).filter(Boolean).length / 2.5));
}

/* ── Paragraph segmentation ── */

function segmentByParagraphs(text, durationSec) {
  let paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length < 2) paras = text.split(/\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return [];

  const totalWords = paras.reduce((s, p) => s + p.split(/\s+/).length, 0);
  const segments = [];
  let cursor = 0;

  for (let i = 0; i < paras.length; i++) {
    const words = paras[i].split(/\s+/).length;
    const proportion = totalWords > 0 ? words / totalWords : 1 / paras.length;
    const dur = Math.max(3, Math.round(proportion * durationSec));
    segments.push({ id: i + 1, start: Math.round(cursor), end: Math.round(cursor + dur), text: paras[i] });
    cursor += dur;
  }

  // Normalize to target duration
  if (segments.length > 0) {
    const factor = durationSec / cursor;
    let acc = 0;
    for (const seg of segments) {
      const newStart = Math.round(acc);
      acc += (seg.end - seg.start) * factor;
      seg.start = newStart;
      seg.end = Math.round(acc);
    }
    segments[segments.length - 1].end = durationSec;
  }
  return segments;
}

/* ── Keyword detection ── */

function detectEmotion(text) {
  const lower = text.toLowerCase();
  let best = "default";
  let bestScore = 0;
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = emotion;
    }
  }
  return best;
}

function extractKeywords(text) {
  const stopwords = new Set(["el", "la", "los", "las", "de", "del", "en", "un", "una", "que", "por", "con", "se", "es", "no", "lo", "su", "al", "le", "ya", "o", "y", "a"]);
  return text.toLowerCase().split(/\s+/)
    .map((w) => w.replace(/[^a-záéíóúñü]/g, ""))
    .filter((w) => w.length > 3 && !stopwords.has(w))
    .slice(0, 6);
}

function buildOnScreenText(text, index, total) {
  if (index === 0) {
    const words = text.split(/\s+/).slice(0, 6).join(" ");
    return words.toUpperCase();
  }
  // Extract a key phrase for important segments
  if (index === Math.floor(total * 0.5) || index === Math.floor(total * 0.7)) {
    const words = text.split(/\s+/).slice(0, 4).join(" ");
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  return "";
}

function buildEditorNote(emotion, index, total) {
  if (index === 0) return "Hook: maximizar atencion en los primeros 3 segundos";
  if (index === total - 1) return "Cierre: dar espacio para CTA y transicion suave";
  if (index === Math.floor(total * 0.7)) return "Climax: subir ritmo, corte a b-roll de impacto";
  const notes = {
    impacto: "Momento de impacto, considerar corte rapido",
    tension: "Tension narrativa, mantener ritmo sostenido",
    revelacion: "Dato clave, pausa breve antes para generar expectativa",
    energia: "Secuencia energetica, cortes rapidos",
    calma: "Respirar, dejar que la imagen hable",
  };
  return notes[emotion] || "";
}

/* ── Public API ── */

/**
 * Parse raw text into segments with timestamps.
 * @param {string} text
 * @param {string} format - "short" | "long" | "reels"
 * @param {number} durationSec - target duration (used when no timestamps found)
 * @returns {Array} segments
 */
export function parseToSegments(text, format = "short", durationSec = 60) {
  if (!text || !text.trim()) return [];

  const durByFormat = { short: 60, long: 180, reels: 30 };
  const dur = durationSec || durByFormat[format] || 60;

  const timestamped = tryParseTimestamps(text);
  if (timestamped && timestamped.length >= 2) return timestamped;

  return segmentByParagraphs(text, dur);
}

/**
 * Generate edit map suggestions for each segment.
 * @param {Array} segments - [{ id, start, end, text }]
 * @returns {Array} enriched segments with motion/broll/sfx/onScreenText/notes
 */
export function generateEditMap(segments) {
  if (!segments || segments.length === 0) return [];

  let prevMotion = null;

  return segments.map((seg, i) => {
    const emotion = detectEmotion(seg.text);
    const keywords = extractKeywords(seg.text);

    // Pick motion, avoid consecutive repeats
    let motion = MOTION_MAP[emotion] || MOTION_MAP.default;
    if (prevMotion && motion.type === prevMotion && i > 0 && i < segments.length - 1) {
      const fallback = Object.values(MOTION_MAP).find((m) => m.type !== prevMotion && m.type !== "default");
      if (fallback) motion = fallback;
    }
    prevMotion = motion.type;

    // First/last overrides
    if (i === 0) motion = MOTION_MAP.revelacion;
    if (i === segments.length - 1) motion = MOTION_MAP.cierre;

    const broll = BROLL_MAP[emotion] || BROLL_MAP.default;
    const sfx = SFX_MAP[emotion] || SFX_MAP.default;

    return {
      ...seg,
      keywords,
      emotion,
      motion: { type: motion.type, label: motion.label, reason: motion.reason },
      broll: { query: broll.query, type: broll.type },
      sfx: { effect: sfx.effect, intensity: sfx.intensity },
      onScreenText: buildOnScreenText(seg.text, i, segments.length),
      notes: buildEditorNote(emotion, i, segments.length),
    };
  });
}

/**
 * Export edit map as JSON file (client-side download).
 */
export function exportEditMapJSON(segments, format) {
  const data = {
    version: "1.0",
    app: "Celeste Director",
    exportedAt: new Date().toISOString(),
    format,
    segmentCount: segments.length,
    totalDuration: segments.length > 0 ? segments[segments.length - 1].end : 0,
    segments,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `celeste-editmap_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Time formatting ── */

export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
