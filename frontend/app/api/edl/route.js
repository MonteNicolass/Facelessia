import { NextResponse } from "next/server";
import motionsCatalog from "@/src/data/motions.catalog.json";

/**
 * POST /api/edl
 *
 * Body: { scenes: [...], openaiApiKey?: string }
 *
 * Si hay openaiApiKey, intenta generar EDL con GPT-4o usando el catálogo de motions.
 * Si no hay key o falla, devuelve EDL mock.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { scenes, openaiApiKey } = body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de scenes" },
        { status: 400 }
      );
    }

    // Si hay API key, intentar con OpenAI
    if (openaiApiKey && openaiApiKey.startsWith("sk-")) {
      try {
        const aiEdl = await generateWithOpenAI(scenes, openaiApiKey);
        if (aiEdl) {
          return NextResponse.json({ source: "openai", edl: aiEdl });
        }
      } catch {
        // Fallo con OpenAI, caer al mock
      }
    }

    // Fallback: EDL mock
    const mockEdl = generateMockEDLServer(scenes);
    return NextResponse.json({ source: "mock", edl: mockEdl });
  } catch {
    return NextResponse.json(
      { error: "Request invalido" },
      { status: 400 }
    );
  }
}

// --- OpenAI EDL generation ---
async function generateWithOpenAI(scenes, apiKey) {
  const motionIds = motionsCatalog.motions.map((m) => m.id);
  const catalogSummary = motionsCatalog.motions
    .map((m) => `${m.id}: ${m.useWhen}`)
    .join("\n");

  const scenesSummary = scenes
    .map((s) => `Escena ${s.id} [${s.startSec}s-${s.endSec}s]: ${s.narration.slice(0, 100)}`)
    .join("\n");

  const prompt = `Sos un director de edición de video. Genera un EDL (Edit Decision List) para estas escenas de un video faceless.

CATÁLOGO DE MOTIONS DISPONIBLES:
${catalogSummary}

ESCENAS:
${scenesSummary}

Responde SOLO con un JSON array válido. Cada entry debe tener:
- id (number, mismo que la escena)
- motionId (string, del catálogo: ${motionIds.join(", ")})
- brollQuery (string, búsqueda en inglés para stock footage)
- sfx (object: { efecto: string, intensidad: "sutil"|"medio"|"fuerte" })
- transition (object: { tipo: "cut"|"crossfade"|"whip"|"fade_out", duracion: number })
- motionReason (string, razón editorial en español)
- brollReason (string, razón en español)

Reglas:
- No repitas el mismo motion en escenas consecutivas
- El clímax (~70%) lleva push_in_fast o micro_shake
- Primera escena: slow_zoom_in. Última: slow_zoom_out
- brollQuery debe ser en inglés, descriptivo, cinematográfico
- SFX sutiles, no exagerar`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  // Extraer JSON del response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) return null;

  // Enriquecer con datos del catálogo y las escenas
  return parsed.map((entry, i) => {
    const scene = scenes.find((s) => s.id === entry.id) || scenes[i];
    const motion = motionsCatalog.motions.find((m) => m.id === entry.motionId) || motionsCatalog.motions[0];

    return {
      id: entry.id || i + 1,
      startSec: scene?.startSec || 0,
      endSec: scene?.endSec || 0,
      motionId: motion.id,
      motionLabel: motion.label,
      motionType: motion.type,
      motionParams: { ...motion.paramsDefaults },
      motionReason: entry.motionReason || motion.useWhen,
      brollTimestamp: scene ? `${fmtTime(scene.startSec + 2)} - ${fmtTime(Math.min(scene.startSec + 5, scene.endSec))}` : "0:00 - 0:03",
      brollQuery: entry.brollQuery || "cinematic atmospheric shot",
      brollReason: entry.brollReason || "Complementa la narración",
      sfx: entry.sfx || { efecto: "whoosh suave", intensidad: "sutil" },
      transition: entry.transition || { tipo: "cut", duracion: 0 },
      notes: "",
    };
  });
}

// --- Mock EDL (server-side duplicate for API route) ---
function generateMockEDLServer(scenes) {
  const MOTIONS = motionsCatalog.motions;
  let prevId = null;

  return scenes.map((scene, i) => {
    const isFirst = i === 0;
    const isLast = i === scenes.length - 1;
    const climaxIdx = Math.floor(scenes.length * 0.7);
    const isClimax = i === climaxIdx;

    let motion;
    if (isFirst) motion = MOTIONS.find((m) => m.id === "slow_zoom_in") || MOTIONS[0];
    else if (isLast) motion = MOTIONS.find((m) => m.id === "slow_zoom_out") || MOTIONS[1];
    else if (isClimax) motion = MOTIONS.find((m) => m.id === "push_in_fast") || MOTIONS[4];
    else {
      const avail = MOTIONS.filter((m) => m.id !== prevId && m.id !== "hold_static");
      motion = avail[i % avail.length];
    }
    prevId = motion.id;

    const dur = scene.endSec - scene.startSec;
    const bStart = scene.startSec + Math.floor(dur * 0.3);
    const bEnd = bStart + Math.min(3, Math.floor(dur * 0.4));

    return {
      id: scene.id,
      startSec: scene.startSec,
      endSec: scene.endSec,
      motionId: motion.id,
      motionLabel: motion.label,
      motionType: motion.type,
      motionParams: { ...motion.paramsDefaults },
      motionReason: motion.useWhen,
      brollTimestamp: `${fmtTime(bStart)} - ${fmtTime(bEnd)}`,
      brollQuery: [
        "cinematic dark atmospheric establishing shot",
        "close up texture detail dramatic lighting",
        "aerial drone shot landscape moody",
        "silhouette person dramatic backlight",
        "abstract slow motion particles dark",
      ][i % 5],
      brollReason: "Complementa la narración con imagen contextual",
      sfx: isClimax
        ? { efecto: "boom cinematografico", intensidad: "fuerte" }
        : { efecto: "whoosh suave", intensidad: "sutil" },
      transition: isLast
        ? { tipo: "fade_out", duracion: 1.0 }
        : { tipo: i % 2 === 0 ? "cut" : "crossfade", duracion: i % 2 === 0 ? 0 : 0.5 },
      notes: "",
    };
  });
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
