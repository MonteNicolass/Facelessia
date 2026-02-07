"use client";

export default function Card({
  children,
  accent = false,
  highlight = false,
  color,
  padding,
  style: extraStyle,
  ...rest
}) {
  const isHighlighted = (highlight && color) || accent;

  return (
    <div
      {...rest}
      style={{
        background: highlight && color
          ? `color-mix(in srgb, ${color} 4%, var(--panel))`
          : "var(--panel)",
        border: accent
          ? "1px solid var(--accent-border)"
          : highlight && color
          ? `1px solid color-mix(in srgb, ${color} 15%, transparent)`
          : "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: padding || "var(--sp-4) var(--sp-5)",
        transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}
