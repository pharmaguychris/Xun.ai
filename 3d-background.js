// Initialize Three.js scene
let scene, camera, renderer;
let geometry, material, mesh;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x007bff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // Create main geometric shape
    geometry = new THREE.IcosahedronGeometry(8, 1);
    material = new THREE.MeshPhongMaterial({
        color: 0x007bff,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
        wireframeLinewidth: 1
    });
    
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add subtle particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = (Math.random() - 0.5) * 30;
        positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x007bff,
        size: 0.05,
        transparent: true,
        opacity: 0.3
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Add mouse movement handlers
    document.addEventListener('mousemove', onMouseMove);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = -(event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Smoothly update target position
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Update mesh position and rotation
    mesh.position.x = targetX * 10;
    mesh.position.y = targetY * 10;
    
    // Rotate based on position
    mesh.rotation.x = targetY * 1.5;
    mesh.rotation.y = targetX * 1.5;

    // Add subtle constant rotation
    mesh.rotation.x += 0.001;
    mesh.rotation.y += 0.001;

    renderer.render(scene, camera);
}

// Initialize and start animation
init();
animate();
