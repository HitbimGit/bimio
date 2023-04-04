"use strict";

const fs = require("fs");
const path = require("path");
const figlet = require("figlet-promised");

const cnst = require("../constants.js");
const comm = require("../common/common.js");

const plugin = require("../plugin/plugin.js");

const project = {
  createProject: async projectName => {
    const projectPath = path.join(process.cwd(), projectName);
    if (fs.existsSync(projectPath)) {
      comm.log(
        cnst.BIM_MSG_LOG_RED +
          `Error: Directory "${projectName}" already exists.`
      );
      return;
    }

    const figletStr = await figlet("Hitbim");
    console.log(`${figletStr}`);

    comm.log(cnst.BIM_MSG_LOG + "Hitbim Create Project Start");

    // Create project folders
    fs.mkdirSync(projectPath);
    fs.mkdirSync(path.join(projectPath, "public"));
    fs.mkdirSync(path.join(projectPath, "public", "COMPONENTS"));
    fs.mkdirSync(path.join(projectPath, "public", "PLUGINS"));
    fs.mkdirSync(path.join(projectPath, "public", "SDK"));

    // Create a sample app.html file
    const htmlContent = `
<!--
  Hitbim © copyright

  Copyright © Hitbim© 2012 All Rights Reserved
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
    <title>${projectName}</title>
    <meta http-equiv="Content-Type" content="text/html, charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>Hello ${projectName}!</h1>
  </body>
</html>`;

    fs.writeFileSync(
      path.join(projectPath, "public", "app.html"),
      htmlContent,
      "utf8"
    );

    comm.log(
      cnst.BIM_MSG_LOG_INFO +
        `Project "${projectName}" has been successfully created.`
    );

    await plugin.createPlugin("Sample1", `${projectName}/public/PLUGINS`);
  },
  runProject: async => {},
  buildProject: async projectName => {},
};

module.exports = project;
