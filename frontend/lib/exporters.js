import { formatTime } from "./parser";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "celeste";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta todo el proyecto como JSON.
 */
export function exportJSON(project, script, edl) {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    app: "Celeste",
    project,
    script: {
      raw: script.raw,
      scenes: script.scenes,
    },
    edl,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `${slugify(project.title)}_project.json`);
}

/**
 * Exporta el reporte de edición como TXT.
 */
export function exportTXT(project, script, edl) {
  const lines = [];
  const hr = "=".repeat(55);
  const hr2 = "-".repeat(40);

  lines.push(hr);
  lines.push("CELESTE — REPORTE DE EDICION");
  lines.push(hr);
  lines.push("");
  lines.push(`Proyecto: ${project.title || "(sin título)"}`);
  lines.push(`Duracion: ${project.durationSec}s`);
  lines.push(`Tono: ${project.tone}`);
  lines.push(`Exportado: ${new Date().toLocaleString("es-AR")}`);
  lines.push("");

  // Guion
  lines.push(hr2);
  lines.push("GUION");
  lines.push(hr2);
  for (const scene of script.scenes) {
    lines.push("");
    lines.push(
      `[${formatTime(scene.startSec)} - ${formatTime(scene.endSec)}] ESCENA ${scene.id}`
    );
    lines.push(`  ${scene.narration}`);
    if (scene.visualPrompt) {
      lines.push(`  VISUAL: ${scene.visualPrompt}`);
    }
  }

  // EDL
  if (edl.length > 0) {
    lines.push("");
    lines.push(hr2);
    lines.push("MAPA DE EDICION (EDL)");
    lines.push(hr2);

    for (const e of edl) {
      lines.push("");
      lines.push(
        `--- ESCENA ${e.id} [${formatTime(e.startSec)} - ${formatTime(e.endSec)}] ---`
      );
      lines.push(
        `  MOTION: ${e.motion} (${e.motionSpeed}) ${e.motionFrom}x > ${e.motionTo}x`
      );
      lines.push(`    Razon: ${e.motionReason}`);
      lines.push(`  B-ROLL [${e.brollTimestamp}]: "${e.brollQuery}"`);
      lines.push(`    Razon: ${e.brollReason}`);
      lines.push(
        `  SFX [${formatTime(e.startSec)}]: ${e.sfx.efecto} (${e.sfx.intensidad})`
      );
      lines.push(
        `  TRANSICION: ${e.transition.tipo} (${e.transition.duracion}s)`
      );
    }

    // Shopping lists
    lines.push("");
    lines.push(hr2);
    lines.push("B-ROLL A BUSCAR:");
    edl.forEach((e, i) => {
      lines.push(`  ${i + 1}. [${e.brollTimestamp}] ${e.brollQuery}`);
    });

    lines.push("");
    lines.push("SFX NECESARIOS:");
    edl.forEach((e, i) => {
      lines.push(`  ${i + 1}. ${e.sfx.efecto} (${e.sfx.intensidad})`);
    });
  }

  lines.push("");
  lines.push(hr);
  lines.push("Generado por Celeste");
  lines.push(hr);

  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  downloadBlob(blob, `${slugify(project.title)}_reporte.txt`);
}
