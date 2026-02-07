"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const { state, dispatch } = useStore();
  const [hoverStudio, setHoverStudio] = useState(false);
  const [hoverDirector, setHoverDirector] = useState(false);

  const studioScenes = state.studio.output?.script?.length || 0;
  const editMapSegments = state.editMap.segments.length;
  const hasQuickStatus = state.studio.output || editMapSegments > 0;

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header */}
      <div className="reveal" style={{ marginBottom: "var(--sp-8)" }}>
        <div
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "var(--dim)",
            marginBottom: "var(--sp-3)",
          }}
        >
          Pipeline de video faceless
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "30px",
            lineHeight: 1.2,
            color: "var(--text)",
            margin: 0,
          }}
        >
          Celeste
        </h1>
      </div>

      {/* Tool cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--sp-4)",
          marginBottom: "var(--sp-6)",
        }}
      >
        {/* Studio card */}
        <Link href="/studio" style={{ textDecoration: "none" }} className="reveal-d1">
          <Card
            style={{
              cursor: "pointer",
              height: "100%",
              transition: "border-color var(--transition-base), box-shadow var(--transition-base)",
              borderTop: hoverStudio
                ? "1px solid var(--accent-border)"
                : "1px solid var(--border)",
              boxShadow: hoverStudio
                ? "0 -1px 0 0 var(--accent-border)"
                : "none",
            }}
            onMouseEnter={() => setHoverStudio(true)}
            onMouseLeave={() => setHoverStudio(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-2)",
                marginBottom: "var(--sp-2)",
              }}
            >
              <Badge color="var(--accent)">AI VIDEO</Badge>
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
              Studio
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "var(--text-secondary)",
                margin: "0 0 var(--sp-4)",
                fontFamily: "var(--font-body)",
              }}
            >
              Genera guiones, prompts y assets desde un tema. Flujo completo automatizado.
            </p>
            <span
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "color var(--transition-fast)",
              }}
            >
              Abrir studio &rarr;
            </span>
          </Card>
        </Link>

        {/* Director card */}
        <Link href="/director" style={{ textDecoration: "none" }} className="reveal-d2">
          <Card
            highlight
            color="var(--pink)"
            style={{
              cursor: "pointer",
              height: "100%",
              transition: "border-color var(--transition-base), box-shadow var(--transition-base)",
              borderTop: hoverDirector
                ? "1px solid color-mix(in srgb, var(--pink) 40%, transparent)"
                : undefined,
              boxShadow: hoverDirector
                ? "0 -1px 0 0 color-mix(in srgb, var(--pink) 30%, transparent)"
                : "none",
            }}
            onMouseEnter={() => setHoverDirector(true)}
            onMouseLeave={() => setHoverDirector(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-2)",
                marginBottom: "var(--sp-2)",
              }}
            >
              <Badge color="var(--pink)">EDIT MAP</Badge>
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
              Director
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "var(--text-secondary)",
                margin: "0 0 var(--sp-4)",
                fontFamily: "var(--font-body)",
              }}
            >
              Importa guion, segmenta escenas, asigna motions, b-roll y SFX. Exporta el edit map.
            </p>
            <span
              style={{
                fontSize: "12px",
                color: "var(--pink)",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "color var(--transition-fast)",
              }}
            >
              Abrir director &rarr;
            </span>
          </Card>
        </Link>
      </div>

      {/* Quick status */}
      {hasQuickStatus && (
        <Card className="reveal-d2" style={{ marginBottom: "var(--sp-6)" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              color: "var(--dim)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "var(--sp-3)",
            }}
          >
            Estado actual
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--sp-6)",
              flexWrap: "wrap",
            }}
          >
            {state.studio.output && (
              <Stat label="Studio scenes" value={studioScenes} />
            )}
            {editMapSegments > 0 && (
              <Stat label="Edit Map segments" value={editMapSegments} />
            )}
          </div>
        </Card>
      )}

      {/* Recent Projects */}
      <div className="reveal-d3">
        {state.projects.length > 0 ? (
          <>
            <SectionLabel>Proyectos recientes</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              {state.projects.map((project) => (
                <Card key={project.id} style={{ padding: "var(--sp-3) var(--sp-4)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--sp-3)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--sp-3)",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            color: "var(--text)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-body)",
                            color: "var(--dim)",
                            marginTop: "2px",
                          }}
                        >
                          {new Date(project.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <Badge
                        color={project.type === "studio" ? "var(--accent)" : "var(--pink)"}
                      >
                        {project.type === "studio" ? "Studio" : "Director"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        dispatch({ type: "DELETE_PROJECT", payload: project.id })
                      }
                      style={{ color: "var(--muted)", flexShrink: 0 }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <p
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              color: "var(--dim)",
              margin: 0,
            }}
          >
            Sin proyectos guardados todavia.
          </p>
        )}
      </div>
    </div>
  );
}

/* -- Local helper components -- */

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-body)",
          color: "var(--dim)",
          textTransform: "uppercase",
          marginBottom: "3px",
          fontWeight: 600,
          letterSpacing: "0.4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "15px",
          fontFamily: "var(--font-body)",
          color: "var(--text-secondary)",
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        color: "var(--dim)",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "var(--sp-3)",
      }}
    >
      {children}
    </div>
  );
}
