"use client";

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

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Hero */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h1 style={{ fontSize: "22px", marginBottom: "var(--sp-2)" }}>
          Pipeline de video faceless
        </h1>
        <p style={{ fontSize: "14px" }}>
          Dos modos de trabajo, un mismo objetivo: de idea a video casi listo.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", marginBottom: "var(--sp-6)" }}>
        <Link href="/autovideos" style={{ textDecoration: "none" }}>
          <Card style={{ cursor: "pointer", height: "100%", transition: "border-color var(--transition-base)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
              <Badge color="var(--accent)">WIZARD</Badge>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>AutoVideos</span>
            </div>
            <p style={{ fontSize: "13px", margin: "0 0 var(--sp-3)" }}>
              Flujo guiado: tema, guion mock, assets y output. Todo automatizado.
            </p>
            <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 500 }}>Abrir wizard &rarr;</span>
          </Card>
        </Link>

        <Link href="/director" style={{ textDecoration: "none" }}>
          <Card highlight color="var(--accent)" style={{ cursor: "pointer", height: "100%", transition: "border-color var(--transition-base)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
              <Badge color="var(--pink)">PRO</Badge>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Director</span>
            </div>
            <p style={{ fontSize: "13px", margin: "0 0 var(--sp-3)" }}>
              Importa guion, detecta escenas, genera EDL con motions y b-roll. Exporta todo.
            </p>
            <span style={{ fontSize: "12px", color: "var(--pink)", fontWeight: 500 }}>Abrir director &rarr;</span>
          </Card>
        </Link>
      </div>

      {/* Project state */}
      {hasProject && (
        <Card style={{ marginBottom: "var(--sp-4)" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "var(--sp-3)" }}>
            Proyecto actual
          </div>
          <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap", marginBottom: "var(--sp-4)" }}>
            <Chip label="Titulo" value={state.project.title} />
            <Chip label="Duracion" value={`${state.project.durationSec}s`} />
            {hasScenes && <Chip label="Escenas" value={state.script.scenes.length} />}
            {hasEdl && <Chip label="EDL" value={`${state.edl.length} entries`} />}
          </div>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
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
    <div>
      <div style={{ fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", marginBottom: "2px", fontWeight: 600, letterSpacing: "0.3px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}
