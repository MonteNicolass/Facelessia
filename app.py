"""
🎬 FacelessAI — Web App (Streamlit)
====================================
Interfaz visual para generar videos faceless.

EJECUTAR:
  streamlit run app.py

REQUISITOS:
  - Tener .env configurado con API keys
  - pip install -r requirements.txt
"""

import streamlit as st
import json
import os
import time
from dotenv import load_dotenv

load_dotenv()

# === Página ===
st.set_page_config(
    page_title="FacelessAI",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# === CSS Custom ===
st.markdown("""
<style>
    .main { background-color: #0e0e0e; }
    .stApp { background-color: #0e0e0e; }
    
    h1 { 
        background: linear-gradient(90deg, #ff6b6b, #ffa500, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 2.5rem !important;
    }
    
    .metric-card {
        background: #1a1a2e;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid #333;
    }
    
    .step-badge {
        background: #ff6b6b;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.8rem;
    }
    
    .edl-segment {
        background: #1a1a2e;
        border-left: 4px solid #ff6b6b;
        padding: 15px;
        margin: 10px 0;
        border-radius: 0 8px 8px 0;
    }
    
    .broll-item {
        background: #162447;
        padding: 10px;
        border-radius: 8px;
        margin: 5px 0;
    }
    
    .sfx-item {
        background: #1f4037;
        padding: 10px;
        border-radius: 8px;
        margin: 5px 0;
    }
</style>
""", unsafe_allow_html=True)


# === Estado ===
if "script" not in st.session_state:
    st.session_state.script = None
if "edl" not in st.session_state:
    st.session_state.edl = None
if "imagenes" not in st.session_state:
    st.session_state.imagenes = []
if "audio" not in st.session_state:
    st.session_state.audio = None
if "video" not in st.session_state:
    st.session_state.video = None
if "step" not in st.session_state:
    st.session_state.step = 0


# === Sidebar ===
with st.sidebar:
    st.title("⚙️ Configuración")
    
    st.subheader("🔑 API Keys")
    openai_key = st.text_input(
        "OpenAI API Key", 
        value=os.getenv("OPENAI_API_KEY", ""),
        type="password",
    )
    elevenlabs_key = st.text_input(
        "ElevenLabs Key (opcional)",
        value=os.getenv("ELEVENLABS_API_KEY", ""),
        type="password",
    )
    
    st.divider()
    
    st.subheader("🎨 Estilo")
    estilo = st.selectbox("Estilo visual", [
        "cinematográfico oscuro",
        "minimalista clean",
        "neon futurista",
        "vintage retro",
        "naturaleza orgánica",
        "corporativo profesional",
    ])
    
    tono = st.selectbox("Tono", [
        "informativo y enganchante",
        "dramático y misterioso",
        "motivacional",
        "casual y cercano",
        "educativo",
    ])
    
    plataforma = st.selectbox("Plataforma", [
        "Instagram Reels / TikTok",
        "YouTube Shorts",
        "YouTube (horizontal)",
    ])
    
    duracion = st.select_slider(
        "Duración (segundos)",
        options=[30, 45, 60, 90],
        value=60,
    )
    
    st.divider()
    
    st.subheader("🛠️ Opciones")
    usar_dalle = st.toggle("Usar DALL-E (cuesta ~$0.04/img)", value=True)
    usar_elevenlabs = st.toggle("Usar ElevenLabs", value=bool(elevenlabs_key))
    
    st.divider()
    
    # Progreso
    st.subheader("📊 Progreso")
    steps = ["Script", "EDL", "Imágenes", "Audio", "Video"]
    for i, step_name in enumerate(steps):
        if i < st.session_state.step:
            st.markdown(f"✅ {step_name}")
        elif i == st.session_state.step:
            st.markdown(f"🔄 {step_name}")
        else:
            st.markdown(f"⬜ {step_name}")


# === Header ===
st.title("🎬 FacelessAI")
st.caption("Generá videos faceless con IA — desde una idea hasta un video casi listo")

st.divider()


# === Input ===
tema = st.text_area(
    "📝 ¿Sobre qué querés hacer el video?",
    placeholder="Ej: 5 hábitos que te están arruinando la vida sin que te des cuenta",
    height=80,
)

col1, col2, col3 = st.columns([2, 1, 1])

with col1:
    generar_todo = st.button("🚀 Generar Todo", type="primary", use_container_width=True)
with col2:
    solo_script = st.button("📝 Solo Script", use_container_width=True)
with col3:
    solo_edl = st.button("🎬 Solo EDL", use_container_width=True, disabled=not st.session_state.script)


# === Funciones de generación ===
def gen_script():
    """Genera el script."""
    if not openai_key:
        st.error("❌ Necesitás la API key de OpenAI")
        return
    
    os.environ["OPENAI_API_KEY"] = openai_key
    
    from modules.script_generator import generar_script
    
    with st.spinner("📝 Generando guión..."):
        script = generar_script(
            tema=tema,
            duracion=duracion,
            estilo=estilo,
            tono=tono,
            plataforma=plataforma,
        )
    
    st.session_state.script = script
    st.session_state.step = 1
    return script


def gen_edl(script):
    """Genera la EDL."""
    from modules.editing_director import generar_edl
    
    with st.spinner("🎬 Analizando edición..."):
        edl = generar_edl(script)
    
    st.session_state.edl = edl
    st.session_state.step = 2
    return edl


def gen_imagenes(script):
    """Genera imágenes."""
    if usar_dalle:
        from modules.image_generator import generar_imagenes_del_script
        with st.spinner(f"🖼️ Generando {len(script.get('segmentos', []))} imágenes con DALL-E..."):
            imagenes = generar_imagenes_del_script(script, "assets/images")
    else:
        from modules.image_generator import generar_placeholder
        imagenes = []
        with st.spinner("🖼️ Generando placeholders..."):
            for seg in script.get("segmentos", []):
                img = generar_placeholder(
                    texto=seg.get("visual_prompt", "")[:80],
                    filename=f"seg_{seg['id']:02d}",
                )
                imagenes.append(img)
    
    st.session_state.imagenes = imagenes
    st.session_state.step = 3
    return imagenes


def gen_audio(script):
    """Genera audio."""
    if usar_elevenlabs and elevenlabs_key:
        os.environ["ELEVENLABS_API_KEY"] = elevenlabs_key
    
    from modules.audio_generator import generar_audio_del_script
    
    with st.spinner("🎙️ Generando narración..."):
        audios = generar_audio_del_script(
            script=script,
            usar_elevenlabs=usar_elevenlabs and bool(elevenlabs_key),
        )
    
    st.session_state.audio = audios
    st.session_state.step = 4
    return audios


def gen_video(script, imagenes, audio_path, edl):
    """Ensambla video."""
    from modules.video_assembler import ensamblar_video
    
    with st.spinner("🎥 Ensamblando video con motions..."):
        video = ensamblar_video(
            script=script,
            imagenes=imagenes,
            audio_path=audio_path,
            edl=edl,
        )
    
    st.session_state.video = video
    st.session_state.step = 5
    return video


# === Ejecutar ===
if solo_script and tema:
    gen_script()

if solo_edl and st.session_state.script:
    gen_edl(st.session_state.script)

if generar_todo and tema:
    script = gen_script()
    if script:
        edl = gen_edl(script)
        imagenes = gen_imagenes(script)
        audios = gen_audio(script)
        if imagenes and audios:
            video = gen_video(script, imagenes, audios["completo"], edl)


# === Mostrar Resultados ===
st.divider()

# --- Script ---
if st.session_state.script:
    script = st.session_state.script
    
    with st.expander("📝 GUIÓN", expanded=True):
        st.subheader(script.get("titulo", "Sin título"))
        st.caption(f"Duración: {script.get('duracion_total', '?')}s | Segmentos: {len(script.get('segmentos', []))}")
        
        for seg in script.get("segmentos", []):
            col_a, col_b = st.columns([1, 1])
            with col_a:
                st.markdown(f"**Seg {seg.get('id', '?')}** ({seg.get('tiempo_inicio', 0)}s - {seg.get('tiempo_fin', 0)}s)")
                st.write(f"🗣️ _{seg.get('narracion', '')}_")
            with col_b:
                st.code(seg.get("visual_prompt", ""), language=None)
                st.caption(f"Motion: {seg.get('motion', 'N/A')}")
        
        # Botón de refinamiento
        feedback = st.text_input("🔄 ¿Querés cambiar algo del guión?", placeholder="Ej: hacelo más dramático")
        if feedback and st.button("Refinar"):
            from modules.script_generator import refinar_script
            with st.spinner("Refinando..."):
                st.session_state.script = refinar_script(script, feedback)
            st.rerun()

# --- EDL ---
if st.session_state.edl:
    edl = st.session_state.edl
    
    with st.expander("🎬 GUÍA DE EDICIÓN", expanded=True):
        st.subheader("Edit Decision List")
        st.info(edl.get("resumen_edicion", ""))
        
        for item in edl.get("timeline", []):
            st.markdown(f"""
            <div class="edl-segment">
                <strong>Segmento {item.get('segmento_id', '?')}</strong> — {item.get('tiempo', '')}
                <br>
                🎥 Motion: <code>{item.get('motion', {}).get('tipo', 'N/A')}</code> 
                ({item.get('motion', {}).get('velocidad', '')})
            </div>
            """, unsafe_allow_html=True)
            
            # B-roll
            for br in item.get("broll_inserts", []):
                st.markdown(f"""
                <div class="broll-item">
                    📹 <strong>B-ROLL</strong> [{br.get('timestamp', '')}]<br>
                    {br.get('descripcion', '')}<br>
                    🔍 Buscar: <em>"{br.get('buscar_en_stock', '')}"</em>
                </div>
                """, unsafe_allow_html=True)
            
            # SFX
            for sfx in item.get("sfx", []):
                st.markdown(f"""
                <div class="sfx-item">
                    🔊 <strong>SFX</strong> [{sfx.get('timestamp', '')}]: 
                    {sfx.get('efecto', '')} ({sfx.get('intensidad', '')})
                </div>
                """, unsafe_allow_html=True)
        
        # Shopping lists
        st.subheader("🛒 Lo que necesitás buscar")
        
        col_br, col_sfx = st.columns(2)
        with col_br:
            st.markdown("**📹 B-Roll:**")
            for br in edl.get("broll_shopping_list", []):
                st.checkbox(br, key=f"br_{br[:20]}")
        
        with col_sfx:
            st.markdown("**🔊 SFX:**")
            for sfx in edl.get("sfx_shopping_list", []):
                st.checkbox(sfx, key=f"sfx_{sfx[:20]}")

# --- Imágenes ---
if st.session_state.imagenes:
    with st.expander("🖼️ IMÁGENES GENERADAS", expanded=False):
        cols = st.columns(min(len(st.session_state.imagenes), 4))
        for i, img_path in enumerate(st.session_state.imagenes):
            with cols[i % len(cols)]:
                if os.path.exists(img_path):
                    st.image(img_path, caption=f"Seg {i+1}", use_container_width=True)

# --- Audio ---
if st.session_state.audio:
    with st.expander("🎙️ AUDIO", expanded=False):
        audio_path = st.session_state.audio.get("completo", "")
        if audio_path and os.path.exists(audio_path):
            st.audio(audio_path)

# --- Video ---
if st.session_state.video:
    with st.expander("🎥 VIDEO FINAL", expanded=True):
        if os.path.exists(st.session_state.video):
            st.video(st.session_state.video)
            
            with open(st.session_state.video, "rb") as f:
                st.download_button(
                    "⬇️ Descargar Video",
                    data=f,
                    file_name="facelessai_video.mp4",
                    mime="video/mp4",
                )
        
        st.markdown("""
        ### 🎯 Próximos pasos:
        1. **Descargá el video** y abrilo en CapCut/Premiere
        2. **Buscá el b-roll** de la lista de arriba en Pexels o Pixabay
        3. **Descargá los SFX** de Freesound o Epidemic Sound
        4. **Seguí el reporte de edición** para saber dónde va cada cosa
        5. **Publicá** 🚀
        """)


# === Footer ===
st.divider()
st.caption("🎬 FacelessAI — Hecho con IA para creadores de contenido")
