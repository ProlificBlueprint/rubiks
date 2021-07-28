import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import * as _ from 'lodash';
// import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { shuffle, isWinningCombination } from "./helper/helper";
import { rubik_colors, color_opt_array } from "./cubes/colors";
import { getDraggableIntersectionsOfSelectedSq, getAvailableSqByDirection } from './helper/intersects';
import {generateGameboardCubes, generateMasterCubes} from './cubes/gameboard';
import { generateMasterCubeDisplay } from './controls/controls';

// debuger
// const gui = new dat.GUI({ closed: true });

// global
let camera, dragControls, scene, renderer, appEl;
let controls;
let cubes = [];
let masterCubes = [];
let masterCubesHTML;
let gamePieces;

let masterGameMap = new Map();
const boardGameMap = new Map();

const game_map_row1 = new Map();
const game_map_row2 = new Map();
const game_map_row3 = new Map();

const boardGameMap_row1 = new Map();
const boardGameMap_row2 = new Map();
const boardGameMap_row3 = new Map();

masterGameMap.set(0, game_map_row1);
masterGameMap.set(1, game_map_row2);
masterGameMap.set(2, game_map_row3);

boardGameMap.set(0, boardGameMap_row1);
boardGameMap.set(1, boardGameMap_row2);
boardGameMap.set(2, boardGameMap_row3);

const gridCount = 5;
let cubeSize = 1;
const masterCubeSize = cubeSize / 2;
const masterGridCount = 3;

class App extends Component {
  constructor() {
    super();
    this.state = {
      masterCubeArr: []
    };
  }

  componentDidMount() {
    appEl = document.getElementsByClassName("webgl")[0];
    this.init();
    this.bindResize();
    this.bindKeyPress();
  }

