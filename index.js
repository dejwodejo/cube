import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// SETUP
// --- MAP MANAGEMENT
let currentPointId = "x0y0";
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
const scene = new THREE.Scene();
const wrapper = document.getElementById("app");
let neighbourDirectionObjects = [];

// Camera
const width = wrapper.clientWidth;
const height = wrapper.clientHeight;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
camera.position.set(-1, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
wrapper.appendChild(renderer.domElement);

// Cubemap
const texureLoader = new THREE.TextureLoader();
texureLoader.setPath("/");
const cubeGeometry = new THREE.BoxGeometry(1752, 1752, 1752);
const cubemap = new THREE.Mesh(cubeGeometry);

// Controls (moving camera)
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.5;
controls.maxDistance = 6;

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function createCubeFaceMaterials(floorId, cubemapId) {
	return [
		new THREE.MeshBasicMaterial({
			map: texureLoader.load(`${floorId}/${cubemapId}/px.png`),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: texureLoader.load(`${floorId}/${cubemapId}/nx.png`),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: texureLoader.load(`${floorId}/${cubemapId}/py.png`),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: texureLoader.load(`${floorId}/${cubemapId}/ny.png`),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: texureLoader.load(`${floorId}/${cubemapId}/pz.png`),
			side: THREE.BackSide,
		}),
		new THREE.MeshBasicMaterial({
			map: texureLoader.load(`${floorId}/${cubemapId}/nz.png`),
			side: THREE.BackSide,
		}),
	];
}

function findNeighbours(point) {
	const x = Number.parseInt(point.match(/x(-?\d+)/)[1], 10);
	const y = Number.parseInt(point.match(/y(-?\d+)/)[1], 10);

	const directions = [];

	let px; // positive x
	let nx; // negative x
	let py; // positive y
	let ny; // negative y
	let pxpy; // positive x, positive y
	let nxpy; // negative x, positive y
	let pxny; // positive x, negative y
	let nxny; // negative x, negative y

	for (let step = 1; step <= 3; step++) {
		// Updated break condition with new names
		if (px && nx && py && ny && pxpy && nxpy && pxny && nxny) break;

		// Horizontal and vertical neighbors (unchanged)
		if (!px && currentMap.includes(`x${x + step}y${y}`))
			px = `x${x + step}y${y}`;
		if (!nx && currentMap.includes(`x${x - step}y${y}`))
			nx = `x${x - step}y${y}`;
		if (!py && currentMap.includes(`x${x}y${y + step}`))
			py = `x${x}y${y + step}`;
		if (!ny && currentMap.includes(`x${x}y${y - step}`))
			ny = `x${x}y${y - step}`;

		// Diagonal neighbors - fixed variable names
		if (!pxpy && currentMap.includes(`x${x + step}y${y + step}`)) {
			pxpy = `x${x + step}y${y + step}`;
		}
		if (!nxpy && currentMap.includes(`x${x - step}y${y + step}`)) {
			nxpy = `x${x - step}y${y + step}`; // Fixed from 'nxy' to 'nxpy'
		}
		if (!pxny && currentMap.includes(`x${x + step}y${y - step}`)) {
			pxny = `x${x + step}y${y - step}`;
		}
		if (!nxny && currentMap.includes(`x${x - step}y${y - step}`)) {
			nxny = `x${x - step}y${y - step}`;
		}
	}

	// Add horizontal and vertical neighbors
	const arrowy = -200;
	const radians45deg = Math.PI / 4;
	if (px) directions.push({ cubemapId: px, loc: [450, arrowy, 0] });
	if (nx)
		directions.push({
			cubemapId: nx,
			loc: [-450, arrowy, 0],
			rotation: Math.PI,
		});
	if (py)
		directions.push({
			cubemapId: py,
			loc: [0, arrowy, 450],
			rotation: Math.PI / 2,
		});
	if (ny)
		directions.push({
			cubemapId: ny,
			loc: [0, arrowy, -450],
			rotation: 6 * radians45deg,
		});

	// Add diagonal neighbors
	if (pxpy)
		directions.push({
			cubemapId: pxpy,
			loc: [450, arrowy, 450],
			rotation: radians45deg,
		});
	if (nxny)
		directions.push({
			cubemapId: nxny,
			loc: [-450, arrowy, -450],
			rotation: 5 * radians45deg,
		});
	if (pxny)
		directions.push({
			cubemapId: pxny,
			loc: [450, arrowy, -450],
			rotation: 7 * radians45deg,
		});
	if (nxpy)
		directions.push({
			cubemapId: nxpy,
			loc: [-450, arrowy, 450],
			rotation: 3 * radians45deg,
		});

	return directions;
}

function createNeighbourObjects(neighboursIds) {
	return neighboursIds.map((neighbour) => {
		const geometry = new THREE.PlaneGeometry(64, 64);
		const texture = texureLoader.load("arrow.png");
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide,
			transparent: true,
			alphaTest: 0.5,
		});

		const plane = new THREE.Mesh(geometry, material);
		plane.position.set(...neighbour.loc);
		plane.rotation.x = Math.PI / 2;

		if (neighbour.rotation) plane.rotation.z = neighbour.rotation;

		plane.userData.cubemapId = neighbour.cubemapId;
		scene.add(plane);
		return plane;
	});
}

function deleteNeighbourObjects(neighbours) {
	for (const neighbour of neighbours) {
		scene.remove(neighbour);
	}
}

function onMouseClick(event) {
	mouse.x = (event.clientX / width) * 2 - 1;
	mouse.y = -(event.clientY / height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	const cubemapIdToGo = intersects
		.map((item) => item.object.userData.cubemapId)
		.find((id) => id !== undefined);

	if (cubemapIdToGo) {
		currentPointId = cubemapIdToGo;

		deleteNeighbourObjects(neighbourDirectionObjects);
		neighbourDirectionObjects = [];

		const cubemapMaterials = createCubeFaceMaterials(
			currentFloorId,
			currentPointId,
		);
		cubemap.material = cubemapMaterials;

		const neighboursIds = findNeighbours(currentPointId);
		neighbourDirectionObjects = createNeighbourObjects(neighboursIds);
	}
}
window.addEventListener("click", onMouseClick);

// DOM EVENT HANLDERS
function onLoad() {
	currentFloorId = "z0";
	currentPointId = "x0y0";
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

	const materials = createCubeFaceMaterials(currentFloorId, currentPointId);
	cubemap.material = materials;

	const neighboursIds = findNeighbours(currentPointId);

	if (neighbourDirectionObjects.length !== 0) neighbourDirectionObjects = [];
	neighbourDirectionObjects = createNeighbourObjects(neighboursIds);

	scene.add(cubemap);
}
window.addEventListener("load", onLoad);

function onWindowResize() {
	const width = wrapper.clientWidth;
	const height = wrapper.clientHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize);

function onFloorPick(event) {
	currentPointId = "x0y0";
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

			break;
		case "z1" || "z2" || "z3" || "z4" || "z5":
			currentMap = [
				"x1y0",
				"x4y0",
				"x9y0",
				"x3y0",
				"x7y0",
				"x5y0",
				"x8y0",
				"x2y0",
				"x0y0",
				"x6y0",
			];
	}
	currentFloorId = selectedFloorId;
}
document.getElementById("floorSelect").addEventListener("change", onFloorPick);

// ANIMATION LOOP
function animate() {
	controls.update();
	renderer.render(scene, camera);
}
animate();
