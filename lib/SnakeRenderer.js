import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from './GLTFLoader.js';
import { RGBELoader } from './RGBELoader.js';
import ShadowRenderer from './ShadowRenderer.js';
import Constants from './Constants.js';

export default function SnakeRenderer(_params) {
	const { canvasId, modelFilePath, params, materials } = _params;
	const { 
		position, cameraPosition, cameraLook, scale,
		hdr, shadowHeight
	} = params;
	let camera, scene, renderer;
	let snake, shadows;
	const width = 960, height = 480;

	init();
	

	function init() {

		camera = new THREE.PerspectiveCamera(50, 960 / 480, 0.01, 1000);
		camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
		camera.lookAt(new THREE.Vector3(cameraLook.x, cameraLook.y, cameraLook.z));

		scene = new THREE.Scene();
		scene.background = new THREE.Color(Constants.bgColor);

		shadows = new ShadowRenderer({ y: -0.3 }, shadowHeight);
		scene.add(shadows.get());

		// lights		
		const hemi = new THREE.HemisphereLight(0xAC3FE6, 0xBFAB82, 0.25);
		scene.add(hemi);

		const ambient = new THREE.AmbientLight(0xffffff, 0.1);
		scene.add(ambient);

		const directionalLightRight = new THREE.DirectionalLight(0x92b7be, 0.5);
		directionalLightRight.position.x = 10;
		scene.add( directionalLightRight );

		const directionalLightLeft = new THREE.DirectionalLight(0xD397C9, 0.5);
		directionalLightLeft.position.x = -10;
		scene.add( directionalLightLeft );


		renderer = new THREE.WebGLRenderer( { canvas: document.getElementById(canvasId), antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1;
		// document.body.appendChild( renderer.domElement );

		// new OrbitControls( camera, renderer.domElement );


		const manager = new THREE.LoadingManager();
		manager.onLoad = function() {
			// requestAnimationFrame(render);
		};

		const loader = new GLTFLoader(manager);
		const textureLoader = new THREE.TextureLoader(manager);
		const textures = {};
		for (const k in Constants.textures) {
			const { src, repeat } = Constants.textures[k];
			textures[k] = textureLoader.load(src);
			textures[k].wrapS = THREE.RepeatWrapping;
			textures[k].wrapT = THREE.RepeatWrapping;
			textures[k].repeat.set(repeat, repeat);
		}

		if (hdr) {
			new RGBELoader()
				.load('./textures/phalzer_forest_01_1k.hdr', texture => {
					texture.mapping = THREE.EquirectangularReflectionMapping;
					// scene.background = texture;
					scene.environment = texture;
					loader.load(modelFilePath, onLoad);
				});
		} else {
			loader.load(modelFilePath, onLoad);
		}
		
		function onLoad(gltf) {
			// console.log(textures);

			snake = gltf.scene;
			snake.position.set(position.x, position.y, position.z);
			snake.scale.setScalar(scale);
			scene.add(snake);

			snake.traverse(c => {
				if (c.isMesh) {

					// pink w bump -- snakey, bronzy
					if (c.material.name === 'Tongue') {
						const material = new THREE.MeshPhysicalMaterial({
							color: 0xf3c9c9,
							reflectivity: 0,
							roughness: 1,
							clearcoat: 0.5,
							map: textures.bump,
						});
						c.material = material;
					}

					// black reflective -- all of them
					if (c.material.name === 'Eyes') {
						const material = new THREE.MeshPhysicalMaterial({
							color: 0x000000,
							reflectivity: 1,
							roughness: 0,
							// map: textures.eye,
						});
						c.material = material;

						// blue uraeus eyes
						// console.log('Eyes', material);
					}

					if (c.material.name === 'Skin' && c.name !== 'snakey_1') {
						c.material.map = textures.scale;
					}

					if (c.material.name === 'Staff') {
						c.material.map = textures.staff;
						if (c.name.includes('bronze')) {
							textures.staff.flipY = true;
							textures.staff.needsUpdate = true;

						}
					}

					if (c.material && c.name == 'ura') {
						c.material.map = textures.uraeusColorMap;
						c.material.roughMap = textures.uraeusRoughMap;
						textures.uraeusColorMap.flipY = false;
						textures.uraeusColorMap.needsUpdate = true;
						textures.uraeusRoughMap.flipY = false;
						textures.uraeusRoughMap.needsUpdate = true;
						c.material.needsUpdate = true;
					}

					// top
					if (c.material && c.name == 'ouro_1') {
						c.material.roughness = 0;
						c.material.map = textures.scale_red;
						c.material.roughMap = textures.scale_bw_rough;
						textures.scale_red.flipY = false;
						textures.scale_bw_rough.flipY = false;
						textures.scale_red.needsUpdate = true;
						textures.scale_bw_rough.needsUpdate = true;
						c.material.needsUpdate = true;
					}

					// under
					if (c.material && c.name == 'ouro_2') {
						c.material.roughness = 0;
						c.material.map = textures.scale;
						c.material.roughMap = textures.scale_bw_rough;
						textures.scale.flipY = false;
						textures.scale_bw_rough.needsUpdate = false;
						textures.scale.needsUpdate = true;
						textures.scale_bw_rough.needsUpdate = true;
						c.material.needsUpdate = true;


					}
					
					
				}
			});

			requestAnimationFrame(animate);
		}
	}
	

	function animate() {
		requestAnimationFrame(animate);
		shadows.render(renderer, scene);
		renderer.render(scene, camera);
	}

	// https://gamedev.stackexchange.com/questions/130789/three-js-how-to-rotate-sphere-without-moving-light-using-orbitcontrols

	let isDragging = false;
	let previousMousePosition = {
	    x: 0,
	    y: 0
	};

	const toRadians = (angle) => {
	    return angle * (Math.PI / 180);
	};

	const toDegrees = (angle) => {
	    return angle * (180 / Math.PI);
	};

	const renderArea = renderer.domElement;

	renderArea.addEventListener('mousedown', (e) => {
	    isDragging = true;
	});

	renderArea.addEventListener('mousemove', (e) => {
	    let deltaMove = {
	        x: e.offsetX-previousMousePosition.x,
	        y: e.offsetY-previousMousePosition.y
	    };

	    if (isDragging) {

	        let deltaRotationQuaternion = new THREE.Quaternion().

	        setFromEuler(
	            new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
	        );

	        snake.quaternion.multiplyQuaternions(deltaRotationQuaternion, snake.quaternion);
	    }

	    previousMousePosition = {
	        x: e.offsetX,
	        y: e.offsetY
	    };
	});

	document.addEventListener('mouseup', (e) => {
	    isDragging = false;
	});
}