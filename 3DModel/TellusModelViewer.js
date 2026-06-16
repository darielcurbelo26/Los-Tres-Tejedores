window.TellusModelViewer = class TellusModelViewer {
    constructor(canvasContainerId) {
        this.container = document.querySelector(canvasContainerId);
        if (!this.container) {
            console.warn(`Container ${canvasContainerId} not found`);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.lights = {};
        this.clock = new THREE.Clock();

        // Valores para interacción con ratón
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentMouseRotX = 0;
        this.currentMouseRotY = 0;

        // Valores de animación por scroll
        this.scrollProgress = 0;

        // Guardar rotación inicial
        this.baseRotX = 0.3;
        this.baseRotY = 0.5;

        // Rotación continua infinita (muy suave)
        this.continuousRotationY = 0;
        this.rotationSpeed = 0.004; // Radianes por frame (~0.004 rad/frame = 1 vuelta cada ~1570 frames)

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. Escena con fondo transparente
        this.scene = new THREE.Scene();

        // 2. Cámara más cercana para ver el modelo escalado
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
        this.camera.position.z = 400;

        // 3. Renderizador con soporte transparente
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'highp' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // Fondo transparente
        this.renderer.tone = THREE.LinearToneMapping;
        this.container.appendChild(this.renderer.domElement);

        // 4. Crear luces (referencias para actualizar en tiempo real)
        this.setupLights();

        // 5. Cargar modelo
        this.loadModel();

        // 6. Escuchar eventos
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    setupLights() {
        // Luz ambiental
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(this.lights.ambient);

        // Luz direccional principal
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1.0);
        this.lights.directional.position.set(200, 200, 200);
        this.lights.directional.castShadow = true;
        this.scene.add(this.lights.directional);

        // Luz de relleno desde otro ángulo
        this.lights.fill = new THREE.DirectionalLight(0x88ccff, 0.5);
        this.lights.fill.position.set(-200, 100, -200);
        this.scene.add(this.lights.fill);

        // Luz puntual para mayor brillo
        this.lights.point = new THREE.PointLight(0xffffff, 0.8, 1000);
        this.lights.point.position.set(0, 100, 150);
        this.scene.add(this.lights.point);
    }

    loadModel() {
        const loader = new THREE.GLTFLoader();
        const modelPath = '3DModel/Modelos3D/tellus 3d.glb';

        loader.load(
            modelPath,
            (gltf) => {
                this.model = gltf.scene;

                // Configurar materiales para que sean más visibles
                this.model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;

                        if (node.material) {
                            node.material.toneMapped = false;
                            // Aumentar intensidad de luces si tiene emisión
                            if (node.material.emissive) {
                                node.material.emissiveIntensity = 0.5;
                            }
                        }
                    }
                });

                this.scene.add(this.model);
                console.log('Modelo Tellus cargado exitosamente');
            },
            (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                console.log(`Cargando modelo: ${percentComplete.toFixed(2)}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    onMouseMove(event) {
        const xNormalizado = (event.clientX / window.innerWidth) * 2 - 1;
        const yNormalizado = -(event.clientY / window.innerHeight) * 2 + 1;

        this.mouseX = xNormalizado;
        this.mouseY = yNormalizado;
    }

    // Método público para actualizar desde scroll
    updateScroll(progress) {
        this.scrollProgress = progress;
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    updateFromProxy() {
        const proxy = window.tellusProxy;
        if (!proxy || !this.model) return;

        // Actualizar posición
        this.model.position.x = proxy.t_x;
        this.model.position.y = proxy.t_y;
        this.model.position.z = proxy.t_z;

        // Actualizar escala
        this.model.scale.set(proxy.t_scale, proxy.t_scale, proxy.t_scale);

        // Guardar rotación inicial (base)
        this.baseRotX = proxy.t_rotX;
        this.baseRotY = proxy.t_rotY;

        // Actualizar luces
        if (this.lights.ambient) this.lights.ambient.intensity = proxy.t_ambientIntensity;
        if (this.lights.directional) this.lights.directional.intensity = proxy.t_directionalIntensity;
        if (this.lights.fill) this.lights.fill.intensity = proxy.t_fillIntensity;
        if (this.lights.point) this.lights.point.intensity = proxy.t_pointIntensity;

        // Actualizar opacidad
        this.model.traverse((node) => {
            if (node.isMesh && node.material) {
                node.material.opacity = proxy.t_opacity;
                node.material.transparent = true;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Leer parámetros de tellusProxy en tiempo real
        this.updateFromProxy();

        const proxy = window.tellusProxy;
        if (this.model && proxy) {
            // Rotación continua infinita sobre el eje Y
            this.continuousRotationY += this.rotationSpeed;

            // Rotación suavizada siguiendo el cursor (Lerp) con intensidad configurable
            const mouseFollowIntensity = proxy.t_mouseFollow || 1.0;
            const targetMouseRotX = this.mouseY * (Math.PI / 8) * mouseFollowIntensity;
            const targetMouseRotY = this.mouseX * (Math.PI / 8) * mouseFollowIntensity;

            // Interpolar solo la rotación del ratón (no la base)
            this.currentMouseRotX += (targetMouseRotX - this.currentMouseRotX) * 0.05;
            this.currentMouseRotY += (targetMouseRotY - this.currentMouseRotY) * 0.05;

            // Aplicar rotación = base + rotación continua + rotación del ratón
            this.model.rotation.x = this.baseRotX + this.currentMouseRotX;
            this.model.rotation.y = this.baseRotY + this.continuousRotationY + this.currentMouseRotY;

            // Aplicar dispersión física al scroll (similar al shader guide)
            const dispersalStrength = Math.pow(this.scrollProgress, 3.0) * 0.3;

            // Modificar escala según el scroll (pero mantener la escala base de proxy)
            if (this.scrollProgress > 0) {
                const baseScale = proxy.t_scale;
                const scrolledScale = baseScale * (1 - dispersalStrength * 0.5);
                this.model.scale.set(scrolledScale, scrolledScale, scrolledScale);

                // Reducir opacidad
                this.model.traverse((node) => {
                    if (node.isMesh && node.material) {
                        node.material.opacity = proxy.t_opacity * (1.0 - this.scrollProgress);
                        node.material.transparent = true;
                    }
                });
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
};
