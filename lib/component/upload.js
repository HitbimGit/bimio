"use strict";

const chalk = require("chalk");
const comm = require("../common/common.js");

/**
 * @module componentUploader
 * @description A module to handle the uploading of components.
 */

exports.uploadComponent = async componentName => {
  comm.logWithColor(chalk.cyan, `\nUpload Component "${componentName}" ...\n`);
  comm.log("Uploading Component feature would be updated soon ...");
  /**
   * @todo make upload component process
   */
};
