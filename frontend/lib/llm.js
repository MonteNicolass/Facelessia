/**
 * LLM API client — server-side only (used by API routes).
 * Supports OpenAI and Anthropic providers.
 */

/**
 * Call the configured LLM to generate a script.
 * @param {{ topic: string, duration: number, language: string, tone: string }} idea
 * @param {{ llmProvider: string, openaiKey: string, anthropicKey: string, openaiModel: string, anthropicModel: string }} settings
 * @returns {Promise<{ text: string, segments: { id: string, text: string }[] }>}
 */
export async function llmGenerateScript(idea, settings) {
  const prompt = buildScriptPrompt(idea);

  if (settings.llmProvider === "anthropic") {
    return callAnthropic(prompt, settings.anthropicKey, settings.anthropicModel);
  }
  return callOpenAI(prompt, settings.openaiKey, settings.openaiModel);
}

/**
 * Call the configured LLM to generate an EDL from a script.
 * @param {{ text: string, segments: { id: string, text: string }[] }} script
 * @param {{ topic: string, duration: number }} idea
 * @param {{ llmProvider: string, openaiKey: string, anthropicKey: string, openaiModel: string, anthropicModel: string }} settings
 * @returns {Promise<object>}
 */
export async function llmGenerateEDL(script, idea, settings) {
  const prompt = buildEDLPrompt(script, idea);

  if (settings.llmProvider === "anthropic") {
    return callAnthropic(prompt, settings.anthropicKey, settings.anthropicModel);
  }
  return callOpenAI(prompt, settings.openaiKey, settings.openaiModel);
}

/* ── Prompts ── */

function buildScriptPrompt(idea) {
  return {
    system: `Sos un guionista profesional de videos cortos para redes sociales.
Escribis en ${idea.language === "es" ? "español rioplatense" : idea.language}.
Tono: ${idea.tone}. Duracion objetivo: ${idea.duration} segundos.
Responde SOLO con un JSON valido: { "text": "guion completo", "segments": [{ "id": "seg-1", "text": "texto del segmento" }] }
Genera entre ${Math.max(3, Math.round(idea.duration / 10))} y ${Math.max(5, Math.round(idea.duration / 8))} segmentos.`,
    user: `Genera un guion sobre: ${idea.topic}`,
  };
}

function buildEDLPrompt(script, idea) {
  const motions = "slow_zoom_in, slow_zoom_out, pan_left_soft, pan_right_soft, push_in_fast, hold_static, micro_shake, whip_pan_soft, parallax_soft";
  const transitions = "cut, dissolve, fade";
  return {
    system: `Sos un director de video profesional. Genera un EDL (Edit Decision List) en JSON.
Motions disponibles: ${motions}
Transiciones: ${transitions}
Responde SOLO con JSON valido siguiendo este schema:
{
  "title": "string",
  "duration_sec": number,
  "segments": [{
    "id": "string", "start": number, "end": number,
    "vo": "string", "on_screen": "string", "broll_query": "string",
    "motion": { "type": "string", "zoom_from": 1, "zoom_to": 1.1, "pan": "center" },
    "sfx": ["string"], "transition": { "type": "string" }
  }]
}`,
    user: `Genera un EDL para este guion (${idea.duration}s, ${script.segments.length} segmentos):\n\n${script.text}`,
  };
}

/* ── API calls ── */

async function callOpenAI(prompt, apiKey, model) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

async function callAnthropic(prompt, apiKey, model) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  // Try to extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Anthropic response");
  return JSON.parse(jsonMatch[0]);
}
