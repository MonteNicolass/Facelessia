"use client";

export default function InlineNotice({ children, variant = "info" }) {
  const styles = {
    info: {
      color: "var(--accent)",
      bg: "var(--accent-muted)",
      border: "var(--accent-border)",
    },
    success: {
      color: "var(--success)",
      bg: "var(--success-muted)",
      border: `color-mix(in srgb, var(--success) 20%, transparent)`,
    },
    error: {
      color: "var(--danger)",
      bg: "var(--danger-muted)",
      border: `color-mix(in srgb, var(--danger) 20%, transparent)`,
    },
    warning: {
      color: "var(--warning)",
      bg: "var(--warning-muted)",
      border: `color-mix(in srgb, var(--warning) 20%, transparent)`,
    },
  };

  const s = styles[variant] || styles.info;

  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: "var(--font-body)",
        color: s.color,
        padding: "var(--sp-2) var(--sp-3)",
        background: s.bg,
        borderRadius: "var(--radius-md)",
        border: `1px solid ${s.border}`,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
