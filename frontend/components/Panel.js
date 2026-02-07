"use client";

export default function Panel({ title, children, style: extraStyle, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--sp-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-4)",
        ...extraStyle,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
