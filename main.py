"""
🎬 FacelessAI — Pipeline Principal
===================================
Ejecutá este script para generar un video faceless completo.
Desde un tema → script → imágenes → audio → video con motions.

USO:
  python main.py

O importá la función pipeline() en tu código.

REQUISITOS:
  1. Copiá .env.example a .env y poné tus API keys
  2. pip install -r requirements.txt
  3. Tener ffmpeg instalado (viene con imageio-ffmpeg)
"""

import json
import os
import sys
import time
from dotenv import load_dotenv

load_dotenv()

from modules.script_generator import generar_script, refinar_script
from modules.image_generator import generar_imagenes_del_script, generar_placeholder
from modules.audio_generator import generar_audio_del_script
from modules.editing_director import generar_edl, imprimir_edl, guardar_edl
from modules.video_assembler import ensamblar_video, generar_reporte_edicion


def pipeline(
    tema: str,
    duracion: int = 60,
    estilo: str = "cinematográfico oscuro, alta calidad",
    tono: str = "informativo y enganchante",
    plataforma: str = "Instagram Reels / TikTok",
    usar_dalle: bool = True,
    usar_elevenlabs: bool = True,
    output_dir: str = "assets",
) -> dict:
    """
    Pipeline completo: tema → video con guía de edición.
    
    Args:
        tema: Tema del video
        duracion: Duración en segundos
        estilo: Estilo visual
        tono: Tono de narración
        plataforma: Plataforma destino
        usar_dalle: True para DALL-E, False para placeholders
        usar_elevenlabs: True para ElevenLabs, False para gTTS
        output_dir: Carpeta base de assets
    
    Returns:
        dict con paths a todos los archivos generados
    """
    
    resultado = {}
    inicio = time.time()
    
    print("\n" + "🎬" * 30)
    print(f"  FACELESSAI — Generando video sobre: '{tema}'")
    print("🎬" * 30 + "\n")
    
    # === PASO 1: Generar Script ===
    print("\n📝 PASO 1/5: Generando guión...")
    print("-" * 40)
    
    script = generar_script(
        tema=tema,
        duracion=duracion,
        estilo=estilo,
        tono=tono,
        plataforma=plataforma,
    )
    
    # Guardar script
    script_path = os.path.join(output_dir, "output", "script.json")
    os.makedirs(os.path.dirname(script_path), exist_ok=True)
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)
    resultado["script"] = script_path
    
    # === PASO 2: Generar EDL (Guía de Edición) ===
    print("\n🎬 PASO 2/5: Generando guía de edición...")
    print("-" * 40)
    
    edl = generar_edl(script)
    
    edl_path = os.path.join(output_dir, "output", "edl.json")
    guardar_edl(edl, edl_path)
    resultado["edl"] = edl_path
    
    # Generar reporte de edición legible
    reporte_path = os.path.join(output_dir, "output", "reporte_edicion.txt")
    generar_reporte_edicion(edl, reporte_path)
    resultado["reporte"] = reporte_path
    
    # Mostrar EDL
    imprimir_edl(edl)
    
    # === PASO 3: Generar Imágenes ===
    print("\n🖼️  PASO 3/5: Generando imágenes...")
    print("-" * 40)
    
    img_dir = os.path.join(output_dir, "images")
    
    if usar_dalle:
        imagenes = generar_imagenes_del_script(script, img_dir)
    else:
        # Modo gratis: placeholders
        imagenes = []
        for seg in script.get("segmentos", []):
            placeholder = generar_placeholder(
                texto=seg.get("visual_prompt", seg.get("narracion", ""))[:100],
                output_path=img_dir,
                filename=f"seg_{seg['id']:02d}",
            )
            imagenes.append(placeholder)
    
    resultado["imagenes"] = imagenes
    
    # === PASO 4: Generar Audio ===
    print("\n🎙️  PASO 4/5: Generando audio...")
    print("-" * 40)
    
    audio_dir = os.path.join(output_dir, "audio")
    
    audios = generar_audio_del_script(
        script=script,
        output_path=audio_dir,
        usar_elevenlabs=usar_elevenlabs,
    )
    
    resultado["audio_completo"] = audios["completo"]
    resultado["audio_segmentos"] = audios["segmentos"]
    
    # === PASO 5: Ensamblar Video ===
    print("\n🎥 PASO 5/5: Ensamblando video...")
    print("-" * 40)
    
    video_path = os.path.join(output_dir, "output", "video_final.mp4")
    
    video = ensamblar_video(
        script=script,
        imagenes=imagenes,
        audio_path=audios["completo"],
        edl=edl,
        output_path=video_path,
        usar_motions=True,
    )
    
    resultado["video"] = video
    
    # === RESUMEN ===
    tiempo_total = time.time() - inicio
    
    print("\n" + "✅" * 30)
    print(f"  VIDEO GENERADO EXITOSAMENTE")
    print("✅" * 30)
    print(f"\n⏱️  Tiempo total: {tiempo_total:.1f}s")
    print(f"\n📁 Archivos generados:")
    print(f"   📝 Script: {resultado.get('script', '')}")
    print(f"   🎬 EDL: {resultado.get('edl', '')}")
    print(f"   📋 Reporte: {resultado.get('reporte', '')}")
    print(f"   🖼️  Imágenes: {len(resultado.get('imagenes', []))} archivos")
    print(f"   🎙️  Audio: {resultado.get('audio_completo', '')}")
    print(f"   🎥 Video: {resultado.get('video', '')}")
    print(f"\n💡 SIGUIENTE PASO:")
    print(f"   1. Abrí el reporte de edición: {resultado.get('reporte', '')}")
    print(f"   2. Buscá el b-roll listado en Pexels/Pixabay")
    print(f"   3. Descargá los SFX de Freesound/Epidemic Sound")
    print(f"   4. Abrí CapCut/Premiere e importá el video")
    print(f"   5. Agregá b-roll y SFX según el reporte")
    print(f"   6. ¡Publicá! 🚀")
    
    return resultado


# === CLI ===
if __name__ == "__main__":
    # Verificar API key
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "sk-tu-key-aqui":
        print("❌ Configurá tu OPENAI_API_KEY en el archivo .env")
        print("   Copiá .env.example a .env y poné tu key")
        sys.exit(1)
    
    # Configuración
    print("🎬 FacelessAI — Generador de Videos Faceless")
    print("=" * 50)
    
    tema = input("\n📝 Tema del video: ").strip()
    if not tema:
        tema = "5 hábitos que te están arruinando la vida"
    
    duracion = input("⏱️  Duración en segundos (30/60/90) [60]: ").strip()
    duracion = int(duracion) if duracion else 60
    
    usar_dalle = input("🖼️  Usar DALL-E para imágenes? (s/n) [s]: ").strip().lower()
    usar_dalle = usar_dalle != "n"
    
    usar_elevenlabs = input("🎙️  Usar ElevenLabs para voz? (s/n) [n]: ").strip().lower()
    usar_elevenlabs = usar_elevenlabs == "s"
    
    # Ejecutar pipeline
    resultado = pipeline(
        tema=tema,
        duracion=duracion,
        usar_dalle=usar_dalle,
        usar_elevenlabs=usar_elevenlabs,
    )
