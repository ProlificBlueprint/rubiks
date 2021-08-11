
const genericFx = require("./generic.js");

const isWinningCombination = (game, key) => {
  return genericFx.isMapObjEq(game.get(0), key.get(2)) && genericFx.isMapObjEq(game.get(1), key.get(1)) && genericFx.isMapObjEq(game.get(2), key.get(0));
}


module.exports.isWinningCombination = isWinningCombination;
