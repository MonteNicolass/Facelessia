// ============================================
// Datos mock para Celeste
// Simula la salida real del backend Python
// ============================================

// --- Configuración del proyecto actual ---
export const mockConfig = {
  tema: "5 hábitos que te están arruinando la vida sin que te des cuenta",
  duracion: 60,
  estilo: "cinematográfico oscuro",
  tono: "informativo y enganchante",
  plataforma: "Instagram Reels / TikTok",
};

// --- Script generado (output de script_generator.py) ---
export const mockScript = {
  titulo: "5 Hábitos que te están arruinando la vida",
  duracion_total: 60,
  estilo_visual:
    "Cinematográfico oscuro, iluminación dramática, sin rostros visibles, texturas y objetos en primer plano",
  segmentos: [
    {
      id: 1,
      tiempo_inicio: 0,
      tiempo_fin: 10,
      narracion:
        "Hay hábitos que repetís todos los días sin pensar... y te están destruyendo por dentro.",
      visual_prompt:
        "Dark cinematic shot of an empty room with dramatic side lighting, dust particles in air, moody atmosphere, no people, 4K",
      motion: "zoom_in_lento",
      motion_intensidad: "suave",
      broll_sugerido:
        "persona caminando sola en ciudad de noche, plano abierto",
      broll_timestamp: "0:03-0:06",
      sfx_sugerido: "dark ambient riser",
      sfx_timestamp: "0:00",
      transicion_siguiente: "crossfade",
    },
    {
      id: 2,
      tiempo_inicio: 10,
      tiempo_fin: 20,
      narracion:
        "El primero: revisar el celular apenas te despertás. Eso le dice a tu cerebro que el día ya empezó con estrés.",
      visual_prompt:
        "Close-up of a smartphone screen glowing in a dark bedroom, blue light reflecting on sheets, cinematic, no face visible",
      motion: "pan_derecha",
      motion_intensidad: "medio",
      broll_sugerido:
        "mano agarrando celular en la cama, close-up, luz azul",
      broll_timestamp: "0:12-0:15",
      sfx_sugerido: "notification sound subtle",
      sfx_timestamp: "0:10",
      transicion_siguiente: "cut",
    },
    {
      id: 3,
      tiempo_inicio: 20,
      tiempo_fin: 30,
      narracion:
        "El segundo: saltarte el desayuno pensando que te ahorrás calorías. Tu cuerpo lo paga después.",
      visual_prompt:
        "Empty kitchen counter with single coffee cup, morning light through window, cinematic depth of field, no people",
      motion: "ken_burns_arriba",
      motion_intensidad: "suave",
      broll_sugerido: "comida rápida siendo servida, close-up poco apetitoso",
      broll_timestamp: "0:24-0:27",
      sfx_sugerido: "subtle impact hit",
      sfx_timestamp: "0:20",
      transicion_siguiente: "crossfade",
    },
    {
      id: 4,
      tiempo_inicio: 30,
      tiempo_fin: 40,
      narracion:
        "El tercero: no moverte en todo el día. Ocho horas sentado es el nuevo fumar.",
      visual_prompt:
        "Dark shot of an office chair in an empty cubicle, harsh fluorescent lighting from above, oppressive mood, no people",
      motion: "zoom_out_lento",
      motion_intensidad: "medio",
      broll_sugerido:
        "persona estirándose en escritorio, time-lapse de reloj",
      broll_timestamp: "0:33-0:36",
      sfx_sugerido: "clock ticking slow",
      sfx_timestamp: "0:30",
      transicion_siguiente: "whip",
    },
    {
      id: 5,
      tiempo_inicio: 40,
      tiempo_fin: 50,
      narracion:
        "El cuarto: dormir menos de seis horas creyendo que sos más productivo. Tu cerebro no piensa lo mismo.",
      visual_prompt:
        "Messy bed with tangled sheets in dark room, alarm clock showing 3AM, dramatic shadows, cinematic, no people",
      motion: "shake_suave",
      motion_intensidad: "fuerte",
      broll_sugerido: "ojos cerrándose de cansancio, macro shot",
      broll_timestamp: "0:43-0:46",
      sfx_sugerido: "alarm buzz distorted",
      sfx_timestamp: "0:40",
      transicion_siguiente: "crossfade",
    },
    {
      id: 6,
      tiempo_inicio: 50,
      tiempo_fin: 60,
      narracion:
        "La buena noticia: podés cambiar. Empezá por uno solo. Mañana. No la semana que viene. Mañana.",
      visual_prompt:
        "Sunrise light breaking through window onto a clean desk with a notebook and pen, hopeful mood, warm tones, cinematic",
      motion: "zoom_in_lento",
      motion_intensidad: "suave",
      broll_sugerido: "amanecer en ciudad, timelapse suave",
      broll_timestamp: "0:54-0:57",
      sfx_sugerido: "uplifting whoosh + subtle music swell",
      sfx_timestamp: "0:50",
      transicion_siguiente: "fade_out",
    },
  ],
  broll_resumen: [
    "Persona caminando sola en ciudad de noche",
    "Mano agarrando celular en la cama, luz azul",
    "Comida rápida siendo servida, close-up",
    "Persona estirándose en escritorio / time-lapse reloj",
    "Ojos cerrándose de cansancio, macro",
    "Amanecer en ciudad, timelapse",
  ],
  sfx_resumen: [
    "Dark ambient riser",
    "Notification sound subtle",
    "Subtle impact hit",
    "Clock ticking slow",
    "Alarm buzz distorted",
    "Uplifting whoosh",
  ],
  notas_edicion:
    "Mantener ritmo creciente. Los primeros 4 hábitos son oscuros/pesados, el último segmento es la esperanza. Transición emocional clara.",
};

