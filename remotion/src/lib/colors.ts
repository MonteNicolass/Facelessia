export const COLORS = {
  bg: "#0a0a0f",
  sceneBg: "#0d0d14",
  panel: "#111118",
  panel2: "#1a1a24",
  textPrimary: "#e5e5e5",
  textSecondary: "#cccccc",
  muted: "#777",
  dim: "#555",
  accent: "#6366f1",
  pink: "#ec4899",
  warning: "#f59e0b",
  success: "#10b981",
  borderSubtle: "rgba(255,255,255,0.08)",

  sceneGradient: (index: number, total: number): string => {
    const hue = 240 + (index / Math.max(total, 1)) * 30;
    return `linear-gradient(180deg, hsl(${hue}, 15%, 5%) 0%, #0a0a0f 100%)`;
  },
};
