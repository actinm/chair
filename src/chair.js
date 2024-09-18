
import * as THREE from "three";
//轨道控制
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
function chair(wrapDom) {
    // 场景
    var scene = new THREE.Scene();
    // 相机
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0.6, 2.4, -5.1);

    // 1.启用阴影
    // 渲染器，启用阴影
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.shadowMap.enabled = true; // 启用阴影映射
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用软阴影

    wrapDom.appendChild(renderer.domElement); // 将渲染器的输出添加到文档中

    // 轨道控制器
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.25;


    // 设置相机移动范围
controls.minDistance = 2; // 最小距离
controls.maxDistance = 10; // 最大距离

// 设置垂直旋转角度范围
controls.minPolarAngle = Math.PI / 10; // 最小仰角 (30度)
controls.maxPolarAngle = 87 * (Math.PI / 180); // 最大仰角 (87度)
    // 更新循环
    function update() {
        renderer.render(scene, camera);
        requestAnimationFrame(update);
        controls.update(); // 更新轨道控制器状态

    }
    update();

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resize);

    // 添加模型
    addmodel()
    function addmodel() {
        new GLTFLoader().load("./gaming_chair.glb", (gltf) => {
            const carModel = gltf.scene;

            // 2.为模型启用阴影
            // 启用模型投射阴影
            carModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;  // 启用投射阴影
                    child.receiveShadow = true;  // 启用接收阴影
                }
            });

            // 创建包围盒来计算模型的尺寸
            const box = new THREE.Box3().setFromObject(carModel);
            const size = new THREE.Vector3();
            box.getSize(size);
            const height = size.y;
            carModel.position.set(0, height / 2, 0);

            scene.add(carModel);

            // 添加环境光
            var ambientLight = new THREE.AmbientLight("#fff", 5);
            scene.add(ambientLight);
        },
            (xhr) => {
                console.log(Math.floor((xhr.loaded / xhr.total) * 100) + "%");
            },
            (err) => {
                console.error("加载发生错误", err);
            });
    }

    // 添加4周
    addSceneBox();
    function addSceneBox() {
        const boxSize = 50;
        const wallThickness = 0.5;
        const wallHeight = boxSize;

        const material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            side: THREE.DoubleSide
        });

        const sides = [
            { pos: [0, wallHeight / 2, -boxSize / 2], rot: [0, 0, 0], size: [boxSize, wallHeight, wallThickness] },
            { pos: [0, wallHeight / 2, boxSize / 2], rot: [0, 0, 0], size: [boxSize, wallHeight, wallThickness] },
            { pos: [-boxSize / 2, wallHeight / 2, 0], rot: [0, Math.PI / 2, 0], size: [boxSize, wallHeight, wallThickness] },
            { pos: [boxSize / 2, wallHeight / 2, 0], rot: [0, Math.PI / 2, 0], size: [boxSize, wallHeight, wallThickness] },
        ];

        sides.forEach(side => {
            const geometry = new THREE.BoxGeometry(side.size[0], side.size[1], side.size[2]);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...side.pos);
            mesh.rotation.set(...side.rot);
            scene.add(mesh);
        });
    }

    // 添加地板
    initFloor();
    function initFloor() {
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const material = new THREE.MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            color: 0x808080,
            metalness: 0,
            roughness: 0.1
        });

        const floorMesh = new THREE.Mesh(floorGeometry, material);
        floorMesh.rotation.x = Math.PI / 2;
        // 3.为地板启用阴影
        // 地面启用接收阴影
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);
    }

    // 添加灯光
    initSpotLight();
    function initSpotLight() {
        const bigSpotLight = new THREE.SpotLight("#ffffff", 500);
        bigSpotLight.angle = Math.PI / 8;
        bigSpotLight.penumbra = 0.6;
        bigSpotLight.decay = 2;
        bigSpotLight.distance = 30;
        bigSpotLight.shadow.radius = 10;
        bigSpotLight.shadow.mapSize.set(4096, 4096);

        bigSpotLight.position.set(-4.4, 6, -3.2);
        bigSpotLight.target.position.set(10, 0, 0);
        // 4.为灯光启用阴影
        // 聚光灯启用阴影
        bigSpotLight.castShadow = true;

        scene.add(bigSpotLight);
    }
}

export default chair;
