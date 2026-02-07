// === Celeste JSON v2.0 Shape ===

export interface CelesteProject {
  version: string;
  exportedAt?: string;
  app: string;
  project: ProjectMeta;
  script: ScriptBlock;
  edl: EDLEntry[];
}

export interface ProjectMeta {
  title: string;
  durationSec: number;
  tone: string;
  language?: string;
  aspectRatio?: string;
}

export interface ScriptBlock {
  raw: string;
  scenes: ScriptScene[];
}

export interface ScriptScene {
  id: number | string;
  startSec: number;
  endSec: number;
  narration: string;
  visualPrompt: string;
  onScreenText: string;
}

export interface MotionParams {
  from?: number;
  to?: number;
  unit?: string;
  easing?: string;
  intensity?: number;
  frequency?: number;
  decay?: number;
  layers?: number;
  direction?: string;
  speed?: number;
  blur?: number;
}

export interface SFX {
  efecto: string;
  intensidad: string;
}

export interface Transition {
  tipo: string;
  duracion: number;
}

export interface EDLEntry {
  id: number | string;
  startSec: number;
  endSec: number;
  motionId: string;
  motionLabel: string;
  motionType?: string;
  motionParams: MotionParams;
  motionReason?: string;
  brollQuery: string;
  brollTimestamp: string;
  brollReason?: string;
  sfx: SFX;
  transition: Transition;
  notes: string;
}

// === Remotion helpers ===

export interface SceneData {
  edlEntry: EDLEntry;
  scene: ScriptScene;
  startFrame: number;
  durationFrames: number;
}
