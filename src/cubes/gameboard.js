import * as THREE from "three";
import { rubik_colors, color_opt_array } from "./colors";
import { shuffle, isWinningCombination } from "../helper/helper";
import { DragControls } from "three/examples/jsm/controls/DragControls";

let dragControls;
let cubes = [];
let master_cubes = [];
let cubeSize = 1;
const gridCount = 5;
const masterGridCount = 3;
const masterCubeSize = cubeSize/2;

let master_game_map = new Map();
const board_game_map = new Map();

const game_map_row1 = new Map();
const game_map_row2 = new Map();
const game_map_row3= new Map();

const board_game_map_row1 = new Map();
const board_game_map_row2 = new Map();
const board_game_map_row3= new Map();


master_game_map.set(0, game_map_row1 );
master_game_map.set(1, game_map_row2 );
master_game_map.set(2, game_map_row3 );

board_game_map.set(0, board_game_map_row1 );
board_game_map.set(1, board_game_map_row2 );
board_game_map.set(2, board_game_map_row3 );

const syncMasterCubOrder = (master_cubes) => {
    const outObj = master_cubes;

    outObj.forEach(map => {
      const value0 = map.get(0);
      const value2 = map.get(2);

      map.set(0, value2);
      map.set(2, value0);
    })

    return outObj;
}

const generateMasterCubes = (scene) => {
    const master_game_board_group = new THREE.Group();
    const master_cube_geometry = new THREE.BoxGeometry(
      masterCubeSize,
      masterCubeSize,
      0.1
    );

    let count = 0;
    let i, j;
    
    const randomColors = shuffle(color_opt_array);

    for (i = 0; i < masterGridCount; i++) {
      for (j = 0; j < masterGridCount; j++) {
        let material = new THREE.MeshBasicMaterial({
          color: randomColors[count],
        });
        const cube = new THREE.Mesh(master_cube_geometry, material);
        cube.position.x = -1 * i * masterCubeSize;
        cube.position.y = -1 * j * masterCubeSize;
        master_cubes.push(cube);
        master_game_board_group.add(cube);

        const game_row = master_game_map.get(i);
        game_row.set(j, randomColors[count])
        count++;
      }
    }
    
    master_game_map = syncMasterCubOrder(master_game_map);
    master_game_board_group.position.x = 10;
    master_game_board_group.position.y = 0;
    scene.add(master_game_board_group);
};


