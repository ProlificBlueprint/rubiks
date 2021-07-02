  // Fisher-Yates (aka Knuth) Shuffle
  const shuffle = (array) => {
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


  const isObjEq = (o1, o2) => {
    const entries1 = Object.entries(o1);
    const entries2 = Object.entries(o2);
    if (entries1.length !== entries2.length) {
      return false;
    }
    for (let i = 0; i < entries1.length; ++i) {
      // Keys
      if (entries1[i][0] !== entries2[i][0]) {
        return false;
      }
      // Values
      if (entries1[i][1] !== entries2[i][1]) {
        return false;
      }
    }
  
    return true;
  }

  const isMatch = (game, key) => {
    console.groupCollapsed(" match ")
    console.log('1', game[0][0] === key[2][2]);
    console.log('2', game[0][1] === key[2][1]);
    console.log('3', game[0][2] === key[2][0]);
    console.log('4', game[1][0] === key[1][2]);
    console.log('5', game[1][1] === key[1][1]);
    console.log('6', game[1][2] === key[1][0]);
    console.log('7', game[2][0] === key[0][2]);
    console.log('8', game[2][1] === key[0][1]);
    console.log('9', game[2][2] === key[0][0]);
    console.groupEnd();

    return game[0][0] === key[2][2] &&
        game[0][1] === key[2][1] &&
        game[0][2] === key[2][0] &&
        game[1][0] === key[1][2] &&
        game[1][1] === key[1][1] &&
        game[1][2] === key[1][0] &&
        game[2][0] === key[0][2] &&
        game[2][1] === key[0][1] &&
        game[2][2] === key[0][0]
  }

  module.exports.shuffle = shuffle;
  module.exports.isObjEq = isObjEq
  module.exports.isMatch = isMatch;