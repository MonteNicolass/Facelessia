import { interpolate } from "remotion";
import { MotionParams } from "../types";
import { CSSProperties } from "react";

export function slowZoomIn(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const from = params.from ?? 1;
  const to = params.to ?? 1.12;
  const scale = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { transform: `scale(${scale})` };
}

export function slowZoomOut(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const from = params.from ?? 1.12;
  const to = params.to ?? 1;
  const scale = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { transform: `scale(${scale})` };
}

export function pushInFast(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const from = params.from ?? 1;
  const to = params.to ?? 1.2;
  const scale = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t,
  });
  return { transform: `scale(${scale})` };
}
