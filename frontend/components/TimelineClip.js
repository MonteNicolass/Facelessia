"use client";

import Badge from "@/components/ui/Badge";
import { fmtTime } from "@/lib/scriptParse";

const MOTIONS = ["zoom-in", "zoom-out", "pan-lr", "pan-ud", "punch-in", "shake-soft", "hold"];
const SFX_LIST = ["whoosh", "hit", "riser", "boom", "click", "none"];

export default function TimelineClip({ clip, selected, onSelect, onUpdate }) {
  return (
    <div>
      <div
        onClick={onSelect}
        style={{
          cursor: "pointer",
          padding: "var(--sp-3) var(--sp-4)",
          background: selected ? "var(--bg-raised)" : "var(--panel)",
          border: selected ? "1px solid var(--accent-border)" : "1px solid var(--border)",
          borderLeft: selected ? "3px solid var(--accent)" : "3px solid var(--border)",
          borderRadius: selected ? "var(--radius-md) var(--radius-md) 0 0" : "var(--radius-md)",
          transition: "all var(--transition-fast)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)", flexWrap: "wrap" }}>
          <Badge color="accent">#{clip.id}</Badge>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
            {fmtTime(clip.start)}&ndash;{fmtTime(clip.end)}
          </span>
          <Badge color="warning">{clip.motion || clip.motion_suggestion}</Badge>
          {clip.sfx && clip.sfx !== "none" && <Badge color="success">{clip.sfx}</Badge>}
        </div>

        {/* Voiceover */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
          {clip.voiceover.length > 140 ? clip.voiceover.slice(0, 140) + "..." : clip.voiceover}
        </p>

        {/* B-Roll */}
        {clip.broll_query && (
          <div style={{ fontSize: "11px", fontFamily: "var(--font-body)", color: "var(--muted)", marginTop: "var(--sp-1)" }}>
            <span style={{ fontWeight: 700, color: "var(--pink)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "var(--sp-2)" }}>
              B-ROLL:
            </span>
            <span style={{ fontStyle: "italic" }}>{clip.broll_query}</span>
          </div>
        )}

        {/* On-screen text */}
        {clip.on_screen_text && (
          <div style={{ marginTop: "var(--sp-1)", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, color: "var(--warning)" }}>
            OST: {clip.on_screen_text}
          </div>
        )}
      </div>

      {/* Expanded editor */}
      {selected && (
        <div
          style={{
            padding: "var(--sp-4)",
            background: "var(--panel)",
            border: "1px solid var(--accent-border)",
            borderTop: "none",
            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-3)",
          }}
        >
          {/* Voiceover edit */}
          <Field label="Voiceover">
            <textarea
              value={clip.voiceover}
              onChange={(e) => onUpdate({ voiceover: e.target.value })}
              rows={3}
              style={taStyle}
            />
          </Field>

          {/* Motion + SFX row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
            <Field label="Motion">
              <select
                value={clip.motion || clip.motion_suggestion || "hold"}
                onChange={(e) => onUpdate({ motion: e.target.value })}
                style={selStyle}
              >
                {MOTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="SFX">
              <select
                value={clip.sfx || clip.sfx_suggestion || "none"}
                onChange={(e) => onUpdate({ sfx: e.target.value })}
                style={selStyle}
              >
                {SFX_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {/* B-Roll query */}
          <Field label="B-Roll Query">
            <input
              type="text"
              value={clip.broll_query || ""}
              onChange={(e) => onUpdate({ broll_query: e.target.value })}
              placeholder="Search query..."
              style={inpStyle}
            />
          </Field>

          {/* On-screen text */}
          <Field label="On-Screen Text">
            <input
              type="text"
              value={clip.on_screen_text || ""}
              onChange={(e) => onUpdate({ on_screen_text: e.target.value })}
              placeholder="Texto en pantalla..."
              style={inpStyle}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--sp-1)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inpStyle = {
  width: "100%", fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text)",
  background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
  padding: "var(--sp-2) var(--sp-3)", outline: "none", boxSizing: "border-box",
};
const selStyle = { ...inpStyle, cursor: "pointer", appearance: "auto" };
const taStyle = { ...inpStyle, resize: "vertical", lineHeight: 1.6, minHeight: 48 };
