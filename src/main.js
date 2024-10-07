import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000 // Zwiększono zasięg widoczności kamery
);
camera.position.z = 4;

const scene = new THREE.Scene();

// Inicjalizacja loadera
const loader = new THREE.TextureLoader();
//loader.setPath('/textures/');

const materials = [
  new THREE.MeshBasicMaterial({ map: loader.load('/textures/posx.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loader.load('/textures/negx.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loader.load('/textures/posy.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loader.load('/textures/negy.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loader.load('/textures/posz.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: loader.load('/textures/negz.png'), side: THREE.BackSide }),
];

const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
const skybox = new THREE.Mesh(geometry, materials);
scene.add(skybox);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.5;
controls.maxDistance = 6;

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

// Inicjalizacja Raycastera i wektora myszy
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Normalizowanie pozycji myszy
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Ustawienie promienia
  raycaster.setFromCamera(mouse, camera);

  // Sprawdzenie przecięć
  const intersects = raycaster.intersectObject(skybox);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const faceIndex = intersect.face.materialIndex;

    const texturesNames = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];
    const clickedTexture = texturesNames[faceIndex];

    console.log(`Kliknięto w teksturę: ${clickedTexture}`);

	if (clickedTexture === 'posx') {
		const temp = '/cube_img_500/'
		const newMaterials = [
			new THREE.MeshBasicMaterial({ map: loader.load(`${temp}posx.png`), side: THREE.BackSide }),
			new THREE.MeshBasicMaterial({ map: loader.load(`${temp}negx.png`), side: THREE.BackSide }),
			new THREE.MeshBasicMaterial({ map: loader.load(`${temp}posy.png`), side: THREE.BackSide }),
			new THREE.MeshBasicMaterial({ map: loader.load(`${temp}negy.png`), side: THREE.BackSide }),
			new THREE.MeshBasicMaterial({ map: loader.load(`${temp}posz.png`), side: THREE.BackSide }),
			new THREE.MeshBasicMaterial({ map: loader.load(`${temp}negz.png`), side: THREE.BackSide }),
		];

		skybox.material = newMaterials
	}
  }
}

window.addEventListener('click', onMouseClick, false);
