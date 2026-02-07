"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { simulateAssembly, buildOutput } from "@/lib/generator-pipeline";

// ============================================================
// LOG THRESHOLDS — messages appear as progress advances
// ============================================================

const LOG_ENTRIES = [
  { at: 10, text: "Cargando escenas..." },
  { at: 30, text: "Procesando prompts visuales..." },
  { at: 50, text: "Aplicando motions y transiciones..." },
  { at: 70, text: "Generando audio..." },
  { at: 90, text: "Finalizando render..." },
  { at: 100, text: "Listo" },
];

// ============================================================
// GENERATOR ASSEMBLE PAGE — Step 4 of 5
// ============================================================

export default function GeneratorAssemblePage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const startedRef = useRef(false);
  const [logs, setLogs] = useState([]);

  const { assembleProgress, config } = state.generator;
  const isDone = assembleProgress >= 100;

  // ── Seed logs from current progress on mount (for re-visits) ──
  useEffect(() => {
    const initial = LOG_ENTRIES.filter((e) => e.at <= assembleProgress).map((e) => e.text);
    if (initial.length > 0) {
      setLogs(initial);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Run assembly simulation on mount ──
  useEffect(() => {
    if (startedRef.current) return;
    if (assembleProgress >= 100) return;
    startedRef.current = true;

    simulateAssembly((p) => {
      dispatch({ type: "SET_GEN_ASSEMBLE_PROGRESS", payload: p });

      // Add log entries as thresholds are crossed
      setLogs((prev) => {
        const newLogs = [...prev];
        for (const entry of LOG_ENTRIES) {
          if (p >= entry.at && !newLogs.includes(entry.text)) {
            newLogs.push(entry.text);
          }
        }
        return newLogs;
      });
    }).then(() => {
      const output = buildOutput(config);
      dispatch({ type: "SET_GEN_OUTPUT", payload: output });
      dispatch({ type: "SET_GEN_STEP", payload: 4 });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ──
  return (
    <div style={{ maxWidth: "640px" }}>
      <StepIndicator step={4} total={5} label="Assemble" progress={80} />

      {/* ══════════ Assembly Card ══════════ */}
      <div
        style={{
          marginTop: "var(--sp-6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-8) var(--sp-6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--sp-5)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Percentage */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "48px",
              fontWeight: 700,
              color: isDone ? "var(--success)" : "var(--accent)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              transition: "color var(--transition-base)",
            }}
          >
            {Math.min(assembleProgress, 100)}%
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "6px",
              background: "var(--panel-2)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(assembleProgress, 100)}%`,
                height: "100%",
                background: isDone ? "var(--success)" : "var(--accent)",
                borderRadius: "var(--radius-full)",
                transition: "width var(--transition-fast), background var(--transition-base)",
              }}
            />
          </div>

          {/* Status text */}
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: 600,
              color: isDone ? "var(--success)" : "var(--text-secondary)",
              transition: "color var(--transition-base)",
            }}
          >
            {isDone ? "Ensamblado completo" : "Ensamblando video..."}
          </div>

          {/* Log entries */}
          {logs.length > 0 && (
            <div
              style={{
                width: "100%",
                maxWidth: "400px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "var(--sp-3) var(--sp-4)",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {logs.map((log, idx) => {
                const isLast = idx === logs.length - 1;
                const isComplete = log === "Listo";
                return (
                  <div
                    key={idx}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: isComplete
                        ? "var(--success)"
                        : isLast
                          ? "var(--text-secondary)"
                          : "var(--muted)",
                      lineHeight: 1.8,
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-2)",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "var(--radius-full)",
                        background: isComplete
                          ? "var(--success)"
                          : isLast && !isDone
                            ? "var(--accent)"
                            : "var(--dim)",
                        flexShrink: 0,
                      }}
                    />
                    {log}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ Action Bar ══════════ */}
      <div
        style={{
          marginTop: "var(--sp-8)",
          paddingTop: "var(--sp-5)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/generator/assets"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textDecoration: "none",
            padding: "var(--sp-2) var(--sp-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            transition: "all var(--transition-fast)",
            cursor: "pointer",
            display: "inline-block",
          }}
        >
          &larr; Assets
        </Link>

        {isDone && (
          <button
            onClick={() => router.push("/generator/output")}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--bg)",
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              padding: "var(--sp-2) var(--sp-5)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            Ver Output &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StepIndicator({ step, total, label, progress }) {
  return (
    <div style={{ marginBottom: "var(--sp-2)" }}>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "var(--sp-2)",
          letterSpacing: "0.02em",
        }}
      >
        Paso {step} de {total} &mdash; {label}
      </div>
      <div
        style={{
          width: "100%",
          height: "4px",
          background: "var(--panel-2)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--accent)",
            borderRadius: "var(--radius-full)",
            transition: "width var(--transition-base)",
          }}
        />
      </div>
    </div>
  );
}
