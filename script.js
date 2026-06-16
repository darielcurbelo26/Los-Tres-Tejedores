/* =========================================
   CONFIGURACIÓN DE LAS AVES (Modificable)
   ========================================= */
// Este objeto se lee en tiempo real. Puedes cambiar estos valores para mover o rotar los pájaros.
// En un futuro, GSAP puede animar estos valores para moverlos en el timeline.
window.birdProxy = {
    // Pájaro Principal (Centro)
    b1_x: 0,
    b1_y: 0,
    b1_z: 0,
    b1_overrideRotX: 0,
    b1_overrideRotY: 0,
    b1_overrideRotZ: 0,
    b1_scale: 0.0,
    b1_wingsAmp: 16.0,

    // Pájaro Izquierdo
    b2_x: 0,
    b2_y: 0,
    b2_z: 0,
    b2_overrideRotX: 0,
    b2_overrideRotY: 0,
    b2_overrideRotZ: 0,
    b2_scale: 0.0,
    b2_wingsAmp: 13.0,

    // Pájaro Derecho
    b3_x: 0,
    b3_y: 0,
    b3_z: 0,
    b3_overrideRotX: 0,
    b3_overrideRotY: 0,
    b3_overrideRotZ: 0,
    b3_scale: 0.0,
    b3_wingsAmp: 18.0,

    // Descomposición de partículas
    decompose: 0.0
};

/* =========================================
   CONFIGURACIÓN DE AVES PARA LA INTRO (Separada del main)
   ========================================= */
// Las rotaciones NO se animan en la intro — se dejan en 9999 para que BirdFlock
// las gestione con su propio lerp (igual que hacen los pájaros del interior).
// Solo se animan x, y, z, scale (como el sistema interior con bird-config.js).
window.introBirdConfig = {
    // Posiciones iniciales: cada pájaro llega desde una dirección distinta.
    // Rotaciones a 9999 = modo automático (BirdFlock hace el lerp solo).
    initial: {
        b1_x: 0,    b1_y: -900, b1_z: -200, b1_scale: 0.2,  // entra desde abajo
        b2_x: -900, b2_y:  400, b2_z: -200, b2_scale: 0.2,  // entra desde izq-arriba
        b3_x:  900, b3_y:  400, b3_z: -200, b3_scale: 0.2,  // entra desde der-arriba
        b1_overrideRotX: 9999, b1_overrideRotY: 9999, b1_overrideRotZ: 9999,
        b2_overrideRotX: 9999, b2_overrideRotY: 9999, b2_overrideRotZ: 9999,
        b3_overrideRotX: 9999, b3_overrideRotY: 9999, b3_overrideRotZ: 9999,
        // Offset aditivo sobre la rotación automática (0 = sin cambio, en radianes).
        b1_rotOffsetX: 0, b1_rotOffsetY: 0, b1_rotOffsetZ: 0,
        b2_rotOffsetX: 0, b2_rotOffsetY: 0, b2_rotOffsetZ: 0,
        b3_rotOffsetX: 0, b3_rotOffsetY: 0, b3_rotOffsetZ: 0,
        decompose: 0.0, rotationY: 0, rotationX: 0, rotationZ: 0
    },

    // Posiciones finales: los tres pájaros se agrupan en el centro.
    final: {
        b1: { x:    0, y:  0, z: 0, scale: 1, rotX: 0, rotY: 1, rotZ: 0 }, // centro
        b2: { x: -500, y:  120, z: 0, scale: 0.55, rotX: 0, rotY: 0, rotZ: 0 }, // izquierda
        b3: { x:  450, y:  120, z: 0, scale: 0.65, rotX: -2000, rotY: 0, rotZ: 0 }  // derecha
    },

    // Timings de entrada escalonada
    timings: {
        b1_start: 0,   // Pájaro 1 empieza primero
        b2_start: 0.4, // Pájaro 2 con pequeño retraso
        b3_start: 0.8, // Pájaro 3 último
        duration: 3.5
    }
};

/* =========================================
   CONFIGURACIÓN DEL MODELO 3D TELLUS (Modificable en tiempo real)
   ========================================= */
window.tellusProxy = {
    // Posición del modelo
    t_x: 0,
    t_y: 0,
    t_z: 0,

    // Escala del modelo
    t_scale: 150,

    // Rotación (inicial + seguimiento del ratón)
    t_rotX: 0.3,      // Rotación X inicial
    t_rotY: 0.5,      // Rotación Y inicial
    t_mouseFollow: 1.0, // 0-1: intensidad del seguimiento del ratón

    // Opacidad y visibilidad
    t_opacity: 1.0,

    // Intensidad de luces
    t_ambientIntensity: 1.2,
    t_directionalIntensity: 1.0,
    t_fillIntensity: 0.5,
    t_pointIntensity: 0.8
};

let birdViewer = null;
const visibleSections = new Set();

/* =========================================
   AJUSTE GLOBAL DE SCROLL
   =========================================
   Un único valor de scrub para TODOS los timelines: así el ritmo de scroll
   es coherente en toda la web (era una de las causas de la inconsistencia). */
const SCRUB = 1;
const SCROLLER = ".scroll-container";

/* =========================================
   PREPARACIÓN DE SVGs (trazo / draw)
   =========================================
   getTotalLength() necesita que el layout ya esté calculado, por eso esto
   se ejecuta DESPUÉS de window 'load' (fuentes e imágenes cargadas). */
let section3ArchPaths, crearArchPaths, archCardWidth;
// Longitud de trazo para el dibujado de los textos SVG de fondo (cubre 340px y los títulos)
const BG_STROKE_LENGTH = 20000;

function setupSVGs() {
    // Arcos de la sección 3
    section3ArchPaths = document.querySelectorAll('.third-section .arches-overlay svg path');
    section3ArchPaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length + "px";
        path.style.strokeDashoffset = length + "px"; // Oculto inicialmente
    });

    // Textos SVG de fondo (solo atributos DOM, sin CSS inline, para que GSAP los controle)
    const bgStrokeTextSVGs = document.querySelectorAll('.bg-stroke-text-svg');
    bgStrokeTextSVGs.forEach(text => {
        text.setAttribute('stroke-dasharray', BG_STROKE_LENGTH);
        text.setAttribute('stroke-dashoffset', BG_STROKE_LENGTH);
    });

    // Títulos de trazo "Rol" / "Descargar" — ocultos al inicio (sin dibujar)
    document.querySelectorAll('.stroke-title-svg').forEach(text => {
        text.setAttribute('stroke-dasharray', BG_STROKE_LENGTH);
        text.setAttribute('stroke-dashoffset', BG_STROKE_LENGTH);
    });

    // Arcos de la sección "Crear"
    crearArchPaths = document.querySelectorAll('.arches-crear-bg svg path');
    crearArchPaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length + "px";
        path.style.strokeDashoffset = length + "px"; // Oculto inicialmente
    });

    // Ancho del arco desde la CSS variable (respeta breakpoints responsivos)
    archCardWidth = getComputedStyle(document.documentElement)
        .getPropertyValue('--arch-card-width').trim() || 'clamp(100px, 22vw, 400px)';
}

/* =========================================
   PASO 1: Montaje/desmontaje por proximidad
   ========================================= */
