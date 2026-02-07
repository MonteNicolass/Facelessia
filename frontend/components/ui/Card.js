export default function Card({
  children,
  highlight = false,
  color,
  style: extraStyle,
}) {
  const bg = highlight && color ? `${color}06` : "var(--panel)";
  const border = highlight && color ? `${color}20` : "var(--border)";

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--sp-4) var(--sp-5)",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}
