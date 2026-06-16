# Pájaros y Control de Rotación - Guía Completa

## 📍 DÓNDE ESTÁN LOS PÁJAROS EN EL CÓDIGO

### 1. **Configuración Global (Cuerpo Principal)**
**Archivo:** `script.js` líneas 6-40  
**Variable:** `window.birdProxy`

```javascript
window.birdProxy = {
    // Pájaro 1 (Centro)
    b1_x: 0,              // Posición X (izquierda/derecha)
    b1_y: -150,           // Posición Y (arriba/abajo)
    b1_z: 0,              // Posición Z (profundidad)
    b1_overrideRotX: 9999,  // Rotación X (eje horizontal) — 9999 = automático
    b1_overrideRotY: 9999,  // Rotación Y (eje vertical)
    b1_overrideRotZ: 9999,  // Rotación Z (eje profundidad/roll)
    b1_scale: 0.85,       // Escala (tamaño)
    b1_wingsAmp: 16.0,    // Amplitud de alas

    // Pájaro 2 (Izquierda)
    b2_x: -500,
    b2_y: 100,
    b2_z: -30,
    b2_overrideRotX: 9999,
    b2_overrideRotY: 9999,
    b2_overrideRotZ: 9999,
    b2_scale: 0.55,
    b2_wingsAmp: 13.0,

    // Pájaro 3 (Derecha)
    b3_x: 500,
    b3_y: 200,
    b3_z: 30,
    b3_overrideRotX: 9999,
    b3_overrideRotY: 9999,
    b3_overrideRotZ: 9999,
    b3_scale: 0.65,
    b3_wingsAmp: 18.0,

    // Rotación orbital global (afecta a los 3 pájaros)
    rotationY: 0.0,
    rotationX: 0.0,
    rotationZ: 0.0
};
```

### 2. **Configuración de Intro (Separada)**
**Archivo:** `script.js` líneas 49-107  
**Variable:** `window.introBirdConfig`

```javascript
window.introBirdConfig = {
    initial: {
        // Estado inicial de los pájaros (fuera de pantalla)
        b1_x: 0,
        b1_y: -600,        // Arriba, fuera de pantalla
        b1_z: -200,        // Atrás
        b1_scale: 0.2,     // Pequeño
        b1_overrideRotX: 9999,
        b1_overrideRotY: 9999,
        b1_overrideRotZ: 9999,

        // ... b2 y b3 (escala 0.0 = invisible al inicio)

        rotationY: 0,
        rotationX: 0,
        rotationZ: 0
    },
    
    final: {
        // Posiciones finales al terminar la intro
        b1: { x: 0, y: 50, z: 0, scale: 1 },
        b2: { x: -500, y: 0, z: 0, scale: 0.55 },
        b3: { x: 500, y: 0, z: 0, scale: 0.65 }
    },

    timings: {
        b1_start: 0,      // Entra en t=0s
        b2_start: 0.5,    // Entra en t=0.5s
        b3_start: 1.0,    // Entra en t=1.0s
        duration: 4.5     // Duración de la animación
    }
};
```

### 3. **Renderizado 3D (Three.js)**
**Archivo:** `3DModel/Bird/BirdFlock.js`  
**Clase:** `window.BirdViewer`

**Líneas de lectura de posición:**
- Línea 387-408: Lee valores de `window.birdProxy`
- Línea 452-464: Aplica posición (x, y, z) a cada pájaro
- Línea 389-403: Lee rotación (overrideRotX, overrideRotY, overrideRotZ)

```javascript
// Ejemplo de cómo se usan los valores:
if (window.birdProxy) {
    // Leer rotación X
    if (window.birdProxy.b1_overrideRotX !== 9999) {
        this.birds[0].userData.overrideRotX = window.birdProxy.b1_overrideRotX;
    }
    
    // Leer posición
    basePos.set(window.birdProxy.b1_x, window.birdProxy.b1_y, window.birdProxy.b1_z);
    
    // Aplicar escala
    scaleVal = window.birdProxy.b1_scale;
}
```

---

## 🔄 CÓMO FUNCIONAN LAS ROTACIONES

### Valores de Rotación

| Valor | Significado |
|-------|------------|
| **9999** | Automático (sigue al ratón / comportamiento por defecto) |
| **-3.14 a 3.14** | Ángulo fijo en radianes (-π a π) |
| **0** | Sin rotación en ese eje |

### Los 3 Ejes de Rotación

```
        Y (arriba/abajo)
        ↑
        │
        ├─── X (izquierda/derecha)
       ╱
      ╱
     Z (hacia/dentro, roll/giro)
```

#### **Eje X (overrideRotX):** Rotación horizontal (yaw/guiñada)
- Negativo: Gira hacia la izquierda
- Positivo: Gira hacia la derecha
- Usado en: Rotación cabeza pájaro izquierda/derecha

#### **Eje Y (overrideRotY):** Rotación vertical (pitch/cabeceo)  
- Negativo: Mira hacia arriba
- Positivo: Mira hacia abajo
- Usado en: Inclinación del cuerpo arriba/abajo

#### **Eje Z (overrideRotZ):** Rotación de profundidad (roll/giro)
- Negativo: Gira en sentido antihorario
- Positivo: Gira en sentido horario
- Usado en: Giro de alas, ladeo del cuerpo

---

## 🎮 PANEL DE CONTROL EN LA INTRO

### Ubicación
**Botón:** ⚙️ (esquina superior izquierda)  
**Abre:** Panel de control de pájaros con sliders

### Sliders Disponibles

Para cada pájaro (b1, b2, b3):

