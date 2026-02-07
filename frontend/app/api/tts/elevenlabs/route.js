import { NextResponse } from "next/server";
import { ttsGenerate } from "@/lib/tts";

export async function POST(request) {
  try {
    const { text, settings } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (!settings?.elevenlabsKey) {
      return NextResponse.json({ error: "No ElevenLabs key configured" }, { status: 400 });
    }

    const audioBuffer = await ttsGenerate(text, settings);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=voice.mp3",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