const generateGameboardCubes = (scene, camera, renderer, controls) => {
    const game_pieces = new THREE.Group();
    const cube_geometry = new THREE.BoxGeometry(
      cubeSize,
      cubeSize,
      0.1
    );

    const doubleCubeSize = cubeSize * 2;
    let count = 0;
    let i, j;
    
    const randomColors = shuffle(color_opt_array);

    for (i = 0; i < gridCount; i++) {
      for (j = 0; j < gridCount; j++) {

        let material = new THREE.MeshBasicMaterial({
          color: rubik_colors[randomColors[count]],
        });
        
        const cube = new THREE.Mesh(cube_geometry, material);
        cube.position.x = -1 * i + cubeSize * 2;
        cube.position.y = -1 * j + cubeSize * 2;
        cube.userData.id = `${i}${j}`;
        cube.userData.color = randomColors[count];
        cube.userData.intersects = [];
        cube.userData.position = cube.position.clone();

        cube.userData.update = ($this) => {
          let cube_limit = {};

          if ($this.userData.intersects.length > 0) {
            let dataIntersects = $this.userData.intersects;

            const TopLimit = dataIntersects.find((obj) =>
              Object.keys(obj).includes("T")
            );
            const RightLimit = dataIntersects.find((obj) =>
              Object.keys(obj).includes("R")
            );
            const BottomLimit = dataIntersects.find((obj) =>
              Object.keys(obj).includes("B")
            );
            const LeftLimit = dataIntersects.find((obj) =>
              Object.keys(obj).includes("L")
            );

            const xMin = LeftLimit ? LeftLimit.L : -1 * doubleCubeSize;
            const yMin = BottomLimit ? BottomLimit.B : -1 * doubleCubeSize;
            const xMax = RightLimit ? RightLimit.R : doubleCubeSize;
            const yMax = TopLimit ? TopLimit.T : doubleCubeSize;

            cube_limit.max = new THREE.Vector3(xMax, yMax, 0);
            cube_limit.min = new THREE.Vector3(xMin, yMin, 0);
          } else {
            cube_limit.min = new THREE.Vector3(-1 * doubleCubeSize, -1 * doubleCubeSize, 0);
            cube_limit.max = new THREE.Vector3(doubleCubeSize, doubleCubeSize, 0);
          }
          //
          cube.position.clamp(cube_limit.min, cube_limit.max);
        };

        // prototype
        cube.userData.setColor = (color) => {
          cube.material.color.setHex(color);
        };

        cube.userData.checkMatchGrid = () => {
          const currentBoard = game_pieces.children;

          currentBoard.filter((p) => {
            const piecePosition = p.position.clone();
            const x = Math.round(piecePosition.x);
            const y = Math.round(piecePosition.y);

            const i_whitelist = [0, 1 , -1];
            const j_whitelist = [0, 1, -1];

            if(i_whitelist.includes(x) && j_whitelist.includes(y)){
              // New
              const board_game_row = board_game_map.get(x + 1);
              board_game_row.set(y + 1, p.userData.color);
            }
          })

          if(isWinningCombination(board_game_map, master_game_map)){
            alert(" You Win!");
          }
        }

        cubes.push(cube);

        if (i !== 4 || j !== 4) {
          game_pieces.add(cube);
        }
        count++;
      }
    }

    scene.add(game_pieces);

    /*
       DRAG CONTROLS
     */

    dragControls = new DragControls(cubes, camera, renderer.domElement);

    dragControls.addEventListener("dragstart", function (event) {
      let cube = event.object;
      var originPoint = cube.position.clone();
      const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

      const raycasterLeft = new THREE.Raycaster();
      const rayDirectionLeft = new THREE.Vector3(-2, 0, 0).normalize();

      const raycasterTop = new THREE.Raycaster();
      const rayDirectionTop = new THREE.Vector3(0, 2, 0).normalize();

      const raycasterRight = new THREE.Raycaster();
      const rayDirectionRight = new THREE.Vector3(2, 0, 0).normalize();

      const raycasterBottom = new THREE.Raycaster();
      const rayDirectionBottom = new THREE.Vector3(0, -2, 0).normalize();

      raycasterLeft.set(rayOrigin, rayDirectionLeft);
      raycasterTop.set(rayOrigin, rayDirectionTop);
      raycasterRight.set(rayOrigin, rayDirectionRight);
      raycasterBottom.set(rayOrigin, rayDirectionBottom);

      const instersectsLeft = raycasterLeft
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);
      const instersectsTop = raycasterTop
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);
      const instersectsRight = raycasterRight
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);
      const instersectsBottom = raycasterBottom
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);

      let intersectsResults = [];

      if (instersectsTop.length > 0) {
        const closeIntersections = instersectsTop.filter(
          (intersect) => intersect.distance <= 0.5
        );

        if (closeIntersections.length > 0) {
          intersectsResults.push({ T: originPoint.y });
        } else {
          if (instersectsTop.length > 0) {
            intersectsResults.push({
              T: originPoint.y + instersectsTop[0].distance - cubeSize / 2,
            });
          } else {
            //
          }
        }
      }

      if (instersectsRight.length > 0) {
        const closeIntersections = instersectsRight.filter(
          (intersect) => intersect.distance <= 0.5
        );
        if (closeIntersections.length > 0) {
          intersectsResults.push({ R: originPoint.x });
        } else {
          if (instersectsRight.length > 0) {
            // console.log("instersectsRight =", instersectsRight);
            intersectsResults.push({
              R: originPoint.x + instersectsRight[0].distance - cubeSize / 2,
            });
          }
        }
      }

      if (instersectsBottom.length > 0) {
        const closeIntersections = instersectsBottom.filter(
          (intersect) => intersect.distance <= 0.5
        );

        if (closeIntersections.length > 0) {
          intersectsResults.push({ B: originPoint.y });
        } else {
          if (instersectsBottom.length > 0) {
            intersectsResults.push({
              B: originPoint.y - instersectsBottom[0].distance + cubeSize / 2,
            });
          }
        }
      }

      if (instersectsLeft.length > 0) {
        const closeIntersections = instersectsLeft.filter(
          (intersect) => intersect.distance <= 0.5
        );

        if (closeIntersections.length > 0) {
          intersectsResults.push({ L: originPoint.x });
        } else {
          if (instersectsLeft.length > 0) {
            intersectsResults.push({
              L: originPoint.x - instersectsLeft[0].distance + cubeSize / 2,
            });
          }
        }
      }

      cube.userData.intersects = intersectsResults;
      console.log('intersectsResults => ', intersectsResults)
      cube.userData.update(cube);
      controls.enabled = false;
    });

    dragControls.addEventListener("drag", function (event) {
      let cube = event.object;
      cube.position.z = 0; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
    });

    dragControls.addEventListener("dragend", function (event) {
      // console.log('drag end');
      // event.object.userData.setMetalness(0);
      controls.enabled = true;
      // console.log('event.object.userData.color', event.object.userData);
      // event.object.userData.setColor(rubik_colors[event.object.userData.color]);
      const cube = event.object;
      // cube.userData.position = cube.position.clone();
      cube.userData.checkMatchGrid();
      renderer.render(scene, camera);
    });

    /*
     END DRAG CONTROLS
     */
  };


export { generateMasterCubes, generateGameboardCubes };