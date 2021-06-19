import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let camera, camera2, scene, renderer, appEl;
let geometry, material, cube1, cube2, controls, gridGroup;


const cusrsor = {
  x: 0,
  y:0
};

class App extends React.Component {
  constructor() {
    super();
    this.state = { sizes: {
      height: 100,
      width: 100
    } };
  }

  componentDidMount() {
    appEl = document.getElementsByClassName("webgl")[0];

    this.init();
    this.bindMouse();
    this.bindResize();
  }

  componentWillUnmount(){

  }

  bindResize = () => {
    window.addEventListener('resize', (e) => {
      console.log('has been resized');
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);

    })
  }

  bindMouse = () => {
    window.addEventListener('mousemove', (e) => {
      
      // cusrsor.x = e.clientX/ window.innerWidth - 0.5;
      // cusrsor.y = e.clientY / window.innerHeight - 0.5;

      // camera.position.x = Math.sin(cusrsor.x * Math.PI * 2) * 3;
      // camera.position.z = - Math.cos(cusrsor.x *  Math.PI * 2) * 3;
      // camera.position.y = cusrsor.y * 5;
      // camera.lookAt(cube1.position)
      // console.log(cusrsor)
    })
  };

  generateCubes = () => {
    gridGroup = new THREE.Group();
    
    geometry = new THREE.BoxGeometry(.5, .5, .05);
    material = new THREE.MeshNormalMaterial();

    let i, j;
    // grid
    for(i = 0; i < 5 ; i++ ){
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = -1 * i * .51;
      gridGroup.add(cube);

      for(j = 0; j< 5; j++){
        const cubeInner = new THREE.Mesh(geometry, material);
        cubeInner.position.x = -1 * i * .51;
        cubeInner.position.y = -1 * j * .51;
        gridGroup.add(cubeInner);
      }
    }

    let k, l;
    // grid
    for(k = 0; k < 5 ; k++ ){
      const cube = new THREE.Mesh(geometry, material);
      cube.position.z = .1;
      cube.position.x = -1 * k * .51;
      gridGroup.add(cube);

      for(l = 0; l < 5; l++){
        const cubeInner = new THREE.Mesh(geometry, material);
        cubeInner.position.z = .1;
        cubeInner.position.x = -1 * k * .51;
        cubeInner.position.y = -1 * l * .51;
        gridGroup.add(cubeInner);
      }
    }

    scene.add(gridGroup);
  }

  animation = (time) => {
    // cube1.rotation.x = time / 2000;
    // cube2.rotation.x = time / 1000;
    // cube2.rotation.z = Math.PI / 3
    // camera.rotation.z = time / 30000;
    
    controls.update();
    renderer.render(scene, camera);
  };

  init = () => {
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      10
    );

    camera.position.z = 5;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(.5, .5, .5);

    material = new THREE.MeshNormalMaterial();

    this.generateCubes();

    // const group1 = new THREE.Group()
    // cube1 = new THREE.Mesh(geometry, material);
    // cube2 = new THREE.Mesh(geometry, material);
    // cube2.position.x = -1.1
    
    // group1.add(cube1);
    // // group1.add(cube2);

    const axisHelper = new THREE.AxesHelper();
    scene.add(axisHelper);

    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setAnimationLoop(this.animation);

    

    controls = new OrbitControls(camera, appEl);
    controls.enableDamping = true;
    // controls.target.y = 0;
    
    // gsap.to(cube1.position, { duration: 1, delay: 1, x: 2})

    appEl.appendChild(renderer.domElement);
  };

  render() {
    return <div className="webgl"></div>;
  }
}

export default App;
