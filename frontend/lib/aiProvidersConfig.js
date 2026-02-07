/**
 * Configuración de providers de IA
 * Define todas las IAs que Celeste puede usar (siguiendo ecosistema SuperGuion/BestIA/AI-Tube)
 */

export const AI_PROVIDERS = [
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Generación de guiones, EDL, análisis de contenido",
    required: true,
    inputType: "apiKey",
    placeholder: "sk-ant-api03-...",
    storageKey: "ai_claude_key",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    name: "OpenAI (GPT-4o / DALL·E)",
    description: "Generación alternativa de guiones, imágenes con DALL·E",
    required: false,
    inputType: "apiKey",
    placeholder: "sk-proj-...",
    storageKey: "ai_openai_key",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "perplexity",
    name: "Perplexity Pro",
    description: "Research profundo, fact-checking, trending topics",
    required: false,
    inputType: "apiKey",
    placeholder: "pplx-...",
    storageKey: "ai_perplexity_key",
    docsUrl: "https://www.perplexity.ai/settings/api",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Síntesis de voz (TTS) multiidioma de alta calidad",
    required: false,
    inputType: "apiKey",
    placeholder: "xi_...",
    storageKey: "ai_elevenlabs_key",
    docsUrl: "https://elevenlabs.io/app/settings/api-keys",
  },
  {
    id: "suno",
    name: "Suno",
    description: "Generación de música de fondo y efectos sonoros",
    required: false,
    inputType: "apiKey",
    placeholder: "suno-api-...",
    storageKey: "ai_suno_key",
    docsUrl: "https://suno.com/api",
  },
  {
    id: "runway",
    name: "Runway ML",
    description: "Generación de video, efectos visuales, motion graphics",
    required: false,
    inputType: "apiKey",
    placeholder: "runway-...",
    storageKey: "ai_runway_key",
    docsUrl: "https://app.runwayml.com/settings",
  },
  {
    id: "remotion",
    name: "Remotion + Claude",
    description: "Renderizado programático de video (sin key, usa Claude)",
    required: false,
    inputType: "toggle",
    storageKey: "ai_remotion_enabled",
    docsUrl: "https://www.remotion.dev/",
  },
  {
    id: "stablediffusion",
    name: "Stable Diffusion (Local)",
    description: "Generación de imágenes local via API (Automatic1111/ComfyUI)",
    required: false,
    inputType: "url",
    placeholder: "http://127.0.0.1:7860",
    storageKey: "ai_stablediffusion_url",
    docsUrl: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
  },
];

/**
 * Verifica si una IA específica está conectada
 */
export function isAIConnected(providerId) {
  try {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return false;

    const value = localStorage.getItem(provider.storageKey);

    if (provider.inputType === "toggle") {
      return value === "true";
    }

    return !!value && value.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Verifica si todas las IAs obligatorias están conectadas
 */
export function hasRequiredAIs() {
  return AI_PROVIDERS.filter((p) => p.required).every((p) => isAIConnected(p.id));
}

/**
 * Obtiene el valor de una IA desde localStorage
 */
export function getAIValue(providerId) {
  try {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return null;
    return localStorage.getItem(provider.storageKey) || null;
  } catch {
    return null;
  }
}

/**
 * Guarda el valor de una IA en localStorage
 */
export function setAIValue(providerId, value) {
  try {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return false;

    if (value === null || value === undefined || value === "") {
      localStorage.removeItem(provider.storageKey);
    } else {
      localStorage.setItem(provider.storageKey, value);
    }
    return true;
  } catch {
    return false;
  }
}
