import { NextResponse } from "next/server";
import { generateMockScenes, generateMockCasting } from "@/lib/mockGenerate";

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, duration, style, language } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Se requiere un tema" }, { status: 400 });
    }

    const scenes = generateMockScenes({ topic: topic.trim(), duration: duration || 60, style: style || "epica" });
    const casting = generateMockCasting({ duration: duration || 60 });

    return NextResponse.json({ source: "mock", scenes, casting });
  } catch (err) {
    console.error("[API] studio/generate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
