"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import AIProviderCard from "@/components/AIProviderCard";
import Card from "@/components/ui/Card";
import { AI_PROVIDERS, hasRequiredAIs } from "@/lib/aiProvidersConfig";

export default function AISettingsPage() {
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    setSystemReady(hasRequiredAIs());
  }, []);

  // Separar providers obligatorios y opcionales
  const requiredProviders = AI_PROVIDERS.filter((p) => p.required);
  const optionalProviders = AI_PROVIDERS.filter((p) => !p.required);

  return (
    <div style={{ maxWidth: 900 }}>
      <Topbar title="Conectar IAs" badge="BYOAI" />

      {/* System Status */}
      <Card
        style={{
          marginBottom: "var(--sp-6)",
          padding: "var(--sp-4) var(--sp-5)",
          background: systemReady
            ? "color-mix(in srgb, var(--success) 5%, var(--panel))"
            : "color-mix(in srgb, var(--danger) 5%, var(--panel))",
          borderColor: systemReady
            ? "color-mix(in srgb, var(--success) 20%, transparent)"
            : "color-mix(in srgb, var(--danger) 20%, transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: systemReady ? "var(--success)" : "var(--danger)",
              boxShadow: systemReady
                ? "0 0 12px rgba(90, 154, 107, 0.6)"
                : "0 0 12px rgba(201, 71, 59, 0.6)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: systemReady ? "var(--success)" : "var(--danger)",
                marginBottom: "var(--sp-1)",
              }}
            >
              {systemReady ? "Sistema listo para usar" : "Celeste bloqueado"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {systemReady
                ? "Todas las IAs obligatorias están conectadas. Podés usar Studio y Director."
                : "Conectá Claude para empezar a usar Celeste. Las demás IAs son opcionales."}
            </div>
          </div>
        </div>
      </Card>

      {/* Providers obligatorios */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "var(--sp-3)",
          }}
        >
          IAs Obligatorias
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          {requiredProviders.map((provider) => (
            <AIProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>

      {/* Providers opcionales */}
      <div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "var(--sp-3)",
          }}
        >
          IAs Opcionales
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--sp-3)" }}>
          {optionalProviders.map((provider) => (
            <AIProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>

      {/* Footer info */}
      <Card
        style={{
          marginTop: "var(--sp-8)",
          padding: "var(--sp-3) var(--sp-4)",
          background: "var(--panel-2)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-secondary)" }}>BYOAI (Bring Your Own AI):</strong> Celeste
          no almacena tus keys en servidores externos. Todo se guarda en localStorage de tu navegador.
          Conectás tus propias cuentas de IA y pagás directo a cada proveedor según tu uso.
        </div>
      </Card>
    </div>
  );
}
