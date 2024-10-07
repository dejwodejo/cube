import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const scene = new THREE.Scene();

const loader = new THREE.CubeTextureLoader();
loader.setPath('/textures/')

const format = '.png';
const textures = [
  `posx${format}`,
  `negx${format}`,
  `posy${format}`,
  `negy${format}`,
  `posz${format}`,
  `negz${format}`,
];
const textureCube = loader.load(textures);
scene.background = textureCube;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop(animate)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)


const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.5;
controls.maxDistance = 6;

function animate() {
  renderer.render(scene, camera);
}