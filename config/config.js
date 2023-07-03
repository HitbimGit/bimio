"use strict";

const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const debugError = require("debug")("error");

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
    console.error("Not found environment file ...");
    debugError("Full Error : ", _env.error);
  }
} else {
  console.error("Not found environment file ...");
}
