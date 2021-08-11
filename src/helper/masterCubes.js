const genericFx = require("./generic.js");
const colors = require("./../cubes/colors");
const masterGridCount = 3;

const generateMasterCubeDisplayArr = (masterCubes) => {
    let col1, col2, col3;
    let row1 = [], row2 = [], row3 = [];
  
    masterCubes.forEach(map => {
        col1 = map.get(0);
        col2 = map.get(1);
        col3 = map.get(2);
        
        row1.push(col1)
        row2.push(col2)
        row3.push(col3)
    });
  
    return row1.concat(row2).concat(row3).reverse()
  }

const syncMasterCubeOrder = (masterCubes) => {
    const outObj = masterCubes;

    outObj.forEach(map => {
      const value0 = map.get(0);
      const value2 = map.get(2);

      map.set(0, value2);
      map.set(2, value0);
    })

    return outObj;
  }

const generateMasterCubes = (masterGameMap) => {
    let count = 0;
    let i, j;

    const randomColors = genericFx.shuffle(colors.color_opt_array);

    for (i = 0; i < masterGridCount; i++) {
      for (j = 0; j < masterGridCount; j++) {
        masterGameMap.get(i).set(j, randomColors[count])
        count++;
      }
    }

    // update for faster comparison
    masterGameMap = syncMasterCubeOrder(masterGameMap);
    const cubeArr = generateMasterCubeDisplayArr(masterGameMap);
    return cubeArr;
  };

module.exports.generateMasterCubeDisplayArr = generateMasterCubeDisplayArr;
module.exports.syncMasterCubeOrder = syncMasterCubeOrder;
module.exports.generateMasterCubes = generateMasterCubes;
  