"use client";

const NAMED_COLORS = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  pink: "var(--pink)",
  muted: "var(--muted)",
};

export default function Badge({
  children,
  color = "var(--accent)",
  style: extraStyle,
}) {
  const resolved = NAMED_COLORS[color] || color;

  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
        background: `color-mix(in srgb, ${resolved} 10%, transparent)`,
        color: resolved,
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        border: `1px solid color-mix(in srgb, ${resolved} 18%, transparent)`,
        lineHeight: "18px",
        display: "inline-block",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}
