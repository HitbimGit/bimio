"use strict";

const chalk = require("chalk");
const comm = require("../common/common.js");

const component = {
  createComponent: async (componentName, projectPath) => {
    comm.logWithColor(
      chalk.cyan,
      `\nCreate Component "${componentName}" ...\n`
    );
    comm.log("Creating Component feature would be updated soon ...");
  },

  uploadComponent: async componentName => {
    comm.logWithColor(
      chalk.cyan,
      `\nUpload Component "${componentName}" ...\n`
    );
    comm.log("Uploading Component feature would be updated soon ...");
  },

  showComponentList: async () => {
    comm.logWithColor(chalk.cyan, "\nShow My Component List ...\n");
    comm.log("Showing Component List feature would be updated soon ...");
  },

  downloadComponent: async componentId => {
    comm.logWithColor(
      chalk.cyan,
      `\nDownload Component "${componentId}" ...\n`
    );
    comm.log("Downloading Component feature would be updated soon ...");
  },
};

module.exports = component;
