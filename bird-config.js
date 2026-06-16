/* =============================================================================
   CONFIGURACIÓN CENTRAL DE LOS PÁJAROS  (edítalo todo desde aquí)
   =============================================================================
   Cada pájaro tiene su PROPIO camino independiente. NO hay órbita global del
   "bando" — cada uno se mueve por sus puntos (keyframes) a lo largo del scroll.

   - Unidades de posición: las del canvas 3D (x: izq(-)/der(+), y: abajo(-)/arriba(+),
     z: lejos(-)/cerca(+)).
   - rotY / rotX: rotación de la cabeza en RADIANES. Usa PI (= Math.PI) para
     escribirlo cómodo:  rotY: -0.45 * PI.  Pon 9999 para "automático" (sigue al ratón).
   - scale: tamaño. wingsAmp: amplitud del aleteo.
   - Cada tramo del array `path` se interpola DESDE el estado anterior HASTA estos
     valores, empezando en el instante `at` y durando `duration` (en "tiempo" de
     timeline; el scroll lo recorre de 0 a `totalDuration`).
   - Lo que NO escribas en un tramo (p.ej. omites `scale`) se mantiene como estaba.

   Consulta PAJAROS.md para la guía completa.
   ========================================================================== */
(function () {
    const PI = Math.PI;

    window.BIRD_CONFIG = {
        // Duración total del "tiempo" de la coreografía (referencia para los `at`).
        totalDuration: 21,

        // Aparición / desaparición del contenedor 3D y descomposición en partículas.
        container: { fadeIn: 0.4, fadeOutAt: 18.0, fadeOut: 2.5 },
        decompose: { at: 18.0, duration: 3.0, ease: "power2.out" },

        // -------------------------------------------------------------------
        // CAMINO DE CADA PÁJARO
        // `start` = posición inicial (fuera de pantalla). `path` = lista de destinos.
        // -------------------------------------------------------------------
        birds: {
            // ---- Pájaro 1: CENTRO (entra desde abajo) -----------------------
            b1: {
                start: { x: 0, y: -1100, z: -120, scale: 0.3, wingsAmp: 4.0, rotX: 0.2, rotY: -0.4 * PI },
                path: [
                    { at: 0,  duration: 6, ease: "power2.out",   x: 0,    y: -150, z: 0,    scale: 0.9, wingsAmp: 16.0, rotX: -0.15, rotY: -0.45 * PI },
                    { at: 6,  duration: 4, ease: "power2.inOut", x: -100, y: -300, z: 400,                               rotX: -0.30, rotY: -0.70 * PI },
                    { at: 10, duration: 4, ease: "power2.inOut", x: -100, y: -276, z: 386,                               rotX: 0.20,  rotY: -0.20 * PI },
                    { at: 14, duration: 4, ease: "power2.inOut", x: 0,    y: -150, z: 0,                                 rotX: -0.15, rotY: -0.45 * PI }
                ]
            },

            // ---- Pájaro 2: IZQUIERDA (entra por la esquina sup. izquierda) ---
            b2: {
                start: { x: -1300, y: 650, z: -120, scale: 0.55, wingsAmp: 13.0, rotX: -0.15 * PI, rotY: -0.2 * PI },
                path: [
                    { at: 0,  duration: 6, ease: "power2.out",   x: 30,   y: 100,  z: -500, rotX: -0.15, rotY: -0.35 * PI },
                    { at: 6,  duration: 4, ease: "power2.inOut", x: 50,   y: 200,  z: -300, rotX: 0.20,  rotY: -0.10 * PI },
                    { at: 10, duration: 4, ease: "power2.inOut", x: 150,  y: 368,  z: -514, rotX: -0.25, rotY: -0.85 * PI },
                    { at: 14, duration: 4, ease: "power2.inOut", x: -30,  y: 100,  z: 500,  rotX: -0.15, rotY: -0.35 * PI }
                ]
            },

            // ---- Pájaro 3: DERECHA (entra por la esquina sup. derecha) -------
            b3: {
                start: { x: 1300, y: 650, z: -120, scale: 0.65, wingsAmp: 18.0, rotX: -0.1 * PI, rotY: -0.6 * PI },
                path: [
                    { at: 0,  duration: 6, ease: "power2.out",   x: -30,  y: 200,  z: 500,  rotX: -0.15, rotY: -0.55 * PI },
                    { at: 6,  duration: 4, ease: "power2.inOut", x: -50,  y: -150, z: 100,  rotX: -0.20, rotY: -0.80 * PI },
                    { at: 10, duration: 4, ease: "power2.inOut", x: -150, y: 478,  z: 147,  rotX: 0.15,  rotY: -0.60 * PI },
                    { at: 14, duration: 4, ease: "power2.inOut", x: 30,   y: 200,  z: -500, rotX: -0.15, rotY: -0.55 * PI }
                ]
            }
        }
    };
})();
