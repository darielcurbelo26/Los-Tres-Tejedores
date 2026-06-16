// THREE is loaded globally from CDN

class BirdFlockScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 5000);
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();

        this.birds = [];
        this.init();
    }

    init() {
        // 1. & 2. Geometría de Partículas y Multiplicación de Densidad
        const baseGeometry = this.getMockBirdGeometry(); // Reemplaza esto con tu modelo real
        const denseGeometry = this.createDenseGeometry(baseGeometry, 3, 0.02);

        // 3. & 4. Material y Shaders
        const material = this.createBirdMaterial();

        // 5. Composición de la Escena (La Bandada)
        const birdData = [
            { z: 0, rotY: 0, density: 0.6, timeOffset: 0, isCenter: true },
            { z: -5, rotY: Math.PI / 4, density: 0.15, timeOffset: 1.5, isCenter: false },
            { z: -4, rotY: -Math.PI / 4, density: 0.15, timeOffset: 3.2, isCenter: false }
        ];

        birdData.forEach(data => {
            const matClone = material.clone();
            matClone.uniforms.uDensity.value = data.density;
            matClone.uniforms.uTimeOffset.value = data.timeOffset;

            const points = new THREE.Points(denseGeometry, matClone);
            points.position.z = data.z;
            points.rotation.y = data.rotY;
            
            this.scene.add(points);
            this.birds.push({
                mesh: points,
                baseRotY: data.rotY,
                isCenter: data.isCenter
            });
        });

        this.addEventListeners();
        this.animate();
    }

    createDenseGeometry(baseGeometry, multiplier, noiseOffset) {
        const basePos = baseGeometry.attributes.position.array;
        const baseColor = baseGeometry.attributes.color.array; // RGB Masks
        
        const newPos = [];
        const newColor = [];

        for (let i = 0; i < basePos.length; i += 3) {
            const x = basePos[i];
            const y = basePos[i + 1];
            const z = basePos[i + 2];

            const r = baseColor[i];
            const g = baseColor[i + 1];
            const b = baseColor[i + 2];

            for (let m = 0; m < multiplier; m++) {
                newPos.push(
                    x + (Math.random() - 0.5) * noiseOffset,
                    y + (Math.random() - 0.5) * noiseOffset,
                    z + (Math.random() - 0.5) * noiseOffset
                );
                newColor.push(r, g, b);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColor, 3));
        return geometry;
    }

    createBirdMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uTimeOffset: { value: 0 },
                uDensity: { value: 1.0 },
                uDecompose: { value: 0.0 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uTimeOffset;
                uniform float uDecompose;
                
                attribute vec3 color; // Máscaras RGB
                varying vec3 vColor;
                
                // Función simple de ruido (pseudoaleatorio)
                float random(vec3 st) {
                    return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453123);
                }

                void main() {
                    vColor = color;
                    vec3 pos = position;
                    float t = uTime + uTimeOffset;
                    
                    // 1. Ruido de Estabilización (Drone Noise)
                    float droneNoiseX = sin(t * 2.0 + pos.y * 10.0) * 0.05;
                    float droneNoiseY = cos(t * 2.5 + pos.x * 10.0) * 0.05;
                    float droneNoiseZ = sin(t * 1.8 + pos.z * 10.0) * 0.05;
                    
                    // 2. Aleteo (Máscara Roja - Alas)
                    // Cuanto más rojo (lejos del centro), más aleteo
                    float flapDist = abs(pos.x); 
                    float flap = sin(t * 8.0) * flapDist * color.r * 1.5;
                    
                    // 3. Coleo (Máscara Verde - Cola)
                    float tail = sin(t * 5.0 - pos.z * 2.0) * color.g * 0.5;
                    
                    // 4. Respiración (Máscara Azul - Pecho)
                    float breath = sin(t * 3.0) * color.b * 0.1;
                    
                    // Aplicar movimientos
                    pos.x += droneNoiseX;
                    pos.y += droneNoiseY + flap + breath;
                    pos.z += droneNoiseZ + tail;
                    
                    // 5. Efecto de Descomposición
                    vec3 randDir = vec3(
                        random(position) - 0.5,
                        random(position + vec3(1.0)) - 0.5,
                        random(position + vec3(2.0)) - 0.5
                    ) * 2.0;
                    
                    pos += randDir * uDecompose;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 1.2 * (10.0 / -mvPosition.z); // Tamaño por perspectiva
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float uDensity;
                varying vec3 vColor;
                
                // Función para descartar puntos aleatoriamente basada en gl_FragCoord
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                void main() {
                    // Descarte por densidad
                    if(random(gl_FragCoord.xy) > uDensity) discard;
                    
                    // Círculo suave
                    float dist = distance(gl_PointCoord, vec2(0.5));
                    float alpha = smoothstep(0.5, 0.08, dist);
                    
                    gl_FragColor = vec4(1.0, 0.843, 0.663, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const elapsedTime = this.clock.getElapsedTime();
        
        // Lerp del ratón para movimiento fluido
        this.mouse.lerp(this.targetMouse, 0.05);

        this.birds.forEach(bird => {
            const material = bird.mesh.material;
            material.uniforms.uTime.value = elapsedTime;
            
            // Parallax y Rotación Boomerang
            const boomerang = Math.sin(elapsedTime * 0.5 + material.uniforms.uTimeOffset.value) * 0.1;
            
            // Rotación base + boomerang + mirar al ratón (suavemente)
            bird.mesh.rotation.y = bird.baseRotY + boomerang + (this.mouse.x * 0.3);
            bird.mesh.rotation.x = -this.mouse.y * 0.2;
        });

        this.renderer.render(this.scene, this.camera);
    }

    // --- MOCK GEOMETRY PARA PRUEBAS ---
    // Simula una nube de puntos con zonas RGB para alas, cola y pecho
    getMockBirdGeometry() {
        const geometry = new THREE.BufferGeometry();
        const count = 1000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for(let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 4;
            const y = (Math.random() - 0.5) * 1;
            const z = (Math.random() - 0.5) * 2;
            
            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;
            
            // Asignación de máscaras burda para el mock
            if(Math.abs(x) > 1.0) colors[i*3] = 1.0; // Alas (Rojo)
            else if(z < -0.5) colors[i*3+1] = 1.0; // Cola (Verde)
            else colors[i*3+2] = 1.0; // Pecho (Azul)
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geometry;
    }
}

// Expose class globally for use in script.js
window.BirdViewer = BirdFlockScene;
