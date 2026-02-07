"use client";

export default function EmptyState({ children, icon, title, description, action, style: extraStyle }) {
  return (
    <div
      style={{
        padding: "var(--sp-10) var(--sp-6)",
        textAlign: "center",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-raised)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-2)",
        ...extraStyle,
      }}
    >
      {icon && (
        <div style={{ fontSize: "24px", color: "var(--dim)", marginBottom: "var(--sp-1)" }}>
          {icon}
        </div>
      )}
      {title && (
        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
          {title}
        </div>
      )}
      {(description || children) && (
        <div style={{
          fontSize: "12px",
          fontFamily: "var(--font-body)",
          color: "var(--muted)",
          lineHeight: 1.6,
          maxWidth: 360,
        }}>
          {description || children}
        </div>
      )}
      {action && <div style={{ marginTop: "var(--sp-3)" }}>{action}</div>}
    </div>
  );
}
