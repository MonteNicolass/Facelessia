"use client";

import { useState, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";

const BROLL_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const MOTION_OPTIONS = [
  { value: "low", label: "Sutil" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Intensa" },
];

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const settings = state.settings;
  const [showSaved, setShowSaved] = useState(false);
  const savedTimer = useRef(null);

  const flashSaved = useCallback(() => {
    setShowSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setShowSaved(false), 1400);
  }, []);

  function updateSetting(payload) {
    dispatch({ type: "SET_SETTINGS", payload });
    flashSaved();
  }

  return (
    <div style={{ maxWidth: 600, position: "relative" }}>
      {/* ── Saved Toast ── */}
      {showSaved && (
        <div
          style={{
            position: "fixed",
            bottom: "var(--sp-6)",
            right: "var(--sp-6)",
            zIndex: 9999,
          }}
        >
          <Badge color="success" style={{ fontSize: "12px", padding: "4px 14px" }}>
            Guardado
          </Badge>
        </div>
      )}

      {/* ── Header ── */}
      <SectionHeader title="Settings" subtitle="Configuraci&oacute;n del editor" />

      {/* ── Settings Card ── */}
      <Card padding="var(--sp-6)">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-8)",
          }}
        >
          {/* ── WPM ── */}
          <SettingRow
            label="Velocidad de narraci&oacute;n"
            description={`${settings.wpm} palabras por minuto`}
          >
            <input
              type="range"
              min={100}
              max={250}
              step={5}
              value={settings.wpm}
              onChange={(e) => updateSetting({ wpm: Number(e.target.value) })}
              style={{
                width: "100%",
                accentColor: "var(--accent)",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--dim)",
                marginTop: "var(--sp-1)",
              }}
            >
              <span>100</span>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontSize: "13px",
                }}
              >
                {settings.wpm}
              </span>
              <span>250</span>
            </div>
          </SettingRow>

          {/* ── B-Roll Density ── */}
          <SettingRow label="Densidad de B-Roll">
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {BROLL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  active={settings.brollDensity === opt.value}
                  onClick={() => updateSetting({ brollDensity: opt.value })}
                />
              ))}
            </div>
          </SettingRow>

          {/* ── Motion Intensity ── */}
          <SettingRow label="Intensidad de Motion">
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {MOTION_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  active={settings.motionIntensity === opt.value}
                  onClick={() => updateSetting({ motionIntensity: opt.value })}
                />
              ))}
            </div>
          </SettingRow>

          {/* ── Language ── */}
          <SettingRow label="Idioma">
            <select
              value={settings.language}
              onChange={(e) => updateSetting({ language: e.target.value })}
              style={{
                width: "100%",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text)",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--sp-2) var(--sp-3)",
                outline: "none",
                cursor: "pointer",
                appearance: "auto",
              }}
            >
              <option value="es">Espa&ntilde;ol</option>
              <option value="en">English</option>
            </select>
          </SettingRow>

          {/* ── Auto Intro ── */}
          <SettingRow label="Auto-Intro (hook autom&aacute;tico)">
            <ToggleSwitch
              checked={settings.autoIntro}
              onChange={(val) => updateSetting({ autoIntro: val })}
            />
          </SettingRow>

          {/* ── Series Mode ── */}
          <SettingRow
            label="Modo Consistencia (series)"
            description="Mantiene estilo visual entre videos"
          >
            <ToggleSwitch
              checked={settings.seriesMode}
              onChange={(val) => updateSetting({ seriesMode: val })}
            />
          </SettingRow>
        </div>
      </Card>
    </div>
  );
}

/* ── Setting Row ── */
function SettingRow({ label, description, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          color: "var(--text)",
          marginBottom: description ? "var(--sp-1)" : "var(--sp-3)",
        }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
      {description && (
        <p
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-body)",
            color: "var(--muted)",
            margin: "0 0 var(--sp-3)",
            lineHeight: 1.5,
          }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {children}
    </div>
  );
}

/* ── Option Card (radio-button-like) ── */
function OptionCard({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "var(--sp-3) var(--sp-4)",
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        fontWeight: 600,
        color: active ? "var(--accent)" : "var(--text-secondary)",
        background: active ? "var(--accent-muted)" : "var(--panel-2)",
        border: active
          ? "1.5px solid var(--accent-border)"
          : "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        textAlign: "center",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

/* ── Toggle Switch ── */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: "var(--radius-full)",
        background: checked ? "var(--accent)" : "var(--panel-2)",
        border: checked
          ? "1px solid var(--accent)"
          : "1px solid var(--border)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 1,
          left: checked ? 17 : 1,
          width: 16,
          height: 16,
          borderRadius: "var(--radius-full)",
          background: checked ? "#fff" : "var(--muted)",
          transition: "all var(--transition-fast)",
          boxShadow: "var(--shadow-sm)",
        }}
      />
    </button>
  );
}
