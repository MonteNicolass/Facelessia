import { formatTime } from "./parser";

// === Pools de datos para EDL ===

const MOTIONS = [
  { tipo: "zoom_in", razon: "Acercar para crear tensión e intimidad" },
  { tipo: "pan_right", razon: "Paneo acompaña el avance narrativo" },
  { tipo: "push_in", razon: "Empuje sutil hacia el sujeto, refuerza importancia" },
  { tipo: "zoom_out", razon: "Alejar para dar contexto y perspectiva" },
  { tipo: "pan_left", razon: "Paneo horizontal para transición visual" },
  { tipo: "ken_burns_up", razon: "Movimiento ascendente para elevar el tono" },
];

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
];

const SFX_POOL = [
  { efecto: "whoosh suave", intensidad: "sutil" },
  { efecto: "impact bajo", intensidad: "medio" },
  { efecto: "riser tensión", intensidad: "medio" },
  { efecto: "transición swoosh", intensidad: "sutil" },
  { efecto: "boom cinematográfico", intensidad: "fuerte" },
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
 * Genera un EDL mock coherente a partir de escenas parseadas.
 * Alterna motions, asigna b-roll, SFX y transiciones con razones.
 */
export function generateMockEDL(scenes) {
  if (!scenes || scenes.length === 0) return [];

  const climaxIdx = Math.floor(scenes.length * 0.7);

  return scenes.map((scene, i) => {
    const isFirst = i === 0;
    const isLast = i === scenes.length - 1;
    const isClimax = i === climaxIdx;

    const motion = MOTIONS[i % MOTIONS.length];
    const motionTo = parseFloat((1.0 + 0.08 + (i % 3) * 0.04).toFixed(2));

    const sceneDur = scene.endSec - scene.startSec;
    const brollStart = scene.startSec + Math.floor(sceneDur * 0.3);
    const brollEnd = brollStart + Math.min(3, Math.floor(sceneDur * 0.4));

    return {
      id: scene.id,
      startSec: scene.startSec,
      endSec: scene.endSec,
      motion: isClimax ? "shake" : motion.tipo,
      motionSpeed: isFirst || isLast ? "lento" : ["lento", "medio", "medio", "rapido"][i % 4],
      motionFrom: 1.0,
      motionTo: isClimax ? 1.2 : motionTo,
      motionReason: isClimax
        ? "Momento de mayor intensidad — shake para impacto emocional"
        : motion.razon,
      brollTimestamp: `${formatTime(brollStart)} - ${formatTime(brollEnd)}`,
      brollQuery: BROLL_QUERIES[i % BROLL_QUERIES.length],
      brollReason: isFirst
        ? "Refuerza el hook visual con material impactante"
        : "Complementa la narración con imagen contextual",
      sfx: isClimax
        ? { efecto: "boom cinematográfico", intensidad: "fuerte" }
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
