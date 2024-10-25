import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const wrapper = document.getElementById("app");
const width = wrapper.clientWidth;
const height = wrapper.clientHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
camera.position.z = 4;

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
let skybox;

// Inicjalizacja loadera
function loadTextures(path) {
	loader.setPath(path);

	const materials = [
		new THREE.MeshBasicMaterial({
			map: loader.load("px.png"),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: loader.load("nx.png"),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: loader.load("py.png"),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: loader.load("ny.png"),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: loader.load("pz.png"),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: loader.load("nz.png"),
			side: THREE.BackSide,
		}),
	];

	if (skybox) {
		// If skybox exists, update its materials
		skybox.material = materials;
		skybox.material.needsUpdate = true; // Ensure materials are updated
	} else {
		// Create skybox for the first time
		skybox = new THREE.Mesh(geometry, materials);
		scene.add(skybox);
	}
}

const geometry = new THREE.BoxGeometry(1000, 1000, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop(animate);
renderer.setSize(width, height);
wrapper.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.5;
controls.maxDistance = 6;

function animate() {
	controls.update();
	renderer.render(scene, camera);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
	mouse.x = (event.clientX / width) * 2 - 1;
	mouse.y = -(event.clientY / height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObject(skybox);

	if (intersects.length > 0) {
		const intersect = intersects[0];
		const faceIndex = intersect.face.materialIndex;
	}
}

window.addEventListener("click", onMouseClick, false);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
	const width = wrapper.clientWidth;
	const height = wrapper.clientHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}

// Handlers for buttons
function loadColors() {
	loadTextures("/colors_cubemap/");
}

function loadPanorama() {
	loadTextures("/panorama_cubemap/");
}
window.loadColors = loadColors;
window.loadPanorama = loadPanorama;

// init with colors
loadColors();
