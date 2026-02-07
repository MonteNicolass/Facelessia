"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useStore } from "@/lib/store";

// Overview — entrada principal, links a las dos herramientas
export default function OverviewPage() {
  const { state } = useStore();
  const hasProject = state.project.title.length > 0;
  const hasScenes = state.script.scenes.length > 0;
  const hasEdl = state.edl.length > 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "720px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#e5e5e5",
            margin: "0 0 6px 0",
            letterSpacing: "-0.5px",
          }}
        >
          Celeste
        </h1>
        <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
          Pipeline de video faceless. Dos modos de trabajo, un mismo objetivo.
        </p>
      </div>

      {/* Herramientas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
        <Link href="/autovideos" style={{ textDecoration: "none" }}>
          <Card color="#8b5cf6" style={{ cursor: "pointer", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Badge color="#8b5cf6">WIZARD</Badge>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ccc" }}>AutoVideos</span>
            </div>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, margin: 0 }}>
              Flujo guiado en 3 pasos: configurar, generar guion, exportar.
              Todo automatizado con datos mock.
            </p>
            <div style={{ fontSize: "10px", color: "#8b5cf6", marginTop: "12px" }}>
              Abrir &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/director" style={{ textDecoration: "none" }}>
          <Card highlight color="#ec4899" style={{ cursor: "pointer", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Badge color="#ec4899">PRO</Badge>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ccc" }}>Director</span>
            </div>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, margin: 0 }}>
              Peg&aacute; tu guion, detect&aacute; escenas, y gener&aacute; un mapa editorial
              completo con motions, b-roll y SFX.
            </p>
            <div style={{ fontSize: "10px", color: "#ec4899", marginTop: "12px" }}>
              Abrir &rarr;
            </div>
          </Card>
        </Link>
      </div>

      {/* Estado actual */}
      {hasProject && (
        <Card style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "#333",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Proyecto actual
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                Titulo
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>{state.project.title}</div>
            </div>
            <div>
              <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                Escenas
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>{hasScenes ? state.script.scenes.length : "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                EDL
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>{hasEdl ? `${state.edl.length} entries` : "—"}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card>
        <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.7 }}>
          <strong style={{ color: "#ec4899" }}>Director</strong> es la feature clave.
          Analiza tu guion y te dice exactamente d&oacute;nde van los motions,
          d&oacute;nde insertar b-roll con queries de b&uacute;squeda, y qu&eacute; SFX
          usar en cada momento. Vos solo busc&aacute;s el material y lo pon&eacute;s.
        </div>
      </Card>
    </div>
  );
}
