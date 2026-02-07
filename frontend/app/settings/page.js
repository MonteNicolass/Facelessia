"use client";

export const dynamic = "force-dynamic";

import { useStore } from "@/lib/store";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const LLM_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
];

const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

const ANTHROPIC_MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
];

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const s = state.settings;

  function set(payload) {
    dispatch({ type: "SET_SETTINGS", payload });
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Topbar title="Settings" />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
        {/* LLM Provider */}
        <Card>
          <SectionTitle>LLM Provider</SectionTitle>
          <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
            {LLM_PROVIDERS.map((p) => (
              <div
                key={p.value}
                onClick={() => set({ llmProvider: p.value })}
                style={{
                  flex: 1, padding: "var(--sp-3)", textAlign: "center", cursor: "pointer",
                  background: s.llmProvider === p.value ? "var(--accent-muted)" : "var(--panel-2)",
                  border: s.llmProvider === p.value ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", transition: "all var(--transition-fast)",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600, color: s.llmProvider === p.value ? "var(--accent)" : "var(--text)" }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>

          {s.llmProvider === "openai" && (
            <>
              <Input
                label="OpenAI API Key"
                type="password"
                value={s.openaiKey}
                onChange={(e) => set({ openaiKey: e.target.value })}
                placeholder="sk-..."
                mono
              />
              <div style={{ marginTop: "var(--sp-3)" }}>
                <ModelSelector
                  label="Model"
                  models={OPENAI_MODELS}
                  value={s.openaiModel}
                  onChange={(v) => set({ openaiModel: v })}
                />
              </div>
            </>
          )}

          {s.llmProvider === "anthropic" && (
            <>
              <Input
                label="Anthropic API Key"
                type="password"
                value={s.anthropicKey}
                onChange={(e) => set({ anthropicKey: e.target.value })}
                placeholder="sk-ant-..."
                mono
              />
              <div style={{ marginTop: "var(--sp-3)" }}>
                <ModelSelector
                  label="Model"
                  models={ANTHROPIC_MODELS}
                  value={s.anthropicModel}
                  onChange={(v) => set({ anthropicModel: v })}
                />
              </div>
            </>
          )}

          {!getActiveKey(s) && (
            <div style={{ marginTop: "var(--sp-3)", fontSize: "11px", color: "var(--warning)" }}>
              Sin API key — modo demo activo (datos mock)
            </div>
          )}
        </Card>

        {/* ElevenLabs */}
        <Card>
          <SectionTitle>ElevenLabs (TTS)</SectionTitle>
          <Input
            label="API Key"
            type="password"
            value={s.elevenlabsKey}
            onChange={(e) => set({ elevenlabsKey: e.target.value })}
            placeholder="xi-..."
            mono
          />
          <div style={{ marginTop: "var(--sp-3)" }}>
            <Input
              label="Voice Name / ID"
              value={s.elevenlabsVoice}
              onChange={(e) => set({ elevenlabsVoice: e.target.value })}
              placeholder="Antoni"
            />
          </div>
          {!s.elevenlabsKey && (
            <div style={{ marginTop: "var(--sp-3)", fontSize: "11px", color: "var(--muted)" }}>
              Sin key de ElevenLabs — el paso de voz se va a saltar.
            </div>
          )}
        </Card>

        {/* Reset */}
        <Card>
          <SectionTitle>Datos</SectionTitle>
          <div style={{ display: "flex", gap: "var(--sp-3)" }}>
            <Button variant="danger" size="sm" onClick={() => {
              if (confirm("Esto borra TODOS los proyectos y settings. Seguro?")) {
                dispatch({ type: "RESET" });
                try { localStorage.removeItem("celeste-store"); } catch {}
              }
            }}>
              Reset completo
            </Button>
            <Badge color="muted">
              {state.projects.length} proyectos guardados
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)",
      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--sp-3)",
    }}>
      {children}
    </div>
  );
}

function ModelSelector({ label, models, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--sp-1)" }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: "var(--sp-1)" }}>
        {models.map((m) => (
          <div
            key={m.value}
            onClick={() => onChange(m.value)}
            style={{
              flex: 1, padding: "var(--sp-2)", textAlign: "center", cursor: "pointer",
              fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-mono)",
              background: value === m.value ? "var(--accent-muted)" : "transparent",
              color: value === m.value ? "var(--accent)" : "var(--dim)",
              border: value === m.value ? "1px solid var(--accent-border)" : "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", transition: "all var(--transition-fast)",
            }}
          >
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function getActiveKey(settings) {
  return settings.llmProvider === "anthropic" ? settings.anthropicKey : settings.openaiKey;
}
