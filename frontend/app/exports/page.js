"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { getExports, deleteExport, clearExports } from "@/lib/storage";

export default function ExportsPage() {
  const [exports, setExports] = useState([]);

  useEffect(() => {
    setExports(getExports());
  }, []);

  function handleDelete(id) {
    const updated = deleteExport(id);
    setExports(updated);
  }

  function handleClear() {
    clearExports();
    setExports([]);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Topbar title="Exports" badge={`${exports.length}`}>
        {exports.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} style={{ color: "var(--danger)" }}>
            Limpiar Todo
          </Button>
        )}
      </Topbar>

      {exports.length === 0 ? (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          }
          title="Sin exports"
          description="Cuando exportes desde Studio o Director Pro, tus archivos apareceran aca."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {exports.map((exp) => (
            <Card key={exp.id} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-3) var(--sp-4)" }}>
              <Badge color={exp.type === "json" ? "accent" : exp.type === "csv" ? "warning" : "success"}>
                {exp.type.toUpperCase()}
              </Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {exp.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                  {exp.clipCount} clips
                  {exp.meta?.topic ? ` — ${exp.meta.topic.slice(0, 40)}` : ""}
                </div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--dim)", flexShrink: 0 }}>
                {new Date(exp.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(exp.id)} style={{ color: "var(--danger)" }}>
                Eliminar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
