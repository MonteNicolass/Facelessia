"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const GEN_STEPS = [
  { href: "/generator/input", label: "Input", step: 0 },
  { href: "/generator/script", label: "Script", step: 1 },
  { href: "/generator/assets", label: "Assets", step: 2 },
  { href: "/generator/assemble", label: "Assemble", step: 3 },
  { href: "/generator/output", label: "Output", step: 4 },
];

/* SVG icon paths */
const ICONS = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4",
  gen: "M13 10V3L4 14h7v7l9-11h-7z",
  dir: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
  runs: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useStore();
  const genStep = state.generator.step;
  const recentRuns = state.runs.slice(0, 3);

  const isActive = (href) => pathname === href;
  const isGenSection = pathname.startsWith("/generator");

  return (
    <nav style={{ display: "flex", flexDirection: "column", height: "100%", padding: "var(--sp-3) 0" }}>
      {/* Home */}
      <NavItem href="/" active={isActive("/")} icon={ICONS.home} label="Home" />

      {/* Generator section */}
      <SectionLabel>Generator</SectionLabel>
      {GEN_STEPS.map((s) => (
        <NavItem
          key={s.href}
          href={s.href}
          active={isActive(s.href)}
          label={s.label}
          indent
          stepNum={s.step + 1}
          stepDone={isGenSection && genStep > s.step}
          stepCurrent={isGenSection && genStep === s.step}
        />
      ))}

      {/* Director */}
      <SectionLabel>Editor</SectionLabel>
      <NavItem href="/director" active={isActive("/director")} icon={ICONS.dir} label="Director" />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Recent runs */}
      {recentRuns.length > 0 && (
        <>
          <SectionLabel>Recent Runs</SectionLabel>
          {recentRuns.map((run) => (
            <NavItem
              key={run.id}
              href={`/runs/${run.id}`}
              active={pathname === `/runs/${run.id}`}
              label={run.name || (run.type === "generator" ? "Generator" : "Director")}
              small
              meta={new Date(run.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
            />
          ))}
        </>
      )}
    </nav>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: "10px",
      fontWeight: 600,
      color: "var(--dim)",
      textTransform: "uppercase",
      letterSpacing: "1px",
      padding: "var(--sp-4) var(--sp-4) var(--sp-1)",
      fontFamily: "var(--font-body)",
    }}>
      {children}
    </div>
  );
}

function NavItem({ href, active, icon, label, indent, stepNum, stepDone, stepCurrent, small, meta }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-2)",
        padding: `6px var(--sp-4)`,
        paddingLeft: indent ? "var(--sp-6)" : "var(--sp-4)",
        fontSize: small ? "11px" : "12px",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--accent)" : "var(--text-secondary)",
        textDecoration: "none",
        borderRadius: "var(--radius-sm)",
        margin: "0 var(--sp-2)",
        background: active ? "var(--accent-muted)" : "transparent",
        transition: "background var(--transition-fast), color var(--transition-fast)",
        position: "relative",
      }}
    >
      {/* Active indicator */}
      {active && (
        <span style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "3px",
          height: "16px",
          background: "var(--accent)",
          borderRadius: "0 2px 2px 0",
        }} />
      )}

      {/* Icon or step number */}
      {icon && <Icon d={icon} />}
      {stepNum != null && (
        <span style={{
          width: 18,
          height: 18,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "var(--font-mono)",
          borderRadius: "var(--radius-full)",
          background: stepDone
            ? "var(--success-muted)"
            : stepCurrent
            ? "var(--accent-muted)"
            : "transparent",
          color: stepDone
            ? "var(--success)"
            : stepCurrent
            ? "var(--accent)"
            : "var(--dim)",
          border: stepDone || stepCurrent ? "none" : "1px solid var(--border)",
          flexShrink: 0,
        }}>
          {stepDone ? "\u2713" : stepNum}
        </span>
      )}

      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>

      {meta && (
        <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
          {meta}
        </span>
      )}
    </Link>
  );
}
