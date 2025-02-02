import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// SETUP
// --- MAP MANAGEMENT
const startingPointId = "x0y0";
let currentFloorId = "z0";
let currentMap = [
	"x2y-1",
	"x1y0",
	"x1y-4",
	"x4y0",
	"x4y1",
	"x1y-1",
	"x3y0",
	"x2y0",
	"x0y0",
	"x4y-1",
];

// --- THREEJS SCENE MANAGEMENT
const map = ["x0y0", "x1y0", "x2y0", "x2y-1", "x3y-1", "x4y0"];
const startingCubeId = "x1y0";
const scene = new THREE.Scene();

const wrapper = document.getElementById("app");
const width = wrapper.clientWidth;
const height = wrapper.clientHeight;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);

const texureLoader = new THREE.TextureLoader();
texureLoader.setPath("/");

const materials = [
	new THREE.MeshBasicMaterial({
		map: texureLoader.load(`${startingCubeId}/px.png`),
		side: THREE.BackSide,
	}),
	new THREE.MeshBasicMaterial({
		map: texureLoader.load(`${startingCubeId}/nx.png`),
		side: THREE.BackSide,
	}),
	new THREE.MeshBasicMaterial({
		map: texureLoader.load(`${startingCubeId}/py.png`),
		side: THREE.BackSide,
	}),
	new THREE.MeshBasicMaterial({
		map: texureLoader.load(`${startingCubeId}/ny.png`),
		side: THREE.BackSide,
	}),
	new THREE.MeshBasicMaterial({
		map: texureLoader.load(`${startingCubeId}/pz.png`),
		side: THREE.BackSide,
	}),
	new THREE.MeshBasicMaterial({
		map: texureLoader.load(`${startingCubeId}/nz.png`),
		side: THREE.BackSide,
	}),
];

function findNeighbors(point) {
	const x = Number.parseInt(point.match(/x(-?\d+)/)[1], 10);
	const y = Number.parseInt(point.match(/y(-?\d+)/)[1], 10);

	const directions = [];

	let px;
	let nx;
	let py;
	let ny;
	let pxy;
	let nxy;
	let pxny;
	let nxny;
	for (let step = 1; step <= 3; step++) {
		if (px && nx && py && ny && pxy && nxy && pxny && nxny) break;

		// Horizontal and vertical neighbors
		if (!px && map.includes(`x${x + step}y${y}`)) px = `x${x + step}y${y}`;
		if (!nx && map.includes(`x${x - step}y${y}`)) nx = `x${x - step}y${y}`;
		if (!py && map.includes(`x${x}y${y + step}`)) py = `x${x}y${y + step}`;
		if (!ny && map.includes(`x${x}y${y - step}`)) ny = `x${x}y${y - step}`;

		// Diagonal neighbors
		if (!pxy && map.includes(`x${x + step}y${y + step}`)) {
			pxy = `x${x + step}y${y + step}`;
		}
		if (!nxy && map.includes(`x${x - step}y${y + step}`)) {
			nxy = `x${x - step}y${y + step}`;
		}
		if (!pxny && map.includes(`x${x + step}y${y - step}`)) {
			pxny = `x${x + step}y${y - step}`;
		}
		if (!nxny && map.includes(`x${x - step}y${y - step}`)) {
			nxny = `x${x - step}y${y - step}`;
		}
	}

	// Add horizontal and vertical neighbors
	if (px) directions.push({ cubemapId: px, loc: [450, 0, 0] });
	if (nx) directions.push({ cubemapId: nx, loc: [-450, 0, 0] });
	if (py) directions.push({ cubemapId: py, loc: [0, 0, 450] });
	if (ny) directions.push({ cubemapId: ny, loc: [0, 0, -450] });

	// Add diagonal neighbors
	if (pxy) directions.push({ cubemapId: pxy, loc: [450, 0, 450] });
	if (nxy) directions.push({ cubemapId: nxy, loc: [-450, 0, 450] });
	if (pxny) directions.push({ cubemapId: pxny, loc: [450, 0, -450] });
	if (nxny) directions.push({ cubemapId: nxny, loc: [-450, 0, -450] });

	return directions;
}

function createNeighborObjects(neighborsIds) {
	return neighborsIds.map((neighbor) => {
		const geometry = new THREE.BoxGeometry(50, 50, 50);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		cube.position.set(...neighbor.loc);
		cube.userData.cubemapId = neighbor.cubemapId;
		scene.add(cube);
		return cube;
	});
}

const geometry = new THREE.BoxGeometry(1752, 1752, 1752);
const cubemap = new THREE.Mesh(geometry, materials);
scene.add(cubemap);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.getElementById("app").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.5;
controls.maxDistance = 6;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
	mouse.x = (event.clientX / width) * 2 - 1;
	mouse.y = -(event.clientY / height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	const firstCubemapId = intersects
		.map((item) => item.object.userData.cubemapId)
		.find((id) => id !== undefined);

	if (firstCubemapId) {
		console.log(firstCubemapId);
		const newMaterials = [
			new THREE.MeshBasicMaterial({
				map: texureLoader.load(`${firstCubemapId}/px.png`),
				side: THREE.BackSide,
			}),
			new THREE.MeshBasicMaterial({
				map: texureLoader.load(`${firstCubemapId}/nx.png`),
				side: THREE.BackSide,
			}),
			new THREE.MeshBasicMaterial({
				map: texureLoader.load(`${firstCubemapId}/py.png`),
				side: THREE.BackSide,
			}),
			new THREE.MeshBasicMaterial({
				map: texureLoader.load(`${firstCubemapId}/ny.png`),
				side: THREE.BackSide,
			}),
			new THREE.MeshBasicMaterial({
				map: texureLoader.load(`${firstCubemapId}/pz.png`),
				side: THREE.BackSide,
			}),
			new THREE.MeshBasicMaterial({
				map: texureLoader.load(`${firstCubemapId}/nz.png`),
				side: THREE.BackSide,
			}),
		];

		cubemap.material = newMaterials;
		for (const neighbor of neighborsObjects) {
			scene.remove(neighbor);
		}
		neighborsObjects = [];
		neighborsIds = [];

		neighborsIds = findNeighbors(firstCubemapId);
		neighborsObjects = createNeighborObjects(neighborsIds);
	}
}
window.addEventListener("click", onMouseClick);

let neighborsIds = findNeighbors(startingCubeId);
let neighborsObjects = createNeighborObjects(neighborsIds);

// DOM EVENT HANLDERS
function onWindowResize() {
	const width = wrapper.clientWidth;
	const height = wrapper.clientHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize);

function onFloorPick(event) {
	const selectedFloorId = event.target.value;

	switch (selectedFloorId) {
		case "z0":
			currentMap = [
				"x2y-1",
				"x1y0",
				"x1y-4",
				"x4y0",
				"x4y1",
				"x1y-1",
				"x3y0",
				"x2y0",
				"x0y0",
				"x4y-1",
			];
	}
	currentFloorId = selectedFloor;
}
document.getElementById("floorSelect").addEventListener("change", onFloorPick);

// ANIMATION LOOP
function animate() {
	controls.update();
	renderer.render(scene, camera);
}
animate();
