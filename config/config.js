"use strict";

const chalk = require("chalk");
const debugError = require("debug")("error");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const comm = require("../lib/common/common.js");

const envFile = (() => {
  // Set 'prod' as default NODE_ENV
  process.env.NODE_ENV = process.env.NODE_ENV || "prod";
  switch (process.env.NODE_ENV) {
    case "dev":
    case "develop":
    case "development":
      return ".env.dev";
    case "local":
      return ".env.local";
    default:
      return ".env.prod";
  }
})();
const envPath = path.join(__dirname, envFile);

if (fs.existsSync(envPath)) {
  let _env = dotenv.config({ path: envPath });
  if (_env.error) {
    comm.error(chalk.redBright("Not found environment file ...\n"));
    debugError("Full Error : ", _env.error);
  }
} else {
  comm.error(chalk.redBright("Not found environment file ...\n"));
}
