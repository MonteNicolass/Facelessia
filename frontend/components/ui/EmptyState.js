"use client";

export default function EmptyState({ children, icon }) {
  return (
    <div
      style={{
        padding: "var(--sp-10) var(--sp-6)",
        textAlign: "center",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-2)",
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: "20px",
            color: "var(--dim)",
            marginBottom: "var(--sp-1)",
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: "13px",
          fontFamily: "var(--font-body)",
          color: "var(--muted)",
          lineHeight: 1.6,
          maxWidth: "320px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
