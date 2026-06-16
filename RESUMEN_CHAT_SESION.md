# Resumen de Sesión: Correcciones Web "Los Tres Tejedores"

**Fecha:** 2026-06-16  
**Contexto:** Solución de problemas con animaciones GSAP, posicionamiento de elementos SVG y transiciones

---

## 1. PROBLEMA: Palabras de fondo no manipulables

### Pregunta
> "las palabras de fondo que hay en dos secciones de la web no se pueden manipular para aumentar el espacado entre ellas etc, busca el problema y dame una solución"

### Causa Raíz Identificada
Se encontraron **dos problemas distintos**:

1. **`gap: 20rem` inútil en `.background-words`**
   - El contenedor usaba `display: flex` con `gap: 20rem`
   - Pero solo tenía **un hijo** (el `<svg>`), por lo que `gap` no hace nada
   - El `gap` de flexbox separa hijos directos, no elementos dentro del SVG

2. **Textos superpuestos en la cuarta sección**
   - Los tres `<text>` estaban todos en `y="50%"` (mismo punto del SVG)
   - En la sección Crear sí tenían posiciones distintas (`y="10%"`, `y="50%"`, `y="90%"`)

### Soluciones Aplicadas

#### Cambio 1: Actualizar índice.html (líneas 471-473)
```html
<!-- ANTES -->
<text x="50%" y="50%" text-anchor="middle" class="bg-stroke-text-svg">Crear</text>
<text x="50%" y="50%" text-anchor="middle" class="bg-stroke-text-svg">Compartir</text>
<text x="50%" y="50%" text-anchor="middle" class="bg-stroke-text-svg">Conectar</text>

<!-- DESPUÉS -->
<text x="50%" y="10%" text-anchor="middle" class="bg-stroke-text-svg">Crear</text>
<text x="50%" y="50%" text-anchor="middle" class="bg-stroke-text-svg">Compartir</text>
<text x="50%" y="90%" text-anchor="middle" class="bg-stroke-text-svg">Conectar</text>
```

#### Cambio 2: Limpiar CSS innecesario (style.css, línea 433)
```css
/* ANTES */
.background-words {
    ...
    gap: 20rem !important;  /* ← INÚTIL, no hace nada */
}

/* DESPUÉS */
.background-words {
    ...
    /* gap no aplica aquí: hay un solo <svg> hijo. El espaciado entre palabras
       se controla con el atributo y de cada <text> dentro del SVG. */
}
```

#### Cómo Controlar el Espaciado Desde Ahora
Los porcentajes Y del SVG son el único punto de control:
```html
<text y="5%">Crear</text>       <!-- más arriba ↑ -->
<text y="50%">Compartir</text>  <!-- centro (fijo) -->
<text y="95%">Conectar</text>   <!-- más abajo ↓ -->

<!-- Para menos espacio, acércarlos: -->
<text y="30%">Crear</text>
<text y="50%">Compartir</text>
<text y="70%">Conectar</text>
```

---

## 2. PREGUNTA: Modificar velocidad de escritura de textos

### Pregunta
> "cómo modifico la velocidad en que se escribe"

### Respuesta: Dos Ubicaciones en script.js

#### Cuarta Sección (línea 169)
```javascript
.to(".fourth-section .bg-stroke-text-svg", {
    attr: { "stroke-dashoffset": 0 },
    duration: 4,      // ← velocidad de escritura (segundos de scrub)
    stagger: 0.35,    // ← retraso entre cada palabra
    ease: "power2.out"
})
```

#### Sección Crear (línea 277)
```javascript
.to(".bg-words-crear .bg-stroke-dark-svg", {
    attr: { "stroke-dashoffset": 0 },
    duration: 4,      // ← cambiar aquí
    stagger: 0.5,     // ← y aquí
    ease: "power2.out"
}, 43.2)
```

### Parámetros Explicados
- **`duration`** → cuánto tarda en dibujarse **cada palabra** (en segundos de scrub)
- **`stagger`** → retraso entre el inicio de una palabra y la siguiente
- Aumentar `duration` = más lento | Disminuir = más rápido

---

## 3. PROBLEMA: Texto de fondo de Crear no visible

### Pregunta
> "sabrías decirme porqué el texto de fondo de la sección crear no lo veo"

