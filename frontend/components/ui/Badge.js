export default function Badge({ children, color = "var(--accent)", style: extraStyle }) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        background: `${color}12`,
        color: color,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${color}18`,
        lineHeight: "18px",
        display: "inline-block",
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}
