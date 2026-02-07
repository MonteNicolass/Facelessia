"use client";

import StepHeader from "@/components/StepHeader";
import { mockScript, mockEDL } from "@/data/mock";

// Output — resultado final + checklist para el editor
export default function OutputPage() {
  const script = mockScript;
  const edl = mockEDL;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "760px" }}>
      <StepHeader
        step="04"
        color="#10b981"
        title="Output"
        description="Video generado con motions aplicados + reporte de edición. Solo falta agregar b-roll y SFX."
      />

      {/* Video placeholder */}
      <div
        style={{
          background: "#0a0a0e",
          border: "1px solid #141418",
          borderRadius: "10px",
          aspectRatio: "9 / 16",
          maxHeight: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#10b98115",
            border: "1px solid #10b98130",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            marginBottom: "12px",
          }}
        >
          &#9654;
        </div>
        <div
          style={{ fontSize: "13px", fontWeight: 600, color: "#666" }}
        >
          video_final.mp4
        </div>
        <div
          style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}
        >
          1080 &times; 1920 &middot; {script.duracion_total}s &middot; {script.segmentos.length} segmentos
        </div>
      </div>

      {/* Archivos generados */}
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
        Archivos generados
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "32px",
        }}
      >
        {[
          {
            name: "video_final.mp4",
            desc: "Video con motions aplicados",
            color: "#10b981",
            size: "~12 MB",
          },
          {
            name: "reporte_edicion.txt",
            desc: "Guía de edición legible",
            color: "#ec4899",
            size: "~4 KB",
          },
          {
            name: "edl.json",
            desc: "EDL en formato máquina",
            color: "#8b5cf6",
            size: "~8 KB",
          },
          {
            name: "script.json",
            desc: "Guión completo",
            color: "#6366f1",
            size: "~3 KB",
          },
          {
            name: `${script.segmentos.length} imágenes`,
            desc: "Fondos generados (DALL-E)",
            color: "#f59e0b",
            size: `~${script.segmentos.length * 2} MB`,
          },
          {
            name: "narracion_completa.mp3",
            desc: "Audio narración",
            color: "#ef4444",
            size: "~1 MB",
          },
        ].map((file, i) => (
          <div
            key={i}
            style={{
              background: "#0e0e12",
              border: "1px solid #141418",
              borderRadius: "8px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: file.color,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#999",
                }}
              >
                {file.name}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#444",
                  marginTop: "1px",
                }}
              >
                {file.desc}
              </div>
            </div>
            <span style={{ fontSize: "9px", color: "#333" }}>
              {file.size}
            </span>
          </div>
        ))}
      </div>

      {/* Checklist del editor */}
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
        Checklist del editor
      </div>

      <div
        style={{
          background: "#0e0e12",
          border: "1px solid #141418",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {[
            {
              text: `Descargar el video (${script.duracion_total}s con motions)`,
              detail: "Importar a CapCut / Premiere como base",
            },
            {
              text: `Buscar ${edl.broll_shopping_list.length} clips de b-roll`,
              detail: "Pexels, Pixabay o tu librería personal",
            },
            {
              text: `Descargar ${edl.sfx_shopping_list.length} SFX`,
              detail: "Freesound, Epidemic Sound o tu librería",
            },
            {
              text: "Seguir el reporte de edición",
              detail: "Timestamps exactos para cada inserción",
            },
            {
              text: "Ajustar color grading",
              detail: "Frío para los primeros 4 segmentos, cálido para el cierre",
            },
            {
              text: "Exportar y publicar",
              detail: "9:16, 1080x1920, 30fps",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              {/* Checkbox visual */}
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "4px",
                  border: "1px solid #333",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    fontWeight: 600,
                  }}
                >
                  {item.text}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#444",
                    marginTop: "2px",
                  }}
                >
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de descarga (mock) */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          style={{
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "inherit",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            letterSpacing: "-0.2px",
          }}
        >
          Descargar video
        </button>
        <button
          style={{
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "inherit",
            background: "#0e0e12",
            color: "#888",
            border: "1px solid #1a1a22",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Descargar reporte
        </button>
        <button
          style={{
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "inherit",
            background: "#0e0e12",
            color: "#888",
            border: "1px solid #1a1a22",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Descargar todo (.zip)
        </button>
      </div>

      <div style={{ fontSize: "10px", color: "#333", marginTop: "16px" }}>
        Botones no funcionales a&uacute;n &middot; Se conectan con el backend despu&eacute;s
      </div>
    </div>
  );
}
