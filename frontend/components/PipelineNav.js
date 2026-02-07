"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/", color: "#888", icon: "~" },
];

const TOOLS = [
  {
    id: "autovideos",
    label: "AutoVideos",
    subtitle: "Wizard de video",
    href: "/autovideos",
    color: "#8b5cf6",
    icon: "AV",
  },
  {
    id: "director",
    label: "Director",
    subtitle: "Mapa editorial",
    href: "/director",
    color: "#ec4899",
    icon: "ED",
    isKey: true,
  },
];

const BOTTOM = [
  { id: "settings", label: "Settings", href: "/settings", color: "#555", icon: "\u2699" },
];

function NavLink({ item, isActive }) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "8px",
        textDecoration: "none",
        background: isActive ? `${item.color}10` : "transparent",
        borderLeft: isActive ? `2px solid ${item.color}` : "2px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <span
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          background: isActive ? `${item.color}20` : "#ffffff06",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 700,
          color: isActive ? item.color : "#444",
          border: isActive ? `1px solid ${item.color}40` : "1px solid transparent",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: isActive ? item.color : "#666",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {item.label}
          {item.isKey && (
            <span
              style={{
                fontSize: "8px",
                background: `${item.color}20`,
                color: item.color,
                padding: "1px 5px",
                borderRadius: "3px",
                fontWeight: 700,
              }}
            >
              KEY
            </span>
          )}
        </div>
        {item.subtitle && (
          <div style={{ fontSize: "10px", color: isActive ? "#555" : "#333", marginTop: "1px" }}>
            {item.subtitle}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PipelineNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.id} item={item} isActive={pathname === item.href} />
        ))}

        <div style={{ height: "1px", background: "#1a1a22", margin: "8px 12px" }} />

        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#333",
            padding: "2px 12px 8px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          Herramientas
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {TOOLS.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </div>
      </div>

      <div>
        <div style={{ height: "1px", background: "#1a1a22", margin: "8px 12px" }} />
        {BOTTOM.map((item) => (
          <NavLink key={item.id} item={item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}
