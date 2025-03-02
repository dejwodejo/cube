import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const cubemapsData = {
  z0: {
    points: ["x3y3", "x-3y9", "x6y9", "x-3y6", "x0y3", "x3y0", "x3y6", "x0y0", "x0y9",
            "x3y9", "x3y-3", "x0y6", "x4y-3", "x6y6"],
  },
  z4: {
    points: ['x26y0', 'x6y2', 'x20y2', 'x16y0', 'x18y2', 'x22y0', 'x10y2', 'x16y4', 'x4y0',
             'x24y2', 'x22y4', 'x12y4', 'x14y2', 'x4y4', 'x8y0', 'x2y2', 'x0y0', 'x12y0',
             'x8y4', 'x26y4'],
  },
  z5: {
    points: ['x1y0', 'x1y-1', 'x0y-3', 'x5y0', 'x0y-5', 'x4y0', 'x8y0', 'x6y0', 'x9y0',
             'x2y0', 'x0y0', 'x0y-4', 'x7y0'],
  }
};

const defaultFloor = "z0"
const defaultPoint = "x0y0"

// --- MAP MANAGEMENT\
let currentPointId = defaultPoint;
let currentFloorId = defaultFloor;
let currentMap = cubemapsData[defaultFloor].points

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
        texureLoader.setPath("public/");
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
            const materials = createCubeFaceMaterials(currentFloorId, currentPointId);
            cubemap.material = materials;

            const neighboursIds = findNeighbours(currentPointId);

            if (neighbourDirectionObjects.length !== 0) {
                deleteNeighbourObjects(neighbourDirectionObjects);
                neighbourDirectionObjects = [];
            }

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
            if (neighbourDirectionObjects.length !== 0) {
                deleteNeighbourObjects(neighbourDirectionObjects);
                neighbourDirectionObjects = [];
            }

            const selectedFloorId = event.target.value;

            currentFloorId = selectedFloorId;
            currentMap = cubemapsData[selectedFloorId].points

            const materials = createCubeFaceMaterials(currentFloorId, currentPointId);
            cubemap.material = materials;

            const neighboursIds = findNeighbours(currentPointId);
            neighbourDirectionObjects = createNeighbourObjects(neighboursIds);
        }
        document.getElementById("floorSelect").addEventListener("change", onFloorPick);

        // ANIMATION LOOP
        function animate() {
            controls.update();
            renderer.render(scene, camera);
        }
        animate();