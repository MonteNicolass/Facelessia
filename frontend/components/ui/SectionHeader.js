export default function SectionHeader({ title, subtitle, action, style }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "var(--sp-4)",
        gap: "var(--sp-4)",
        ...style,
      }}
    >
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "var(--sp-1)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
