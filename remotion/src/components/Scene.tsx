import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneData } from "../types";
import { applyMotion } from "../motions";
import { OnScreenText } from "./OnScreenText";
import { NarrationSubtitle } from "./NarrationSubtitle";
import { DebugOverlay } from "./DebugOverlay";
import { GrainOverlay } from "./GrainOverlay";
import { COLORS } from "../lib/colors";

interface Props {
  sceneData: SceneData;
  index: number;
  total: number;
}

export const Scene: React.FC<Props> = ({ sceneData, index, total }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { edlEntry, scene } = sceneData;

  const progress = frame / durationInFrames;

  const motionStyle = applyMotion(
    edlEntry.motionId,
    edlEntry.motionParams,
    progress,
    frame,
    fps,
  );

  // Fade in/out
  const fadeIn = Math.min(1, frame / 8);
  const fadeOut = Math.min(1, (durationInFrames - frame) / 8);
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill>
      {/* Dark editorial background */}
      <AbsoluteFill
        style={{
          background: COLORS.sceneGradient(index, total),
          opacity,
        }}
      />

      {/* Content layer with motion */}
      <AbsoluteFill
        style={{
          ...motionStyle,
          opacity,
        }}
      >
        {/* Visual prompt placeholder */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: COLORS.sceneBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: COLORS.dim,
              fontSize: 24,
              fontFamily: "monospace",
              textAlign: "center",
              padding: "0 80px",
              lineHeight: 1.5,
              opacity: 0.5,
            }}
          >
            {scene.visualPrompt || `Scene ${edlEntry.id}`}
          </div>
        </div>
      </AbsoluteFill>

      {/* Grain */}
      <GrainOverlay opacity={0.06} />

      {/* On-screen text */}
      {scene.onScreenText && (
        <OnScreenText text={scene.onScreenText} frame={frame} fps={fps} />
      )}

      {/* Narration subtitle */}
      {scene.narration && (
        <NarrationSubtitle
          text={scene.narration}
          frame={frame}
          durationInFrames={durationInFrames}
        />
      )}

      {/* Debug overlay */}
      <DebugOverlay
        brollQuery={edlEntry.brollQuery}
        brollTimestamp={edlEntry.brollTimestamp}
        sfx={edlEntry.sfx}
        motionLabel={edlEntry.motionLabel}
      />
    </AbsoluteFill>
  );
};
