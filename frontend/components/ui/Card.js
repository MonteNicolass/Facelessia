// Card contenedora reutilizable
export default function Card({
  children,
  highlight = false,
  color = "#1a1a22",
  style: extraStyle,
}) {
  return (
    <div
      style={{
        background: highlight ? `${color}08` : "#0e0e12",
        border: `1px solid ${highlight ? `${color}30` : "#141418"}`,
        borderRadius: "10px",
        padding: "16px 20px",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}
