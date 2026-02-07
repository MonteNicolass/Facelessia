import { NextResponse } from "next/server";
import { llmGenerateEDL } from "@/lib/llm";

export async function POST(request) {
  try {
    const { script, idea, settings } = await request.json();

    if (!script?.text) {
      return NextResponse.json({ error: "Missing script.text" }, { status: 400 });
    }

    const activeKey = settings?.llmProvider === "anthropic"
      ? settings?.anthropicKey
      : settings?.openaiKey;

    if (!activeKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 400 });
    }

    const result = await llmGenerateEDL(script, idea, settings);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
