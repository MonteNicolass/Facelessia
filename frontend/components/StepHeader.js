// Header reutilizable para cada paso del pipeline
export default function StepHeader({ step, color, title, description }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Badge del paso */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            background: `${color}15`,
            color: color,
            padding: "3px 10px",
            borderRadius: "4px",
            border: `1px solid ${color}25`,
            letterSpacing: "0.5px",
          }}
        >
          PASO {step}
        </span>
      </div>

      {/* Título */}
      <h1
        style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "#e5e5e5",
          margin: "0 0 6px 0",
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h1>

      {/* Descripción */}
      <p
        style={{
          fontSize: "13px",
          color: "#555",
          margin: 0,
          lineHeight: 1.6,
          maxWidth: "520px",
        }}
      >
        {description}
      </p>
    </div>
  );
}
