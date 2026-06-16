# Animación de la tarjeta "Crear" (debajo del grid) — diagnóstico y corrección

## Síntoma

Al formarse las tres tarjetas-arco de la sección **Crear** (después del grid 6×6), la
palabra **"Crear"** aparecía **pegada arriba** dentro de su arco rojo, mientras que
**"Compartir"** y **"Conectar"** quedaban **abajo** de sus arcos. Las tres palabras
deberían compartir la misma línea base (todas ancladas abajo, con `padding-bottom`).

## Causa: doble traslación de GSAP (xPercent/yPercent + translate del CSS)

`.center-card-wrapper` (el contenedor de la palabra "Crear") se centra en CSS con:

```css
.center-card-wrapper {
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center bottom;
}
```

El timeline `buildMapCrearTimeline()` lo animaba **solo** con `scale` y `yPercent`:

```js
.set(".center-card-wrapper", { scale: 2.3, yPercent: -55, opacity: 0 }, 0)
...
.to(".center-card-wrapper", { scale: 1, yPercent: -50.5, ... }, 52.7)
```

Cuando GSAP toca el elemento por primera vez, **lee la matriz de transform computada**
y convierte el `translate(-50%, -50%)` del CSS en valores **en píxeles**, que guarda como
`x` e `y`. El `xPercent`/`yPercent` que aplicamos es un canal **aparte** que se **suma**
a esos px. Resultado comprobado en vivo (viewport ≈ 375 px, tarjeta 112,5 px):

| Propiedad | Valor |
|-----------|-------|
| `x` heredado (px) | `-56.25px`  (= −50 % del ancho) |
| `y` heredado (px) | `-56.25px`  (= −50 % del alto) |
| `yPercent` aplicado | `-50.5` |
| **`translateY` final** | `-56.25px + (−50.5%) = −113.7px` ≈ **−101 % del alto** |

Es decir, el centrado vertical se aplicaba **dos veces** (una como px heredado, otra
dentro del `yPercent`), elevando todo el bloque "Crear" casi una altura de tarjeta por
encima de donde está el arco rojo (que sí está centrado limpio en `translate(-50%,-50%)`).

> Es el mismo bug recurrente ya documentado y corregido en `.fixed-bottom-title` y
> `.phone-left-align` (ver el comentario en `initIntroSequence`, donde se resetea `x:0`).

## Corrección

Centrar el contenedor **solo por porcentaje**, anulando el px heredado: añadir
`x: 0, y: 0, xPercent: -50` y usar el centro real `yPercent: -50` (no `-50.5`).

```js
// ANTES
.set(".center-card-wrapper", { scale: 2.3, yPercent: -55, opacity: 0 }, 0)
.to (".center-card-wrapper", { scale: 1,  yPercent: -50.5, duration: 1.5, ease: "power2.inOut" }, 52.7)

// DESPUÉS
.set(".center-card-wrapper", { x: 0, y: 0, xPercent: -50, yPercent: -54.5, scale: 2.3, opacity: 0 }, 0)
.to (".center-card-wrapper", { scale: 1, yPercent: -50, duration: 1.5, ease: "power2.inOut" }, 52.7)
```

- `x: 0, y: 0` → elimina el `translate(-50%,-50%)` que GSAP había convertido a px.
- `xPercent: -50` → recupera el centrado **horizontal** por porcentaje (resiste resize).
- `yPercent: -50` final → centro real; "Crear" baja y se alinea abajo igual que los laterales.
- `yPercent: -54.5` inicial → mantiene el leve "asentamiento" hacia abajo (4,5 %) de la
  entrada al pasar de `scale 2.3 → 1`.

(Ya aplicado en `script.js`. Recuerda subir el `?v=` de `script.js` en `index.html`.)

## Regla general para no repetirlo

Si un elemento se centra con `transform: translate(-N%, -M%)` en CSS y **además** lo anima
GSAP: controla el centrado **solo por un lado**. O bien todo por CSS, o bien todo por GSAP
con `xPercent`/`yPercent` **acompañados de `x: 0` / `y: 0`**. Nunca mezclar los dos canales
sobre el mismo eje, porque se suman y descentran el elemento (peor cuanto más estrecho el
viewport).
