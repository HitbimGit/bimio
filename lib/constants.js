"use strict";

// const { white, green, red, yellow } = require('chalk');
const chalk = require("chalk");

const cnst = {
  BIM_MSG_LOG: chalk.white("[BIMIO] "),
  BIM_MSG_LOG_INFO: chalk.green("[BIMIO] "),
  BIM_MSG_LOG_RED: chalk.red("[BIMIO] "),
  BIM_MSG_LOG_WARNING: chalk.yellow("[BIMIO] "),
};

module.exports = cnst;
