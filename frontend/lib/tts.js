/**
 * TTS API client — server-side only (used by API routes).
 * Supports ElevenLabs API.
 */

/**
 * Generate voice audio from text using ElevenLabs.
 * @param {string} text — Full voiceover text
 * @param {{ elevenlabsKey: string, elevenlabsVoice: string }} settings
 * @returns {Promise<ArrayBuffer>} — MP3 audio buffer
 */
export async function ttsGenerate(text, settings) {
  const voiceId = await resolveVoiceId(settings.elevenlabsKey, settings.elevenlabsVoice);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": settings.elevenlabsKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${err}`);
  }

  return res.arrayBuffer();
}

/**
 * Resolve a voice name to an ElevenLabs voice ID.
 * Falls back to using the name as-is if it looks like an ID.
 */
async function resolveVoiceId(apiKey, voiceName) {
  // If it looks like an ID already, use it directly
  if (/^[a-zA-Z0-9]{20,}$/.test(voiceName)) return voiceName;

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
    });
    if (!res.ok) return voiceName;

    const data = await res.json();
    const match = data.voices?.find(
      (v) => v.name.toLowerCase() === voiceName.toLowerCase()
    );
    return match?.voice_id || voiceName;
  } catch {
    return voiceName;
  }
}
