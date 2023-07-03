"use strict";

const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Set 'prod' as default NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || "prod";
const isProd = process.env.NODE_ENV === "prod";
const envFile = isProd ? ".env_prod" : ".env_dev";
const envPath = path.join(__dirname, envFile);

if (fs.existsSync(envPath)) {
  let _env = dotenv.config({ path: envPath });
  if (_env.error) {
    console.error("Not found environment file ...");
  }
} else {
  console.error("Not found environment file ...");
}
