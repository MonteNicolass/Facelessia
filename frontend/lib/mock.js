/**
 * Mock generators — used in demo mode when no API keys are configured.
 */

const MOTIONS = [
  "slow_zoom_in", "slow_zoom_out", "pan_left_soft", "pan_right_soft",
  "push_in_fast", "hold_static", "micro_shake", "whip_pan_soft", "parallax_soft",
];
const TRANSITIONS = ["cut", "dissolve", "fade"];
const SFX_POOL = ["whoosh", "bass_drop", "riser", "click", "ambient_hum", "static_burst"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Generate a mock script from an idea.
 * @param {{ topic: string, duration: number, language: string, tone: string }} idea
 * @returns {{ text: string, segments: { id: string, text: string }[] }}
 */
export function mockScript(idea) {
  const count = Math.max(3, Math.round(idea.duration / 10));
  const segments = [];
  const lines = [];

  for (let i = 0; i < count; i++) {
    const id = `seg-${i + 1}`;
    const text = getSegmentText(idea.topic, idea.tone, i, count);
    segments.push({ id, text });
    lines.push(text);
  }

  return { text: lines.join("\n\n"), segments };
}

function getSegmentText(topic, tone, idx, total) {
  const tones = {
    epica: [
      `En un mundo donde ${topic} lo cambia todo, pocos se atreven a dar el primer paso.`,
      `Pero existe un camino que nadie te cuenta. Un secreto oculto a plena vista.`,
      `Los que entienden esto dominan el juego. Los demas simplemente observan.`,
      `Cada detalle importa. Cada segundo cuenta. Y vos estas a punto de descubrirlo.`,
      `La diferencia entre el exito y el fracaso esta en lo que haces AHORA.`,
      `Este es el momento. ${topic} nunca volvera a ser igual despues de esto.`,
      `Lo que viene a continuacion va a cambiar tu perspectiva para siempre.`,
      `No es casualidad que estes viendo esto. Es el inicio de algo grande.`,
    ],
    educativo: [
      `Hoy vamos a hablar de ${topic}. Un tema que pocos entienden realmente.`,
      `El primer concepto clave es entender la base. Sin esto, nada tiene sentido.`,
      `Veamos un ejemplo practico para que quede claro.`,
      `Este es el error mas comun que comete la gente con ${topic}.`,
      `La solucion es mas simple de lo que parece. Te la explico paso a paso.`,
      `Dato importante: esto aplica en el 90% de los casos.`,
      `Para cerrar, recorda estos 3 puntos fundamentales sobre ${topic}.`,
      `Si te sirvio, guarda este video. Lo vas a necesitar despues.`,
    ],
    narrativo: [
      `Todo empezo con una simple pregunta sobre ${topic}.`,
      `Nadie imaginaba lo que iba a pasar despues.`,
      `Los primeros indicios aparecieron de forma inesperada.`,
      `Y entonces, todo cambio. El punto de inflexion llego sin aviso.`,
      `Las consecuencias fueron inmediatas. ${topic} ya no era lo mismo.`,
      `Pero la verdadera leccion estaba oculta en los detalles.`,
      `Hoy, mirando atras, todo tiene sentido.`,
      `Esta historia sobre ${topic} recien comienza.`,
    ],
  };
  const pool = tones[tone] || tones.epica;
  return pool[idx % pool.length];
}

/**
 * Generate a mock EDL from a script.
 * @param {{ text: string, segments: { id: string, text: string }[] }} script
 * @param {{ topic: string, duration: number }} idea
 * @returns {{ title: string, duration_sec: number, segments: object[] }}
 */
export function mockEDL(script, idea) {
  const count = script.segments.length;
  const segDuration = Math.round(idea.duration / count);
  const segments = script.segments.map((seg, i) => ({
    id: seg.id,
    start: i * segDuration,
    end: Math.min((i + 1) * segDuration, idea.duration),
    vo: seg.text,
    on_screen: extractOnScreen(seg.text),
    broll_query: extractBroll(seg.text, idea.topic),
    motion: {
      type: pick(MOTIONS),
      zoom_from: 1,
      zoom_to: 1 + Math.round(Math.random() * 15) / 100,
      pan: pick(["left", "right", "center"]),
    },
    sfx: pickN(SFX_POOL, Math.floor(Math.random() * 2) + 1),
    transition: {
      type: i === 0 ? "fade" : pick(TRANSITIONS),
    },
  }));

  return {
    title: idea.topic || "Sin titulo",
    duration_sec: idea.duration,
    segments,
  };
}

function extractOnScreen(text) {
  const words = text.split(" ").filter((w) => w.length > 4);
  return words.slice(0, Math.min(4, words.length)).join(" ").toUpperCase();
}

function extractBroll(text, topic) {
  const keywords = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 5)
    .slice(0, 2);
  return [...keywords, topic.split(" ")[0]].join(" ") + " cinematic";
}
