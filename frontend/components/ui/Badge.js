"use client";

export default function Badge({
  children,
  color = "var(--accent)",
  style: extraStyle,
}) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        color: color,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid color-mix(in srgb, ${color} 18%, transparent)`,
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
