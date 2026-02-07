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
    <div style={{ padding: "40px 48px", maxWidth: "720px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "0 0 6px 0",
          letterSpacing: "-0.5px",
        }}>
          Celeste
        </h1>
        <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
          Pipeline de video faceless. Dos modos, un mismo objetivo: de idea a video casi listo.
        </p>
      </div>

      {/* 2 modos principales */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        <Link href="/autovideos" style={{ textDecoration: "none" }}>
          <Card color="#8b5cf6" style={{ cursor: "pointer", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Badge color="#8b5cf6">WIZARD</Badge>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ccc" }}>AutoVideos</span>
            </div>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, margin: "0 0 8px" }}>
              Flujo guiado: tema &rarr; guion mock &rarr; assets &rarr; output.
              Todo automatizado, sin tocar nada externo.
            </p>
            <div style={{ fontSize: "10px", color: "#8b5cf6" }}>Abrir wizard &rarr;</div>
          </Card>
        </Link>

        <Link href="/director" style={{ textDecoration: "none" }}>
          <Card highlight color="#ec4899" style={{ cursor: "pointer", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Badge color="#ec4899">PRO</Badge>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ccc" }}>Director</span>
              <span style={{
                fontSize: "8px",
                fontWeight: 700,
                background: "#ec489920",
                color: "#ec4899",
                padding: "2px 6px",
                borderRadius: "3px",
              }}>KEY</span>
            </div>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, margin: "0 0 8px" }}>
              Importa guion (texto o ScriptPack JSON), detecta escenas,
              genera EDL con motions, b-roll y SFX. Exporta todo.
            </p>
            <div style={{ fontSize: "10px", color: "#ec4899" }}>Abrir director &rarr;</div>
          </Card>
        </Link>
      </div>

      {/* CTA continuar */}
      {hasProject && (
        <Card style={{ marginBottom: "16px" }}>
          <div style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#333",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Proyecto actual
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <Stat label="Titulo" value={state.project.title} />
            <Stat label="Duracion" value={`${state.project.durationSec}s`} />
            <Stat label="Escenas" value={hasScenes ? state.script.scenes.length : "\u2014"} />
            <Stat label="EDL" value={hasEdl ? `${state.edl.length} entries` : "\u2014"} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
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
                <Button size="sm">Empezar en AutoVideos &rarr;</Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Explicación */}
      <Card>
        <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.7 }}>
          <strong style={{ color: "#8b5cf6" }}>AutoVideos</strong> genera todo de cero con datos mock:
          tema, guion, prompts visuales y EDL. Ideal para prototipar rapido.
          <br /><br />
          <strong style={{ color: "#ec4899" }}>Director</strong> es la feature clave.
          Pega tu guion (o importa un ScriptPack JSON), detecta escenas y timestamps,
          y genera un mapa editorial con motions del catalogo, b-roll queries y SFX.
          Exporta como JSON o TXT.
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", color: "#999", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}
