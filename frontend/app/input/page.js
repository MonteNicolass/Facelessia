"use client";

import { useState } from "react";
import StepHeader from "@/components/StepHeader";

// Input — configurar el video antes de generar
export default function InputPage() {
  const [tema, setTema] = useState("");
  const [duracion, setDuracion] = useState("60");
  const [estilo, setEstilo] = useState("cinematográfico oscuro");
  const [tono, setTono] = useState("informativo y enganchante");

  const estilos = [
    "cinematográfico oscuro",
    "minimalista clean",
    "neon futurista",
    "vintage retro",
    "naturaleza orgánica",
    "corporativo profesional",
  ];

  const tonos = [
    "informativo y enganchante",
    "dramático y misterioso",
    "motivacional",
    "casual y cercano",
    "educativo",
  ];

  // Estilos reutilizables para inputs
  const inputStyle = {
    width: "100%",
    background: "#111116",
    border: "1px solid #1a1a22",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#ccc",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    fontSize: "10px",
    fontWeight: 700,
    color: "#555",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "640px" }}>
      <StepHeader
        step="01"
        color="#6366f1"
        title="Input"
        description="Configurá tu video. Elegí el tema, la duración y el estilo. Esto es lo que va a alimentar al generador de guiones."
      />

      {/* Formulario */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Tema */}
        <div>
          <label style={labelStyle}>Tema del video</label>
          <textarea
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ej: 5 hábitos que te están arruinando la vida sin que te des cuenta"
            rows={3}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "80px",
            }}
          />
          <div
            style={{
              fontSize: "10px",
              color: "#333",
              marginTop: "4px",
            }}
          >
            Sé específico. Cuanto más claro el tema, mejor el guión.
          </div>
        </div>

        {/* Duración + Estilo en row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Duración</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {["30", "45", "60", "90"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuracion(d)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background:
                      duracion === d ? "#6366f115" : "#111116",
                    color: duracion === d ? "#6366f1" : "#555",
                    border:
                      duracion === d
                        ? "1px solid #6366f140"
                        : "1px solid #1a1a22",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Plataforma</label>
            <select
              style={{
                ...inputStyle,
                cursor: "pointer",
                appearance: "none",
              }}
            >
              <option>Instagram Reels / TikTok</option>
              <option>YouTube Shorts</option>
              <option>YouTube (horizontal)</option>
            </select>
          </div>
        </div>

        {/* Estilo visual */}
        <div>
          <label style={labelStyle}>Estilo visual</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {estilos.map((e) => (
              <button
                key={e}
                onClick={() => setEstilo(e)}
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  background: estilo === e ? "#6366f112" : "#111116",
                  color: estilo === e ? "#6366f1" : "#666",
                  border:
                    estilo === e
                      ? "1px solid #6366f130"
                      : "1px solid #1a1a22",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Tono */}
        <div>
          <label style={labelStyle}>Tono</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {tonos.map((t) => (
              <button
                key={t}
                onClick={() => setTono(t)}
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  background: tono === t ? "#6366f112" : "#111116",
                  color: tono === t ? "#6366f1" : "#666",
                  border:
                    tono === t
                      ? "1px solid #6366f130"
                      : "1px solid #1a1a22",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Separador */}
        <div style={{ height: "1px", background: "#141418" }} />

        {/* Preview de lo que se va a generar */}
        <div
          style={{
            background: "#0e0e12",
            border: "1px solid #141418",
            borderRadius: "10px",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "#333",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Con esto se va a generar
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              { label: "Guión", desc: "6-12 segmentos con narración" },
              { label: "Imágenes", desc: "1 por segmento (DALL-E)" },
              { label: "Audio", desc: "Narración completa" },
              { label: "Motions", desc: "Ken Burns automáticos" },
              { label: "EDL", desc: "Guía de edición detallada" },
              { label: "Video", desc: ".mp4 casi listo" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#08080c",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#888",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#444",
                    marginTop: "2px",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón generar */}
        <button
          style={{
            padding: "12px 24px",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "inherit",
            background: tema.trim()
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "#1a1a22",
            color: tema.trim() ? "#fff" : "#444",
            border: "none",
            borderRadius: "8px",
            cursor: tema.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
            letterSpacing: "-0.2px",
          }}
        >
          Generar script &rarr;
        </button>
        <div style={{ fontSize: "10px", color: "#333" }}>
          Por ahora es solo UI — el backend se conecta despu&eacute;s.
        </div>
      </div>
    </div>
  );
}
