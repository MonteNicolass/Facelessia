"use client";

export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  style: extraStyle,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%",
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--sp-2) var(--sp-3)",
        fontSize: "13px",
        color: "var(--text)",
        fontFamily: "inherit",
        outline: "none",
        transition: "border-color var(--transition-fast)",
        opacity: disabled ? 0.5 : 1,
        ...extraStyle,
      }}
    />
  );
}
