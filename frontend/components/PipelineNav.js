"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Navigation data ─────────────────────────────────────────────── */

const NAV = [
  {
    id: "overview",
    label: "Overview",
    href: "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

const TOOLS = [
  {
    id: "autovideos",
    label: "AutoVideos",
    desc: "Wizard de video",
    href: "/autovideos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    id: "director",
    label: "Director",
    desc: "Mapa editorial",
    href: "/director",
    isKey: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
];

const BOTTOM = [
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

/* ── NavItem component ───────────────────────────────────────────── */

function NavItem({ item, isActive }) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        padding: "8px var(--sp-3)",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        background: isActive ? "var(--accent-muted)" : "transparent",
        transition: "all var(--transition-fast)",
        position: "relative",
        marginBottom: "2px",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "var(--panel-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div style={{
          position: "absolute",
          left: 0,
          top: "6px",
          bottom: "6px",
          width: "2px",
          borderRadius: "var(--radius-full)",
          background: "var(--accent)",
          transition: "opacity var(--transition-fast)",
        }} />
      )}

      {/* Icon */}
      <span
        style={{
          color: isActive ? "var(--accent)" : "var(--dim)",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          transition: "color var(--transition-fast)",
        }}
      >
        {item.icon}
      </span>

      {/* Label + description */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            color: isActive ? "var(--text)" : "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color var(--transition-fast), font-weight var(--transition-fast)",
          }}
        >
          {item.label}
          {item.isKey && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                background: "var(--accent-muted)",
                color: "var(--accent)",
                padding: "1px 6px",
                borderRadius: "var(--radius-sm)",
                lineHeight: "14px",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                border: "1px solid var(--accent-border)",
              }}
            >
              PRO
            </span>
          )}
        </div>
        {item.desc && (
          <div style={{
            fontSize: "11px",
            color: "var(--dim)",
            marginTop: "1px",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.1px",
          }}>
            {item.desc}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── PipelineNav ─────────────────────────────────────────────────── */

export default function PipelineNav() {
  const pathname = usePathname();

  const isActive = (item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <nav style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      gap: "2px",
    }}>
      {/* Main + Tools groups */}
      <div style={{ flex: 1 }}>
        {/* NAV group */}
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}

        {/* Tools section header */}
        <div style={{
          fontSize: "10px",
          fontWeight: 600,
          color: "var(--dim)",
          padding: "var(--sp-5) var(--sp-3) var(--sp-2)",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          fontFamily: "var(--font-body)",
        }}>
          Herramientas
        </div>

        {/* TOOLS group */}
        {TOOLS.map((item) => (
          <NavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}
      </div>

      {/* Bottom group */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "var(--sp-2)",
        marginTop: "var(--sp-2)",
      }}>
        {BOTTOM.map((item) => (
          <NavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}
      </div>
    </nav>
  );
}