```
POSICIÓN:
├─ x slider  (-1000 a 1000)
├─ y slider  (-800 a 800)
├─ z slider  (-500 a 500)
└─ scale slider (0 a 3)

ROTACIÓN:
├─ rotX slider (-3.14 a 3.14)  → muestra "auto" si = 9999
├─ rotY slider (-3.14 a 3.14)  → muestra "auto" si = 9999
└─ rotZ slider (-3.14 a 3.14)  → muestra "auto" si = 9999
```

### Cómo Usar

1. **Click en ⚙️** para abrir el panel
2. **Mueve cualquier slider** para cambiar en tiempo real
3. **Observa los pájaros** moviéndose en la pantalla
4. **El código se genera automáticamente** en el textarea
5. **Click "Copiar"** para guardar el código
6. **Pega en `script.js`** línea 51-78 (en `window.introBirdConfig.initial`)

### Ejemplo: Hacer que el Pájaro 1 Mire Hacia la Derecha

```
Abre panel → Pájaro 1 → rotX slider
Mueve hacia positivo (ejemplo: 1.57 = 90°)
→ Pájaro 1 mira a la derecha
```

---

## 📊 DIFERENCIAS: INTRO vs GLOBAL

### INTRO (Sin scroll)
- **Ubicación:** `script.js` líneas 49-107
- **Variable:** `window.introBirdConfig`
- **Estado inicial:** Pájaros fuera de pantalla (b2, b3 con scale 0)
- **Rotación inicial:** Automática (9999)
- **Control:** Panel de debug en esquina superior izquierda
- **Actualización:** Cambios en tiempo real + se guardan para próxima intro
- **Duración:** Animación de 4.5s con entrada escalonada

### GLOBAL (Con scroll, después de intro)
- **Ubicación:** `script.js` líneas 6-40
- **Variable:** `window.birdProxy`
- **Estado inicial:** Pájaros visibles en pantalla
- **Rotación inicial:** Automática (9999 = sigue ratón)
- **Control:** Modificar directamente en `window.birdProxy` o con panel
- **Actualización:** Los cambios afectan lo que ves en tiempo real
- **Duración:** Permanente durante toda la navegación

---

## 🎬 ANIMACIÓN DE INTRO (PASO A PASO)

**Archivo:** `script.js` líneas 1002-1038 (función `initIntroSequence`)

```
TIEMPO    EVENTO
0.0s ──→  Pájaro 1 comienza a entrar
          (desde y: -600 a y: 50)
          (desde scale: 0.2 a scale: 1)

0.5s ──→  Pájaro 2 comienza a entrar
          (desde y: -600 a y: 0)
          (desde scale: 0.0 a scale: 0.55)

1.0s ──→  Pájaro 3 comienza a entrar
          (desde y: -600 a y: 0)
          (desde scale: 0.0 a scale: 0.65)

4.5s ──→  INTRO TERMINA
          Transición al cuerpo principal
```

---

## 🛠️ CÓMO CAMBIAR LOS PÁJAROS

### Opción 1: Usar el Panel (Recomendado para Intro)

```
1. Abre la intro
2. Click ⚙️
3. Ajusta sliders
4. Copia código
5. Pega en window.introBirdConfig.initial
```

### Opción 2: Editar Código Directamente

**Para la intro:**
```javascript
// script.js línea 49-107
window.introBirdConfig.initial = {
    b1_x: 0,              // ← Cambiar aquí
    b1_y: -600,           // ← Cambiar aquí
    b1_z: -200,           // ← Cambiar aquí
    b1_scale: 0.2,        // ← Cambiar aquí
    b1_overrideRotX: 9999,  // ← Cambiar a número (-3.14 a 3.14)
    // ...
}
```

**Para el global:**
```javascript
// script.js línea 6-40
window.birdProxy = {
    b1_x: 0,              // ← Cambiar aquí
    b1_y: -150,           // ← Cambiar aquí
    // ...
}
```

---

## 🎯 VALORES ÚTILES

### Posiciones Comunes

```javascript
// Centro de pantalla
x: 0, y: 0, z: 0

// Arriba
y: -500

// Abajo
y: 500

// Atrás (lejos)
z: -300

// Adelante (cerca)
z: 300

// Izquierda
x: -500

// Derecha
x: 500
```

### Rotaciones Comunes

```javascript
// Sin rotación
overrideRotX: 0, overrideRotY: 0, overrideRotZ: 0

// Automático (sigue ratón)
overrideRotX: 9999, overrideRotY: 9999, overrideRotZ: 9999

// Mira a la derecha
overrideRotX: 1.57  // 90°

// Mira a la izquierda
overrideRotX: -1.57  // -90°

// Inclinado hacia arriba
overrideRotY: -0.5

// Inclinado hacia abajo
overrideRotY: 0.5

// Giro de ala derecha
overrideRotZ: 0.3

// Giro de ala izquierda
overrideRotZ: -0.3
```

---

## 📝 RESUMEN RÁPIDO

| Aspecto | Intro | Global |
|--------|-------|--------|
| **Archivo** | script.js líneas 49-107 | script.js líneas 6-40 |
| **Variable** | `window.introBirdConfig` | `window.birdProxy` |
| **Rotación por defecto** | 9999 (auto) | 9999 (sigue ratón) |
| **Número de pájaros** | 3 (b1, b2, b3) | 3 (b1, b2, b3) |
| **Panel de control** | ⚙️ en esquina arriba-izq | Se modifica en código |
| **Actualización** | Tiempo real + se guarda | Tiempo real |
| **Control ejes** | X, Y, Z completos | X, Y, Z completos |

