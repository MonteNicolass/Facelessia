import { CSSProperties } from "react";
import { SFX } from "../types";
import { COLORS } from "../lib/colors";

interface Props {
  brollQuery: string;
  brollTimestamp: string;
  sfx: SFX;
  motionLabel: string;
}

export const DebugOverlay: React.FC<Props> = ({
  brollQuery,
  brollTimestamp,
  sfx,
  motionLabel,
}) => {
  const containerStyle: CSSProperties = {
    position: "absolute",
    top: 40,
    right: 30,
    width: 280,
    background: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    padding: "12px 16px",
    fontFamily: "'SF Mono', 'Consolas', monospace",
    fontSize: 11,
    lineHeight: 1.6,
    color: COLORS.dim,
    border: `1px solid ${COLORS.borderSubtle}`,
    backdropFilter: "blur(4px)",
  };

  const labelStyle: CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: 2,
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...labelStyle, color: COLORS.accent }}>MOTION</div>
      <div style={{ marginBottom: 8, color: COLORS.warning }}>
        {motionLabel}
      </div>

      <div style={{ ...labelStyle, color: COLORS.accent }}>B-ROLL</div>
      <div style={{ marginBottom: 2, color: COLORS.textSecondary }}>
        {brollQuery}
      </div>
      <div style={{ marginBottom: 8, color: COLORS.muted, fontSize: 10 }}>
        {brollTimestamp}
      </div>

      <div style={{ ...labelStyle, color: COLORS.success }}>SFX</div>
      <div style={{ color: COLORS.textSecondary }}>
        {sfx.efecto}{" "}
        <span style={{ color: COLORS.muted }}>({sfx.intensidad})</span>
      </div>
    </div>
  );
};
