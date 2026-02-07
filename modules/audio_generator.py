"""
Módulo 3: Audio Generator
Genera narración con ElevenLabs (premium) o gTTS (gratis).
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()


def generar_audio_elevenlabs(
    texto: str,
    output_path: str = "assets/audio",
    filename: str = "narracion",
    voice_id: str = None,
    stability: float = 0.5,
    similarity: float = 0.75,
    style: float = 0.3,
) -> str:
    """
    Genera audio con ElevenLabs API.
    
    Args:
        texto: Texto a narrar
        output_path: Carpeta de salida
        filename: Nombre sin extensión
        voice_id: ID de voz (usar panel de ElevenLabs para elegir)
        stability: Estabilidad de voz (0-1, más bajo = más expresivo)
        similarity: Similitud (0-1)
        style: Estilo (0-1)
    
    Returns:
        Path al archivo .mp3
    """
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = voice_id or os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    
    if not api_key:
        print("⚠️  No hay API key de ElevenLabs, usando gTTS como fallback...")
        return generar_audio_gtts(texto, output_path, filename)
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
    
    data = {
        "text": texto,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity,
            "style": style,
            "use_speaker_boost": True,
        },
    }
    
    print(f"🎙️  Generando audio ElevenLabs: {filename}...")
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error ElevenLabs ({response.status_code}): {response.text[:200]}")
        print("   Usando gTTS como fallback...")
        return generar_audio_gtts(texto, output_path, filename)
    
    os.makedirs(output_path, exist_ok=True)
    filepath = os.path.join(output_path, f"{filename}.mp3")
    
    with open(filepath, "wb") as f:
        f.write(response.content)
    
    print(f"✅ Audio guardado: {filepath}")
    return filepath


def generar_audio_gtts(
    texto: str,
    output_path: str = "assets/audio",
    filename: str = "narracion",
    lang: str = "es",
    slow: bool = False,
) -> str:
    """
    Genera audio con Google Text-to-Speech (gratis, menor calidad).
    
    Args:
        texto: Texto a narrar
        output_path: Carpeta de salida
        filename: Nombre sin extensión
        lang: Idioma (es = español)
        slow: Si habla más lento
    
    Returns:
        Path al archivo .mp3
    """
    from gtts import gTTS
    
    print(f"🎙️  Generando audio gTTS: {filename}...")
    
    tts = gTTS(text=texto, lang=lang, slow=slow)
    
    os.makedirs(output_path, exist_ok=True)
    filepath = os.path.join(output_path, f"{filename}.mp3")
    tts.save(filepath)
    
    print(f"✅ Audio guardado: {filepath}")
    return filepath


def generar_audio_del_script(
    script: dict,
    output_path: str = "assets/audio",
    usar_elevenlabs: bool = True,
) -> dict:
    """
    Genera todo el audio del guión.
    Puede generar un solo archivo con toda la narración o uno por segmento.
    
    Args:
        script: Guión estructurado
        output_path: Carpeta de salida
        usar_elevenlabs: True para ElevenLabs, False para gTTS
    
    Returns:
        dict con paths: {"completo": path, "segmentos": [paths]}
    """
    
    segmentos = script.get("segmentos", [])
    
    # === Audio completo (toda la narración junta) ===
    narracion_completa = " ".join(
        seg.get("narracion", "") for seg in segmentos
    )
    
    print(f"\n🎙️  Generando audio para {len(segmentos)} segmentos...")
    
    gen_func = generar_audio_elevenlabs if usar_elevenlabs else generar_audio_gtts
    
    audio_completo = gen_func(
        texto=narracion_completa,
        output_path=output_path,
        filename="narracion_completa",
    )
    
    # === Audio por segmento (útil para sincronización precisa) ===
    audios_segmentos = []
    for seg in segmentos:
        narracion = seg.get("narracion", "")
        if not narracion:
            continue
        
        audio_seg = gen_func(
            texto=narracion,
            output_path=output_path,
            filename=f"seg_{seg['id']:02d}",
        )
        audios_segmentos.append(audio_seg)
    
    resultado = {
        "completo": audio_completo,
        "segmentos": audios_segmentos,
    }
    
    print(f"\n✅ Audio generado: 1 completo + {len(audios_segmentos)} segmentos")
    return resultado


def listar_voces_elevenlabs() -> list:
    """Lista las voces disponibles en tu cuenta de ElevenLabs."""
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        print("❌ No hay API key de ElevenLabs")
        return []
    
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {"xi-api-key": api_key}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        return []
    
    voces = response.json().get("voices", [])
    
    print(f"🎤 Voces disponibles ({len(voces)}):")
    for v in voces:
        print(f"   • {v['name']} — ID: {v['voice_id']} — Labels: {v.get('labels', {})}")
    
    return voces


# === TEST ===
if __name__ == "__main__":
    # Test con gTTS (gratis)
    generar_audio_gtts(
        "Cada día consumís más azúcar de lo que pensás. "
        "Y lo peor es que ni te das cuenta.",
        filename="test_narracion",
    )
