"use strict";

const fs = require("fs");
const path = require("path");
const figlet = require("figlet-promised");
const archiver = require('archiver');

const cnst = require("../constants.js");
const comm = require("../common/common.js");

const plugin = {
  createPlugin: async (pluginName, projectPath) => {
    const pluginPath = path.join(
      process.cwd(),
      projectPath ? projectPath : "",
      pluginName
    );
    if (fs.existsSync(pluginPath)) {
      comm.log(
        cnst.BIM_MSG_LOG_RED +
          `Error: Directory "${pluginName}" already exists.`
      );
      return;
    }

    if (!projectPath) {
      const figletStr = await figlet("Hitbim");
      console.log(`${figletStr}`);
    }

    comm.log(cnst.BIM_MSG_LOG + "Hitbim Create Plugin Start");

    fs.mkdirSync(pluginPath);
    fs.mkdirSync(path.join(pluginPath, "assets"));
    fs.mkdirSync(path.join(pluginPath, "css"));
    fs.mkdirSync(path.join(pluginPath, "img"));
    fs.mkdirSync(path.join(pluginPath, "js"));
    fs.mkdirSync(path.join(pluginPath, "lang"));
    fs.mkdirSync(path.join(pluginPath, "SQL"));
    fs.mkdirSync(path.join(pluginPath, "templates"));
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create project folders");

    // css/templates.css
    fs.writeFileSync(
      path.join(pluginPath, "css", `${pluginName}.css`),
      "",
      "utf8"
    );
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create project css/templates.css");

    // js/templates.js
    fs.writeFileSync(
      path.join(pluginPath, "js", `${pluginName}.js`),
      "",
      "utf8"
    );
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create project js/templates.js");

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
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create project lang/en, kr.json");

    // templates/templates.html
    const templatesHtmlData = `
    <bim>
        <p>Hello Bim</p>
    </bim>
        `;
    fs.writeFileSync(
      path.join(pluginPath, "templates", `${pluginName}.html`),
      templatesHtmlData,
      "utf8"
    );
    comm.log(
      cnst.BIM_MSG_LOG_WARNING + "Create project templates/templates.html"
    );

    // index.html
    const indexHtmlData = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>${pluginName}</title>
            <meta http-equiv="Content-Type" content="text/html, charset=utf-8" />
            <meta name="viewport" content="width=device-width, height=device-height initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
            <link rel="stylesheet" type="text/css" href="css/${pluginName}.css">
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
        
            <script type="text/javascript" src="js/${pluginName}.js"></script>         
        </body>
    </html>
`;
    fs.writeFileSync(
      path.join(pluginPath, `${pluginName}.html`),
      indexHtmlData,
      "utf8"
    );
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create project index.html");

    // key
    fs.writeFileSync(path.join(pluginPath, "key"), "", "utf8");
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create project key");

    // config.json
    const configData = {
      plugin: {
        version: "0.0.1",
        index: `${pluginName}.html`,
        icon: "assets/ico.png",
        screenshot: "assets/screenshot.png",
        name: `${pluginName}-plugin`,
        pluginid: "Please enter your pluginid",
        requirement: "chrome, firefox, MS edge",
      },
    };
    fs.writeFileSync(
      path.join(pluginPath, "config.json"),
      JSON.stringify(configData, null, "\t"),
      "utf8"
    );
    comm.log(cnst.BIM_MSG_LOG_WARNING + "Create plugin config.json");

    comm.log(
      cnst.BIM_MSG_LOG_INFO +
        `Plugin "${pluginName}" has been successfully created`
    );
  },
  
  /**
   * Create a zip file
   *  - Add 'build' command
   *  - public/PLUGINS -> plugins.zip
   */
  buildPlugin: function() {            
      const projectDir = process.cwd();
      
      const buildDir = path.join(projectDir, 'build');
      if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir);
      }
      
      const targetDir = path.join(projectDir, "./public/PLUGINS");
      if (!fs.existsSync(targetDir)) {
          comm.log(cnst.BIM_MSG_LOG_RED + `Error: ${targetDir} directory not found.`);
          process.exit(1);
      } 

      let count = 0;
      while (fs.existsSync(path.join(buildDir, `plugins-build-${count}.zip`))) {
        count++;
      }
      const output = fs.createWriteStream(path.join(buildDir, `plugins-build-${count}.zip`));
      const archive = archiver('zip');

      archive.on('error', (err) => {           
          comm.log(cnst.BIM_MSG_LOG_RED + `Error occurred while archiving: ${err.message}`);

          process.exit(1);
      });

      output.on('close', () => {
        comm.log(cnst.BIM_MSG_LOG_INFO + `build has been finalized`);
      });

      archive.glob('**/*', { cwd: targetDir, ignore: [] });
      archive.pipe(output);
      archive.finalize();      
  }

};

module.exports = plugin;