function buildMountTriggers() {
    document.querySelectorAll('.section').forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 200%",
            end: "bottom -200%",
            toggleClass: "is-mounted",
            markers: false
        });
    });
}

/* =========================================
   MASTER TIMELINE: Lienzo Anclado (Secciones 1 a 4)
   ========================================= */
function buildMasterTimeline() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".pinned-canvas",
            start: "top top",
            end: "bottom bottom", // el recorrido lo da la altura 700% + el .pinned-sticky
            scrub: SCRUB,
            invalidateOnRefresh: true // recalcula valores en cada refresh (resize) sin descuadres
            // Sin pin de GSAP: el fijado lo hace .pinned-sticky (position:sticky), igual que mapa/crear
        }
    });

    tl
        // ================= SECCIÓN 1 (Hero) =================
        .to({}, {
            duration: 0.8
        }) // Pausa inicial para contemplar el slider

        // ================= SECCIÓN 2 (Frase) — efecto CINE =================
        // Al entrar: barras letterbox, fondo más oscuro, y se ocultan cabecera + frase inferior
        .to(".second-section", {
            opacity: 1,
            duration: 0.3
        }, "cine_in")
        .fromTo(".cinema-bar-top", {
            yPercent: -100
        }, {
            yPercent: 0,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_in")
        .fromTo(".cinema-bar-bottom", {
            yPercent: 100
        }, {
            yPercent: 0,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_in")
        .to(".bg-slider", {
            filter: "brightness(0.7)",
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_in")
        // La cabecera se desliza hacia ARRIBA y la frase inferior hacia ABAJO (suave, sin saltos)
        .to(".app-header", {
            yPercent: -100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_in")
        .to(".fixed-bottom-title", {
            yPercent: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_in")
        // fromTo explícito: el .from() dejaba las líneas atascadas en opacity:0/blur
        .fromTo(".phrase-line", {
            opacity: 0,
            filter: "blur(12px)"
        }, {
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.4,
            stagger: 0.3,
            ease: "power2.out"
        })
        .to({}, {
            duration: 1.5
        }) // Pausa para leer
        // Al pasar a la siguiente sección: las barras de cine se retiran a su lugar
        .to(".second-section", {
            opacity: 0,
            duration: 1.2
        }, "cine_out")
        .to(".cinema-bar-top", {
            yPercent: -100,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_out")
        .to(".cinema-bar-bottom", {
            yPercent: 100,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_out")
        .to(".bg-slider", {
            filter: "brightness(1)",
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_out")
        .to(".app-header", {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.inOut"
        }, "cine_out")

        // ================= SECCIÓN 3 (Arcos) — se dibujan LENTO y permanecen =================
        .to(".third-section", {
            opacity: 1,
            duration: 0.3
        })
        // El título inferior fijo se desvanece al entrar los arcos
        .to(".fixed-bottom-title", {
            opacity: 0,
            duration: 0.5
        }, "<")
        // Dibuja los arcos SVG — más tiempo en pantalla
        .to(section3ArchPaths, {
            strokeDashoffset: 0,
            duration: 5, // construcción más lenta de los arcos
            stagger: 0.1,
            ease: "none"
        })
        .to({}, {
            duration: 1
        }) // arcos solos un momento, ya completos

        // ===== Textos de fondo se pintan ENCIMA de los arcos (pertenecen a la 4ª sección) =====
        // Activamos la 4ª sección: los teléfonos siguen fuera de pantalla (fromTo más abajo).
        .to(".fourth-section", {
            opacity: 1,
            duration: 0.3
        })
        .to(".fourth-section .bg-stroke-text-svg", {
            attr: {
                "stroke-dashoffset": 0
            },
            duration: 8, // textos de fondo se construyen más lento
            stagger: 1,
            ease: "power2.out"
        })
        .to({}, {
            duration: 0.8
        }) // arcos + textos visibles juntos

        // ================= SECCIÓN 4 (Teléfonos) — arcos y textos SIGUEN visibles =================
        .to(".bg-slider", {
            opacity: 0,
            duration: 0.8
        }, "entrada_telefonos")
        .fromTo(".interface-wrapper", {
                x: "100vw",
                rotation: 15,
                opacity: 0
            }, {
                x: 0,
                rotation: 0,
                opacity: 1,
                duration: 1.4,
                stagger: 0.18,
                ease: "power3.out"
            },
            "entrada_telefonos"
        )
        .to({}, {
            duration: 3.5
        }) // Pausa para contemplar (aumentada de 1.5 a 3.5)

        // ===== Salida: los teléfonos suben y SOLO ENTONCES se van arcos + textos =====
        .to(".interface-wrapper", {
            y: "-110vh",
            opacity: 0,
            duration: 1.4,
            stagger: 0.1,
            ease: "power2.in"
        }, "salida")
        .to(".third-section", {
            opacity: 0,
            duration: 1.2
        }, "salida") // arcos se van con los teléfonos
        // Los textos de fondo se DES-DIBUJAN (trazo inverso) al salir, no se desvanecen
        .to(".fourth-section .bg-stroke-text-svg", {
            attr: {
                "stroke-dashoffset": BG_STROKE_LENGTH
            },
            duration: 1.2,
            ease: "power2.in"
        }, "salida")
        .to(".fourth-section", {
            opacity: 0,
            duration: 0.3
        });
}

/* =========================================
   PASO 5-7: Sección Unificada Mapa y Crear
   ========================================= */
function buildMapCrearTimeline() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".map-crear-animated-section",
            start: "top top",
            end: "bottom bottom",
            scrub: SCRUB
        }
    });

    // --- FASE MAPA (t=0 -> 37.2) ---

    // Configuración inicial de la parte de Crear al inicio del timeline (t=0)
    tl.set(".solid-red-arch", {
            width: "400vw",
            borderRadius: "5000vw 5000vw 0px 0px",
            opacity: 0
        }, 0)
        .set(".inverse-arch-mask", {
            width: "400vw",
            borderRadius: "5000vw 5000vw 0px 0px",
            opacity: 0
        }, 0)
        // x:0,y:0,xPercent:-50 → centrado SOLO por porcentaje. Si no, GSAP hereda el
        // translate(-50%,-50%) del CSS como px (x=-50% del ancho) y lo SUMA al yPercent
        // → doble traslación: "Crear" quedaba descentrado/elevado respecto a su arco.
        .set(".center-card-wrapper", {
            x: 0,
            y: 0,
            xPercent: -50,
            yPercent: -54.5,
            scale: 2.3,
            opacity: 0
        }, 0)

        // A) APERTURA MAPA: de 0 a 200vmax (t=0 -> 6.0)
        .fromTo(".animated-arch-container", {
                width: 0,
                borderRadius: "500vw 500vw 0 0",
                opacity: 0,
                borderColor: "var(--color-secondary)"
            }, {
                width: "200vmax",
                borderRadius: "5000vw 5000vw 0 0",
                borderColor: "transparent",
                duration: 6,
                ease: "power2.inOut"
            },
            0
        )
        .to(".animated-arch-container", {
            opacity: 1,
            duration: 1.5,
            ease: "power1.inOut"
        }, 0)

        // B) Fondo rojo aparece justo antes de entrar el grid (t=7.5 -> 8.5)
        .to(".bg-red-layer", {
            opacity: 1,
            duration: 1,
            ease: "power1.inOut"
        }, 7.5)

        // C) Entrada del Grid en ola (stagger) diagonal — POR ENCIMA del mapa (t=8.2 -> 10.7) + stagger
        .fromTo(".burst-img", {
                opacity: 0,
                scale: 0
            }, {
                opacity: 1,
                scale: 1,
                duration: 2.5,
                stagger: {
                    amount: 11,
                    grid: [6, 6],
                    from: "start"
                },
                ease: "power2.out"
            },
            8.2
        )

        // D) SALIDA GRID: desaparece secuencialmente de forma que la última imagen a la derecha desaparece al final (t=23.7 -> 26.2) + stagger
        .to(".burst-img", {
            opacity: 0,
            scale: 0,
            duration: 2.5,
            stagger: {
                amount: 11,
                grid: [6, 6],
                from: "start"
            }, // Stagger desde start para que la última foto a la derecha desaparezca al final
            ease: "power2.in"
        }, 23.7)

        // --- FASE TRANSICIÓN Y CREAR (t=37.2 -> 56.7) ---

        // E) Transición a Crear: las máscaras roja/beige se activan cubriendo el mapa (t=37.2 -> 38.7)
        .to([".solid-red-arch", ".inverse-arch-mask"], {
            opacity: 1,
            duration: 1.5,
            ease: "power2.inOut"
        }, 37.2)
        .to(".center-card-wrapper", {
            opacity: 1,
            duration: 1.5,
            ease: "power2.inOut"
        }, 37.2)

        // FASE Crear 1: dibujar arcos SVG (t=38.7 -> 43.2)
        .to(crearArchPaths, {
            strokeDashoffset: 0,
            duration: 4.5,
            stagger: 0.08,
            ease: "none"
        }, 38.7)

        // FASE Crear 2: textos de fondo (t=43.2 -> 47.2)
        .to(".bg-words-crear .bg-stroke-dark-svg", {
            attr: {
                "stroke-dashoffset": 0
            },
            duration: 8,
            stagger: 1,
            ease: "power2.out"
        }, 43.2)

        // FASE Crear 3: rellenar "Crear" (t=47.2 -> 49.2)
        .to(".crear-word-filled", {
            clipPath: "inset(0 -20% 0 0)",
            duration: 2,
            ease: "power1.inOut"
        }, 47.2)

        // FASE Crear 4: máscaras se contraen hasta formar la tarjeta (t=49.2 -> 53.2)
        .to(".solid-red-arch", {
            width: archCardWidth,
            borderRadius: "500vw 500vw 0px 0px",
            duration: 4,
            ease: "power2.inOut"
        }, 49.2)
        .to(".inverse-arch-mask", {
            width: archCardWidth,
            borderRadius: "500vw 500vw 0px 0px",
            duration: 4,
            ease: "power2.inOut"
        }, 49.2)

        // FASE Crear 5: central card baja a su posición final (t=52.7 -> 54.2)
        // Centro real (yPercent:-50, sin px heredado): "Crear" queda alineado abajo igual que Compartir/Conectar
        .to(".center-card-wrapper", {
            scale: 1,
            yPercent: -50,
            duration: 1.5,
            ease: "power2.inOut"
        }, 52.7)

        // FASE Crear 6: side cards emergen desde detrás (t=53.2 -> 55.2)
        .fromTo(".side-arch-left", {
            xPercent: 110,
            opacity: 0,
            scale: 0.9,
            rotation: 0
        }, {
            xPercent: 0,
            opacity: 1,
            scale: 1,
            rotation: -6,
            duration: 2,
            ease: "power3.out"
        }, 53.2)
        .fromTo(".side-arch-right", {
            xPercent: -110,
            opacity: 0,
            scale: 0.9,
            rotation: 0
        }, {
            xPercent: 0,
            opacity: 1,
            scale: 1,
            rotation: 6,
            duration: 2,
            ease: "power3.out"
        }, 53.2)

        // Salida final: textos se des-dibujan al final (t=55.2 -> 56.7)
        .to(".bg-words-crear .bg-stroke-dark-svg", {
            attr: {
                "stroke-dashoffset": BG_STROKE_LENGTH
            },
            duration: 1.5,
            ease: "power2.in"
        }, 55.2)

        // --- FASE SALIDA DE ARCOS (t=56.7 -> 59.7) ---
        .to(".side-arch-left", {
            xPercent: -200,
            yPercent: -150,
            rotation: -30,
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, 56.7)
        .to(".side-arch-right", {
            xPercent: 200,
            yPercent: -150,
            rotation: 30,
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, 56.7)
        .to(".center-card-wrapper", {
            yPercent: -200,
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, 56.7)
        .to(".solid-red-arch", {
            yPercent: -200,
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, 56.7)
        .to(".inverse-arch-mask", {
            yPercent: -200,
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, 56.7)
        .to(".animated-arch-container", {
            opacity: 0,
            duration: 2,
            ease: "power1.inOut"
        }, 56.7)
        .to(".bg-red-layer", {
            opacity: 0,
            duration: 2,
            ease: "power1.inOut"
        }, 56.7);
}

/* =========================================
   PASO 8: Escena 3D de los pájaros (lazy)
   ========================================= */
function buildBirdObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visibleSections.add(entry.target);
            else visibleSections.delete(entry.target);
        });

        if (visibleSections.size > 0 && !birdViewer) {
            birdViewer = new window.BirdViewer('#birds-container');
        } else if (visibleSections.size === 0 && birdViewer) {
            birdViewer.destroy();
            birdViewer = null;
        }
    }, {
        threshold: 0,
        rootMargin: "200px 0px",
        root: null // Observar la intersección con el viewport completo (mucho más robusto)
    });

    // Montar desde la MITAD del recorrido (sección "Crear") hasta "Descargar" (unificada en la 8ª sección)
    document.querySelectorAll('.map-crear-animated-section, .eighth-section')
        .forEach(sec => observer.observe(sec));

    window.addEventListener('mousemove', (e) => {
        if (birdViewer) {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            birdViewer.onMouseMove(x, y);
        }
    });
}

/* =========================================
   COREOGRAFÍA SECCIÓN 8: "Rol" → "Descargar"
   ========================================= */
function buildEighthSectionTimeline() {
    const rol = document.querySelector('[data-title="rol"]');
    const desc = document.querySelector('[data-title="descargar"]');
    if (!rol || !desc) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".eighth-section",
            start: "top top",
            end: "bottom bottom",
            scrub: SCRUB
        }
    });

    // Configuración inicial de opacidad y posiciones en t=0 (popups más separados)
    tl.set(".rol-phones-container img:nth-child(1)", {
            opacity: 0,
            yPercent: 120,
            y: 0
        }, 0)
        .set(".rol-phones-container img:nth-child(2)", {
            opacity: 0,
            yPercent: 120,
            y: 0
        }, 0)
        .set(".rol-phones-container img:nth-child(3)", {
            opacity: 0,
            yPercent: 120,
            y: 0
        }, 0)
        .set(".rol-popups-container .popup-asset", {
            opacity: 0
        }, 0)
        .set(".rol-popups-container .popup-left", {
            xPercent: -220,
            rotation: -20
        }, 0)
        .set(".rol-popups-container .popup-right", {
            xPercent: 220,
            rotation: 20
        }, 0)
        .set(".descargar-phone-container .phone-left-align", {
            opacity: 0,
            x: 0,
            xPercent: -50,
            yPercent: 120,
            rotation: 0
        }, 0)
        .set(".descargar-buttons-container", {
            opacity: 0,
            xPercent: 150
        }, 0)
        .to(".app-header", {
            yPercent: -100,
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut"
        }, 0)

        // Fase 1: Dibujado de "Rol" (t=0 -> 3.0)
        .to(rol, {
            attr: {
                "stroke-dashoffset": 0
            },
            duration: 3,
            ease: "power1.inOut"
        }, 0)

        // Fase 2: Entrada de los teléfonos como bloques staggered y desplazados en Y (t=3.0 -> 4.9)
        .to(".rol-phones-container img:nth-child(1)", {
            opacity: 1,
            yPercent: 0,
            y: 25,
            duration: 1.5,
            ease: "power2.out"
        }, 3.0)
        .to(".rol-phones-container img:nth-child(2)", {
            opacity: 1,
            yPercent: 0,
            y: -25,
            duration: 1.5,
            ease: "power2.out"
        }, 3.2)
        .to(".rol-phones-container img:nth-child(3)", {
            opacity: 1,
            yPercent: 0,
            y: 25,
            duration: 1.5,
            ease: "power2.out"
        }, 3.4)
        // Atenuar texto de fondo para no colisionar con la legibilidad
        .to(rol, {
            opacity: 0.15,
            duration: 1
        }, 3.0)

        // Fase 3: Salida lenta de teléfonos hacia arriba de forma escalonada (t=7.5 -> 9.9)
        .to(".rol-phones-container img:nth-child(1)", {
            opacity: 0,
            yPercent: -120,
            y: 0,
            duration: 2,
            ease: "power2.in"
        }, 7.5)
        .to(".rol-phones-container img:nth-child(2)", {
            opacity: 0,
            yPercent: -120,
            y: 0,
            duration: 2,
            ease: "power2.in"
        }, 7.7)
        .to(".rol-phones-container img:nth-child(3)", {
            opacity: 0,
            yPercent: -120,
            y: 0,
            duration: 2,
            ease: "power2.in"
        }, 7.9)

        // Fase 4: Entrada lenta de Popups Laterales desde más afuera (t=9.5 -> 11.5)
        .to(".rol-popups-container .popup-left", {
            opacity: 1,
            xPercent: 0,
            rotation: 0,
            duration: 2,
            ease: "power2.out"
        }, 9.5)
        .to(".rol-popups-container .popup-right", {
            opacity: 1,
            xPercent: 0,
            rotation: 0,
            duration: 2,
            ease: "power2.out"
        }, 9.5)

        // Fase 5: Salida lenta de Popups y Desdibujado de "Rol" (t=14.5 -> 16.5) (Pausa amplia de 3s en medio)
        .to(".rol-popups-container .popup-left", {
            opacity: 0,
            xPercent: -220,
            rotation: -20,
            duration: 2,
            ease: "power2.in"
        }, 14.5)
        .to(".rol-popups-container .popup-right", {
            opacity: 0,
            xPercent: 220,
            rotation: 20,
            duration: 2,
            ease: "power2.in"
        }, 14.5)
        .to(rol, {
            attr: {
                "stroke-dashoffset": BG_STROKE_LENGTH
            },
            opacity: 0,
            duration: 2,
            ease: "power2.inOut"
        }, 14.5)

        // Fase 6: Dibujado de "Descargar app" (t=16.5 -> 19.5)
        .to(desc, {
            attr: {
                "stroke-dashoffset": 0
            },
            opacity: 1,
            duration: 3,
            ease: "power1.inOut"
        }, 16.5)

        // Fase 7: Entrada del Teléfono izquierdo y Botones (t=19.5 -> 21.5) (Entrada más pausada de 2s)
        .to(".descargar-phone-container .phone-left-align", {
            opacity: 1,
            xPercent: -50,
            yPercent: 0,
            rotation: 0,
            duration: 2,
            ease: "power2.out"
        }, 19.5)
        .to(".descargar-buttons-container", {
            opacity: 1,
            xPercent: 0,
            duration: 2,
            ease: "power2.out"
        }, 19.5)
        .to(desc, {
            opacity: 0.15,
            duration: 1
        }, 19.5)

        // Fase 8: Pausa estática final, manteniendo visibles el teléfono y los botones (t=21.5 -> 24.0)
        .to({}, {
            duration: 2.5
        }, 21.5);
}

/* =========================================
   PASO 8 (mov.): Coreografía de los pájaros por scroll
   =========================================
   BirdFlock lee window.birdProxy cada frame, así que animamos ese objeto.
   Entran desde fuera del canvas a media web, interactúan (rotación/vaivén ya
   integrados en BirdFlock) y al llegar a "Descargar" se dispersan a los bordes
   y el contenedor se desvanece (descomposición simple, sin shader). */
function buildBirdTimeline() {
    const cfg = window.BIRD_CONFIG;
    if (!cfg) { console.warn("BIRD_CONFIG no cargado (bird-config.js)"); return; }

    // Convierte propiedades de keyframe a las claves bN_* del proxy.
    const toProxy = (key, kf) => {
        const map = { x: "_x", y: "_y", z: "_z", scale: "_scale", wingsAmp: "_wingsAmp", rotX: "_overrideRotX", rotY: "_overrideRotY" };
        const o = {};
        Object.keys(map).forEach(p => { if (kf[p] !== undefined) o[key + map[p]] = kf[p]; });
        return o;
    };

    // Estado inicial: `from` de la fase `enter` de cada pájaro.
    const initial = { decompose: 0.0, rotationY: 0.0, rotationX: 0.0 };
    Object.keys(cfg.birds).forEach(key => Object.assign(initial, toProxy(key, cfg.birds[key].enter.from)));
    Object.assign(window.birdProxy, initial);

    const tl = gsap.timeline({
        scrollTrigger: {
            id: "birdScrollTrigger",
            trigger: ".map-crear-animated-section",
            start: "top center",
            endTrigger: ".eighth-section",
            end: "bottom bottom",
            scrub: SCRUB
        }
    });

    tl.to("#birds-container", { opacity: 1, duration: cfg.container.fadeIn }, 0);

    // Cada pájaro: recorre sus fases en orden de `at`.
    // El estado inicial ya está en el proxy (enter.from), así que todas las fases usan `to`.
    Object.keys(cfg.birds).forEach(key => {
        const bird = cfg.birds[key];
        Object.values(bird).forEach(phase => {
            tl.to(window.birdProxy,
                { ...toProxy(key, phase.to), duration: phase.duration, ease: phase.ease || "power2.inOut" },
                phase.at
            );
        });
    });

    tl.to(window.birdProxy, {
            decompose: 1.0,
            duration: cfg.decompose.duration,
            ease: cfg.decompose.ease || "power2.out"
        }, cfg.decompose.at)
      .to("#birds-container", {
            opacity: 0,
            duration: cfg.container.fadeOut,
            ease: "power2.inOut"
        }, cfg.container.fadeOutAt);
}

/* =========================================
   AUDIO AMBIENTE (pájaros) + MÚSICA (arpa)
   =========================================
   Volumen bajo y discreto. Los navegadores bloquean el autoplay con sonido,
   así que arranca en la primera interacción del usuario. Botón para silenciar. */
function setupAudio() {
    const birds = document.getElementById('audio-birds');
    const music = document.getElementById('audio-music');
    const toggle = document.getElementById('sound-toggle');
    if (!birds || !music || !toggle) return;

    birds.volume = 0.6; // subido a 0.6 para destacar el sonido de fondo (aves)
    music.volume = 0.04; // bajado a 0.04 para que la música sea más ambiental y sutil
    let enabled = false;
    let started = false;

    const playBoth = () => {
        birds.play().catch(() => {});
        music.play().catch(() => {});
    };

    // Primera interacción: arranca el sonido (una sola vez)
    const startOnce = () => {
        if (started) return;
        started = true;
        enabled = true;
        toggle.setAttribute('aria-pressed', 'true');
        playBoth();
        window.removeEventListener('pointerdown', startOnce);
        window.removeEventListener('keydown', startOnce);
        window.removeEventListener('wheel', startOnce);
    };
    window.addEventListener('pointerdown', startOnce);
    window.addEventListener('keydown', startOnce);
    window.addEventListener('wheel', startOnce, {
        passive: true
    });

    // Botón: silenciar / reactivar
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!started) {
            startOnce();
            return;
        }
        enabled = !enabled;
        toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        if (enabled) playBoth();
        else {
            birds.pause();
            music.pause();
        }
    });
}

/* =========================================
   PARALLAX SUAVE DEL MAPA
   ========================================= */
function buildMapParallax() {
    const mapContainer = document.querySelector('.animated-arch-container .arch-full-screen');
    if (!mapContainer) return;

    let targetX = 0,
        targetY = 0,
        liveX = 0,
        liveY = 0;
    const PARALLAX = 0.035;
    const LERP = 0.06;

    document.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        targetX = -(e.clientX - centerX) * PARALLAX;
        targetY = -(e.clientY - centerY) * PARALLAX;
    });

    const loop = () => {
        liveX += (targetX - liveX) * LERP;
        liveY += (targetY - liveY) * LERP;
        // .arch-full-screen ya tiene translate(-50%, -50%) base; lo mantenemos y sumamos el parallax.
        mapContainer.style.transform =
            `translate(calc(-50% + ${liveX}px), calc(-50% + ${liveY}px)) scale(1.05)`;
        requestAnimationFrame(loop);
    };
    loop();
}

/* =========================================
   ARRANQUE
   =========================================
   Todo se inicializa tras 'load' para que el layout esté estable y los
   ScrollTrigger calculen bien sus start/end. gsap.context permite limpiar
   todo de golpe al recalcular. */
gsap.registerPlugin(ScrollTrigger);

let mainCtx = null;

let introBirdViewer = null;
window.isIntroActive = false; // Bandera para desactivar ratón durante intro

function initIntroSequence() {
    window.isIntroActive = true; // Activar durante intro

    // 1. Inicializar el audio ambiente y música para que capte la primera interacción bubbled
    setupAudio();

    // 2. Estado inicial de birdProxy usando la configuración de intro separada
    Object.assign(window.birdProxy, window.introBirdConfig.initial);

    // 2b. #intro-title ya tiene su CSS propio (top: 1.25rem, position: absolute)
    // GSAP lo anima cuando sale por arriba. No hay preposicionamiento necesario.

    // 3. Crear el visor 3D temporal en el contenedor de la intro
    introBirdViewer = new window.BirdViewer('#intro-birds-container');

    // 4. Crear el timeline GSAP para ensamblar la figura
    const introTl = gsap.timeline();
    const cfg = window.introBirdConfig;

    // Entrada escalonada: solo animamos x, y, z, scale.
    // Las rotaciones están en 9999 → BirdFlock las lerps solo, sin interferencia GSAP.
    introTl
        .to(window.birdProxy, {
            b1_x: cfg.final.b1.x, b1_y: cfg.final.b1.y, b1_z: cfg.final.b1.z, b1_scale: cfg.final.b1.scale,
            duration: cfg.timings.duration, ease: "power2.out"
        }, cfg.timings.b1_start)
        .to(window.birdProxy, {
            b2_x: cfg.final.b2.x, b2_y: cfg.final.b2.y, b2_z: cfg.final.b2.z, b2_scale: cfg.final.b2.scale,
            duration: cfg.timings.duration, ease: "power2.out"
        }, cfg.timings.b2_start)
        .to(window.birdProxy, {
            b3_x: cfg.final.b3.x, b3_y: cfg.final.b3.y, b3_z: cfg.final.b3.z, b3_scale: cfg.final.b3.scale,
            duration: cfg.timings.duration, ease: "power2.out"
        }, cfg.timings.b3_start)
        .to("#btn-intro-enter", {
            opacity: 1,
            pointerEvents: "auto",
            duration: 0.8
        });

    // 5. Configurar el click en el botón ENTRAR
    const enterBtn = document.getElementById('btn-intro-enter');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Animar el título de la intro hacia arriba
            gsap.to("#intro-title", {
                y: "-100vh",
                opacity: 0,
                duration: 1.2,
                ease: "power2.in"
            });

            // Animar el fondo a transparente
            gsap.to("#intro-screen", {
                opacity: 0,
                duration: 1.2,
                onComplete: () => {
                    window.isIntroActive = false; // Desactivar bandera de intro
                    // Limpiar recursos WebGL de la intro inmediatamente para evitar saturación de contexto GPU
                    if (introBirdViewer) {
                        introBirdViewer.destroy();
                        introBirdViewer = null;
                    }
                    const introScreen = document.getElementById('intro-screen');
                    if (introScreen) introScreen.remove();

                    // Arrancar el resto del sitio
                    // El masterTimeline controla .fixed-bottom-title desde el inicio (línea ~139)
                    // Sin conflictos: .fixed-bottom-title es un elemento separado del #intro-title
                    initAll();
                }
            });
        });
    }
}

