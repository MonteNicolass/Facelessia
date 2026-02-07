import { interpolate } from "remotion";
import { MotionParams } from "../types";
import { CSSProperties } from "react";

export function panLeftSoft(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const from = params.from ?? 0;
  const to = params.to ?? -5;
  const x = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { transform: `translateX(${x}%)` };
}

export function panRightSoft(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const from = params.from ?? 0;
  const to = params.to ?? 5;
  const x = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { transform: `translateX(${x}%)` };
}
