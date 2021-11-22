const Constants = {

	bgColor: 0xe9e7d8,

	snakes: {

		asclepius: {
			canvasId: 'asclepius', 
			modelFilePath: '../models/asclepius-1.glb',
			params: {
				position: { x: 0, y: 0, z: 0 },
				cameraPosition: { x: 0, y: 3, z: 5 },
				cameraLook: { x: 0, y: 2, z: 0 },
				scale: 0.36,
				hdr: false,
				shadowHeight: 4,
			}
		},

		caduceus: {
			canvasId: 'caduceus', 
			modelFilePath: '../models/cad-1.glb',
			params: {
				position: { x: 0, y: 0, z: 0 },
				cameraPosition: { x: 0, y: 3, z: 5 },
				cameraLook: { x: 0, y: 2, z: 0 },
				scale: 0.3,
				hdr: true,
				shadowHeight: 4,
			}
		},

		snakey: {
			canvasId: 'snakey',
			modelFilePath: '../models/snakey-1.glb',
			params:	{
				position: { x: 0, y: -0.2, z: -1 },
				cameraPosition: { x: 0, y: 3, z: 5 },
				cameraLook: { x: 0, y: 2, z: 0 },
				scale: 0.5,
				hdr: true,
			}
		},

		uraeus: {
			canvasId: 'uraeus', 
			modelFilePath: '../models/ura-1.glb',
			params: {
				position: { x: 0, y: -0.2, z: -1 },
				cameraPosition: { x: 0, y: 3, z: 5 },
				cameraLook: { x: 0, y: 2, z: 0 },
				scale: 0.5,
				hdr: true,
			},
			materials: {
				name: 'ura',
				map: 'uraeusColorMap',
				roughMap: 'uraeusRoughMap',
			}
		},

		bronzy: {
			canvasId: 'bronzy', 
			modelFilePath: '../models/bronzy-1.glb',
			params: {
				position: { x: 0, y: -0.2, z: -1 },
				cameraPosition: { x: 0, y: 3, z: 5 },
				cameraLook: { x: 0, y: 2, z: 0 },
				scale: 0.5,
				hdr: true,
				shadowHeight: 4,
			}
		},

		ouro: {
			canvasId: 'ouro', 
			modelFilePath: '../models/ouro-1.glb',
			params: {
				position: { x: 0, y: -0.2, z: -1 },
				cameraPosition: { x: 0, y: 3, z: 5 },
				cameraLook: { x: 0, y: 2, z: 0 },
				scale: 0.5,
				hdr: true,
				shadowHeight: 4,
			}
		}
	},

	textures: {
		bump: { 
			src: '../textures/blur-lg.png',
			repeat: 64,
		},
		scale: { 
			src: '../textures/scale.jpg',
			repeat: 32,
		},
		scale_red: { 
			src: '../textures/scale_red.jpg',
			repeat: 32,
		},
		scale_bw: {
			src: '../textures/scale_bw.jpg',
			repeat: 32,
		},
		scale_bw_rough: {
			src: '../textures/scale_bw_rough.jpg',
			repeat: 32,
		},
		eye: { 
			src: '../textures/eye.jpg',
			repeat: 1,
		},
		staff: {
			src: '../textures/Staff.jpg',
			repeat: 1,
		},
		uraeusColorMap: {
			src: '../textures/UraColorMap.jpg',
			repeat: 1,
		},
		uraeusRoughMap: {
			src: '../textures/UraRoughMap.jpg',
			repeat: 1,
		}
	}
}
export default Constants;


// c.receiveShadow = true;
// c.castShadow = true;
// c.material = material;
// c.material = material;
// c.material.color.g = 0.86;
// c.material.map = texture;
// texture.updateMatrix();