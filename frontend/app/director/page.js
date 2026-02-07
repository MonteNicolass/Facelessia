"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import InlineNotice from "@/components/ui/InlineNotice";
import EmptyState from "@/components/ui/EmptyState";
import Table from "@/components/ui/Table";
import { useStore } from "@/lib/store";
import { parseScript, formatTime, validateScriptPack } from "@/lib/parser";
import { generateMockEDL } from "@/lib/mock-generator";
import { exportJSON, exportTXT } from "@/lib/exporters";

export default function DirectorPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState("scenes");
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);

  // --- Acciones principales ---

  function handleImportScriptPack() {
    const text = state.script.raw.trim();
    if (!text) return;
    try {
      const obj = JSON.parse(text);
      const result = validateScriptPack(obj);
      if (result.valid) {
        dispatch({ type: "IMPORT_SCRIPTPACK", payload: result.data });
        setImportMsg({ ok: true, text: `ScriptPack importado: ${result.data.scenes.length} escenas` });
        return;
      }
      setImportMsg({ ok: false, text: result.error });
    } catch {
      setImportMsg({ ok: false, text: "No es JSON valido. Usa 'Detectar escenas' para texto plano." });
    }
  }

  function handleDetect() {
    setImportMsg(null);
    const scenes = parseScript(state.script.raw, state.project.durationSec);
    dispatch({ type: "SET_SCENES", payload: scenes });
    if (scenes.length > 0) {
      setImportMsg({ ok: true, text: `${scenes.length} escenas detectadas` });
    } else {
      setImportMsg({ ok: false, text: "No se detectaron escenas. Verifica el texto." });
    }
  }

  function handleGenerateEDL() {
    if (state.script.scenes.length === 0) return;
    const edl = generateMockEDL(state.script.scenes);
    dispatch({ type: "SET_EDL", payload: edl });
    setTab("edl");
    setImportMsg({ ok: true, text: `EDL generado: ${edl.length} entries` });
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        dispatch({ type: "SET_SCRIPT_RAW", payload: content });
        setImportMsg({ ok: true, text: `Archivo cargado: ${file.name}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    dispatch({ type: "SET_SCRIPT", payload: { raw: "", scenes: [] } });
    dispatch({ type: "SET_EDL", payload: [] });
    setTab("scenes");
    setImportMsg(null);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const hasScenes = state.script.scenes.length > 0;
  const hasEDL = state.edl.length > 0;

  // EDL table data for Table component
  const edlTableColumns = [
    { key: "num", label: "#", width: "40px" },
    { key: "time", label: "Time", width: "120px" },
    { key: "motion", label: "Motion" },
    { key: "broll", label: "B-Roll" },
    { key: "sfx", label: "SFX" },
    { key: "transition", label: "Transition", width: "100px" },
  ];

  const edlTableData = state.edl.map((entry) => ({
    id: entry.id,
    num: (
      <Badge color="var(--pink)" style={{ fontSize: "10px", padding: "1px 6px" }}>
        #{entry.id}
      </Badge>
    ),
    time: (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)" }}>
        {formatTime(entry.startSec)}&ndash;{formatTime(entry.endSec)}
      </span>
    ),
    motion: (
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        {entry.motionLabel}
      </span>
    ),
    broll: (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)" }}>
        {entry.brollQuery}
      </span>
    ),
    sfx: (
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        {entry.sfx.efecto}
      </span>
    ),
    transition: (
      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        {entry.transition.tipo}
      </span>
    ),
  }));

  return (
    <div>
      {/* ======== HEADER ======== */}
      <div className="reveal" style={{ marginBottom: "var(--sp-8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "28px",
              color: "var(--text)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Film Lab
          </h1>
          <Badge color="var(--accent)" style={{ fontSize: "10px", padding: "2px 8px", fontWeight: 700, letterSpacing: "0.08em" }}>
            DIRECTOR
          </Badge>
          <Badge color="var(--pink)" style={{ fontSize: "9px", padding: "1px 7px", fontWeight: 700, letterSpacing: "0.06em" }}>
            PRO
          </Badge>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: 1.6,
            maxWidth: "540px",
            margin: 0,
          }}
        >
          Importa guion (texto o ScriptPack JSON) &rarr; detecta escenas &rarr; genera EDL &rarr; exporta.
        </p>
      </div>

      {/* ======== 2-PANEL LAYOUT ======== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: "var(--sp-8)",
          alignItems: "start",
        }}
      >
        {/* === LEFT PANEL: GUION === */}
        <div className="reveal-d1" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SectionLabel>Guion</SectionLabel>
            <FileLink onClick={() => fileRef.current?.click()} />
            <input
              ref={fileRef}
              type="file"
              accept=".json,.txt,.md"
              onChange={handleFileImport}
              style={{ display: "none" }}
            />
          </div>

          {/* Textarea */}
          <Textarea
            value={state.script.raw}
            onChange={(e) => {
              dispatch({ type: "SET_SCRIPT_RAW", payload: e.target.value });
              setImportMsg(null);
            }}
            placeholder={"Pega tu guion aca.\n\nTexto plano con timestamps:\n[0:00] Escena uno...\n[0:15] Escena dos...\n\nO ScriptPack JSON:\n{ \"_format\": \"celeste_scriptpack_v1\", ... }\n\nO simplemente parrafos."}
            rows={16}
            style={{
              minHeight: "320px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          />

          {/* Feedback */}
          {importMsg && (
            <InlineNotice variant={importMsg.ok ? "success" : "error"}>
              {importMsg.text}
            </InlineNotice>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)" }}>
            <Button
              size="sm"
              variant="primary"
              onClick={handleDetect}
              disabled={!state.script.raw.trim()}
            >
              Detectar escenas
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleImportScriptPack}
              disabled={!state.script.raw.trim()}
            >
              Importar ScriptPack
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleGenerateEDL}
              disabled={!hasScenes}
            >
              Generar EDL
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Limpiar
            </Button>
          </div>

          {/* Stats card */}
          {hasScenes && (
            <Card
              highlight
              color="var(--accent)"
              style={{ padding: "var(--sp-4) var(--sp-5)" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-4)" }}>
                <Stat label="Escenas" value={state.script.scenes.length} color="var(--accent)" />
                <Stat label="EDL entries" value={state.edl.length || "\u2014"} color="var(--pink)" />
                <Stat
                  label="Duracion"
                  value={
                    state.script.scenes.length > 0
                      ? formatTime(state.script.scenes[state.script.scenes.length - 1].endSec)
                      : "\u2014"
                  }
                  color="var(--warning)"
                />
              </div>
            </Card>
          )}
        </div>

        {/* === RIGHT PANEL: SCENES / EDL / EXPORT === */}
        <div className="reveal-d2" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <Tabs
            tabs={[
              { id: "scenes", label: "Escenas", count: state.script.scenes.length || undefined },
              { id: "edl", label: "EDL", count: state.edl.length || undefined },
              { id: "export", label: "Export" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {/* --- Tab: Escenas --- */}
          {tab === "scenes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              {!hasScenes && (
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  }
                >
                  Pega un guion a la izquierda y presiona &quot;Detectar escenas&quot;.
                </EmptyState>
              )}
              {state.script.scenes.map((s, idx) => (
                <Card
                  key={s.id}
                  style={{
                    padding: "var(--sp-4)",
                    borderLeft: "3px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                  }}
                >
                  {/* Top row: badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", flexWrap: "wrap" }}>
                    <Badge color="var(--pink)" style={{ fontSize: "10px", padding: "1px 7px" }}>
                      #{s.id}
                    </Badge>
                    <Badge color="var(--accent)">
                      {formatTime(s.startSec)} &ndash; {formatTime(s.endSec)}
                    </Badge>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--dim)",
                        marginLeft: "auto",
                        background: "var(--panel-2)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {s.endSec - s.startSec}s
                    </span>
                  </div>

                  {/* Narration text */}
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.65,
                    }}
                  >
                    {s.narration}
                  </div>

                  {/* Visual prompt */}
                  {s.visualPrompt && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-body)",
                        color: "var(--muted)",
                        fontStyle: "italic",
                        background: "color-mix(in srgb, var(--accent) 4%, var(--panel-2))",
                        border: "1px solid color-mix(in srgb, var(--accent) 10%, transparent)",
                        padding: "var(--sp-2) var(--sp-3)",
                        borderRadius: "var(--radius-sm)",
                        marginTop: "var(--sp-3)",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.visualPrompt}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* --- Tab: EDL --- */}
          {tab === "edl" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              {!hasEDL && (
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="m17 2-5 5-5-5" />
                    </svg>
                  }
                >
                  Detecta escenas primero, luego presiona &quot;Generar EDL&quot;.
                </EmptyState>
              )}

              {/* EDL overview table */}
              {hasEDL && (
                <Table
                  columns={edlTableColumns}
                  data={edlTableData}
                  style={{ marginBottom: "var(--sp-2)" }}
                />
              )}

              {/* EDL detail cards */}
              {hasEDL && (
                <SectionLabel style={{ marginTop: "var(--sp-2)" }}>Detalle por entrada</SectionLabel>
              )}
              {state.edl.map((entry) => (
                <EDLCard key={entry.id} entry={entry} onCopy={copyToClipboard} />
              ))}
            </div>
          )}

          {/* --- Tab: Export --- */}
          {tab === "export" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
              {!hasScenes && !hasEDL && (
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  }
                >
                  Necesitas escenas o EDL para exportar.
                </EmptyState>
              )}
              {(hasScenes || hasEDL) && (
                <>
                  {/* Project summary */}
                  <Card highlight color="var(--accent)" style={{ padding: "var(--sp-5)" }}>
                    <SectionLabel style={{ marginBottom: "var(--sp-4)" }}>Resumen del proyecto</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--sp-4)" }}>
                      <Stat label="Titulo" value={state.project.title || "Sin titulo"} />
                      <Stat label="Escenas" value={state.script.scenes.length} color="var(--accent)" />
                      <Stat label="EDL" value={state.edl.length || "\u2014"} color="var(--pink)" />
                      <Stat label="Tono" value={state.project.tone} color="var(--warning)" />
                    </div>
                  </Card>

                  {/* Export buttons */}
                  <div style={{ display: "flex", gap: "var(--sp-3)" }}>
                    <Button variant="primary" onClick={() => exportJSON(state.project, state.script, state.edl)}>
                      Exportar JSON
                    </Button>
                    <Button variant="secondary" onClick={() => exportTXT(state.project, state.script, state.edl)}>
                      Exportar TXT
                    </Button>
                  </div>

                  {/* Shopping lists */}
                  {hasEDL && (
                    <>
                      <SectionLabel style={{ marginTop: "var(--sp-2)" }}>Shopping lists</SectionLabel>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
                        {/* B-Roll list */}
                        <Card style={{ padding: "var(--sp-4)" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                fontFamily: "var(--font-body)",
                                color: "var(--accent)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              B-Roll a buscar ({state.edl.length})
                            </span>
                            <CopyBtn
                              onClick={() =>
                                copyToClipboard(
                                  state.edl
                                    .map((e, i) => `${i + 1}. [${e.brollTimestamp}] ${e.brollQuery}`)
                                    .join("\n")
                                )
                              }
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
                            {state.edl.map((e, i) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: "11px",
                                  fontFamily: "var(--font-body)",
                                  color: "var(--text-secondary)",
                                  display: "flex",
                                  gap: "var(--sp-2)",
                                  lineHeight: 1.6,
                                }}
                              >
                                <span style={{ color: "var(--dim)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                                  {i + 1}.
                                </span>
                                <span>
                                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "10px" }}>
                                    [{e.brollTimestamp}]
                                  </span>{" "}
                                  {e.brollQuery}
                                </span>
                              </div>
                            ))}
                          </div>
                        </Card>

                        {/* SFX list */}
                        <Card style={{ padding: "var(--sp-4)" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                fontFamily: "var(--font-body)",
                                color: "var(--success)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              SFX necesarios
                            </span>
                            <CopyBtn
                              onClick={() =>
                                copyToClipboard(
                                  [...new Set(state.edl.map((e) => `${e.sfx.efecto} (${e.sfx.intensidad})`))].join("\n")
                                )
                              }
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
                            {[...new Set(state.edl.map((e) => `${e.sfx.efecto} (${e.sfx.intensidad})`))].map(
                              (s, i) => (
                                <div
                                  key={i}
                                  style={{
                                    fontSize: "11px",
                                    fontFamily: "var(--font-body)",
                                    color: "var(--text-secondary)",
                                    display: "flex",
                                    gap: "var(--sp-2)",
                                    lineHeight: 1.6,
                                  }}
                                >
                                  <span style={{ color: "var(--dim)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                                    {i + 1}.
                                  </span>
                                  <span>{s}</span>
                                </div>
                              )
                            )}
                          </div>
                        </Card>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS - Editorial Film Lab Design
// ============================================================

// --- EDL Card (detailed) ---
function EDLCard({ entry, onCopy }) {
  return (
    <Card
      style={{
        padding: "var(--sp-4)",
        borderLeft: "3px solid color-mix(in srgb, var(--pink) 50%, transparent)",
      }}
    >
      {/* Top row: badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-2)",
          marginBottom: "var(--sp-3)",
          flexWrap: "wrap",
        }}
      >
        <Badge color="var(--pink)" style={{ fontSize: "10px", padding: "1px 7px" }}>
          #{entry.id}
        </Badge>
        <Badge color="var(--accent)">
          {formatTime(entry.startSec)} &ndash; {formatTime(entry.endSec)}
        </Badge>
        <Badge color="var(--warning)" style={{ fontSize: "10px", padding: "1px 7px" }}>
          {entry.motionLabel}
        </Badge>
        <span
          style={{
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            color: "var(--muted)",
            background: "var(--panel-2)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            marginLeft: "auto",
          }}
        >
          {entry.motionType}
        </span>
      </div>

      {/* Detail grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--sp-3)",
        }}
      >
        {/* Motion */}
        <div style={{ gridColumn: "1 / 2" }}>
          <Row label="Motion">
            <span style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "12px" }}>
              {entry.motionLabel}
            </span>
            {entry.motionParams.from !== undefined && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted)",
                  fontSize: "10px",
                  marginLeft: "var(--sp-2)",
                }}
              >
                {entry.motionParams.from} &rarr; {entry.motionParams.to}
              </span>
            )}
            <Reason>{entry.motionReason}</Reason>
          </Row>
        </div>

        {/* Transition */}
        <div style={{ gridColumn: "2 / 3" }}>
          <Row label="Transicion">
            <span style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "12px" }}>
              {entry.transition.tipo}
            </span>
            {entry.transition.duracion > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted)",
                  fontSize: "10px",
                  marginLeft: "var(--sp-1)",
                }}
              >
                {entry.transition.duracion}s
              </span>
            )}
          </Row>
        </div>

        {/* B-Roll - full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <Row label="B-Roll">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                  fontSize: "10px",
                }}
              >
                {entry.brollTimestamp}
              </span>
              <CopyBtn onClick={() => onCopy(entry.brollQuery)} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--accent)",
                background: "color-mix(in srgb, var(--accent) 5%, var(--panel-2))",
                border: "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
                padding: "var(--sp-2) var(--sp-3)",
                borderRadius: "var(--radius-sm)",
                lineHeight: 1.5,
              }}
            >
              {entry.brollQuery}
            </div>
            <Reason>{entry.brollReason}</Reason>
          </Row>
        </div>

        {/* SFX */}
        <div style={{ gridColumn: "1 / -1" }}>
          <Row label="SFX" noBorder>
            <span style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "12px" }}>
              {entry.sfx.efecto}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--muted)",
                fontSize: "10px",
                marginLeft: "var(--sp-1)",
              }}
            >
              ({entry.sfx.intensidad})
            </span>
          </Row>
        </div>
      </div>
    </Card>
  );
}

// --- Copy button with tooltip and hover ---
function CopyBtn({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      data-tooltip="Copiar"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: hovered ? "var(--accent)" : "var(--dim)",
        padding: "3px",
        display: "flex",
        alignItems: "center",
        transition: "color var(--transition-fast)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

// --- File link with hover ---
function FileLink({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: "11px",
        fontFamily: "var(--font-body)",
        color: hovered ? "var(--accent)" : "var(--muted)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 0",
        transition: "color var(--transition-fast)",
        textDecoration: hovered ? "underline" : "none",
        textUnderlineOffset: "3px",
      }}
    >
      Cargar archivo
    </button>
  );
}

// --- Section label ---
function SectionLabel({ children, style: extraStyle }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        color: "var(--dim)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

// --- Stat with optional color accent ---
function Stat({ label, value, color }) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-body)",
          color: "var(--dim)",
          textTransform: "uppercase",
          marginBottom: "4px",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "14px",
          fontFamily: "var(--font-body)",
          color: color || "var(--text-secondary)",
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// --- Detail row ---
function Row({ label, children, noBorder }) {
  return (
    <div
      style={{
        padding: "var(--sp-2) 0",
        borderBottom: noBorder ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          fontSize: "9px",
          fontFamily: "var(--font-body)",
          color: "var(--dim)",
          textTransform: "uppercase",
          marginRight: "var(--sp-2)",
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <div
        style={{
          fontSize: "12px",
          fontFamily: "var(--font-body)",
          color: "var(--text-secondary)",
          marginTop: "4px",
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// --- Italic reason text ---
function Reason({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-body)",
        color: "var(--muted)",
        fontStyle: "italic",
        marginTop: "4px",
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
