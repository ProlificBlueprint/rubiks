import * as THREE from "three";
let cubeSize = 1;

const getIntersectsLeft = (originPoint, cubes, _scene) => {
    const intersectsResults = [];
    const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

    const raycasterLeft = new THREE.Raycaster();
    const rayDirectionLeft = new THREE.Vector3(-2, 0, 0).normalize();
    raycasterLeft.set(rayOrigin, rayDirectionLeft);

    const instersectsLeft = raycasterLeft
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);

    if (instersectsLeft.length > 0) {
        let distantIntersect = false;

        if(instersectsLeft[0].distance > 1){
            distantIntersect = true
        } 
        if (distantIntersect) {
            intersectsResults.push({ L : false});
        } else {
            intersectsResults.push({ L : true});
        }
    } else {
        intersectsResults.push({ L : false});
    }

    return intersectsResults;
}

const getIntersectsTop = (originPoint, cubes, _scene) => {
    const intersectsResults = [];
    const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3(0, 2, 0).normalize();
    raycaster.set(rayOrigin, rayDirection);

    const instersects = raycaster
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);

    if (instersects.length > 0) {
        let distantIntersect = false;

        if(instersects[0].distance > 1){
            distantIntersect = true
        } 
        if (distantIntersect) {
            intersectsResults.push({ T : false});
        } else {
            intersectsResults.push({ T : true});
        }
    } else {
        intersectsResults.push({ T : false});
    }

    return intersectsResults;
}

const getIntersectsRight = (originPoint, cubes, _scene) => {
    const intersectsResults = [];
    const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3(2, 0, 0).normalize();
    raycaster.set(rayOrigin, rayDirection);

    const instersects = raycaster
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);

    if (instersects.length > 0) {
        let distantIntersect = false;

        if(instersects[0].distance > 1){
            distantIntersect = true
        } 
        if (distantIntersect) {
            intersectsResults.push({ R : false});
        } else {
            intersectsResults.push({ R : true});
        }
    } else {
        intersectsResults.push({ R : false});
    }

    return intersectsResults;
}

const getIntersectsBottom = (originPoint, cubes, _scene) => {
    const intersectsResults = [];
    const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3(0, -2, 0).normalize();
    raycaster.set(rayOrigin, rayDirection);

    const instersects = raycaster
        .intersectObjects(cubes)
        .filter((mesh) => mesh.object.userData.color !== undefined);

    if (instersects.length > 0) {
        let distantIntersect = false;

        if(instersects[0].distance > 1){
            distantIntersect = true
        } 
        if (distantIntersect) {
            intersectsResults.push({ B : false});
        } else {
            intersectsResults.push({ B : true});
        }
    } else {
        intersectsResults.push({ B : false});
    }

    return intersectsResults;
}

const getIntersectionsOfSelectedSq = (originPoint, cubes) => {
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

      return intersectsResults;
}



const getAvailableSqByDirection = (cubes, direction, scene) => {
    // const upperBound = 2;
    // const lowerbound = -2;

    if(direction === "L"){
        const movableCube  = cubes.filter(cube => {
            var originPoint = cube.position.clone();
            const intersects = getIntersectsLeft(originPoint, cubes, scene);
            var found = false;

            for(var i = 0; i < intersects.length; i++) {
                if("L" in intersects[i]) {
                    const currIntLeft = intersects[i].L;

                    if(!currIntLeft){
                        cube.position.x = cube.position.x - 1;
                    }

                    found = currIntLeft;
                    break;
                }
            }

            if(!found){
                return cube;
            }
        });
    }

    if(direction === "R"){
        const movableCube  = cubes.filter(cube => {
            var originPoint = cube.position.clone();
            const intersects = getIntersectsRight(originPoint, cubes, scene);
            var found = false;

            for(var i = 0; i < intersects.length; i++) {
                if("R" in intersects[i]) {
                    const currIntLeft = intersects[i].R;

                    if(!currIntLeft){
                        cube.position.x = cube.position.x + 1;
                    }

                    found = currIntLeft;
                    break;
                }
            }

            if(!found){
                return cube;
            }
        });
    }

    if(direction === "T"){
        const movableCube  = cubes.filter(cube => {
            var originPoint = cube.position.clone();
            const intersects = getIntersectsTop(originPoint, cubes, scene);
            var found = false;

            for(var i = 0; i < intersects.length; i++) {
                if("T" in intersects[i]) {
                    const currIntLeft = intersects[i].T;

                    if(!currIntLeft){
                        cube.position.y = cube.position.y + 1;
                    }

                    found = currIntLeft;
                    break;
                }
            }

            if(!found){
                return cube;
            }
        });
    }

    if(direction === "B"){
        const movableCube  = cubes.filter(cube => {
            var originPoint = cube.position.clone();
            const intersects = getIntersectsBottom(originPoint, cubes, scene);
            var found = false;

            for(var i = 0; i < intersects.length; i++) {
                if("B" in intersects[i]) {
                    const currIntLeft = intersects[i].B;

                    if(!currIntLeft){
                        cube.position.y = cube.position.y - 1;
                    }

                    found = currIntLeft;
                    break;
                }
            }

            if(!found){
                return cube;
            }
        });
    }

    
    // console.log('filteredCubes =>' , filteredCubes);
    // if(filteredCubes.length > 0){
    //     const newX = filteredCubes[0].position.x - 1.01;
    // filteredCubes[0].position.x = newX;
    // } else {
    //     console.log("No Cube ", filteredCubes)
    // }
    
}

export { getIntersectionsOfSelectedSq, getAvailableSqByDirection };