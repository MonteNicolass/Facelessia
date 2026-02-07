"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useStore, initialState } from "@/lib/store";

export default function SettingsPage() {
  const { state, dispatch } = useStore();

  function handleClearData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("celeste-store");
      dispatch({ type: "RESET" });
    }
  }

  const hasData =
    state.project.title.trim() !== "" ||
    state.script.scenes.length > 0 ||
    state.edl.length > 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "560px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Badge color="#555">SETTINGS</Badge>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#e5e5e5", margin: "8px 0 0", letterSpacing: "-0.5px" }}>
          Configuracion
        </h1>
        <p style={{ fontSize: "12px", color: "#444", margin: "4px 0 0" }}>
          Preferencias del proyecto y datos locales.
        </p>
      </div>

      {/* Project defaults */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card>
          <SectionLabel>Proyecto actual</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
            <Field label="Titulo" value={state.project.title || "Sin titulo"} />
            <Field label="Duracion" value={`${state.project.durationSec}s`} />
            <Field label="Tono" value={state.project.tone} />
            <Field label="Idioma" value={state.project.language} />
            <Field label="Aspecto" value={state.project.aspectRatio} />
            <Field label="Escenas" value={state.script.scenes.length} />
            <Field label="EDL entries" value={state.edl.length} />
          </div>
        </Card>

        <Card>
          <SectionLabel>Almacenamiento local</SectionLabel>
          <p style={{ fontSize: "11px", color: "#555", margin: "8px 0 12px", lineHeight: "1.5" }}>
            Todos los datos se guardan en localStorage del navegador.
            No se envia nada a ningun servidor.
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearData}
              disabled={!hasData}
            >
              Borrar todos los datos
            </Button>
            {hasData && (
              <span style={{ fontSize: "10px", color: "#555" }}>
                Hay datos guardados
              </span>
            )}
            {!hasData && (
              <span style={{ fontSize: "10px", color: "#333" }}>
                Sin datos
              </span>
            )}
          </div>
        </Card>

        <Card>
          <SectionLabel>Acerca de</SectionLabel>
          <div style={{ marginTop: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, background: "linear-gradient(135deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Celeste
            </div>
            <div style={{ fontSize: "10px", color: "#333", marginTop: "2px" }}>
              Video faceless pipeline — de una idea a un video casi listo.
            </div>
            <div style={{ fontSize: "10px", color: "#222", marginTop: "8px" }}>
              Frontend v0.2 &middot; Sin backend &middot; Datos 100% locales
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: "10px",
      fontWeight: 700,
      color: "#555",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}
