"use client";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  size = "md",
  style: extraStyle,
  type = "button",
  ...rest
}) {
  const base = {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    border: "1px solid transparent",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all var(--transition-fast)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--sp-2)",
    opacity: disabled ? 0.35 : 1,
    whiteSpace: "nowrap",
    lineHeight: 1,
    letterSpacing: "0.01em",
  };

  const sizes = {
    sm: { padding: "5px 10px", fontSize: "11px" },
    md: { padding: "8px 16px", fontSize: "12px" },
    lg: { padding: "10px 20px", fontSize: "13px" },
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
      color: "var(--text-secondary)",
      borderColor: "transparent",
    },
    danger: {
      background: "var(--danger-muted)",
      color: "var(--danger)",
      borderColor: "rgba(201,71,59,0.22)",
    },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...rest}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
    >
      {children}
    </button>
  );
}
