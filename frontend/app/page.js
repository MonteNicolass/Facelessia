"use client";

import Link from "next/link";
import { pipelineSteps, mockConfig } from "@/data/mock";

// Overview — vista general del pipeline y estado del proyecto
export default function OverviewPage() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: "800px" }}>
      {/* Header */}
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
          De una idea a un video casi listo
        </h1>
        <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
          Pipeline completo: tema &rarr; script &rarr; direcci&oacute;n editorial &rarr; video con motions
        </p>
      </div>

      {/* Pipeline visual */}
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#333",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Flujo de trabajo
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {pipelineSteps.map((step, i) => (
            <div key={step.id}>
              <Link
                href={step.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  background: "#0e0e12",
                  border: step.isKey
                    ? `1px solid ${step.color}30`
                    : "1px solid #141418",
                  borderRadius: "10px",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
              >
                {/* Número */}
                <span
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: step.color,
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </span>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#ccc",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {step.label}
                    {step.isKey && (
                      <span
                        style={{
                          fontSize: "8px",
                          background: `${step.color}20`,
                          color: step.color,
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontWeight: 700,
                        }}
                      >
                        FEATURE CLAVE
                      </span>
                    )}
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}
                  >
                    {step.subtitle}
                  </div>
                </div>

                {/* Arrow */}
                <span style={{ fontSize: "14px", color: "#333" }}>&rarr;</span>
              </Link>

              {/* Conector */}
              {i < pipelineSteps.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "2px 0",
                  }}
                >
                  <div
                    style={{
                      width: "1px",
                      height: "8px",
                      background: "#1a1a22",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Proyecto actual */}
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
            fontSize: "9px",
            fontWeight: 700,
            color: "#333",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Proyecto actual
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {[
            { label: "Tema", value: mockConfig.tema, span: true },
            { label: "Duración", value: `${mockConfig.duracion}s` },
            { label: "Estilo", value: mockConfig.estilo },
            { label: "Tono", value: mockConfig.tono },
            { label: "Plataforma", value: mockConfig.plataforma },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                gridColumn: item.span ? "1 / -1" : "auto",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#444",
                  marginBottom: "3px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key feature callout */}
      <div
        style={{
          marginTop: "16px",
          background: "linear-gradient(135deg, #ec489908, #8b5cf608)",
          border: "1px solid #ec489918",
          borderRadius: "10px",
          padding: "16px 20px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.7 }}>
          <strong style={{ color: "#ec4899" }}>Editing Director</strong> analiza
          tu gui&oacute;n y te dice exactamente d&oacute;nde van los motions,
          d&oacute;nde insertar b-roll y qu&eacute; SFX usar. Vos solo
          busc&aacute;s el material y lo pon&eacute;s.
        </div>
      </div>
    </div>
  );
}
