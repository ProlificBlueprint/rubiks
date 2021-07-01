import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

import * as dat from 'dat.gui';

let camera, cubes, dragControls, scene, renderer, appEl;
let geometry, material, raycaster, controls, gameBoard;
let gridGap = .01;
let cubeSize = 1;


const rubik_colors = {
  blue : 0x0000FF,
  white : 0xFFFFFF,
  yellow : 0xFFFF00,
  orange : 0xFFA500,
  green : 0x008000,
  red : 0xFF0000,
}

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
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);

    })
  }

  bindMouse = () => {
    window.addEventListener('mousemove', (e) => {
      // mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1; 
      // mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1; 
      // cusrsor.x = e.clientX/ window.innerWidth - 0.5;
      // cusrsor.y = e.clientY / window.innerHeight - 0.5;

      // camera.position.x = Math.sin(cusrsor.x * Math.PI * 2) * 3;
      // camera.position.z = - Math.cos(cusrsor.x *  Math.PI * 2) * 3;
      // camera.position.y = cusrsor.y * 5;
      // camera.lookAt(cube1.position)
      // console.log(cusrsor)
    })
  };

  // Fisher-Yates (aka Knuth) Shuffle
  shuffle = (array) => {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  generateCubes = () => {
    gameBoard = new THREE.Group();
    cubes = [];
    
    const cub2 = cubeSize * 2;

    

    let count = 0;
    let i, j;

    // grid
    const gridWidth = cubeSize * 5 ;


    const color_array = [
      'blue', 'blue', 'blue', 'blue', 
      'white', 'white', 'white', 'white',
     'yellow', 'yellow', 'yellow', 'yellow', 
     'orange', 'orange', 'orange', 'orange', 
     'green', 'green', 'green', 'green', 
     'red', 'red', 'red', 'red'];

    const randomColors = this.shuffle(color_array);

    for(i = 0; i < 5 ; i++ ){
      for(j = 0; j< 5; j++){

        let geometry = new THREE.BoxGeometry(cubeSize -.01, cubeSize -.01, .1);
        let material = new THREE.MeshBasicMaterial({
          color: rubik_colors[randomColors[count]]
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = -1 * i + cubeSize * 2;
        cube.position.y = -1 * j + cubeSize * 2;
        cube.userData.id = `${i}${j}`;
        cube.userData.color = randomColors[count];
        cube.userData.intersects = [];
        cube.userData.position = cube.position.clone();

        cube.userData.update = ($this) => {
          let cube_limit = {};

          if($this.userData.intersects.length > 0){
            const hasCollitionLeft = $this.userData.intersects.includes("L");
            const hasCollitionBottom = $this.userData.intersects.includes("B");
            const hasCollitionRight = $this.userData.intersects.includes("R");
            const hasCollitionTop = $this.userData.intersects.includes("T");
            console.log("hasCollitionBottom => ", hasCollitionBottom);

            const xMin = hasCollitionLeft ? $this.userData.position.x : -1 * cub2
            // console.log('$this.userData.position.y ==> ', $this.userData.position.y)
            const yMin = hasCollitionBottom ? $this.userData.position.y : -1 * cub2
            const xMax = hasCollitionRight ? $this.userData.position.x :  cub2
            const yMax = hasCollitionTop ? $this.userData.position.y :  cub2

            cube_limit.max = new THREE.Vector3(xMax, yMax, 0);
            cube_limit.min = new THREE.Vector3(xMin, yMin, 0);
          } else {
            cube_limit.min = new THREE.Vector3(-1 * cub2, -1 * cub2, 0);
            cube_limit.max = new THREE.Vector3(cub2, cub2, 0);
          }

          console.log("cube_limit.min", cube_limit.min)
          console.log("cube_limit.max", cube_limit.max)
          cube.position.clamp(cube_limit.min, cube_limit.max);
        }
        
        cube.userData.setColor = function(color){
          cube.material.color.setHex(color);
        };

        cube.userData.setMetalness = function(){
          // cube.material.metal
        }

        // cube.userData.update.bind(cube);
    
        cubes.push(cube);
        if(i !== 4 || j !== 4) {
          gameBoard.add(cube);
        }
        count++;
      }
    }

    gui.add(gameBoard.position, 'x', 0).name('grid x');
    gui.add(gameBoard.position, 'y', 0).name('grid y');

    dragControls = new DragControls(cubes, camera, renderer.domElement);
    
    dragControls.addEventListener( 'dragstart', function ( event ) {
      // affect obj
      // event.object.userData.setColor('0xff0000');

      let cube = event.object;
      var originPoint = cube.position.clone();
      const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

      const raycasterLeft = new THREE.Raycaster();
      const rayDirectionLeft = new THREE.Vector3(-2 , 0, 0).normalize();

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

      const instersectsLeft = raycasterLeft.intersectObjects(cubes);
      const instersectsTop = raycasterTop.intersectObjects(cubes);
      const instersectsRight = raycasterRight.intersectObjects(cubes);
      const instersectsBottom = raycasterBottom.intersectObjects(cubes);
      
      scene.add(new THREE.ArrowHelper(raycasterLeft.ray.direction, raycasterLeft.ray.origin, 500, 0xff0000) );
      scene.add(new THREE.ArrowHelper(raycasterTop.ray.direction, raycasterTop.ray.origin, 500, 0xff0000) );
      scene.add(new THREE.ArrowHelper(raycasterRight.ray.direction, raycasterRight.ray.origin, 500, 0xff0000) );
      scene.add(new THREE.ArrowHelper(raycasterBottom.ray.direction, raycasterBottom.ray.origin, 500, 0xff0000) );

      const intersectsResults = [];
      
      if(instersectsLeft.length > 0){
        intersectsResults.push('L')
      }
      if(instersectsTop.length > 0){
        console.log(instersectsTop);
        const closeIntersections = instersectsTop.filter( intersect => intersect.distance <= .5);
        if(closeIntersections.length > 0) {
          console.log('Top Colllision Close!')
          intersectsResults.push('T')
        }
      }
      if(instersectsRight.length > 0){
        intersectsResults.push('R')
      }
      if(instersectsBottom.length > 0){
        const closeIntersections = instersectsBottom.filter( intersect => intersect.distance <= .5);
        if(closeIntersections.length > 0) {
          console.log('Bottom Colllision Close!')
          intersectsResults.push('B');
        }
      }

      cube.userData.intersects = intersectsResults;
      // let l, t, r, b;
      // for(l = 0; l < instersectsLeft.length; l++){
      //   const currIntersect = instersectsLeft[l];
      //   console.log("Left : ", currIntersect.object.userData.color);
      // }

      // for(t = 0; t < instersectsTop.length; t++){
      //   const currIntersect = instersectsTop[t];
      //   console.log("Top : ", currIntersect.object.userData.color);
      // }

      // for(r = 0; r < instersectsRight.length; r++){
      //   const currIntersect = instersectsRight[r];
      //   console.log("Right : ", currIntersect.object.userData.color);
      // }

      // for(b = 0; b < instersectsBottom.length; b++){
      //   const currIntersect = instersectsBottom[b];
      //   console.log("Bottom : ", currIntersect.object.userData.color);
      // }
      
      // scene.add(new THREE.ArrowHelper(raycasterLeft.ray.direction, raycasterLeft.ray.origin, 500, 0xff0000) );
      cube.userData.update(cube);
      controls.enabled = false;
     });
     
     dragControls.addEventListener ( 'drag', function( event ){
      // console.log('dragging');
      let cube = event.object;
      
      var originPoint = cube.position.clone();
      const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

      const raycasterLeft = new THREE.Raycaster();
      const rayDirectionLeft = new THREE.Vector3(-2 , 0, 0).normalize();

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

      const instersectsLeft = raycasterLeft.intersectObjects(cubes);
      const instersectsTop = raycasterTop.intersectObjects(cubes);
      const instersectsRight = raycasterRight.intersectObjects(cubes);
      const instersectsBottom = raycasterBottom.intersectObjects(cubes);
      
      // scene.add(new THREE.ArrowHelper(raycasterLeft.ray.direction, raycasterLeft.ray.origin, 500, 0xff0000) );
      // scene.add(new THREE.ArrowHelper(raycasterTop.ray.direction, raycasterTop.ray.origin, 500, 0xff0000) );
      // scene.add(new THREE.ArrowHelper(raycasterRight.ray.direction, raycasterRight.ray.origin, 500, 0xff0000) );
      // scene.add(new THREE.ArrowHelper(raycasterBottom.ray.direction, raycasterBottom.ray.origin, 500, 0xff0000) );

      const intersectsResults = [];
      
      // if(instersectsLeft.length > 0){
      //   intersectsResults.push('L')
      // }
      // if(instersectsTop.length > 0){
      //   console.log(instersectsTop);
      //   const closeIntersections = instersectsTop.filter( intersect => intersect.distance <= .5);
      //   if(closeIntersections.length > 0) {
      //     console.log('Top Colllision Close!')
      //     intersectsResults.push('T')
      //   }
      // }
      // if(instersectsRight.length > 0){
      //   intersectsResults.push('R')
      // }
      // console.log("instersectsBottom = ", instersectsBottom)
      if(instersectsBottom.length > 0){
        const closeIntersections = instersectsBottom.filter( intersect => intersect.distance <= .5);

        if(closeIntersections.length > 0) {
          intersectsResults.push('B');
        }
      }

      cube.userData.intersects = intersectsResults;
      cube.userData.update(cube);

      event.object.position.z = 0; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
     })

     dragControls.addEventListener( 'dragend', function ( event ) {
      // console.log('drag end');
      // event.object.userData.setMetalness(0);
      controls.enabled = true;
      // console.log('event.object.userData.color', event.object.userData);
      // event.object.userData.setColor(rubik_colors[event.object.userData.color]);
      const cube = event.object;
      cube.userData.position = cube.position.clone();
      renderer.render( scene, camera );
     });

     var standardPlaneNormal   = new THREE.Vector3(0, 0, 1);
    var GridHelperPlaneNormal = new THREE.Vector3(0, 1, 0);
    
    var quaternion  = new THREE.Quaternion();
    quaternion.setFromUnitVectors(standardPlaneNormal, GridHelperPlaneNormal);
    var largeGridGuide = new THREE.GridHelper(10, 10);
    let gameBoardGuide = new THREE.GridHelper(5, 5, "aqua", "aqua");
    // grid.position.y = 0.01;

    largeGridGuide.rotation.setFromQuaternion(quaternion);
    gameBoardGuide.rotation.setFromQuaternion(quaternion);


    scene.add(largeGridGuide);
    scene.add(gameBoardGuide);

    scene.add(gameBoard);
    
  }

  animation = (time) => {
    const radius = 10;
    const angle = 0;
    cubes.forEach(o => {
      o.userData.update(o);
    });

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

    camera.position.z = 6;
    scene = new THREE.Scene();

    //looks in the center of the scene since that where we always start when creating a scene. 0,0,0
    camera.lookAt(scene.position);

    geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    material = new THREE.MeshNormalMaterial({
      color: 0xFFFFFF
    });

    

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

    // const intersects = raycaster.intersectObjects( scene.children ); 

    // for ( var i = 0; i < intersects.length; i++ ) { 
    //   intersects[ i ].object.material.color.set( 0xff0000 ); 
    // }
  };

  render() {
    
    return (
    <>
    <div className="webgl"></div>
    </>);
  }
}

export default App;
