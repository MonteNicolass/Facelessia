import { NextResponse } from "next/server";
import { getAIValue } from "@/lib/aiProvidersConfig";

/**
 * Director IA v1 — Análisis editorial de guion
 * Input: guion completo (texto)
 * Output: decisiones editoriales (beats, motions, b-roll)
 */
export async function POST(request) {
  try {
    const { script } = await request.json();

    if (!script?.trim()) {
      return NextResponse.json({ error: "Script vacío" }, { status: 400 });
    }

    const claudeKey = getAIValue("claude");
    if (!claudeKey) {
      return NextResponse.json({ error: "Claude no conectado" }, { status: 400 });
    }

    // Llamar a Claude con prompt especializado
    const decisions = await analyzeScriptWithClaude(script, claudeKey);

    return NextResponse.json({ decisions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function analyzeScriptWithClaude(script, apiKey) {
  const systemPrompt = `Sos un director de shorts/reels. Analizá el guion y devolvé SOLO un array JSON (sin markdown).

Formato: [{ "t": "0-3s", "motion": "zoom_in", "broll": "persona con celular de noche", "note": "hook fuerte" }]

Motions: zoom_in, zoom_out, pan_left, pan_right, static, shake
B-roll: específico y buscable
Note: por qué funciona editorialmente`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: script }],
    }),
  });

  if (!res.ok) throw new Error(`Claude error ${res.status}`);

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("Sin respuesta de Claude");

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Claude no devolvió JSON");

  const decisions = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(decisions) || !decisions.length) throw new Error("JSON inválido");

  return decisions;
}
