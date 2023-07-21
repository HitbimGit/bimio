"use strict";

const archiver = require("archiver");
const chalk = require("chalk");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const debugError = require("debug")("error");
const debugServer = require("debug")("server");

const comm = require("../common/common.js");
const config = require("../server/config.js");
const safeRequest = require("../server/saferequest.js");

/**
 * @module pluginUploader
 * @description A module to handle the uploading of plugins.
 */

/**
 * @function uploadPlugin
 * @description
 * Uploads a specific plugin to the server.
 * If the 'asNew' parameter is true,
 * it will upload the plugin as a new one.
 * Otherwise, it will update the existing plugin with the same name.
 * @param {string} pluginName - The name of the plugin to be uploaded.
 * @param {boolean} asNew - If true, the plugin will be uploaded as a new plugin. If false, the existing plugin with the same name will be updated.
 * @returns {Promise<void>} - The promise to upload the plugin.
 */
exports.uploadPlugin = async function (pluginName, asNew) {
  /**
   * @inner
   * @function getPluginId
   * @description
   * Get Plugin ID from config.json.
   * If not exists, return false
   * @author HyunHo
   * @since 23.06.19
   * @returns {string | boolean}
   */
  async function getPluginId() {
    try {
      const configPath = path.join(pluginPath, "config.json");
      if (fs.existsSync(configPath)) {
        let configJson = JSON.parse(fs.readFileSync(configPath));
        let pluginId = configJson.plugin.pluginid;
        return pluginId;
      }
      return false;
    } catch (err) {
      comm.logWithColor(
        chalk.redBright,
        "Error [%s] occured while getting plugin id ...",
        err.name
      );
      debugError("Full Error : ", err);
      return false;
    }
  }

  /**
   * @inner
   * @function setPluginId
   * @description
   * Set Plugin ID to config.json.
   * If not exists, return false
   * @author HyunHo
   * @since 23.06.20
   * @param {string} pluginId Plugin ID
   * @returns {boolean}
   */
  async function setPluginId(pluginId) {
    if (!pluginId) {
      pluginId = "";
    }
    try {
      const configPath = path.join(pluginPath, "config.json");
      if (fs.existsSync(configPath)) {
        let configJson = JSON.parse(fs.readFileSync(configPath));
        // Set the new pluginId
        configJson.plugin.pluginid = pluginId;
        // Write the updated object back to the config.json
        fs.writeFileSync(configPath, JSON.stringify(configJson, null, 2));
        return true;
      } else {
        comm.logWithColor(
          chalk.yellowBright,
          "config.json doesn't exist in %s",
          chalk.underline(configPath)
        );
        return false;
      }
    } catch (err) {
      comm.logWithColor(
        chalk.redBright,
        "Error [%s] occured while setting plugin id ...",
        err.name
      );
      debugError("Full Error : ", err);
      return false;
    }
  }
  /**
   * @inner
   * @function recursiveUpload
   * @author HyunHo
   * @since 23.06.16
   * @lastupdate 23.06.20
   * @param {boolean} recursive Send Request to Server again or not
   */
  async function recursiveUpload(recursive) {
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(archivePath));
      form.append("pluginName", pluginName);

      if (asNew) await setPluginId("");

      let pluginId = asNew ? false : await getPluginId();
      if (pluginId) {
        form.append("pluginId", pluginId);
      }

      // Send plugin to server
      const response = await safeRequest.sendWithToken(
        false,
        pluginId ? config.plugin_server.update : config.plugin_server.upload,
        form,
        { ...form.getHeaders() }
      );

      // When Successful
      if (response.status === 200) {
        const responseData = response.data;
        debugServer("response.data : ", responseData);

        if (responseData && !responseData.error) {
          let settingResult = await setPluginId(responseData.data.id);
          if (!settingResult) {
            comm.logWithColor(
              chalk.redBright,
              `Setting up plugin id failed ...`
            );
          }
          comm.log(
            `\nPlugin %s has been %s uploaded!`,
            chalk.bold('"' + pluginName + '"'),
            chalk.green("successfully")
          );
        } else if (responseData.error) {
          comm.logWithColor(
            chalk.redBright,
            `Failed to upload Plugin "${pluginName}".\n` + responseData.message
              ? `Reason : ${responseData.message}`
              : ""
          );
        }
      } else if (response.status === 401 && recursive) {
        comm.log("Retrying to upload plugin ...");
        await recursiveUpload(false);
      } else {
        comm.logWithColor(
          chalk.redBright,
          `Uploading "${pluginName}" failed.\nReason : ${
            response.msg || response.message
          }\n`
        );
        debugServer(
          `Error : Uploading "${pluginName}" failed.\n` +
            `Reason : ${response.msg || response.message}\n` +
            `Code : ${response.status}\n` +
            `Data : ${JSON.stringify(response.data)}\n` +
            `Config : ${response.config}\n`
        );
      }
    } catch (error) {
      comm.logWithColor(chalk.redBright, `Uploading "${pluginName}" failed.\n`);
      debugError("Full Error : ", error);
    }
  }

  const pluginPath = path.join(process.cwd(), "public/PLUGINS", pluginName);
  if (!fs.existsSync(pluginPath)) {
    comm.logWithColor(
      chalk.yellowBright,
      `Plugin "${pluginName}" does not exist.`
    );
    comm.guideCommand("Check your directory ... ", chalk.underline(pluginPath));
    return;
  }

  const buildPath = path.join(process.cwd(), "build");
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
  }

  const archivePath = path.join(buildPath, `${pluginName}.zip`);

  const output = fs.createWriteStream(archivePath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // compression level.
  });

  archive.on("error", err => {
    comm.logWithColor(
      chalk.redBright,
      `Error [${err.message}] occurred while archiving ...`
    );
    debugError("Full Error : ", err);
    process.exit(1);
  });
  archive.pipe(output);
  archive.directory(pluginPath, false);

  // Making archive finalized
  comm.logWithColor(chalk.dim, ` Archive Plugin "${pluginName}" ...`);
  await archive.finalize();

  // Upload to server
  comm.logWithColor(chalk.dim, ` Upload Plugin "${pluginName}" to server ...`);
  await recursiveUpload(true);
};

/**
 * @function uploadAllPlugins
 * @description
 * Uploads all plugins in the PLUGINS directory to the server.
 * If the 'asNew' parameter is true,
 * it will upload the plugins as new ones.
 * Otherwise, it will update the existing plugins with the same names.
 * @param {boolean} asNew - If true, the plugins will be uploaded as new plugins. If false, the existing plugins with the same names will be updated.
 * @returns {Promise<void>} - The promise to upload all plugins.
 */
exports.uploadAllPlugins = async function (asNew) {
  const pluginDir = path.join(process.cwd(), "public/PLUGINS");
  if (!fs.existsSync(pluginDir)) {
    comm.logWithColor(
      chalk.yellowBright,
      `Directory "${pluginDir}" does not exist.`
    );
    return;
  }
  const plugins = fs.readdirSync(pluginDir);
  if (plugins.length === 0) {
    comm.logWithColor(
      chalk.yellowBright,
      `Nothing to upload. Create your plugin first ...\n`
    );
    comm.guideCommand("To create a plugin ...", "bimio create -p <pluginName>");
    return;
  }

  for (let plugin of plugins) {
    const pluginPath = path.join(pluginDir, plugin);
    if (fs.lstatSync(pluginPath).isDirectory()) {
      comm.log("");
      await exports.uploadPlugin(plugin, asNew);
    }
  }
};
