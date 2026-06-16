window.BirdViewer = class BirdViewer {
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
            globalWave: 1.0,
            wingsAnim: 1.0,
            wingsAmp: 15.0,
            wingsHinge: 30.0,
            wingsWave: 0.02,
            wingsDir: new THREE.Vector3(1.0, 0.0, 0.0),
            
            tailAnim: 1.0,
            tailAmp: 10.0,
            tailHinge: 30.0,
            tailWave: 0.03,
            tailDir: new THREE.Vector3(1.0, 0.0, 0.0),
            
            chestAnim: 1.0,
            chestAmp: 4.0,
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
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        // 1. Scene setup (transparent background)
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000);

        // 2. Camera setup
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
        // Restauramos la posición a Z=230 para recuperar el tamaño anterior
        this.camera.position.set(0, 0, 230);

        // 3. Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); // alpha: true para transparencia nativa
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); // Limitar a 1.25x en pantallas Retina
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.enableZoom = !window.isIntroActive;  // Desactivar zoom durante intro
        this.controls.minDistance = 50;
        this.controls.maxDistance = 500;

        // 5. Build particle system
        this.buildParticleSystem();

        // 6. Event listeners
        this._resizeHandler = this.onWindowResize.bind(this);
        window.addEventListener('resize', this._resizeHandler);
        
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
        if (!window.birdPositionsOpen) {
            console.error("Error: birdPositionsOpen not loaded in window.");
            return;
        }

        const originalPositions = window.birdPositionsOpen;
        const N = originalPositions.length / 3;
        
        let originalMasks;
        if (window.birdMasks && window.birdMasks.length === N * 3) {
            originalMasks = new Float32Array(window.birdMasks);
        } else {
            originalMasks = new Float32Array(N * 3);
            for (let i = 0; i < N; i++) {
                const x = originalPositions[i * 3];
                const y = originalPositions[i * 3 + 1];
                const z = originalPositions[i * 3 + 2];
                
                const distToSpine = Math.sqrt(x*x + z*z);
                let rMask = 0.0;
                if (distToSpine > 35.0) {
                    rMask = Math.min(1.0, (distToSpine - 35.0) / 15.0);
                }
                
                let gMask = 0.0;
                if (y < -15.0 && Math.abs(z) < 35.0) {
                    gMask = Math.min(1.0, (-15.0 - y) / 30.0) * (1.0 - rMask);
                }
                
                const isHead = (y > 35.0 && Math.abs(z) < 30.0);
                let bMask = 0.0;
                if (!isHead) {
                    bMask = 1.0 - rMask - gMask;
                }
                
                originalMasks[i * 3] = rMask;
                originalMasks[i * 3 + 1] = gMask;
                originalMasks[i * 3 + 2] = bMask;
            }
        }
        
        // Multiplicar las partículas
        const multiplier = 3; // Reducido drásticamente (de 12 a 3) para alivianar el rendimiento
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

        // Optimized shader material for pure glowing particles (no color buffers needed)
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcAlpha,
            blendDst: THREE.One,
            blendEquationAlpha: THREE.AddEquation,
            blendSrcAlpha: THREE.Zero, // IMPORTANTE: no escribir en el canal alpha del canvas para que el navegador haga AdditiveBlending correctamente
            blendDstAlpha: THREE.One,
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
                
                uScrollProgress: { value: 0.0 },
                uDecompose: { value: 0.0 },
                uDensity: { value: 1.0 }
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
                uniform float uDecompose;

                attribute vec3 aMask;
                
                varying float vDepth;
                varying float vPosY;
                varying float vRand;
                varying float vDecompose;

                void main() {
                    vec3 pos = position;
                    vRand = fract(sin(dot(pos.xy, vec2(12.9898,78.233))) * 43758.5453);
                    vDecompose = uDecompose;
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

                    // Descomposición de partículas
                    float hashX = fract(sin(dot(pos.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                    float hashY = fract(sin(dot(pos.yzx, vec3(93.989, 67.345, 12.093))) * 43758.5453);
                    float hashZ = fract(sin(dot(pos.zxy, vec3(54.432, 19.982, 84.143))) * 43758.5453);
                    vec3 scatterDir = normalize(vec3(hashX - 0.5, hashY - 0.5, hashZ - 0.5));
                    
                    // Expansión espacial + dispersión aleatoria
                    vec3 expandDir = normalize(pos);
                    animatedPos += expandDir * (uDecompose * 250.0) + scatterDir * (uDecompose * 150.0);

                    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // El usuario pidió todas del mismo tamaño y más pequeñas
                    gl_PointSize = 1.2;
                }
            `,
            fragmentShader: `
                uniform float uDensity;
                varying float vRand;
                varying float vDecompose;
                
                void main() {
                    if (vRand > uDensity) discard;
                    
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float intensity = smoothstep(0.5, 0.08, dist);
                    // Desvanecimiento suave y gradual de la opacidad durante la descomposición
                    float alpha = intensity * 0.95 * (1.0 - clamp(vDecompose * 0.9, 0.0, 1.0));
                    if (alpha < 0.005) discard;
                    
                    gl_FragColor = vec4(1.0, 0.843, 0.663, alpha);
                }
            `
        });

        this.birds = [];
        const createBird = (x, y, z, timeOffset, rotY, rotX, rotZ, scale, flapSpeed, flapAmp) => {
            const mat = this.material.clone();
            mat.uniforms.uTime = { value: timeOffset };
            mat.uniforms.uWingsAnim.value = flapSpeed;
            mat.uniforms.uWingsAmp.value = flapAmp;
            
            const bird = new THREE.Points(geometry, mat);
            // Empujar hacia atrás en el eje Z para simular tamaño por perspectiva en lugar de usar .scale
            const depthPush = (1.0 - scale) * 800; 
            bird.position.set(x, y, z - depthPush);
            bird.rotation.set(rotX, rotY, rotZ);
            bird.scale.set(1, 1, 1); // Forzamos a 1, el tamaño dependerá exclusivamente de Z
            bird.userData = { 
                baseRotY: rotY,
                baseRotX: rotX,
                baseRotZ: rotZ,
                baseWingsAmp: flapAmp,
                flapSpeed: flapSpeed,
                baseScale: scale,
                timeOffset: timeOffset,
                mat: mat 
            };
            this.scene.add(bird);
            return bird;
        };

        const baseRot = -Math.PI / 2;
        // Centro: b1 (Tamaño 0.85, rotaciones personalizadas, flap más rápido)
        this.birds.push(createBird(0, -300, 0, 0, baseRot - 0.15, 0.1, 0.05, 0.85, 1.1, 16.0)); 
        this.birds[0].userData.mat.uniforms.uDensity = { value: 0.6 };
        // Izquierda: b2 (Tamaño 0.55, rotaciones diferentes, flap más lento)
        this.birds.push(createBird(-300, 300, -50, 1.5, baseRot + Math.PI / 4, 0.25, -0.15, 0.55, 0.85, 13.0)); 
        this.birds[1].userData.mat.uniforms.uDensity = { value: 0.15 };
        // Derecha: b3 (Tamaño 0.65, rotaciones diferentes, flap más rápido)
        this.birds.push(createBird(300, 300, 50, 3.2, baseRot - Math.PI / 3, -0.1, 0.2, 0.65, 1.3, 18.0)); 
        this.birds[2].userData.mat.uniforms.uDensity = { value: 0.15 };
    }

    onWindowResize() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            // Desactivar zoom dinámicamente durante intro
            this.controls.enableZoom = !window.isIntroActive;
            this.controls.update();
        }
        
        if (this.birds && this.birds.length > 0) {
            const delta = this.clock.getDelta();
            const time = this.clock.getElapsedTime();
            
            // Accumulate flapping time based on scroll speed
            const trigger = (window.ScrollTrigger) ? window.ScrollTrigger.getById("birdScrollTrigger") : null;
            const velocity = trigger ? Math.abs(trigger.getVelocity()) : 0;
            const speedFactor = 1.0 + Math.min(velocity / 400, 4.0); // speed scales up to 5x with scroll speed
            
            // Apply GSAP animation proxy values if available
            if (window.birdProxy) {
                // Bird 1 Overrides (Pájaro 1 - Parámetros completamente independientes)
                if (window.birdProxy.b1_overrideRotX !== 9999) this.birds[0].userData.overrideRotX = window.birdProxy.b1_overrideRotX;
                else this.birds[0].userData.overrideRotX = undefined;
                if (window.birdProxy.b1_overrideRotY !== 9999) this.birds[0].userData.overrideRotY = window.birdProxy.b1_overrideRotY;
                else this.birds[0].userData.overrideRotY = undefined;
                if (window.birdProxy.b1_overrideRotZ !== 9999) this.birds[0].userData.overrideRotZ = window.birdProxy.b1_overrideRotZ;
                else this.birds[0].userData.overrideRotZ = undefined;

                // Bird 2 Overrides (Pájaro 2 - Parámetros completamente independientes)
                if (window.birdProxy.b2_overrideRotX !== 9999) this.birds[1].userData.overrideRotX = window.birdProxy.b2_overrideRotX;
                else this.birds[1].userData.overrideRotX = undefined;
                if (window.birdProxy.b2_overrideRotY !== 9999) this.birds[1].userData.overrideRotY = window.birdProxy.b2_overrideRotY;
                else this.birds[1].userData.overrideRotY = undefined;
                if (window.birdProxy.b2_overrideRotZ !== 9999) this.birds[1].userData.overrideRotZ = window.birdProxy.b2_overrideRotZ;
                else this.birds[1].userData.overrideRotZ = undefined;

                // Bird 3 Overrides (Pájaro 3 - Parámetros completamente independientes)
                if (window.birdProxy.b3_overrideRotX !== 9999) this.birds[2].userData.overrideRotX = window.birdProxy.b3_overrideRotX;
                else this.birds[2].userData.overrideRotX = undefined;
                if (window.birdProxy.b3_overrideRotY !== 9999) this.birds[2].userData.overrideRotY = window.birdProxy.b3_overrideRotY;
                else this.birds[2].userData.overrideRotY = undefined;
                if (window.birdProxy.b3_overrideRotZ !== 9999) this.birds[2].userData.overrideRotZ = window.birdProxy.b3_overrideRotZ;
                else this.birds[2].userData.overrideRotZ = undefined;

                if (window.birdProxy.decompose !== undefined) {
                    this.birds.forEach(bird => {
                        bird.userData.mat.uniforms.uDecompose.value = window.birdProxy.decompose;
                    });
                }
            }

            this.birds.forEach((bird, index) => {
                if (bird.userData.flapTime === undefined) {
                    bird.userData.flapTime = bird.userData.timeOffset;
                }
                // Accumulate flapTime based on delta and global speed factor
                bird.userData.flapTime += delta * speedFactor;
                bird.userData.mat.uniforms.uTime.value = bird.userData.flapTime;
                
                // Update wings amplitude from proxy if defined
                const proxyAmpKey = `b${index + 1}_wingsAmp`;
                if (window.birdProxy && window.birdProxy[proxyAmpKey] !== undefined) {
                    bird.userData.mat.uniforms.uWingsAmp.value = window.birdProxy[proxyAmpKey];
                } else {
                    bird.userData.mat.uniforms.uWingsAmp.value = bird.userData.baseWingsAmp;
                }
                
                const rotTime = time + bird.userData.timeOffset;
                const boomerangY = Math.sin(rotTime * 0.4) * 0.35;
                const boomerangX = Math.sin(rotTime * 0.2) * 0.1;

                // Desactivar movimiento de ratón durante intro
                const mouseInfluenceX = window.isIntroActive ? 0 : this.mouseX * 0.5;
                const mouseInfluenceY = window.isIntroActive ? 0 : -this.mouseY * 0.3;

                const targetRotX = bird.userData.overrideRotX !== undefined ? bird.userData.overrideRotX : bird.userData.baseRotX + boomerangX + mouseInfluenceY;
                const targetRotY = bird.userData.overrideRotY !== undefined ? bird.userData.overrideRotY : bird.userData.baseRotY + boomerangY + mouseInfluenceX;
                const targetRotZ = bird.userData.overrideRotZ !== undefined ? bird.userData.overrideRotZ : 0;

                bird.rotation.x += (targetRotX - bird.rotation.x) * 0.03;
                bird.rotation.y += (targetRotY - bird.rotation.y) * 0.03;
                bird.rotation.z += (targetRotZ - bird.rotation.z) * 0.03;

                // Organic 3D drifting
                const driftX = Math.sin(rotTime * 0.5) * 15.0;
                const driftY = Math.cos(rotTime * 0.4) * 12.0;
                const driftZ = Math.sin(rotTime * 0.3) * 10.0;

                let basePos = new THREE.Vector3(0, 0, 0);
                let scaleVal = bird.userData.baseScale;
                
                if (bird === this.birds[0]) {
                    basePos.set(window.birdProxy.b1_x, window.birdProxy.b1_y, window.birdProxy.b1_z);
                    if (window.birdProxy && window.birdProxy.b1_scale !== undefined) {
                        scaleVal = window.birdProxy.b1_scale;
                    }
                } else if (bird === this.birds[1]) {
                    basePos.set(window.birdProxy.b2_x, window.birdProxy.b2_y, window.birdProxy.b2_z);
                    if (window.birdProxy && window.birdProxy.b2_scale !== undefined) {
                        scaleVal = window.birdProxy.b2_scale;
                    }
                } else if (bird === this.birds[2]) {
                    basePos.set(window.birdProxy.b3_x, window.birdProxy.b3_y, window.birdProxy.b3_z);
                    if (window.birdProxy && window.birdProxy.b3_scale !== undefined) {
                        scaleVal = window.birdProxy.b3_scale;
                    }
                }

                // Rotación global orbital 3D del bando (linked to scroll)
                let x = basePos.x;
                let y = basePos.y;
                let z = basePos.z;

                // Rotación en eje Y (órbita horizontal)
                let rotY = window.birdProxy.rotationY || 0;
                let cosY = Math.cos(rotY);
                let sinY = Math.sin(rotY);
                let rx = x * cosY - z * sinY;
                let rz = x * sinY + z * cosY;

                // Rotación en eje X (órbita vertical)
                let rotX = window.birdProxy.rotationX || 0;
                let cosX = Math.cos(rotX);
                let sinX = Math.sin(rotX);
                let ry = y * cosX - rz * sinX;
                let rrz = y * sinX + rz * cosX;

                const depthPush = (1.0 - scaleVal) * 800;
                bird.position.set(rx + driftX, ry + driftY, rrz + driftZ - depthPush);
            });
        }

        if (this.material) {
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.animate = () => {};
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        if (this.controls) {
            this.controls.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.birds && this.birds.length > 0) {
            this.birds.forEach(bird => {
                if (bird.geometry) bird.geometry.dispose();
                if (bird.material) bird.material.dispose();
            });
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.container && this.renderer && this.renderer.domElement) {
            this.container.innerHTML = '';
        }
    }
}
