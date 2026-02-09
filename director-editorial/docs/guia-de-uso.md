# 📖 Guía de Uso — Director Editorial Automático

## Qué hace esta herramienta

El **Director Editorial Automático** analiza el guion o transcripción de un video y genera un **plan de edición profesional** con:

- **Timestamps** — Cada bloque del video con tiempos exactos
- **Decisiones visuales** — Cuándo usar motion, b-roll o dejar solo la voz
- **Ritmo de cortes** — Velocidad sugerida para cada sección
- **Música y audio** — Tipo, energía y volumen recomendado
- **Notas editoriales** — Explicaciones de por qué se toma cada decisión
- **Tono general** — Resumen del enfoque editorial del video

## Cómo funciona (a nivel conceptual)

La herramienta sigue un proceso de 3 pasos:

### 1. Análisis del contenido
Lee el guion y detecta la estructura narrativa: dónde está el gancho, el problema, la solución, el resultado y el cierre. Calcula la duración estimada basándose en la velocidad promedio de habla.

### 2. Toma de decisiones editoriales
Para cada bloque del video, decide:
- ¿Va motion (texto en pantalla) o b-roll (imagen de apoyo)?
- ¿El ritmo debe ser rápido, medio o pausado?
- ¿Qué efecto o recurso visual refuerza mejor el mensaje?

### 3. Generación del plan
Presenta todo en un timeline visual con timestamps, organizado por bloques, con notas explicativas para que el editor entienda el "por qué" de cada decisión.

## Paso a paso de uso

### Opción A: Con guion escrito

1. Abre `index.html` en tu navegador (Chrome, Firefox, Safari, Edge)
2. En el campo **"Transcripción / Guion del video"**, pega el texto de tu video
3. Selecciona el **Preset Narrativo** que mejor describe tu contenido:
   - **Info** — Para videos educativos, tutoriales, explicaciones
   - **Story** — Para historias personales, testimonios, narrativas
   - **Data** — Para videos con muchas cifras, estadísticas, datos
   - **Neutral** — Para contenido sin un estilo dominante
4. Selecciona el **Estilo de Edición**:
   - **Sobrio** — Cortes suaves, menos efectos, respeta silencios
   - **Dinámico** — Ritmo variado, motion frecuente, energético
   - **Intenso** — Cortes rápidos, mucho motion, bombardeo visual
5. Opcionalmente, escribe un **Brief Editorial** con indicaciones específicas
6. Presiona **"Generar Plan Editorial"**
7. Revisa el timeline generado en el panel derecho

### Opción B: Con archivo de audio

1. Haz click en la zona de carga o arrastra tu archivo de audio
2. Verifica que se cargó correctamente (verás el nombre y un reproductor)
3. Presiona **"Transcribir Audio Automáticamente"** (demo simulada)
4. El guion aparecerá en el campo de texto
5. Continúa desde el paso 3 de la Opción A

## Ejemplos de uso

### Video tipo Tutorial
- **Preset:** Info
- **Estilo:** Dinámico
- **Resultado:** Plan con pasos numerados, motion en conceptos clave, ritmo medio-rápido

### Video tipo Historia Personal
- **Preset:** Story
- **Estilo:** Sobrio
- **Resultado:** Plan con momentos de pausa, b-roll emocional, ritmo que respeta la narrativa

### Video tipo Datos / Estadísticas
- **Preset:** Data
- **Estilo:** Intenso
- **Resultado:** Plan con motion en cada cifra, cortes rápidos, bombardeo visual controlado

## Qué NO hace esta herramienta

- **No edita el video** — Solo genera el plan, la edición la haces tú
- **No genera imágenes ni b-roll** — Sugiere qué usar, pero no lo crea
- **No tiene backend ni servidor** — Todo funciona en tu navegador
- **No guarda datos** — Al cerrar la página, se pierde el resultado
- **No transcribe audio realmente** — La transcripción es simulada en esta versión demo

## Preguntas frecuentes

**¿Necesito instalar algo?**
No. Solo abre el archivo `index.html` en cualquier navegador moderno.

**¿Funciona en celular?**
Sí, el diseño es responsive y se adapta a pantallas pequeñas.

**¿Mis datos se envían a algún servidor?**
No. Todo se procesa localmente en tu navegador. No se envía nada a ningún lado.

**¿Puedo usar esto para videos largos?**
Sí, pero el plan generado en esta versión demo es siempre el mismo ejemplo. En la versión completa, se adaptaría a la duración real del contenido.

**¿Cómo llevo el plan a mi editor de video?**
Por ahora, puedes copiar las notas manualmente. En futuras versiones se podrá exportar como JSON o marcadores de Premiere.

**¿Es gratis?**
Sí, es una demo abierta.
