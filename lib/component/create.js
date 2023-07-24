"use strict";

const chalk = require("chalk");
const comm = require("../common/common.js");

/**
 * @module componentCreator
 * @description A module to handle the creating of components.
 */

exports.createComponent = async (componentName, projectPath) => {
  comm.logWithColor(chalk.cyan, `\nCreate Component "${componentName}" ...\n`);
  comm.log("Creating Component feature would be updated soon ...");
  /**
   * @todo make create component process
   */
};
