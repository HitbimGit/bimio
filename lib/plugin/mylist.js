"use strict";

const chalk = require("chalk");
const Table = require("cli-table");
const debugServer = require("debug")("server");

const clearConsole = require("../utils/clearConsole.js");
const comm = require("../common/common.js");
const config = require("../server/config.js");
const safeRequest = require("../server/saferequest.js");

/**
 * @module pluginViewer
 * @description A module to handle the viewing of list of plugins.
 */

/**
 * @description
 * This function retrieves the list of plugins available
 * and displays them in a table on the console.
 * @async
 * @function showPluginList
 * @returns {Promise<void>}
 * Promise representing the completion of the plugin listing operation.
 */
exports.showPluginList = async function () {
  // Sending request to get plugin list
  const response = await safeRequest.sendWithToken(
    true,
    config.plugin_server.list
  );
  if (response.status === 200) {
    const responseData = response.data;
    debugServer("response data : ", responseData);

    if (!responseData || responseData.error) {
      // When the response data contains an error
      comm.logWithColor(chalk.redBright, `Failed to get my plugin list ...\n`);
      debugServer(
        `Failed to get my plugin list.\n` + responseData.message
          ? `Reason : ${responseData.message}`
          : response.message || response.msg
          ? `Reason : ${response.message || response.msg}`
          : ""
      );
      return;
    }

    let pluginList = responseData.value;

    if (!pluginList) {
      // When there's no data in the response
      comm.logWithColor(chalk.yellowBright, "No plugin list data ...");
      return;
    } else if (pluginList.length === 0) {
      // When the response data has no plugins
      comm.logWithColor(
        chalk.yellowBright,
        "No plugin list data on server yet ..."
      );

      comm.guideCommand(
        "Upload your plugin first to server ...",
        "bimio upload -p <pluginName>"
      );
      return;
    }

    // Clear the console for clean output
    clearConsole();

    // Create Table Object to format the output
    const table = new Table({
      head: [
        chalk.cyanBright("No."),
        chalk.cyanBright("Plugin Name"),
        chalk.cyanBright("Plugin ID"),
      ],
      colWidths: [5, 20, 55],
    });
    comm.logWithColor(chalk.cyan, "\nShow My Plugin List ...\n");

    let index = 0;
    for (let pluginData of pluginList) {
      // Pushing plugin data to the table
      table.push([++index, pluginData._plugin_name, pluginData._plugin_id]);
    }

    // Print the table to the console
    comm.log(table.toString());

    comm.guideCommand(
      "\nTo download plugin ...",
      "bimio download -p <pluginID>"
    );
  }
};
