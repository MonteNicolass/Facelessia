"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { isAIConnected, getAIValue, setAIValue } from "@/lib/aiProvidersConfig";

export default function AIProviderCard({ provider }) {
  const [value, setValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Cargar valor inicial desde localStorage
  useEffect(() => {
    const storedValue = getAIValue(provider.id);
    if (storedValue) {
      setValue(storedValue);
    }
    setConnected(isAIConnected(provider.id));
  }, [provider.id]);

  function handleSave() {
    if (provider.inputType === "toggle") {
      const newValue = !connected;
      setAIValue(provider.id, newValue ? "true" : "false");
      setConnected(newValue);
    } else {
      if (!value.trim()) return;
      setAIValue(provider.id, value);
      setConnected(true);
    }
  }

  function handleDisconnect() {
    setAIValue(provider.id, null);
    setValue("");
    setConnected(false);
    setShowKey(false);
  }

  function handleToggle() {
    if (provider.inputType === "toggle") {
      handleSave();
    }
  }

  return (
    <Card
      style={{
        padding: "var(--sp-4) var(--sp-5)",
        borderColor: connected
          ? "var(--accent-border)"
          : provider.required
          ? "rgba(201, 71, 59, 0.22)"
          : "var(--border)",
        background: connected
          ? "color-mix(in srgb, var(--accent) 3%, var(--panel))"
          : "var(--panel)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
              {provider.name}
            </h3>
            {provider.required && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: connected ? "var(--success)" : "var(--danger)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  background: connected
                    ? "color-mix(in srgb, var(--success) 12%, transparent)"
                    : "color-mix(in srgb, var(--danger) 12%, transparent)",
                  border: connected
                    ? "1px solid color-mix(in srgb, var(--success) 20%, transparent)"
                    : "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                }}
              >
                OBLIGATORIO
              </span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            {provider.description}
          </p>
        </div>

        {/* Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", marginLeft: "var(--sp-3)" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "var(--success)" : "var(--danger)",
              boxShadow: connected
                ? "0 0 8px rgba(90, 154, 107, 0.5)"
                : "0 0 8px rgba(201, 71, 59, 0.5)",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              color: connected ? "var(--success)" : "var(--danger)",
            }}
          >
            {connected ? "CONECTADO" : "NO CONECTADO"}
          </span>
        </div>
      </div>

      {/* Input section */}
      {provider.inputType === "toggle" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          <div
            onClick={handleToggle}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: connected ? "var(--accent)" : "var(--border)",
              position: "relative",
              cursor: "pointer",
              transition: "background var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: connected ? 23 : 3,
                transition: "left var(--transition-fast)",
              }}
            />
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {connected ? "Habilitado" : "Deshabilitado"}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginTop: "var(--sp-3)" }}>
          <Input
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={provider.placeholder}
            disabled={connected}
            mono
            style={{ fontSize: "11px" }}
          />
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
            {!connected ? (
              <>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={!value.trim()}>
                  Conectar
                </Button>
                {provider.docsUrl && (
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "10px",
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ¿Dónde conseguir la key? →
                  </a>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? "Ocultar" : "Ver key"}
                </Button>
                <Button variant="danger" size="sm" onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