  bindKeyPress = () => {
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      
      let isAnimating = false;

      if (!this.debouncedFn) {
        this.debouncedFn = _.debounce((key) => {
          switch (key) {
            case 'ArrowLeft': // left
              getAvailableSqByDirection(cubes, "L");
              this.checkCombinationMatches();
              isAnimating = false;
              break;

            case 'ArrowUp': // up
              getAvailableSqByDirection(cubes, "T");
              this.checkCombinationMatches();
              isAnimating = false;
              break;

            case 'ArrowRight': // right
              getAvailableSqByDirection(cubes, "R");
              this.checkCombinationMatches();
              isAnimating = false;
              break;

            case 'ArrowDown': // down
              getAvailableSqByDirection(cubes, "B");
              this.checkCombinationMatches();
              isAnimating = false;
              break;

            default: return; // exit this handler
          }
        }, 100);
      }

      if(!isAnimating) {
        isAnimating = true;
        this.debouncedFn(e.key);
      }
      
    });
  }

  bindResize = () => {
    window.addEventListener("resize", (e) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  generateMasterCubes = () => {
    const masterGameBoardGroup = new THREE.Group();
    const masterCubeGeometry = new THREE.BoxGeometry(
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
        const cube = new THREE.Mesh(masterCubeGeometry, material);
        cube.position.x = -1 * i * masterCubeSize;
        cube.position.y = -1 * j * masterCubeSize;
        masterCubes.push(cube);
        // masterGameBoardGroup.add(cube);

        const gameRow = masterGameMap.get(i);
        gameRow.set(j, randomColors[count])
        count++;
      }
    }

    // update for faster comparison
    masterGameMap = this.syncMasterCubeOrder(masterGameMap);
    const cubeArr = generateMasterCubeDisplay(masterGameMap);
    this.setState({ masterCubeArr : cubeArr });

    // masterGameBoardGroup.position.x = .5;
    // masterGameBoardGroup.position.y = 8;
    // scene.add(masterGameBoardGroup);
  };

  syncMasterCubeOrder = (masterCubes) => {
    const outObj = masterCubes;

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

    var masterQuaternion = new THREE.Quaternion();
    masterQuaternion.setFromUnitVectors(standardPlaneNormal, GridHelperPlaneMaster);

    var largeGridGuide = new THREE.GridHelper(10, 10);
    largeGridGuide.rotation.setFromQuaternion(quaternion);

    scene.add(largeGridGuide);
  }

  animation = (_time) => {
    cubes.forEach((o) => {
      o.userData.update(o);
    });

    controls.update();
    renderer.render(scene, camera);
  };

  checkCombinationMatches = () => {
    gamePieces.children.filter((p) => {
      const piecePos = p.position.clone();
      const x = Math.round(piecePos.x);
      const y = Math.round(piecePos.y);
      const whitelist = [0, 1, -1];

      if (whitelist.includes(x) && whitelist.includes(y)) {
        const currentBoardRow = boardGameMap.get(x + 1);
        currentBoardRow.set(y + 1, p.userData.color);
      }
    })
    
    if (isWinningCombination(boardGameMap, masterGameMap)) {
      console.log(" You Win!");
    }
  }

  generateCubes = () => {
    gamePieces = new THREE.Group();
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

        // prototype
        cube.userData.update = ($this) => {
          let cube_limit = {};

          if ($this.userData.intersects.length > 0) {
            let dataIntersects = $this.userData.intersects;

            const TopLimit = dataIntersects.find((obj) => Object.keys(obj).includes("T"));
            const RightLimit = dataIntersects.find((obj) => Object.keys(obj).includes("R"));
            const BottomLimit = dataIntersects.find((obj) => Object.keys(obj).includes("B"));
            const LeftLimit = dataIntersects.find((obj) => Object.keys(obj).includes("L"));

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

        cube.userData.setColor = (color) => {
          cube.material.color.setHex(color);
        };

        cube.userData.checkCombinationMatches = () => {
          this.checkCombinationMatches();
        }

        cubes.push(cube);

        if (i !== 4 || j !== 4) {
          gamePieces.add(cube);
        }

        count++;
      }
    }

    scene.add(gamePieces);

    /*
       DRAG CONTROLS
     */

    dragControls = new DragControls(cubes, camera, renderer.domElement);

    dragControls.addEventListener("dragstart", function (event) {
      // affect obj
      // event.object.userData.setColor('0xff0000');

      let cube = event.object;
      var originPoint = cube.position.clone();

      cube.userData.intersects = getDraggableIntersectionsOfSelectedSq(originPoint, cubes);
      cube.userData.update(cube);
      controls.enabled = false;
    });

    dragControls.addEventListener("drag", function (event) {
      let cube = event.object;
      cube.position.z = 0; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
    });

    dragControls.addEventListener("dragend", function (event) {
      controls.enabled = true;
      renderer.render(scene, camera);
      
    });

    /*
     END DRAG CONTROLS
     */
  };

  init = () => {
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.z = 10;
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setAnimationLoop(this.animation);

    controls = new OrbitControls(camera, appEl);
    controls.enableDamping = true;
    
    this.generateCubes();
    
    // generateGameboardCubes(scene, camera, renderer, controls);
    this.generateMasterCubes(scene);
    // this.generateGridHelper();
    
    appEl.appendChild(renderer.domElement);
  };

  render() {
    return (
      <>
        <div className="gameControls">
            <div className="masterGrid">
              {this.state.masterCubeArr ? this.state.masterCubeArr.map((color, i) => {
                console.log("Color : ", color);
                return <div key={i} className={color}></div>
              }) : 'Loading'}
              {/* <div className={masterCubeArr[5]}></div>
              <div className={masterCubeArr[2]}></div>
      
              <div className={masterCubeArr[7]}></div>
              <div className={masterCubeArr[4]}></div>
              <div className={masterCubeArr[1]}></div>
      
              <div className={masterCubeArr[6]}></div>
              <div className={masterCubeArr[3]}></div>
              <div className={masterCubeArr[0]}></div> */}
          </div>
        </div>
        <div className="webgl"></div>
      </>
    );
  }
}

export default App;
