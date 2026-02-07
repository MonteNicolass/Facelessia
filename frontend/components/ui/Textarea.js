"use client";

export default function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  disabled = false,
  mono = true,
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
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...rest}
        style={{
          width: "100%",
          resize: "vertical",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
          fontSize: "12px",
          lineHeight: 1.75,
          color: "var(--text)",
          background: "var(--panel-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--sp-3) var(--sp-4)",
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
