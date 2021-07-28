
const generateMasterCubeDisplay = (masterCubes) => {
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

export { generateMasterCubeDisplay };