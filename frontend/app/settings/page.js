"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useStore, initialState } from "@/lib/store";
import { exportJSON, importProjectJSON } from "@/lib/exporters";

const API_FIELDS = [
  { key: "mvpapiBaseUrl", label: "MVPAPI_BASE_URL", placeholder: "https://api.ejemplo.com/v1", help: "URL base de tu MVPAPI (cuando tengas backend)" },
  { key: "mvpapiApiKey", label: "MVPAPI_API_KEY", placeholder: "mvp_key_...", help: "API key del backend MVPAPI" },
  { key: "openaiApiKey", label: "OPENAI_API_KEY", placeholder: "sk-...", help: "Para generar EDL con IA (GPT-4o). Opcional." },
  { key: "anthropicApiKey", label: "ANTHROPIC_API_KEY", placeholder: "sk-ant-...", help: "Para generar EDL con Claude. Opcional." },
];

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  function handleClearData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("celeste-store");
      dispatch({ type: "RESET" });
    }
  }

  function handleExportProject() {
    exportJSON(state.project, state.script, state.edl);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content !== "string") return;
      const data = importProjectJSON(content);
      if (data) {
        dispatch({ type: "IMPORT_FULL_PROJECT", payload: data });
        setImportMsg({ ok: true, text: `Proyecto importado: ${data.project?.title || "sin titulo"}` });
      } else {
        setImportMsg({ ok: false, text: "Archivo no reconocido como proyecto Celeste." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleSettingChange(key, value) {
    dispatch({ type: "SET_SETTINGS", payload: { [key]: value } });
  }

  const hasData =
    state.project.title.trim() !== "" ||
    state.script.scenes.length > 0 ||
    state.edl.length > 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "620px" }}>
      <div style={{ marginBottom: "28px" }}>
        <Badge color="#555">SETTINGS</Badge>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#e5e5e5", margin: "8px 0 0", letterSpacing: "-0.5px" }}>
          Configuracion
        </h1>
        <p style={{ fontSize: "12px", color: "#444", margin: "4px 0 0" }}>
          Integraciones, datos locales y export/import de proyecto.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* --- Integracion futura --- */}
        <Card>
          <SectionLabel>Integracion futura (API keys)</SectionLabel>
          <p style={{ fontSize: "10px", color: "#444", margin: "6px 0 12px", lineHeight: "1.5" }}>
            Cuando conectes un backend o IA, configura las keys aca.
            Se guardan en localStorage (nunca se envian a ningun servidor).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {API_FIELDS.map((field) => (
              <div key={field.key}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#555", display: "block", marginBottom: "3px" }}>
                  {field.label}
                </label>
                <input
                  type="password"
                  value={state.settings?.[field.key] || ""}
                  onChange={(e) => handleSettingChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
                <div style={{ fontSize: "9px", color: "#333", marginTop: "2px" }}>
                  {field.help}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* --- Import/Export --- */}
        <Card>
          <SectionLabel>Import / Export proyecto</SectionLabel>
          <p style={{ fontSize: "10px", color: "#444", margin: "6px 0 12px", lineHeight: "1.5" }}>
            Exporta todo el proyecto (escenas + EDL) como JSON, o importa uno previo.
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button size="sm" onClick={handleExportProject} disabled={!hasData}>
              Exportar proyecto
            </Button>
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
              Importar proyecto
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
          </div>
          {importMsg && (
            <div style={{
              fontSize: "10px",
              color: importMsg.ok ? "#10b981" : "#ef4444",
              marginTop: "8px",
            }}>
              {importMsg.text}
            </div>
          )}
        </Card>

        {/* --- Almacenamiento --- */}
        <Card>
          <SectionLabel>Almacenamiento local</SectionLabel>
          <p style={{ fontSize: "10px", color: "#444", margin: "6px 0 12px", lineHeight: "1.5" }}>
            Todos los datos se guardan en localStorage. No se envia nada a ningun servidor.
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
            <span style={{ fontSize: "10px", color: hasData ? "#555" : "#333" }}>
              {hasData ? "Hay datos guardados" : "Sin datos"}
            </span>
          </div>
        </Card>

        {/* --- Proyecto actual --- */}
        <Card>
          <SectionLabel>Proyecto actual</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "10px" }}>
            <Field label="Titulo" value={state.project.title || "Sin titulo"} />
            <Field label="Duracion" value={`${state.project.durationSec}s`} />
            <Field label="Tono" value={state.project.tone} />
            <Field label="Escenas" value={state.script.scenes.length} />
            <Field label="EDL entries" value={state.edl.length} />
            <Field label="Aspecto" value={state.project.aspectRatio} />
          </div>
        </Card>

        {/* --- About --- */}
        <Card>
          <div style={{ fontSize: "14px", fontWeight: 800, background: "linear-gradient(135deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Celeste
          </div>
          <div style={{ fontSize: "10px", color: "#333", marginTop: "4px", lineHeight: "1.5" }}>
            Video faceless pipeline — de una idea a un video casi listo.
            <br />
            Frontend v0.3 &middot; Sin backend activo &middot; Datos 100% locales
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

const inputStyle = {
  width: "100%",
  background: "#111116",
  border: "1px solid #1a1a22",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "12px",
  color: "#ccc",
  fontFamily: "inherit",
  outline: "none",
};
