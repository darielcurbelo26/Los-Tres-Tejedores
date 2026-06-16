/* =============================================================================
   CONFIGURACIÓN CENTRAL DE LOS PÁJAROS
   =============================================================================
   Cada pájaro tiene fases nombradas con `from` y `to` explícitos.
   Solo define las propiedades que quieres cambiar en cada fase.

   PROPIEDADES disponibles en from/to:
     x      → posición lateral   (negativo = izquierda, positivo = derecha)
     y      → posición vertical  (negativo = abajo,     positivo = arriba)
     z      → profundidad        (negativo = lejos,     positivo = cerca)
     scale  → tamaño del pájaro  (1.0 = tamaño base)
     wingsAmp → amplitud del aleteo (valores ~4–20)
     rotX   → inclinación cabeza arriba/abajo (radianes, usa PI)
     rotY   → giro cabeza izq/der            (radianes, usa PI)

   REFERENCIA DE PANTALLA (aproximada, depende del zoom de cámara):
     x:  -800 borde izquierdo   |  0 centro  |  800 borde derecho
     y:  -600 borde inferior    |  0 centro  |  600 borde superior
     z:  -800 muy lejos (pequeño)             |  600 muy cerca (grande)

   FASES:
     `enter`   → la fase de entrada tiene `from` y `to`; inicializa el proxy.
     otras     → solo necesitan `to` (el `from` es el estado anterior).
     Cada fase tiene: at (cuándo empieza), duration (cuánto dura), ease.
   ========================================================================== */
(function () {
    const PI = Math.PI;

    window.BIRD_CONFIG = {
        // Duración total del "tiempo" de la coreografía (referencia para los `at`).
        totalDuration: 21,

        // Aparición / desaparición del contenedor 3D y descomposición en partículas.
        container:  { fadeIn: 0.4, fadeOutAt: 18.0, fadeOut: 2.5 },
        decompose:  { at: 18.0, duration: 3.0, ease: "power2.out" },

        // -------------------------------------------------------------------
        // PÁJAROS
        // -------------------------------------------------------------------
        birds: {

            // ================================================================
            // PÁJARO 1 · CENTRO (entra desde abajo)
            // ================================================================
            b1: {
                enter: {
                    from: { x: 0,    y: -1100, z: -120, scale: 0.3,  wingsAmp: 4.0,  rotX:  0.20, rotY: -0.40 * PI },
                    to:   { x: 0,    y: -150,  z: 0,    scale: 0.9,  wingsAmp: 16.0, rotX: -0.15, rotY: -0.45 * PI },
                    at: 0, duration: 6, ease: "power2.out"
                },
                move1: {
                    to:   { x: -100, y: -300,  z: 400,                              rotX: -0.30, rotY: -0.70 * PI },
                    at: 6, duration: 4, ease: "power2.inOut"
                },
                move2: {
                    to:   { x: -100, y: -276,  z: 386,                              rotX:  0.20, rotY: -0.20 * PI },
                    at: 10, duration: 4, ease: "power2.inOut"
                },
                move3: {
                    to:   { x: 0,    y: -150,  z: 0,                                rotX: -0.15, rotY: -0.45 * PI },
                    at: 14, duration: 4, ease: "power2.inOut"
                }
            },

            // ================================================================
            // PÁJARO 2 · IZQUIERDA (entra por esquina superior izquierda)
            // ================================================================
            b2: {
                enter: {
                    from: { x: -1300, y:  650,  z: -120, scale: 0.55, wingsAmp: 13.0, rotX: -0.15 * PI, rotY: -0.20 * PI },
                    to:   { x:   30,  y:  100,  z: -500,                               rotX: -0.15,      rotY: -0.35 * PI },
                    at: 0, duration: 6, ease: "power2.out"
                },
                move1: {
                    to:   { x:   50,  y:  200,  z: -300,                               rotX:  0.20,      rotY: -0.10 * PI },
                    at: 6, duration: 4, ease: "power2.inOut"
                },
                move2: {
                    to:   { x:  150,  y:  368,  z: -514,                               rotX: -0.25,      rotY: -0.85 * PI },
                    at: 10, duration: 4, ease: "power2.inOut"
                },
                move3: {
                    to:   { x:  -30,  y:  100,  z:  500,                               rotX: -0.15,      rotY: -0.35 * PI },
                    at: 14, duration: 4, ease: "power2.inOut"
                }
            },

            // ================================================================
            // PÁJARO 3 · DERECHA (entra por esquina superior derecha)
            // ================================================================
            b3: {
                enter: {
                    from: { x: 1300,  y:  650,  z: -120, scale: 0.65, wingsAmp: 18.0, rotX: -0.10 * PI, rotY: -0.60 * PI },
                    to:   { x:  -30,  y:  200,  z:  500,                               rotX: -0.15,      rotY: -0.55 * PI },
                    at: 0, duration: 6, ease: "power2.out"
                },
                move1: {
                    to:   { x:  -50,  y: -150,  z:  100,                               rotX: -0.20,      rotY: -0.80 * PI },
                    at: 6, duration: 4, ease: "power2.inOut"
                },
                move2: {
                    to:   { x: -150,  y:  478,  z:  147,                               rotX:  0.15,      rotY: -0.60 * PI },
                    at: 10, duration: 4, ease: "power2.inOut"
                },
                move3: {
                    to:   { x:   30,  y:  200,  z: -500,                               rotX: -0.15,      rotY: -0.55 * PI },
                    at: 14, duration: 4, ease: "power2.inOut"
                }
            }
        }
    };
})();
