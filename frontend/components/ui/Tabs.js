"use client";

// Tabs minimalistas
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "3px",
        background: "#0a0a0e",
        padding: "3px",
        borderRadius: "8px",
        width: "fit-content",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "6px 16px",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "inherit",
            background: active === tab.id ? "#ec489915" : "transparent",
            color: active === tab.id ? "#ec4899" : "#555",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              style={{
                marginLeft: "5px",
                fontSize: "9px",
                color: active === tab.id ? "#ec489980" : "#333",
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
