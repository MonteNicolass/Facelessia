"""
Módulo 4: Editing Director
Analiza el guión y genera instrucciones detalladas de edición.
Indica EXACTAMENTE dónde van motions, b-roll y SFX.
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DIRECTOR_PROMPT = """Sos un editor de video profesional especializado en contenido faceless viral.
Tu trabajo es analizar un guión y crear una GUÍA DE EDICIÓN DETALLADA.

Pensá como un editor de CapCut/Premiere que necesita instrucciones precisas.

Para cada segmento, definí:

1. **MOTION**: Qué movimiento aplicar a la imagen base
   - zoom_in: Acercar al centro (para momentos dramáticos, revelaciones)
   - zoom_out: Alejar (para dar contexto, mostrar panorama)
   - pan_left / pan_right: Paneo horizontal (transiciones, exploración)
   - ken_burns_up / ken_burns_down: Movimiento vertical lento
   - shake: Temblor (impacto, sorpresa, dato fuerte)
   - static: Sin movimiento (texto en pantalla, datos)
   - scale_pulse: Pulso de zoom rápido (para enfatizar algo)
   
   Incluí: velocidad (lento/medio/rapido), intensidad (1.0x a 1.3x)

2. **B-ROLL**: Momentos exactos donde insertar video real
   - Timestamp preciso (ej: "0:03.5 - 0:05.0")
   - Descripción de qué buscar (para Pexels, Pixabay, etc.)
   - Por qué ese b-roll ahí (contexto para el editor)
   - Sugerencia de búsqueda en inglés para stock

3. **SFX**: Efectos de sonido
   - Timestamp preciso
   - Nombre del efecto (whoosh, impact, transition, riser, etc.)
   - Intensidad (sutil/medio/fuerte)

4. **TRANSICIONES**: Entre segmentos
   - Tipo (cut, crossfade, whip, zoom_transition, glitch)
   - Duración

5. **TEXTO EN PANTALLA**: Si aplica
   - Qué texto mostrar
   - Posición y estilo sugerido
   - Timing de aparición/desaparición

Respondé ÚNICAMENTE con JSON válido."""


def generar_edl(script: dict) -> dict:
    """
    Genera un Edit Decision List (EDL) detallado.
    
    Args:
        script: Guión estructurado del script_generator
    
    Returns:
        dict con instrucciones de edición completas
    """
    
    prompt = f"""Analizá este guión y generá una guía de edición completa:

{json.dumps(script, ensure_ascii=False, indent=2)}

