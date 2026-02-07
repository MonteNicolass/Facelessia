/**
 * Studio mock generator — produces full production package from config.
 * Output: { script, prompts, casting, metadata }
 */

const MODES = {
  short_epico: { label: "Short Epico", scenesMin: 5, scenesMax: 8 },
  consistencia: { label: "Modo Consistencia", scenesMin: 4, scenesMax: 6 },
  educativo: { label: "Educativo", scenesMin: 6, scenesMax: 10 },
};

const VISUAL_PROMPTS_EN = [
  "Dark cinematic wide establishing shot, dramatic volumetric lighting, 4K, no visible faces",
  "Close-up textured surface, dramatic side lighting, shallow depth of field, dark mood",
  "Aerial drone shot over landscape, dramatic clouds, moody color grading, epic scale",
  "Silhouette figure against dramatic backlight, dust particles, cinematic composition",
  "Ancient artifact macro shot, warm highlights cutting through dark shadows, film grain",
  "Abstract slow-motion particles in dark void, subtle amber color accent, 4K",
  "Bright hopeful sunrise golden hour, warm tones breaking through darkness, wide lens",
  "Split composition light vs dark, high contrast, cinematic tension, letterbox frame",
  "Modern minimalist architecture, geometric shadows, cool tones, editorial framing",
  "Nature close-up, water droplets on surface, bokeh background, warm natural light",
];

const CHARACTER_ROLES = [
  { name: "El Narrador", role: "narrator", desc: "Voz principal, autoridad y empatia", promptBase: "Middle-aged person silhouette, confident posture, dramatic side lighting, dark background" },
  { name: "El Experto", role: "expert", desc: "Fuente de datos, credibilidad", promptBase: "Professional figure in dark setting, glasses reflection, documentary style, 4K" },
  { name: "El Personaje Historico", role: "historical", desc: "Representacion visual del tema", promptBase: "Historical figure silhouette, period-appropriate clothing, dramatic chiaroscuro lighting" },
  { name: "El Testigo", role: "witness", desc: "Perspectiva personal, conexion emocional", promptBase: "Person in profile, contemplative expression, soft window light, documentary feel" },
];

function buildNarrationsForMode(topic, mode, count) {
  const hooks = {
    short_epico: `Esto que te voy a contar sobre ${topic} cambia todo lo que sabias.`,
    consistencia: `Cada dia, ${topic} impacta de formas que no imaginas. Hoy lo vemos en detalle.`,
    educativo: `Hoy vas a aprender algo fundamental sobre ${topic}. Arrancamos.`,
  };

  const bodies = [
    `Para entender ${topic}, hay que ir al origen.`,
    "Lo que nadie te dice es que la causa es mucho mas profunda.",
    "Aca es donde la historia se pone interesante.",
    "Este dato cambia toda la perspectiva.",
    "Pero hay un detalle que la mayoria pasa por alto.",
    "Lo que vino despues fue todavia mas inesperado.",
    "Veamos los numeros: los datos no mienten.",
    "La conexion entre estos eventos no es casual.",
    "El impacto real se mide en lo cotidiano.",
  ];

  const ctas = {
    short_epico: "Si esto te volo la cabeza, segui para mas contenido asi.",
    consistencia: "Manana hay mas. Segui el canal para no perderte nada.",
    educativo: "Ahora ya sabes algo que la mayoria no sabe. Compartilo.",
  };

  const result = [hooks[mode] || hooks.short_epico];
  for (let i = 0; i < count - 2 && i < bodies.length; i++) {
    result.push(bodies[i]);
  }
  result.push(ctas[mode] || ctas.short_epico);
  return result.slice(0, count);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Generate full studio output from config.
 * @param {{ topic, mode, duration, audience, hasCTA }} config
 * @returns {{ script, prompts, casting, metadata }}
 */
export function generateStudioOutput(config) {
  const { topic, mode = "short_epico", duration = 60, audience = "", hasCTA = true } = config;
  const modeInfo = MODES[mode] || MODES.short_epico;
  const count = Math.min(modeInfo.scenesMax, Math.max(modeInfo.scenesMin, Math.round(duration / 10)));
  const secPer = duration / count;

  const narrations = buildNarrationsForMode(topic, mode, count);

  // Script
  const scenes = narrations.map((narration, i) => ({
    id: i + 1,
    startSec: Math.round(i * secPer),
    endSec: Math.round((i + 1) * secPer),
    narration,
    onScreenText: i === 0 ? topic.slice(0, 40).toUpperCase() : "",
  }));
  if (!hasCTA && scenes.length > 1) {
    scenes[scenes.length - 1].narration = "Y eso fue todo. Nos vemos en la proxima.";
  }

  // Visual prompts
  const prompts = scenes.map((s, i) => ({
    sceneId: s.id,
    time: `${fmtTime(s.startSec)}-${fmtTime(s.endSec)}`,
    prompt: VISUAL_PROMPTS_EN[i % VISUAL_PROMPTS_EN.length],
    style: "cinematic, dark editorial, 4K, no text overlays",
    negativePrompt: "text, watermark, logo, bright colors, cartoon, anime",
  }));

  // Casting
  const castCount = Math.min(3, Math.max(1, Math.floor(count / 3)));
  const casting = CHARACTER_ROLES.slice(0, castCount).map((c) => ({
    ...c,
    consistencyPrompt: `${c.promptBase}, consistent character across all scenes, same clothing and build`,
  }));

  // Metadata
  const metadata = {
    title: `${topic} | Lo que nadie te conto`,
    description: `En este video exploramos ${topic} desde una perspectiva que pocos conocen. ${audience ? `Pensado para ${audience}.` : ""} Contenido generado con Celeste.`,
    tags: extractTags(topic),
    hashtags: extractHashtags(topic),
    thumbPrompt: `Dramatic thumbnail for "${topic}", dark cinematic style, bold text overlay, high contrast, YouTube thumbnail 16:9`,
  };

  return { script: { scenes }, prompts, casting, metadata };
}

function extractTags(topic) {
  const words = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const base = ["video", "faceless", "contenido", "historia"];
  return [...new Set([...words, ...base])].slice(0, 12);
}

function extractHashtags(topic) {
  const words = topic.split(/\s+/).filter((w) => w.length > 2).slice(0, 3);
  return ["#shorts", "#faceless", ...words.map((w) => `#${w.toLowerCase()}`)].slice(0, 6);
}

/**
 * Export studio project as JSON file (client-side download).
 */
export function exportStudioJSON(config, output) {
  const data = {
    version: "1.0",
    app: "Celeste Studio",
    exportedAt: new Date().toISOString(),
    project: {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      mode: config.mode,
      topic: config.topic,
      duration: config.duration,
      audience: config.audience,
    },
    script: output.script,
    prompts: output.prompts,
    casting: output.casting,
    metadata: output.metadata,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `celeste-studio_${slugify(config.topic)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text) {
  return (text || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}
