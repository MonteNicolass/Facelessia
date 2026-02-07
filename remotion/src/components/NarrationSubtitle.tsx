import { interpolate } from "remotion";
import { CSSProperties } from "react";
import { COLORS } from "../lib/colors";

interface Props {
  text: string;
  frame: number;
  durationInFrames: number;
}

export const NarrationSubtitle: React.FC<Props> = ({
  text,
  frame,
  durationInFrames,
}) => {
  const truncated =
    text.length > 90 ? text.slice(0, 87).trimEnd() + "..." : text;

  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const style: CSSProperties = {
    position: "absolute",
    bottom: 160,
    left: "50%",
    transform: "translateX(-50%)",
    width: "85%",
    opacity,
    color: COLORS.textSecondary,
    fontSize: 28,
    fontWeight: 500,
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    textAlign: "center",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textShadow: "0 2px 12px rgba(0,0,0,0.8)",
    padding: "12px 20px",
    background: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    backdropFilter: "blur(8px)",
  };

  return <div style={style}>{truncated}</div>;
};