Respondé con este formato JSON:
{{
  "titulo": "nombre del proyecto",
  "duracion_total": number,
  "resumen_edicion": "descripción general del estilo de edición",
  "timeline": [
    {{
      "segmento_id": number,
      "tiempo": "0:00 - 0:08",
      "narracion_preview": "primeras palabras...",
      "motion": {{
        "tipo": "zoom_in",
        "velocidad": "lento",
        "desde": 1.0,
        "hasta": 1.15,
        "nota": "por qué este motion"
      }},
      "broll_inserts": [
        {{
          "timestamp": "0:03.0 - 0:05.0",
          "descripcion": "qué mostrar",
          "buscar_en_stock": "search query in english for Pexels",
          "razon": "por qué acá"
        }}
      ],
      "sfx": [
        {{
          "timestamp": "0:00.0",
          "efecto": "nombre del sfx",
          "intensidad": "sutil|medio|fuerte",
          "nota": "dark whoosh al entrar"
        }}
      ],
      "texto_pantalla": {{
        "mostrar": true,
        "texto": "texto a mostrar",
        "posicion": "centro|arriba|abajo",
        "estilo": "bold grande|subtítulo|número destacado",
        "desde": "0:01.0",
        "hasta": "0:04.0"
      }},
      "transicion_siguiente": {{
        "tipo": "crossfade|cut|whip|zoom",
        "duracion": 0.5
      }}
    }}
  ],
  "broll_shopping_list": [
    "Lista completa de b-roll a buscar con queries en inglés"
  ],
  "sfx_shopping_list": [
    "Lista completa de SFX necesarios"
  ],
  "tips_finales": [
    "Consejos de edición para el video"
  ]
}}"""
    
    print("🎬 Generando guía de edición (EDL)...")
    
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        messages=[
            {"role": "system", "content": DIRECTOR_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )
    
    edl = json.loads(response.choices[0].message.content)
    
    print(f"✅ EDL generada: {len(edl.get('timeline', []))} segmentos editados")
    
    return edl


def imprimir_edl(edl: dict):
    """
    Imprime la EDL de forma legible para el editor.
    """
    
    print("\n" + "=" * 70)
    print(f"🎬 GUÍA DE EDICIÓN: {edl.get('titulo', 'Sin título')}")
    print(f"⏱️  Duración: {edl.get('duracion_total', '?')}s")
    print(f"📝 {edl.get('resumen_edicion', '')}")
    print("=" * 70)
    
    for item in edl.get("timeline", []):
        print(f"\n{'─' * 50}")
        print(f"📌 SEGMENTO {item.get('segmento_id', '?')} — {item.get('tiempo', '?')}")
        print(f"   🗣️  \"{item.get('narracion_preview', '')}\"")
        
        # Motion
        motion = item.get("motion", {})
        if motion:
            print(f"   🎥 MOTION: {motion.get('tipo', 'none')} "
                  f"({motion.get('velocidad', '')} {motion.get('desde', 1.0)}x → {motion.get('hasta', 1.0)}x)")
            if motion.get("nota"):
                print(f"      💡 {motion['nota']}")
        
        # B-roll
        for br in item.get("broll_inserts", []):
            print(f"   📹 B-ROLL [{br.get('timestamp', '')}]: {br.get('descripcion', '')}")
            print(f"      🔍 Buscar: \"{br.get('buscar_en_stock', '')}\"")
            if br.get("razon"):
                print(f"      💡 {br['razon']}")
        
        # SFX
        for sfx in item.get("sfx", []):
            print(f"   🔊 SFX [{sfx.get('timestamp', '')}]: "
                  f"{sfx.get('efecto', '')} ({sfx.get('intensidad', '')})")
        
        # Texto en pantalla
        txt = item.get("texto_pantalla", {})
        if txt and txt.get("mostrar"):
            print(f"   📝 TEXTO [{txt.get('desde', '')} → {txt.get('hasta', '')}]: "
                  f"\"{txt.get('texto', '')}\" — {txt.get('estilo', '')}")
        
        # Transición
        trans = item.get("transicion_siguiente", {})
        if trans:
            print(f"   ↗️  TRANSICIÓN: {trans.get('tipo', 'cut')} ({trans.get('duracion', 0)}s)")
    
    # Shopping lists
    print(f"\n{'=' * 70}")
    print("🛒 B-ROLL QUE NECESITÁS BUSCAR:")
    for i, br in enumerate(edl.get("broll_shopping_list", []), 1):
        print(f"   {i}. {br}")
    
    print(f"\n🔊 SFX QUE NECESITÁS:")
    for i, sfx in enumerate(edl.get("sfx_shopping_list", []), 1):
        print(f"   {i}. {sfx}")
    
    print(f"\n💡 TIPS DE EDICIÓN:")
    for tip in edl.get("tips_finales", []):
        print(f"   • {tip}")
    
    print("\n" + "=" * 70)


def guardar_edl(edl: dict, output_path: str = "assets/output/edl.json"):
    """Guarda la EDL como archivo JSON."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(edl, f, ensure_ascii=False, indent=2)
    print(f"💾 EDL guardada: {output_path}")


# === TEST ===
if __name__ == "__main__":
    # Script de ejemplo para testear
    script_ejemplo = {
        "titulo": "Los peligros del azúcar",
        "duracion_total": 30,
        "estilo_visual": "cinematográfico oscuro",
        "segmentos": [
            {
                "id": 1,
                "tiempo_inicio": 0,
                "tiempo_fin": 10,
                "narracion": "Cada día consumís más azúcar de lo que pensás.",
                "visual_prompt": "Dark cinematic shot of sugar spoons",
                "motion": "zoom_in_lento",
            },
            {
                "id": 2,
                "tiempo_inicio": 10,
                "tiempo_fin": 20,
                "narracion": "Y lo peor es que está escondida en todo lo que comés.",
                "visual_prompt": "Hidden sugar in processed foods",
                "motion": "pan_derecha",
            },
            {
                "id": 3,
                "tiempo_inicio": 20,
                "tiempo_fin": 30,
                "narracion": "Pero hay una forma simple de evitarlo.",
                "visual_prompt": "Fresh healthy food, bright lighting",
                "motion": "zoom_out_lento",
            },
        ],
    }
    
    edl = generar_edl(script_ejemplo)
    imprimir_edl(edl)
