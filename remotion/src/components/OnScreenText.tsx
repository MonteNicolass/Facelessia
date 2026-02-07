import { spring } from "remotion";
import { CSSProperties } from "react";
import { COLORS } from "../lib/colors";

interface Props {
  text: string;
  frame: number;
  fps: number;
}

export const OnScreenText: React.FC<Props> = ({ text, frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
  });

  const translateY = (1 - progress) * 40;

  const style: CSSProperties = {
    position: "absolute",
    top: "38%",
    left: "50%",
    transform: `translate(-50%, ${-50 + translateY}%) scale(${0.9 + progress * 0.1})`,
    opacity: progress,
    color: COLORS.textPrimary,
    fontSize: 52,
    fontWeight: 800,
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 1.2,
    letterSpacing: "-1px",
    textShadow: "0 4px 24px rgba(0,0,0,0.7)",
  };

  return <div style={style}>{text}</div>;
};
