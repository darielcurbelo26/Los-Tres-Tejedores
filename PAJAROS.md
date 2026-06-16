# Guía de los pájaros 🕊️

Todo el movimiento de los tres pájaros 3D se controla desde **un único archivo**:
[`bird-config.js`](bird-config.js). No necesitas tocar `script.js` ni `BirdFlock.js`
para cambiar sus caminos.

> **Importante:** cada pájaro tiene su **propio camino independiente**. Ya **no**
> existe la órbita global del "bando" (todos girando juntos alrededor de un centro).
> Cada uno se mueve solo por los puntos que tú le definas.

---

## Cómo funciona

El scroll recorre una línea de tiempo de `0` a `totalDuration` (por defecto `21`).
Cada pájaro (`b1`, `b2`, `b3`) tiene:

- **`start`** → dónde está antes de entrar (fuera de pantalla).
- **`path`** → lista de destinos por los que pasa, en orden.

Cada destino del `path` es un **tramo**: el pájaro se desplaza *desde donde estaba*
*hasta* los valores que escribas, empezando en el instante `at` y durando `duration`.

```js
{ at: 6, duration: 4, ease: "power2.inOut", x: -400, y: -300, z: -100, rotY: -0.70 * PI }
```

| Campo      | Qué hace                                                                 |
|------------|--------------------------------------------------------------------------|
| `at`       | Instante de la timeline (0–`totalDuration`) en que **empieza** el tramo. |
| `duration` | Cuánto dura el desplazamiento.                                           |
| `ease`     | Curva de aceleración GSAP (`"power2.out"`, `"none"`, etc.). Opcional.    |
| `x`        | Horizontal: izquierda negativo, derecha positivo.                        |
| `y`        | Vertical: abajo negativo, arriba positivo.                               |
| `z`        | Profundidad: lejos negativo, cerca positivo.                             |
| `scale`    | Tamaño del pájaro.                                                        |
| `wingsAmp` | Amplitud del aleteo.                                                      |
| `rotY`     | Giro horizontal de la cabeza, en **radianes** (`-0.45 * PI`). `9999` = sigue al ratón. |
| `rotX`     | Inclinación vertical de la cabeza, en radianes.                          |

Lo que **omitas** en un tramo se mantiene como estaba (p. ej. si no pones `scale`,
no cambia de tamaño en ese tramo).

`PI` ya está disponible dentro del archivo (es `Math.PI`), así que puedes escribir
ángulos cómodos como `-0.5 * PI` (mirar a un lado) o `0.25 * PI`.

---

## Ejemplos rápidos

**Mover un pájaro a otro sitio en un momento dado** — edita (o añade) un tramo en su `path`:

```js
b3: {
  start: { ... },
  path: [
    { at: 0,  duration: 6, x: 500,  y: 200, z: 30 },
    { at: 6,  duration: 4, x: -100, y: -150, z: -50 },   // ← cambia estos números
    ...
  ]
}
```

**Añadir un punto nuevo al recorrido** — inserta un objeto más en el array `path`
con su `at` y `duration`. Procura que los `at` no se solapen de forma rara dentro del
mismo pájaro (van encadenados en el tiempo).

**Que un pájaro entre más tarde** — sube el `at` de su primer tramo (p. ej. de `0` a `3`).

**Quitar un pájaro de una fase** — dale las mismas coordenadas que el tramo anterior
(se quedará quieto) o sácalo de pantalla con una `x`/`y` grande.

---

## Aparición y partículas

```js
container: { fadeIn: 0.4, fadeOutAt: 18.0, fadeOut: 2.5 },
decompose: { at: 18.0, duration: 3.0, ease: "power2.out" },
```

- `container.fadeIn` → el contenedor 3D aparece al principio.
- `decompose.at` → instante en que los pájaros se deshacen en partículas.
- `container.fadeOutAt` / `fadeOut` → cuándo y en cuánto se desvanece todo.

---

## Caché en desarrollo

El servidor estático cachea los JS. Tras editar `bird-config.js`, **sube el número de
versión** en `index.html`:

```html
<script src="bird-config.js?v=2"></script>   <!-- v=1 → v=2 → ... -->
```

Si no, el navegador puede servir la versión antigua.
