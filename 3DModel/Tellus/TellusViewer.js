window.TellusViewer = class TellusViewer {
    constructor(canvasContainerId) {
        this.container = document.querySelector(canvasContainerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.material = null;
        this.particleSystem = null;
        this.clock = new THREE.Clock();

        // Load settings from birdData.js or use defaults (Ondulaciones reducidas)
        this.settings = {
            globalWave: 0.3,
            wingsAnim: 1.0,
            wingsAmp: 6.0,
            wingsHinge: 30.0,
            wingsWave: 0.015,
            wingsDir: new THREE.Vector3(1.0, 0.0, 0.0),
            
            tailAnim: 1.0,
            tailAmp: 4.0,
            tailHinge: 30.0,
            tailWave: 0.02,
            tailDir: new THREE.Vector3(1.0, 0.0, 0.0),
            
            chestAnim: 1.0,
            chestAmp: 2.0,
            chestDir: new THREE.Vector3(1.0, 0.0, 0.0)
        };

        if (window.birdSettings) {
            const bs = window.birdSettings;
            if (bs.globalWave !== undefined) this.settings.globalWave = bs.globalWave;
            if (bs.wingsAnim !== undefined) this.settings.wingsAnim = bs.wingsAnim;
            if (bs.wingsAmp !== undefined) this.settings.wingsAmp = bs.wingsAmp;
            if (bs.wingsHinge !== undefined) this.settings.wingsHinge = bs.wingsHinge;
            if (bs.wingsWave !== undefined) this.settings.wingsWave = bs.wingsWave;
            if (bs.wingsDir !== undefined) this.settings.wingsDir.set(bs.wingsDir.x, bs.wingsDir.y, bs.wingsDir.z);

            if (bs.tailAnim !== undefined) this.settings.tailAnim = bs.tailAnim;
            if (bs.tailAmp !== undefined) this.settings.tailAmp = bs.tailAmp;
            if (bs.tailHinge !== undefined) this.settings.tailHinge = bs.tailHinge;
            if (bs.tailWave !== undefined) this.settings.tailWave = bs.tailWave;
            if (bs.tailDir !== undefined) this.settings.tailDir.set(bs.tailDir.x, bs.tailDir.y, bs.tailDir.z);

            if (bs.chestAnim !== undefined) this.settings.chestAnim = bs.chestAnim;
            if (bs.chestAmp !== undefined) this.settings.chestAmp = bs.chestAmp;
            if (bs.chestDir !== undefined) this.settings.chestDir.set(bs.chestDir.x, bs.chestDir.y, bs.chestDir.z);
        }

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. Scene setup (black background)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // 2. Camera setup
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        
        // --- CONFIGURACIÓN DE POSICIÓN, TAMAÑO Y COLOR ---
        // Aquí puedes modificar fácilmente cómo se ve el modelo de Tellus
        this.modelBaseScale = 1.0; // Tamaño base del modelo
        this.camera.position.set(0, 0, 210); // Profundidad (posición Z)
        
        // El color se ha eliminado del degradado y se puede cambiar directamente en el shader (línea ~320)
        // ---------------------------------------------------

        // 3. Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI; 
        this.controls.minDistance = 50;
        this.controls.maxDistance = 500;

        // 5. Build particle system
        this.buildParticleSystem();

        // 6. Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Métodos públicos para actualizar desde el script principal (sin iframe)
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        
        this.onMouseMove = (x, y) => {
            this.mouseX = x;
            this.mouseY = y;
        };
        
        this.onScroll = (progress) => {
            if (this.material) {
                this.material.uniforms.uScrollProgress.value = progress;
            }
        };

        this.animate();
    }

    buildParticleSystem() {
        if (!window.tellusPositions || !window.tellusMasks) {
            console.error("Error: tellusPositions or tellusMasks not loaded in window.");
            return;
        }

        const originalPositions = window.tellusPositions;
        const originalMasks = window.tellusMasks;
        
        // Multiplicar las partículas para muchísima más densidad y fidelidad
        const multiplier = 12;
        const newPos = new Float32Array(originalPositions.length * multiplier);
        const newMask = new Float32Array(originalMasks.length * multiplier);
        
        for (let i = 0; i < originalPositions.length / 3; i++) {
            for (let m = 0; m < multiplier; m++) {
                const idx = (i * multiplier + m) * 3;
                const origIdx = i * 3;
                
                // Micro-ruido ultra-mínimo (0.02) para dar una gran concentración sin deformar
                const offset = m === 0 ? 0 : 0.02; 
                newPos[idx] = originalPositions[origIdx] + (Math.random() - 0.5) * offset;
                newPos[idx+1] = originalPositions[origIdx+1] + (Math.random() - 0.5) * offset;
                newPos[idx+2] = originalPositions[origIdx+2] + (Math.random() - 0.5) * offset;
                
                newMask[idx] = originalMasks[origIdx];
                newMask[idx+1] = originalMasks[origIdx+1];
                newMask[idx+2] = originalMasks[origIdx+2];
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3));
        geometry.setAttribute('aMask', new THREE.Float32BufferAttribute(newMask, 3));

        // Optimized shader material for pure white glowing particles (no color buffers needed)
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uGlobalWave: { value: this.settings.globalWave },
                uWingsAnim: { value: this.settings.wingsAnim },
                uWingsAmp: { value: this.settings.wingsAmp },
                uWingsHinge: { value: this.settings.wingsHinge },
                uWingsWave: { value: this.settings.wingsWave },
                uWingsDir: { value: this.settings.wingsDir },
                
                uTailAnim: { value: this.settings.tailAnim },
                uTailAmp: { value: this.settings.tailAmp },
                uTailHinge: { value: this.settings.tailHinge },
                uTailWave: { value: this.settings.tailWave },
                uTailDir: { value: this.settings.tailDir },
                
                uChestAnim: { value: this.settings.chestAnim },
                uChestAmp: { value: this.settings.chestAmp },
                uChestDir: { value: this.settings.chestDir },
                
                uScrollProgress: { value: 0.0 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uGlobalWave;
                
                uniform float uWingsAnim;
                uniform float uWingsAmp;
                uniform float uWingsHinge;
                uniform float uWingsWave;
                uniform vec3 uWingsDir;
                
                uniform float uTailAnim;
                uniform float uTailAmp;
                uniform float uTailHinge;
                uniform float uTailWave;
                uniform vec3 uTailDir;
                
                uniform float uChestAnim;
                uniform float uChestAmp;
                uniform vec3 uChestDir;
                
                uniform float uScrollProgress;

                attribute vec3 aMask;
                
                varying float vDepth;
                varying float vPosY;
                varying float vRand;

                void main() {
                    vec3 pos = position;
                    vec3 animatedPos = pos;

                    // Drone ambient micro-noise (hovering stabilization)
                    float noiseFreq = 3.5;
                    float noiseAmp = 0.6;
                    float droneNoiseX = sin(uTime * noiseFreq + pos.x * 0.1) * cos(uTime * (noiseFreq * 0.8) + pos.y * 0.12) * noiseAmp;
                    float droneNoiseY = cos(uTime * (noiseFreq * 0.9) + pos.y * 0.15) * sin(uTime * (noiseFreq * 1.1) + pos.z * 0.08) * noiseAmp;
                    float droneNoiseZ = sin(uTime * (noiseFreq * 1.2) + pos.z * 0.09) * cos(uTime * (noiseFreq * 0.75) + pos.x * 0.11) * noiseAmp;
                    animatedPos += vec3(droneNoiseX, droneNoiseY, droneNoiseZ);

                    // Wings Flapping (Red Channel)
                    float distToSpine = length(pos.xz);
                    float distanceFactor = max(0.0, distToSpine - uWingsHinge);
                    float hingeScale = distanceFactor * 0.015;
                    float wingPhase = uTime * 8.0 - distToSpine * uWingsWave * uGlobalWave;
                    float wingCycle = sin(wingPhase) * uWingsAmp * uWingsAnim * hingeScale;

                    // Tail Wiggling (Green Channel)
                    float tailDistanceFactor = max(0.0, -pos.y - uTailHinge);
                    float tailHingeScale = tailDistanceFactor * 0.015;
                    float tailPhase = uTime * 5.0 - (-pos.y) * uTailWave * uGlobalWave;
                    float tailCycle = sin(tailPhase) * uTailAmp * uTailAnim * tailHingeScale;

                    // Chest Breathing (Blue Channel)
                    float chestPhase = uTime * 2.2 - length(pos) * 0.002 * uGlobalWave;
                    float chestCycle = sin(chestPhase) * uChestAmp * uChestAnim;

                    // Hierarchical skinning blending
                    float wingInherit = max(0.0, 1.0 - hingeScale);
                    float tailInherit = max(0.0, 1.0 - tailHingeScale);

                    animatedPos += chestCycle * uChestDir * (aMask.b + aMask.r * wingInherit + aMask.g * tailInherit);
                    animatedPos += wingCycle * uWingsDir * aMask.r;
                    animatedPos += tailCycle * uTailDir * aMask.g;

                    // Add random scatter for very few particles (0.1%) to make it extremely subtle
                    float rand = fract(sin(dot(pos.xy, vec2(12.9898,78.233))) * 43758.5453);
                    float isScattered = step(0.999, rand); // 1.0 for 0.1% of particles
                    
                    // Posición base alrededor del modelo
                    vec3 baseOffset = vec3(
                        sin(rand * 100.0) * 120.0,
                        cos(rand * 50.0) * 120.0,
                        sin(rand * 200.0) * 120.0
                    );
                    
                    // Vibración reactiva rápida y pequeña
                    vec3 vibration = vec3(
                        sin(uTime * 15.0 + rand * 10.0) * 3.0,
                        cos(uTime * 18.0 + rand * 20.0) * 3.0,
                        sin(uTime * 12.0 + rand * 30.0) * 3.0
                    );

                    animatedPos += (baseOffset + vibration) * isScattered;

                    // Descomposición suave vinculada al scroll (film grain expandido)
                    float randAll = fract(sin(dot(pos.xy, vec2(12.9898,78.233))) * 43758.5453);
                    vRand = randAll; // pasar al fragment shader
                    
                    // Aceleración de menos a más (suave al inicio, rápido al final) con un pequeñísimo retardo inicial
                    float scrollProg = clamp((uScrollProgress - 0.05) / 0.95, 0.0, 1.0);
                    float easeScroll = pow(scrollProg, 3.5); // Curva exponencial
                    
                    // La vibración base del pájaro disminuye a 0 con el scroll para que sea muy sutil y suave
                    vibration *= (1.0 - easeScroll);
                    
                    // Dirección de dispersión pura (sin uTime, estática y elegante)
                    vec3 scatterDir = normalize(vec3(
                        sin(randAll * 150.0),
                        cos(randAll * 80.0),
                        sin(randAll * 250.0)
                    )); 
                    
                    // Pequeñísimo ruido (jitter) para dar textura de grain, solo activo durante el scroll
                    vec3 grainJitter = vec3(
                        sin(uTime * 30.0 + randAll * 10.0),
                        cos(uTime * 35.0 + randAll * 12.0),
                        sin(uTime * 40.0 + randAll * 15.0)
                    ) * 2.0 * easeScroll; 
                    
                    // Dispersión sutil (se abren suavemente sin saltar como nieve)
                    animatedPos += scatterDir * easeScroll * 250.0 + grainJitter;

                    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Pasar profundidad y altura del modelo al fragment shader para el desvanecimiento
                    vDepth = -mvPosition.z;
                    vPosY = pos.y;
                    
                    // Las partículas se hacen progresivamente más finas (film grain)
                    float pSize = 100.0;
                    if (isScattered > 0.5) pSize = 50.0;
                    pSize *= mix(1.0, 0.25, easeScroll);
                    gl_PointSize = (2.0 / -mvPosition.z) * pSize;
                }
            `,
            fragmentShader: `
                uniform float uScrollProgress;
                varying float vDepth;
                varying float vPosY;
                varying float vRand;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float intensity = smoothstep(0.5, 0.08, dist);
                    
                    float scrollProg = clamp((uScrollProgress - 0.05) / 0.95, 0.0, 1.0);
                    float easeScroll = pow(scrollProg, 3.5);
                    
                    float depthFade = smoothstep(300.0, 180.0, vDepth);
                    float grainFade = smoothstep(easeScroll - 0.2, easeScroll + 0.1, vRand);
                    
                    // Degradado vertical muy sutil en los extremos reduciendo cantidad de partículas
                    float vertFade = smoothstep(120.0, 50.0, abs(vPosY)); 
                    if (vRand > vertFade) discard;
                    
                    float alphaFade = intensity * 0.9 * depthFade * grainFade * pow(1.0 - easeScroll, 2.0);
                    
                    // --- CONFIGURACIÓN DE COLOR DEL MODELO (Sin Degradado) ---
                    // Modifica los valores RGB (0.0 a 1.0) para cambiar el color del modelo
                    // Color actual: #dfcdb9 -> RGB 223, 205, 185
                    vec3 modelColor = vec3(0.874, 0.804, 0.725);
                    
                    gl_FragColor = vec4(modelColor, alphaFade);
                }
            `
        });

        this.particleSystem = new THREE.Points(geometry, this.material);
        this.particleSystem.position.set(0, 0, 0);
        this.particleSystem.rotation.set(0, -Math.PI / 2, 0); // Frontal
        this.particleSystem.scale.set(this.modelBaseScale, this.modelBaseScale, this.modelBaseScale);
        this.scene.add(this.particleSystem);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.particleSystem) {
            // Animación extremadamente sutil y suave siguiendo al ratón
            const maxRotX = Math.PI / 24; 
            const maxRotY = Math.PI / 24; 
            
            const targetRotX = this.mouseY * maxRotX;
            const targetRotY = this.mouseX * maxRotY;
            
            this.particleSystem.rotation.y += ((targetRotY - (Math.PI / 2)) - this.particleSystem.rotation.y) * 0.015;
            this.particleSystem.rotation.x += (targetRotX - this.particleSystem.rotation.x) * 0.015;
        }

        if (this.material) {
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.animate = () => {};
        window.removeEventListener('resize', this.onWindowResize);
        if (this.controls) {
            this.controls.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.particleSystem && this.particleSystem.geometry) {
            this.particleSystem.geometry.dispose();
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.container && this.renderer && this.renderer.domElement) {
            this.container.innerHTML = '';
        }
    }
}
