"use client";

export default function Tabs({ tabs, active, onChange, style: extraStyle }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--sp-1)",
        background: "var(--panel-2)",
        padding: "3px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        ...extraStyle,
      }}
    >
      {tabs.map((tab) => {
        const key = tab.value || tab.id;
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              flex: 1,
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              color: isActive ? "var(--accent)" : "var(--muted)",
              background: isActive ? "var(--panel)" : "transparent",
              border: isActive ? "1px solid var(--border)" : "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
