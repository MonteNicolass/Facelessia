"use client";

import Badge from "./Badge";

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimelineRow({ segment, index, selected, onSelect, style: extraStyle }) {
  const dur = segment.end - segment.start;

  return (
    <div
      onClick={onSelect}
      style={{
        padding: "var(--sp-3) var(--sp-4)",
        background: selected ? "var(--accent-muted)" : "var(--panel)",
        border: selected ? "1px solid var(--accent-border)" : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        ...extraStyle,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
        <span style={{
          fontSize: "10px",
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          color: selected ? "var(--accent)" : "var(--dim)",
          minWidth: 28,
        }}>
          #{index + 1}
        </span>
        <span style={{
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)",
        }}>
          {fmtTime(segment.start)} — {fmtTime(segment.end)}
        </span>
        <span style={{
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          color: "var(--dim)",
        }}>
          ({dur}s)
        </span>
        {segment.motion?.type && (
          <Badge color="accent" style={{ marginLeft: "auto" }}>{segment.motion.type}</Badge>
        )}
      </div>

      {/* VO text */}
      <div style={{
        fontSize: "12px",
        color: "var(--text)",
        lineHeight: 1.6,
        marginBottom: "var(--sp-2)",
      }}>
        {segment.vo}
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-1)" }}>
        {segment.on_screen && (
          <Badge color="success">{segment.on_screen}</Badge>
        )}
        {segment.broll_query && (
          <Badge color="muted">{segment.broll_query}</Badge>
        )}
        {segment.sfx?.map((s, i) => (
          <Badge key={i} color="warning">{s}</Badge>
        ))}
        {segment.transition?.type && segment.transition.type !== "cut" && (
          <Badge color="pink">{segment.transition.type}</Badge>
        )}
      </div>
    </div>
  );
}
