/**
 * Export history — persists last N exports in localStorage.
 * + Helper functions for API key checks.
 */

const STORAGE_KEY = "celeste-exports";
const MAX_EXPORTS = 10;

export function saveExport(entry) {
  const list = getExports();
  list.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    ...entry,
  });
  if (list.length > MAX_EXPORTS) list.length = MAX_EXPORTS;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* full */ }
  return list;
}

export function getExports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteExport(id) {
  const list = getExports().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function clearExports() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ── API key helpers ── */

/**
 * Check if LLM API keys are configured.
 */
export function hasApiKeys(settings) {
  if (!settings) return false;
  if (settings.llmProvider === "anthropic") return !!settings.anthropicKey;
  return !!settings.openaiKey;
}

/**
 * Check if TTS API key is configured.
 */
export function hasTtsKey(settings) {
  return !!settings?.elevenlabsKey;
}
