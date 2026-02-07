"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { hasApiKeys, hasTtsKey } from "@/lib/storage";
import { mockScript, mockEDL } from "@/lib/mock";
import { downloadExportPack } from "@/lib/exportPack";
import { generateSRT } from "@/lib/srt";
import { isAIConnected } from "@/lib/aiProvidersConfig";
import Topbar from "@/components/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Stepper from "@/components/ui/Stepper";
import TimelineRow from "@/components/ui/TimelineRow";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Idea" },
  { id: 2, label: "Guion" },
  { id: 3, label: "EDL" },
  { id: 4, label: "Voz" },
  { id: 5, label: "Export" },
];

const DURATION_OPTIONS = [
  { value: 30, label: "Short", sub: "30s" },
  { value: 60, label: "Estandar", sub: "60s" },
  { value: 90, label: "Long", sub: "90s" },
];
const TONE_OPTIONS = [
  { value: "epica", label: "Epica" },
  { value: "educativo", label: "Educativo" },
  { value: "narrativo", label: "Narrativo" },
];
const LANG_OPTIONS = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
];

export default function StudioPage() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const studio = state?.studio || {};
  const settings = state?.settings || {};
  const { step = 1, idea = {}, script = {}, edl, voice = {}, loading = false } = studio;
  const keysOk = hasApiKeys(settings);
  const ttsOk = hasTtsKey(settings);

  const [toast, setToast] = useState(null);
  const [selectedSeg, setSelectedSeg] = useState(null);
  const [claudeConnected, setClaudeConnected] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => {
    const connected = isAIConnected("claude");
    setClaudeConnected(connected);
  }, []);

  function goStep(n) {
    dispatch({ type: "SET_STUDIO_STEP", payload: n });
  }

  const handleGenerateScript = useCallback(async () => {
    if (!idea?.topic?.trim()) return;
    dispatch({ type: "SET_STUDIO_LOADING", payload: true });

    try {
      if (keysOk) {
        const res = await fetch("/api/llm/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, settings }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        dispatch({ type: "SET_STUDIO_SCRIPT", payload: data });
      } else {
        await delay(400);
        const data = mockScript(idea);
        dispatch({ type: "SET_STUDIO_SCRIPT", payload: data });
      }
      dispatch({ type: "SET_STUDIO_LOADING", payload: false });
      goStep(2);
    } catch (err) {
      dispatch({ type: "SET_STUDIO_LOADING", payload: false });
      showToast("Error: " + (err?.message || "Desconocido"));
    }
  }, [idea, keysOk, settings, dispatch]);

  const handleGenerateEDL = useCallback(async () => {
    if (!script?.text) return;
    dispatch({ type: "SET_STUDIO_LOADING", payload: true });

    try {
      if (keysOk) {
        const res = await fetch("/api/llm/director", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script, idea, settings }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        dispatch({ type: "SET_STUDIO_EDL", payload: data });
      } else {
        await delay(400);
        const data = mockEDL(script, idea);
        dispatch({ type: "SET_STUDIO_EDL", payload: data });
      }
      goStep(3);
    } catch (err) {
      dispatch({ type: "SET_STUDIO_LOADING", payload: false });
      showToast("Error: " + (err?.message || "Desconocido"));
    }
  }, [script, idea, keysOk, settings, dispatch]);

  const handleGenerateVoice = useCallback(async () => {
    if (!ttsOk || !script?.text) {
      goStep(5);
      return;
    }
    dispatch({ type: "SET_STUDIO_VOICE", payload: { loading: true } });

    try {
      const res = await fetch("/api/tts/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script.text, settings }),
      });
      if (!res.ok) throw new Error("TTS error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      dispatch({ type: "SET_STUDIO_VOICE", payload: { audioUrl: url, loading: false } });
      goStep(4);
    } catch (err) {
      dispatch({ type: "SET_STUDIO_VOICE", payload: { loading: false } });
      showToast("TTS error: " + (err?.message || "Desconocido"));
      goStep(5);
    }
  }, [ttsOk, script, settings, dispatch]);

  async function handleExportPack() {
    try {
      await downloadExportPack({
        title: idea?.topic || "celeste-export",
        scriptText: script?.text || "",
        edl,
        audioUrl: voice?.audioUrl,
      });
      showToast("Export pack descargado");
    } catch (err) {
      showToast("Error: " + (err?.message || "Desconocido"));
    }
  }

  function handleSave() {
    dispatch({
      type: "SAVE_PROJECT",
      payload: {
        mode: "studio",
        name: idea?.topic || "Studio Project",
        data: { step, idea, script, edl, voice: { audioUrl: voice?.audioUrl } },
      },
    });
    showToast("Proyecto guardado");
  }

  if (!claudeConnected) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <Topbar title="AI Video Studio" badge="bloqueado" />
        <Card
          style={{
            padding: "var(--sp-8) var(--sp-6)",
            textAlign: "center",
            background: "color-mix(in srgb, var(--danger) 5%, var(--panel))",
            borderColor: "color-mix(in srgb, var(--danger) 20%, transparent)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--danger) 12%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--sp-4)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--danger)", marginBottom: "var(--sp-2)" }}>
            Studio bloqueado
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--sp-5)" }}>
            Necesitás conectar Claude (Anthropic) para usar el AI Video Studio.
            <br />
            Claude es obligatorio para generar guiones y EDLs.
          </p>
          <Link href="/settings/ai">
            <Button variant="primary" size="lg">
              Conectar Claude ahora
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", maxWidth: 800 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "var(--sp-6)",
            right: "var(--sp-6)",
            background: "var(--success)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            padding: "var(--sp-2) var(--sp-5)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 9999,
            animation: "toastIn 0.15s ease",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}

      <Topbar title="AI Video Studio" badge={keysOk ? "API" : "demo"}>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "STUDIO_RESET" })}>
          Nuevo
        </Button>
        {(script?.text || edl) && (
          <Button variant="ghost" size="sm" onClick={handleSave}>
            Guardar
          </Button>
        )}
      </Topbar>

      <div style={{ marginBottom: "var(--sp-6)" }}>
        <Stepper steps={STEPS} current={step} />
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            gap: "var(--sp-4)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-full)",
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
            {step <= 2 ? "Generando guion..." : step === 3 ? "Generando EDL..." : "Generando voz..."}
          </span>
          {!keysOk && <span style={{ fontSize: "11px", color: "var(--dim)" }}>modo demo</span>}
        </div>
      )}

      {!loading && step === 1 && (
        <Card style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <div>
            <Label>Tema del video</Label>
            <textarea
              rows={3}
              value={idea?.topic || ""}
              onChange={(e) => dispatch({ type: "SET_STUDIO_IDEA", payload: { topic: e.target.value } })}
              placeholder="Ej: La historia oculta del Coliseo Romano"
              style={taStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <Label>Duracion</Label>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {DURATION_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={idea?.duration === o.value}
                  onClick={() => dispatch({ type: "SET_STUDIO_IDEA", payload: { duration: o.value } })}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: idea?.duration === o.value ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {o.label}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      color: idea?.duration === o.value ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {o.sub}
                  </div>
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Label>Tono</Label>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {TONE_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={idea?.tone === o.value}
                  onClick={() => dispatch({ type: "SET_STUDIO_IDEA", payload: { tone: o.value } })}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: idea?.tone === o.value ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {o.label}
                  </div>
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Label>Idioma</Label>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              {LANG_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={idea?.language === o.value}
                  onClick={() => dispatch({ type: "SET_STUDIO_IDEA", payload: { language: o.value } })}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: idea?.language === o.value ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {o.label}
                  </div>
                </Chip>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateScript}
            disabled={!idea?.topic?.trim()}
            style={{ width: "100%" }}
          >
            Generar Guion
          </Button>
        </Card>
      )}

      {!loading && step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--sp-3)",
              }}
            >
              <Label style={{ marginBottom: 0 }}>Guion generado</Label>
              <Badge color="muted">{script?.segments?.length || 0} segmentos</Badge>
            </div>
            <textarea
              rows={10}
              value={script?.text || ""}
              onChange={(e) => dispatch({ type: "SET_STUDIO_SCRIPT", payload: { text: e.target.value } })}
              style={taStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </Card>

          <div style={{ display: "flex", gap: "var(--sp-3)" }}>
            <Button variant="ghost" size="md" onClick={() => goStep(1)}>
              Volver
            </Button>
            <div style={{ flex: 1 }} />
            <Button variant="secondary" size="md" onClick={handleGenerateScript}>
              Regenerar
            </Button>
            <Button variant="primary" size="md" onClick={handleGenerateEDL} disabled={!script?.text}>
              Generar EDL
            </Button>
          </div>
        </div>
      )}

      {!loading && step === 3 && edl && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-3)",
              padding: "var(--sp-2) var(--sp-4)",
              background: "var(--panel)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              {edl?.segments?.length || 0} segmentos
            </span>
            <span style={{ color: "var(--dim)", fontSize: "10px" }}>&middot;</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)" }}>
              {edl?.duration_sec || 0}s
            </span>
            <Badge color="muted">{edl?.title || "Sin título"}</Badge>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-2)",
              maxHeight: "calc(100vh - 320px)",
              overflowY: "auto",
              paddingRight: "var(--sp-1)",
            }}
          >
            {(edl?.segments || []).map((seg, i) => (
              <TimelineRow
                key={seg?.id || i}
                segment={seg}
                index={i}
                selected={seg?.id === selectedSeg}
                onSelect={() => setSelectedSeg(seg?.id === selectedSeg ? null : seg?.id)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "var(--sp-3)" }}>
            <Button variant="ghost" size="md" onClick={() => goStep(2)}>
              Volver
            </Button>
            <div style={{ flex: 1 }} />
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                const json = JSON.stringify(edl, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "edl.json";
                a.click();
                URL.revokeObjectURL(url);
                showToast("EDL exportado");
              }}
            >
              Export EDL
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (ttsOk) {
                  handleGenerateVoice();
                } else {
                  goStep(5);
                }
              }}
            >
              {ttsOk ? "Generar Voz" : "Ir a Export"}
            </Button>
          </div>
        </div>
      )}

      {!loading && step === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <Card>
            <Label>Audio generado</Label>
            {voice?.audioUrl ? (
              <audio controls src={voice.audioUrl} style={{ width: "100%", marginTop: "var(--sp-2)" }} />
            ) : (
              <div style={{ fontSize: "12px", color: "var(--muted)", padding: "var(--sp-4)" }}>
                No se genero audio. Configura ElevenLabs en Settings.
              </div>
            )}
          </Card>
          <div style={{ display: "flex", gap: "var(--sp-3)" }}>
            <Button variant="ghost" size="md" onClick={() => goStep(3)}>
              Volver
            </Button>
            <div style={{ flex: 1 }} />
            <Button variant="primary" size="md" onClick={() => goStep(5)}>
              Ir a Export
            </Button>
          </div>
        </div>
      )}

      {!loading && step === 5 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            <Label>Export Pack</Label>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Descarga un ZIP con todos los assets del proyecto:
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-1)",
                padding: "var(--sp-3)",
                background: "var(--panel-2)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <FileEntry name="script.md" ok={!!script?.text} />
              <FileEntry name="edl.json" ok={!!edl} />
              <FileEntry name="subtitles.srt" ok={!!edl?.segments?.length} />
              <FileEntry name="shotlist.txt" ok={!!edl?.segments?.length} />
              <FileEntry name="audio.mp3" ok={!!voice?.audioUrl} />
            </div>
          </Card>

          <div style={{ display: "flex", gap: "var(--sp-3)" }}>
            <Button variant="ghost" size="md" onClick={() => goStep(edl ? 3 : 2)}>
              Volver
            </Button>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" onClick={handleSave}>
              Guardar proyecto
            </Button>
            <Button variant="primary" size="lg" onClick={handleExportPack} disabled={!script?.text && !edl}>
              Descargar ZIP
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children, style: extra }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "var(--dim)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "var(--sp-2)",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        padding: "var(--sp-2) var(--sp-3)",
        textAlign: "center",
        cursor: "pointer",
        background: active ? "var(--accent-muted)" : "var(--panel-2)",
        border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        transition: "all var(--transition-fast)",
      }}
    >
      {children}
    </div>
  );
}

function FileEntry({ name, ok }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-2)",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span style={{ color: ok ? "var(--success)" : "var(--dim)" }}>{ok ? "\u2713" : "\u2013"}</span>
      <span style={{ color: ok ? "var(--text-secondary)" : "var(--dim)" }}>{name}</span>
    </div>
  );
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const taStyle = {
  width: "100%",
  resize: "vertical",
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  lineHeight: 1.75,
  color: "var(--text)",
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--sp-3) var(--sp-4)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color var(--transition-fast)",
};
