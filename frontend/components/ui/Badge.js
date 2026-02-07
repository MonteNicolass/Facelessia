// Badge / tag pequeño
export default function Badge({ children, color = "#8b5cf6", style: extraStyle }) {
  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 700,
        background: `${color}18`,
        color: color,
        padding: "2px 8px",
        borderRadius: "4px",
        border: `1px solid ${color}25`,
        letterSpacing: "0.5px",
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}
