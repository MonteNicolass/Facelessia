"use client";

export default function Table({ columns, data, style: extraStyle }) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        ...extraStyle,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "var(--sp-2) var(--sp-3)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: "var(--panel)",
                  borderBottom: "1px solid var(--border-subtle)",
                  whiteSpace: "nowrap",
                  width: col.width || "auto",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              style={{
                borderBottom:
                  rowIndex < data.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
                transition: "background var(--transition-fast)",
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "var(--sp-2) var(--sp-3)",
                    color: "var(--text-secondary)",
                    verticalAlign: "middle",
                    lineHeight: 1.5,
                    width: col.width || "auto",
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
