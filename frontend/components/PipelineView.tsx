"use client";

import { useState } from "react";

const modules = [
  {
    id: "input",
    title: "Input",
    icon: "\u270F\uFE0F",
    subtitle: "Tu idea",
    desc: "Escrib\u00eds un tema como: \u20185 h\u00e1bitos que te arruinan la vida\u2019. Eleg\u00eds duraci\u00f3n, estilo y tono.",
    color: "#6366f1",
    examples: [
      "Tema del video",
      "Duraci\u00f3n (30/60/90s)",
      "Estilo visual",
      "Tono de voz",
    ],
  },
  {
    id: "script",
    title: "Script Generator",
    icon: "\uD83E\uDDE0",
    subtitle: "GPT-4o / Claude",
    desc: "La IA genera un gui\u00f3n completo con timestamps, texto de narraci\u00f3n, prompts visuales para cada escena, y sugerencias de motion/b-roll/SFX.",
    color: "#8b5cf6",
    examples: [
      "Narraci\u00f3n en espa\u00f1ol",
      "Visual prompts en ingl\u00e9s",
      "Timestamps precisos",
      "JSON estructurado",
    ],
  },
  {
    id: "edl",
    title: "Editing Director",
    icon: "\uD83C\uDFAC",
    subtitle: "An\u00e1lisis editorial",
    desc: "Analiza el gui\u00f3n como un editor profesional. Te dice EXACTAMENTE d\u00f3nde poner cada motion, d\u00f3nde insertar b-roll, qu\u00e9 SFX usar y cu\u00e1ndo.",
    color: "#ec4899",
    examples: [
      "Motion: zoom_in 1.0x\u21921.15x",
      "B-roll [0:03-0:05]",
      "SFX [0:00]: whoosh",
      "Transici\u00f3n: crossfade 0.5s",
    ],
  },
  {
    id: "assets",
    title: "Asset Generator",
    icon: "\uD83C\uDFA8",
    subtitle: "DALL-E + ElevenLabs",
    desc: "Genera las im\u00e1genes con DALL-E 3 y la narraci\u00f3n con ElevenLabs (o gTTS gratis). Todo autom\u00e1tico basado en el script.",
    color: "#f59e0b",
    examples: [
      "Im\u00e1genes HD 1080x1920",
      "Audio narraci\u00f3n completo",
      "Audio por segmento",
      "~$0.40 total",
    ],
  },
  {
    id: "video",
    title: "Video Assembler",
    icon: "\uD83C\uDFA5",
    subtitle: "MoviePy + ffmpeg",
    desc: "Ensambla todo: im\u00e1genes con Ken Burns effects (zoom, pan), audio sincronizado, transiciones. Exporta un .mp4 listo.",
    color: "#10b981",
    examples: [
      "Ken Burns autom\u00e1tico",
      "Crossfades entre escenas",
      "Audio sincronizado",
      "Export 1080x1920",
    ],
  },
  {
    id: "output",
    title: "Output",
    icon: "\u2705",
    subtitle: "Video casi listo",
    desc: "Obten\u00e9s: el video con motions + un reporte que te dice exactamente qu\u00e9 b-roll buscar y d\u00f3nde poner SFX. Solo falta eso.",
    color: "#ef4444",
    examples: [
      "video_final.mp4",
      "reporte_edicion.txt",
      "Lista de b-roll",
      "Lista de SFX",
    ],
  },
];

function Arrow() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
      <svg width="20" height="24" viewBox="0 0 20 24">
        <line x1="10" y1="0" x2="10" y2="16" stroke="#333" strokeWidth="1.5" />
        <polygon points="5,15 10,22 15,15" fill="#333" />
      </svg>
    </div>
  );
}

export default function PipelineView() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      {/* Pipeline cards */}
      {modules.map((mod, i) => (
        <div key={mod.id}>
          <div
            onClick={() => setSelected(selected === mod.id ? null : mod.id)}
            style={{
              background: selected === mod.id ? `${mod.color}10` : "#111116",
              border: `1px solid ${selected === mod.id ? `${mod.color}60` : "#1a1a22"}`,
              borderRadius: "10px",
              padding: "14px 18px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: mod.color,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {mod.icon} {mod.title}
                </div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                  {mod.subtitle}
                </div>
              </div>
              <div
                style={{
                  background: `${mod.color}18`,
                  color: mod.color,
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: "20px",
                  border: `1px solid ${mod.color}30`,
                  letterSpacing: "0.5px",
                }}
              >
                {i + 1}/{modules.length}
              </div>
            </div>

            {/* Expanded details */}
            {selected === mod.id && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #1a1a22",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    lineHeight: 1.7,
                    margin: "0 0 10px 0",
                  }}
                >
                  {mod.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {mod.examples.map((ex, j) => (
                    <span
                      key={j}
                      style={{
                        background: `${mod.color}12`,
                        color: `${mod.color}cc`,
                        fontSize: "10px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: `1px solid ${mod.color}20`,
                      }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {i < modules.length - 1 && <Arrow />}
        </div>
      ))}

      {/* Cost summary */}
      <div
        style={{
          marginTop: "24px",
          background: "#111116",
          borderRadius: "10px",
          padding: "16px 18px",
          border: "1px solid #1a1a22",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#10b981",
            marginBottom: "10px",
            letterSpacing: "-0.2px",
          }}
        >
          Costo por video (60s, ~8 segmentos)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            {
              label: "DALL-E + ElevenLabs",
              cost: "~$0.40",
              color: "#f59e0b",
            },
            {
              label: "Modo gratis (gTTS)",
              cost: "~$0.03",
              color: "#10b981",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "#0a0a0e",
                padding: "10px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "20px", fontWeight: 800, color: item.color }}
              >
                {item.cost}
              </div>
              <div style={{ fontSize: "10px", color: "#555", marginTop: "3px" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editing Director highlight */}
      <div
        style={{
          marginTop: "12px",
          background: "linear-gradient(135deg, #ec489908, #8b5cf608)",
          borderRadius: "10px",
          padding: "16px 18px",
          border: "1px solid #ec489920",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#ec4899",
            marginBottom: "8px",
          }}
        >
          La clave: Editing Director
        </div>
        <div style={{ fontSize: "11px", color: "#888", lineHeight: 1.7 }}>
          Te genera un reporte que te dice exactamente:
          <br />
          <span style={{ color: "#f59e0b" }}>
            &bull; D&oacute;nde van los motions
          </span>{" "}
          (zoom, pan, shake) y por qu&eacute;
          <br />
          <span style={{ color: "#6366f1" }}>
            &bull; D&oacute;nde insertar b-roll
          </span>{" "}
          con timestamps y qu&eacute; buscar
          <br />
          <span style={{ color: "#10b981" }}>
            &bull; Qu&eacute; SFX usar
          </span>{" "}
          y en qu&eacute; momento
          <br />
          <br />
          <span style={{ color: "#ccc" }}>
            Vos solo busc&aacute;s el b-roll + SFX ={" "}
            <strong style={{ color: "#ef4444" }}>video listo</strong>
          </span>
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          color: "#333",
          fontSize: "10px",
        }}
      >
        Click en cada paso para ver detalles
      </div>
    </div>
  );
}
