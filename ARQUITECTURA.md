# 🎬 FacelessAI — Herramienta de Contenido Faceless Automatizado

## 1. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                   │
│                  (Ingresa tema/idea)                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│               MÓDULO 1: SCRIPT GENERATOR                         │
│  • GPT-4o / Claude genera guión con timestamps                   │
│  • Incluye: narración, notas de visual, motion cues, b-roll cues│
│  • Output: JSON estructurado con timeline                        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│               MÓDULO 2: ASSET GENERATOR                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  IMÁGENES    │  │   AUDIO      │  │  MOTIONS     │          │
│  │  DALL-E 3    │  │  ElevenLabs  │  │  Claude JSX  │          │
│  │  Midjourney  │  │  Google TTS  │  │  CSS Anim    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│               MÓDULO 3: EDITING DIRECTOR                         │
│  • Analiza el script y sugiere:                                  │
│    - Dónde va cada motion (zoom, pan, shake, fade)               │
│    - Dónde insertar b-roll (con descripción para buscar)         │
│    - Timing de cortes y transiciones                             │
│    - SFX sugeridos (con nombre/categoría)                        │
│  • Output: EDL (Edit Decision List) en JSON                      │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│               MÓDULO 4: VIDEO ASSEMBLER                          │
│  • MoviePy ensambla: imágenes + audio + motions                  │
│  • Aplica Ken Burns, zooms, pans automáticos                     │
│  • Deja marcas para b-roll manual                                │
│  • Exporta video casi-listo (.mp4)                               │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│               OUTPUT FINAL                                       │
│  • Video .mp4 con motions aplicados                              │
│  • Lista de b-roll necesario (con timestamps)                    │
│  • Lista de SFX sugeridos (con timestamps)                       │
│  • El usuario solo agrega b-roll + SFX = VIDEO LISTO            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUJO DE TRABAJO DETALLADO

### Paso 1: Input del usuario
```
"Haceme un video de 60 segundos sobre los peligros del azúcar"
```

### Paso 2: Script Generator (GPT-4o/Claude)
Genera un JSON estructurado:
```json
{
  "titulo": "Los peligros ocultos del azúcar",
  "duracion_total": 60,
  "segmentos": [
    {
      "id": 1,
      "tiempo_inicio": 0,
      "tiempo_fin": 8,
      "narracion": "Cada día consumís más azúcar de lo que pensás...",
      "visual": "Imagen oscura de cucharas de azúcar apiladas",
      "motion": "zoom_in_lento",
      "broll_sugerido": "persona sirviendo azúcar en café, close-up",
      "sfx_sugerido": "impacto dramático suave"
    }
  ]
}
```

### Paso 3: Asset Generation
- Se genera 1 imagen por segmento con DALL-E
- Se genera el audio completo con ElevenLabs
- Se generan motions con CSS/código (para futuro)

### Paso 4: Editing Director
La IA analiza el script y genera una **Edit Decision List (EDL)**:
```json
{
  "edl": [
    {
      "segmento": 1,
      "accion": "IMAGEN con zoom_in 1.0x → 1.15x en 8s",
      "broll_insertar": "0:03-0:05 — buscar: 'azúcar café close-up'",
      "sfx": "0:00 — whoosh suave al entrar",
      "transicion_siguiente": "crossfade 0.5s"
    }
  ]
}
```

### Paso 5: Ensamblaje automático
MoviePy crea el video con:
- Imágenes con Ken Burns effect (zoom/pan)
- Audio sincronizado
- Transiciones entre segmentos
- Marcas visuales de dónde va b-roll

---

## 3. HERRAMIENTAS Y APIs

| Componente | Herramienta | Costo aprox. | Alternativa gratis |
|---|---|---|---|
| Script | GPT-4o API | ~$0.01/script | Claude (ya tenés) |
| Imágenes | DALL-E 3 API | ~$0.04/imagen | Stable Diffusion local |
| Audio/Voz | ElevenLabs API | $5-22/mes | gTTS (gratis, menor calidad) |
| Motions | MoviePy + código | Gratis | ffmpeg directo |
| Video | MoviePy | Gratis | ffmpeg |
| Web App | Streamlit | Gratis | Flask |

