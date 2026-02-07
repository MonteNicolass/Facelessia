/**
 * AI Adapter — server-side module for calling AI providers.
 * Reads configuration from process.env.
 * Falls back to mock (content: null) on any failure.
 */

const PROVIDERS = { openai: callOpenAI, anthropic: callAnthropic };

/**
 * @param {{ system: string, user: string }} opts
 * @returns {Promise<{ source: string, content: object|null }>}
 */
export async function callAI({ system, user }) {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();

  if (provider === "mock" || !PROVIDERS[provider]) {
    return { source: "mock", content: null };
  }

  try {
    return await PROVIDERS[provider]({ system, user });
  } catch (err) {
    console.error(`[AI] ${provider} uncaught error:`, err?.message || err);
    return { source: "mock", content: null };
  }
}

/* ── OpenAI ── */

async function callOpenAI({ system, user }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) return { source: "mock", content: null };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[AI] OpenAI ${res.status}: ${body.slice(0, 200)}`);
    return { source: "mock", content: null };
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return { source: "mock", content: null };

  return { source: "openai", content: JSON.parse(text) };
}

/* ── Anthropic ── */

async function callAnthropic({ system, user }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";

  if (!apiKey) return { source: "mock", content: null };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[AI] Anthropic ${res.status}: ${body.slice(0, 200)}`);
    return { source: "mock", content: null };
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) return { source: "mock", content: null };

  // Claude may wrap JSON in ```json ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : text.trim();

  return { source: "anthropic", content: JSON.parse(jsonStr) };
}
