"use client";

export default function Textarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  disabled = false,
  style: extraStyle,
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{
        width: "100%",
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--sp-3)",
        fontSize: "13px",
        color: "var(--text)",
        fontFamily: "inherit",
        outline: "none",
        resize: "vertical",
        lineHeight: 1.6,
        transition: "border-color var(--transition-fast)",
        opacity: disabled ? 0.5 : 1,
        ...extraStyle,
      }}
    />
  );
}
