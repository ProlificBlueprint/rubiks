import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

import * as dat from 'dat.gui';

let camera, cubes, dragControls, scene, renderer, appEl;
let geometry, material, cube1, cube2, controls, gridGroup;
let gridGap = .01;
let cubeSize = 1;

const cusrsor = {
  x: 0,
  y:0
};

const gui = new dat.GUI();

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
    cubes = [];
    geometry = new THREE.BoxGeometry(cubeSize -.01, cubeSize -.01, .1);
    material = new THREE.MeshNormalMaterial();
    
    const cub2 = cubeSize * 2;
    const cube_limit = {
      min: new THREE.Vector3(-1 * cub2, -1 * cub2, 0),
      max: new THREE.Vector3(cub2, cub2, 0)
    };

    
    let i, j;
    // grid
    for(i = 0; i < 5 ; i++ ){
      for(j = 0; j< 5; j++){
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = -1 * i + cubeSize * 2;
        cube.position.y = -1 * j + cubeSize * 2;

        cube.userData.update = function(){
          cube.position.clamp(cube_limit.min, cube_limit.max);
        }

        cubes.push(cube);
        if(i !== 4 || j !== 4) {
          gridGroup.add(cube);
        }
      }
    }

    // let k, l;
    // // grid
    // for(k = 0; k < 5 ; k++ ){
    //   const cube = new THREE.Mesh(geometry, material);
    //   cube.position.z = .1;
    //   cube.position.x = -1 * k * .51;
    //   gridGroup.add(cube);

    //   for(l = 0; l < 5; l++){
    //     const cubeInner = new THREE.Mesh(geometry, material);
    //     cubeInner.position.z = .1;
    //     cubeInner.position.x = -1 * k * .51;
    //     cubeInner.position.y = -1 * l * .51;

    //     if(k !== 4 || l !== 4) {
    //       gridGroup.add(cubeInner);
    //     }
    //   }
    // }

    // gridGroup.position.x = 1;
    // gridGroup.position.y = 0;
    // gridGroup.position.z = -1;
    gridGroup.rotation.x = -1.58;
    

    gui.add(gridGroup.rotation, 'x', -1).step(0.01).min(-3).max(3).name('grid rotate');
    gui.add(gridGroup.position, 'x', 1).name('grid x');
    gui.add(gridGroup.position, 'y', 1).name('grid y');

    dragControls = new DragControls(cubes, camera, renderer.domElement);
    dragControls.addEventListener( 'dragstart', function ( event ) {
      console.log('drag start');
      controls.enabled = false;
     });
     dragControls.addEventListener ( 'drag', function( event ){
      console.log('drag');
      event.object.position.z = 0; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
     })
     dragControls.addEventListener( 'dragend', function ( event ) {
      console.log('drag end');
      controls.enabled = true;
     });

     scene.add(new THREE.GridHelper(10, 10));

    let grid = new THREE.GridHelper(5, 5, "aqua", "aqua");
    grid.position.y = 0.01;
    scene.add(grid);

    scene.add(gridGroup);
    camera.lookAt(gridGroup);
  }

  animation = (time) => {
    cubes.forEach(o => {
      o.userData.update();
    });

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

    camera.position.z = 6;
    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    material = new THREE.MeshNormalMaterial();

    

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
    this.generateCubes();
    appEl.appendChild(renderer.domElement);
  };

  render() {
    return <div className="webgl"></div>;
  }
}

export default App;
