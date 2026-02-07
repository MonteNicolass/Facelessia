/**
 * Script parser — detects timestamps, segments text, assigns motions/broll/sfx.
 */

const DURATION_MAP = { short_epico: 60, consistencia: 60, educativo: 90 };

const MOTION_KW = {
  "zoom-in": ["revelacion", "dato", "secreto", "descubri", "clave", "verdad", "mira"],
  "punch-in": ["impacto", "boom", "explosion", "increible", "shockeante", "nunca"],
  "shake-soft": ["guerra", "conflicto", "crisis", "tension", "problema", "peligro"],
  "pan-lr": ["historia", "epoca", "tiempo", "viaje", "recorrido", "camino"],
  "pan-ud": ["grande", "monumental", "enorme", "gigante", "torre", "altura"],
  "zoom-out": ["final", "conclusion", "resume", "cierre", "despedida"],
};

const BROLL_KW = {
  "battle cinematic dark 4K": ["batalla", "guerra", "conflicto", "pelea"],
  "explosion dramatic slow motion": ["explosion", "destruccion", "colapso"],
  "mystery dark shadows cinematic": ["secreto", "misterio", "oculto"],
  "technology futuristic neon": ["tecnologia", "futuro", "digital", "innovacion"],
  "nature landscape dramatic aerial": ["naturaleza", "paisaje", "montaña", "oceano"],
  "historical architecture cinematic": ["historia", "antiguo", "civilizacion", "imperio"],
  "dramatic portrait close up": ["persona", "rostro", "mirada"],
};

const SFX_KW = {
  hit: ["impacto", "golpe", "boom", "explosion", "dato"],
  riser: ["revelacion", "secreto", "verdad", "giro", "warning"],
  whoosh: ["transicion", "cambio", "paso", "siguiente"],
  boom: ["climax", "increible", "gigante"],
};

/* ── Timestamp detection ── */

function tryParseTimestamps(text) {
  const rangeRx = /[\[(]?(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)[\])]?\s+(.+)/gm;
  const ranges = [];
  let m;
  while ((m = rangeRx.exec(text)) !== null) {
    ranges.push({ start: tsToSec(m[1]), end: tsToSec(m[2]), text: m[3].trim() });
  }
  if (ranges.length >= 2) return ranges;

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
        const si = match.idx + match.len;
        const ei = i + 1 < matches.length ? matches[i + 1].idx : text.length;
        const segText = text.slice(si, ei).trim();
        const start = tsToSec(match.ts);
        const end = i + 1 < matches.length ? tsToSec(matches[i + 1].ts) : start + estSec(segText);
        return { start, end, text: segText };
      });
    }
  }
  return null;
}

function tsToSec(ts) {
  const p = ts.replace(/[\[\]()]/g, "").trim().split(":").map(Number);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0);
}

function estSec(text, wpm = 160) {
  return Math.max(3, Math.round((text.split(/\s+/).filter(Boolean).length / wpm) * 60));
}

/* ── Paragraph segmentation ── */

function segmentByParagraphs(text, targetDuration, targetScenes) {
  let paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length < 2) paras = text.split(/\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return [];

  while (paras.length > targetScenes + 2 && paras.length > 2) {
    let minLen = Infinity, minIdx = 0;
    for (let i = 0; i < paras.length - 1; i++) {
      const c = paras[i].length + paras[i + 1].length;
      if (c < minLen) { minLen = c; minIdx = i; }
    }
    paras[minIdx] = paras[minIdx] + " " + paras[minIdx + 1];
    paras.splice(minIdx + 1, 1);
  }

  const totalWords = paras.reduce((s, p) => s + p.split(/\s+/).length, 0);
  const segs = [];
  let cursor = 0;
  for (const p of paras) {
    const words = p.split(/\s+/).length;
    const dur = Math.max(3, Math.round((totalWords > 0 ? words / totalWords : 1 / paras.length) * targetDuration));
    segs.push({ start: Math.round(cursor), end: Math.round(cursor + dur), text: p });
    cursor += dur;
  }
  if (segs.length > 0) {
    const factor = targetDuration / cursor;
    let acc = 0;
    for (const seg of segs) {
      const ns = Math.round(acc);
      acc += (seg.end - seg.start) * factor;
      seg.start = ns;
      seg.end = Math.round(acc);
    }
    segs[segs.length - 1].end = targetDuration;
  }
  return segs;
}

/* ── Heuristic assignment ── */

function pickMotion(text, i, total) {
  if (i === 0) return "zoom-in";
  if (i === total - 1) return "zoom-out";
  if (i === Math.floor(total * 0.7)) return "punch-in";
  const lw = text.toLowerCase();
  for (const [motion, kws] of Object.entries(MOTION_KW)) {
    if (kws.some((k) => lw.includes(k))) return motion;
  }
  return ["zoom-in", "pan-lr", "pan-ud", "hold", "shake-soft"][i % 5];
}

function pickBroll(text) {
  const lw = text.toLowerCase();
  for (const [query, kws] of Object.entries(BROLL_KW)) {
    if (kws.some((k) => lw.includes(k))) return query;
  }
  return "dark atmospheric establishing shot cinematic 4K";
}

function pickSfx(text, i, total) {
  const lw = text.toLowerCase();
  for (const [sfx, kws] of Object.entries(SFX_KW)) {
    if (kws.some((k) => lw.includes(k))) return { sfx, intensity: sfx === "boom" || sfx === "hit" ? "high" : "mid" };
  }
  if (i === 0) return { sfx: "whoosh", intensity: "mid" };
  if (i === total - 1) return { sfx: "riser", intensity: "low" };
  return { sfx: "none", intensity: "low" };
}

function buildOST(text, i, total) {
  if (i === 0) return text.split(/\s+/).slice(0, 5).join(" ").toUpperCase();
  if (i === Math.floor(total * 0.5)) return text.split(/\s+/).slice(0, 4).join(" ");
  return "";
}

/* ── Public API ── */

export function parseScript(text, { detectTimestamps = true, mode = "short_epico", targetDuration } = {}) {
  if (!text || !text.trim()) return [];
  const dur = targetDuration || DURATION_MAP[mode] || 60;
  const target = dur <= 30 ? 5 : dur <= 60 ? 8 : 10;

  let raw = detectTimestamps ? tryParseTimestamps(text) : null;
  if (!raw) raw = segmentByParagraphs(text, dur, target);

  return raw.map((seg, i) => {
    const sfxInfo = pickSfx(seg.text, i, raw.length);
    return {
      id: i + 1,
      start: seg.start,
      end: seg.end,
      voiceover: seg.text,
      on_screen_text: buildOST(seg.text, i, raw.length),
      motion: pickMotion(seg.text, i, raw.length),
      broll_query: pickBroll(seg.text),
      sfx: sfxInfo.sfx,
      sfx_intensity: sfxInfo.intensity,
    };
  });
}

export function recalculateDurations(clips, totalDuration) {
  const totalWords = clips.reduce((s, c) => s + c.voiceover.split(/\s+/).length, 0);
  let cursor = 0;
  return clips.map((clip, i) => {
    const words = clip.voiceover.split(/\s+/).length;
    const dur = Math.max(3, Math.round((totalWords > 0 ? words / totalWords : 1 / clips.length) * totalDuration));
    const start = Math.round(cursor);
    cursor += dur;
    return { ...clip, start, end: i === clips.length - 1 ? totalDuration : Math.round(cursor) };
  });
}

export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