function initAll() {
    ScrollTrigger.defaults({
        scroller: SCROLLER
    });

    setupSVGs();

    mainCtx = gsap.context(() => {
        buildMountTriggers();
        buildMasterTimeline();
        buildMapCrearTimeline();
        buildBirdTimeline();
        buildEighthSectionTimeline();
    });

    buildBirdObserver();
    buildMapParallax();

    // Recalcular posiciones una vez montado todo.
    ScrollTrigger.refresh();
}

/* =========================================
   PANTALLA DE CARGA (contador 0→100)
   =========================================
   Se muestra antes de todo. El número avanza suave hacia un tope del 90 %
   y solo llega a 100 cuando 'load' real ha terminado (todas las imágenes,
   fuentes y audios cargados): así el contador refleja la carga real.
   Al llegar a 100 se desvanece y arranca la intro de los pájaros. */
function initLoader() {
    const screen = document.getElementById('loader-screen');
    const counterEl = document.getElementById('loader-counter');
    if (!screen || !counterEl) {
        initIntroSequence();
        return;
    }

    let progress = 0;
    let loaded = document.readyState === 'complete';
    if (!loaded) window.addEventListener('load', () => {
        loaded = true;
    });

    const finish = () => {
        counterEl.textContent = 100;
        screen.style.opacity = '0';
        // El timeout coincide con la transición de opacidad del CSS (0.8s)
        setTimeout(() => {
            screen.remove();
            initIntroSequence();
        }, 800);
    };

    const tick = () => {
        const cap = loaded ? 100 : 90; // se frena al 90 % hasta que termina la carga real
        progress += (cap - progress) * 0.06; // acercamiento exponencial (rápido→lento)
        if (loaded && cap - progress < 0.5) progress = 100;
        counterEl.textContent = Math.round(progress);
        if (progress >= 100) {
            finish();
            return;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

initLoader();

// Detectar fondo debajo del logo y ajustar color para que difference funcione
function updateLogoColor() {
    const logoEl = document.querySelector('.header-logo');
    if (!logoEl) return;

    // Obtener color de fondo debajo del logo
    const rect = logoEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Encontrar elemento debajo (ignorar el logo mismo)
    const elementBelow = document.elementFromPoint(x, y);
    if (!elementBelow) return;

    const bgColor = window.getComputedStyle(elementBelow).backgroundColor;
    const rgb = bgColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) return;

    // Calcular luminancia (qué tan claro es el fondo)
    const [r, g, b] = rgb.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Ajustar color del logo: si fondo claro → logo oscuro, si oscuro → logo claro
    const root = document.documentElement;
    if (luminance > 0.5) {
        root.style.setProperty('--logo-fill', '#121212');
        root.style.setProperty('--logo-stroke', '#121212');
    } else {
        root.style.setProperty('--logo-fill', '#f7f5f0');
        root.style.setProperty('--logo-stroke', '#f7f5f0');
    }
}

window.addEventListener('load', updateLogoColor);
window.addEventListener('scroll', updateLogoColor);

// Recalcular en resize (con debounce) para que el pin y los start/end no se descuadren.
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalcular longitudes de SVGs y variables CSS como archCardWidth
        setupSVGs();

        // Revertir y reconstruir los timelines de GSAP con las nuevas dimensiones
        if (mainCtx) {
            mainCtx.revert();
        }

        mainCtx = gsap.context(() => {
            buildMountTriggers();
            buildMasterTimeline();
            buildMapCrearTimeline();
            buildBirdTimeline();
            buildEighthSectionTimeline();
        });

        ScrollTrigger.refresh();
    }, 200);
});

