"use strict";

const chalk = require("chalk");
const debugError = require("debug")("error");
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");

const comm = require("../common/common.js");
const clearConsole = require("../utils/clearConsole.js");
const openBrowser = require("../utils/openBrowser.js");

/**
 * @function getLocalPlugins
 * @description
 * Scans the project path for valid plugins and returns their metadata.
 * Each plugin's directory must contain a config.json file containing the plugin's index and id.
 * @author HyunHo
 * @since 23.06.27
 * @lastupdate 23.06.28
 * @returns {null | Array.<{pluginName: string, index: number, pluginId: string}>}
 * An array of objects representing the plugins found,
 * or null if an error occurs.
 * Each object in the array contains the name of the plugin's directory (pluginName),
 * the index of the plugin as specified in its config.json (index),
 * and the id of the plugin as specified in its config.json (pluginId).
 */
function getLocalPlugins() {
  const projectPath = fs.realpathSync(process.cwd());
  if (!comm.isProjectDir(projectPath)) {
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

/**
 * @function getLocalComponents
 * @author HyunHo
 * @since 23.08.07
 */
function getLocalComponents() {
  return null;
}

/**
 * @function startServer
 * @description
 * Initializes an Express server with middleware and routes
 * and starts listening on the provided port.
 * It serves the favicon, JSON, URL-encoded bodies, static public files, and assets.
 * It uses EJS as the view engine and renders the emulator view on the base route.
 * The function also handles errors and writes the server's PID to 'server.pid'.
 * @author HyunHo
 * @since 23.06.26
 * @lastupdate 23.06.28
 * @param {number} port - The port number the local server should listen on.
 * @returns {Promise} - A promise that resolves when the server starts listening.
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
      let componentData = getLocalComponents();
      let sendData = {
        appData: appData,
        componentData: { tabbar: componentData },
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
 * @function runProject
 * @description
 * Function to run the Project.
 *
 * Executes the project by running the local development server.
 * It clears the console, checks the project path, sets the target host, and selects the port for the server.
 * The function also prepares the URLs for the server, starts it, prints instructions, and opens the browser with the server URL.
 * Error handling is included in case the server fails to start or a port can't be selected.
 * @author HyunHo
 * @since 23.06.23
 * @lastupdate 23.06.28
 * @param {string} [userPort=3000]
 * (optional) - The desired port for the local server. Default is 3000.
 */
exports.runProject = async userPort => {
  clearConsole();
  const projectPath = fs.realpathSync(process.cwd());
  if (!comm.isProjectDir(projectPath)) {
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
          comm.log(`${chalk.bold("CTRL + C ")} to stop server ...\n`);
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
};
