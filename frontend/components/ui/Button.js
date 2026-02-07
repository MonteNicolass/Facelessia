// Botón base reutilizable
export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  size = "md",
  style: extraStyle,
}) {
  const base = {
    fontFamily: "inherit",
    fontWeight: 700,
    border: "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s",
    letterSpacing: "-0.2px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    opacity: disabled ? 0.4 : 1,
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "11px" },
    md: { padding: "10px 18px", fontSize: "12px" },
    lg: { padding: "12px 24px", fontSize: "13px" },
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      color: "#fff",
    },
    secondary: {
      background: "#111116",
      color: "#888",
      border: "1px solid #1a1a22",
    },
    ghost: {
      background: "transparent",
      color: "#666",
    },
    danger: {
      background: "#ef444420",
      color: "#ef4444",
      border: "1px solid #ef444430",
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
    >
      {children}
    </button>
  );
}
