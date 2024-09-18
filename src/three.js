import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function loadStarBackground(wrapDom) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 2, 4);

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    wrapDom.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoverPlanes = [];
    let texture, drawCanvas;

    
    const lines = [
        { text: "Butterflies", y: 100 },
        { text: "Female", y: 150 },
        { text: "Light", y: 200 },

    ];
    let music = {
        Butterflies: "/public/Butterflies.mp3",
        Female: "/public/Female.mp3",
        Light: "/public/Light.mp3",
    };

    let audio = new Audio();  // 创建音频播放器
    let audioContext, analyser, dataArray;

    let particleSystem, particleCount = 2000;
    let particlePositions, particleColors, particleSizes;

    function createParticleSystem() {
        const geometry = new THREE.BufferGeometry();
        particlePositions = new Float32Array(particleCount * 3);
        particleColors = new Float32Array(particleCount * 3);
        particleSizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 2; // 圆的半径

            particlePositions[i * 3] = Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
            particlePositions[i * 3 + 2] = 0;

            particleColors[i * 3] = 1;     // R
            particleColors[i * 3 + 1] = 1; // G
            particleColors[i * 3 + 2] = 1; // B

            particleSizes[i] = 0.05;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: true
        });

        particleSystem = new THREE.Points(geometry, material);
        particleSystem.position.set(0, 0, -2); // 调整位置以便可以看到
        scene.add(particleSystem);
    }

    function updateVisualization(frequencyData) {
        if (!particleSystem) return;
    
        for (let i = 0; i < particleCount; i++) {
            const index = i * 3;
            const freqIndex = Math.floor(i / particleCount * frequencyData.length);
            const frequency = frequencyData[freqIndex] / 255;
    
            // 更新位置（创建波浪效果）
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 2 + frequency * 0.5; // 根据频率调整半径
            particlePositions[index] = Math.cos(angle) * radius;
            particlePositions[index + 1] = Math.sin(angle) * radius;
    
            // 更新颜色（随机）
            particleColors[index] = Math.random();     // R
            particleColors[index + 1] = Math.random(); // G
            particleColors[index + 2] = Math.random(); // B
    
            // 更新大小
            particleSizes[i] = frequency * 0.1 + 0.05;
        }
    
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.geometry.attributes.color.needsUpdate = true;
        particleSystem.geometry.attributes.size.needsUpdate = true;
    
        // 旋转粒子系统
        particleSystem.rotation.z += 0.005;
    }

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

    let selectedLineIndex = null;

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    function onMouseClick() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hoverPlanes);
    
        if (intersects.length > 0) {
            const clickedIndex = hoverPlanes.indexOf(intersects[0].object);
            selectedLineIndex = clickedIndex;
            drawCanvas(selectedLineIndex);
            texture.needsUpdate = true;
    
            // 播放对应的音乐
            const song = lines[selectedLineIndex].text;
            audio.src = music[song];
            audio.play();
    
            if (!audioContext) {
                initAudioAnalyser();
                createParticleSystem(); // 确保在这里创建粒子系统
            }
        }
    }

    function update() {
        renderer.render(scene, camera);
        requestAnimationFrame(update);
        controls.update();
        
        if (audioContext && analyser) {
            analyser.getByteFrequencyData(dataArray);
            updateVisualization(dataArray);
        }
    }
    update();

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    }

    window.addEventListener("resize", resize);

    function addmodel() {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/public/ipod.glb', (gltf) => {
    // Set camera position
    camera.position.set(-3.3, 1.25, 5.2);

    // Make the camera look at the origin (0, 0, 0)
    camera.lookAt(0, 0, 0);
            const model = gltf.scene;
            model.traverse((child) => {
                if (child.name == 'Object_5') {
                    const metalMaterial = new THREE.MeshStandardMaterial({
                        color: '#000',
                        metalness: 1,
                        roughness: 0.2
                    });
                    child.material = metalMaterial;
                }

                if (child.name === 'Object_7') {
                    child.visible = false;
                    const box = new THREE.Box3().setFromObject(child);
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    const center = new THREE.Vector3();
                    box.getCenter(center);

                    const width = size.x;
                    const height = size.y;

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = 512;
                    canvas.height = Math.round(512 * (height / width));


 

                    drawCanvas = function(selectedIndex = -1) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.fillStyle = "#FFFFFF";
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        lines.forEach((line, index) => {
                            if (index === selectedIndex) {
                                context.fillStyle = "#CCCCCC"; 
                                context.fillRect(0, line.y - 30, canvas.width, 50); 
                                context.fillStyle = "#1aad19";  
                            } else {
                                context.fillStyle = "#000000";
                                context.font = "30px Arial";  
                            }
                            context.fillText(line.text, 50, line.y);
                        });
                    };

                    drawCanvas();

                    texture = new THREE.CanvasTexture(canvas);
                    const planeGeometry = new THREE.PlaneGeometry(width, height);
                    const planeMaterial = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide
                    });

                    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                    plane.position.copy(center);
                    plane.rotation.copy(child.rotation);
                    scene.add(plane);

                    hoverPlanes = lines.map((line, index) => {
                        const hoverPlaneGeometry = new THREE.PlaneGeometry(width, height / lines.length);
                        const hoverPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, visible: false });
                        const hoverPlane = new THREE.Mesh(hoverPlaneGeometry, hoverPlaneMaterial);

                        hoverPlane.position.set(center.x, center.y - index * (height / lines.length) + (height / 2.5), center.z + 0.01); 
                        hoverPlane.rotation.copy(child.rotation);
                        scene.add(hoverPlane);
                        return hoverPlane;
                    });

                    function animate() {
                        requestAnimationFrame(animate);
                        controls.update();
                        renderer.render(scene, camera);
                    }
                    animate();
                }
            });
            scene.add(model);
            createParticleSystem(); // 在模型加载完成后创建粒子系统
        });
    }
    addmodel();

    function initAmbientLight() {
        var ambientLight = new THREE.AmbientLight('#fff', 50);
        scene.add(ambientLight);
    }
    initAmbientLight();

    function cloudFun() {
        var geom = new THREE.BufferGeometry();
        var material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true
        });

        var n = 1200;
        var positions = [];
        var colors = [];

        for (var i = 0; i < 3000; i++) {
            var particle = new THREE.Vector3(
                (Math.random() - 0.5) * n,
                (Math.random() - 0.5) * n,
                (Math.random() - 0.5) * n
            );
            positions.push(particle.x, particle.y, particle.z);

            let color_k = Math.random();
            colors.push(color_k * 10, color_k * 3, color_k);
        }

        geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        var cloud = new THREE.Points(geom, material);
        scene.add(cloud);
    }
    cloudFun();

    function initSpotLight() {
        const bigSpotLight = new THREE.DirectionalLight("#fff", 1000);
        bigSpotLight.angle = Math.PI / 8;
        bigSpotLight.penumbra = 0.2;
        bigSpotLight.decay = 2;
        bigSpotLight.distance = 30;
        bigSpotLight.shadow.radius = 10;
        bigSpotLight.shadow.mapSize.set(4096, 4096);
        bigSpotLight.position.set(-2.2, 6.7, -8.3);
        bigSpotLight.target.position.set(0, 0, 0);
        bigSpotLight.castShadow = true;
        bigSpotLight.intensity = 1000;
        scene.add(bigSpotLight);
    }
    initSpotLight();

    function initSpotLightwhite() {
        const bigSpotLight = new THREE.SpotLight("#fff", 1000);
        bigSpotLight.angle = Math.PI / 8;
        bigSpotLight.penumbra = 0.2;
        bigSpotLight.decay = 2;
        bigSpotLight.distance = 30;
        bigSpotLight.shadow.radius = 10;
        bigSpotLight.shadow.mapSize.set(4096, 4096);
        bigSpotLight.position.set(10, 2, 4);
        bigSpotLight.target.position.set(0, 0, 0);
        bigSpotLight.castShadow = true;
        bigSpotLight.intensity = 1000;
        scene.add(bigSpotLight);
    }
    initSpotLightwhite();




    function initAudioAnalyser() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
}

export default loadStarBackground;
