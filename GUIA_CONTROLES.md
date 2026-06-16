# Guía de Controles - Los Tres Tejedores

## 📍 INTRO (sin scroll)

### Panel de Control de Pájaros 🧩
**Ubicación:** Esquina superior izquierda  
**Botón:** ⚙️ (engranaje)

**Controla:**
- **Pájaro 1 (b1):** Pájaro central - posición (x, y, z) y escala
- **Pájaro 2 (b2):** Pájaro izquierdo - posición (x, y, z) y escala
- **Pájaro 3 (b3):** Pájaro derecho - posición (x, y, z) y escala

**Código archivo:** `script.js` líneas 45-103 (`window.introBirdConfig`)

**Cómo modificar:**
1. Click en ⚙️ para abrir el panel
2. Mueve los sliders para ver cambios en **tiempo real**
3. El código generado se actualiza automáticamente
4. Click "Copiar" para guardar los valores

---

## 📜 CUERPO PRINCIPAL (con scroll)

### Mapa de Secciones y Controles

```
┌─────────────────────────────────────────────────────────────┐
│                    SECCIÓN 1: HERO                          │
│                   (Slider de imágenes)                      │
│  Archivo: script.js líneas 178-295 (buildMasterTimeline)   │
│  - Transición a sección 2 (efecto cine)                    │
│  - Ocultamiento de cabecera y título inferior              │
└─────────────────────────────────────────────────────────────┘
                            ↓ scroll
┌─────────────────────────────────────────────────────────────┐
│                 SECCIÓN 2: PELÍCULA (CINE)                  │
│               Barras letterbox + frase                      │
│  Archivo: script.js líneas 198-276 (efecto_cine)           │
│  - Barras superior/inferior entran desde afuera            │
│  - Fondo se oscurece (brightness: 0.7)                     │
│  - Cabecera sube fuera de pantalla                         │
│  - Título inferior baja fuera de pantalla                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ scroll
┌─────────────────────────────────────────────────────────────┐
│            SECCIÓN 3: ARCOS ANIMADOS                        │
│        (Tercera sección con arcos + textos SVG)            │
│  Archivo: script.js líneas 302-309                         │
│  - Textos "Crear", "Compartir", "Conectar" se dibujan     │
│  - Stroke-dashoffset: 20000 → 0 (en 8s con stagger 1s)    │
│                                                             │
│  HTML: index.html líneas 470-476                           │
│  SVG con y="10%", y="50%", y="90%"                         │
│  - Modificar y="%" para cambiar altura de textos           │
│  - Modificar stroke-width en CSS para grosor              │
│  - Modificar opacity para visibilidad                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ scroll
┌─────────────────────────────────────────────────────────────┐
│          SECCIÓN 4: TELÉFONOS + TEXTOS FONDO              │
│      (Interfaz Feed, Map, Ticket + textos SVG)            │
│  Archivo: script.js líneas 319-360 (interface-wrapper)    │
│                                                             │
│  TEXTOS SVG (Crear, Compartir, Conectar):                 │
│  HTML: index.html líneas 373-375                           │
│  SVG con y="10%", y="50%", y="90%"                        │
│  Modificar igual que sección 3                             │
│                                                             │
│  TELÉFONOS (Entrada):                                      │
│  - Entran desde la derecha (x: 100vw)                      │
│  - Con rotación 15° → 0°                                  │
│  - Duración: 1.4s con stagger 0.18s                       │
│  Archivo: script.js línea 319-332                          │
│  - Modificar "100vw" para cambiar posición entrada         │
│  - Modificar "rotation: 15" para cambiar rotación          │
│  - Modificar "1.4" para cambiar velocidad entrada          │
│  - Modificar "0.18" para cambiar separación entre teléfonos│
│                                                             │
│  TELÉFONOS (Salida):                                       │
│  - Suben fuera de pantalla (y: -110vh)                     │
│  - Se desvanecen (opacity: 0)                             │
│  Archivo: script.js línea 338-344                          │
│  - Modificar "-110vh" para cambiar altura salida           │
│  - Modificar "1.4" para cambiar velocidad salida           │
│  - Modificar "0.1" para cambiar separación salida          │
└─────────────────────────────────────────────────────────────┘
                            ↓ scroll
┌─────────────────────────────────────────────────────────────┐
│           SECCIÓN 5: MAPA + GRID (Crear)                  │
│    (Mapa interactivo + tarjetas de creación)              │
│  Archivo: script.js líneas 366-500 (buildMapCrearTimeline)│
│  - Aparición del mapa rojo                                │
│  - Animación de arcos                                      │
│  - Grid de tarjetas                                        │
│  - Textos "Rol", "Descargar" con trazo                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ scroll
┌─────────────────────────────────────────────────────────────┐
│         SECCIÓN 6-7: GALERÍA DE ROLES (Rol/Download)      │
│    (Carrusel de roles + íconos de descargar)              │
│  Archivo: script.js líneas 502-700 (buildBirdTimeline)    │
│  - Pájaros entran y salen                                  │
│  - Mascaras de imágenes animadas                           │
│  - Textos con trazo dibujado                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ scroll
┌─────────────────────────────────────────────────────────────┐
│            SECCIÓN 8: FOOTER (Descargo de info)           │
│  Archivo: script.js líneas 700-850 (buildEighthSection)   │
│  - Última sección con información                         │
│  - Animaciones finales                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 CAMBIOS PRINCIPALES POR TIPO

### Textos SVG (Crear, Compartir, Conectar)

**Ubicación:** 
- Sección 3: `index.html` líneas 470-476
- Sección 4: `index.html` líneas 373-375

**Parámetros ajustables:**

```html
<!-- Posición vertical (y) -->
<text y="10%">Crear</text>        <!-- Arriba -->
<text y="50%">Compartir</text>    <!-- Centro -->
<text y="90%">Conectar</text>     <!-- Abajo -->

