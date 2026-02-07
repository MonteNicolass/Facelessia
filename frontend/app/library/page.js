"use client";

import { useState } from "react";
import { MOTION_PRESETS, SFX_PRESETS, REMOTION_PROMPTS } from "@/lib/presets";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";

const TABS = [
  { key: "motions", label: "Motions" },
  { key: "sfx", label: "SFX" },
  { key: "remotion", label: "Remotion Prompts" },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("motions");
  const [copiedId, setCopiedId] = useState(null);

  function handleCopy(id, text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <div style={{ maxWidth: 820 }}>
      {/* ── Header ── */}
      <SectionHeader
        title="Library"
        subtitle="Presets de motion, SFX y prompts para Remotion"
      />

      {/* ── Tab Bar ── */}
      <div
        style={{
          display: "flex",
          gap: "var(--sp-1)",
          borderBottom: "1px solid var(--border)",
          marginBottom: "var(--sp-6)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "none",
                border: "none",
                borderBottom: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                padding: "var(--sp-2) var(--sp-4)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 600,
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Motions Tab ── */}
      {activeTab === "motions" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--sp-4)",
          }}
        >
          {MOTION_PRESETS.map((preset) => (
            <Card key={preset.id}>
              {/* Name */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--text)",
                  marginBottom: "var(--sp-2)",
                }}
              >
                {preset.name}
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-body)",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  margin: "0 0 var(--sp-3)",
                }}
              >
                {preset.desc}
              </p>

              {/* Params as pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--sp-1)",
                  marginBottom: "var(--sp-3)",
                }}
              >
                {Object.entries(preset.params).map(([key, val]) => (
                  <span
                    key={key}
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-secondary)",
                      background: "var(--panel-2)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border-subtle)",
                      lineHeight: "18px",
                    }}
                  >
                    {key}: {String(val)}
                  </span>
                ))}
              </div>

              {/* Remotion hint */}
              <p
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--dim)",
                  lineHeight: 1.5,
                  margin: "0 0 var(--sp-3)",
                }}
              >
                {preset.remotionHint}
              </p>

              {/* Copy button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(preset.id, JSON.stringify(preset.params))
                }
              >
                {copiedId === preset.id ? "Copiado!" : "Copiar Params"}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* ── SFX Tab ── */}
      {activeTab === "sfx" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--sp-4)",
          }}
        >
          {SFX_PRESETS.map((preset) => {
            const intensityColor =
              preset.intensity === "sutil"
                ? "success"
                : preset.intensity === "medio"
                ? "warning"
                : "danger";

            return (
              <Card key={preset.id}>
                {/* Name */}
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    color: "var(--text)",
                    marginBottom: "var(--sp-2)",
                  }}
                >
                  {preset.name}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    margin: "0 0 var(--sp-3)",
                  }}
                >
                  {preset.desc}
                </p>

                {/* Badges */}
                <div
                  style={{
                    display: "flex",
                    gap: "var(--sp-2)",
                    marginBottom: "var(--sp-3)",
                    flexWrap: "wrap",
                  }}
                >
                  <Badge color="accent">{preset.trigger}</Badge>
                  <Badge color={intensityColor}>{preset.intensity}</Badge>
                </div>

                {/* Copy button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(preset.id, preset.name)
                  }
                >
                  {copiedId === preset.id ? "Copiado!" : "Copiar"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Remotion Prompts Tab ── */}
      {activeTab === "remotion" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-4)",
          }}
        >
          {REMOTION_PROMPTS.map((prompt) => (
            <Card key={prompt.id}>
              {/* Name */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--text)",
                  marginBottom: "var(--sp-3)",
                }}
              >
                {prompt.name}
              </div>

              {/* Template code block */}
              <pre
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                  background: "var(--panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--sp-4)",
                  margin: "0 0 var(--sp-3)",
                  overflowX: "auto",
                  maxHeight: "200px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <code>{prompt.template}</code>
              </pre>

              {/* Copy button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopy(prompt.id, prompt.template)
                }
              >
                {copiedId === prompt.id ? "Copiado!" : "Copiar Prompt"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
