# Guía de Acción: Integración del Timeline de GSAP

Esta guía detalla el paso a paso para implementar el gran timeline de GSAP que unificará toda la web en una sola experiencia fluida, optimizando el rendimiento (montando elementos solo cuando estén cerca de salir en pantalla).

## Paso 1: Configuración General y Primera Sección
- [ ] Mantener la primera sección tal y como está actualmente.
- [ ] Preparar la lógica de ScrollTrigger para que los elementos del DOM se monten/desmonten o pasen de `display: none` a `block` solo cuando su momento esté cerca, evitando sobrecargar la web con capas invisibles.

## Paso 2: Segunda Sección (La Frase)
- [ ] Animar la entrada de las líneas de la frase línea por línea.
- [ ] Aplicar un ligero efecto de *blur* (desenfoque) al aparecer cada línea.

## Paso 3: Transición a la Tercera Sección (Arcos y Mapa)
- [ ] Iniciar la animación de "dibujado" (DrawSVG o `stroke-dashoffset`) de los SVG de los arcos de esta sección.
- [ ] Al avanzar un poco más en el scroll y mostrarse los teléfonos, iniciar el dibujado de los SVG de las letras de la tercera sección.

## Paso 4: Sección de los Teléfonos
- [ ] Hacer que los teléfonos entren a la pantalla desde la izquierda hacia la derecha.
- [ ] Al avanzar y salir de esta sección, los teléfonos deben irse animándose hacia arriba (por encima).

## Paso 5: Sección del Mapa y Entrada del Grid
- [ ] El mapa aparece y funciona de forma interactiva (parallax suave, ripples) tal como está ahora.
- [ ] Hacer que el mapa se quede fijo un poco más mientras entra la sección del Grid.
- [ ] **Animación del Grid:** El grid (6x6) entra utilizando el efecto de ola (stagger) por encima del mapa. 

## Paso 6: Sección "Crear" y Salida del Grid
- [ ] Colocar la sección "Crear" y sus palabras de fondo directamente detrás del grid.
- [ ] Ocultar el grid completamente (ola de desaparición).
- [ ] Una vez el grid desaparece, comenzar a dibujar (animar trazo) la palabra central "Crear".
- [ ] Empezar a dibujar los arcos por encima.

## Paso 7: Transición "Crear, Compartir, Conectar" (Tarjetas)
- [ ] Cuando la palabra "Crear" esté totalmente rellenada, intercambiar o transicionar su posición hacia la posición que ocupa la tarjeta "Crear" de la siguiente sección.
- [ ] Hacer que aparezcan, desde atrás de esa tarjeta "Crear" y hacia la izquierda, las otras dos tarjetas: "Compartir" y "Conectar".

## Paso 8: Entrada y Coreografía de los Pájaros (Sección Rol y Descargar)
- [ ] Asegurar que el modelo 3D de los pájaros se cargue cuando las tarjetas de la sección anterior (Crear, Compartir, Conectar) se estén separando.
- [ ] **Entrada:** Los pájaros inician fuera de las esquinas del viewport. El pájaro izquierdo entra apuntando al centro, el derecho apuntando al centro, y el pájaro del medio entra desde la parte de abajo.
- [ ] **Llegada:** Deben alcanzar sus posiciones y rotaciones definitivas justo cuando la sección "Rol" esté completamente visible en pantalla.
- [ ] **Crecimiento:** Una vez posicionado en el centro, el pájaro de en medio debe aumentar su tamaño (crecer) en un 5%.
- [ ] **Salida:** Permanecerán flotando hasta la sección "Descargar". Al salir de esta última sección, abandonarán la pantalla retrocediendo por las mismas esquinas por las que entraron.
