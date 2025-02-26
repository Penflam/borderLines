import * as THREE from "three";
import { _cameras } from "./cameras.js";
import { _console } from "./console.js";
import { _soleil } from "./soleil.js";
import { _model } from "./models.js";
export let _scene = {
	scene: null,
	renderer: null,
	_sets: null,
	//---------------
	cube: null,
	floor: null,
	_setThemAll: function () {
		this._sets = {
			scene: () => {
				this.scene = new THREE.Scene();
			},
			axesHelper: () => {
				// const axesHelper = new THREE.AxesHelper(1000);
				// axesHelper.position.set(0, 0, 0);
				// axesHelper.name = 'WorldAxessHelper';
				// this.scene.add(axesHelper);
			},
			floor: () => {
				// Ajouter un cube au milieu de la scène
				let cubeside = 10.5;
				let size = { x:cubeside, y:cubeside, z: 1 }
				const floorGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
				const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
				// const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xdedede });
				this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
				// this.floor.position.set(0, 0, -1)
				this.floor.size = {  x:size.x, y:size.y, z: size.z }
				this.floor.position.z = -1
				this.floor.name = 'floor';
				this.floor.castShadow = true;
				this.floor.receiveShadow = true;
				this.scene.add(this.floor);
			},
			floorGridHelper: () => {
				const size = this.floor.size.x;
				const divisions = this.floor.size.x / .5;

				const gridHelper = new THREE.GridHelper(size, divisions);
				// gridHelper.name = 'floorgridHelper';
				gridHelper.rotateX(Math.PI / 2)
				gridHelper.position.set(0, 0, .4)
				this.scene.add(gridHelper);
			},
			renderer: () => {
				this.renderer = new THREE.WebGLRenderer({ antialias: true });
				this.renderer.shadowMap.enabled = true;
				this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.renderer.setPixelRatio(devicePixelRatio);
				this.renderer.setClearColor(0xaaaaaa);
				console.log('renderer ok')
				document.body.appendChild(this.renderer.domElement);
			},
			addColonnes: () => {
				let i = 0;
				[
					{ x: -5.25, y: -5.25, z: 0 },
					{ x: 5.25, y: 5.25, z: 0 },
					{ x: -5.25, y: 5.25, z: 0 },
					{ x: 5.25, y: -5.25, z: 0 }
				].forEach(pos => { i++; this.addColonnes(pos, i) });
			},
			lights: () => {
				const ambient = new THREE.AmbientLight(0xffffff, .5);
				this.scene.add(ambient);

				const pointLight = new THREE.PointLight(0xffffff, 1);
				pointLight.castShadow = true;
				pointLight.position.set(0, 100, 100);
				this.scene.add(pointLight);
				
				const pointLight2 = new THREE.PointLight(0xffffff, 1);
				pointLight2.castShadow = true;
				pointLight2.position.set(2, 2, 3);
				this.scene.add(pointLight2);

			},
			sun: () => {
				_soleil.init(this.floor.size)
			},
			cameras: () => {
				_cameras.init();
				console.log('cameras ok (matrixed and rendered')
				_cameras.currentPack.camera.updateProjectionMatrix();
				this.renderer.render(this.scene, _cameras.currentPack.camera);
			},
		};
		for (const key in this._sets) {
			if (Object.hasOwnProperty.call(this._sets, key)) {
				this._sets[key](this);
			}
		}
	},
	addColonnes: function (vector3, id) {
		// Encore un cube
		const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, this.floor.size.x);
		const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
		let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

		cube.position.set(vector3.x, vector3.y, 0)
		cube.name = "Cube_" + id
		cube.velocity = new THREE.Vector3(0, 0, 0)
		cube.castShadow = true;
		cube.receiveShadow = true;
		this.scene.add(cube);
	},
	init: function () {
		this._setThemAll();
	},
};

