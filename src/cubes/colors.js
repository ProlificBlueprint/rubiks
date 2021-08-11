// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture
// import all matcap textures here
const THREE = require("three");
const textureLoader = new THREE.TextureLoader();

const matcapYellow = textureLoader.load('/matcaps/rubix_yellow_glossy.png');
const matcapRed = textureLoader.load('/matcaps/rubix_red_glossy.png');
const matcapBlue = textureLoader.load('/matcaps/rubix_blue.png');
const matcapGreen = textureLoader.load('/matcaps/rubix_green.png');
const matcapOrange = textureLoader.load('/matcaps/rubix_orange.png');
const matcapWhite = textureLoader.load('/matcaps/rubix_white.png');

const rubik_colors_hex = {
    blue: 0x0000ff,
    white: 0xffffff,
    yellow: 0xffff00,
    orange: 0xffa500,
    green: 0x008000,
    red: 0xff0000,
};

const rubik_matcaps = {
    blue: matcapBlue,
    white: matcapWhite,
    yellow: matcapYellow,
    orange: matcapOrange,
    green: matcapGreen,
    red: matcapRed,
}

const color_opt_array = [
    "blue",
    "blue",
    "blue",
    "blue",
    "white",
    "white",
    "white",
    "white",
    "yellow",
    "yellow",
    "yellow",
    "yellow",
    "orange",
    "orange",
    "orange",
    "orange",
    "green",
    "green",
    "green",
    "green",
    "red",
    "red",
    "red",
    "red",
];

module.exports.rubik_colors = rubik_colors_hex;
module.exports.rubik_matcaps = rubik_matcaps;
module.exports.color_opt_array = color_opt_array;