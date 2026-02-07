export default function Divider({ style: extraStyle }) {
  return (
    <div
      style={{
        height: "1px",
        background: "var(--border)",
        margin: "var(--sp-3) 0",
        ...extraStyle,
      }}
    />
  );
}
