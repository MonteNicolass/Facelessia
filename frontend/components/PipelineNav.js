"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    id: "overview",
    label: "Overview",
    href: "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
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
        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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

function NavItem({ item, isActive }) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        background: isActive ? "var(--accent-muted)" : "transparent",
        transition: "all var(--transition-fast)",
      }}
    >
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
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            color: isActive ? "var(--text)" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {item.label}
          {item.isKey && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                background: "var(--accent-muted)",
                color: "var(--accent)",
                padding: "1px 5px",
                borderRadius: "var(--radius-sm)",
                lineHeight: "14px",
              }}
            >
              PRO
            </span>
          )}
        </div>
        {item.desc && (
          <div style={{ fontSize: "11px", color: "var(--dim)", marginTop: "1px" }}>
            {item.desc}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PipelineNav() {
  const pathname = usePathname();

  const isActive = (item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <nav style={{ display: "flex", flexDirection: "column", height: "100%", gap: "2px" }}>
      <div style={{ flex: 1 }}>
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}

        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--dim)",
            padding: "var(--sp-4) var(--sp-3) var(--sp-2)",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Herramientas
        </div>

        {TOOLS.map((item) => (
          <NavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--sp-2)" }}>
        {BOTTOM.map((item) => (
          <NavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}
      </div>
    </nav>
  );
}
