"use strict";

const chalk = require("chalk");
const debugError = require("debug")("error");
const fs = require("fs");
const path = require("path");
const comm = require("../common/common.js");

/**
 * @module componentCreator
 * @description A module to handle the creating of components.
 */

/**
 * Check if a component path is valid
 * @param {string} componentName - The name of the component
 * @param {string} projectPath - The path of the project
 * @returns {Object} The result of the check
 */
const checkComponentPath = (componentName, projectPath) => {
  // Check public/COMPONENTS
  const componentsPath = path.join(
    process.cwd(),
    projectPath ? projectPath : "public/COMPONENTS"
  );
  if (!fs.existsSync(componentsPath)) {
    let msg =
      `Component path does not exist ...\n` +
      `Check your path : ${chalk.underline(componentsPath)}\n`;
    return comm.formatResultMessage(true, msg);
  }

  // Check public/COMPONENTS/tabbar
  const tabbarPath = path.join(componentsPath, "tabbar");

  // If tabbarPath doesn't exist, create
  if (!fs.existsSync(tabbarPath)) {
    fs.mkdirSync(tabbarPath);
  }

  // Check public/COMPONENTS/:componentName
  const componentPath = path.join(tabbarPath, componentName);
  if (fs.existsSync(componentPath)) {
    let msg =
      `Component ${chalk.bold('"' + componentName + '"')} already exists. ` +
      `Try with another name ...`;
    return comm.formatResultMessage(true, msg);
  }

  return comm.formatResultMessage(false, "Success", { path: componentPath });
};

/**
 * Create the necessary directories for the component
 * @param {string} componentPath - The path where to create the directories
 */
const createWorkDirectories = componentPath => {
  comm.logWithColor(chalk.dim, " Create work directories ...");

  fs.mkdirSync(componentPath);
  fs.mkdirSync(path.join(componentPath, "assets"));
  fs.mkdirSync(path.join(componentPath, "css"));
  fs.mkdirSync(path.join(componentPath, "js"));
};

/**
 * Create a sample CSS file for the component 'tabbar'
 * @param {string} componentPath - The path where to create the CSS file
 */
const createTabbarSampleCSS = componentPath => {
  comm.logWithColor(chalk.dim, ` Create file css/tabbar.css ...`);

  // css/:componentName.css
  const sampleCSS = `
@import url("https://use.fontawesome.com/releases/v5.0.9/css/all.css");

html {
  height: 100%;
  border-top: solid 1px #cbcbcb;
}
body {
  font-family: "Sawasdee", sans-serif;
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  height: 100%;
  padding: 0;
  margin: 0;
  z-index: 100;
}
h1 {
  text-align: center;
  text-transform: uppercase;
}
.tab-nav-container {
  background-color: #fff;

  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  display: flex;
  justify-content: space-between;

  width: 100%;
  height: 100%;
}
.tab {
  background: #ffffff;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  margin: 0 10px;
  transition: background 0.4 linear;
}
.tab i {
  font-size: 1.2em;
}
.tab p {
  font-weight: bold;
  overflow: hidden;
  max-width: 0;
}
.tab.active p {
  margin-left: 10px;
  max-width: 200px;
  transition: max-width 0.4s linear;
}
.tab.active.purple {
  background-color: rgba(91, 55, 183, 0.2);
  color: rgba(91, 55, 183, 1);
}
.tab.active.pink {
  background-color: rgba(201, 55, 157, 0.2);
  color: rgba(201, 55, 157, 1);
}
.tab.active.yellow {
  background-color: rgba(230, 169, 25, 0.2);
  color: rgba(230, 169, 25, 1);
}
.tab.active.teal {
  background-color: rgba(28, 150, 162, 0.2);
  color: rgba(28, 150, 162, 1);
}

@media (max-width: 450px) {
  .tab-nav-container {
    width: 100%;
  }
  .tab {
    padding: 0 10px;
    margin: 0;
  }
  .tab i {
    font-size: 1em;
  }
}
`;

  fs.writeFileSync(
    path.join(componentPath, "css", `tabbar.css`),
    sampleCSS,
    "utf8"
  );
};

/**
 * Create a sample JS file for the component 'tabbar'
 * @param {string} componentPath - The path where to create the JS file
 */
