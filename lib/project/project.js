"use strict";

const { createProject } = require("./init.js");
const { runProject } = require("./run.js");
const { stopProject } = require("./stop.js");
const { buildProject } = require("./build.js");

const project = {
  /**
   * @function createProject
   * @description
   * Function to initialize a new project.
   * @author HyunHo
   * @since 23.06.23
   * @lastupdate 23.06.30
   * @param {string} projectName - The name of the project to be created.
   * @returns
   */
  createProject: createProject,

  /**
   * @function runProject
   * @description
   * Function to run the Project.
   * @author HyunHo
   * @since 23.06.23
   * @lastupdate 23.06.28
   * @param {string} [userPort=3000]
   * (optional) - The desired port for the local server. Default is 3000.
   */
  runProject: runProject,

  /**
   * @function stopProject
   * @description
   * Function to stop the Project.
   * @author HyunHo
   * @since 23.06.26
   * @returns {Promise}
   * Resolves when the server is successfully stopped,
   * or if no server is currently running.
   */
  stopProject: stopProject,

  /**
   * @description
   * Function to build the project.
   * @param {string} projectName
   */
  buildProject: buildProject,
};

module.exports = project;
