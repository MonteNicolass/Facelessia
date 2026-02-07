"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useStore();

  const run = state.runs.find((r) => r.id === Number(params.id));

  /* ── Not found ── */
  if (!run) {
    return (
      <div style={{ maxWidth: "640px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            gap: "var(--sp-4)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              lineHeight: 1,
              color: "var(--dim)",
              fontFamily: "var(--font-display)",
            }}
          >
            404
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-secondary)",
              margin: 0,
              textAlign: "center",
            }}
          >
            Run no encontrado
          </p>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
              padding: "var(--sp-2) var(--sp-4)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--accent-border)",
              background: "var(--accent-muted)",
              transition:
                "background var(--transition-fast), border-color var(--transition-fast)",
            }}
          >
            &larr; Home
          </Link>
        </div>
      </div>
    );
  }

  /* ── Actions ── */

  function handleExportJSON() {
    const data = JSON.stringify(run, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `run-${run.id}-${run.type}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleDelete() {
    dispatch({ type: "DELETE_RUN", payload: run.id });
    router.push("/");
  }

  /* ── Render ── */

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--sp-1)",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          textDecoration: "none",
          marginBottom: "var(--sp-6)",
          transition: "color var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        &larr; Home
      </Link>

      {/* ── Header ── */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-3)",
            marginBottom: "var(--sp-2)",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "28px",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {run.name}
          </h1>

          {/* Type badge */}
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "2px 10px",
              borderRadius: "var(--radius-sm)",
              background:
                run.type === "generator"
                  ? "var(--accent-muted)"
                  : "var(--warning-muted)",
              color:
                run.type === "generator"
                  ? "var(--accent)"
                  : "var(--warning)",
            }}
          >
            {run.type === "generator" ? "Generator" : "Director"}
          </span>
        </div>

        <div
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-body)",
            color: "var(--dim)",
            lineHeight: 1.5,
          }}
        >
          {new Date(run.createdAt).toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* ── Input Section ── */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <SectionLabel>Input</SectionLabel>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            marginTop: "var(--sp-3)",
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: "var(--sp-4) var(--sp-5)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <code>{JSON.stringify(run.input, null, 2)}</code>
          </pre>
        </div>
      </div>

      {/* ── Output Section ── */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <SectionLabel>Output</SectionLabel>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            marginTop: "var(--sp-3)",
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: "var(--sp-4) var(--sp-5)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <code>{JSON.stringify(run.output, null, 2)}</code>
          </pre>
        </div>
      </div>

      {/* ── Actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          paddingTop: "var(--sp-5)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {/* Export JSON button */}
        <button
          onClick={handleExportJSON}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--accent)",
            background: "var(--accent-muted)",
            border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--sp-2) var(--sp-4)",
            cursor: "pointer",
            transition:
              "background var(--transition-fast), border-color var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "var(--bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-muted)";
            e.currentTarget.style.color = "var(--accent)";
          }}
        >
          Exportar JSON
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--danger)",
            background: "var(--danger-muted)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            padding: "var(--sp-2) var(--sp-4)",
            cursor: "pointer",
            transition:
              "background var(--transition-fast), border-color var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger)";
            e.currentTarget.style.color = "var(--bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--danger-muted)";
            e.currentTarget.style.color = "var(--danger)";
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

/* ── Helper ── */

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        color: "var(--dim)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}
