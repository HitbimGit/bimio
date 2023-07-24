"use strict";

const chalk = require("chalk");
const comm = require("../common/common.js");

/**
 * @module componentDownloader
 * @description A module to handle the downloading of components.
 */

exports.downloadComponent = async componentId => {
  comm.logWithColor(chalk.cyan, `\nDownload Component "${componentId}" ...\n`);
  comm.log("Downloading Component feature would be updated soon ...");
  /**
   * @todo make download component process
   */
};
