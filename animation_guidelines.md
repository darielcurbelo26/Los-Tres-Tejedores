# Plan de Implementación de Animaciones en Timeline

El objetivo es implementar un sistema de animaciones complejas donde toda la web funcione como una sola pantalla, controlada por un "timeline" largo (time-lapse), ofreciendo una experiencia fluida e inmersiva.

## Guía Principal y Reglas de Desarrollo

Para garantizar el éxito y rendimiento de esta estructura, debemos cumplir las siguientes reglas:

### 1. Arquitectura de Pantalla Única (Single-Screen Timeline)
- **Bloqueo del Scroll Tradicional**: El desplazamiento del usuario (scroll) no moverá la página físicamente hacia abajo. En su lugar, el scroll avanzará o retrocederá un timeline virtual.
- **Contenedor Fijo**: El contenedor principal estará fijado a la pantalla (`position: fixed` o `sticky`), y el progreso del scroll dictará qué elementos entran o salen.

### 2. Rendimiento (Performance) y Animaciones
- **Propiedades Seguras**: **Solo** animaremos las propiedades `transform` (translaciones, escalas, rotaciones) y `opacity`. Animar propiedades como `top`, `left`, `width`, `height` o `padding` provoca *reflows* que destruyen el rendimiento en animaciones vinculadas al scroll.
- **Aceleración por Hardware**: Usaremos `translate3d` o `will-change` en los elementos clave para forzar la aceleración por GPU.
- **Carga Diferida y Ocultación**: Los elementos que no estén activos en el porcentaje actual del timeline deben estar ocultos (o tener opacidad cero y pointer-events: none) para no recargar el renderizado.

### 3. Control del Estado
- **Centralización del Tiempo**: Todas las transiciones de las secciones deben depender de una única variable (ej. `scrollProgress` de 0 a 1).
- **Independencia**: Las micro-animaciones (como los hover en botones) seguirán funcionando de forma independiente al timeline.

## Open Questions

> [!WARNING]
> **Elección de Tecnología**: Para este tipo de experiencias con timelines largos, utilizar una librería como **GSAP (junto con ScrollTrigger)** es altamente recomendable y es el estándar de la industria. ¿Estás de acuerdo en utilizar GSAP, o prefieres que implementemos toda la lógica del timeline desde cero con Vanilla JavaScript?

> [!IMPORTANT]
> **Definición del Storyboard**: ¿Tienes claro qué secciones y elementos exactos van a aparecer y desaparecer a medida que avancemos por el timeline? Si ya tienes un flujo mental de los eventos de la animación, sería genial detallarlo.
