"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pipelineSteps } from "@/data/mock";

// Navegación vertical del pipeline — siempre visible en sidebar
export default function PipelineNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {/* Link a overview */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          borderRadius: "8px",
          textDecoration: "none",
          background: pathname === "/" ? "#ffffff08" : "transparent",
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            background: pathname === "/" ? "#ffffff12" : "#ffffff06",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: pathname === "/" ? "#e5e5e5" : "#555",
          }}
        >
          ~
        </span>
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: pathname === "/" ? "#e5e5e5" : "#666",
            }}
          >
            Overview
          </div>
        </div>
      </Link>

      {/* Separador */}
      <div
        style={{
          height: "1px",
          background: "#1a1a22",
          margin: "6px 12px",
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: "9px",
          fontWeight: 700,
          color: "#333",
          padding: "2px 12px 6px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Pipeline
      </div>

      {/* Steps */}
      {pipelineSteps.map((step, i) => {
        const isActive = pathname === step.href;

        return (
          <div key={step.id} style={{ position: "relative" }}>
            {/* Línea conectora */}
            {i < pipelineSteps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: "25px",
                  top: "40px",
                  width: "1px",
                  height: "12px",
                  background: "#1a1a22",
                }}
              />
            )}

            <Link
              href={step.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                background: isActive ? `${step.color}10` : "transparent",
                borderLeft: isActive
                  ? `2px solid ${step.color}`
                  : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {/* Step number */}
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: isActive ? `${step.color}20` : "#ffffff06",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isActive ? step.color : "#444",
                  border: isActive
                    ? `1px solid ${step.color}40`
                    : "1px solid transparent",
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </span>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isActive ? step.color : "#666",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {step.label}
                  {step.isKey && (
                    <span
                      style={{
                        fontSize: "8px",
                        background: `${step.color}20`,
                        color: step.color,
                        padding: "1px 5px",
                        borderRadius: "3px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      KEY
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: isActive ? "#555" : "#333",
                    marginTop: "1px",
                  }}
                >
                  {step.subtitle}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
