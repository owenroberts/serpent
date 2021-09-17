import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { HorizontalBlurShader } from './HorizontalBlurShader.js';
import { VerticalBlurShader } from './VerticalBlurShader.js';
import { GLTFLoader } from './GLTFLoader.js';

export default function SnakeShadows(canvasId, modelFilePath) {

	let camera, scene, renderer, stats, gui;
	let snake;

	const meshes = [];
	const width = 960, height = 480;

	const PLANE_WIDTH = 5;
	const PLANE_HEIGHT = 5;
	const CAMERA_HEIGHT = 0.3;

	const state = {
		shadow: {
			blur: 2,
			darkness: 1,
			opacity: 1,
		},
		plane: {
			color: '#e8e8e8',
			opacity: 1,
		},
		showWireframe: false,
	};

	let shadowGroup, renderTarget, renderTargetBlur, shadowCamera, cameraHelper, depthMaterial, horizontalBlurMaterial, verticalBlurMaterial;

	let plane, blurPlane, fillPlane;

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 50, 960 / 480, 0.1, 100 );
		camera.position.set( 0, 1, 2 );
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xe8e8e8 );

		// the container, if you need to move the plane just move this
		shadowGroup = new THREE.Group();
		shadowGroup.position.y = - 0.3;
		scene.add( shadowGroup );

		// the render target that will show the shadows in the plane texture
		renderTarget = new THREE.WebGLRenderTarget( 512, 512 );
		renderTarget.texture.generateMipmaps = false;

		// the render target that we will use to blur the first render target
		renderTargetBlur = new THREE.WebGLRenderTarget( 512, 512 );
		renderTargetBlur.texture.generateMipmaps = false;

		const hemi = new THREE.HemisphereLight(0xffffff, 0xffddff, 0.75);
		scene.add(hemi);

		const ambient = new THREE.AmbientLight(0xffffff, 0.2);
		scene.add(ambient);


		// make a plane and make it face up
		const planeGeometry = new THREE.PlaneGeometry( PLANE_WIDTH, PLANE_HEIGHT ).rotateX( Math.PI / 2 );
		const planeMaterial = new THREE.MeshBasicMaterial( {
			color: 0xe8e8e8,
			map: renderTarget.texture,
			opacity: state.shadow.opacity,
			transparent: true,
			depthWrite: false,
		} );
		plane = new THREE.Mesh( planeGeometry, planeMaterial );
		// make sure it's rendered after the fillPlane
		plane.renderOrder = 1;
		shadowGroup.add( plane );

		// the y from the texture is flipped!
		plane.scale.y = - 1;

		// the plane onto which to blur the texture
		blurPlane = new THREE.Mesh( planeGeometry );
		blurPlane.visible = false;
		shadowGroup.add( blurPlane );

		// the plane with the color of the ground
		const fillPlaneMaterial = new THREE.MeshBasicMaterial( {
			color: state.plane.color,
			opacity: state.plane.opacity,
			transparent: true,
			depthWrite: false,
		} );
		fillPlane = new THREE.Mesh( planeGeometry, fillPlaneMaterial );
		fillPlane.rotateX( Math.PI );
		shadowGroup.add( fillPlane );

		// the camera to render the depth material from
		shadowCamera = new THREE.OrthographicCamera( - PLANE_WIDTH / 2, PLANE_WIDTH / 2, PLANE_HEIGHT / 2, - PLANE_HEIGHT / 2, 0, CAMERA_HEIGHT );
		shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
		shadowGroup.add( shadowCamera );

		cameraHelper = new THREE.CameraHelper( shadowCamera );

		// like MeshDepthMaterial, but goes from black to transparent
		depthMaterial = new THREE.MeshDepthMaterial();
		depthMaterial.userData.darkness = { value: state.shadow.darkness };
		depthMaterial.onBeforeCompile = function ( shader ) {

			shader.uniforms.darkness = depthMaterial.userData.darkness;
			shader.fragmentShader = /* glsl */`
				uniform float darkness;
				${shader.fragmentShader.replace(
			'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
			'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
		)}
			`;

		};

		depthMaterial.depthTest = false;
		depthMaterial.depthWrite = false;

		horizontalBlurMaterial = new THREE.ShaderMaterial( HorizontalBlurShader );
		horizontalBlurMaterial.depthTest = false;

		verticalBlurMaterial = new THREE.ShaderMaterial( VerticalBlurShader );
		verticalBlurMaterial.depthTest = false;

		renderer = new THREE.WebGLRenderer( { canvas: document.getElementById(canvasId), antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		document.body.appendChild( renderer.domElement );


		// new OrbitControls( camera, renderer.domElement );
		
		const manager = new THREE.LoadingManager();
		manager.onLoad = function() {
			// requestAnimationFrame(render);
		};

		const loader = new GLTFLoader(manager);
		loader.load(modelFilePath, onLoad);
		const texture = new THREE.TextureLoader(manager).load('../textures/noise.png');

		function onLoad(gltf) {

			const material = new THREE.MeshStandardMaterial({
				map: texture,
			});
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(16, 16);

			snake = gltf.scene;
			// snake.position.x = -1.5;
			snake.position.y = 0.1;
			snake.castShadow = true;
			snake.scale.setScalar(0.25);
			scene.add(snake);

			snake.traverse(c => {
				if (c.isMesh) {
					// c.receiveShadow = true;
					// c.castShadow = true;
					// c.material = material;
					// c.material = material;
					c.material.color.g = 0.86;
					c.material.map = texture;
					texture.updateMatrix();
				}
			});
		}

	}


	// renderTarget --> blurPlane (horizontalBlur) --> renderTargetBlur --> blurPlane (verticalBlur) --> renderTarget
	function blurShadow( amount ) {

		blurPlane.visible = true;

		// blur horizontally and draw in the renderTargetBlur
		blurPlane.material = horizontalBlurMaterial;
		blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
		horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

		renderer.setRenderTarget( renderTargetBlur );
		renderer.render( blurPlane, shadowCamera );

		// blur vertically and draw in the main renderTarget
		blurPlane.material = verticalBlurMaterial;
		blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
		verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

		renderer.setRenderTarget( renderTarget );
		renderer.render( blurPlane, shadowCamera );

		blurPlane.visible = false;

	}

	function animate( ) {

		requestAnimationFrame( animate );

		//

		meshes.forEach( mesh => {

			mesh.rotation.x += 0.01;
			mesh.rotation.y += 0.02;

		} );

		//

		// remove the background
		const initialBackground = scene.background;
		scene.background = null;

		// force the depthMaterial to everything
		cameraHelper.visible = false;
		scene.overrideMaterial = depthMaterial;

		// render to the render target to get the depths
		renderer.setRenderTarget( renderTarget );
		renderer.render( scene, shadowCamera );

		// and reset the override material
		scene.overrideMaterial = null;
		cameraHelper.visible = true;

		blurShadow( state.shadow.blur );

		// a second pass to reduce the artifacts
		// (0.4 is the minimum blur amout so that the artifacts are gone)
		blurShadow( state.shadow.blur * 0.4 );

		// reset and render the normal scene
		renderer.setRenderTarget( null );
		scene.background = initialBackground;

		renderer.render( scene, camera );

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