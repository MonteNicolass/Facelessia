"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { generateAssets } from "@/lib/generator-pipeline";

// ============================================================
// MODE LABELS
// ============================================================

const MODE_LABELS = {
  short_epico: "Short Epico",
  consistencia: "Consistencia",
  educativo: "Educativo",
};

// ============================================================
// HELPERS
// ============================================================

const fmtTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + s.toString().padStart(2, "0");
};

// ============================================================
// GENERATOR SCRIPT PAGE — Step 2 of 5
// ============================================================

export default function GeneratorScriptPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const script = state.generator.script;
  const config = state.generator.config;

  const [isGenerating, setIsGenerating] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);

  // --- Navigate to assets ---

  async function handleNextStep() {
    setIsGenerating(true);
    try {
      const result = generateAssets(config);
      dispatch({ type: "SET_GEN_ASSETS", payload: result });
      dispatch({ type: "SET_GEN_STEP", payload: 2 });
      router.push("/generator/assets");
    } catch {
      // stay on page if generation fails
    } finally {
      setIsGenerating(false);
    }
  }

  // ============================================================
  // RENDER — No script fallback
  // ============================================================

  if (!script) {
    return (
      <div style={{ maxWidth: "620px" }}>
        {/* Step indicator */}
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
            Paso 2 de 5 &mdash; Script
          </div>
          <div
            style={{
              width: "100%",
              height: "3px",
              background: "var(--border)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "40%",
                height: "100%",
                background: "var(--accent)",
                borderRadius: "var(--radius-full)",
              }}
            />
          </div>
        </div>

        {/* Empty state message */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-8) var(--sp-6)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
              marginBottom: "var(--sp-4)",
              lineHeight: 1.6,
            }}
          >
            Primero completa el paso de Input.
          </div>
          <Link
            href="/generator/input"
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            &larr; Ir a Input
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — Script exists
  // ============================================================

  const scenes = script.scenes || [];
  const totalScenes = scenes.length;
  const modeLabel = MODE_LABELS[config.mode] || config.mode;

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
          Paso 2 de 5 &mdash; Script
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
          {/* Progress bar fill — 40% */}
          <div
            style={{
              width: "40%",
              height: "100%",
              background: "var(--accent)",
              borderRadius: "var(--radius-full)",
              transition: "width var(--transition-base)",
            }}
          />
        </div>
      </div>

      {/* ======== SUMMARY BAR ======== */}
      <div
        style={{
          fontSize: "12px",
          fontFamily: "var(--font-mono)",
          color: "var(--muted)",
          marginBottom: "var(--sp-4)",
          padding: "var(--sp-2) var(--sp-3)",
          background: "var(--panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "inline-block",
        }}
      >
        {totalScenes} escenas &middot; {config.duration}s &middot; modo{" "}
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>{modeLabel}</span>
      </div>

      {/* ======== SCENE LIST ======== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-3)",
          marginBottom: "var(--sp-6)",
        }}
      >
        {scenes.map((scene) => (
          <div
            key={scene.id}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--sp-4) var(--sp-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-3)",
            }}
          >
            {/* Top row: badge + time range */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-3)",
              }}
            >
              {/* Scene number badge */}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "#fff",
                  background: "var(--accent)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  lineHeight: 1.4,
                  flexShrink: 0,
                }}
              >
                #{scene.id}
              </span>

              {/* Time range */}
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--dim)",
                  fontWeight: 500,
                }}
              >
                {fmtTime(scene.startSec)} &ndash; {fmtTime(scene.endSec)}
              </span>

              {/* Duration chip */}
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--dim)",
                  background: "var(--panel-2)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  marginLeft: "auto",
                  flexShrink: 0,
                }}
              >
                {scene.endSec - scene.startSec}s
              </span>
            </div>

            {/* Narration text */}
            <div
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
              }}
            >
              {scene.narration}
            </div>

            {/* On-screen text */}
            {scene.onScreenText && (
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                  border: "1px solid var(--accent-border)",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-sm)",
                  display: "inline-block",
                  alignSelf: "flex-start",
                  letterSpacing: "0.02em",
                }}
              >
                {scene.onScreenText}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ======== ACTION BAR ======== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "var(--sp-4)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/generator/input")}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: hoverBack ? "var(--panel-hover)" : "var(--panel)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          &larr; Input
        </button>

        {/* Next button */}
        <button
          onClick={handleNextStep}
          disabled={isGenerating}
          onMouseEnter={() => setHoverNext(true)}
          onMouseLeave={() => setHoverNext(false)}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-5)",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: isGenerating
              ? "var(--muted)"
              : hoverNext
                ? "var(--accent-hover)"
                : "var(--accent)",
            color: "#fff",
            cursor: isGenerating ? "not-allowed" : "pointer",
            transition: "all var(--transition-fast)",
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? "Generando..." : "Generar Assets \u2192"}
        </button>
      </div>
    </div>
  );
}
