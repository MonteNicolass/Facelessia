"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useStore } from "@/lib/store";

export default function OverviewPage() {
  const { state } = useStore();
  const hasProject = state.project.title.length > 0;
  const hasScenes = state.script.scenes.length > 0;
  const hasEdl = state.edl.length > 0;

  const [hoverWizard, setHoverWizard] = useState(false);
  const [hoverDirector, setHoverDirector] = useState(false);

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Hero */}
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
          pipeline de video faceless
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "30px",
            lineHeight: 1.2,
            color: "var(--text)",
            margin: "0 0 var(--sp-2)",
          }}
        >
          Editorial Film Lab
        </h1>
        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--muted)",
            margin: 0,
            fontFamily: "var(--font-body)",
          }}
        >
          De una idea a un video casi listo
        </p>
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
        {/* AutoVideos card */}
        <Link href="/autovideos" style={{ textDecoration: "none" }} className="reveal-d1">
          <Card
            style={{
              cursor: "pointer",
              height: "100%",
              transition: "border-color var(--transition-base), box-shadow var(--transition-base)",
              borderTop: hoverWizard
                ? "1px solid var(--accent-border)"
                : "1px solid var(--border)",
              boxShadow: hoverWizard
                ? "0 -1px 0 0 var(--accent-border)"
                : "none",
            }}
            onMouseEnter={() => setHoverWizard(true)}
            onMouseLeave={() => setHoverWizard(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-2)",
                marginBottom: "var(--sp-2)",
              }}
            >
              <Badge color="var(--accent)">WIZARD</Badge>
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
              AutoVideos
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
              Flujo guiado: tema, guion mock, assets y output. Todo automatizado.
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
              Abrir wizard &rarr;
            </span>
          </Card>
        </Link>

        {/* Director card */}
        <Link href="/director" style={{ textDecoration: "none" }} className="reveal-d2">
          <Card
            highlight
            color="var(--accent)"
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
              <Badge color="var(--pink)">PRO</Badge>
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
              Importa guion, detecta escenas, genera EDL con motions y b-roll. Exporta todo.
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

      {/* Project state */}
      {hasProject && (
        <Card className="reveal-d3" style={{ marginBottom: "var(--sp-4)" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              color: "var(--dim)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "var(--sp-4)",
            }}
          >
            Proyecto actual
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--sp-5)",
              flexWrap: "wrap",
              marginBottom: "var(--sp-5)",
            }}
          >
            <Chip label="Titulo" value={state.project.title} />
            <Chip label="Duracion" value={`${state.project.durationSec}s`} />
            {hasScenes && <Chip label="Escenas" value={state.script.scenes.length} />}
            {hasEdl && <Chip label="EDL" value={`${state.edl.length} entries`} />}
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--sp-2)",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "var(--sp-4)",
            }}
          >
            {hasScenes && !hasEdl && (
              <Link href="/director" style={{ textDecoration: "none" }}>
                <Button size="sm">Continuar en Director &rarr;</Button>
              </Link>
            )}
            {hasEdl && (
              <Link href="/director" style={{ textDecoration: "none" }}>
                <Button size="sm" variant="secondary">Ver EDL &rarr;</Button>
              </Link>
            )}
            {!hasScenes && (
              <Link href="/autovideos" style={{ textDecoration: "none" }}>
                <Button size="sm">Empezar &rarr;</Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function Chip({ label, value }) {
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
          fontSize: "13px",
          fontFamily: "var(--font-body)",
          color: "var(--text-secondary)",
          fontWeight: 500,
          maxWidth: "180px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
