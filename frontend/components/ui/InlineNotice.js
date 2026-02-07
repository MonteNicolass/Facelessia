export default function InlineNotice({ children, variant = "info" }) {
  const styles = {
    info: { color: "var(--accent)", bg: "var(--accent-muted)", border: "var(--accent-border)" },
    success: { color: "var(--success)", bg: "var(--success-muted)", border: "rgba(16,185,129,0.2)" },
    error: { color: "var(--danger)", bg: "var(--danger-muted)", border: "rgba(239,68,68,0.2)" },
    warning: { color: "var(--warning)", bg: "var(--warning-muted)", border: "rgba(245,158,11,0.2)" },
  };

  const s = styles[variant] || styles.info;

  return (
    <div
      style={{
        fontSize: "12px",
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