### APIs necesarias:
1. **OpenAI API Key** — para DALL-E y GPT-4o → https://platform.openai.com
2. **ElevenLabs API Key** — para voces → https://elevenlabs.io
3. **Pexels API Key** (opcional) — para b-roll stock gratis → https://www.pexels.com/api/

---

## 4. ESTRUCTURA DEL PROYECTO

```
facelessai/
├── main.py                 # Script principal - pipeline completo
├── app.py                  # Streamlit web app
├── modules/
│   ├── __init__.py
│   ├── script_generator.py # Genera guiones con IA
│   ├── image_generator.py  # Genera imágenes con DALL-E
│   ├── audio_generator.py  # Genera audio con ElevenLabs/gTTS
│   ├── editing_director.py # Analiza y sugiere edición
│   └── video_assembler.py  # Ensambla video final
├── assets/
│   ├── images/             # Imágenes generadas
│   ├── audio/              # Audio generado
│   └── output/             # Videos finales
├── requirements.txt
└── .env                    # API keys
```

---

## 5. MONETIZACIÓN Y COMUNIDAD

### Modelo de negocio sugerido:

**Tier 1 — Gratis (Lead magnet)**
- 3 videos/mes
- Voz gTTS (calidad básica)
- Sin b-roll suggestions
- Marca de agua

**Tier 2 — Pro ($29/mes en Skool o Whop)**
- Videos ilimitados
- Voces ElevenLabs premium
- Editing Director completo
- Sin marca de agua
- Acceso a comunidad

**Tier 3 — Agency ($97/mes)**
- Todo lo Pro
- Clonación de voz
- Templates personalizados
- Soporte prioritario
- Sesiones grupales semanales

### Plataformas para comunidad:
- **Skool** ($99/mes la plataforma) — ideal para cursos + comunidad
- **Whop** — más flexible, permite vender acceso a la herramienta
- **Discord** — gratis, pero menos profesional

---

## 6. ERRORES COMUNES Y SOLUCIONES

| Error | Causa | Solución |
|---|---|---|
| `moviepy` no encuentra ffmpeg | No está instalado | `pip install imageio-ffmpeg` o instalar ffmpeg del sistema |
| DALL-E rechaza prompt | Contenido prohibido | Agregar filtro de prompts antes de enviar |
| Audio desincronizado | Duración mal calculada | Usar duración real del audio como referencia |
| ElevenLabs error 429 | Rate limit | Implementar retry con exponential backoff |
| Video muy pesado | Resolución alta sin comprimir | Exportar en 1080p con bitrate controlado |
| gTTS suena robótico | Es la limitación de la herramienta | Migrar a ElevenLabs cuando sea viable |
| Imágenes inconsistentes | Prompts vagos | Usar prompt template con estilo fijo |
| Streamlit se cuelga | Proceso largo sin async | Usar `st.spinner()` y procesar en background |

---

## 7. ROADMAP DE DESARROLLO

### Fase 1 (Semana 1-2): Prototipo CLI ✅
- Script generator + DALL-E + gTTS + MoviePy
- Pipeline completo por terminal
- Editing Director básico

### Fase 2 (Semana 3-4): Web App
- Streamlit con interfaz visual
- Preview de assets antes de ensamblar
- Descarga directa del video

### Fase 3 (Mes 2): Editing Director Avanzado
- Motions automáticos con MoviePy (Ken Burns)
- B-roll suggestions con links a Pexels
- SFX categorization

### Fase 4 (Mes 3): Motions con Claude
- Generar animaciones CSS/React con Claude
- Renderizar motions a video
- Integrar como capa sobre imágenes

### Fase 5 (Mes 4+): Producción
- Deploy en servidor (Railway/Render)
- Sistema de usuarios y créditos
- Comunidad paga en Skool/Whop
