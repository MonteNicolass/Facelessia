"use client";

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  mono = false,
  style: extraStyle,
  ...rest
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      {label && (
        <label style={{
          fontSize: "10px",
          fontWeight: 600,
          color: "var(--dim)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
        style={{
          width: "100%",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
          fontSize: "12px",
          color: "var(--text)",
          background: "var(--panel-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--sp-2) var(--sp-3)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color var(--transition-fast)",
          opacity: disabled ? 0.5 : 1,
          ...extraStyle,
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