/* =========================================
   PANEL DE CONTROL DE DEBUG (Intro Aves)
   ========================================= */
function setupIntroPanelControls() {
    const toggleBtn = document.getElementById('toggle-debug-panel');
    const panel = document.getElementById('intro-debug-panel');
    const codeOutput = document.getElementById('debug-code-output');
    const copyBtn = document.getElementById('debug-copy-btn');

    // Toggle panel visibility
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        toggleBtn.classList.toggle('is-open');
    });

    // Get all sliders
    const sliders = document.querySelectorAll('.debug-slider-label input[type="range"]');

    function updateCodeOutput() {
        const values = {};
        sliders.forEach(slider => {
            const id = slider.id;
            const value = parseFloat(slider.value);
            values[id] = value;

            // Update the value display (mostrar "auto" para rotaciones con 9999)
            const valueSpan = slider.parentElement.querySelector('.debug-value');
            if (valueSpan) {
                if (id.includes('overrideRot') && Math.abs(value - 9999) < 0.01) {
                    valueSpan.textContent = 'auto';
                } else {
                    valueSpan.textContent = value.toFixed(2);
                }
            }

            // Update window.birdProxy for REAL-TIME changes
            window.birdProxy[id] = value;

            // Also update introBirdConfig.initial for next intro reset
            if (id.startsWith('b1_') || id.startsWith('b2_') || id.startsWith('b3_')) {
                window.introBirdConfig.initial[id] = value;
            }
        });

        // Helper function to format rotation values
        const formatRot = (val) => Math.abs(val - 9999) < 0.01 ? '9999' : val.toFixed(2);

        // Generate copyable code
        const code = `window.introBirdConfig.initial = {
    b1_x: ${values.b1_x.toFixed(2)},
    b1_y: ${values.b1_y.toFixed(2)},
    b1_z: ${values.b1_z.toFixed(2)},
    b1_scale: ${values.b1_scale.toFixed(2)},
    b1_overrideRotX: ${formatRot(values.b1_overrideRotX)},
    b1_overrideRotY: ${formatRot(values.b1_overrideRotY)},
    b1_overrideRotZ: ${formatRot(values.b1_overrideRotZ)},

    b2_x: ${values.b2_x.toFixed(2)},
    b2_y: ${values.b2_y.toFixed(2)},
    b2_z: ${values.b2_z.toFixed(2)},
    b2_scale: ${values.b2_scale.toFixed(2)},
    b2_overrideRotX: ${formatRot(values.b2_overrideRotX)},
    b2_overrideRotY: ${formatRot(values.b2_overrideRotY)},
    b2_overrideRotZ: ${formatRot(values.b2_overrideRotZ)},

    b3_x: ${values.b3_x.toFixed(2)},
    b3_y: ${values.b3_y.toFixed(2)},
    b3_z: ${values.b3_z.toFixed(2)},
    b3_scale: ${values.b3_scale.toFixed(2)},
    b3_overrideRotX: ${formatRot(values.b3_overrideRotX)},
    b3_overrideRotY: ${formatRot(values.b3_overrideRotY)},
    b3_overrideRotZ: ${formatRot(values.b3_overrideRotZ)},

    decompose: 1.0,
    rotationY: 0,
    rotationX: 0,
    rotationZ: 0
};`;

        codeOutput.value = code;
    }

    // Add event listeners to all sliders
    sliders.forEach(slider => {
        slider.addEventListener('input', updateCodeOutput);
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        codeOutput.select();
        document.execCommand('copy');
        copyBtn.textContent = '✓ Copiado';
        setTimeout(() => {
            copyBtn.textContent = 'Copiar';
        }, 2000);
    });

    // Initial code output
    updateCodeOutput();
}

