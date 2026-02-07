"""
Módulo 5: Video Assembler
Ensambla el video final con imágenes, audio, motions y transiciones.
Usa MoviePy para composición y efectos Ken Burns.
"""

import os
import numpy as np
from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    CompositeVideoClip,
    concatenate_videoclips,
    ColorClip,
    TextClip,
    CompositeAudioClip,
)
from moviepy.video.fx.all import resize, crop, fadein, fadeout
from PIL import Image


# === Resolución de salida (9:16 para Reels/TikTok) ===
OUTPUT_WIDTH = 1080
OUTPUT_HEIGHT = 1920
FPS = 30


def aplicar_motion(clip, motion_type: str, intensidad: float = 1.15):
    """
    Aplica un efecto de movimiento (Ken Burns) a un ImageClip.
    
    Args:
        clip: ImageClip de moviepy
        motion_type: Tipo de motion
        intensidad: Factor de zoom máximo (1.0 = sin zoom, 1.2 = 20% zoom)
    
    Returns:
        VideoClip con el motion aplicado
    """
    
    w, h = OUTPUT_WIDTH, OUTPUT_HEIGHT
    duration = clip.duration
    
    # Hacer la imagen más grande para permitir movimiento
    scale = intensidad + 0.05  # Un poco más grande que el zoom máximo
    big_w, big_h = int(w * scale), int(h * scale)
    
    # Redimensionar imagen para que sea más grande que el frame
    clip_big = clip.resize((big_w, big_h))
    
    if motion_type == "zoom_in" or motion_type == "zoom_in_lento":
        # Zoom IN: empieza normal, termina acercado
        def zoom_in(t):
            progress = t / duration
            current_scale = 1.0 + (intensidad - 1.0) * progress
            cw = int(w / current_scale)
            ch = int(h / current_scale)
            x = (big_w - cw) // 2
            y = (big_h - ch) // 2
            return clip_big.get_frame(t)[y:y+ch, x:x+cw]
        
        return clip_big.fl(lambda gf, t: zoom_in(t)).resize((w, h))
    
    elif motion_type == "zoom_out" or motion_type == "zoom_out_lento":
        # Zoom OUT: empieza acercado, termina normal
        def zoom_out(t):
            progress = t / duration
            current_scale = intensidad - (intensidad - 1.0) * progress
            cw = int(w / current_scale)
            ch = int(h / current_scale)
            x = (big_w - cw) // 2
            y = (big_h - ch) // 2
            return clip_big.get_frame(t)[y:y+ch, x:x+cw]
        
        return clip_big.fl(lambda gf, t: zoom_out(t)).resize((w, h))
    
    elif motion_type in ("pan_left", "pan_izquierda"):
        # Pan de derecha a izquierda
        def pan_l(t):
            progress = t / duration
            offset_x = int((big_w - w) * (1 - progress))
            offset_y = (big_h - h) // 2
            return clip_big.get_frame(t)[offset_y:offset_y+h, offset_x:offset_x+w]
        
        return clip_big.fl(lambda gf, t: pan_l(t)).resize((w, h))
    
    elif motion_type in ("pan_right", "pan_derecha"):
        # Pan de izquierda a derecha
        def pan_r(t):
            progress = t / duration
            offset_x = int((big_w - w) * progress)
            offset_y = (big_h - h) // 2
            return clip_big.get_frame(t)[offset_y:offset_y+h, offset_x:offset_x+w]
        
        return clip_big.fl(lambda gf, t: pan_r(t)).resize((w, h))
    
    elif motion_type in ("ken_burns_up", "ken_burns_arriba"):
        # Movimiento hacia arriba
        def kb_up(t):
            progress = t / duration
            offset_x = (big_w - w) // 2
            offset_y = int((big_h - h) * (1 - progress))
            return clip_big.get_frame(t)[offset_y:offset_y+h, offset_x:offset_x+w]
        
        return clip_big.fl(lambda gf, t: kb_up(t)).resize((w, h))
    
    elif motion_type in ("ken_burns_down", "ken_burns_abajo"):
        # Movimiento hacia abajo
        def kb_down(t):
            progress = t / duration
            offset_x = (big_w - w) // 2
            offset_y = int((big_h - h) * progress)
            return clip_big.get_frame(t)[offset_y:offset_y+h, offset_x:offset_x+w]
        
        return clip_big.fl(lambda gf, t: kb_down(t)).resize((w, h))
    
    else:
        # Static o desconocido: sin movimiento, solo centrar
        clip_resized = clip.resize((w, h))
        return clip_resized


def preparar_imagen(image_path: str, target_size: tuple = (OUTPUT_WIDTH, OUTPUT_HEIGHT)) -> str:
    """
    Redimensiona y adapta imagen al aspect ratio 9:16.
    """
    img = Image.open(image_path)
    
    # Calcular crop para 9:16
    target_ratio = target_size[0] / target_size[1]
    img_ratio = img.width / img.height
    
    if img_ratio > target_ratio:
        # Imagen más ancha: crop horizontal
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        img = img.crop((left, 0, left + new_width, img.height))
    else:
        # Imagen más alta: crop vertical
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        img = img.crop((0, top, img.width, top + new_height))
    
    # Redimensionar al tamaño final
    img = img.resize(target_size, Image.LANCZOS)
    
    # Guardar procesada
    processed_path = image_path.replace(".png", "_processed.png")
    img.save(processed_path)
    return processed_path


