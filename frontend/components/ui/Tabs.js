"use client";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "2px",
        background: "var(--bg)",
        padding: "3px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        width: "fit-content",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              background: isActive ? "var(--panel-2)" : "transparent",
              color: isActive ? "var(--text)" : "var(--muted)",
              border: isActive
                ? "1px solid var(--border)"
                : "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              lineHeight: 1,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: "10px",
                  color: isActive ? "var(--text-secondary)" : "var(--dim)",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
