"use client";

export default function Card({
  children,
  highlight = false,
  color,
  style: extraStyle,
  ...rest
}) {
  const isHighlighted = highlight && color;

  return (
    <div
      {...rest}
      style={{
        background: isHighlighted
          ? `color-mix(in srgb, ${color} 4%, var(--panel))`
          : "var(--panel)",
        border: isHighlighted
          ? `1px solid color-mix(in srgb, ${color} 15%, transparent)`
          : "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--sp-4) var(--sp-5)",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}
