/**
 * Export Pack — downloads a ZIP bundle with all project assets.
 * Uses JSZip for client-side ZIP generation.
 */

import JSZip from "jszip";
import { generateSRT, generateShotlist, generateScriptMD } from "./srt";

/**
 * Download an export pack ZIP.
 * @param {{ title: string, scriptText: string, edl: object, audioUrl?: string|null }} opts
 */
export async function downloadExportPack({ title, scriptText, edl, audioUrl }) {
  const zip = new JSZip();
  const safeName = (title || "celeste-export").replace(/[^a-zA-Z0-9_-]/g, "_");

  // script.md
  zip.file("script.md", generateScriptMD(title, scriptText));

  // edl.json
  zip.file("edl.json", JSON.stringify(edl, null, 2));

  // subtitles.srt
  if (edl?.segments?.length) {
    zip.file("subtitles.srt", generateSRT(edl.segments));
    zip.file("shotlist.txt", generateShotlist(edl.segments));
  }

  // audio.mp3 (if available)
  if (audioUrl) {
    try {
      const res = await fetch(audioUrl);
      if (res.ok) {
        const blob = await res.blob();
        zip.file("audio.mp3", blob);
      }
    } catch {
      /* skip audio if fetch fails */
    }
  }

  // Generate + download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
