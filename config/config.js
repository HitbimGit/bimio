"use strict";

const dotenv = require("dotenv");

var _env = dotenv.config({ path: `${__dirname}\\.env` });
if (_env.error) {
  console.log("path: ", `${__dirname}\\.env`);
  throw new Error("Not found environment file");
}
