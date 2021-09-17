import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';


export default function SnakeRenderer(canvasId, modelFilePath) {

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xededed);

	const width = 960, height = 480;
	const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	camera.position.z = 5;
	const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(canvasId), antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize( width, height );

	var light = new THREE.SpotLight();
	light.position.set(10,20,50);
	light.castShadow = true;
	// scene.add(light);

	const controls = new OrbitControls(camera, renderer.domElement);
	// controls.enablePan = false;
	// controls.enableZoom = false;

	const hemi = new THREE.HemisphereLight(0xffffff, 0xffddff, 0.75);
	scene.add(hemi);

	const ambient = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambient);
	
	const directional = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directional.position.z = -50;
	directional.position.y = 50;
	directional.position.x = 10;
	directional.castShadow = true;
	directional.shadow.mapSize.width = 2048; // default
	// directional.shadow.mapSize.height = 2048; // default
	// directional.shadow.camera.near = 0.1; // default
	// directional.shadow.camera.far = 500; // default
	// directional.target = new THREE.Vector3(0, 0, 0);
	scene.add(directional);
	const helper = new THREE.DirectionalLightHelper( directional, 5 );
	scene.add( helper );


	const geometry = new THREE.PlaneGeometry( 50, 50 );
	const material = new THREE.ShadowMaterial({ opacity: 0.25 });
	const floor = new THREE.Mesh( geometry, material );
	floor.position.y = -1.5;
	floor.rotation.x = -Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	const manager = new THREE.LoadingManager();
	manager.onLoad = function() {
		requestAnimationFrame(render);
		setupEvents();
	};
	const loader = new GLTFLoader(manager);
	loader.load(modelFilePath, onLoad);

	const texture = new THREE.TextureLoader(manager).load('../textures/noise.png');

	let snake;
	let isControlling = false;

	function onLoad(gltf) {

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(16, 16);

		snake = gltf.scene;
		snake.position.x = -1.5;
		snake.castShadow = true;
		// snake.scale.setScalar(0.25);
		scene.add(snake);

		snake.traverse(c => {
			if (c.isMesh) {
				c.receiveShadow = true;
				c.castShadow = true;
				// c.material = material;
				c.material.color.g = 0.86;
				c.material.map = texture;
				texture.updateMatrix();
			}
		});
	}

	function render() {
		renderer.render( scene, camera );
		if (isControlling) {
			controls.update();
			requestAnimationFrame(render);
		}
	}

	function setupEvents() {
		console.log('setup');
		renderer.domElement.addEventListener('mousedown', mouseDown);
		renderer.domElement.addEventListener('mouseup', mouseUp);
	}

	function mouseDown(ev) {
		if (ev.which === 1) {
			isControlling = true;
			requestAnimationFrame(render);
		}
	}

	function mouseUp(ev) {
		if (ev.which === 1) {
			isControlling = false;
		}
	}

}