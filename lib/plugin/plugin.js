"use strict";

const { createPlugin } = require("./create.js");
const { buildPlugin } = require("./build.js");
const { uploadPlugin, uploadAllPlugins } = require("./upload.js");
const { downloadPlugin } = require("./download.js");
const { showPluginList } = require("./mylist.js");

const plugin = {
  /**
   * @description
   * Create a new plugin with samples.
   * @function createPlugin
   * @author HyunHo
   * @since 23.04.03
   * @lastupdate 23.07.21
   * @param {string} pluginName Plugin Name
   * @param {string} projectPath Project Directory
   * @returns {Promise<void>}
   */
  createPlugin: createPlugin,

  /**
   * @description
   * Create a zip file
   *  - Add 'build' command
   *  - public/PLUGINS -> plugins.zip
   * @function buildPlugin
   * @author KNJ
   * @since 23.04.03
   * @lastupdate 23.04.03
   */
  buildPlugin: buildPlugin,

  /**
   * @description
   * Uploads a specific plugin to the server.
   * @function uploadPlugin
   * @author HyunHo
   * @since 23.06.15
   * @lastupdate 23.06.30
   * @param {string} pluginName Plugin Name
   * @param {boolean} asNew Upload as a new plugin or not
   * @returns {Object}
   * Response from server
   */
  uploadPlugin: uploadPlugin,

  /**
   * @description
   * Uploads all plugins to the server.
   * @function uploadAllPlugins
   * @author HyunHo
   * @since 23.06.16
   * @lastupdate 23.06.20
   * @returns {Object}
   * Response from Server.
   */
  uploadAllPlugins: uploadAllPlugins,

  /**
   * @description
   * Downloads a specific plugin from the server.
   * @function downloadPlugin
   * @author HyunHo
   * @since 23.06.14
   * @lastupdate 23.06.30
   * @param {string} pluginId Plugin ID
   */
  downloadPlugin: downloadPlugin,

  /**
   * @description
   * Show my plugin list from the server.
   * @function showPluginList
   * @author HyunHo
   * @since 23.06.19
   * @lastupdate 23.07.05
   */
  showPluginList: showPluginList,
};

module.exports = plugin;
