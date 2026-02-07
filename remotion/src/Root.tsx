import { Composition } from "remotion";
import { EDLVideo } from "./EDLVideo";
import { CelesteProject } from "./types";
import edlData from "./edl.json";
import "./styles/global.css";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const Root: React.FC = () => {
  const totalFrames = Math.ceil(edlData.project.durationSec * FPS);

  return (
    <>
      <Composition
        id="EDLVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={EDLVideo as any}
        durationInFrames={totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          data: edlData as unknown as CelesteProject,
        }}
      />
    </>
  );
};
