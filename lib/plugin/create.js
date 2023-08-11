"use strict";

const chalk = require("chalk");
const debugError = require("debug")("error");
const fs = require("fs");
const path = require("path");
const comm = require("../common/common.js");

/**
 * @module pluginCreator
 * @description A module to handle the creating of plugins.
 */

/**
 * Check if a plugin path is valid
 * @param {string} pluginName - The name of the plugin
 * @param {string} projectPath - The path of the project
 * @returns {Object} The result of the check
 */
const checkPluginPath = (pluginName, projectPath) => {
  // Check public/PLUGINS
  const pluginsPath = path.join(
    process.cwd(),
    projectPath ? projectPath : "public/PLUGINS"
  );
  if (!fs.existsSync(pluginsPath)) {
    let msg =
      `Plugin path does not exist ...\n` +
      `Check your path : ${chalk.underline(pluginsPath)}\n`;
    return comm.formatResultMessage(true, msg);
  }

  // Check public/PLUGINS/:pluginName
  const pluginPath = path.join(pluginsPath, pluginName);
  if (fs.existsSync(pluginPath)) {
    let msg =
      `Plugin ${chalk.bold('"' + pluginName + '"')} already exists. ` +
      `Try with another name ...`;
    return comm.formatResultMessage(true, msg);
  }

  return comm.formatResultMessage(false, "Success", { path: pluginPath });
};

/**
 * Create the necessary directories for the plugin
 * @param {string} pluginPath - The path where to create the directories
 */
const createWorkDirectories = pluginPath => {
  comm.logWithColor(chalk.dim, " Create work directories ...");

  fs.mkdirSync(pluginPath);
  fs.mkdirSync(path.join(pluginPath, "assets"));
  fs.mkdirSync(path.join(pluginPath, "assets", "img"));
  fs.mkdirSync(path.join(pluginPath, "css"));
  fs.mkdirSync(path.join(pluginPath, "img"));
  fs.mkdirSync(path.join(pluginPath, "js"));
  fs.mkdirSync(path.join(pluginPath, "lang"));
  fs.mkdirSync(path.join(pluginPath, "templates"));
};

/**
 * Create sample assets for the plugin
 * @param {string} pluginPath - The path where to create the assets
 */
const createSampleAssets = async pluginPath => {
  comm.logWithColor(chalk.dim, ` Create file assets/img/logo.png ...`);

  const sourceAssetPath = path.join(__dirname, "../..", "assets");
  const srcLogo = path.join(sourceAssetPath, "img", "logo-white.png");

  const distAssetPath = path.join(pluginPath, "assets");
  const distLogo = path.join(distAssetPath, "img", "logo.png");

  try {
    await fs.promises.copyFile(srcLogo, distLogo);
  } catch (err) {
    debugError("Failed to copy asset file ...\n" + err.toString());
  }
};

/**
 * Create a sample CSS file for the plugin
 * @param {string} pluginName - The name of the plugin
 * @param {string} pluginPath - The path where to create the CSS file
 */
const createSampleCSS = (pluginName, pluginPath) => {
  comm.logWithColor(chalk.dim, ` Create file css/${pluginName}.css ...`);

  // css/:pluginName.css
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
};

/**
 * Create a sample JS file for the plugin
 * @param {string} pluginName - The name of the plugin
 * @param {string} pluginPath - The path where to create the JS file
 */
const createSampleJS = (pluginName, pluginPath) => {
  comm.logWithColor(chalk.dim, ` Create file js/${pluginName}.js ...`);

  // js/:pluginName.js
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
        window.open('https://developer.hitbim.com/bim/docs', '_blank');
      });
    });
  });
`;
  fs.writeFileSync(
    path.join(pluginPath, "js", `${pluginName}.js`),
    sampleJS,
    "utf8"
  );
};

/**
 * Create sample language files for the plugin
 * @param {string} pluginPath - The path where to create the language files
 */
const createSampleLang = pluginPath => {
  comm.logWithColor(chalk.dim, " Create file lang/en.json, kr.json ...");

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
};

/**
 * Create a sample template file for the plugin
 * @param {string} pluginName - The name of the plugin
 * @param {string} pluginPath - The path where to create the template file
 */
const createSampleTemplate = (pluginName, pluginPath) => {
  comm.logWithColor(chalk.dim, ` Create file templates/${pluginName}.html ...`);

  // templates/templates.html
  const templatesHtmlData = `
<bim>
  <div class="main">
    <img class="logo" src="./assets/img/logo.png" />
    <p style="margin-bottom:0;">Edit <code>templates/${pluginName}.html</code></p>
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
};

/**
 * Create a sample index file for the plugin
 * @param {string} pluginName - The name of the plugin
 * @param {string} pluginPath - The path where to create the index file
 */
const createSampleIndex = (pluginName, pluginPath) => {
  comm.logWithColor(chalk.dim, " Create file index.html ...");

  // index.html
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
</html>
`;

  fs.writeFileSync(
    path.join(pluginPath, `${pluginName}.html`),
    indexHtmlData,
    "utf8"
  );
};

/**
 * Create a sample key file for the plugin
 * @param {string} pluginPath - The path where to create the key file
 */
const createSampleKey = pluginPath => {
  // key
  comm.logWithColor(chalk.dim, " Create file key ...");
  fs.writeFileSync(path.join(pluginPath, "key"), "", "utf8");
};

/**
 * Create a sample config file for the plugin
 * @param {string} pluginName - The name of the plugin
 * @param {string} pluginPath - The path where to create the config file
 */
const createSampleConfig = (pluginName, pluginPath) => {
  comm.logWithColor(chalk.dim, " Create plugin config.json ...");

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
};

/**
 * Create a new plugin
 * @param {string} pluginName - The name of the plugin
 * @param {string} projectPath - The path of the project
 */
exports.createPlugin = async (pluginName, projectPath) => {
  const checkPluginPathResult = checkPluginPath(pluginName, projectPath);
  if (checkPluginPathResult.error) {
    return comm.logWithColor(chalk.yellowBright, checkPluginPathResult.message);
  }
  const pluginPath = checkPluginPathResult.data.path;

  comm.logWithColor(
    chalk.cyan,
    `Hitbim Create Plugin "${pluginName}" Start ...`
  );

  // Create work directories ...
  createWorkDirectories(pluginPath);

  // Create Sample assets ...
  createSampleAssets(pluginPath);

  // Create Sample CSS ...
  createSampleCSS(pluginName, pluginPath);

  // Create Sample JS ...
  createSampleJS(pluginName, pluginPath);

  // Create Sample lang ...
  createSampleLang(pluginPath);

  // Create Sample Template ...
  createSampleTemplate(pluginName, pluginPath);

  // Create Sample index.html ...
  createSampleIndex(pluginName, pluginPath);

  // Create Sample key ...
  createSampleKey(pluginPath);

  // Create Sample config ...
  createSampleConfig(pluginName, pluginPath);

  // Create Process Success ...
  comm.log(
    `\nPlugin ${chalk.bold('"' + pluginName + '"')} has been ${chalk.green(
      "successfully"
    )} created.\n`
  );
};
