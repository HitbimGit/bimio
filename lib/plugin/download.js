"use strict";

const AdmZip = require("adm-zip");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const debugError = require("debug")("error");
const debugServer = require("debug")("server");

const comm = require("../common/common.js");
const config = require("../server/config.js");
const safeRequest = require("../server/saferequest.js");

/**
 * @module pluginDownloader
 * @description A module to handle the downloading of plugins.
 */

/**
 * Function to download a plugin by its ID.
 * @async
 * @function downloadPlugin
 * @param {string} pluginId - The ID of the plugin to be downloaded.
 * @returns {Promise} - Promise object represents the result of the download.
 */
exports.downloadPlugin = async function (pluginId) {
  /**
   * @description
   * Recursive download function
   * This function sends a request to the server to download the plugin.
   * If the download fails, it retries the download once.
   * @inner
   * @function recursiveDownload
   * @author HyunHo
   * @since 23.06.19
   * @lastupdate 23.06.21
   * @param {boolean} recursive
   * Flag to determine whether the function should recursively
   * call itself upon failure.
   */
  async function recursiveDownload(recursive) {
    return new Promise(async (resolve, reject) => {
      try {
        const writer = fs.createWriteStream(zipPath);
        // Sending to Server
        const response = await safeRequest.sendWithToken(
          false,
          config.plugin_server.download,
          { pluginId: pluginId },
          {},
          { responseType: "stream" }
        );

        // When Successful
        if (response.status === 200) {
          comm.logWithColor(chalk.dim, ` Downloading Plugin from server ...`);
          // Make pipe on write stream
          response.data.pipe(writer);
          // When writing download done
          writer.on("finish", async () => {
            let pluginName = response.headers["plugin-name"];

            if (!pluginName) pluginName = "DownloadedPlugin";

            comm.logWithColor(chalk.dim, ` Checking Plugin path ...`);
            let distPath = path.join(pluginPath, pluginName);

            // If plugin dist path already exists
            if (fs.existsSync(distPath)) {
              let answer = await comm.confirm(
                `Plugin "${pluginName}" already exists.`,
                `Would you like to overwrite Plugin "${pluginName}"? ...`
              );
              if (answer) {
                comm.log(`Plugin "${pluginName}" would be overwritten ...`);
              } else {
                comm.log(
                  `Plugin "${pluginName}" would be downloaded as new ...`
                );
                let count = 1;
                while (fs.existsSync(distPath + `-${count}`)) {
                  count++;
                }
                distPath = distPath + `-${count}`;
              }
            }

            // Reading downloaded zip
            const zip = new AdmZip(zipPath);
            comm.logWithColor(chalk.dim, ` Extracting downloaded Plugin ...\n`);
            zip.extractAllTo(distPath, true);
            fs.unlinkSync(zipPath);
            comm.log(
              `Plugin ${chalk.bold(
                '"' + pluginName + '"'
              )} has been ${chalk.green("successfully")} downloaded.`
            );

            // All Process Done!
            resolve();
          });

          // When error occures in write stream
          writer.on("error", err => {
            comm.logWithColor(
              chalk.redBright,
              "Error occured while creating write stream ..."
            );
            debugError("Full Error : ", err);
            reject(err);
          });
        } else if (response.status === 401 && recursive) {
          comm.log("Retry to download plugin ...");
          await recursiveDownload(false);
        } else {
          comm.logWithColor(
            chalk.redBright,
            `Downloading "${pluginId}" failed ...\n`
          );
          debugServer(
            `Error : Downloading "${pluginId}" failed.\n` +
              `Reason : ${response.msg || response.message}\n` +
              `Code : ${response.status}`
          );
          reject();
        }
      } catch (error) {
        comm.logWithColor(
          chalk.redBright,
          `Downloading "${pluginId}" failed ...\n`
        );
        debugServer("Full Error : ", error);
        reject(error);
      }
    });
  }

  const pluginPath = path.join(process.cwd(), "public/PLUGINS");
  if (!fs.existsSync(pluginPath)) {
    comm.logWithColor(
      chalk.yellowBright,
      `Directory "${pluginPath}" does not exist ...`
    );
    return;
  }

  const downloadPath = path.join(process.cwd(), "downloads");
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }

  const zipPath = path.join(downloadPath, `${pluginId}.zip`);
  await recursiveDownload(true).catch(er => {
    comm.logWithColor(
      chalk.redBright,
      "Error occured while downloading ... ",
      er.message
    );
    debugError("Full Error  : ", er);
  });
};
