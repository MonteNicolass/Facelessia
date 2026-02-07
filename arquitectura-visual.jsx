import { useState } from "react";

const modules = [
  {
    id: "input",
    title: "📝 Input",
    subtitle: "Tu idea",
    desc: "Escribís un tema como: '5 hábitos que te arruinan la vida'. Elegís duración, estilo y tono.",
    color: "#6366f1",
    x: 50,
    examples: ["Tema del video", "Duración (30/60/90s)", "Estilo visual", "Tono de voz"]
  },
  {
    id: "script",
    title: "🧠 Script Generator",
    subtitle: "GPT-4o / Claude",
    desc: "La IA genera un guión completo con timestamps, texto de narración, prompts visuales para cada escena, y sugerencias de motion/b-roll/SFX.",
    color: "#8b5cf6",
    x: 50,
    examples: ["Narración en español argentino", "Visual prompts en inglés", "Timestamps precisos", "JSON estructurado"]
  },
  {
    id: "edl",
    title: "🎬 Editing Director",
    subtitle: "GPT-4o analiza",
    desc: "Analiza el guión como un editor profesional. Te dice EXACTAMENTE dónde poner cada motion, dónde insertar b-roll, qué SFX usar y cuándo.",
    color: "#ec4899",
    x: 50,
    examples: [
      "Motion: zoom_in lento 1.0x→1.15x",
      "B-roll [0:03-0:05]: 'sugar coffee close-up'",
      "SFX [0:00]: whoosh suave",
      "Transición: crossfade 0.5s"
    ]
  },
  {
    id: "assets",
    title: "🎨 Asset Generator",
    subtitle: "DALL-E + ElevenLabs",
    desc: "Genera las imágenes con DALL-E 3 y la narración con ElevenLabs (o gTTS gratis). Todo automático basado en el script.",
    color: "#f59e0b",
    x: 50,
    examples: ["8 imágenes HD (1080x1920)", "Audio narración completo", "Audio por segmento", "~$0.40 total"]
  },
  {
    id: "video",
    title: "🎥 Video Assembler",
    subtitle: "MoviePy + ffmpeg",
    desc: "Ensambla todo: imágenes con Ken Burns effects (zoom, pan), audio sincronizado, transiciones. Exporta un .mp4 listo.",
    color: "#10b981",
    x: 50,
    examples: ["Ken Burns automático", "Crossfades entre escenas", "Audio sincronizado", "Export 1080x1920 MP4"]
  },
  {
    id: "output",
    title: "✅ Output",
    subtitle: "Video casi listo",
    desc: "Obtenés: el video con motions + un reporte que te dice exactamente qué b-roll buscar y dónde poner SFX. Solo falta eso.",
    color: "#ef4444",
    x: 50,
    examples: ["video_final.mp4", "reporte_edicion.txt", "Lista de b-roll", "Lista de SFX"]
  }
];

const Arrow = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    padding: "4px 0",
  }}>
    <svg width="24" height="28" viewBox="0 0 24 28">
      <line x1="12" y1="0" x2="12" y2="20" stroke="#555" strokeWidth="2" />
      <polygon points="6,18 12,26 18,18" fill="#555" />
    </svg>
  </div>
);

export default function FacelessAIArchitecture() {
  const [selected, setSelected] = useState(null);
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e5e5e5",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      padding: "24px 16px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{
          fontSize: "28px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #ff6b6b, #ffa500, #ff6b6b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "0 0 8px 0",
          letterSpacing: "-0.5px",
        }}>
          🎬 FacelessAI
        </h1>
        <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
          De una idea → a un video casi listo en minutos
        </p>
      </div>

      {/* Pipeline */}
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        {modules.map((mod, i) => (
          <div key={mod.id}>
            <div
              onClick={() => setSelected(selected === mod.id ? null : mod.id)}
              onMouseEnter={() => setHoveredModule(mod.id)}
              onMouseLeave={() => setHoveredModule(null)}
              style={{
                background: selected === mod.id 
                  ? `${mod.color}15` 
                  : hoveredModule === mod.id 
                    ? "#151520" 
                    : "#111118",
                border: `1px solid ${selected === mod.id ? mod.color : "#222"}`,
                borderRadius: "12px",
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: hoveredModule === mod.id ? "scale(1.01)" : "scale(1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: mod.color }}>
                    {mod.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                    {mod.subtitle}
                  </div>
                </div>
                <div style={{
                  background: mod.color,
                  color: "#000",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px",
                }}>
                  PASO {i + 1}
                </div>
              </div>

              {/* Expanded details */}
              {selected === mod.id && (
                <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #222" }}>
                  <p style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.6, margin: "0 0 12px 0" }}>
                    {mod.desc}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {mod.examples.map((ex, j) => (
                      <span key={j} style={{
                        background: `${mod.color}20`,
                        color: mod.color,
                        fontSize: "11px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${mod.color}30`,
                      }}>
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
      </div>

      {/* Cost Summary */}
      <div style={{
        maxWidth: "520px",
        margin: "28px auto 0",
        background: "#111118",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #222",
      }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#10b981", marginBottom: "12px" }}>
          💰 Costo por video (60s, ~8 segmentos)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { label: "Con DALL-E + ElevenLabs", cost: "~$0.40", color: "#f59e0b" },
            { label: "Modo gratis (placeholders + gTTS)", cost: "~$0.03", color: "#10b981" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#0a0a0f",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: item.color }}>
                {item.cost}
              </div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Feature */}
      <div style={{
        maxWidth: "520px",
        margin: "16px auto 0",
        background: "linear-gradient(135deg, #ec489920, #8b5cf620)",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #ec489940",
      }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#ec4899", marginBottom: "8px" }}>
          ⭐ La clave: Editing Director
        </div>
        <p style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.6, margin: 0 }}>
          Te genera un reporte detallado que te dice exactamente:<br/>
          • <strong style={{ color: "#f59e0b" }}>Dónde van los motions</strong> (zoom, pan, shake) y por qué<br/>
          • <strong style={{ color: "#6366f1" }}>Dónde insertar b-roll</strong> con timestamps y qué buscar<br/>
          • <strong style={{ color: "#10b981" }}>Qué SFX usar</strong> y en qué momento<br/>
          <br/>
          Vos solo buscás el b-roll + SFX = <strong style={{ color: "#ff6b6b" }}>video listo</strong> 🚀
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px", color: "#444", fontSize: "11px" }}>
        Hacé click en cada paso para ver detalles
      </div>
    </div>
  );
}