### Causa Raíz
El `.bg-words-crear` tenía `z-index: -1 !important`, lo que lo forzaba a quedar **detrás** de `.solid-red-arch` (la máscara roja a pantalla completa).

### Solución (style.css, línea 730-733)
```css
/* ANTES */
.bg-words-crear {
    opacity: 1 !important;
    z-index: -1 !important;  /* ← tapado por la máscara roja */
}

/* DESPUÉS */
.bg-words-crear {
    opacity: 1 !important;
    z-index: 0 !important;   /* ← ahora visible encima de la máscara */
    /* Pinta después de solid-red-arch (anterior en DOM) pero antes
       de center-card-wrapper y side-arches (posteriores en DOM) */
}
```

### Por Qué Funciona
El contexto de apilamiento respeta el orden DOM cuando `z-index` no es `!important` o es el mismo nivel:
1. `.solid-red-arch` (máscara roja) — elemento anterior
2. `.bg-words-crear` (textos) — `z-index: 0` → se pinta después
3. `.center-card-wrapper` (tarjeta "Crear") — elemento posterior

---

## 4. PREGUNTA: Variable específica de opacidad para arcos Crear

### Pregunta
> "en las sección crear los arcos tendrán una opacidad distinta, por lo que dame una propiedad especifica para usar en esa sección de forma especifica."

### Solución: Variable CSS Dedicada

#### Paso 1: Definir variable en :root (style.css, línea 691)
```css
:root {
    /* ---- FONDO: textos y arcos de trazo ---- */
    --bg-stroke-width: 0.25px;
    --bg-stroke-opacity: 0.4;
    --bg-stroke-color: var(--color-secondary);
    --bg-text-size: 340px;
    --crear-arch-opacity: 0.4;  /* ← NUEVA: opacidad exclusiva de Crear */
}
```

#### Paso 2: Aplicar en los arcos de Crear (style.css, línea 1387-1389)
```css
.arches-crear-bg svg path {
    stroke: var(--color-white) !important;
    opacity: var(--crear-arch-opacity) !important;  /* ← NUEVO */
}
```

### Cómo Usar
Simplemente cambia el valor en `:root`:
```css
--crear-arch-opacity: 0.3;  /* más transparente */
--crear-arch-opacity: 0.6;  /* más opaco */
```

---

## 5. PREGUNTA: Posición inicial de "Crear"

### Pregunta
> "dónde modifico la posición inicial de crear"

### Respuesta: script.js, línea 225
```javascript
.set(".center-card-wrapper", { 
    x: 0, 
    y: 0, 
    xPercent: -50,      // centra horizontalmente (NO TOCAR)
    yPercent: -54.5,    // ← AQUÍ: posición vertical inicial
    scale: 2.3,         // ← AQUÍ: tamaño inicial (grande → se contrae)
    opacity: 0 
}, 0)
```

### Parámetros
- **`yPercent: -54.5`** → negativo = más arriba, positivo = más abajo
- **`scale: 2.3`** → tamaño inicial (2.3x = muy grande antes de animarse a escala 1)
- **`xPercent: -50`** → centra horizontalmente, dejar como está

---

## 6. PROBLEMA: Error de transición bienvenida → hero (palabra congelada y salto)

### Pregunta
> "cuando presiono entrar se queda la palabra frizada y hace un salto hacia el inicio y no debe ser"

### Causa Raíz
**Carrera de GSAP timelines:**
1. Al hacer click en "Entrar", comienza `transitionTl` (duración 2.5s)
2. El callback `onComplete` ejecuta `initAll()`, que inicia el `masterTimeline`
3. **CONFLICTO:** Dos timelines GSAP competían por controlar `.fixed-bottom-title` simultáneamente:
   - `transitionTl` lo animaba de forma independiente
   - `masterTimeline` (línea 139) intentaba mover el mismo elemento

### Solución: Eliminar animación independiente (script.js, línea 610-643)

