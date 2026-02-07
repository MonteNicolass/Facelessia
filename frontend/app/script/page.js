"use client";

import { useState } from "react";
import StepHeader from "@/components/StepHeader";
import { mockScript } from "@/data/mock";

// Script — muestra el guión generado con todos los segmentos
export default function ScriptPage() {
  const [expandedSeg, setExpandedSeg] = useState(null);
  const script = mockScript;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "760px" }}>
      <StepHeader
        step="02"
        color="#8b5cf6"
        title="Script"
        description="Guión generado por IA. Cada segmento tiene narración, prompt visual, tipo de motion y sugerencias de b-roll/SFX."
      />

      {/* Meta del script */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Título", value: script.titulo },
          { label: "Duración", value: `${script.duracion_total}s` },
          { label: "Segmentos", value: script.segmentos.length },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "#0e0e12",
              border: "1px solid #141418",
              borderRadius: "8px",
              padding: "10px 14px",
              flex: item.label === "Título" ? 2 : 1,
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "3px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                fontWeight: 600,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Estilo visual global */}
      <div
        style={{
          background: "#0e0e12",
          border: "1px solid #141418",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}
        >
          Estilo visual global
        </div>
        <div style={{ fontSize: "12px", color: "#888" }}>
          {script.estilo_visual}
        </div>
      </div>

      {/* Segmentos */}
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
        Timeline ({script.segmentos.length} segmentos)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {script.segmentos.map((seg) => {
          const isOpen = expandedSeg === seg.id;

          return (
            <div
              key={seg.id}
              onClick={() => setExpandedSeg(isOpen ? null : seg.id)}
              style={{
                background: isOpen ? "#8b5cf608" : "#0e0e12",
                border: isOpen
                  ? "1px solid #8b5cf625"
                  : "1px solid #141418",
                borderRadius: "10px",
                padding: "14px 18px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {/* Header del segmento */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {/* Tiempo */}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#8b5cf6",
                    background: "#8b5cf612",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {seg.tiempo_inicio}s-{seg.tiempo_fin}s
                </span>

                {/* Narración preview */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: isOpen ? "normal" : "nowrap",
                  }}
                >
                  {seg.narracion}
                </div>

                {/* Motion badge */}
                <span
                  style={{
                    fontSize: "9px",
                    color: "#555",
                    background: "#111116",
                    padding: "2px 8px",
                    borderRadius: "3px",
                    flexShrink: 0,
                  }}
                >
                  {seg.motion}
                </span>
              </div>

              {/* Detalle expandido */}
              {isOpen && (
                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid #1a1a22",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {/* Visual prompt */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#8b5cf6",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Visual prompt (DALL-E)
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#777",
                        background: "#111116",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontStyle: "italic",
                      }}
                    >
                      {seg.visual_prompt}
                    </div>
                  </div>

                  {/* B-roll */}
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#6366f1",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      B-roll sugerido
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      [{seg.broll_timestamp}] {seg.broll_sugerido}
                    </div>
                  </div>

                  {/* SFX */}
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#10b981",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      SFX sugerido
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      [{seg.sfx_timestamp}] {seg.sfx_sugerido}
                    </div>
                  </div>

                  {/* Motion detalle */}
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#f59e0b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Motion
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      {seg.motion} ({seg.motion_intensidad})
                    </div>
                  </div>

                  {/* Transición */}
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Transici&oacute;n
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      {seg.transicion_siguiente}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notas de edición */}
      <div
        style={{
          marginTop: "20px",
          background: "#0e0e12",
          border: "1px solid #141418",
          borderRadius: "8px",
          padding: "14px 18px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}
        >
          Notas de edici&oacute;n
        </div>
        <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>
          {script.notas_edicion}
        </div>
      </div>

      <div
        style={{
          fontSize: "10px",
          color: "#333",
          marginTop: "16px",
        }}
      >
        Click en cada segmento para ver detalle &middot; Datos mock
      </div>
    </div>
  );
}
