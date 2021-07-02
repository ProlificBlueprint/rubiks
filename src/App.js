import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { shuffle, isMatch } from "./helper";
import * as dat from "dat.gui";

const metalTexture = require('./assets/metal.jpg');

console.log(metalTexture)
// debuger
const gui = new dat.GUI({ closed: true });

// global var
let camera, dragControls, scene, renderer, appEl;
let controls, cubes, master_cubes;
const gridGap = 0.01;
const masterGridGap = 0.001;
const gridCount = 5;
let cubeSize = 1;
const masterCubeSize = cubeSize/2;
const masterGridCount = 3;

const rubik_colors = {
  blue: 0x0000ff,
  white: 0xffffff,
  yellow: 0xffff00,
  orange: 0xffa500,
  green: 0x008000,
  red: 0xff0000,
};

const color_opt_array = [
  "blue",
  "blue",
  "blue",
  "blue",
  "white",
  "white",
  "white",
  "white",
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  "orange",
  "orange",
  "orange",
  "orange",
  "green",
  "green",
  "green",
  "green",
  "red",
  "red",
  "red",
  "red",
];

const app_dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};




class App extends Component {
  constructor() {
    super();
    this.state = {
      master_cube_selection: {
        0 : {},
        1: {},
        2: {}
      }
    };
  }

  componentDidMount() {
    appEl = document.getElementsByClassName("webgl")[0];

    this.init();
    this.bindMouse();
    this.bindResize();
  }

  componentWillUnmount() {}

  bindResize = () => {
    window.addEventListener("resize", (e) => {
      camera.aspect = app_dimensions.width / app_dimensions.height;
      camera.updateProjectionMatrix();
      renderer.setSize(app_dimensions.width, app_dimensions.height);
    });
  };

  bindMouse = () => {
    // window.addEventListener('mousemove', (e) => {})
  };

  generateMasterCubes = () => {
    console.log("master cube");

    const master_game_board = new THREE.Group();
    master_cubes = [];
    let count = 0;
    let i, j;
    const master_cube_geometry = new THREE.BoxGeometry(
      masterCubeSize,
      masterCubeSize,
      0.1
    );
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
        master_game_board.add(cube);

        this.state.master_cube_selection[i][j] = randomColors[count];
        this.setState({ master_cube_selection : { ...this.state.master_cube_selection}  })
        
        count++;
      }
    }
    
    master_game_board.position.x = 4;
    master_game_board.position.y = 4;
    scene.add(master_game_board);
  };

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
    cubes = [];
    const cub2 = cubeSize * 2;
    let count = 0;
    let i, j;
    const cube_geometry = new THREE.BoxGeometry(
      cubeSize - gridGap,
      cubeSize - gridGap,
      0.1
    );
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

            const xMin = LeftLimit ? LeftLimit.L : -1 * cub2;
            const yMin = BottomLimit ? BottomLimit.B : -1 * cub2;
            const xMax = RightLimit ? RightLimit.R : cub2;
            const yMax = TopLimit ? TopLimit.T : cub2;

            cube_limit.max = new THREE.Vector3(xMax, yMax, 0);
            cube_limit.min = new THREE.Vector3(xMin, yMin, 0);
          } else {
            cube_limit.min = new THREE.Vector3(-1 * cub2, -1 * cub2, 0);
            cube_limit.max = new THREE.Vector3(cub2, cub2, 0);
          }

          //
          cube.position.clamp(cube_limit.min, cube_limit.max);
        };

        // prototype
        cube.userData.setColor = (color) => {
          cube.material.color.setHex(color);
        };

        cube.userData.checkMatchGrid = () => {
          const { master_cube_selection } = this.state;
          let gameboard_selection = {
            0 : {},
            1: {},
            2: {}
          };

          const currentBoard = game_pieces.children;
          console.log(game_pieces.children);

          currentBoard.filter((p) => {
            const piecePosition = p.position.clone();
            const x = Math.round(piecePosition.x);
            const y = Math.round(piecePosition.y);

            const whitelist = ['00', '10', '-10', '11', '01', '-11', '1-1', '0-1', '-1-1'];
            if(whitelist.includes(JSON.stringify(x)+JSON.stringify(y))){
              gameboard_selection[x + 1][y + 1] = p.userData.color;
            }
          })

          if(isMatch(master_cube_selection, gameboard_selection)){
            alert(" You Win!")
          }
        }

        cubes.push(cube);

        if (i !== 4 || j !== 4) {
          game_pieces.add(cube);
        }


        count++;
      }
    }

    gui.add(game_pieces.position, "x", 0).name("grid x");
    gui.add(game_pieces.position, "y", 0).name("grid y");
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
        // scene.add(
        //   new THREE.ArrowHelper(
        //     raycasterLeft.ray.direction,
        //     raycasterLeft.ray.origin,
        //     500,
        //     0xff0000
        //   )
        // );
        // scene.add(
        //   new THREE.ArrowHelper(
        //     raycasterTop.ray.direction,
        //     raycasterTop.ray.origin,
        //     500,
        //     0xff0000
        //   )
        // );
        // scene.add(
        //   new THREE.ArrowHelper(
        //     raycasterRight.ray.direction,
        //     raycasterRight.ray.origin,
        //     500,
        //     0xff0000
        //   )
        // );
        // scene.add(
        //   new THREE.ArrowHelper(
        //     raycasterBottom.ray.direction,
        //     raycasterBottom.ray.origin,
        //     500,
        //     0xff0000
        //   )
        // );
      

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