```javascript
/* ANTES - PROBLEMA */
const transitionTl = gsap.timeline({
    onComplete: () => {
        const titleElement = document.querySelector(".fixed-bottom-title");
        if (titleElement) {
            titleElement.style.cssText = "";
        }
        gsap.set(".fixed-bottom-title", {
            y: "100vh",
            opacity: 0,
        });
        initAll();
        
        // ❌ ESTO COMPETÍA CON EL MASTER TIMELINE
        gsap.to(".fixed-bottom-title", {
            y: 0,
            opacity: 1,
            duration: 2.0,  // ← CONFLICTO aquí
            ease: "power2.out",
        });
    }
});

/* DESPUÉS - SOLUCIÓN */
const transitionTl = gsap.timeline({
    onComplete: () => {
        const titleElement = document.querySelector(".fixed-bottom-title");
        if (titleElement) {
            titleElement.style.cssText = "";
        }
        
        // Dejar el título en su estado final visible.
        // NO animarlo aquí: el masterTimeline controla desde t=0
        gsap.set(".fixed-bottom-title", { y: 0, opacity: 1, clearProps: "none" });
        
        // El masterTimeline toma control automáticamente
        initAll();
    }
});
```

### Por Qué Funciona
- El `masterTimeline` (línea 139) ya controla `.fixed-bottom-title` desde el inicio
- Al dejarlo en posición final visible (`y: 0, opacity: 1`), el master timeline lo anima desde su estado inicial correctamente
- No hay competencia de timelines

---

## 7. PROBLEMA: Corte a negro en sección 2 (efecto cine)

### Pregunta
> "Luego antes de mostrar las rayas en la sec 2 haces un corte a negro porq? no deb ir"

### Causa
El oscurecimiento del fondo es demasiado drástico en la entrada del efecto cine (script.js, línea 136):

```javascript
.to(".bg-slider", { filter: "brightness(0.5)", duration: 1.2, ... }, "cine_in")
```

### Solución: Suavizar el brightness
```javascript
/* OPCIÓN 1: Menos oscuro (recomendado) */
.to(".bg-slider", { filter: "brightness(0.7)", duration: 1.2, ... }, "cine_in")

/* OPCIÓN 2: Mismo oscuro pero con delay para que sea más gradual */
.to(".bg-slider", { 
    filter: "brightness(0.5)", 
    duration: 0.5,    // oscurecimiento más rápido
    delay: 0.7,       // pero comienza después
    ease: "power3.inOut" 
}, "cine_in")
```

### Valores brightness comunes
- `brightness(1)` = normal
- `brightness(0.7)` = ligeramente oscuro (recomendado para sección 2)
- `brightness(0.5)` = muy oscuro (demasiado drástico)
- `brightness(0.3)` = casi negro

---

## 8. CAMBIOS DE VERSIÓN CSS

### Problema
Después de cambiar CSS, el navegador cachea la versión antigua.

### Solución: Incrementar número de versión (index.html, línea 29)

```html
<!-- ANTES -->
<link rel="stylesheet" href="style.css?v=27">

<!-- DESPUÉS de cambios en CSS -->
<link rel="stylesheet" href="style.css?v=28">
```

**Cada vez que edites `style.css`, incrementa el número en 1.**

---

## RESUMEN DE ARCHIVOS MODIFICADOS

| Archivo | Líneas | Cambios |
|---------|--------|---------|
| `index.html` | 29 | Actualizar `v=27` → `v=28` |
| `index.html` | 471-473 | Textos SVG: `y` de 20%/50%/80% → 10%/50%/90% |
| `style.css` | 433-449 | Limpiar comentario sobre `gap` |
| `style.css` | 691 | Añadir `--crear-arch-opacity: 0.4` |
| `style.css` | 730-733 | Cambiar `z-index: -1` → `z-index: 0` en `.bg-words-crear` |
| `style.css` | 1387-1389 | Aplicar `opacity: var(--crear-arch-opacity)` en arcos Crear |
| `script.js` | 136 | Cambiar `brightness(0.5)` → `brightness(0.7)` |
| `script.js` | 610-643 | Eliminar animación independiente de `.fixed-bottom-title` |

---

## NOTAS IMPORTANTES

1. **Caché de navegador:** Siempre incrementa `?v=X` en CSS después de cambios
2. **GSAP timelines:** Evita que múltiples timelines controlen el mismo elemento
3. **Z-index en contextos de apilamiento:** Un `z-index: 0` sin `!important` respeta el orden DOM
4. **SVG positioning:** Usa atributos `y` en `<text>`, no CSS flexbox gap
5. **Brightness suave:** Para cambios de exposición visual, usa `0.7` en lugar de `0.5`

