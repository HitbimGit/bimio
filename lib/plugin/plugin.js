"use strict";

const AdmZip = require("adm-zip");
const archiver = require("archiver");
const chalk = require("chalk");
const Table = require("cli-table");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const debugError = require("debug")("error");
const debugServer = require("debug")("server");

const clearConsole = require("../utils/clearConsole.js");
const comm = require("../common/common.js");
const config = require("../server/config.js");
const safeRequest = require("../server/saferequest.js");

const plugin = {
  /**
   * @function createPlugin
   * @param {string} pluginName Plugin Name
   * @param {string} projectPath Project Directory
   * @returns
   */
  createPlugin: async (pluginName, projectPath) => {
    const pluginPath = path.join(
      process.cwd(),
      projectPath ? projectPath : "public/PLUGINS",
      pluginName
    );
    if (fs.existsSync(pluginPath)) {
      comm.logWithColor(
        chalk.yellowBright,
        `Plugin ${chalk.bold('"' + pluginName + '"')} already exists.`,
        `Try with another name ...`
      );
      return;
    }

    comm.logWithColor(chalk.cyan, "Hitbim Create Plugin Start ...");

    comm.logWithColor(chalk.dim, " Create work directories ...");
    fs.mkdirSync(pluginPath);
    fs.mkdirSync(path.join(pluginPath, "assets"));
    fs.mkdirSync(path.join(pluginPath, "css"));
    fs.mkdirSync(path.join(pluginPath, "img"));
    fs.mkdirSync(path.join(pluginPath, "js"));
    fs.mkdirSync(path.join(pluginPath, "lang"));
    fs.mkdirSync(path.join(pluginPath, "templates"));

    // css/templates.css
    const sampleCSS = `
html,
body {
  height: 100%;
  width: 100%;
}
body {
  margin: 0;
  font-family: "Inter", "Pretendard", "Roboto", -apple-system,
    BlinkMacSystemFont;
  font-size: 2.5vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 500;
  text-align: center;
  color: #f7f8fa;
  background-color: #4285f4;
}
code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
  color: #fff23c;
  font-weight: 500;
}
img.logo {
  margin-bottom: 3rem;
  width: 105px;
}
div.main {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
#learnBtn {
  background-color: #f7f8fa;
  color: #4285f4;
  cursor: pointer;
  font-weight: 600;
  outline: none;
  border: 0;
  font-size: 1rem;
  border-radius: 7px;
  padding: 1rem;
  margin-top: 0.4rem;
}

@media (prefers-reduced-motion: no-preference) {
  .logo {
    animation: logo-spin infinite 4s linear;
  }
}
@keyframes logo-spin {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-85deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(85deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
`;
    fs.writeFileSync(
      path.join(pluginPath, "css", `${pluginName}.css`),
      sampleCSS,
      "utf8"
    );
    comm.logWithColor(chalk.dim, ` Create file css/${pluginName}.css ...`);

    // js/templates.js
    const sampleJS = `
// Initialize your app
bim.app
  .init({
    name: "${pluginName}", 
    pluginId: "plugin-sample"
  })
  .then(() => {
    // Build bim template
    bim.app.template({
      id : bim.plugin.id.get(), 
      html: "templates/${pluginName}.html", 
      name: bim.plugin.name.get(), 
      context: { lang: "lang/en", detect: false, } 
    }).then(compiled => {
      // Handle Error
      if (compiled.error) alert(compiled.message, document.title);
      else {
        // Append HTML contents to page
        $B.append({ $: ".app-content" }, compiled.template);
      }
    }).then(() => {
      // Do Something you want here ..
      document.getElementById('learnBtn').addEventListener('click', function() {
        window.open('https://developer.hitbim.com/docs', '_blank');
      });
    });
  });
`;
    fs.writeFileSync(
      path.join(pluginPath, "js", `${pluginName}.js`),
      sampleJS,
      "utf8"
    );
    comm.logWithColor(chalk.dim, ` Create file js/${pluginName}.js ...`);

    // lang/en, kr.json
    const langEN = {
      title: "Plugin_Base",
      content: "Make your own Plugin!",
    };
    const langKR = {
      title: "Plugin_Base",
      content: "나만의 플러그인을 만드세요!",
    };
    fs.writeFileSync(
      path.join(pluginPath, "lang", `en.json`),
      JSON.stringify(langEN, null, "\t"),
      "utf8"
    );
    fs.writeFileSync(
      path.join(pluginPath, "lang", `kr.json`),
      JSON.stringify(langKR, null, "\t"),
      "utf8"
    );
    comm.logWithColor(chalk.dim, " Create file lang/en.json, kr.json ...");

    // templates/templates.html
    const templatesHtmlData = `
<bim>
  <div class="main">
    <img class="logo" src="/assets/img/logo-white.png" />
    <p style="margin-bottom:0;">Edit <code>src/${pluginName}.html</code></p>
    <p style="margin-top:5px;">and save to reload.</p>
    <button type="button" id="learnBtn">Learn more</button>
  </div>
</bim>  
`;
    fs.writeFileSync(
      path.join(pluginPath, "templates", `${pluginName}.html`),
      templatesHtmlData,
      "utf8"
    );
    comm.logWithColor(
      chalk.dim,
      ` Create file templates/${pluginName}.html ...`
    );

    // index.html
    comm.logWithColor(chalk.dim, " Create file index.html ...");
    const indexHtmlData = `
<!--
  Hitbim © copyright

  Copyright © Hitbim 2023 All Rights Reserved
  All files and information contained in this Software are copyright by Hitbim, hitbim.com
  and may not be duplicated, copied, modified or adapted, in any way without our written permission.
  Our Software, Tools, Website, and Services may contain our service marks or trademarks as well as those of our affiliates
  or other companies, in the form of words, graphics, and logos.
  Your use of our Software and Services does not constitute any right or license for you
  to use our Services, Tools, Software, marks or trademarks, without the prior written permission of Hitbim.

  Our Content, as found within our Software, Website, Tools and Services, are protected under United States and foreign copyrights.
  The copying, redistribution, use or publication by you of any such Content, is strictly prohibited.
  Your use of our Software, Website, Tools and Services does not grant you any ownership rights to our Content.

  Copyright © Hitbim ©. All Rights Reserved. Hitbim, hitbim.com
-->
<!DOCTYPE html>
<html>
  <head>
    <title>${pluginName}</title>
    <meta http-equiv="Content-Type" content="text/html, charset=utf-8" />
    <meta name="viewport" content="width=device-width, height=device-height initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <link rel="stylesheet" type="text/css" href="./css/${pluginName}.css">
    <script 
      type="text/javascript" 
      src="https://cdn.hitbim.com/v/2.1.1/sdk/bim.sdk.js"
    ></script>
    <script
      type="text/javascript"
      src="https://cdn.hitbim.com/v/2.0.0/sdk/migrate.tool.js"
    ></script>
    </head>
    <body>	
    <div class="views">
      <div class="view view-main">
        <div class="pages">
          <div class="page">
            <div class="page-content app-content"></div>
          </div>
        </div>
      </div>
    </div>
    <script type="text/javascript" src="./js/${pluginName}.js"></script>         
  </body>
</html>`;

    fs.writeFileSync(
      path.join(pluginPath, `${pluginName}.html`),
      indexHtmlData,
      "utf8"
    );

    // key
    comm.logWithColor(chalk.dim, " Create file key ...");
    fs.writeFileSync(path.join(pluginPath, "key"), "", "utf8");

    // config.json
    const configData = {
      plugin: {
        version: "0.0.1",
        index: `${pluginName}.html`,
        icon: "assets/ico.png",
        screenshot: "assets/screenshot.png",
        name: `${pluginName}`,
        pluginid: "",
        requirement: "chrome, firefox, MS edge",
      },
    };
    fs.writeFileSync(
      path.join(pluginPath, "config.json"),
      JSON.stringify(configData, null, "\t"),
      "utf8"
    );
    comm.logWithColor(chalk.dim, " Create plugin config.json ...");

    comm.log(
      `\nPlugin ${chalk.bold('"' + pluginName + '"')} has been ${chalk.green(
        "successfully"
      )} created.`
    );
  },

  /**
   * Create a zip file
   *  - Add 'build' command
   *  - public/PLUGINS -> plugins.zip
   */
  buildPlugin: function () {
    const projectDir = process.cwd();

    const buildDir = path.join(projectDir, "build");
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }

    const targetDir = path.join(projectDir, "./public/PLUGINS");
    if (!fs.existsSync(targetDir)) {
      comm.logWithColor(
        chalk.yellowBright,
        `Directory ${chalk.underline(targetDir)} is not found ...`
      );
      process.exit(1);
    }

    let count = 0;
    while (fs.existsSync(path.join(buildDir, `plugins-build-${count}.zip`))) {
      count++;
    }
    const output = fs.createWriteStream(
      path.join(buildDir, `plugins-build-${count}.zip`)
    );
    const archive = archiver("zip");

    archive.on("error", err => {
      comm.error(`Error [${err.message}] occurred while archiving ...`);
      debugError("Full Error : ", err);
      process.exit(1);
    });

    output.on("close", () => {
      comm.log(`build has been finalized`);
    });

    archive.glob("**/*", { cwd: targetDir, ignore: [] });
    archive.pipe(output);
    archive.finalize();
  },

  /**
   * @function uploadPlugin
   * @author HyunHo
   * @since 23.06.15
   * @lastupdate 23.06.30
   * @param {string} pluginName Plugin Name
   * @param {boolean} asNew Upload as new plugin or not
   * @returns {Object}
   * Response from server
   */
  uploadPlugin: async function (pluginName, asNew) {
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
              `Failed to upload Plugin "${pluginName}".\n` +
                responseData.message
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
        comm.logWithColor(
          chalk.redBright,
          `Uploading "${pluginName}" failed.\n`
        );
        debugError("Full Error : ", error);
      }
    }

    const pluginPath = path.join(process.cwd(), "public/PLUGINS", pluginName);
    if (!fs.existsSync(pluginPath)) {
      comm.logWithColor(
        chalk.yellowBright,
        `Plugin "${pluginName}" does not exist.`
      );
      comm.guideCommand(
        "Check your directory ... ",
        chalk.underline(pluginPath)
      );
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
    comm.logWithColor(
      chalk.dim,
      ` Upload Plugin "${pluginName}" to server ...`
    );
    await recursiveUpload(true);
  },

  /**
   * @function uploadAllPlugins
   * @author HyunHo
   * @since 23.06.16
   * @lastupdate 23.06.20
   * @returns {Object}
   * Response from Server.
   */
  uploadAllPlugins: async function (asNew) {
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
      comm.guideCommand(
        "To create a plugin ...",
        "bimio create -p <pluginName>"
      );
      return;
    }

    for (let plugin of plugins) {
      const pluginPath = path.join(pluginDir, plugin);
      if (fs.lstatSync(pluginPath).isDirectory()) {
        comm.log("");
        await module.exports.uploadPlugin(plugin, asNew);
      }
    }
  },

  /**
   * @function downloadPlugin
   * @author HyunHo
   * @since 23.06.14
   * @lastupdate 23.06.30
   * @param {string} pluginId Plugin ID
   */
  downloadPlugin: async function (pluginId) {
    /**
     * @inner
     * @function recursiveDownload
     * @author HyunHo
     * @since 23.06.19
     * @lastupdate 23.06.21
     * @param {boolean} recursive Send Request to Server again or not
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
              comm.logWithColor(
                chalk.dim,
                ` Extracting downloaded Plugin ...\n`
              );
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
  },

  /**
   * @function showPluginList
   * @author HyunHo
   * @since 23.06.19
   * @lastupdate 23.07.05
   */
  showPluginList: async function () {
    const response = await safeRequest.sendWithToken(
      true,
      config.plugin_server.list
    );
    if (response.status === 200) {
      const responseData = response.data;
      debugServer("response data : ", responseData);

      if (!responseData || responseData.error) {
        comm.logWithColor(
          chalk.redBright,
          `Failed to get my plugin list ...\n`
        );
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
        comm.logWithColor(chalk.yellowBright, "No plugin list data ...");
        return;
      } else if (pluginList.length === 0) {
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

      clearConsole();

      // Create Table Object
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
        // let formattedDate = new Date(pluginData._plugin_date).toLocaleString();
        table.push([
          ++index,
          pluginData._plugin_name,
          pluginData._plugin_id,
          // formattedDate,
        ]);
      }

      comm.log(table.toString());

      comm.guideCommand(
        "\nTo download plugin ...",
        "bimio download -p <pluginID>"
      );
    }
  },
};

module.exports = plugin;
