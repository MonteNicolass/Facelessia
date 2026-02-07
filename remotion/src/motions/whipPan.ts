import { interpolate } from "remotion";
import { MotionParams } from "../types";
import { CSSProperties } from "react";

export function whipPanSoft(
  params: MotionParams,
  progress: number,
): CSSProperties {
  const direction = params.direction === "left" ? -1 : 1;
  const speed = params.speed ?? 0.3;
  const blur = params.blur ?? 4;

  const whipProgress = interpolate(progress, [0, speed], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const eased = 1 - Math.pow(1 - whipProgress, 3);
  const translateX = direction * (1 - eased) * 20;
  const motionBlur = (1 - eased) * blur;

  return {
    transform: `translateX(${translateX}%)`,
    filter: motionBlur > 0.1 ? `blur(${motionBlur}px)` : "none",
  };
}
