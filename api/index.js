const fs = require("fs");
const path = require("path");

const thisFileBasename = path.basename(module.filename);

const registerFunc = (server, options, next) => {
    // autoload all files in this directory
    fs
        .readdirSync(__dirname)
        .filter(fileName => (fileName.indexOf('.') !== 0) && (fileName !== thisFileBasename) && (fileName.slice(-3) === '.js'))
        .forEach(fileName => {
            const filePath = path.join(__dirname, fileName);
            //console.log(filePath);

            const handler = require(path.join(__dirname, fileName));
            //console.log(handler.routes);
            
            server.route(handler.routes);
        });

    next();
};

registerFunc.attributes = {
    name: "reperio-api",
    version: "1.0.0"
};

module.exports = registerFunc;