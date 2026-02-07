# 🚀 GUÍA RÁPIDA — FacelessAI

## Instalación paso a paso (Windows/Mac/Linux)

### 1. Instalar Python
Si no tenés Python instalado:
- **Windows**: Descargá de https://python.org/downloads → Instalá con "Add to PATH" ✅
- **Mac**: `brew install python3` o descargá de python.org

Verificá: abrí terminal y escribí `python --version` (debe ser 3.9+)

### 2. Descargar el proyecto
Poné todos los archivos en una carpeta, por ejemplo: `C:\FacelessAI\` o `~/FacelessAI/`

### 3. Instalar dependencias
Abrí terminal en la carpeta del proyecto:
```bash
cd FacelessAI
pip install -r requirements.txt
```

### 4. Configurar API keys
```bash
# Copiar el archivo de ejemplo
cp .env.example .env    # Mac/Linux
copy .env.example .env  # Windows
```

Abrí `.env` con un editor de texto y poné tu key de OpenAI:
```
OPENAI_API_KEY=sk-tu-key-real-aqui
```

**¿Dónde saco la key?**
1. Andá a https://platform.openai.com/api-keys
2. Hacé click en "Create new secret key"
3. Copiala y pegala en el .env

### 5. Ejecutar

**Opción A — Terminal (más simple):**
```bash
python main.py
```
Te va a pedir el tema y configuración. Seguí las instrucciones.

**Opción B — Web App (más visual):**
```bash
streamlit run app.py
```
Se abre un navegador con la interfaz. Poné tu key en el sidebar.

---

## 💰 Costos por video

| API | Costo por video de 60s (~8 segmentos) |
|---|---|
| GPT-4o (script + EDL) | ~$0.03 |
| DALL-E 3 HD (8 imágenes) | ~$0.32 |
| ElevenLabs (narración) | ~$0.05 (depende del plan) |
| gTTS (alternativa gratis) | $0.00 |
| **Total con DALL-E + ElevenLabs** | **~$0.40/video** |
| **Total modo gratis (placeholders + gTTS)** | **~$0.03/video** |

---

## 🎯 Workflow sugerido

```
1. Ejecutar pipeline → genera video base + guía de edición
2. Abrir el reporte de edición (reporte_edicion.txt)
3. Importar el video en CapCut/Premiere
4. Seguir la guía:
   - Agregar b-roll donde indica
   - Agregar SFX donde indica
   - Ajustar timings si hace falta
5. Exportar y publicar
```

---

## ❓ Problemas comunes

**"No module named 'moviepy'"**
```bash
pip install moviepy imageio-ffmpeg
```

**"ffmpeg not found"**
```bash
pip install imageio-ffmpeg
# O instalar ffmpeg del sistema:
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

**"openai.AuthenticationError"**
→ Tu API key es incorrecta o expiró. Revisá el .env.

**"Rate limit exceeded" en DALL-E**
→ Esperá 1 minuto o bajá la cantidad de imágenes.

**El video se ve pixelado**
→ Usá imágenes de mayor resolución (1024x1792 en DALL-E).

**gTTS suena mal**
→ Es gratis, la calidad es limitada. Usá ElevenLabs para producción.
