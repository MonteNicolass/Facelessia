"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function HomePage() {
  const { state, dispatch } = useStore();
  const projects = state.projects || [];

  return (
    <div style={{ maxWidth: 780 }}>
      <Topbar title="Overview" badge="v0.8" />

      {/* Product cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-4)", marginBottom: "var(--sp-10)" }}>
        <ProductCard
          href="/studio"
          title="AI Video Studio"
          description="Genera paquetes completos: guion, prompts visuales, casting y metadata para videos faceless."
          buttonLabel="Abrir Studio"
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <ProductCard
          href="/director"
          title="Director Pro"
          description="Pega tu guion y obtene timestamps, motions, b-roll, SFX — listo para editar."
          buttonLabel="Abrir Director"
          icon="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
        />
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--sp-3)" }}>
            Proyectos Recientes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {projects.slice(0, 5).map((p) => (
              <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-3) var(--sp-4)" }}>
                <Badge color={p.type === "studio" ? "accent" : "warning"}>{p.type === "studio" ? "STD" : "DIR"}</Badge>
                <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                  {p.name}
                </span>
                <span style={{ fontSize: "11px", color: "var(--dim)", flexShrink: 0 }}>
                  {new Date(p.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </span>
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "DELETE_PROJECT", payload: p.id })} style={{ color: "var(--danger)" }}>
                  Eliminar
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div style={{ padding: "var(--sp-10) var(--sp-6)", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-raised)" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--sp-2)" }}>Sin proyectos</div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Tus proyectos guardados apareceran aca</div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ href, title, description, buttonLabel, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <Card
        style={{
          cursor: "pointer", display: "flex", flexDirection: "column", height: "100%",
          borderColor: hovered ? "var(--accent-border)" : undefined,
          boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--sp-4)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
        <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "var(--sp-2)" }}>{title}</div>
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)", margin: "0 0 var(--sp-5)", flex: 1 }}>{description}</p>
        <div><Button variant="primary" size="md">{buttonLabel}</Button></div>
      </Card>
    </Link>
  );
}
