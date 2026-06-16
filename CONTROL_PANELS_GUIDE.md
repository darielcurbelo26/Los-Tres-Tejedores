# Guía de Paneles de Control (Removidos)

## Resumen
Se implementaron dos paneles interactivos para ajustar parámetros en tiempo real:
1. **Panel Intro Birds** (esquina superior izquierda) - Control de pájaros en la intro
2. **Panel Tellus** (esquina inferior derecha) - Control del modelo 3D Tellus

Estos paneles permitían editar configuraciones y ver cambios instantáneamente sin tocar el código.

---

## 1. Panel de Pájaros de Intro

### Ubicación HTML
- ID: `intro-birds-controls-panel`
- Posición: `top: 20px; left: 20px;` (esquina superior izquierda)
- Color: Azul (#7fb3d5)

### Funcionalidad

#### A. Control de Posición
- **Inicial (X, Y)**: Posición de entrada del pájaro
  - `b*_x_init`: -800 a 800 (paso 50)
  - `b*_y_init`: -800 a 800 (paso 50)
- **Final (X, Y)**: Posición donde se agrupa con los otros
  - `b*_x_final`: -800 a 800 (paso 50)
  - `b*_y_final`: -800 a 800 (paso 50)

#### B. Control de Escala
- **Escala Final**: Tamaño en estado final
  - `b*_scale_final`: 0.1 a 3 (paso 0.1)

#### C. Control de Rotación
Dos sets separados de rotación:

**Rotación Inicial** (durante entrada):
- `b*_rotX`, `b*_rotY`, `b*_rotZ`: -3.14 a 3.14 (radianes, paso 0.1)
- Se aplica vía `window.birdProxy.b*_overrideRotX/Y/Z`

**Rotación Final** (en posición final):
- `b*_rotX_final`, `b*_rotY_final`, `b*_rotZ_final`: -3.14 a 3.14
- Se aplica vía `window.introBirdConfig.final.b*.rotX/Y/Z`

#### D. Control de Timings
- **Duración**: 1 a 10 segundos (paso 0.5)
  - `timing_duration`: duración total de la animación
- **Start Times**: Retraso de entrada para cada pájaro
  - `timing_b*_start`: 0 a 5 segundos (paso 0.1)
  - Permite entrada escalonada

### Objetos de Configuración Relacionados

```javascript
// Configuración de intro en script.js
window.introBirdConfig = {
    initial: {
        b1_x: 0, b1_y: -900, b1_z: -200, b1_scale: 0.2,
        b1_overrideRotX: 9999, // 9999 = automático (BirdFlock gestiona)
        b1_overrideRotY: 9999,
        b1_overrideRotZ: 9999,
        // ... b2 y b3 similar
    },
    final: {
        b1: { x: 0, y: 0, z: 0, scale: 0.85, rotX: 0, rotY: 0, rotZ: 0 },
        b2: { x: -180, y: 120, z: 0, scale: 0.55, rotX: 0, rotY: 0, rotZ: 0 },
        b3: { x: 180, y: 120, z: 0, scale: 0.65, rotX: 0, rotY: 0, rotZ: 0 }
    },
    timings: {
        b1_start: 0,   // Entrada inmediata
        b2_start: 0.4, // 0.4s después
        b3_start: 0.8, // 0.8s después
        duration: 3.5  // duración total
    }
};

// Proxy reactivo en tiempo real
window.birdProxy = {
    b1_x: 0, b1_y: 0, b1_z: 0,
    b1_overrideRotX: 0, b1_overrideRotY: 0, b1_overrideRotZ: 0,
    // ... más pájaros
    decompose: 0.0
};
```

---

## 2. Panel del Modelo Tellus

### Ubicación HTML
- ID: `tellus-controls-panel`
- Posición: `bottom: 20px; right: 20px;` (esquina inferior derecha)
- Color: Dorado (#dfbc94 - color-secondary)

### Funcionalidad

#### A. Posición 3D
- `t_x`: -500 a 500 (paso 10)
- `t_y`: -500 a 500 (paso 10)
- `t_z`: -500 a 500 (paso 10)

#### B. Escala
- `t_scale`: 10 a 300 (paso 5)

#### C. Rotación Base
- `t_rotX`: 0 a 6.28 radianes (paso 0.1)
- `t_rotY`: 0 a 6.28 radianes (paso 0.1)

#### D. Opacidad y Efectos
- `t_opacity`: 0 a 1 (paso 0.05)
- `t_mouseFollow`: 0 a 1 (intensidad de seguimiento del ratón, paso 0.1)

#### E. Intensidad de Luces
- `t_ambientIntensity`: 0 a 3 (paso 0.1)
- `t_directionalIntensity`: 0 a 3 (paso 0.1)
- (Nota: t_fillIntensity y t_pointIntensity eran editables pero no tenían sliders por espacio)

### Objetos de Configuración Relacionados

```javascript
// Proxy reactivo de Tellus
window.tellusProxy = {
    // Posición
    t_x: 0,
    t_y: 0,
    t_z: 0,
    
    // Escala
    t_scale: 150,
    
    // Rotación
    t_rotX: 0.3,
    t_rotY: 0.5,
    
    // Interactividad
    t_mouseFollow: 1.0, // 0-1: sigue el cursor
    
    // Visibilidad
    t_opacity: 1.0,
    
    // Luces
    t_ambientIntensity: 1.2,
    t_directionalIntensity: 1.0,
    t_fillIntensity: 0.5,
    t_pointIntensity: 0.8
};
```

### Lectura en TellusModelViewer.js
```javascript
updateFromProxy() {
    const proxy = window.tellusProxy;
    if (!proxy || !this.model) return;

    // Posición
    this.model.position.set(proxy.t_x, proxy.t_y, proxy.t_z);
    
    // Escala
    this.model.scale.set(proxy.t_scale, proxy.t_scale, proxy.t_scale);
    
    // Rotación base
    this.baseRotX = proxy.t_rotX;
    this.baseRotY = proxy.t_rotY;
    
    // Luces
    this.lights.ambient.intensity = proxy.t_ambientIntensity;
    this.lights.directional.intensity = proxy.t_directionalIntensity;
    this.lights.fill.intensity = proxy.t_fillIntensity;
    this.lights.point.intensity = proxy.t_pointIntensity;
    
    // Opacidad (se aplica a todos los meshes)
    this.model.traverse((node) => {
        if (node.isMesh && node.material) {
            node.material.opacity = proxy.t_opacity;
            node.material.transparent = true;
        }
    });
}
```

---

## 3. Arquitectura de Control

### Flujo de Datos
```
Panel HTML (Sliders)
       ↓
JavaScript Event Listeners
       ↓
window.birdProxy / window.tellusProxy (Objeto reactivo)
       ↓
BirdFlock.js / TellusModelViewer.js (Lee en cada frame)
       ↓
Cambios visuales en tiempo real
```

### Actualización en Tiempo Real
- **BirdFlock.js**: Lee `window.birdProxy` cada frame en `updateBirds()`
- **TellusModelViewer.js**: Lee `window.tellusProxy` cada frame en `updateFromProxy()`
- Los cambios se aplican sin necesidad de reload

### Persistencia de Cambios
1. **Botón "Copiar Código"**: Genera código JavaScript completo
2. El código se puede pegar en `script.js` para hacer cambios permanentes
3. Ejemplo para Tellus:
```javascript
window.tellusProxy = {
    t_x: 50.00,
    t_y: -100.50,
    // ... resto de parámetros
};
```

---

## 4. Cómo Editar sin Paneles

Para cambiar los parámetros directamente en código:

### Pájaros Intro
Editar en `script.js`, línea ~48:
```javascript
window.introBirdConfig = {
    initial: { ... },
    final: { ... },
    timings: { ... }
};
```

### Pájaros Main
Editar en `bird-config.js` o `script.js` línea ~6:
```javascript
window.birdProxy = {
    b1_x: valor,
    b1_y: valor,
    // ...
};
```

### Modelo Tellus
Editar en `script.js` línea ~83:
```javascript
window.tellusProxy = {
    t_x: valor,
    t_y: valor,
    // ...
};
```

---

## 5. Notas Técnicas

### Órbita Removida
- Se eliminó la lógica de órbita que rotaba posiciones
- `rotationX`, `rotationY` se removieron de `birdProxy`
- Los pájaros ahora usan **posición directa** sin transformaciones

### Rotaciones Individuales
- Cada pájaro tiene control independiente en X, Y, Z
- Se usan `override` values con valor especial `9999` para "automático"
- Las rotaciones se interpolan suavemente (lerp) hacia el objetivo

### Scroll Linking
- Modelo Tellus responde al scroll:
  - Escala decrece: `baseScale * (1 - dispersalStrength * 0.5)`
  - Opacidad decrece: `opacity * (1.0 - scrollProgress)`

---

## 6. Versión del Código

- **Último commit con paneles**: `855c734 Add: Rotaciones individuales para estado final`
- **Archivos afectados**:
  - `index.html`: Paneles HTML
  - `style.css`: Estilos de paneles
  - `script.js`: Lógica de inicialización y event listeners
  - `3DModel/Bird/BirdFlock.js`: Lectura de proxies
  - `3DModel/TellusModelViewer.js`: Actualización de parámetros

---

**Para restaurar los paneles en el futuro**, pueden recuperarse del git history de esos commits.
