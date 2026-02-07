/**
 * Mock generator — produces realistic scene packages for AI Video Studio.
 */

const VISUAL_PROMPTS = [
  "Dark cinematic wide establishing shot, dramatic volumetric lighting, 4K, no faces",
  "Close-up textured surface, dramatic side lighting, shallow DOF, dark mood",
  "Aerial drone shot over landscape, dramatic clouds, moody grading",
  "Silhouette figure against dramatic backlight, dust particles, cinematic",
  "Ancient artifact macro shot, warm highlights through dark shadows, film grain",
  "Abstract slow-motion particles in dark void, subtle amber accent, 4K",
  "Bright hopeful sunrise, warm tones breaking through darkness, wide lens",
  "Split composition light vs dark, high contrast, cinematic tension",
  "Modern minimalist architecture, geometric shadows, editorial framing",
  "Nature close-up, water droplets, bokeh background, warm natural light",
];

const BROLL = [
  "cinematic dark atmospheric establishing shot",
  "close up texture detail dramatic lighting",
  "aerial drone shot landscape moody",
  "silhouette person dramatic backlight",
  "abstract slow motion particles dark",
  "dramatic documentary footage dark mood",
  "technology abstract data visualization",
  "historical footage dramatic reconstruction",
];

const MOTIONS = ["zoom-in", "pan-lr", "zoom-out", "punch-in", "shake-soft", "pan-ud", "hold"];
const SFX = ["whoosh", "hit", "riser", "boom", "click", "none"];

const NARRATIONS = {
  epica: [
    (t) => `Esto que te voy a contar sobre ${t} cambia todo lo que sabías.`,
    () => "Para entender esto, hay que ir al origen.",
    () => "Lo que nadie te dice es que la causa es mucho más profunda.",
    () => "Acá es donde la historia se pone interesante.",
    () => "Este dato cambia toda la perspectiva.",
    () => "Pero hay un detalle que la mayoría pasa por alto.",
    () => "Lo que vino después fue todavía más inesperado.",
    () => "Veamos los números: los datos no mienten.",
    () => "La conexión entre estos eventos no es casual.",
    () => "Si esto te voló la cabeza, seguí para más.",
  ],
  educativo: [
    (t) => `Hoy vas a aprender algo fundamental sobre ${t}.`,
    () => "Empecemos por lo básico.",
    () => "Ahora viene la parte más interesante.",
    () => "Esto es lo que la mayoría no entiende.",
    () => "Fijate en este detalle clave.",
    () => "La ciencia detrás es más simple de lo que parece.",
    () => "Mirá cómo se conecta todo.",
    () => "Ahora ya sabés algo que pocos saben. Compartilo.",
  ],
  drama: [
    (t) => `Nadie se esperaba lo que pasó con ${t}.`,
    () => "Todo empezó de forma inocente.",
    () => "Pero entonces, algo cambió.",
    () => "Las consecuencias fueron devastadoras.",
    () => "Y justo cuando parecía que no podía empeorar...",
    () => "El giro fue total.",
    () => "Hoy, las secuelas siguen presentes.",
    () => "La lección que nos deja es clara.",
    () => "Seguí para más historias como esta.",
  ],
  tech: [
    (t) => `La tecnología detrás de ${t} es más impresionante de lo que crees.`,
    () => "Veamos cómo funciona.",
    () => "El componente clave es este.",
    () => "Lo que lo hace diferente es su arquitectura.",
    () => "Las aplicaciones prácticas son enormes.",
    () => "Pero hay un riesgo que pocos mencionan.",
    () => "El futuro de esto va a cambiar todo.",
    () => "Seguí el canal para más tech.",
  ],
};

const CHARACTERS = [
  { name: "El Narrador", role: "narrator", description: "Voz principal, autoridad y empatía" },
  { name: "El Experto", role: "expert", description: "Fuente de datos, credibilidad" },
  { name: "El Testigo", role: "witness", description: "Perspectiva personal, conexión emocional" },
];

export function generateMockScenes(config) {
  const { topic = "tema", duration = 60, style = "epica" } = config;
  const narrations = NARRATIONS[style] || NARRATIONS.epica;
  const count = Math.min(10, Math.max(6, Math.round(duration / 8)));
  const secPer = duration / count;

  return Array.from({ length: count }, (_, i) => {
    const start = Math.round(i * secPer);
    const isLast = i === count - 1;
    const isClimax = i === Math.floor(count * 0.7);
    return {
      id: i + 1,
      start,
      end: isLast ? duration : Math.round((i + 1) * secPer),
      voiceover: narrations[i % narrations.length](topic),
      on_screen_text: i === 0 ? topic.slice(0, 40).toUpperCase() : isLast ? "SEGUÍ PARA MÁS" : "",
      visual_prompt: VISUAL_PROMPTS[i % VISUAL_PROMPTS.length],
      broll_query: BROLL[i % BROLL.length],
      motion_suggestion: i === 0 ? "zoom-in" : isLast ? "zoom-out" : isClimax ? "punch-in" : MOTIONS[i % MOTIONS.length],
      sfx_suggestion: i === 0 ? "whoosh" : isClimax ? "boom" : SFX[i % SFX.length],
    };
  });
}

export function generateMockCasting(config) {
  const count = Math.min(3, Math.max(1, Math.floor((config.duration || 60) / 30)));
  return CHARACTERS.slice(0, count).map((c, i) => ({ id: i + 1, ...c }));
}
