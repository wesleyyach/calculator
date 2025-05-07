// ==========================================
// Configuração Inicial da Cena
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
    alpha: true
});

// Configurações básicas do renderer
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
camera.position.set(0, 0, 30);

// ==========================================
// Controles de Câmera
// ==========================================
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;

// ==========================================
// Sistema de Iluminação
// ==========================================
// Luz ambiente para iluminação geral
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Luz pontual que segue o mouse
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Luz direcional para melhor iluminação do modelo
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// ==========================================
// Sistema de Partículas
// ==========================================
let particlesMesh;
let particlesMaterial;

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;

    // Arrays para armazenar dados das partículas
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);

    // Gerar posições, cores e tamanhos aleatórios
    for(let i = 0; i < particlesCount; i++) {
        // Posição
        posArray[i * 3] = (Math.random() - 0.5) * 100;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 100;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        // Cor
        colorArray[i * 3] = Math.random() * 0.5 + 0.5;
        colorArray[i * 3 + 1] = Math.random() * 0.5 + 0.5;
        colorArray[i * 3 + 2] = Math.random() * 0.5 + 0.5;
        
        // Tamanho
        sizeArray[i] = Math.random() * 0.02;
    }

    // Configurar geometria
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

    // Material das partículas
    particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    // Criar e adicionar o sistema de partículas
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    return particlesMesh;
}

// ==========================================
// Carregamento do Modelo 3D
// ==========================================
let model;

function loadModel(url) {
    const loader = new THREE.GLTFLoader();
    const loadingManager = new THREE.LoadingManager();
    
    // Configurar feedback de carregamento
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal * 100).toFixed(2);
        document.getElementById('loading').textContent = `Carregando modelo: ${progress}%`;
    };
    
    loadingManager.onLoad = () => {
        document.getElementById('loading').style.display = 'none';
    };
    
    loadingManager.onError = (url) => {
        console.error('Erro ao carregar:', url);
        document.getElementById('loading').textContent = 'Erro ao carregar o modelo';
    };
    
    // Carregar o modelo
    loader.setPath('models/');
    loader.load(
        url,
        (gltf) => {
            model = gltf.scene;
            
            // Configurar posição e escala
            model.position.set(25, -15, 0);
            model.scale.set(0.1, 0.1, 0.1);
            
            // Configurar materiais e sombras
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        node.material.metalness = 0.5;
                        node.material.roughness = 0.5;
                    }
                }
            });
            
            scene.add(model);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% carregado');
        },
        (error) => {
            console.error('Erro ao carregar o modelo:', error);
            document.getElementById('loading').textContent = 'Erro ao carregar o modelo';
        }
    );
}

// ==========================================
// Interação com o Mouse
// ==========================================
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

let isMouseMoving = false;
let mouseMoveTimeout;

document.addEventListener('mousemove', (event) => {
    if (!isMouseMoving) {
        isMouseMoving = true;
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
        
        // Atualizar posição da luz
        pointLight.position.x = mouseX * 50;
        pointLight.position.y = -mouseY * 50;
        
        clearTimeout(mouseMoveTimeout);
        mouseMoveTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    }
});

// ==========================================
// Loop de Animação
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    // Atualizar rotação das partículas
    if (particlesMesh) {
        targetX = mouseX * 0.0005;
        targetY = mouseY * 0.0005;
        particlesMesh.rotation.x += 0.0002 + targetY;
        particlesMesh.rotation.y += 0.0002 + targetX;

        // Efeito de pulso nas partículas
        const time = Date.now() * 0.0005;
        particlesMaterial.size = 0.02 + Math.sin(time) * 0.01;
    }

    // Animar o modelo
    if (model) {
        model.rotation.y += 0.005;
    }

    // Atualizar controles e renderizar
    controls.update();
    renderer.render(scene, camera);
}

// ==========================================
// Gerenciamento de Redimensionamento
// ==========================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 250);
});

// ==========================================
// Inicialização
// ==========================================
function init() {
    createParticles();
    loadModel('cosmonaut_on_a_rocket.glb');
    animate();
}

window.addEventListener('load', () => {
    document.getElementById('loading').style.display = 'none';
    init();
}); 