"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function HomePage() {
  const { state, dispatch } = useStore();
  const projects = state.projects || [];

  return (
    <div style={{ maxWidth: 720 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "var(--sp-10)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            lineHeight: 1.1,
            color: "var(--accent)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          CELESTE
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--text-secondary)",
            margin: "var(--sp-2) 0 0",
            lineHeight: 1.6,
          }}
        >
          Editor-first faceless video pipeline
        </p>
      </div>

      {/* ── Product Cards Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--sp-4)",
          marginBottom: "var(--sp-10)",
        }}
      >
        {/* AI Video Studio */}
        <ProductCard
          href="/studio"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          title="AI Video Studio"
          description="Pipeline completo: gener&aacute; guiones, prompts visuales, casting y metadata para videos faceless"
          buttonLabel="Abrir Studio"
        />

        {/* Editing Director */}
        <ProductCard
          href="/director"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
          }
          title="Editing Director"
          description="Peg&aacute; tu gui&oacute;n y obten&eacute; timestamps, motions, b-roll, SFX y transiciones &mdash; listo para editar"
          buttonLabel="Abrir Director"
        />
      </div>

      {/* ── Recent Projects ── */}
      <div>
        {projects.length > 0 ? (
          <>
            <SectionHeader title="Proyectos Recientes" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-2)",
              }}
            >
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onDelete={() =>
                    dispatch({ type: "DELETE_PROJECT", payload: project.id })
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <SectionHeader title="Proyectos Recientes" />
            <EmptyState
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
                </svg>
              }
              title="Sin proyectos"
              description="Tus proyectos guardados aparecer&aacute;n ac&aacute;"
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({ href, icon, title, description, buttonLabel }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <Card
        style={{
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          borderColor: hovered ? "var(--accent-border)" : undefined,
          boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: "var(--accent-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--sp-4)",
          }}
        >
          {icon}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "16px",
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            color: "var(--text)",
            marginBottom: "var(--sp-2)",
          }}
        >
          {title}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            margin: "0 0 var(--sp-5)",
            flex: 1,
          }}
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {/* Button */}
        <div>
          <Button variant="primary" size="md">
            {buttonLabel}
          </Button>
        </div>
      </Card>
    </Link>
  );
}

/* ── Project Row ── */
function ProjectRow({ project, onDelete }) {
  const typeBadgeColor = project.type === "studio" ? "accent" : "warning";
  const typeLabel = project.type === "studio" ? "Studio" : "Director";

  return (
    <Card
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        padding: "var(--sp-3) var(--sp-4)",
      }}
    >
      {/* Type badge */}
      <Badge color={typeBadgeColor}>{typeLabel}</Badge>

      {/* Name */}
      <span
        style={{
          flex: 1,
          fontSize: "13px",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          color: "var(--text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {project.name}
      </span>

      {/* Date */}
      <span
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-body)",
          color: "var(--dim)",
          flexShrink: 0,
        }}
      >
        {new Date(project.createdAt).toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        style={{ color: "var(--danger)" }}
      >
        Eliminar
      </Button>
    </Card>
  );
}
