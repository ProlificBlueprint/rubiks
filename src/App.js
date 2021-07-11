import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { shuffle, isWinningCombination } from "./helper/helper";
import { rubik_colors, color_opt_array } from "./cubes/colors";
import * as dat from "dat.gui";
const metalTexture = require('./assets/metal.jpg');

console.log(metalTexture);
// debuger
const gui = new dat.GUI({ closed: true });

// global
let camera, dragControls, scene, renderer, appEl;
let controls;
let cubes = [];
let master_cubes = [];

let master_game_map = new Map();
const board_game_map = new Map();

const game_map_row1 = new Map();
const game_map_row2 = new Map();
const game_map_row3 = new Map();

const board_game_map_row1 = new Map();
const board_game_map_row2 = new Map();
const board_game_map_row3 = new Map();


master_game_map.set(0, game_map_row1);
master_game_map.set(1, game_map_row2);
master_game_map.set(2, game_map_row3);

board_game_map.set(0, board_game_map_row1);
board_game_map.set(1, board_game_map_row2);
board_game_map.set(2, board_game_map_row3);

const gridGap = 0.01;
const masterGridGap = 0.001;
const gridCount = 5;
let cubeSize = 1;
const masterCubeSize = cubeSize / 2;
const masterGridCount = 3;

const app_dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    appEl = document.getElementsByClassName("webgl")[0];

    this.init();
    this.bindResize();
  }

  bindResize = () => {
    window.addEventListener("resize", (e) => {
      camera.aspect = app_dimensions.width / app_dimensions.height;
      camera.updateProjectionMatrix();
      renderer.setSize(app_dimensions.width, app_dimensions.height);
    });
  };

  generateMasterCubes = () => {
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

    master_game_map = this.syncMasterCubOrder(master_game_map);
    master_game_board_group.position.x = 4;
    master_game_board_group.position.y = 4;
    scene.add(master_game_board_group);
  };

  syncMasterCubOrder = (master_cubes) => {
    const outObj = master_cubes;

    outObj.forEach(map => {
      const value0 = map.get(0);
      const value2 = map.get(2);

      map.set(0, value2);
      map.set(2, value0);
    })

    return outObj;
  }

  generateGridHelper = () => {
    var standardPlaneNormal = new THREE.Vector3(0, 0, 1);
    var GridHelperPlaneNormal = new THREE.Vector3(0, 1, 0);
    var GridHelperPlaneMaster = new THREE.Vector3(0, 1, 0);

    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(standardPlaneNormal, GridHelperPlaneNormal);

    var master_quaternion = new THREE.Quaternion();
    master_quaternion.setFromUnitVectors(standardPlaneNormal, GridHelperPlaneMaster);

    var largeGridGuide = new THREE.GridHelper(10, 10);
    largeGridGuide.rotation.setFromQuaternion(quaternion);

    // let game_piecesGuide = new THREE.GridHelper(3, 3, "aqua", "aqua");
    // game_piecesGuide.position.x = 4;
    // game_piecesGuide.position.y = 4;
    // game_piecesGuide.rotation.setFromQuaternion(quaternion);

    scene.add(largeGridGuide);
    // scene.add(game_piecesGuide);
  }

  animation = (_time) => {
    cubes.forEach((o) => {
      o.userData.update(o);
    });

    // const radius = 10;
    // const angle = 0;
    // camera.position.x = radius * Math.cos( angle );
    // camera.position.y = radius * Math.cos( angle );
    controls.update();
    renderer.render(scene, camera);
  };

  generateCubes = () => {
    const game_pieces = new THREE.Group();
    const cube_geometry = new THREE.BoxGeometry(
      cubeSize - gridGap,
      cubeSize - gridGap,
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

            const i_whitelist = [0, 1, -1];
            const j_whitelist = [0, 1, -1];

            if (i_whitelist.includes(x) && j_whitelist.includes(y)) {
              // New
              const board_game_row = board_game_map.get(x + 1);
              board_game_row.set(y + 1, p.userData.color);
            }
          })

          if (isWinningCombination(board_game_map, master_game_map)) {
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

    // gui.add(game_pieces.position, "x", 0).name("grid x");
    // gui.add(game_pieces.position, "y", 0).name("grid y");
    scene.add(game_pieces);

    /*
       DRAG CONTROLS
     */

    dragControls = new DragControls(cubes, camera, renderer.domElement);

    dragControls.addEventListener("dragstart", function (event) {
      // affect obj
      // event.object.userData.setColor('0xff0000');

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
        .filter((mesh) => mesh.object.userData.color != undefined);
      const instersectsTop = raycasterTop
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color != undefined);
      const instersectsRight = raycasterRight
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color != undefined);
      const instersectsBottom = raycasterBottom
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color != undefined);

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

  init = () => {
    camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );

    camera.position.z = 10;
    scene = new THREE.Scene();
    camera.lookAt(scene.position);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setAnimationLoop(this.animation);
    //
    controls = new OrbitControls(camera, appEl);
    controls.enableDamping = true;
    // gsap.to(cube1.position, { duration: 1, delay: 1, x: 2})
    this.generateCubes();
    this.generateMasterCubes();
    this.generateGridHelper();

    appEl.appendChild(renderer.domElement);
  };

  render() {
    return (
      <>
        <div className="webgl"></div>
      </>
    );
  }
}

export default App;
