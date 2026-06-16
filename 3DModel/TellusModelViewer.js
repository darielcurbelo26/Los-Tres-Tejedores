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
        this.clock = new THREE.Clock();

        // Valores para interacción con ratón
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        // Valores de animación por scroll
        this.scrollProgress = 0;

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. Escena con fondo transparente
        this.scene = new THREE.Scene();

        // 2. Cámara
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.z = 200;

        // 3. Renderizador con soporte transparente
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // Fondo transparente
        this.container.appendChild(this.renderer.domElement);

        // 4. Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(100, 100, 100);
        this.scene.add(directionalLight);

        // 5. Cargar modelo
        this.loadModel();

        // 6. Escuchar eventos
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    loadModel() {
        const loader = new THREE.GLTFLoader();
        const modelPath = '3DModel/Modelos3D/tellus 3d.glb';

        loader.load(
            modelPath,
            (gltf) => {
                this.model = gltf.scene;

                // Escalar el modelo
                this.model.scale.set(1, 1, 1);
                this.model.position.set(0, 0, 0);

                // Configurar materiales para que sean más visibles
                this.model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        // Hacer los materiales más emisivos si es necesario
                        if (node.material) {
                            node.material.toneMapped = false;
                        }
                    }
                });

                this.scene.add(this.model);
            },
            (progress) => {
                // Callback de progreso (opcional)
                const percentComplete = (progress.loaded / progress.total) * 100;
                // console.log(`Cargando modelo: ${percentComplete.toFixed(2)}%`);
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

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.model) {
            // Rotación suavizada siguiendo el cursor (Lerp)
            this.targetRotationX = this.mouseY * (Math.PI / 8);
            this.targetRotationY = this.mouseX * (Math.PI / 8);

            this.model.rotation.x += (this.targetRotationX - this.model.rotation.x) * 0.05;
            this.model.rotation.y += (this.targetRotationY - this.model.rotation.y) * 0.05;

            // Aplicar dispersión física al scroll (similar al shader guide)
            const dispersalStrength = Math.pow(this.scrollProgress, 3.0) * 0.3;

            // Modificar escala y opacidad según el scroll
            if (this.scrollProgress > 0) {
                this.model.scale.set(
                    1 - dispersalStrength * 0.5,
                    1 - dispersalStrength * 0.5,
                    1 - dispersalStrength * 0.5
                );

                // Reducir opacidad
                this.model.traverse((node) => {
                    if (node.isMesh && node.material) {
                        node.material.opacity = 1.0 - this.scrollProgress;
                        node.material.transparent = true;
                    }
                });
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
};
