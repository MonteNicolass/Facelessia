"use client";

import Badge from "@/components/ui/Badge";

export default function Topbar({ title, badge, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        marginBottom: "var(--sp-6)",
        flexWrap: "wrap",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "24px",
          color: "var(--text)",
          lineHeight: 1.15,
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      {badge && <Badge color="muted">{badge}</Badge>}
      <div style={{ flex: 1 }} />
      {children}
    </div>
  );
}
