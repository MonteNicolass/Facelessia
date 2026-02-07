"""
Módulo 2: Image Generator
Genera imágenes con DALL-E 3 basadas en los prompts del guión.
"""

import os
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Prefijo de estilo para mantener consistencia visual entre imágenes
STYLE_PREFIX = """Cinematic, high quality, 4K, dramatic lighting, 
no text, no watermarks, no logos, no human faces visible, """


def generar_imagen(
    prompt: str,
    estilo_global: str = "",
    output_path: str = "assets/images",
    filename: str = "imagen",
    size: str = None,
    quality: str = None,
) -> str:
    """
    Genera una imagen con DALL-E 3.
    
    Args:
        prompt: Prompt descriptivo en inglés
        estilo_global: Estilo visual consistente del proyecto
        output_path: Carpeta de salida
        filename: Nombre del archivo (sin extensión)
        size: Tamaño (1024x1024, 1024x1792, 1792x1024)
        quality: standard o hd
    
    Returns:
        Path al archivo guardado
    """
    
    size = size or os.getenv("IMAGE_SIZE", "1024x1792")
    quality = quality or os.getenv("IMAGE_QUALITY", "hd")
    
    # Combinar estilo global + prompt específico
    full_prompt = f"{STYLE_PREFIX}{estilo_global}. {prompt}"
    
    # Limitar a 4000 chars (límite de DALL-E)
    full_prompt = full_prompt[:4000]
    
    print(f"🖼️  Generando imagen: {filename}...")
    
    response = client.images.generate(
        model="dall-e-3",
        prompt=full_prompt,
        n=1,
        size=size,
        quality=quality,
    )
    
    image_url = response.data[0].url
    revised_prompt = response.data[0].revised_prompt
    
    # Descargar imagen
    os.makedirs(output_path, exist_ok=True)
    filepath = os.path.join(output_path, f"{filename}.png")
    
    img_data = requests.get(image_url).content
    with open(filepath, "wb") as f:
        f.write(img_data)
    
    print(f"✅ Imagen guardada: {filepath}")
    print(f"   Prompt revisado: {revised_prompt[:80]}...")
    
    return filepath


def generar_imagenes_del_script(script: dict, output_path: str = "assets/images") -> list:
    """
    Genera todas las imágenes del guión.
    
    Args:
        script: Guión estructurado (output de script_generator)
        output_path: Carpeta de salida
    
    Returns:
        Lista de paths a las imágenes generadas
    """
    
    estilo = script.get("estilo_visual", "")
    segmentos = script.get("segmentos", [])
    imagenes = []
    
    print(f"\n🎨 Generando {len(segmentos)} imágenes...")
    print(f"   Estilo: {estilo[:60]}...")
    
    for seg in segmentos:
        seg_id = seg["id"]
        prompt = seg.get("visual_prompt", seg.get("visual", ""))
        
        if not prompt:
            print(f"⚠️  Segmento {seg_id} sin prompt visual, saltando...")
            continue
        
        filepath = generar_imagen(
            prompt=prompt,
            estilo_global=estilo,
            output_path=output_path,
            filename=f"seg_{seg_id:02d}",
        )
        imagenes.append(filepath)
    
    print(f"\n✅ {len(imagenes)} imágenes generadas en {output_path}/")
    return imagenes


# === ALTERNATIVA GRATIS: Placeholder con Pillow ===
def generar_placeholder(
    texto: str,
    output_path: str = "assets/images",
    filename: str = "placeholder",
    size: tuple = (1080, 1920),
) -> str:
    """
    Genera una imagen placeholder con texto (para testear sin gastar en API).
    """
    from PIL import Image, ImageDraw, ImageFont
    
    img = Image.new("RGB", size, color=(30, 30, 35))
    draw = ImageDraw.Draw(img)
    
    # Texto centrado
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
    except OSError:
        font = ImageFont.load_default()
    
    # Word wrap básico
    words = texto.split()
    lines = []
    current_line = ""
    for word in words:
        test = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] < size[0] - 80:
            current_line = test
        else:
            lines.append(current_line)
            current_line = word
    lines.append(current_line)
    
    y = size[1] // 2 - len(lines) * 25
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        draw.text(((size[0] - w) // 2, y), line, fill=(200, 200, 210), font=font)
        y += 50
    
    os.makedirs(output_path, exist_ok=True)
    filepath = os.path.join(output_path, f"{filename}.png")
    img.save(filepath)
    print(f"✅ Placeholder: {filepath}")
    return filepath


# === TEST ===
if __name__ == "__main__":
    # Test con placeholder (gratis)
    generar_placeholder(
        "Segmento 1: Cucharas de azúcar apiladas",
        filename="test_seg_01",
    )
