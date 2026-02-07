import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai/server";
import { studioPrompt } from "@/lib/ai/prompts";
import { generateStudioOutput } from "@/lib/studio-generator";

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, mode, duration, audience, ctaEnabled } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Se requiere un tema" }, { status: 400 });
    }

    // Build prompt and call AI
    const { system, user } = studioPrompt({
      topic: topic.trim(),
      mode: mode || "short_epico",
      duration: duration || 60,
      audience: audience || "",
      ctaEnabled: ctaEnabled !== false,
    });

    const { source, content } = await callAI({ system, user });

    if (content && validateStudioOutput(content)) {
      return NextResponse.json({ source, output: content });
    }

    // Fallback: mock generator
    const mockOutput = generateStudioOutput({
      topic: topic.trim(),
      mode: mode || "short_epico",
      duration: duration || 60,
      audience: audience || "",
      hasCTA: ctaEnabled !== false,
    });

    return NextResponse.json({ source: "mock", output: mockOutput });
  } catch (err) {
    console.error("[API] studio/generate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function validateStudioOutput(data) {
  if (!data) return false;
  if (!data.script?.scenes || !Array.isArray(data.script.scenes) || data.script.scenes.length === 0) return false;
  if (!data.prompts || !Array.isArray(data.prompts)) return false;
  if (!data.metadata) return false;
  if (!Array.isArray(data.casting)) data.casting = [];
  return true;
}
