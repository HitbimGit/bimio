"use strict";

const chalk = require("chalk");
const fs = require("fs");
const figlet = require("figlet-promised");
const path = require("path");

const comm = require("../common/common.js");
const plugin = require("../plugin/plugin.js");
const clearConsole = require("../utils/clearConsole.js");

/**
 * @function createProject
 * @description
 * Function to initialize a project.
 * @author HyunHo
 * @since 23.06.23
 * @lastupdate 23.06.30
 * @param {string} projectName
 * @returns
 */
exports.createProject = async projectName => {
  clearConsole();
  const projectPath = path.join(process.cwd(), projectName);
  // Check project path
  if (fs.existsSync(projectPath)) {
    comm.log(`Error: Directory "${projectName}" already exists.`);
    return;
  }

  const figletStr = await figlet("Hitbim");
  comm.log(chalk.cyanBright(`${figletStr}`));
  comm.log("");
  comm.logWithColor(chalk.cyan, "Hitbim Create Project Start ...\n");

  // Create project folders
  comm.logWithColor(chalk.dim, " Create Project directories ...");
  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, "public"));
  fs.mkdirSync(path.join(projectPath, "public", "COMPONENTS"));
  fs.mkdirSync(path.join(projectPath, "public", "PLUGINS"));

  const manifestContent = {
    projectName: projectName,
    projectPath: projectPath,
  };

  comm.logWithColor(chalk.dim, " Create file manifest.json ...");
  fs.writeFileSync(
    path.join(projectPath, "manifest.json"),
    JSON.stringify(manifestContent),
    "utf8"
  );

  comm.log(
    `\nProject ${chalk.bold('"' + projectName + '"')} has been ${chalk.green(
      "successfully"
    )} created at ${chalk.underline(projectPath)}\n`
  );

  await plugin.createPlugin("Sample1", `${projectName}/public/PLUGINS`);
};
