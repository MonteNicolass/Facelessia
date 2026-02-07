import { AbsoluteFill, Sequence } from "remotion";
import { Scene } from "./components/Scene";
import { CelesteProject, SceneData } from "./types";

const FPS = 30;

interface Props {
  data: CelesteProject;
}

export const EDLVideo: React.FC<Props> = ({ data }) => {
  // Build scene lookup: id -> ScriptScene
  const sceneLookup = new Map(
    data.script.scenes.map((s) => [String(s.id), s]),
  );

  // Build SceneData array from EDL
  const sceneDataList: SceneData[] = data.edl.map((entry) => {
    const scene = sceneLookup.get(String(entry.id));
    const startFrame = Math.round(entry.startSec * FPS);
    const durationFrames = Math.round((entry.endSec - entry.startSec) * FPS);

    return {
      edlEntry: entry,
      scene: scene || {
        id: entry.id,
        startSec: entry.startSec,
        endSec: entry.endSec,
        narration: "",
        visualPrompt: "",
        onScreenText: "",
      },
      startFrame,
      durationFrames,
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {sceneDataList.map((sd, index) => (
        <Sequence
          key={String(sd.edlEntry.id)}
          from={sd.startFrame}
          durationInFrames={sd.durationFrames}
          name={`Scene ${sd.edlEntry.id}`}
        >
          <Scene sceneData={sd} index={index} total={sceneDataList.length} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
