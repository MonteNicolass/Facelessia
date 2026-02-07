import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai/server";
import { directorPrompt } from "@/lib/ai/prompts";
import { parseToSegments, generateEditMap } from "@/lib/edit-map";

export async function POST(request) {
  try {
    const body = await request.json();
    const { scriptText, format, targetDurationSec } = body;

    if (!scriptText || !scriptText.trim()) {
      return NextResponse.json({ error: "Se requiere el texto del guion" }, { status: 400 });
    }

    const fmt = format || "short";
    const dur = targetDurationSec || (fmt === "long" ? 180 : fmt === "reels" ? 30 : 60);

    // Build prompt and call AI
    const { system, user } = directorPrompt({
      scriptText: scriptText.trim(),
      format: fmt,
      targetDurationSec: dur,
    });

    const { source, content } = await callAI({ system, user });

    if (content && validateDirectorOutput(content)) {
      return NextResponse.json({ source, segments: content.segments });
    }

    // Fallback: heuristic parser
    const segs = parseToSegments(scriptText.trim(), fmt, dur);
    const enriched = generateEditMap(segs);

    return NextResponse.json({ source: "mock", segments: enriched });
  } catch (err) {
    console.error("[API] director/analyze error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function validateDirectorOutput(data) {
  if (!data?.segments || !Array.isArray(data.segments) || data.segments.length === 0) return false;
  const first = data.segments[0];
  if (typeof first.start !== "number" || !first.text || !first.motion) return false;
  return true;
}
