"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import InlineNotice from "@/components/ui/InlineNotice";
import { useStore } from "@/lib/store";
import { exportJSON, importProjectJSON } from "@/lib/exporters";

const API_FIELDS = [
  { key: "mvpapiBaseUrl", label: "MVPAPI_BASE_URL", placeholder: "https://api.ejemplo.com/v1", help: "URL base de tu MVPAPI (cuando tengas backend)" },
  { key: "mvpapiApiKey", label: "MVPAPI_API_KEY", placeholder: "mvp_key_...", help: "API key del backend MVPAPI" },
  { key: "openaiApiKey", label: "OPENAI_API_KEY", placeholder: "sk-...", help: "Para generar EDL con IA (GPT-4o). Opcional." },
  { key: "anthropicApiKey", label: "ANTHROPIC_API_KEY", placeholder: "sk-ant-...", help: "Para generar EDL con Claude. Opcional." },
];

const SYSTEM_STATUS = [
  { label: "Backend", value: "No conectado", color: "var(--danger)" },
  { label: "IA", value: "Mock (sin API)", color: "var(--warning)" },
  { label: "Storage", value: "localStorage", color: "var(--success)" },
];

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

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
    <div style={{ maxWidth: "640px" }}>
      {/* ── Header ── */}
      <div className="reveal" style={{ marginBottom: "var(--sp-8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.2,
          }}>
            Configuracion
          </h1>
          <Badge color="var(--muted)" style={{ position: "relative", top: "1px" }}>SETTINGS</Badge>
        </div>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.6,
        }}>
          Integraciones, datos locales y export/import de proyecto.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>

        {/* ── API Keys ── */}
        <Card className="reveal-d1">
          <SectionLabel>Integracion futura (API keys)</SectionLabel>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--muted)",
            margin: "var(--sp-2) 0 var(--sp-5)",
            lineHeight: 1.7,
          }}>
            Cuando conectes un backend o IA, configura las keys aca.
            Se guardan en localStorage (nunca se envian a ningun servidor).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            {API_FIELDS.map((field) => (
              <div key={field.key}>
                <label style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--dim)",
                  display: "block",
                  marginBottom: "6px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}>
                  {field.label}
                </label>
                <input
                  type="password"
                  value={state.settings?.[field.key] || ""}
                  onChange={(e) => handleSettingChange(field.key, e.target.value)}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => setFocusedField(null)}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "var(--panel-2)",
                    border: `1px solid ${focusedField === field.key ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "var(--sp-2) var(--sp-3)",
                    fontSize: "12px",
                    color: "var(--text)",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    transition: "border-color var(--transition-fast)",
                  }}
                />
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  color: "var(--dim)",
                  marginTop: "var(--sp-1)",
                  lineHeight: 1.5,
                }}>
                  {field.help}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Estado del sistema ── */}
        <Card className="reveal-d2">
          <SectionLabel>Estado del sistema</SectionLabel>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-3)",
            marginTop: "var(--sp-4)",
          }}>
            {SYSTEM_STATUS.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--sp-2)",
                }}
              >
                <span style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius: "var(--radius-full)",
                  background: item.color,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text)",
                  minWidth: "64px",
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Import / Export ── */}
        <Card className="reveal-d3">
          <SectionLabel>Import / Export proyecto</SectionLabel>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--muted)",
            margin: "var(--sp-2) 0 var(--sp-5)",
            lineHeight: 1.7,
          }}>
            Exporta todo el proyecto (escenas + EDL) como JSON, o importa uno previo.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center" }}>
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
            <div style={{ marginTop: "var(--sp-4)" }}>
              <InlineNotice variant={importMsg.ok ? "success" : "error"}>
                {importMsg.text}
              </InlineNotice>
            </div>
          )}
        </Card>

        {/* ── Almacenamiento ── */}
        <Card className="reveal-d4">
          <SectionLabel>Almacenamiento local</SectionLabel>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--muted)",
            margin: "var(--sp-2) 0 var(--sp-5)",
            lineHeight: 1.7,
          }}>
            Todos los datos se guardan en localStorage. No se envia nada a ningun servidor.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center" }}>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearData}
              disabled={!hasData}
            >
              Borrar todos los datos
            </Button>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: hasData ? "var(--text-secondary)" : "var(--dim)",
            }}>
              <span style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "var(--radius-full)",
                background: hasData ? "var(--success)" : "var(--dim)",
                flexShrink: 0,
              }} />
              {hasData ? "Hay datos guardados" : "Sin datos"}
            </span>
          </div>
        </Card>

        {/* ── Proyecto actual ── */}
        <Card className="reveal-d5">
          <SectionLabel>Proyecto actual</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "var(--sp-4)",
            marginTop: "var(--sp-4)",
          }}>
            <Field label="Titulo" value={state.project.title || "Sin titulo"} />
            <Field label="Duracion" value={`${state.project.durationSec}s`} />
            <Field label="Tono" value={state.project.tone} />
            <Field label="Escenas" value={state.script.scenes.length} />
            <Field label="EDL entries" value={state.edl.length} />
            <Field label="Aspecto" value={state.project.aspectRatio} />
          </div>
        </Card>

        {/* ── About ── */}
        <Card className="reveal-d6">
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "22px",
            lineHeight: 1.2,
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Celeste
          </div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "var(--dim)",
            marginTop: "var(--sp-2)",
            lineHeight: 1.7,
          }}>
            Video faceless pipeline — de una idea a un video casi listo.
            <br />
            <span style={{ fontSize: "10px", letterSpacing: "0.3px" }}>
              Frontend v0.5 &middot; Sin backend activo &middot; Datos 100% locales
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "var(--font-body)",
      fontSize: "11px",
      fontWeight: 600,
      color: "var(--dim)",
      letterSpacing: "0.6px",
      textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "10px",
        color: "var(--dim)",
        textTransform: "uppercase",
        marginBottom: "4px",
        fontWeight: 600,
        letterSpacing: "0.4px",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        color: "var(--text-secondary)",
        fontWeight: 500,
        lineHeight: 1.4,
      }}>
        {value}
      </div>
    </div>
  );
}
