"use client";

import Button from "@/components/ui/Button";
import { exportJSON, exportCSV, exportTXT } from "@/lib/exporters";

export default function ExportButtons({ clips, meta = {}, onToast }) {
  if (!clips || clips.length === 0) return null;

  function toast(msg) {
    if (onToast) onToast(msg);
  }

  function handleJSON() {
    exportJSON(clips, meta);
    toast("JSON exportado");
  }

  function handleCSV() {
    exportCSV(clips, meta);
    toast("CSV exportado");
  }

  function handleTXT() {
    exportTXT(clips, meta);
    toast("TXT exportado");
  }

  function handleCopy() {
    const text = JSON.stringify(clips, null, 2);
    navigator.clipboard.writeText(text).then(() => toast("Copiado al portapapeles"));
  }

  return (
    <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
      <Button variant="secondary" size="sm" onClick={handleJSON}>JSON</Button>
      <Button variant="secondary" size="sm" onClick={handleCSV}>CSV</Button>
      <Button variant="secondary" size="sm" onClick={handleTXT}>TXT</Button>
      <Button variant="ghost" size="sm" onClick={handleCopy}>Copiar</Button>
    </div>
  );
}
