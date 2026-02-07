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

/**
 * Prompt diseñado para que Claude devuelva decisiones editoriales JSON
 */
async function analyzeScriptWithClaude(script, apiKey) {
  const systemPrompt = `Sos un director de video y editor profesional especializado en contenido para redes sociales (shorts, reels, TikToks).

Tu trabajo es analizar un guion y generar un mapa de edición con decisiones editoriales concretas.

IMPORTANTE: Respondé SOLO con un array JSON válido. Sin explicaciones, sin markdown, sin \`\`\`json. Solo el array.

Cada decisión editorial debe tener:
- "beat": número de beat/escena (1, 2, 3...)
- "start": timestamp de inicio en segundos
- "end": timestamp de fin en segundos
- "motion": tipo de movimiento de cámara (zoom_in_slow, zoom_out_fast, pan_left, pan_right, ken_burns, hard_cut, static_hold)
- "plano": tipo de plano (close_up, medium_shot, wide_shot, extreme_close_up, over_shoulder)
- "broll": qué b-roll buscar (descripción corta y específica)
- "nota": nota editorial breve (por qué esta decisión, qué comunica)

Criterios editoriales:
- Hook inicial (primeros 3s): movimiento dramático o corte fuerte
- Retención: cambios de ritmo cada 3-5 segundos
- Beats emocionales: motion suave en momentos reflexivos, hard cuts en transiciones
- B-roll específico y buscable (no genérico)
- Notas editoriales útiles para un humano

Ejemplo de output:
[
  {
    "beat": 1,
    "start": 0,
    "end": 3,
    "motion": "zoom_in_slow",
    "plano": "close_up",
    "broll": "persona mirando celular de noche, luz azul en cara",
    "nota": "Hook inicial — crear intriga con acercamiento progresivo"
  },
  {
    "beat": 2,
    "start": 3,
    "end": 7,
    "motion": "hard_cut",
    "plano": "medium_shot",
    "broll": "pantalla de redes sociales con notificaciones",
    "nota": "Cambio de ritmo — establecer contexto digital"
  }
]`;

  const userPrompt = `Analizá este guion y generame las decisiones editoriales en JSON:\n\n${script}`;

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
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error("Claude no devolvió contenido");
  }

  // Intentar parsear JSON (manejar si Claude envuelve en ```json)
  let jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Claude no devolvió JSON válido");
  }

  const decisions = JSON.parse(jsonMatch[0]);

  // Validar estructura básica
  if (!Array.isArray(decisions) || decisions.length === 0) {
    throw new Error("Formato de decisiones inválido");
  }

  return decisions;
}
