/**
 * Exporters — JSON, CSV, TXT downloads with export history.
 */

import { saveExport } from "./storage";
import { fmtTime } from "./scriptParse";

/* ── Helpers ── */

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "celeste";
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── JSON Export ── */

export function exportJSON(clips, meta = {}) {
  const data = {
    version: "3.0",
    app: "Celeste",
    exportedAt: new Date().toISOString(),
    meta,
    clips,
  };
  const name = `${slug(meta.topic || "project")}_edl.json`;
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), name);
  saveExport({ type: "json", name, clipCount: clips.length, meta });
}

/* ── CSV Export ── */

function csvEscape(val) {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCSV(clips, meta = {}) {
  const headers = ["id", "start", "end", "voiceover", "on_screen_text", "motion", "broll_query", "sfx", "sfx_intensity"];
  const rows = clips.map((c) =>
    headers.map((h) => {
      if (h === "start" || h === "end") return fmtTime(c[h]);
      return csvEscape(c[h]);
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const name = `${slug(meta.topic || "project")}_edl.csv`;
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), name);
  saveExport({ type: "csv", name, clipCount: clips.length, meta });
}

/* ── TXT Export ── */

export function exportTXT(clips, meta = {}) {
  const hr = "=".repeat(55);
  const hr2 = "-".repeat(40);
  const lines = [];

  lines.push(hr);
  lines.push("CELESTE — REPORTE DE EDICION");
  lines.push(hr);
  lines.push("");
  lines.push(`Proyecto: ${meta.topic || "(sin titulo)"}`);
  if (meta.duration) lines.push(`Duracion: ${meta.duration}s`);
  if (meta.style) lines.push(`Estilo: ${meta.style}`);
  lines.push(`Exportado: ${new Date().toLocaleString("es-AR")}`);
  lines.push("");

  lines.push(hr2);
  lines.push("CLIPS");
  lines.push(hr2);
  for (const c of clips) {
    lines.push("");
    lines.push(`--- CLIP ${c.id} [${fmtTime(c.start)} - ${fmtTime(c.end)}] ---`);
    lines.push(`  VOZ: ${c.voiceover}`);
    if (c.on_screen_text) lines.push(`  TEXTO: ${c.on_screen_text}`);
    lines.push(`  MOTION: ${c.motion || c.motion_suggestion || "hold"}`);
    lines.push(`  B-ROLL: ${c.broll_query || "-"}`);
    lines.push(`  SFX: ${c.sfx || c.sfx_suggestion || "none"} (${c.sfx_intensity || "low"})`);
  }

  lines.push("");
  lines.push(hr2);
  lines.push("B-ROLL A BUSCAR:");
  clips.forEach((c, i) => {
    if (c.broll_query) lines.push(`  ${i + 1}. [${fmtTime(c.start)}] ${c.broll_query}`);
  });

  lines.push("");
  lines.push("SFX NECESARIOS:");
  const uniqueSfx = [...new Set(clips.map((c) => c.sfx || c.sfx_suggestion).filter(Boolean).filter((s) => s !== "none"))];
  uniqueSfx.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));

  lines.push("");
  lines.push("MOTIONS USADOS:");
  const uniqueMotions = [...new Set(clips.map((c) => c.motion || c.motion_suggestion).filter(Boolean))];
  uniqueMotions.forEach((m, i) => lines.push(`  ${i + 1}. ${m}`));

  lines.push("");
  lines.push(hr);
  lines.push("Generado por Celeste");
  lines.push(hr);

  const name = `${slug(meta.topic || "project")}_reporte.txt`;
  download(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }), name);
  saveExport({ type: "txt", name, clipCount: clips.length, meta });
}
