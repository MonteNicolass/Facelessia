import { formatTime } from "./parser";
import motionsCatalog from "@/src/data/motions.catalog.json";

// === Pools de datos para EDL ===

const MOTIONS = motionsCatalog.motions;

const BROLL_QUERIES = [
  "cinematic dark atmospheric establishing shot",
  "close up texture detail dramatic lighting 4K",
  "aerial drone shot landscape moody",
  "silhouette person dramatic backlight shadow",
  "abstract slow motion particles dark",
  "timelapse sky clouds dramatic",
  "vintage old texture paper film grain",
  "modern city night lights cinematic",
  "nature macro water fire detail",
  "technology screen glow dark room",
  "epic landscape mountains fog dramatic",
  "urban architecture geometric patterns shadow",
];

const SFX_POOL = [
  { efecto: "whoosh suave", intensidad: "sutil" },
  { efecto: "impact bajo", intensidad: "medio" },
  { efecto: "riser tension", intensidad: "medio" },
  { efecto: "transicion swoosh", intensidad: "sutil" },
  { efecto: "boom cinematografico", intensidad: "fuerte" },
  { efecto: "ambiente oscuro", intensidad: "sutil" },
  { efecto: "glitch digital", intensidad: "medio" },
  { efecto: "reverse cymbal", intensidad: "medio" },
];

const TRANSITIONS = [
  { tipo: "crossfade", duracion: 0.5 },
  { tipo: "cut", duracion: 0 },
  { tipo: "crossfade", duracion: 0.4 },
  { tipo: "whip", duracion: 0.3 },
  { tipo: "cut", duracion: 0 },
  { tipo: "zoom_transition", duracion: 0.4 },
];

/**
 * Asigna motions del catálogo evitando repetición consecutiva.
 * Lógica: hook → slow_zoom_in, climax → push_in_fast/micro_shake, cierre → slow_zoom_out.
 */
function pickMotion(index, total, prevMotionId) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const climaxIdx = Math.floor(total * 0.7);
  const isClimax = index === climaxIdx;

  // Escenas fijas
  if (isFirst) return MOTIONS.find((m) => m.id === "slow_zoom_in") || MOTIONS[0];
  if (isLast) return MOTIONS.find((m) => m.id === "slow_zoom_out") || MOTIONS[1];
  if (isClimax) return MOTIONS.find((m) => m.id === "push_in_fast") || MOTIONS.find((m) => m.id === "micro_shake") || MOTIONS[4];

  // Rotar evitando repetición
  const available = MOTIONS.filter((m) => m.id !== prevMotionId && m.id !== "hold_static");
  return available[index % available.length];
}

/**
 * Genera razón editorial coherente según posición y motion.
 */
function buildReason(motion, index, total) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const climaxIdx = Math.floor(total * 0.7);

  if (isFirst) return "Apertura: captar atención inmediata con acercamiento sutil";
  if (isLast) return "Cierre: dar perspectiva y transición natural al final";
  if (index === climaxIdx) return "Clímax narrativo: máxima intensidad visual para reforzar el punto clave";
  return motion.useWhen;
}

/**
 * Genera un EDL mock coherente a partir de escenas parseadas.
 * Usa el catálogo de motions, evita repetición, genera razones editoriales.
 */
export function generateMockEDL(scenes) {
  if (!scenes || scenes.length === 0) return [];

  let prevMotionId = null;

  return scenes.map((scene, i) => {
    const isLast = i === scenes.length - 1;
    const motion = pickMotion(i, scenes.length, prevMotionId);
    prevMotionId = motion.id;

    const sceneDur = scene.endSec - scene.startSec;
    const brollStart = scene.startSec + Math.floor(sceneDur * 0.3);
    const brollEnd = brollStart + Math.min(3, Math.floor(sceneDur * 0.4));

    const climaxIdx = Math.floor(scenes.length * 0.7);
    const isClimax = i === climaxIdx;

    return {
      id: scene.id,
      startSec: scene.startSec,
      endSec: scene.endSec,
      motionId: motion.id,
      motionLabel: motion.label,
      motionType: motion.type,
      motionParams: { ...motion.paramsDefaults },
      motionReason: buildReason(motion, i, scenes.length),
      brollTimestamp: `${formatTime(brollStart)} - ${formatTime(brollEnd)}`,
      brollQuery: BROLL_QUERIES[i % BROLL_QUERIES.length],
      brollReason: i === 0
        ? "Refuerza el hook visual con material impactante"
        : "Complementa la narración con imagen contextual",
      sfx: isClimax
        ? { efecto: "boom cinematografico", intensidad: "fuerte" }
        : SFX_POOL[i % SFX_POOL.length],
      transition: isLast
        ? { tipo: "fade_out", duracion: 1.0 }
        : TRANSITIONS[i % TRANSITIONS.length],
      notes: "",
    };
  });
}

/**
 * Genera un script mock para AutoVideos.
 */
export function generateMockScript(project) {
  const topic = project.title || "tema sin definir";
  const dur = project.durationSec || 60;
  const count = Math.max(4, Math.min(8, Math.round(dur / 12)));
  const secPer = dur / count;

  const narrations = buildNarrations(topic, count);

  const VISUAL_PROMPTS = [
    "Dark cinematic wide shot, dramatic atmosphere, moody lighting, 4K, no visible faces",
    "Close-up detail with dramatic side lighting, dark background, textured surface",
    "Aerial view of landscape, dramatic clouds, cinematic color grading, epic scale",
    "Silhouette figure dramatic backlight, dust particles, cinematic composition",
    "Ancient texture macro, dramatic warm highlights cutting through dark shadows",
    "Abstract motion, slow particles in dark void, subtle color accent",
    "Bright hopeful scene, sunrise golden hour, warm tones breaking through dark",
    "Split composition contrasting light and dark, cinematic tension, 4K",
  ];

  const scenes = narrations.map((narration, i) => ({
    id: i + 1,
    startSec: Math.round(i * secPer),
    endSec: Math.round((i + 1) * secPer),
    narration,
    visualPrompt: VISUAL_PROMPTS[i % VISUAL_PROMPTS.length],
    onScreenText: i === 0 ? topic.slice(0, 40).toUpperCase() : "",
  }));

  const raw = scenes
    .map((s) => `[${formatTime(s.startSec)}] ${s.narration}`)
    .join("\n\n");

  return { raw, scenes };
}

function buildNarrations(topic, count) {
  const hook = `Esto que te voy a contar sobre ${topic} cambia todo lo que creías saber.`;

  const bodies = [
    `Para entender ${topic}, primero hay que ir al origen de todo.`,
    "Lo que nadie te dice es que esto tiene una causa mucho más profunda.",
    "Y acá es donde la historia se pone realmente interesante.",
    "Este dato es el que cambia toda la perspectiva.",
    "Pero hay un detalle que la mayoría pasa por alto completamente.",
    "Lo que vino después fue todavía más inesperado.",
  ];

  const cta = "Si esto te pareció interesante, seguí para más contenido como este.";

  const result = [hook];
  for (let i = 0; i < count - 2 && i < bodies.length; i++) {
    result.push(bodies[i]);
  }
  result.push(cta);

  return result.slice(0, count);
}
