import { NextResponse } from "next/server";
import { llmGenerateScript } from "@/lib/llm";

export async function POST(request) {
  try {
    const { idea, settings } = await request.json();

    if (!idea?.topic) {
      return NextResponse.json({ error: "Missing idea.topic" }, { status: 400 });
    }

    const activeKey = settings?.llmProvider === "anthropic"
      ? settings?.anthropicKey
      : settings?.openaiKey;

    if (!activeKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 400 });
    }

    const result = await llmGenerateScript(idea, settings);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
