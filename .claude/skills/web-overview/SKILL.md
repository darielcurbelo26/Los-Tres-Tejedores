---
name: web-overview
description: Explica cómo funciona la web "Los Tres Tejedores" (estructura, scroll, timelines GSAP, pájaros 3D, audio, efecto cine, variables y caché). Úsala cuando se trabaje sobre esta web para entender la arquitectura antes de tocar el código.
---

# Cómo funciona esta web (Los Tres Tejedores)

Sitio **estático** (sin build) que cuenta una historia mediante una sola experiencia de scroll. Toda la animación está dirigida por scroll con **GSAP + ScrollTrigger**, y hay una escena **3D de pájaros** con Three.js.

## Stack y archivos

- `index.html` — todo el marcado. Carga GSAP, ScrollTrigger, Three.js, los scripts de los pájaros y `script.js`.
- `style.css` — estilos y animaciones. `design-system.css` — tokens/base.
- `script.js` — **toda la coreografía** (timelines, observers, audio, parallax).
- `3DModel/Bird/BirdFlock.js` — `window.BirdViewer` (escena 3D que lee `window.birdProxy` cada frame).
- `Audio/` — `Fondo Ambiente/birds.mp3` (pájaros) y `Música/Arpa.mp3`.
- Servidor de desarrollo: estático en el puerto definido en `.claude/launch.json`.

## Arquitectura de scroll (clave)

- Hay **un único contenedor de scroll**: `.scroll-container` (no se hace scroll en `window`). Todos los ScrollTrigger usan `ScrollTrigger.defaults({ scroller: ".scroll-container" })`.
- El **fijado de secciones es por `position: sticky`** (no se usa `pin: true` de GSAP, que sobre un scroller con overflow vibra):
  - `.pinned-canvas` (alto 700%) contiene `.pinned-sticky` (sticky) con las **secciones 1–4** apiladas en absoluto.
  - `.map-animated-section` (300%), `.crear-animated-section` (500%), `.eighth-section`/`.ninth-section` tienen cada una su `*-sticky-wrapper` con `position: sticky`.
  - La **altura grande** de cada sección aporta el recorrido de scroll; el sticky la mantiene fija en pantalla → "pins encadenados".
- **Un solo `scrub`** para todos los timelines: `const SCRUB = 1` (ritmo coherente).
- Todo se inicializa en `window 'load'` (layout estable) dentro de `gsap.context`; `ScrollTrigger.refresh()` al final y en `resize` (con debounce).

## Timelines (todos en `script.js`)

1. **`buildMasterTimeline()`** — secciones 1–4 sobre el lienzo fijado:
   - S1 Hero (slider de fondo CSS).
   - S2 Frase + **efecto cine** (ver abajo).
   - S3 Arcos SVG que se dibujan por trazo (lento) y permanecen.
   - S4 Teléfonos entran desde la derecha; arcos y textos siguen visibles hasta que los teléfonos salen por arriba (entonces se des-dibujan los textos).
2. **`buildMapTimeline()`** — la máscara `.animated-arch-container` **abre desde el centro** (solo crece el ancho, opacidad siempre 1), pausa, aparece el grid 6×6 en ola, se va el grid en ola y la máscara **cierra al centro**.
3. **`buildCrearTimeline()`** — arcos + textos de fondo se dibujan; "Crear" se rellena; las **máscaras `.solid-red-arch` e `.inverse-arch-mask` cierran de fuera (400vw) a card** (su ancho se fija en t=0 dentro del timeline para que el cierre nunca salga invertido); "Crear" baja a su sitio; las tarjetas Compartir/Conectar **emergen desde detrás de "Crear"** hacia los lados con leve rotación.
4. **`buildBirdTimeline()`** — anima `window.birdProxy` (posiciones de los 3 pájaros): entran desde fuera del canvas a media web, interactúan, y en "Descargar" se dispersan a los bordes mientras el contenedor se desvanece.
5. **`buildStrokeTitles()`** — "Rol" se dibuja por trazo, se des-dibuja, y luego "Descargar app" se dibuja (rango ampliado 8ª+9ª = lento).

## Pájaros 3D

- `BirdViewer` se monta de forma perezosa con un `IntersectionObserver` (root = `.scroll-container`) cuando es visible la sección Crear / Rol / Descargar.
- Lee `window.birdProxy` (`b1_*` centro, `b2_*` izq, `b3_*` der) **cada frame**, así que se animan esas propiedades con GSAP. Rotación/seguimiento del ratón ya está integrado.

## Efecto cine (sección 2)

- Al entrar: barras letterbox (`.cinema-bar-top/bottom`) entran con `yPercent`, el fondo se oscurece (`filter: brightness` del `.bg-slider`), y la **cabecera se desliza arriba** y la **frase inferior abajo** (transform suave). Al pasar de sección, todo se retira.
- **Mobile (`max-width: 768px`)**: se mantiene el efecto pero `.cinema-bars` está `display:none` (sin barras).
- ⚠️ Las barras se posicionan SOLO con GSAP (`yPercent`). No poner `transform` en su CSS o se duplica el desplazamiento.

## Audio

- `setupAudio()`: dos `<audio loop>` a volumen bajo (pájaros 0.12, música 0.18). Arranca en la primera interacción (los navegadores bloquean autoplay con sonido). Botón discreto `.sound-toggle` (abajo-izquierda) para silenciar.

## Variables CSS de los trazos de fondo

En `:root` (en `style.css`), para gestionar de un vistazo:

```css
--bg-stroke-width: 0.25px;   /* grosor de textos y arcos de fondo */
--bg-stroke-opacity: 0.4;    /* opacidad de textos y arcos de fondo */
--bg-text-size: 340px;       /* tamaño de los textos gigantes (viewBox 1000x600) */
```

Los textos gigantes (`.bg-stroke-text-svg`) usan `stroke-dasharray`/`stroke-dashoffset` para dibujarse; la longitud de trazo es `BG_STROKE_LENGTH` en `script.js`.

## Caché (importante en desarrollo)

El servidor estático cachea CSS/JS. Los `<link>`/`<script>` llevan un parámetro de versión (`style.css?v=N`, `script.js?v=N`). **Tras editar CSS o JS hay que subir ese número** o el navegador servirá la versión antigua.

## Dónde tocar las cosas más comunes

- **Velocidad/ritmo de una animación** → la `duration`/`stagger`/posición en el timeline correspondiente de `script.js` (recuerda: posiciones absolutas en `buildCrearTimeline`).
- **Tamaño/grosor/opacidad de textos y arcos de fondo** → variables `--bg-*` en `:root`.
- **Posiciones de los pájaros** → `OUT`/`IN` en `buildBirdTimeline()` y los valores por defecto de `window.birdProxy`.
- **Altura de las barras de cine / nivel de oscurecimiento** → `.cinema-bar { height }` y el `brightness()` en el efecto cine.
- **Textos "Rol"/"Descargar app"** → los `<text data-title="...">` en `index.html`.
