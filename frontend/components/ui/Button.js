"use client";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  size = "md",
  style: extraStyle,
  type = "button",
}) {
  const base = {
    fontFamily: "inherit",
    fontWeight: 600,
    border: "1px solid transparent",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all var(--transition-base)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    opacity: disabled ? 0.35 : 1,
    whiteSpace: "nowrap",
    lineHeight: 1,
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "8px 16px", fontSize: "13px" },
    lg: { padding: "10px 20px", fontSize: "14px" },
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
      borderColor: "var(--accent)",
    },
    secondary: {
      background: "var(--panel-2)",
      color: "var(--text-secondary)",
      borderColor: "var(--border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--muted)",
      borderColor: "transparent",
    },
    danger: {
      background: "var(--danger-muted)",
      color: "var(--danger)",
      borderColor: "rgba(239,68,68,0.15)",
    },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
    >
      {children}
    </button>
  );
}
