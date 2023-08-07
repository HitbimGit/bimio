"use strict";

const chalk = require("chalk");
const debugError = require("debug")("error");
const fs = require("fs");
const os = require("os");
const path = require("path");

const comm = require("../common/common.js");

/**
 * @function stopServer
 * @description
 * Checks for the existence of a server.pid file.
 * If the file exists, the function attempts to terminate the process with the ID read from the file.
 * Whether the termination is successful or not, the server.pid file is deleted.
 * @author HyunHo
 * @since 23.06.26
 * @lastupdate 23.06.28
 * @returns {Promise}
 * Resolves when the server is successfully stopped,
 * or if no server is currently running.
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
exports.stopProject = async () => {
  return stopServer();
};
