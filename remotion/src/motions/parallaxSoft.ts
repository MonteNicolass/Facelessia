import { interpolate } from "remotion";
import { MotionParams } from "../types";
import { CSSProperties } from "react";

export function parallaxSoft(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const intensity = params.intensity ?? 0.03;

  const shift = interpolate(
    progress,
    [0, 1],
    [-intensity * 100, intensity * 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return {
    transform: `translateX(${shift}%) scale(1.03)`,
  };
}
