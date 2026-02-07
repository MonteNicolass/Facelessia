"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { generateScript } from "@/lib/generator-pipeline";

// ============================================================
// MODE OPTIONS
// ============================================================

const MODES = [
  { value: "short_epico", label: "Short Epico" },
  { value: "consistencia", label: "Modo Consistencia" },
  { value: "educativo", label: "Educativo" },
];

// ============================================================
// GENERATOR INPUT PAGE — Step 1 of 5
// ============================================================

export default function GeneratorInputPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const config = state.generator.config;

  const [topicError, setTopicError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoverGenerate, setHoverGenerate] = useState(false);

  // --- Config updater ---

  function updateConfig(patch) {
    dispatch({ type: "SET_GEN_CONFIG", payload: patch });
    if (patch.topic !== undefined) setTopicError("");
  }

  // --- Generate handler ---

  async function handleGenerate() {
    if (!config.topic.trim()) {
      setTopicError("El tema es obligatorio.");
      return;
    }
    setTopicError("");
    setIsGenerating(true);
    try {
      const result = generateScript(config);
      dispatch({ type: "SET_GEN_SCRIPT", payload: result });
      dispatch({ type: "SET_GEN_STEP", payload: 1 });
      router.push("/generator/script");
    } catch {
      setTopicError("Error al generar el script. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{ maxWidth: "620px" }}>
      {/* ======== STEP INDICATOR ======== */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "var(--sp-2)",
          }}
        >
          Paso 1 de 5 &mdash; Input
        </div>
        {/* Progress bar track */}
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "var(--border)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}
        >
          {/* Progress bar fill — 20% */}
          <div
            style={{
              width: "20%",
              height: "100%",
              background: "var(--accent)",
              borderRadius: "var(--radius-full)",
              transition: "width var(--transition-base)",
            }}
          />
        </div>
      </div>

      {/* ======== FORM CARD ======== */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--sp-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-5)",
        }}
      >
        {/* ---- Topic ---- */}
        <div>
          <FieldLabel htmlFor="gen-topic">Tema del video</FieldLabel>
          <input
            id="gen-topic"
            type="text"
            value={config.topic}
            onChange={(e) => updateConfig({ topic: e.target.value })}
            placeholder="Ej: La historia oculta del Coliseo Romano"
            style={{
              ...inputBaseStyle,
              borderColor: topicError ? "var(--warning)" : "var(--border)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 2px var(--accent-muted)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = topicError ? "var(--warning)" : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
          {topicError && (
            <div
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-body)",
                color: "var(--warning)",
                marginTop: "var(--sp-1)",
              }}
            >
              {topicError}
            </div>
          )}
        </div>

        {/* ---- Mode ---- */}
        <div>
          <FieldLabel htmlFor="gen-mode">Modo</FieldLabel>
          <select
            id="gen-mode"
            value={config.mode}
            onChange={(e) => updateConfig({ mode: e.target.value })}
            style={selectBaseStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 2px var(--accent-muted)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* ---- Duration ---- */}
        <div>
          <FieldLabel htmlFor="gen-duration">Duracion</FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <input
              id="gen-duration"
              type="number"
              min={15}
              max={300}
              value={config.duration}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) updateConfig({ duration: val });
              }}
              style={{ ...inputBaseStyle, width: "100px", textAlign: "center" }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 2px var(--accent-muted)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                fontWeight: 500,
              }}
            >
              seg
            </span>
          </div>
        </div>

        {/* ---- Audience ---- */}
        <div>
          <FieldLabel htmlFor="gen-audience">
            Audiencia{" "}
            <span
              style={{
                color: "var(--dim)",
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              (opcional)
            </span>
          </FieldLabel>
          <input
            id="gen-audience"
            type="text"
            value={config.audience}
            onChange={(e) => updateConfig({ audience: e.target.value })}
            placeholder="Ej: Jovenes 18-25, interesados en historia"
            style={inputBaseStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 2px var(--accent-muted)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* ---- CTA Checkbox ---- */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-2)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={config.hasCTA}
              onChange={(e) => updateConfig({ hasCTA: e.target.checked })}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "var(--accent)",
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Incluir Call to Action
            </span>
          </label>
        </div>
      </div>

      {/* ======== ACTION BAR ======== */}
      <div
        style={{
          marginTop: "var(--sp-5)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          onMouseEnter={() => setHoverGenerate(true)}
          onMouseLeave={() => setHoverGenerate(false)}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-5)",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: isGenerating
              ? "var(--muted)"
              : hoverGenerate
                ? "var(--accent-hover)"
                : "var(--accent)",
            color: "#fff",
            cursor: isGenerating ? "not-allowed" : "pointer",
            transition: "all var(--transition-fast)",
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? "Generando..." : "Generar Script \u2192"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SHARED STYLES
// ============================================================

const inputBaseStyle = {
  width: "100%",
  padding: "var(--sp-2) var(--sp-3)",
  fontSize: "12px",
  fontFamily: "var(--font-body)",
  color: "var(--text)",
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  outline: "none",
  transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
  boxSizing: "border-box",
  lineHeight: 1.6,
};

const selectBaseStyle = {
  ...inputBaseStyle,
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "var(--sp-8)",
  cursor: "pointer",
};

// ============================================================
// HELPER COMPONENTS
// ============================================================

function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        color: "var(--dim)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "var(--sp-2)",
      }}
    >
      {children}
    </label>
  );
}
