// Director Editorial Automático - App Logic
// v1.0

let currentAudio = null;

// ─── Generación del Plan Editorial ──────────────────────────────────────────

function generarPlan() {
    const script = document.getElementById('scriptInput').value;
    const preset = document.getElementById('presetSelect').value;
    const style = document.getElementById('styleSelect').value;
    const brief = document.getElementById('briefInput').value;

    if (!script.trim()) {
        document.getElementById('outputArea').innerHTML = `
            <div class="alert">
                ⚠️ Por favor, ingresa un guion o transcripción para analizar.
            </div>
        `;
        return;
    }

    // Mostrar loading
    document.getElementById('outputArea').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p style="color: #aaa;">Analizando contenido y generando plan editorial...</p>
        </div>
    `;

    // Simular procesamiento
    setTimeout(function () {
        var plan = generarPlanEditorial(script, preset, style, brief);
        document.getElementById('outputArea').innerHTML = plan;
    }, 1500);
}

function generarPlanEditorial(script, preset, style, brief) {
    // Análisis simulado del script
    var duracion = Math.floor(script.split(' ').length / 2.5); // ~2.5 palabras por segundo

    return `
        <div class="alert success">
            <strong>✅ Plan generado exitosamente</strong> - Listo para ejecutar
        </div>

        <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #667eea; margin-bottom: 15px;">📊 Análisis del Video</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div>
                    <strong style="color: #9b9bf7;">Duración:</strong>
                    <div style="color: #fff; font-size: 1.2em;">${duracion}s</div>
                </div>
                <div>
                    <strong style="color: #9b9bf7;">Preset:</strong>
                    <div style="color: #fff; font-size: 1.2em;">${preset.charAt(0).toUpperCase() + preset.slice(1)}</div>
                </div>
                <div>
                    <strong style="color: #9b9bf7;">Estilo:</strong>
                    <div style="color: #fff; font-size: 1.2em;">${style.charAt(0).toUpperCase() + style.slice(1)}</div>
                </div>
            </div>
        </div>

        <h3 style="color: #667eea; margin-bottom: 20px;">⏱️ Timeline de Edición</h3>

        <div class="timeline">
            <div class="timeline-block">
                <div class="timeline-header">
                    <span class="timestamp">00:00 - 00:04</span>
                    <span class="block-type">HOOK</span>
                </div>
                <div class="decision-grid">
                    <div class="decision-item">
                        <strong>Visual:</strong>
                        Motion (texto kinético)
                    </div>
                    <div class="decision-item">
                        <strong>Ritmo:</strong>
                        Rápido (0.8s)
                    </div>
                    <div class="decision-item">
                        <strong>B-roll:</strong>
                        NO usar
                    </div>
                </div>
                <div class="note">
                    📌 <strong>Nota editorial:</strong> Pregunta gancho directa. Motion solo en la cifra "70%". Corte en "3 segundos" para énfasis. Máxima retención crítica aquí.
                </div>
            </div>

            <div class="timeline-block">
                <div class="timeline-header">
                    <span class="timestamp">00:04 - 00:09</span>
                    <span class="block-type">PROBLEMA</span>
                </div>
                <div class="decision-grid">
                    <div class="decision-item">
                        <strong>Visual:</strong>
                        B-roll (ejemplos negativos)
                    </div>
                    <div class="decision-item">
                        <strong>Ritmo:</strong>
                        Medio (1.5s)
                    </div>
                    <div class="decision-item">
                        <strong>Motion:</strong>
                        Texto: "ERROR COMÚN"
                    </div>
                </div>
                <div class="note">
                    📌 <strong>Nota editorial:</strong> Mostrar ejemplos visuales de introducciones largas fallidas. B-roll de videos genéricos con caras de aburrimiento. Motion en "error más común".
                </div>
            </div>

            <div class="timeline-block">
                <div class="timeline-header">
                    <span class="timestamp">00:09 - 00:12</span>
                    <span class="block-type">TRANSICIÓN</span>
                </div>
                <div class="decision-grid">
                    <div class="decision-item">
                        <strong>Visual:</strong>
                        Nada (voz protagonista)
                    </div>
                    <div class="decision-item">
                        <strong>Ritmo:</strong>
                        Pausado (2.5s)
                    </div>
                    <div class="decision-item">
                        <strong>Nota:</strong>
                        Dejar respirar
                    </div>
                </div>
                <div class="note">
                    📌 <strong>Nota editorial:</strong> Momento de tensión antes de la solución. NO saturar visualmente. La pausa genera expectativa. Solo mantener background sutil.
                </div>
            </div>

            <div class="timeline-block">
                <div class="timeline-header">
                    <span class="timestamp">00:12 - 00:24</span>
                    <span class="block-type">SOLUCIÓN (3 pasos)</span>
                </div>
                <div class="decision-grid">
                    <div class="decision-item">
                        <strong>Visual:</strong>
                        Motion + B-roll alternado
                    </div>
                    <div class="decision-item">
                        <strong>Ritmo:</strong>
                        Dinámico (1.2s)
                    </div>
                    <div class="decision-item">
                        <strong>Estructura:</strong>
                        Lista numerada
                    </div>
                </div>
                <div class="note">
                    📌 <strong>Nota editorial:</strong> Cada paso con número en pantalla grande (1, 2, 3). B-roll ilustrativo por cada punto. Motion en palabras clave: "pregunta", "cifra", "promete". Cortes rápidos entre pasos para mantener energía.
                </div>
            </div>

            <div class="timeline-block">
                <div class="timeline-header">
                    <span class="timestamp">00:24 - 00:28</span>
                    <span class="block-type">RESULTADO</span>
                </div>
                <div class="decision-grid">
                    <div class="decision-item">
                        <strong>Visual:</strong>
                        Motion (resultado positivo)
                    </div>
                    <div class="decision-item">
                        <strong>Ritmo:</strong>
                        Medio (1.8s)
                    </div>
                    <div class="decision-item">
                        <strong>Efecto:</strong>
                        Zoom in en "explotar"
                    </div>
                </div>
                <div class="note">
                    📌 <strong>Nota editorial:</strong> Motion grande en "retención va a explotar" con efecto de énfasis. B-roll de gráfica ascendente o métricas positivas. Transmitir sensación de logro.
                </div>
            </div>

            <div class="timeline-block">
                <div class="timeline-header">
                    <span class="timestamp">00:28 - 00:32</span>
                    <span class="block-type">CTA</span>
                </div>
                <div class="decision-grid">
                    <div class="decision-item">
                        <strong>Visual:</strong>
                        Motion + gráfico suscripción
                    </div>
                    <div class="decision-item">
                        <strong>Ritmo:</strong>
                        Pausado (3s)
                    </div>
                    <div class="decision-item">
                        <strong>Cierre:</strong>
                        Fade out suave
                    </div>
                </div>
                <div class="note">
                    📌 <strong>Nota editorial:</strong> Botón de suscripción animado. Dejar tiempo para que procesen el CTA. Fade out gradual con música bajando volumen. NO cortar abruptamente.
                </div>
            </div>
        </div>

        <div class="music-section">
            <h3 style="color: #9b9bf7; margin-bottom: 20px;">🎵 Música y Audio</h3>
            <div class="music-grid">
                <div class="music-item">
                    <strong>Tipo:</strong>
                    Corporativo energético
                </div>
                <div class="music-item">
                    <strong>Energía:</strong>
                    Media-Alta (70%)
                </div>
                <div class="music-item">
                    <strong>Uso:</strong>
                    Fondo continuo
                </div>
                <div class="music-item">
                    <strong>Volumen:</strong>
                    -20dB (voz prioridad)
                </div>
            </div>
            <div class="note" style="margin-top: 15px; background: rgba(0,0,0,0.3); border-color: #9b9bf7;">
                💡 Subir volumen en transiciones (00:09) y bajar en CTA (00:28). La música debe acompañar, no competir con la voz.
            </div>
        </div>

        <div style="background: rgba(102, 126, 234, 0.05); padding: 25px; border-radius: 12px; margin-top: 30px;">
            <h3 style="color: #667eea; margin-bottom: 15px;">🎯 Tono General del Video</h3>
            <p style="color: #ccc; font-size: 1.1em; line-height: 1.6;">
                <strong>Energético pero profesional.</strong> El video debe transmitir urgencia y acción sin caer en lo saturado. Priorizar claridad sobre espectáculo. La edición refuerza el mensaje, no lo compite. Cada recurso visual tiene un propósito específico: retener en el hook, ilustrar en la solución, enfatizar en el resultado.
            </p>
        </div>

        <div style="background: rgba(255, 107, 107, 0.1); border-left: 4px solid #ff6b6b; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <strong style="color: #ff6b6b;">⚠️ Advertencias Editoriales:</strong>
            <ul style="margin-top: 10px; margin-left: 20px; color: #ffaaaa;">
                <li>Los primeros 4 segundos son CRÍTICOS - no negociables</li>
                <li>Evitar saturación visual en 00:12-00:24 (3 pasos seguidos)</li>
                <li>El silencio visual en 00:09-00:12 es intencional - no rellenar</li>
                <li>CTA necesita espacio - no acortar los últimos 4 segundos</li>
            </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <button class="btn" onclick="exportarPlan()">📥 Exportar Plan (JSON)</button>
            <button class="btn btn-secondary" onclick="copiarPremiere()">🎬 Copiar para Premiere</button>
            <button class="btn btn-secondary" onclick="generarPlan()">🔄 Regenerar Plan</button>
        </div>
    `;
}

// ─── Ejemplos ────────────────────────────────────────────────────────────────

function cargarEjemplo(tipo) {
    tipo = tipo || 'default';

    var ejemplos = {
        'default': {
            script: '¿Sabías que el 70% de las personas abandonan un video en los primeros 3 segundos? Hoy te voy a mostrar exactamente cómo enganchar desde el segundo cero. El error más común es empezar con introducciones largas. La gente no tiene paciencia. Debes ir directo al gancho. Primero, hazles una pregunta que les duela. Segundo, muestra una cifra impactante. Y tercero, promete una solución rápida. Si aplicas esto, tu retención va a explotar. No olvides suscribirte para más consejos como este.',
            preset: 'info',
            style: 'dinamico',
            brief: 'Necesito máxima retención en los primeros 5 segundos. El video debe sentirse dinámico pero profesional.'
        },
        'tutorial': {
            script: 'Bienvenido al tutorial de hoy. Vamos a aprender cómo crear una animación profesional en After Effects en solo 10 minutos. Paso uno: abre After Effects y crea una nueva composición. Paso dos: importa tus assets y organízalos en carpetas. Paso tres: aplica los keyframes básicos de movimiento. Paso cuatro: añade el motion blur para darle realismo. Y listo, ya tienes tu primera animación profesional. Practica esto todos los días y en una semana serás un experto.',
            preset: 'info',
            style: 'dinamico',
            brief: 'Tutorial paso a paso. Debe ser claro y fácil de seguir. Priorizar claridad sobre espectáculo.'
        },
        'story': {
            script: 'Hace 3 años perdí mi trabajo. Estaba en el punto más bajo de mi vida. No tenía dinero, no tenía dirección. Pero tomé una decisión. Iba a cambiar mi vida en 6 meses o morir en el intento. Empecé levantándome a las 5 de la mañana. Estudiaba, trabajaba, entrenaba. Fue el período más difícil de mi existencia. Pero hoy, 3 años después, tengo mi propia empresa y ayudo a miles de personas a transformar sus vidas. Todo empezó con una decisión.',
            preset: 'story',
            style: 'sobrio',
            brief: 'Historia personal con carga emocional. Edición sobria que respete los momentos reflexivos. Menos es más.'
        },
        'data': {
            script: 'En 2024 se generaron 147 zettabytes de datos. Eso es un 1 seguido de 21 ceros. El 90% de estos datos se crearon en los últimos 2 años. Cada minuto se envían 231 millones de emails. Se suben 500 horas de video a YouTube. Y se realizan 5.9 millones de búsquedas en Google. Estamos en la era de la información exponencial. La pregunta no es si tienes datos, sino si sabes qué hacer con ellos.',
            preset: 'data',
            style: 'intenso',
            brief: 'Bombardeo de datos. Debe sentirse abrumador pero fascinante. Motion en todas las cifras. Ritmo frenético.'
        }
    };

    var ejemplo = ejemplos[tipo] || ejemplos['default'];

    document.getElementById('scriptInput').value = ejemplo.script;
    document.getElementById('presetSelect').value = ejemplo.preset;
    document.getElementById('styleSelect').value = ejemplo.style;
    document.getElementById('briefInput').value = ejemplo.brief;

    // Scroll suave al input
    document.getElementById('scriptInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─── Exportación ─────────────────────────────────────────────────────────────

function exportarPlan() {
    alert('🎯 Función de exportación:\n\nEn la versión completa, esto generaría un archivo JSON con toda la información del plan editorial que podrías:\n\n• Importar en automatizaciones\n• Compartir con tu equipo\n• Usar como plantilla\n• Integrar con otras herramientas\n\nFormato: timeline.json');
}

function copiarPremiere() {
    alert('🎬 Función de integración con Premiere:\n\nEn la versión completa, esto generaría:\n\n• Marcadores XML para Premiere Pro\n• EDL con puntos de corte\n• Notas de edición por timestamp\n• Lista de assets necesarios\n\nListo para importar directamente en tu proyecto.');
}

// ─── Manejo de Audio ─────────────────────────────────────────────────────────

var audioDropzone = document.getElementById('audioDropzone');

audioDropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    audioDropzone.style.borderColor = '#764ba2';
    audioDropzone.style.background = 'rgba(102, 126, 234, 0.05)';
});

audioDropzone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    audioDropzone.style.borderColor = '#667eea';
    audioDropzone.style.background = '#0a0a0a';
});

audioDropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    audioDropzone.style.borderColor = '#667eea';
    audioDropzone.style.background = '#0a0a0a';

    var files = e.dataTransfer.files;
    if (files.length > 0) {
        var file = files[0];
        if (file.type.startsWith('audio/')) {
            handleAudioFile(file);
        } else {
            alert('⚠️ Por favor, sube un archivo de audio válido (MP3, WAV, M4A, OGG)');
        }
    }
});

function handleAudioUpload(input) {
    var file = input.files[0];
    if (file) {
        handleAudioFile(file);
    }
}

function handleAudioFile(file) {
    currentAudio = file;

    // Mostrar info del audio
    document.getElementById('audioDropzone').style.display = 'none';
    document.getElementById('audioInfo').style.display = 'block';
    document.getElementById('audioFileName').textContent = file.name;

    // Crear URL del audio para el reproductor
    var audioURL = URL.createObjectURL(file);
    var audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = audioURL;

    // Obtener duración del audio
    audioPlayer.addEventListener('loadedmetadata', function () {
        var duration = audioPlayer.duration;
        var minutes = Math.floor(duration / 60);
        var seconds = Math.floor(duration % 60);
        document.getElementById('audioDuration').textContent =
            'Duración: ' + minutes + ':' + seconds.toString().padStart(2, '0');
    });
}

function removeAudio() {
    currentAudio = null;
    document.getElementById('audioDropzone').style.display = 'block';
    document.getElementById('audioInfo').style.display = 'none';
    document.getElementById('audioPlayer').src = '';
    document.getElementById('audioInput').value = '';
}

function transcribirAudio() {
    if (!currentAudio) {
        alert('⚠️ Por favor, sube un archivo de audio primero.');
        return;
    }

    // Mostrar loading en el textarea
    var scriptInput = document.getElementById('scriptInput');
    var originalPlaceholder = scriptInput.placeholder;
    scriptInput.value = '';
    scriptInput.placeholder = '🎤 Transcribiendo audio... Esto puede tomar unos segundos...';
    scriptInput.disabled = true;

    // Simular transcripción (en la versión real, aquí iría la API de transcripción)
    setTimeout(function () {
        scriptInput.disabled = false;
        scriptInput.placeholder = originalPlaceholder;

        // Transcripción simulada
        scriptInput.value = '¿Sabías que el 70% de las personas abandonan un video en los primeros 3 segundos? Hoy te voy a mostrar exactamente cómo enganchar desde el segundo cero. El error más común es empezar con introducciones largas. La gente no tiene paciencia. Debes ir directo al gancho. Primero, hazles una pregunta que les duela. Segundo, muestra una cifra impactante. Y tercero, promete una solución rápida. Si aplicas esto, tu retención va a explotar. No olvides suscribirte para más consejos como este.';

        // Scroll al textarea
        scriptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Mostrar notificación
        var notification = document.createElement('div');
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px 30px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:1000;animation:slideIn 0.3s ease-out;';
        notification.innerHTML = '<div style="display:flex;align-items:center;gap:15px;"><div style="font-size:2em;">✅</div><div><div style="font-weight:bold;margin-bottom:5px;">Transcripción completada</div><div style="font-size:0.9em;opacity:0.9;">El guion ha sido generado automáticamente</div></div></div>';
        document.body.appendChild(notification);

        setTimeout(function () {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function () { notification.remove(); }, 300);
        }, 3000);
    }, 2500);
}
