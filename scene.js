import * as THREE from "three"; // Import biblioteki Three.js

const scene = new THREE.Scene(); // Tworzenie sceny 3D

// Ustawianie wymiarów okna
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// Konfiguracja kamery (perspektywa, pozycja, punkt obserwacji)
const lookAtTarget = new THREE.Vector3(0, 0, 0);
const camera = new THREE.PerspectiveCamera(
	50,
	windowWidth / windowHeight,
	0.1,
	2000,
);
camera.position.set(3, 1.5, 4);
camera.lookAt(lookAtTarget);

// Tworzenie obiektu służącego do wyświetlenia sceny i dołączenie go do elementu w dokumencie
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(windowWidth, windowHeight);
renderer.setClearColor(0xffffff);
document.getElementById("app").appendChild(renderer.domElement);

// Generowanie szachownicy oraz rozmieszenie jej w scenie
const gridSize = 10;
const squareSize = 1;
const gridGroup = new THREE.Group();

for (let i = 0; i < gridSize; i++) {
	for (let j = 0; j < gridSize; j++) {
		const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
		const color = (i + j) % 2 === 0 ? 0xffffff : 0x000000;
		const material = new THREE.MeshBasicMaterial({
			color,
			side: THREE.DoubleSide,
		});
		const square = new THREE.Mesh(geometry, material);

		square.position.x = (i - gridSize / 2) * squareSize;
		square.position.y = (j - gridSize / 2) * squareSize;

		gridGroup.add(square);
	}
}
gridGroup.rotation.x = -Math.PI / 2;
gridGroup.position.y = -0.01;
scene.add(gridGroup);

// Dodanie oświetlenia w scenie
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Definicja i rozmieszczenie różnych brył
const blocks = [
	{
		geometry: new THREE.BoxGeometry(1, 3, 1),
		material: new THREE.MeshStandardMaterial({ color: 0x0099ff }),
		position: { x: -4, y: 1, z: -4 },
	},
	{
		geometry: new THREE.BoxGeometry(2, 2, 1.5),
		material: new THREE.MeshStandardMaterial({
			color: 0x0000ff,
			metalness: 0.5,
			roughness: 0.1,
		}),
		position: { x: 3.5, y: 0.5, z: -4 },
	},
	{
		geometry: new THREE.BoxGeometry(1, 1.2, 2),
		material: new THREE.MeshStandardMaterial({
			color: 0xffd700,
			emissive: 0x555500,
		}),
		position: { x: -4, y: 1, z: 4 },
	},
	{
		geometry: new THREE.BoxGeometry(1, 1, 1),
		material: new THREE.MeshStandardMaterial({ color: 0xff00ff }),
		position: { x: 3.5, y: 0.75, z: 1.4 },
	},
	{
		geometry: new THREE.BoxGeometry(3, 2, 2),
		material: new THREE.MeshStandardMaterial({ color: 0xffa500 }),
		position: { x: -2, y: 1.5, z: -3.5 },
	},
	{
		geometry: new THREE.BoxGeometry(1.5, 1.5, 0.5),
		material: new THREE.MeshStandardMaterial({
			color: 0x800080,
			emissive: 0x220022,
		}),
		position: { x: -3, y: 1, z: 2 },
	},
	{
		geometry: new THREE.BoxGeometry(2, 1.3, 2),
		material: new THREE.MeshStandardMaterial({ color: 0x00ffff }),
		position: { x: -0.5, y: 0.2, z: -0.5 },
	},
	{
		geometry: new THREE.CylinderGeometry(1, 1.5, 1.3, 8),
		material: new THREE.MeshStandardMaterial({ color: 0xff3300 }),
		position: { x: 3, y: 0.5, z: -1.5 },
	},
	{
		geometry: new THREE.CylinderGeometry(1, 1, 1, 12),
		material: new THREE.MeshStandardMaterial({ color: 0x0033ff }),
		position: { x: -1.4, y: 0.5, z: 3.5 },
	},
];

// Tworzenie siatek i krawędzi dla zdefiniowanych brył
for (const { geometry, material, position } of blocks) {
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(position.x, geometry.parameters.height / 2, position.z);

	if (material.color.getHex() === 0xffd700) {
		mesh.position.y = geometry.parameters.height / 2; // Poprawka dla złotego bloku
	}

	const edges = new THREE.EdgesGeometry(geometry);
	const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
	const line = new THREE.LineSegments(edges, lineMaterial);
	line.position.copy(mesh.position);
	scene.add(line);

	scene.add(mesh);
}

// Funkcja animacji z pojedynczym wywołaniem renderowania
function animate() {
	renderer.render(scene, camera);
}

animate(); // Start renderowania
