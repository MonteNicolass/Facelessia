"use client";

import Badge from "@/components/ui/Badge";

export default function Shotlist({ clips }) {
  if (!clips || clips.length === 0) return null;

  const brollList = clips
    .filter((c) => c.broll_query)
    .map((c) => ({ id: c.id, query: c.broll_query }));

  const motionCounts = {};
  clips.forEach((c) => {
    const m = c.motion || c.motion_suggestion || "hold";
    motionCounts[m] = (motionCounts[m] || 0) + 1;
  });

  const sfxCounts = {};
  clips.forEach((c) => {
    const s = c.sfx || c.sfx_suggestion || "none";
    if (s !== "none") sfxCounts[s] = (sfxCounts[s] || 0) + 1;
  });

  function handleCopyAll() {
    const lines = [];
    lines.push("B-ROLL:");
    brollList.forEach((b, i) => lines.push(`  ${i + 1}. [#${b.id}] ${b.query}`));
    lines.push("");
    lines.push("MOTIONS:");
    Object.entries(motionCounts).forEach(([m, n], i) => lines.push(`  ${i + 1}. ${m} (x${n})`));
    lines.push("");
    lines.push("SFX:");
    Object.entries(sfxCounts).forEach(([s, n], i) => lines.push(`  ${i + 1}. ${s} (x${n})`));
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      {/* Copy all button */}
      <button
        onClick={handleCopyAll}
        style={{
          fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)",
          textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none",
          cursor: "pointer", padding: 0, textAlign: "left",
        }}
      >
        Copiar Todo
      </button>

      {/* B-Roll list */}
      <Section title="B-Roll" count={brollList.length}>
        {brollList.map((b) => (
          <div key={b.id} style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--text-secondary)", padding: "var(--sp-1) 0", lineHeight: 1.5 }}>
            <Badge color="accent" style={{ marginRight: "var(--sp-2)" }}>#{b.id}</Badge>
            <span style={{ fontStyle: "italic" }}>{b.query}</span>
          </div>
        ))}
      </Section>

      {/* Motions list */}
      <Section title="Motions" count={Object.keys(motionCounts).length}>
        {Object.entries(motionCounts).map(([m, n]) => (
          <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--sp-1) 0" }}>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>{m}</span>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--dim)" }}>x{n}</span>
          </div>
        ))}
      </Section>

      {/* SFX list */}
      <Section title="SFX" count={Object.keys(sfxCounts).length}>
        {Object.entries(sfxCounts).map(([s, n]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--sp-1) 0" }}>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>{s}</span>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--dim)" }}>x{n}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {title}
        </span>
        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--muted)" }}>({count})</span>
      </div>
      {children}
    </div>
  );
}
