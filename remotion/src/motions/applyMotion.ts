import { MotionParams } from "../types";
import { slowZoomIn, slowZoomOut, pushInFast } from "./slowZoom";
import { panLeftSoft, panRightSoft } from "./panSoft";
import { holdStatic } from "./holdStatic";
import { microShake } from "./microShake";
import { whipPanSoft } from "./whipPan";
import { parallaxSoft } from "./parallaxSoft";
import { CSSProperties } from "react";

type MotionFn = (
  params: MotionParams,
  progress: number,
  frame: number,
  fps: number,
) => CSSProperties;

const MOTION_MAP: Record<string, MotionFn> = {
  slow_zoom_in: slowZoomIn,
  slow_zoom_out: slowZoomOut,
  push_in_fast: pushInFast,
  pan_left_soft: panLeftSoft,
  pan_right_soft: panRightSoft,
  hold_static: holdStatic,
  micro_shake: microShake,
  whip_pan_soft: whipPanSoft,
  parallax_soft: parallaxSoft,
};

export function applyMotion(
  motionId: string,
  params: MotionParams,
  progress: number,
  frame: number,
  fps: number,
): CSSProperties {
  const fn = MOTION_MAP[motionId];
  if (!fn) return holdStatic();
  return fn(params, progress, frame, fps);
}
