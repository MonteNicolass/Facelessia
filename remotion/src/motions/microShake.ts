import { MotionParams } from "../types";
import { CSSProperties } from "react";

export function microShake(
  params: MotionParams,
  _progress: number,
  frame: number,
  fps: number,
): CSSProperties {
  const intensity = params.intensity ?? 2;
  const frequency = params.frequency ?? 8;
  const decay = params.decay ?? 0.9;

  const t = frame / fps;
  const envelope = Math.pow(decay, t * 10);

  const offsetX = Math.sin(t * frequency * Math.PI * 2) * intensity * envelope;
  const offsetY =
    Math.sin(t * frequency * Math.PI * 2 * 1.3 + 0.7) * intensity * envelope;

  return {
    transform: `translate(${offsetX}px, ${offsetY}px)`,
  };
}