<!-- Cambiar a tu gusto: 20%, 50%, 80% etc -->
```

**CSS Asociado:** `style.css` línea 448
```css
.background-words {
    gap: 50rem !important;  /* Espaciado vertical entre palabras */
}

.bg-stroke-text-svg {
    stroke-width: 1px;      /* Grosor del trazo */
    opacity: 1;             /* Visibilidad */
}
```

### Animación de Teléfonos

**Ubicación:** `script.js` líneas 319-344

**Entrada (líneas 319-332):**
```javascript
.fromTo(".interface-wrapper", {
    x: "100vw",          // ← Cambiar para posición entrada
    rotation: 15,        // ← Cambiar para rotación entrada
    opacity: 0
}, {
    x: 0,
    rotation: 0,
    opacity: 1,
    duration: 1.4,       // ← Cambiar para velocidad
    stagger: 0.18,       // ← Cambiar para separación entre teléfonos
    ease: "power3.out"
}, "entrada_telefonos")
```

**Salida (líneas 338-344):**
```javascript
.to(".interface-wrapper", {
    y: "-110vh",         // ← Cambiar para altura salida
    opacity: 0,
    duration: 1.4,       // ← Cambiar para velocidad
    stagger: 0.1,        // ← Cambiar para separación
    ease: "power2.in"
}, "salida")
```

### Pájaros (Intro)

**Ubicación:** `script.js` líneas 45-103

**Parámetros del estado inicial:**
```javascript
window.introBirdConfig.initial = {
    b1_x: 0,          // Posición horizontal pájaro 1
    b1_y: -600,       // Posición vertical (negativo = arriba)
    b1_z: -200,       // Profundidad (negativo = detrás)
    b1_scale: 0.2,    // Tamaño (0.0 = invisible, 1.0 = tamaño normal)
    
    b2_x: -500,       // Izquierda (negativo)
    b2_y: -600,
    b2_z: -200,
    b2_scale: 0.0,    // Inicialmente invisible
    
    b3_x: 500,        // Derecha (positivo)
    b3_y: -600,
    b3_z: -200,
    b3_scale: 0.0,    // Inicialmente invisible
}
```

**Timings de entrada escalonada:**
```javascript
window.introBirdConfig.timings = {
    b1_start: 0,      // Pájaro 1 entra en t=0s
    b2_start: 0.5,    // Pájaro 2 entra en t=0.5s
    b3_start: 1.0,    // Pájaro 3 entra en t=1.0s
    duration: 4.5     // Duración de cada animación
}
```

---

## 🔍 CÓMO USAR EL PANEL DE PÁJAROS

1. **Abre el panel:** Click en ⚙️ (esquina superior izquierda en la intro)
2. **Ajusta valores:** Mueve cualquier slider
3. **Observa cambios:** Los pájaros se mueven en **tiempo real**
4. **Copia código:** Click en "Copiar" para guardar los valores
5. **Pega en script.js:** Reemplaza `window.introBirdConfig.initial` con el código generado

---

## 📝 RESUMEN DE ARCHIVOS CLAVE

| Archivo | Líneas | Qué controla |
|---------|--------|--------------|
| `script.js` | 45-103 | Configuración de pájaros (intro) |
| `script.js` | 178-295 | Timeline maestro (secciones 1-4) |
| `script.js` | 319-344 | Animación de teléfonos |
| `script.js` | 1238-1324 | Panel de control de pájaros |
| `index.html` | 370-377 | Textos SVG sección 4 |
| `index.html` | 34-158 | Panel HTML (esquina superior izquierda) |
| `style.css` | 1748-1942 | Estilos del panel |
| `style.css` | 448 | Espaciado de textos de fondo |

---

## 🚀 PRÓXIMOS PASOS

Para modificar cualquier aspecto:

1. **Identifica la sección** usando el mapa anterior
2. **Busca el archivo y línea** en la tabla
3. **Lee el código** para entender qué cambia
4. **Realiza el cambio** (valores numéricos principalmente)
5. **Guarda y recarga** el navegador para ver los cambios

**Para pájaros en la intro:** Usa el panel (mucho más fácil y rápido que editar código directamente)