def ensamblar_video(
    script: dict,
    imagenes: list,
    audio_path: str,
    edl: dict = None,
    output_path: str = "assets/output/video_final.mp4",
    usar_motions: bool = True,
) -> str:
    """
    Ensambla el video final.
    
    Args:
        script: Guión estructurado
        imagenes: Lista de paths a imágenes
        audio_path: Path al audio completo
        edl: Edit Decision List (opcional, para motions avanzados)
        output_path: Path del video final
        usar_motions: Si aplica motions automáticos
    
    Returns:
        Path al video generado
    """
    
    segmentos = script.get("segmentos", [])
    timeline = edl.get("timeline", []) if edl else []
    
    if len(imagenes) < len(segmentos):
        print(f"⚠️  Hay {len(imagenes)} imágenes para {len(segmentos)} segmentos")
    
    # Cargar audio para obtener duración real
    audio = AudioFileClip(audio_path)
    duracion_total = audio.duration
    
    print(f"\n🎬 Ensamblando video...")
    print(f"   Segmentos: {len(segmentos)}")
    print(f"   Imágenes: {len(imagenes)}")
    print(f"   Audio: {duracion_total:.1f}s")
    
    clips = []
    
    for i, seg in enumerate(segmentos):
        if i >= len(imagenes):
            break
        
        # Calcular duración del segmento
        dur = seg.get("tiempo_fin", 0) - seg.get("tiempo_inicio", 0)
        if dur <= 0:
            dur = duracion_total / len(segmentos)
        
        # Preparar imagen
        img_path = preparar_imagen(imagenes[i])
        
        # Crear clip de imagen
        clip = ImageClip(img_path).set_duration(dur)
        
        # Aplicar motion
        if usar_motions:
            # Buscar motion en EDL primero, luego en script
            motion_type = "zoom_in_lento"  # default
            intensidad = 1.12
            
            if i < len(timeline):
                motion_info = timeline[i].get("motion", {})
                motion_type = motion_info.get("tipo", motion_type)
                intensidad = motion_info.get("hasta", intensidad)
            elif seg.get("motion"):
                motion_type = seg["motion"]
            
            print(f"   Seg {i+1}: {motion_type} ({dur:.1f}s)")
            clip = aplicar_motion(clip, motion_type, intensidad)
        else:
            clip = clip.resize((OUTPUT_WIDTH, OUTPUT_HEIGHT))
        
        # Aplicar fade in/out para transiciones suaves
        clip = clip.fx(fadein, 0.3).fx(fadeout, 0.3)
        
        clips.append(clip)
    
    if not clips:
        print("❌ No hay clips para ensamblar")
        return ""
    
    # Concatenar clips
    print("   Concatenando clips...")
    video = concatenate_videoclips(clips, method="compose")
    
    # Ajustar duración al audio
    if video.duration > duracion_total:
        video = video.subclip(0, duracion_total)
    
    # Agregar audio
    video = video.set_audio(audio)
    
    # Exportar
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print(f"   Exportando video ({OUTPUT_WIDTH}x{OUTPUT_HEIGHT})...")
    video.write_videofile(
        output_path,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        bitrate="5000k",
        preset="medium",
        threads=4,
        logger=None,  # Silenciar output de ffmpeg
    )
    
    # Limpiar
    video.close()
    audio.close()
    for c in clips:
        c.close()
    
    print(f"\n✅ Video exportado: {output_path}")
    print(f"   Duración: {duracion_total:.1f}s")
    
    return output_path


def generar_reporte_edicion(edl: dict, output_path: str = "assets/output/reporte_edicion.txt"):
    """
    Genera un reporte de texto legible con todas las instrucciones de edición.
    Útil para tener abierto mientras editás en CapCut/Premiere.
    """
    
    lines = []
    lines.append("=" * 60)
    lines.append(f"🎬 REPORTE DE EDICIÓN: {edl.get('titulo', '')}")
    lines.append(f"⏱️  Duración: {edl.get('duracion_total', '?')}s")
    lines.append("=" * 60)
    lines.append("")
    
    for item in edl.get("timeline", []):
        lines.append(f"--- SEGMENTO {item.get('segmento_id', '?')} [{item.get('tiempo', '')}] ---")
        
        motion = item.get("motion", {})
        lines.append(f"  MOTION: {motion.get('tipo', 'none')} "
                     f"| {motion.get('velocidad', '')} "
                     f"| {motion.get('desde', 1.0)}x → {motion.get('hasta', 1.0)}x")
        
        for br in item.get("broll_inserts", []):
            lines.append(f"  B-ROLL [{br.get('timestamp', '')}]: {br.get('descripcion', '')}")
            lines.append(f"    → Buscar: \"{br.get('buscar_en_stock', '')}\"")
        
        for sfx in item.get("sfx", []):
            lines.append(f"  SFX [{sfx.get('timestamp', '')}]: "
                        f"{sfx.get('efecto', '')} ({sfx.get('intensidad', '')})")
        
        txt = item.get("texto_pantalla", {})
        if txt and txt.get("mostrar"):
            lines.append(f"  TEXTO [{txt.get('desde', '')}-{txt.get('hasta', '')}]: "
                        f"\"{txt.get('texto', '')}\"")
        
        trans = item.get("transicion_siguiente", {})
        lines.append(f"  TRANSICIÓN → {trans.get('tipo', 'cut')} ({trans.get('duracion', 0)}s)")
        lines.append("")
    
    lines.append("=" * 60)
    lines.append("🛒 B-ROLL A BUSCAR:")
    for br in edl.get("broll_shopping_list", []):
        lines.append(f"  □ {br}")
    
    lines.append("")
    lines.append("🔊 SFX NECESARIOS:")
    for sfx in edl.get("sfx_shopping_list", []):
        lines.append(f"  □ {sfx}")
    
    lines.append("")
    lines.append("💡 TIPS:")
    for tip in edl.get("tips_finales", []):
        lines.append(f"  • {tip}")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    
    print(f"📋 Reporte guardado: {output_path}")
    return output_path
