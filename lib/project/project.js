"use strict";

const chalk = require("chalk");
const debugError = require("debug")("error");
const express = require("express");
const fs = require("fs");
const figlet = require("figlet-promised");
const os = require("os");
const path = require("path");

const comm = require("../common/common.js");
const plugin = require("../plugin/plugin.js");
const openBrowser = require("../utils/openBrowser.js");
const clearConsole = require("../utils/clearConsole.js");

/**
 * @function isProjectDir
 * @author HyunHo
 * @since 23.06.23
 * @param {string} dir Directory to be verified as project path
 * @returns {boolean} Whether project directory or not
 */
function isProjectDir(dir) {
  const manifestPath = path.join(dir, "manifest.json");
  return fs.existsSync(manifestPath);
}

/**
 * @function getLocalPlugins
 * @author HyunHo
 * @since 23.06.27
 * @lastupdate 23.06.28
 * @returns {null | Array}
 */
function getLocalPlugins() {
  const projectPath = fs.realpathSync(process.cwd());
  if (!isProjectDir(projectPath)) {
    comm.logWithColor(chalk.red, "Failed to read project path\n");
    return null;
  }
  const pluginPath = path.join(projectPath, "public", "PLUGINS");
  if (!fs.existsSync(pluginPath)) {
    comm.logWithColor(chalk.red, "Failed to read plugin path\n");
    return null;
  }

  let _plugins = [];

  const directories = fs
    .readdirSync(pluginPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (let directory of directories) {
    const configPath = path.join(pluginPath, directory, "config.json");
    // Check whether config.json exists or not
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, "utf-8");
      const configJson = JSON.parse(configContent);

      const pluginData = {
        pluginName: directory,
        index: configJson.plugin.index,
        pluginId: configJson.plugin.pluginid,
      };

      _plugins.push(pluginData);
    }
  }

  return _plugins;
}

function getLocalTabbar() {
  return null;
}

/**
 * @function startServer
 * @author HyunHo
 * @since 23.06.26
 * @lastupdate 23.06.28
 * @param {number} port Port which local server would run in
 * @returns {Promise}
 */
async function startServer(port) {
  return new Promise((resolve, reject) => {
    const app = express();
    const favicon = require("serve-favicon");

    // serve favicon
    app.use(
      favicon(path.join(__dirname, "../../assets", "img", "bim_logo_small.png"))
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Public files served as static
    app.use(express.static(path.join(process.cwd(), "public")));

    app.use("/assets", function (req, res) {
      try {
        let originUrl = req.originalUrl;
        let fileName = originUrl.replace("/assets/", "");
        let filePath = path.join(__dirname, "../../assets");
        let options = {
          root: filePath,
        };
        res.sendFile(fileName, options, function (err) {
          if (err) {
            debugError("Error in dev server : ", err);
            res.status(404).send("not found");
          }
        });
      } catch (e) {
        debugError("Error in dev server : ", e);
        res.status(404).send("not found");
      }
    });
    app.set("views", path.join(__dirname, "../../views"));
    app.set("view engine", "ejs");

    app.get("/", function (req, res) {
      let appData = getLocalPlugins();
      let sendData = {
        appData: appData,
        componentData: { tabbar: getLocalTabbar() },
      };
      res.render("emulator", sendData);
    });

    app.use(function (err, req, res, next) {
      if (err) {
        comm.logWithColor(
          chalk.redBright,
          "Error occured while starting dev server ..."
        );
        debugError("Server Error : ", err);
        res.status(err.status || 500).send(err.message || "ERROR");
        return;
      }
      next();
    });

    app.listen(port, () => {
      comm.log(`Server started on port ${chalk.yellow(port)} ...`);
      // Bimio Path
      const BIMIO_PATH = path.join(os.homedir(), "bimio");
      if (!fs.existsSync(BIMIO_PATH)) {
        fs.mkdirSync(BIMIO_PATH);
      }
      fs.writeFileSync(
        path.join(BIMIO_PATH, "server.pid"),
        String(process.pid)
      );

      resolve();
    });
  });
}

/**
 * @function stopServer
 * @author HyunHo
 * @since 23.06.26
 * @lastupdate 23.06.28
 * @returns {Promise}
 */
async function stopServer() {
  return new Promise(resolve => {
    // pid path
    const PID_PATH = path.join(os.homedir(), "bimio", "server.pid");
    if (fs.existsSync(PID_PATH)) {
      let pid = fs.readFileSync(PID_PATH);
      try {
        process.kill(pid, "SIGTERM");
        comm.log(`Server ${chalk.green("successfully")} stopped ...`);
      } catch (_ignored) {
        debugError("Ignored Error : ", _ignored);
        comm.log("No running server ...");
      } finally {
        fs.unlinkSync(PID_PATH);
        resolve();
      }
    } else {
      comm.log("No running server ...");
      resolve();
    }
  });
}

const project = {
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
  createProject: async projectName => {
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
  },

  /**
   * @function runProject
   * @description
   * Function to run the Project.
   * @author HyunHo
   * @since 23.06.23
   * @lastupdate 23.06.28
   * @param {string=} port (optional) port of developer server. default - 3000
   */
  runProject: async userPort => {
    clearConsole();
    const projectPath = fs.realpathSync(process.cwd());
    if (!isProjectDir(projectPath)) {
      comm.log(
        chalk.red(
          `Error: "run" command must be executed in the project directory.`
        )
      );
      process.exit(1);
    }

    const targethost = "0.0.0.0";

    // Sets default port if not specified
    if (!userPort) {
      userPort = parseInt(process.env.PORT, 10) || 3000;
    } else {
      userPort = parseInt(userPort, 10);
    }

    const isInteractive = process.stdout.isTTY;

    const {
      choosePort,
      prepareUrls,
      printInstructions,
    } = require("../utils/webServerUtils.js");
    const { checkBrowsers } = require("../utils/browsersHelper.js");

    checkBrowsers(projectPath, isInteractive)
      .then(() => {
        comm.log(chalk.cyan("Choosing port ..."));
        return choosePort(targethost, userPort);
      })
      .then(port => {
        if (port == null) {
          comm.log("runnable port not found ...");
          return;
        }
        comm.log(`port ${chalk.yellow(port)} was chosen ...\n`);

        const protocol = process.env.HTTPS === "true" ? "https" : "http";
        const urls = prepareUrls(protocol, targethost, port, "/");
        comm.log(chalk.cyan("Starting the development server ..."));

        startServer(port)
          .then(() => {
            printInstructions("plugins", urls);
            openBrowser(urls.localUrlForBrowser);
          })
          .catch(err => {
            comm.logWithColor(
              chalk.redBright,
              "Error occured while starting Server ...",
              err.message
            );
            debugError("Full Error : ", err);
          });
      })
      .catch(err => {
        comm.logWithColor(
          chalk.redBright,
          "Error occured while choosing Port ...",
          err.message
        );
        debugError("Full Error : ", err);
      });
  },

  /**
   * @function stopProject
   * @description
   * Function to stop the Project.
   * @author HyunHo
   * @since 23.06.26
   */
  stopProject: async () => {
    return stopServer();
  },

  /**
   * @description
   * Function to build the project.
   * @param {string} projectName
   */
  buildProject: async projectName => {},
};

module.exports = project;
