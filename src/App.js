import React, { Component } from "react";
import "./styles/App.scss";
import * as THREE from "three";
import * as _ from "lodash";

import { FiMenu } from "react-icons/fi";

// import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { DragControls } from "three/examples/jsm/controls/DragControls";

import {
  shuffle,
  isWinningCombination,
  generateMasterCubes,
  moveAvailableSqByDirection,
} from "./helper";
import { rubik_colors, color_opt_array, rubik_matcaps } from "./cubes/colors";
import Time from "./components/time";
import Controls from "./components/controls";

// debuger
// const gui = new dat.GUI({ closed: true });

// global
let camera, scene, renderer, appEl;
let controls;
let cubes = [];
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

let cubeSize = 1;
const gridCount = 5;

const fontLoader = new THREE.FontLoader();
const textureLoader = new THREE.TextureLoader();

const matcapTexture = textureLoader.load('/matcaps/bluesteel256px.png');

fontLoader.load("/fonts/Avenir_Roman_Bold.json", (font) => {
  console.log("font loaded.. .");
  const bevelSize = 0.02;
  const bevelThickness = 0.03;
  const text_geometry = new THREE.TextBufferGeometry("3 2 1", {
    font,
    color: 0xffa500,
    size: 0.5,
    height: 0.2,
    curveSegments: 7,
    bevelEnabled: true,
    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  text_geometry.center();

  const text_material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  const text = new THREE.Mesh(text_geometry, text_material);
  text.position.z = 2;
  // scene.add(text);
});




class App extends Component {
  constructor() {
    super();
    this.state = {
      isClockRunning: false,
      clock: 0,
      masterCubeArr: [],
      gamneCubes: [],
      moveCount: 0,
      isGameComplete: false,
      isMenuOpen: false,
    };
  }

  componentDidMount() {
    appEl = document.getElementsByClassName("webgl")[0];
    this.init();
    this.bindResize();
    this.bindKeyPress();
  }

  animation = (_time) => {
    cubes.forEach((o) => {
      o.userData.update(o);
    });

    controls.update();
    renderer.render(scene, camera);
  };

  bindResize = () => {
    window.addEventListener("resize", (e) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  bindKeyPress = () => {
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      const dir = e.key;
      this.moveGamePieceByDirection(dir);
    });
  };

  directionalButtonPress = (e) => {
    e.preventDefault();
    const dir = e.target.getAttribute("data-direction");
    this.moveGamePieceByDirection(dir);
  };

  generateMasterCubes = () => {
    const cubeArr = generateMasterCubes(masterGameMap);
    this.setState({ masterCubeArr: cubeArr });
  };

  startClock = () => {
    if (!this.state.isClockRunning) {
      this.setState({ isClockRunning: true });
    }
  };

  updateParentClockOnComplete = (time) => {
    this.setState({ clock: time, isClockRunning: false });
  };

  moveGamePieceByDirection = (arrowDirection) => {
    let isAnimating = false;

    switch (arrowDirection) {
      case "ArrowLeft":
        break;
      case "ArrowUp":
        this.setState({ isAnimatingUp: true });
        break;
      default:
        break; // exit this handler
    }

    if (!this.debouncedFn) {
      this.debouncedFn = _.debounce((key) => {
        switch (key) {
          case "ArrowLeft": // left
            moveAvailableSqByDirection(cubes, "L");
            this.setState({ moveCount: this.state.moveCount + 1 });
            isAnimating = false;
            break;

          case "ArrowUp": // up
            this.setState({ moveCount: this.state.moveCount + 1 });
            moveAvailableSqByDirection(cubes, "T");
            isAnimating = false;
            break;

          case "ArrowRight": // right
            moveAvailableSqByDirection(cubes, "R");
            this.setState({ moveCount: this.state.moveCount + 1 });
            isAnimating = false;
            break;

          case "ArrowDown": // down
            moveAvailableSqByDirection(cubes, "B");
            this.setState({ moveCount: this.state.moveCount + 1 });
            isAnimating = false;
            break;

          default:
            return; // exit this handler
        }
      }, 110);
    }

    if (!isAnimating) {
      isAnimating = true;
      this.debouncedFn(arrowDirection);
    }

    this.startClock();
  };

  checkCombinationMatches = () => {
    gamePieces.children.forEach((p) => {
      const piecePos = p.position.clone();
      const x = Math.round(piecePos.x);
      const y = Math.round(piecePos.y);
      const whitelist = [0, 1, -1];

      if (whitelist.includes(x) && whitelist.includes(y)) {
        // get current center of board game map
        boardGameMap.get(x + 1).set(y + 1, p.userData.color);
      }
      return null;
    });

    if (isWinningCombination(boardGameMap, masterGameMap)) {
      this.setState({ isGameComplete: true });
      console.log(
        " You Win! moves : " + this.state.moveCount + " / Time : ",
        this.state.clock
      );
    }
  };

  generateCubes = () => {
    gamePieces = new THREE.Group();

    const doubleCubeSize = cubeSize * 2;
    let count = 0;
    let i, j;

    const randomColors = shuffle(color_opt_array);

    for (i = 0; i < gridCount; i++) {
      for (j = 0; j < gridCount; j++) {

        // TODO matcap
        let matcap_material = new THREE.MeshMatcapMaterial({ matcap: rubik_matcaps[randomColors[count]], });
        // let material = new THREE.MeshBasicMaterial({
        //   color: rubik_colors[randomColors[count]],
        // });

        let cube_geometry;
        let xPos = -1 * i + cubeSize * 2;
        let yPos = -1 * j + cubeSize * 2;

        cube_geometry = new THREE.BoxGeometry(cubeSize, cubeSize, 0.1);

        // let isX = xPos === 1 || xPos === 0 || xPos === -1;
        // let isY = yPos === 1 || yPos === 0 || yPos === -1;

        // if(isX && isY){
        //   cube_geometry = new THREE.BoxGeometry(
        //     cubeSize,
        //     cubeSize,
        //     0.5
        //   );
        // } else {
        //   cube_geometry = new THREE.BoxGeometry(
        //     cubeSize,
        //     cubeSize,
        //     0.1
        //   );
        // }

        const cube = new THREE.Mesh(cube_geometry, matcap_material);
        cube.position.x = xPos;
        cube.position.y = yPos;
        cube.userData.id = `${i}${j}`;
        cube.userData.color = randomColors[count];
        cube.userData.intersects = [];
        cube.userData.position = cube.position.clone();

        // prototype
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
            cube_limit.min = new THREE.Vector3(
              -1 * doubleCubeSize,
              -1 * doubleCubeSize,
              0
            );
            cube_limit.max = new THREE.Vector3(
              doubleCubeSize,
              doubleCubeSize,
              0
            );
          }

          //
          cube.position.clamp(cube_limit.min, cube_limit.max);
        };

        cube.userData.setColor = (color) => {
          cube.material.color.setHex(color);
        };

        cube.userData.checkCombinationMatches = () => {
          // console.log('Calling map on : ', this);
          this.checkCombinationMatches();
        };

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

    // dragControls = new DragControls(cubes, camera, renderer.domElement);

    // dragControls.addEventListener("dragstart", function (event) {
    //   // affect obj
    //   // event.object.userData.setColor('0xff0000');

    //   let cube = event.object;
    //   var originPoint = cube.position.clone();

    //   cube.userData.intersects = getDraggableIntersectionsOfSelectedSq(originPoint, cubes);
    //   cube.userData.update(cube);
    //   controls.enabled = false;
    // });

    // dragControls.addEventListener("drag", function (event) {
    //   let cube = event.object;
    //   cube.position.z = 0; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
    // });

    // dragControls.addEventListener("dragend", function (event) {
    //   controls.enabled = true;
    //   renderer.render(scene, camera);

    // });

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
    camera.position.z = 7;
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setAnimationLoop(this.animation);

    controls = new OrbitControls(camera, appEl);
    controls.enableDamping = true;

    this.generateCubes();
    this.generateMasterCubes();
    appEl.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight('0xFFFFFF', 0);
    scene.add(ambientLight);

    // const directionLight = new THREE.DirectionalLight('0x0000ff', 1);
    // directionLight.position.set(1, 0, 2)
    // scene.add(directionLight);

    const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
scene.add(hemisphereLight);


const pointLight = new THREE.PointLight(0xff9000, 0.5)
pointLight.position.set(1, - 0.5, 1);

scene.add(pointLight);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
rectAreaLight.position.set(-1.5, 0, 1)
rectAreaLight.lookAt(new THREE.Vector3())

scene.add(rectAreaLight)

  };

  toggleMenu = () => {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  };

  render() {
    return (
      <>
        <div className="header">
          <span className="title">Rubix</span>
          <Time
            isClockRunning={this.state.isClockRunning}
            isGameOver={this.state.isGameComplete}
            onGameComplete={this.updateParentClockOnComplete}
          />
          <span className="menu" onClick={this.toggleMenu}>
            <FiMenu />
          </span>
        </div>

        <div className="moves">
          <section className="title">Moves</section>
          <section className="count">{this.state.moveCount}</section>
        </div>

        <Controls onMoveGamePieceByDirection={this.moveGamePieceByDirection} />

        <div className="masterGrid">
          {this.state.masterCubeArr
            ? this.state.masterCubeArr.map((color, i) => {
                return <div key={i} className={color}></div>;
              })
            : "Loading.. ."}
        </div>

        <div className="webgl"></div>

        {/* <button className={this.state.clockStarted ? 'start active' : 'start reset active' } onClick={this.resetAll}>{ this.state.clockStarted ? 'Restart' : 'Start'}</button> */}
      </>
    );
  }
}

export default App;
