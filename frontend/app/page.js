"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { state, dispatch } = useStore();
  const [hoverGen, setHoverGen] = useState(false);
  const [hoverDir, setHoverDir] = useState(false);
  const [hoveredRun, setHoveredRun] = useState(null);

  const runs = state.runs || [];

  function handleDeleteRun(e, id) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "DELETE_RUN", payload: id });
  }

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "var(--sp-10)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "36px",
            lineHeight: 1.1,
            color: "var(--text)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          CELESTE
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--text-secondary)",
            margin: "var(--sp-2) 0 0",
            lineHeight: 1.6,
          }}
        >
          Editor-first faceless video pipeline
        </p>
      </div>

      {/* ── Mode Cards (2-col grid, 1-col mobile via min()) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--sp-4)",
          marginBottom: "var(--sp-8)",
        }}
      >
        {/* Generator Card */}
        <Link
          href="/generator/input"
          style={{ textDecoration: "none", display: "block" }}
          onMouseEnter={() => setHoverGen(true)}
          onMouseLeave={() => setHoverGen(false)}
        >
          <div
            style={{
              background: "var(--panel)",
              border: hoverGen
                ? "1px solid var(--accent-border)"
                : "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--sp-6)",
              cursor: "pointer",
              transition:
                "border-color var(--transition-base), box-shadow var(--transition-base)",
              boxShadow: hoverGen ? "var(--shadow-md)" : "var(--shadow-sm)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Lightning bolt icon */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--sp-4)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>

            <div
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                color: "var(--text)",
                marginBottom: "var(--sp-2)",
              }}
            >
              Generador Faceless
            </div>

            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: "0 0 var(--sp-5)",
                fontFamily: "var(--font-body)",
                flex: 1,
              }}
            >
              Pipeline mock de 5 pasos: Input &rarr; Script &rarr; Assets
              &rarr; Assemble &rarr; Output
            </p>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sp-1)",
                transition: "color var(--transition-fast)",
              }}
            >
              Comenzar &rarr;
            </span>
          </div>
        </Link>

        {/* Director Card */}
        <Link
          href="/director"
          style={{ textDecoration: "none", display: "block" }}
          onMouseEnter={() => setHoverDir(true)}
          onMouseLeave={() => setHoverDir(false)}
        >
          <div
            style={{
              background: "var(--panel)",
              border: hoverDir
                ? "1px solid var(--accent-border)"
                : "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--sp-6)",
              cursor: "pointer",
              transition:
                "border-color var(--transition-base), box-shadow var(--transition-base)",
              boxShadow: hoverDir ? "var(--shadow-md)" : "var(--shadow-sm)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Columns icon */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--sp-4)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </svg>
            </div>

            <div
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                color: "var(--text)",
                marginBottom: "var(--sp-2)",
              }}
            >
              Editing Director
            </div>

            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: "0 0 var(--sp-5)",
                fontFamily: "var(--font-body)",
                flex: 1,
              }}
            >
              Analiza tu guion y genera EDL con motions, b-roll, SFX y
              transiciones
            </p>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sp-1)",
                transition: "color var(--transition-fast)",
              }}
            >
              Abrir Director &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* ── Recent Runs ── */}
      <div>
        <h3
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 var(--sp-4)",
          }}
        >
          Recent Runs
        </h3>

        {runs.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--dim)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            No hay runs guardados aun
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-2)",
            }}
          >
            {runs.map((run) => {
              const isHovered = hoveredRun === run.id;
              return (
                <Link
                  key={run.id}
                  href={`/runs/${run.id}`}
                  style={{ textDecoration: "none", display: "block" }}
                  onMouseEnter={() => setHoveredRun(run.id)}
                  onMouseLeave={() => setHoveredRun(null)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sp-3)",
                      padding: "var(--sp-3) var(--sp-4)",
                      background: isHovered
                        ? "var(--panel-hover)"
                        : "var(--panel)",
                      border: "1px solid",
                      borderColor: isHovered
                        ? "var(--border)"
                        : "var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {/* Type badge */}
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        background:
                          run.type === "generator"
                            ? "var(--accent-muted)"
                            : "var(--warning-muted)",
                        color:
                          run.type === "generator"
                            ? "var(--accent)"
                            : "var(--warning)",
                        flexShrink: 0,
                      }}
                    >
                      {run.type === "generator" ? "Generator" : "Director"}
                    </span>

                    {/* Run name */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                    >
                      {run.name}
                    </span>

                    {/* Date */}
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-body)",
                        color: "var(--dim)",
                        flexShrink: 0,
                      }}
                    >
                      {new Date(run.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteRun(e, run.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "var(--sp-1) var(--sp-2)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--muted)",
                        fontSize: "12px",
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        transition: "color var(--transition-fast), background var(--transition-fast)",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--danger)";
                        e.currentTarget.style.background = "var(--danger-muted)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--muted)";
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
