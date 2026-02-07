"""
Módulo 1: Script Generator
Genera guiones estructurados con timestamps, cues de motion, b-roll y SFX.
Usa GPT-4o o Claude para generar contenido.
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """Sos un director creativo experto en contenido faceless para redes sociales.
Tu trabajo es crear guiones estructurados en JSON para videos cortos.

REGLAS:
- Escribí la narración en español argentino natural (vos, tenés, etc.)
- Cada segmento debe durar entre 5 y 10 segundos
- Las descripciones visuales deben ser detalladas para generar imágenes con IA
- Sugerí motions cinematográficos específicos
- Sugerí b-roll relevante y buscable
- Sugerí SFX apropiados para cada momento

MOTIONS DISPONIBLES:
- zoom_in_lento: Zoom suave hacia el centro (dramático, revelación)
- zoom_out_lento: Zoom alejándose (contexto, panorámica)
- pan_izquierda: Paneo horizontal izquierda (transición, exploración)
- pan_derecha: Paneo horizontal derecha (transición, exploración)
- ken_burns_arriba: Movimiento lento hacia arriba (ascenso, esperanza)
- ken_burns_abajo: Movimiento lento hacia abajo (descenso, peso)
- shake_suave: Temblor sutil (impacto, sorpresa)
- static: Sin movimiento (datos, texto en pantalla)

Respondé ÚNICAMENTE con JSON válido, sin markdown ni explicaciones."""

USER_PROMPT_TEMPLATE = """Creá un guión para un video de {duracion} segundos sobre: "{tema}"

Estilo: {estilo}
Tono: {tono}
Plataforma: {plataforma}

Respondé con este formato JSON exacto:
{{
  "titulo": "string",
  "duracion_total": number,
  "estilo_visual": "descripción del estilo consistente para todas las imágenes",
  "segmentos": [
    {{
      "id": number,
      "tiempo_inicio": number,
      "tiempo_fin": number,
      "narracion": "texto que se narra en voz",
      "visual_prompt": "prompt detallado en INGLÉS para DALL-E, incluyendo estilo",
      "motion": "tipo_de_motion",
      "motion_intensidad": "suave|medio|fuerte",
      "broll_sugerido": "descripción de b-roll para buscar, en español",
      "broll_timestamp": "momento exacto donde insertar b-roll (ej: 0:03-0:05)",
      "sfx_sugerido": "nombre/descripción del efecto de sonido",
      "sfx_timestamp": "momento del sfx",
      "transicion_siguiente": "tipo de transición al siguiente segmento"
    }}
  ],
  "broll_resumen": ["lista de todos los b-roll que el usuario necesita buscar"],
  "sfx_resumen": ["lista de todos los sfx que el usuario necesita"],
  "notas_edicion": "consejos generales para la edición final"
}}"""


def generar_script(
    tema: str,
    duracion: int = 60,
    estilo: str = "cinematográfico oscuro",
    tono: str = "informativo y enganchante",
    plataforma: str = "Instagram Reels / TikTok",
) -> dict:
    """
    Genera un guión estructurado completo.
    
    Args:
        tema: El tema del video
        duracion: Duración en segundos (30, 60, 90)
        estilo: Estilo visual del contenido
        tono: Tono de la narración
        plataforma: Plataforma destino
    
    Returns:
        dict con el guión estructurado
    """
    
    user_prompt = USER_PROMPT_TEMPLATE.format(
        duracion=duracion,
        tema=tema,
        estilo=estilo,
        tono=tono,
        plataforma=plataforma,
    )
    
    print(f"🎬 Generando guión sobre: '{tema}'...")
    print(f"   Duración: {duracion}s | Estilo: {estilo}")
    
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.8,
        response_format={"type": "json_object"},
    )
    
    script = json.loads(response.choices[0].message.content)
    
    print(f"✅ Guión generado: '{script.get('titulo', tema)}'")
    print(f"   Segmentos: {len(script.get('segmentos', []))}")
    
    return script


def refinar_script(script: dict, feedback: str) -> dict:
    """
    Refina un guión existente basado en feedback del usuario.
    """
    
    prompt = f"""Tenés este guión:
{json.dumps(script, ensure_ascii=False, indent=2)}

El usuario pide estos cambios: "{feedback}"

Devolvé el guión COMPLETO modificado en el mismo formato JSON."""
    
    print(f"🔄 Refinando guión con feedback: '{feedback[:50]}...'")
    
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )
    
    refined = json.loads(response.choices[0].message.content)
    print("✅ Guión refinado")
    return refined


# === TEST ===
if __name__ == "__main__":
    script = generar_script(
        tema="5 hábitos que te están arruinando la vida sin que te des cuenta",
        duracion=60,
    )
    print(json.dumps(script, ensure_ascii=False, indent=2))
