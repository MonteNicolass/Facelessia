/**
 * Presets — Motion, SFX, and Remotion prompt templates.
 */

export const MOTION_PRESETS = [
  {
    id: "ken_burns_slow",
    name: "Ken Burns Slow",
    desc: "Zoom lento y suave, ideal para narración calma",
    params: { from: 1.0, to: 1.15, duration: "segment" },
    remotionHint: "scale interpolation from 1.0 to 1.15 over segment duration",
  },
  {
    id: "punch_in",
    name: "Punch In",
    desc: "Zoom rápido para enfatizar un momento clave",
    params: { from: 1.0, to: 1.3, duration: "0.3s" },
    remotionHint: "spring() scale to 1.3 with damping 12",
  },
  {
    id: "pan_left",
    name: "Pan Left",
    desc: "Paneo horizontal suave hacia la izquierda",
    params: { direction: "left", distance: "5%", duration: "segment" },
    remotionHint: "translateX interpolation 0% to -5%",
  },
  {
    id: "pan_right",
    name: "Pan Right",
    desc: "Paneo horizontal suave hacia la derecha",
    params: { direction: "right", distance: "5%", duration: "segment" },
    remotionHint: "translateX interpolation 0% to 5%",
  },
  {
    id: "parallax_fake",
    name: "Parallax Fake",
    desc: "Efecto de profundidad simulado con capas",
    params: { layers: 2, offset: "3%" },
    remotionHint: "two layers with different translateX speeds",
  },
  {
    id: "shake_micro",
    name: "Shake Micro",
    desc: "Vibración sutil para tensión o impacto",
    params: { intensity: 2, frequency: "15hz", decay: true },
    remotionHint: "Math.sin(frame * 15) * 2 with exponential decay",
  },
  {
    id: "zoom_out",
    name: "Zoom Out",
    desc: "Alejamiento progresivo, ideal para cierres",
    params: { from: 1.15, to: 1.0, duration: "segment" },
    remotionHint: "scale interpolation from 1.15 to 1.0",
  },
  {
    id: "static_hold",
    name: "Static Hold",
    desc: "Sin movimiento, énfasis en el contenido textual",
    params: {},
    remotionHint: "no transform, identity",
  },
];

export const SFX_PRESETS = [
  { id: "whoosh_soft", name: "Whoosh Soft", desc: "Transición suave entre escenas", trigger: "transition", intensity: "sutil" },
  { id: "hit", name: "Hit / Impact", desc: "Golpe seco para dato de impacto", trigger: "beat", intensity: "fuerte" },
  { id: "riser", name: "Riser", desc: "Ascenso de tensión pre-revelación", trigger: "pre-beat", intensity: "medio" },
  { id: "pop", name: "Pop", desc: "Sonido corto para aparición de texto", trigger: "text-in", intensity: "sutil" },
  { id: "click", name: "Click", desc: "Click mecánico para cortes rápidos", trigger: "cut", intensity: "sutil" },
  { id: "boom", name: "Boom", desc: "Impacto grave para clímax", trigger: "climax", intensity: "fuerte" },
  { id: "reverse_cymbal", name: "Reverse Cymbal", desc: "Cierre invertido para finales", trigger: "outro", intensity: "medio" },
  { id: "tape_stop", name: "Tape Stop", desc: "Efecto de cinta deteniéndose", trigger: "pause", intensity: "medio" },
];

export const REMOTION_PROMPTS = [
  {
    id: "motion_component",
    name: "Motion Component",
    template: `Generá un componente React para Remotion que aplique una animación de cámara "{motionName}" sobre una imagen de fondo.

Specs:
- Input props: src (image URL), durationInFrames, fps
- Motion: {motionDesc}
- Parámetros: {motionParams}
- Usar interpolate() de Remotion para las transiciones
- Output: componente exportado como default
- Estilo: 1080x1920 (9:16 vertical)`,
  },
  {
    id: "text_overlay",
    name: "Text Overlay",
    template: `Generá un componente Remotion para texto en pantalla con animación de entrada.

Specs:
- Input props: text (string), startFrame, durationInFrames
- Animación: fade-in + slide-up con spring()
- Font: system-ui, bold, tamaño adaptable
- Posición: centro-inferior (safe zone)
- Sombra de texto para legibilidad
- 1080x1920 vertical`,
  },
  {
    id: "subtitle_track",
    name: "Subtitle Track",
    template: `Generá un componente Remotion que renderice subtítulos sincronizados.

Specs:
- Input props: subtitles (array de { text, startFrame, endFrame })
- Cada subtítulo aparece/desaparece en su rango de frames
- Estilo: fondo semi-transparente, texto blanco, máx 2 líneas
- Posición: bottom 10%
- Animación: fade suave
- 1080x1920 vertical`,
  },
  {
    id: "scene_composition",
    name: "Full Scene Composition",
    template: `Generá una composición Remotion completa para una escena de video faceless.

Specs:
- Input props: bgImage, narrationText, subtitleText, motionType, durationInFrames
- Capas: fondo con motion > grain overlay > texto on-screen > subtítulo
- Motion type: {motionType}
- Grain: SVG feTurbulence overlay a 3% opacidad
- Exportar como Composition con id "Scene{id}"
- 1080x1920 @30fps`,
  },
];
