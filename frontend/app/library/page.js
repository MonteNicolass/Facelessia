"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import motionsCatalog from "@/src/data/motions.catalog.json";

const TYPE_COLORS = {
  zoom: "var(--accent)",
  pan: "var(--warning)",
  shake: "var(--pink)",
  static: "var(--muted)",
  whip: "var(--danger)",
  parallax: "var(--success)",
};

const REVEAL_CLASSES = ["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4", "reveal-d5"];

export default function MotionLibraryPage() {
  const motions = motionsCatalog.motions || [];

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* ── Header ── */}
      <div className="reveal" style={{ marginBottom: "var(--sp-8)" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          marginBottom: "var(--sp-2)",
        }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.2,
          }}>
            Motion Library
          </h1>
          <Badge color="var(--accent)" style={{ position: "relative", top: "1px" }}>
            PRESETS
          </Badge>
        </div>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.6,
        }}>
          Catalogo de motion presets para referencia editorial. Cada preset incluye parametros y recomendaciones de uso.
        </p>
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--sp-5)",
      }}>
        {motions.map((motion, i) => (
          <Card
            key={motion.id}
            className={REVEAL_CLASSES[i % REVEAL_CLASSES.length]}
            style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}
          >
            {/* ── Title + type badge ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--sp-2)",
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 400,
                color: "var(--text)",
                lineHeight: 1.3,
              }}>
                {motion.label}
              </span>
              <Badge color={TYPE_COLORS[motion.type] || "var(--muted)"}>
                {motion.type.toUpperCase()}
              </Badge>
            </div>

            {/* ── ID ── */}
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--dim)",
              letterSpacing: "0.3px",
            }}>
              {motion.id}
            </div>

            {/* ── Params ── */}
            {motion.paramsDefaults && Object.keys(motion.paramsDefaults).length > 0 && (
              <div style={{
                background: "var(--panel-2)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--sp-2) var(--sp-3)",
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--sp-2)",
              }}>
                {Object.entries(motion.paramsDefaults).map(([key, val]) => (
                  <span
                    key={key}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ color: "var(--dim)" }}>{key}:</span>{" "}
                    <span style={{ color: "var(--accent)" }}>{String(val)}</span>
                  </span>
                ))}
              </div>
            )}

            {/* ── Use when ── */}
            <div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--dim)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}>
                Usar cuando
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}>
                {motion.useWhen}
              </div>
            </div>

            {/* ── Avoid when ── */}
            <div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--dim)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}>
                Evitar cuando
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--muted)",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}>
                {motion.avoidWhen}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
