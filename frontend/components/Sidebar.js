"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { type: "divider" },
  { type: "label", text: "Products" },
  { href: "/studio", label: "AI Video Studio", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/director", label: "Director", icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" },
  { type: "divider" },
  { href: "/projects", label: "Projects", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

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
  const recentProjects = state.projects.slice(0, 3);

  return (
    <nav style={{ display: "flex", flexDirection: "column", height: "100%", padding: "var(--sp-2) 0" }}>
      {NAV_ITEMS.map((item, i) => {
        if (item.type === "divider") {
          return <div key={`d-${i}`} style={{ height: 1, background: "var(--border-subtle)", margin: "var(--sp-2) var(--sp-4)" }} />;
        }
        if (item.type === "label") {
          return (
            <div key={`l-${i}`} style={{ fontSize: "10px", fontWeight: 600, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "1px", padding: "var(--sp-3) var(--sp-4) var(--sp-1)" }}>
              {item.text}
            </div>
          );
        }
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-2)",
              padding: "7px var(--sp-4)",
              margin: "1px var(--sp-2)",
              fontSize: "12px",
              fontWeight: active ? 600 : 400,
              color: active ? "var(--accent)" : "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: "var(--radius-sm)",
              background: active ? "var(--accent-muted)" : "transparent",
              transition: "background var(--transition-fast), color var(--transition-fast)",
              position: "relative",
            }}
          >
            {active && (
              <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 16, background: "var(--accent)", borderRadius: "0 2px 2px 0" }} />
            )}
            <Icon d={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      {recentProjects.length > 0 && (
        <>
          <div style={{ height: 1, background: "var(--border-subtle)", margin: "var(--sp-2) var(--sp-4)" }} />
          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "1px", padding: "var(--sp-2) var(--sp-4) var(--sp-1)" }}>
            Recent
          </div>
          {recentProjects.map((p) => (
            <Link
              key={p.id}
              href={p.mode === "studio" ? "/studio" : "/director"}
              onClick={() => {}}
              style={{ display: "block", padding: "4px var(--sp-4)", margin: "0 var(--sp-2)", fontSize: "11px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none" }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--dim)", marginRight: "var(--sp-1)" }}>
                {p.mode === "studio" ? "STD" : "DIR"}
              </span>
              {p.name}
            </Link>
          ))}
        </>
      )}
    </nav>
  );
}
