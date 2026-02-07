import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CSSProperties } from "react";

interface Props {
  opacity?: number;
}

export const GrainOverlay: React.FC<Props> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 100;

  const style: CSSProperties = {
    opacity,
    pointerEvents: "none",
    mixBlendMode: "overlay",
  };

  return (
    <AbsoluteFill style={style}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={3}
            seed={seed}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
