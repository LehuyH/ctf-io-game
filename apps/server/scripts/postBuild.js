const fs = require('fs');

//Read prod package.json
const prodPackage = JSON.parse(fs.readFileSync('./lib/package.json'));

//Modify package shared to "shared": "file:packages/shared"
prodPackage.dependencies.shared = "file:app/server/arena/packages/shared";

//Copy deployment config
const configFile = fs.readFileSync("./lib/apps/server/src/arena.config.js");
//Update configFile's relative imports to ./apps/server/src
const newFile = configFile.toString().replace("./", "./apps/server/src/");
fs.writeFileSync("./lib/arena.config.js", newFile);

//Write prod package.json
fs.writeFileSync('./lib/package.json', JSON.stringify(prodPackage, null, 2));

//Create entry point
fs.copyFileSync('./lib/apps/server/src/index.js', './lib/index.js');
