"use strict";
const comm = {
  log: function () {
    return console.log.apply(console, arguments);
  },
  version: (function () {
    const fs = require("fs");
    const path = require("path");
    const packageJson = fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8");
    const packageObj = JSON.parse(packageJson);
    return packageObj.version;
  })(),
};

module.exports = comm;
