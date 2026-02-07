"use client";

import { useState } from "react";
import StepHeader from "@/components/StepHeader";
import { mockEDL } from "@/data/mock";

// Director — Guía de edición completa (FEATURE CLAVE)
// Esta es la pantalla más importante de Celeste.
// Muestra el EDL como si fuera una hoja de edición profesional.
export default function DirectorPage() {
  const [expandedSeg, setExpandedSeg] = useState(1);
  const [activeTab, setActiveTab] = useState("timeline");
  const edl = mockEDL;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "820px" }}>
      <StepHeader
        step="03"
        color="#ec4899"
        title="Editing Director"
        description="Tu hoja de edición. Indica exactamente dónde van motions, b-roll y SFX con timestamps precisos. Vos solo ejecutás."
      />

      {/* Resumen editorial */}
      <div
        style={{
          background: "linear-gradient(135deg, #ec489908, #8b5cf608)",
          border: "1px solid #ec489918",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#999",
            lineHeight: 1.7,
          }}
        >
          {edl.resumen_edicion}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "20px",
          background: "#0a0a0e",
          padding: "3px",
          borderRadius: "8px",
          width: "fit-content",
        }}
      >
        {[
          { id: "timeline", label: "Timeline" },
          { id: "shopping", label: "Shopping List" },
          { id: "tips", label: "Tips" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "6px 16px",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "inherit",
              background: activeTab === tab.id ? "#ec489915" : "transparent",
              color: activeTab === tab.id ? "#ec4899" : "#555",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === TAB: TIMELINE === */}
      {activeTab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {edl.timeline.map((item) => {
            const isOpen = expandedSeg === item.segmento_id;

            return (
              <div
                key={item.segmento_id}
                onClick={() =>
                  setExpandedSeg(isOpen ? null : item.segmento_id)
                }
                style={{
                  background: isOpen ? "#ec489906" : "#0e0e12",
                  border: isOpen
                    ? "1px solid #ec489920"
                    : "1px solid #141418",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {/* Segment number */}
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      background: isOpen ? "#ec489920" : "#ffffff06",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: isOpen ? "#ec4899" : "#444",
                      flexShrink: 0,
                    }}
                  >
                    {item.segmento_id}
                  </span>

                  {/* Tiempo */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#ec4899",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {item.tiempo}
                  </span>

                  {/* Preview */}
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#666",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.narracion_preview}
                  </span>

                  {/* Motion badge */}
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "#f59e0b",
                      background: "#f59e0b12",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      flexShrink: 0,
                    }}
                  >
                    {item.motion.tipo}
                  </span>
                </div>

                {/* === Detalle expandido === */}
                {isOpen && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #1a1a22",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* MOTION */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={sectionLabel("#f59e0b")}>Motion</div>
                      <div style={detailBox}>
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={tag("#f59e0b")}>
                            {item.motion.tipo}
                          </span>
                          <span style={tag("#f59e0b")}>
                            {item.motion.velocidad}
                          </span>
                          <span style={tag("#f59e0b")}>
                            {item.motion.desde}x &rarr; {item.motion.hasta}x
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#777" }}>
                          {item.motion.nota}
                        </div>
                      </div>
                    </div>

                    {/* B-ROLL */}
                    {item.broll_inserts.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={sectionLabel("#6366f1")}>B-Roll</div>
                        {item.broll_inserts.map((br, j) => (
                          <div key={j} style={detailBox}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "6px",
                              }}
                            >
                              <span style={tag("#6366f1")}>
                                {br.timestamp}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#888",
                                  flex: 1,
                                }}
                              >
                                {br.descripcion}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#6366f1",
                                background: "#6366f108",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              Buscar: &quot;{br.buscar_en_stock}&quot;
                            </div>
                            <div style={{ fontSize: "10px", color: "#555" }}>
                              {br.razon}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SFX */}
                    {item.sfx.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={sectionLabel("#10b981")}>SFX</div>
                        {item.sfx.map((sfx, j) => (
                          <div key={j} style={{ ...detailBox, marginBottom: "6px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <span style={tag("#10b981")}>
                                {sfx.timestamp}
                              </span>
                              <span
                                style={{ fontSize: "11px", color: "#888" }}
                              >
                                {sfx.efecto}
                              </span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "#555",
                                  background: "#ffffff06",
                                  padding: "1px 6px",
                                  borderRadius: "3px",
                                }}
                              >
                                {sfx.intensidad}
                              </span>
                            </div>
                            {sfx.nota && (
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#555",
                                  marginTop: "4px",
                                }}
                              >
                                {sfx.nota}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TEXTO EN PANTALLA */}
                    {item.texto_pantalla?.mostrar && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={sectionLabel("#8b5cf6")}>
                          Texto en pantalla
                        </div>
                        <div style={detailBox}>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <span style={tag("#8b5cf6")}>
                              {item.texto_pantalla.desde} &rarr;{" "}
                              {item.texto_pantalla.hasta}
                            </span>
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: 800,
                                color: "#8b5cf6",
                              }}
                            >
                              {item.texto_pantalla.texto}
                            </span>
                            <span
                              style={{ fontSize: "10px", color: "#555" }}
                            >
                              {item.texto_pantalla.estilo}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TRANSICIÓN */}
                    <div>
                      <div style={sectionLabel("#555")}>
                        Transici&oacute;n siguiente
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <span style={tag("#555")}>
                          {item.transicion_siguiente.tipo}
                        </span>
                        <span style={{ color: "#444" }}>
                          {item.transicion_siguiente.duracion}s
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === TAB: SHOPPING LIST === */}
      {activeTab === "shopping" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
        >
          {/* B-roll */}
          <div
            style={{
              background: "#0e0e12",
              border: "1px solid #141418",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#6366f1",
                marginBottom: "14px",
              }}
            >
              B-Roll a buscar ({edl.broll_shopping_list.length})
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {edl.broll_shopping_list.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "3px",
                      border: "1px solid #333",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SFX */}
          <div
            style={{
              background: "#0e0e12",
              border: "1px solid #141418",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#10b981",
                marginBottom: "14px",
              }}
            >
              SFX a descargar ({edl.sfx_shopping_list.length})
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {edl.sfx_shopping_list.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "3px",
                      border: "1px solid #333",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === TAB: TIPS === */}
      {activeTab === "tips" && (
        <div
          style={{
            background: "#0e0e12",
            border: "1px solid #141418",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#ec4899",
              marginBottom: "14px",
            }}
          >
            Tips de edici&oacute;n
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {edl.tips_finales.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#333",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: "10px", color: "#333", marginTop: "16px" }}>
        Click en cada segmento para ver instrucciones completas &middot; Datos mock
      </div>
    </div>
  );
}

// --- Estilos helpers ---
const sectionLabel = (color) => ({
  fontSize: "9px",
  fontWeight: 700,
  color: color,
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "6px",
});

const detailBox = {
  background: "#111116",
  borderRadius: "6px",
  padding: "10px 12px",
};

const tag = (color) => ({
  fontSize: "10px",
  fontWeight: 700,
  color: color,
  background: `${color}12`,
  padding: "2px 8px",
  borderRadius: "3px",
  fontVariantNumeric: "tabular-nums",
  flexShrink: 0,
});
