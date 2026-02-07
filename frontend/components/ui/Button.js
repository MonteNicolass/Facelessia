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
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    border: "1px solid transparent",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all var(--transition-base)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--sp-1)",
    opacity: disabled ? 0.35 : 1,
    whiteSpace: "nowrap",
    lineHeight: 1,
    letterSpacing: "0.01em",
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "8px 16px", fontSize: "13px" },
    lg: { padding: "10px 20px", fontSize: "14px" },
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--bg)",
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
      borderColor: "var(--danger-muted)",
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
