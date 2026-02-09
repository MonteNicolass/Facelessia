# 🎬 Director Editorial Automático

> Analiza tu contenido de video y genera un plan de edición profesional en segundos.

![Demo del Director Editorial](assets/img/demo-screenshot.png)

## Qué es esto

**Director Editorial Automático** es una herramienta que toma el guion o audio de tu video y te devuelve un plan de edición completo: con timestamps, decisiones de motion, b-roll, ritmo de cortes, música y tono editorial.

Pensado para creadores de contenido y editores de video que quieren **eliminar decisiones repetitivas** y enfocarse en lo creativo.

## Características principales

- 📝 **Análisis de guion** — Pega tu transcripción y obtén un plan editorial al instante
- 🎤 **Carga de audio** — Sube tu archivo de audio (MP3, WAV, M4A, OGG) directamente
- ⚙️ **Presets narrativos** — Info, Story, Data o Neutral según tu tipo de contenido
- 🎨 **Estilos de edición** — Sobrio, Dinámico o Intenso
- ⏱️ **Timeline con timestamps** — Cada bloque con decisiones concretas de visual, ritmo y b-roll
- 🎵 **Sugerencias de música** — Tipo, energía, volumen y uso recomendado
- 📋 **Ejemplos listos** — Tutorial, Historia y Data para probar al instante

## Cómo usar

1. **Abre** `index.html` en tu navegador
2. **Pega** tu guion en el campo de texto (o sube un audio)
3. **Elige** el preset narrativo y el estilo de edición
4. **Presiona** "Generar Plan Editorial"
5. **Revisa** el timeline generado con todas las decisiones editoriales

No necesitas instalar nada. Funciona directamente en el navegador.

## Tecnologías

- HTML5
- CSS3 (diseño responsive, dark mode)
- JavaScript vanilla (sin frameworks, sin dependencias)
- Google Fonts (Inter)

## Estructura del proyecto

```
director-editorial/
├── index.html          ← Página principal
├── README.md           ← Este archivo
├── .gitignore
├── assets/
│   ├── css/
│   │   └── styles.css  ← Estilos del proyecto
│   ├── js/
│   │   └── app.js      ← Lógica de la aplicación
│   └── img/            ← Imágenes y capturas
└── docs/
    └── guia-de-uso.md  ← Documentación detallada
```

## Roadmap

- [ ] Transcripción real de audio (integración con API)
- [ ] Exportación a JSON ejecutable
- [ ] Generación de marcadores XML para Premiere Pro
- [ ] Exportación EDL para DaVinci Resolve
- [ ] Análisis con IA para decisiones editoriales dinámicas
- [ ] Soporte multi-idioma

## Nota

Este proyecto es una demo funcional. El análisis editorial se genera de forma simulada para demostrar el flujo completo de la herramienta.

Para preguntas o sugerencias, abre un issue en el repositorio.

---

Hecho con 🎬 para creadores de contenido
