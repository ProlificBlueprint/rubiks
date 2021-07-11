import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { shuffle, isWinningCombination } from "./helper/helper";
import { rubik_colors, color_opt_array } from "./cubes/colors";
import { generateGameboardCubes, generateMasterCubes } from './cubes/gameboard';

import * as dat from "dat.gui";
const metalTexture = require('./assets/metal.jpg');

console.log(metalTexture);
// debuger
const gui = new dat.GUI({ closed: true });

// global
let camera, scene, renderer, appEl;
let controls;
let cubes = [];

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
    window.addEventListener("resize", (_e) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
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
    generateGameboardCubes(scene, camera, renderer, controls);
    generateMasterCubes(scene);
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
