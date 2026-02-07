"use client";

const STEP_COLORS = {
  completed: "var(--accent)",
  active: "var(--accent)",
  pending: "var(--border)",
};

export default function Stepper({ steps, current, style: extraStyle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-1)",
        ...extraStyle,
      }}
    >
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const status = stepNum < current ? "completed" : stepNum === current ? "active" : "pending";
        const color = STEP_COLORS[status];
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id || i} style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)" }}>
            {/* Circle */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: status === "active"
                  ? "var(--accent)"
                  : status === "completed"
                  ? "color-mix(in srgb, var(--accent) 20%, transparent)"
                  : "var(--panel-2)",
                border: `1.5px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: status === "active" ? "#fff" : status === "completed" ? "var(--accent)" : "var(--dim)",
                transition: "all var(--transition-fast)",
                flexShrink: 0,
              }}
            >
              {status === "completed" ? "\u2713" : stepNum}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: status === "active" ? 600 : 400,
                color: status === "pending" ? "var(--dim)" : "var(--text-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>

            {/* Connector */}
            {!isLast && (
              <div
                style={{
                  width: 20,
                  height: 1,
                  background: stepNum < current ? "var(--accent)" : "var(--border)",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