window.addEventListener('load', setupIntroPanelControls);

/* =========================================
   INICIALIZACIÓN DEL MODELO 3D TELLUS
   ========================================= */
function initializeTellusModel() {
    // Crear instancia del visor del modelo 3D
    const tellusViewer = new window.TellusModelViewer('#tellus-model-container');

    // Escuchar el movimiento del ratón
    window.addEventListener('mousemove', (event) => {
        const xNormalizado = (event.clientX / window.innerWidth) * 2 - 1;
        const yNormalizado = -(event.clientY / window.innerHeight) * 2 + 1;

        tellusViewer.mouseX = xNormalizado;
        tellusViewer.mouseY = yNormalizado;
    });

    // Crear animación de scroll usando GSAP ScrollTrigger
    const proxyScroll = { progreso: 0 };

    gsap.timeline({
        scrollTrigger: {
            trigger: ".third-section",  // Inicia en la tercera sección
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
                proxyScroll.progreso = self.progress;
                tellusViewer.updateScroll(proxyScroll.progreso);
            }
        }
    });
}

// Paneles de control removidos (Ver CONTROL_PANELS_GUIDE.md para documentación)

/* =========================================
   INICIALIZACIÓN REMOVIDA
   ========================================= */
function initializeTellusControlPanel_REMOVED() {
    const panel = document.getElementById('tellus-controls-panel');
    const toggleBtn = document.getElementById('toggle-controls');
    const resetBtn = document.getElementById('reset-controls');
    const copyBtn = document.getElementById('copy-config');
    const controlsContent = document.querySelector('.controls-content');

    // Valores por defecto
    const defaults = {
        t_x: 0,
        t_y: 0,
        t_z: 0,
        t_scale: 150,
        t_rotX: 0.3,
        t_rotY: 0.5,
        t_opacity: 1,
        t_mouseFollow: 1.0,
        t_ambientIntensity: 1.2,
        t_directionalIntensity: 1.0,
        t_fillIntensity: 0.5,
        t_pointIntensity: 0.8
    };

    // Mapeo de parámetros
    const sliderParams = [
        't_x', 't_y', 't_z', 't_scale', 't_rotX', 't_rotY',
        't_opacity', 't_mouseFollow', 't_ambientIntensity', 't_directionalIntensity'
    ];

    // Conectar sliders con tellusProxy
    sliderParams.forEach(param => {
        const slider = document.getElementById(`${param}-slider`);
        const display = document.getElementById(`${param}-display`);

        if (slider && display) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                window.tellusProxy[param] = value;
                display.textContent = value.toFixed(2);
            });

            // Inicializar display con valor actual del proxy
            const currentValue = window.tellusProxy[param] !== undefined
                ? window.tellusProxy[param]
                : defaults[param];
            slider.value = currentValue;
            display.textContent = currentValue.toFixed(2);
        }
    });

    // Toggle panel visibility
    toggleBtn.addEventListener('click', () => {
        controlsContent.classList.toggle('hidden');
        toggleBtn.textContent = controlsContent.classList.contains('hidden') ? '+' : '−';
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        Object.keys(defaults).forEach(param => {
            window.tellusProxy[param] = defaults[param];
            const slider = document.getElementById(`${param}-slider`);
            const display = document.getElementById(`${param}-display`);
            if (slider) slider.value = defaults[param];
            if (display) display.textContent = defaults[param].toFixed(2);
        });
    });

    // Copy config button
    copyBtn.addEventListener('click', () => {
        const config = `window.tellusProxy = {
    t_x: ${window.tellusProxy.t_x.toFixed(2)},
    t_y: ${window.tellusProxy.t_y.toFixed(2)},
    t_z: ${window.tellusProxy.t_z.toFixed(2)},
    t_scale: ${window.tellusProxy.t_scale.toFixed(2)},
    t_rotX: ${window.tellusProxy.t_rotX.toFixed(2)},
    t_rotY: ${window.tellusProxy.t_rotY.toFixed(2)},
    t_opacity: ${window.tellusProxy.t_opacity.toFixed(2)},
    t_mouseFollow: ${window.tellusProxy.t_mouseFollow.toFixed(2)},
    t_ambientIntensity: ${window.tellusProxy.t_ambientIntensity.toFixed(2)},
    t_directionalIntensity: ${window.tellusProxy.t_directionalIntensity.toFixed(2)},
    t_fillIntensity: ${window.tellusProxy.t_fillIntensity.toFixed(2)},
    t_pointIntensity: ${window.tellusProxy.t_pointIntensity.toFixed(2)}
};`;

        navigator.clipboard.writeText(config).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copiado';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });
}

/* =========================================
   PANEL DE CONTROLES PARA PÁJAROS DE INTRO
   ========================================= */
function initializeIntroBirdsControlPanel() {
    const panel = document.getElementById('intro-birds-controls-panel');
    const toggleBtn = document.getElementById('toggle-intro-controls');
    const resetBtn = document.getElementById('reset-intro-controls');
    const copyBtn = document.getElementById('copy-intro-config');
    const controlsContent = document.querySelector('.intro-birds-content');

    // Valores por defecto (copiar de introBirdConfig)
    const defaults = {
        b1_x_init: 0,
        b1_y_init: 0,
        b1_x_final: 0,
        b1_y_final: 0,
        b1_scale_final: 0.85,
        b1_rotX: 0,
        b1_rotY: 0,
        b1_rotZ: 0,
        b1_rotX_final: 0,
        b1_rotY_final: 0,
        b1_rotZ_final: 0,

        b2_x_init: -500,
        b2_y_init: 0,
        b2_x_final: -180,
        b2_y_final: 120,
        b2_scale_final: 0.55,
        b2_rotX: 0,
        b2_rotY: 0,
        b2_rotZ: 0,
        b2_rotX_final: 0,
        b2_rotY_final: 0,
        b2_rotZ_final: 0,

        b3_x_init: 0,
        b3_y_init: 0,
        b3_x_final: 180,
        b3_y_final: 120,
        b3_scale_final: 0.65,
        b3_rotX: 0,
        b3_rotY: 0,
        b3_rotZ: 0,
        b3_rotX_final: 0,
        b3_rotY_final: 0,
        b3_rotZ_final: 0,

        timing_duration: 3.5,
        timing_b1_start: 0,
        timing_b2_start: 0.4,
        timing_b3_start: 0.8
    };

    // Mapeo de parámetros
    const sliderParams = Object.keys(defaults);

    // Conectar sliders con introBirdConfig
    sliderParams.forEach(param => {
        const slider = document.getElementById(`${param}-slider`);
        const display = document.getElementById(`${param}-display`);

        if (slider && display) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                display.textContent = value.toFixed(2);

                // Actualizar introBirdConfig y birdProxy
                if (param.includes('_init')) {
                    window.introBirdConfig.initial[param] = value;
                    // También actualizar birdProxy para cambios en tiempo real
                    window.birdProxy[param] = value;
                } else if (param.includes('_final') && !param.includes('_rot')) {
                    const birdNum = param.match(/b\d/)[0];
                    const axis = param.includes('_x') ? 'x' : param.includes('_y') ? 'y' : 'scale';
                    window.introBirdConfig.final[birdNum][axis] = value;
                } else if (param.includes('_final') && param.includes('_rot')) {
                    // Rotaciones finales: b1_rotX_final → final.b1.rotX
                    const birdNum = param.match(/b\d/)[0];
                    const axis = param.includes('_rotX') ? 'rotX' : param.includes('_rotY') ? 'rotY' : 'rotZ';
                    window.introBirdConfig.final[birdNum][axis] = value;
                } else if (param.includes('_rot')) {
                    // Rotaciones: b1_rotX → window.birdProxy.b1_overrideRotX
                    const overrideKey = param.replace('_rot', '_overrideRot');
                    window.birdProxy[overrideKey] = value;
                    window.introBirdConfig.initial[overrideKey] = value;
                } else if (param.includes('timing_')) {
                    const timingKey = param.replace('timing_', '');
                    window.introBirdConfig.timings[timingKey] = value;
                }

                // Actualizar birdProxy para cambios en tiempo real
                updateBirdProxyFromIntroConfig();
            });

            // Inicializar display
            const currentValue = defaults[param];
            slider.value = currentValue;
            display.textContent = currentValue.toFixed(2);
        }
    });

    // Toggle panel visibility
    toggleBtn.addEventListener('click', () => {
        controlsContent.classList.toggle('hidden');
        toggleBtn.textContent = controlsContent.classList.contains('hidden') ? '+' : '−';
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        sliderParams.forEach(param => {
            const slider = document.getElementById(`${param}-slider`);
            const display = document.getElementById(`${param}-display`);
            const value = defaults[param];
            if (slider) slider.value = value;
            if (display) display.textContent = value.toFixed(2);
        });
        // Reconstruir introBirdConfig desde defaults
        window.introBirdConfig.initial.b1_x = defaults.b1_x_init;
        window.introBirdConfig.initial.b1_y = defaults.b1_y_init;
        window.introBirdConfig.initial.b2_x = defaults.b2_x_init;
        window.introBirdConfig.initial.b2_y = defaults.b2_y_init;
        window.introBirdConfig.initial.b3_x = defaults.b3_x_init;
        window.introBirdConfig.initial.b3_y = defaults.b3_y_init;

        window.introBirdConfig.final.b1.x = defaults.b1_x_final;
        window.introBirdConfig.final.b1.y = defaults.b1_y_final;
        window.introBirdConfig.final.b1.scale = defaults.b1_scale_final;
        window.introBirdConfig.final.b1.rotX = defaults.b1_rotX_final;
        window.introBirdConfig.final.b1.rotY = defaults.b1_rotY_final;
        window.introBirdConfig.final.b1.rotZ = defaults.b1_rotZ_final;

        window.introBirdConfig.final.b2.x = defaults.b2_x_final;
        window.introBirdConfig.final.b2.y = defaults.b2_y_final;
        window.introBirdConfig.final.b2.scale = defaults.b2_scale_final;
        window.introBirdConfig.final.b2.rotX = defaults.b2_rotX_final;
        window.introBirdConfig.final.b2.rotY = defaults.b2_rotY_final;
        window.introBirdConfig.final.b2.rotZ = defaults.b2_rotZ_final;

        window.introBirdConfig.final.b3.x = defaults.b3_x_final;
        window.introBirdConfig.final.b3.y = defaults.b3_y_final;
        window.introBirdConfig.final.b3.scale = defaults.b3_scale_final;
        window.introBirdConfig.final.b3.rotX = defaults.b3_rotX_final;
        window.introBirdConfig.final.b3.rotY = defaults.b3_rotY_final;
        window.introBirdConfig.final.b3.rotZ = defaults.b3_rotZ_final;

        window.introBirdConfig.timings.duration = defaults.timing_duration;
        window.introBirdConfig.timings.b1_start = defaults.timing_b1_start;
        window.introBirdConfig.timings.b2_start = defaults.timing_b2_start;
        window.introBirdConfig.timings.b3_start = defaults.timing_b3_start;

        // Resetear rotaciones en birdProxy
        window.birdProxy.b1_overrideRotX = defaults.b1_rotX;
        window.birdProxy.b1_overrideRotY = defaults.b1_rotY;
        window.birdProxy.b1_overrideRotZ = defaults.b1_rotZ;
        window.birdProxy.b2_overrideRotX = defaults.b2_rotX;
        window.birdProxy.b2_overrideRotY = defaults.b2_rotY;
        window.birdProxy.b2_overrideRotZ = defaults.b2_rotZ;
        window.birdProxy.b3_overrideRotX = defaults.b3_rotX;
        window.birdProxy.b3_overrideRotY = defaults.b3_rotY;
        window.birdProxy.b3_overrideRotZ = defaults.b3_rotZ;

        updateBirdProxyFromIntroConfig();
    });

    // Copy config button
    copyBtn.addEventListener('click', () => {
        const cfg = window.introBirdConfig;
        const code = `window.introBirdConfig = {
    initial: {
        b1_x: ${cfg.initial.b1_x.toFixed(2)},
        b1_y: ${cfg.initial.b1_y.toFixed(2)},
        b1_z: ${cfg.initial.b1_z.toFixed(2)},
        b1_scale: ${cfg.initial.b1_scale.toFixed(2)},
        b1_overrideRotX: ${cfg.initial.b1_overrideRotX.toFixed(2)},
        b1_overrideRotY: ${cfg.initial.b1_overrideRotY.toFixed(2)},
        b1_overrideRotZ: ${cfg.initial.b1_overrideRotZ.toFixed(2)},

        b2_x: ${cfg.initial.b2_x.toFixed(2)},
        b2_y: ${cfg.initial.b2_y.toFixed(2)},
        b2_z: ${cfg.initial.b2_z.toFixed(2)},
        b2_scale: ${cfg.initial.b2_scale.toFixed(2)},
        b2_overrideRotX: ${cfg.initial.b2_overrideRotX.toFixed(2)},
        b2_overrideRotY: ${cfg.initial.b2_overrideRotY.toFixed(2)},
        b2_overrideRotZ: ${cfg.initial.b2_overrideRotZ.toFixed(2)},

        b3_x: ${cfg.initial.b3_x.toFixed(2)},
        b3_y: ${cfg.initial.b3_y.toFixed(2)},
        b3_z: ${cfg.initial.b3_z.toFixed(2)},
        b3_scale: ${cfg.initial.b3_scale.toFixed(2)},
        b3_overrideRotX: ${cfg.initial.b3_overrideRotX.toFixed(2)},
        b3_overrideRotY: ${cfg.initial.b3_overrideRotY.toFixed(2)},
        b3_overrideRotZ: ${cfg.initial.b3_overrideRotZ.toFixed(2)},

        decompose: ${cfg.initial.decompose.toFixed(2)},
        rotationY: ${cfg.initial.rotationY !== undefined ? cfg.initial.rotationY.toFixed(2) : '0.00'},
        rotationX: ${cfg.initial.rotationX !== undefined ? cfg.initial.rotationX.toFixed(2) : '0.00'},
        rotationZ: ${cfg.initial.rotationZ !== undefined ? cfg.initial.rotationZ.toFixed(2) : '0.00'}
    },

    final: {
        b1: { x: ${cfg.final.b1.x.toFixed(2)}, y: ${cfg.final.b1.y.toFixed(2)}, z: ${cfg.final.b1.z.toFixed(2)}, scale: ${cfg.final.b1.scale.toFixed(2)} },
        b2: { x: ${cfg.final.b2.x.toFixed(2)}, y: ${cfg.final.b2.y.toFixed(2)}, z: ${cfg.final.b2.z.toFixed(2)}, scale: ${cfg.final.b2.scale.toFixed(2)} },
        b3: { x: ${cfg.final.b3.x.toFixed(2)}, y: ${cfg.final.b3.y.toFixed(2)}, z: ${cfg.final.b3.z.toFixed(2)}, scale: ${cfg.final.b3.scale.toFixed(2)} }
    },

    timings: {
        b1_start: ${cfg.timings.b1_start.toFixed(2)},
        b2_start: ${cfg.timings.b2_start.toFixed(2)},
        b3_start: ${cfg.timings.b3_start.toFixed(2)},
        duration: ${cfg.timings.duration.toFixed(2)}
    }
};`;

        navigator.clipboard.writeText(code).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copiado';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });
}

// Helper para actualizar birdProxy desde introBirdConfig (en tiempo real)
function updateBirdProxyFromIntroConfig() {
    const cfg = window.introBirdConfig;
    Object.assign(window.birdProxy, cfg.initial);
    // También actualizar los valores finales en birdProxy si es necesario
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeTellusModel();
    // Paneles de control removidos - Ver CONTROL_PANELS_GUIDE.md
});
