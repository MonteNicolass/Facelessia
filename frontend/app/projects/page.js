"use client";

export const dynamic = "force-dynamic";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export default function ProjectsPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const projects = state.projects || [];

  function handleLoad(id) {
    dispatch({ type: "LOAD_PROJECT", payload: id });
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      router.push(proj.mode === "studio" ? "/studio" : "/director");
    }
  }

  function handleDelete(id) {
    dispatch({ type: "DELETE_PROJECT", payload: id });
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <Topbar title="Projects" badge={`${projects.length}`} />

      {projects.length === 0 ? (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
          title="Sin proyectos"
          description="Los proyectos guardados desde Studio o Director van a aparecer aca."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {projects.map((p) => (
            <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-3) var(--sp-4)" }}>
              <Badge color={p.mode === "studio" ? "accent" : "warning"}>
                {p.mode === "studio" ? "STD" : "DIR"}
              </Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </div>
                <div style={{ fontSize: "10px", color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                  {new Date(p.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  {p.updatedAt && ` — mod. ${new Date(p.updatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleLoad(p.id)}>
                Abrir
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                Eliminar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