// --- EDL generada (output de editing_director.py) ---
export const mockEDL = {
  titulo: "5 Hábitos que te están arruinando la vida",
  duracion_total: 60,
  resumen_edicion:
    "Edición dramática con ritmo creciente. Arrancar lento y pesado, subir intensidad en cada hábito, cerrar con esperanza. Motions suaves al inicio, más agresivos en el medio, volver a la calma al final.",
  timeline: [
    {
      segmento_id: 1,
      tiempo: "0:00 - 0:10",
      narracion_preview: "Hay hábitos que repetís todos los días...",
      motion: {
        tipo: "zoom_in",
        velocidad: "lento",
        desde: 1.0,
        hasta: 1.15,
        nota: "Crear tensión inicial. Zoom sutil para atrapar la atención sin ser agresivo.",
      },
      broll_inserts: [
        {
          timestamp: "0:03.0 - 0:06.0",
          descripcion: "Persona caminando sola en calle oscura",
          buscar_en_stock: "person walking alone city night dark cinematic",
          razon: "Refuerza la idea de soledad y hábitos inconscientes",
        },
      ],
      sfx: [
        {
          timestamp: "0:00.0",
          efecto: "dark ambient riser",
          intensidad: "sutil",
          nota: "Marca el inicio, crea atmósfera sin ser invasivo",
        },
      ],
      texto_pantalla: {
        mostrar: false,
      },
      transicion_siguiente: {
        tipo: "crossfade",
        duracion: 0.5,
      },
    },
    {
      segmento_id: 2,
      tiempo: "0:10 - 0:20",
      narracion_preview:
        "El primero: revisar el celular apenas te despertás...",
      motion: {
        tipo: "pan_right",
        velocidad: "medio",
        desde: 1.0,
        hasta: 1.1,
        nota: "Paneo acompaña la revelación del primer hábito. Movimiento = descubrimiento.",
      },
      broll_inserts: [
        {
          timestamp: "0:12.0 - 0:15.0",
          descripcion: "Mano tomando celular de la mesita de luz",
          buscar_en_stock: "hand grabbing phone bed morning blue light",
          razon: "Ilustra exactamente el hábito mencionado",
        },
      ],
      sfx: [
        {
          timestamp: "0:10.0",
          efecto: "whoosh transition",
          intensidad: "medio",
          nota: "Marca entrada del primer hábito",
        },
        {
          timestamp: "0:12.5",
          efecto: "phone notification",
          intensidad: "sutil",
          nota: "Refuerza la escena del celular",
        },
      ],
      texto_pantalla: {
        mostrar: true,
        texto: "01",
        posicion: "arriba-izquierda",
        estilo: "número grande semitransparente",
        desde: "0:10.0",
        hasta: "0:12.0",
      },
      transicion_siguiente: {
        tipo: "cut",
        duracion: 0,
      },
    },
    {
      segmento_id: 3,
      tiempo: "0:20 - 0:30",
      narracion_preview:
        "El segundo: saltarte el desayuno pensando que te ahorrás...",
      motion: {
        tipo: "ken_burns_up",
        velocidad: "lento",
        desde: 1.0,
        hasta: 1.12,
        nota: "Movimiento ascendente contradice el mensaje (bajar de peso) — tensión visual.",
      },
      broll_inserts: [
        {
          timestamp: "0:24.0 - 0:27.0",
          descripcion: "Comida rápida servida en bandeja, close-up",
          buscar_en_stock: "fast food serving tray close up cinematic",
          razon: "Contraste: lo que terminas comiendo cuando salteás el desayuno",
        },
      ],
      sfx: [
        {
          timestamp: "0:20.0",
          efecto: "impact hit suave",
          intensidad: "medio",
          nota: "Marca el cambio de hábito",
        },
      ],
      texto_pantalla: {
        mostrar: true,
        texto: "02",
        posicion: "arriba-izquierda",
        estilo: "número grande semitransparente",
        desde: "0:20.0",
        hasta: "0:22.0",
      },
      transicion_siguiente: {
        tipo: "crossfade",
        duracion: 0.4,
      },
    },
    {
      segmento_id: 4,
      tiempo: "0:30 - 0:40",
      narracion_preview:
        "El tercero: no moverte en todo el día...",
      motion: {
        tipo: "zoom_out",
        velocidad: "medio",
        desde: 1.15,
        hasta: 1.0,
        nota: "Zoom out = revelar la situación completa. Sentirse atrapado en el escritorio.",
      },
      broll_inserts: [
        {
          timestamp: "0:33.0 - 0:36.0",
          descripcion: "Time-lapse de reloj avanzando",
          buscar_en_stock: "clock timelapse hours passing fast cinematic",
          razon: "Representa las horas perdidas sentado",
        },
      ],
      sfx: [
        {
          timestamp: "0:30.0",
          efecto: "whip transition",
          intensidad: "fuerte",
          nota: "Corte rápido — sube la energía",
        },
        {
          timestamp: "0:33.0",
          efecto: "clock ticking",
          intensidad: "sutil",
          nota: "Acompaña el b-roll del reloj",
        },
      ],
      texto_pantalla: {
        mostrar: true,
        texto: "03",
        posicion: "arriba-izquierda",
        estilo: "número grande semitransparente",
        desde: "0:30.0",
        hasta: "0:32.0",
      },
      transicion_siguiente: {
        tipo: "whip",
        duracion: 0.3,
      },
    },
    {
      segmento_id: 5,
      tiempo: "0:40 - 0:50",
      narracion_preview:
        "El cuarto: dormir menos de seis horas...",
      motion: {
        tipo: "shake",
        velocidad: "rapido",
        desde: 1.0,
        hasta: 1.08,
        nota: "Shake para transmitir la alarma / el despertar violento. Momento más intenso.",
      },
      broll_inserts: [
        {
          timestamp: "0:43.0 - 0:46.0",
          descripcion: "Ojos cerrándose de cansancio, macro extremo",
          buscar_en_stock: "tired eyes closing macro cinematic slow motion",
          razon: "Hábito más físico — mostrarlo literalmente",
        },
      ],
      sfx: [
        {
          timestamp: "0:40.0",
          efecto: "alarm buzz distorted",
          intensidad: "fuerte",
          nota: "Pico de intensidad del video. El alarma es el clímax.",
        },
      ],
      texto_pantalla: {
        mostrar: true,
        texto: "04",
        posicion: "arriba-izquierda",
        estilo: "número grande semitransparente",
        desde: "0:40.0",
        hasta: "0:42.0",
      },
      transicion_siguiente: {
        tipo: "crossfade",
        duracion: 0.8,
      },
    },
    {
      segmento_id: 6,
      tiempo: "0:50 - 1:00",
      narracion_preview: "La buena noticia: podés cambiar...",
      motion: {
        tipo: "zoom_in",
        velocidad: "lento",
        desde: 1.0,
        hasta: 1.1,
        nota: "Zoom suave hacia el cuaderno = enfoque, intención, nuevo comienzo.",
      },
      broll_inserts: [
        {
          timestamp: "0:54.0 - 0:57.0",
          descripcion: "Amanecer sobre ciudad, timelapse suave",
          buscar_en_stock: "sunrise city timelapse warm cinematic",
          razon: "Cierre esperanzador — nuevo día, nueva oportunidad",
        },
      ],
      sfx: [
        {
          timestamp: "0:50.0",
          efecto: "uplifting whoosh",
          intensidad: "medio",
          nota: "Cambio de tono. De oscuro a esperanza.",
        },
      ],
      texto_pantalla: {
        mostrar: false,
      },
      transicion_siguiente: {
        tipo: "fade_out",
        duracion: 1.0,
      },
    },
  ],
  broll_shopping_list: [
    "person walking alone city night dark cinematic",
    "hand grabbing phone bed morning blue light",
    "fast food serving tray close up cinematic",
    "clock timelapse hours passing fast cinematic",
    "tired eyes closing macro cinematic slow motion",
    "sunrise city timelapse warm cinematic",
  ],
  sfx_shopping_list: [
    "Dark ambient riser (sutil)",
    "Whoosh transition (medio)",
    "Phone notification sound (sutil)",
    "Impact hit (medio)",
    "Whip transition (fuerte)",
    "Clock ticking (sutil)",
    "Alarm buzz distorted (fuerte)",
    "Uplifting whoosh (medio)",
  ],
  tips_finales: [
    "Los primeros 4 segmentos son oscuros — mantener temperatura de color fría",
    "El último segmento cambia a cálido — usar color grading diferente",
    "No saturar con b-roll. 2-3 segundos máximo por inserción",
    "Los SFX deben sentirse, no escucharse. Volume bajo (-12dB a -18dB)",
    "El shake del segmento 5 es el clímax — ahí va toda la energía",
  ],
};

// --- Pasos del pipeline (para navegación) ---
export const pipelineSteps = [
  {
    id: "input",
    label: "Input",
    subtitle: "Tu idea",
    href: "/input",
    color: "#6366f1",
    icon: "01",
  },
  {
    id: "script",
    label: "Script",
    subtitle: "Guión generado",
    href: "/script",
    color: "#8b5cf6",
    icon: "02",
  },
  {
    id: "director",
    label: "Director",
    subtitle: "Guía de edición",
    href: "/director",
    color: "#ec4899",
    icon: "03",
    isKey: true,
  },
  {
    id: "output",
    label: "Output",
    subtitle: "Video + reporte",
    href: "/output",
    color: "#10b981",
    icon: "04",
  },
];