const createTabbarSampleJS = componentPath => {
  comm.logWithColor(chalk.dim, ` Create file js/tabbar.js ...`);

  // js/:componentName.js
  const sampleJS = `
// Select all elements with the class "tab"
const tabs = document.querySelectorAll(".tab");

// Add an event listener for each tab
tabs.forEach(clickedTab => {
  clickedTab.addEventListener("click", () => {
    // Remove the "active" class from all tabs
    tabs.forEach(tab => {
      tab.classList.remove("active");
    });

    // Add the "active" class to the clicked tab
    clickedTab.classList.add("active");
    
    // Extract the plugin and page data from the clicked tab
    const plugin = clickedTab.dataset.plugin;
    const page = clickedTab.dataset.page;

    // Check if the plugin and page data were specified
    if (!plugin || !page) {
      console.log("plugin or page not specified");
      return false;
    }

    // Create a params object for the moveTo function
    const params = {
      page: page,
      plugin: plugin,
      reload: true,
      scrollTop: false,
      animation: true,
    };

    // Use the moveTo function to navigate to the specified plugin and page
    try {
      bim.app.storyboard.moveTo(params);
    } catch (e) {
      // console.error("Error while moveTo: ", e);
    }

    // Post a message to the parent window with the params object
    parent.postMessage(JSON.stringify(params), "*");
  });
});  
`;
  fs.writeFileSync(
    path.join(componentPath, "js", `tabbar.js`),
    sampleJS,
    "utf8"
  );
};

/**
 * Create a sample HTML file for the component 'tabbar'
 * @param {string} componentPath - The path where to create the HTML file
 */
const createTabbarSampleHTML = componentPath => {
  comm.logWithColor(chalk.dim, ` Create file tabbar.html ...`);

  // :componentName.html
  const sampleHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html, charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, height=device-height initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
    />
    <!-- Link to an external CSS file. This CSS file should contain styles related to your component. -->
    <link rel="stylesheet" type="text/css" href="./css/tabbar.css" />
    <!-- Link to an external JavaScript file. The 'navtab.js' is a library from Hitbim that provides some useful functions for navigation tabs. -->
    <script
      type="text/javascript"
      src="https://cdn.hitbim.com/v/2.1.1/navtab.js"
    ></script>
  </head>
  <body>
    <!-- This is the container for the tab navigation. Each 'tab' div represents a tab in the navigation. -->
    <!-- You should customize each tab with the appropriate data-plugin and data-page attributes for navigation. -->
    <!-- The 'fas' and 'far' classes are part of the FontAwesome library for icons. -->
    <div class="tab-nav-container">
      <!-- Fill in the appropriate data-plugin and data-page values for each tab. -->
      <div class="tab active purple" data-plugin="Sample1" data-page="Sample1">
        <i class="fas fa-home"></i>
        <p>Home</p>
      </div>
      <!-- Fill in the appropriate data-plugin and data-page values for each tab. -->
      <div class="tab pink" data-plugin="Sample2" data-page="Sample2">
        <i class="far fa-heart"></i>
        <p>Likes</p>
      </div>
      <!-- Fill in the appropriate data-plugin and data-page values for each tab. -->
      <div class="tab yellow" data-plugin="Sample3" data-page="Sample3">
        <i class="fas fa-search"></i>
        <p>Search</p>
      </div>
      <!-- Fill in the appropriate data-plugin and data-page values for each tab. -->
      <div class="tab teal" data-plugin="Sample4" data-page="Sample4">
        <i class="far fa-user"></i>
        <p>Profile</p>
      </div>
    </div>
    <!-- Link to the JavaScript file that contains logic for your component. -->
    <script type="text/javascript" src="./js/tabbar.js"></script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(componentPath, `tabbar.html`), sampleHTML, "utf8");
};

/**
 * Create a new component
 * @param {string} componentName - The name of the component
 * @param {string} projectPath - The path of the project
 */
exports.createComponent = async (componentName, projectPath) => {
  const checkComponentPathResult = checkComponentPath(
    componentName,
    projectPath
  );
  if (checkComponentPathResult.error) {
    return comm.logWithColor(
      chalk.yellowBright,
      checkComponentPathResult.message
    );
  }
  const componentPath = checkComponentPathResult.data.path;

  comm.logWithColor(
    chalk.cyan,
    `Hitbim Create Component "${componentName}" Start ...`
  );

  // Create work directories ...
  createWorkDirectories(componentPath);

  // Create Sample CSS ...
  createTabbarSampleCSS(componentPath);

  // Create Sample JS ...
  createTabbarSampleJS(componentPath);

  // Create Sample HTML ...
  createTabbarSampleHTML(componentPath);

  // Create Process Success ...
  comm.log(
    `\nComponent ${chalk.bold(
      '"' + componentName + '"'
    )} has been ${chalk.green("successfully")} created.`
  );
};
