/**
 * Generator pipeline — mock multi-step faceless video generation.
 * Steps: Input → Script → Assets → Assemble → Output
 */

import { generateStudioOutput } from "./studio-generator";

/**
 * Step 1→2: Generate script from config.
 * @returns {{ scenes: Array }}
 */
export function generateScript(config) {
  const output = generateStudioOutput(config);
  return output.script;
}

/**
 * Step 2→3: Generate visual assets (prompts + casting) from script.
 * @returns {{ prompts: Array, casting: Array }}
 */
export function generateAssets(config) {
  const output = generateStudioOutput(config);
  return { prompts: output.prompts, casting: output.casting };
}

/**
 * Step 3→4: Simulate assembly process.
 * Returns a promise that resolves after simulated progress.
 * @param {function} onProgress — called with 0-100
 * @returns {Promise<void>}
 */
export function simulateAssembly(onProgress) {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress(100);
        setTimeout(resolve, 300);
      } else {
        onProgress(progress);
      }
    }, 400);
  });
}

/**
 * Step 4→5: Build final output package.
 * @returns {{ metadata, script, prompts, casting }}
 */
export function buildOutput(config) {
  return generateStudioOutput(config);
}

/**
 * Export generator run as JSON download.
 */
export function exportGeneratorJSON(config, output) {
  const data = {
    version: "2.0",
    app: "Celeste Generator",
    exportedAt: new Date().toISOString(),
    config,
    script: output.script,
    prompts: output.prompts,
    casting: output.casting,
    metadata: output.metadata,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `celeste-generator_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
