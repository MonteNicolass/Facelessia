import { NextResponse } from "next/server";
import { parseScript } from "@/lib/scriptParse";

export async function POST(request) {
  try {
    const body = await request.json();
    const { scriptText, mode, detectTimestamps, targetDuration } = body;

    if (!scriptText || !scriptText.trim()) {
      return NextResponse.json({ error: "Se requiere el texto del guion" }, { status: 400 });
    }

    const clips = parseScript(scriptText.trim(), {
      detectTimestamps: detectTimestamps !== false,
      mode: mode || "short_epico",
      targetDuration,
    });

    return NextResponse.json({ source: "mock", clips });
  } catch (err) {
    console.error("[API] director/analyze error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
