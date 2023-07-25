"use strict";

const chalk = require("chalk");
const { Command } = require("commander");
const debug = require("debug");
const readlineSync = require("readline-sync");

const clearConsole = require("./utils/clearConsole.js");
const comm = require("./common/common.js");
const component = require("./component/component.js");
const openBrowser = require("./utils/openBrowser.js");
const plugin = require("./plugin/plugin.js");
const project = require("./project/project.js");
const session = require("./user/session.js");

const program = new Command();

program
  .name("bimio")
  .description("CLI for Hitbim Plugin Development")
  .version(
    `${comm.version}`,
    "-v, --version",
    "Display current bimio version number"
  )
  .option("-ds, --debug-server", "Output server debug info")
  .option("-de, --debug-error", "Output error debug info")
  .helpOption("-h, --help", "Display help for command");

/**
 * @description
 * Declare 'check' action.
 * This action is used to check and print the current environment variables
 * and API configuration.
 */
const action_check = () => {
  // Clear the console before displaying any logs
  clearConsole();

  comm.logWithColor(chalk.cyan, "Check current environment variables ...\n");

  // Show the current node environment variable
  comm.log("NODE ENV : %s\n", chalk.yellow(process.env.NODE_ENV));

  // Import the API list configuration from the server config module
  let apiList = require("./server/config.js");

  // Loop through and log each server API and its properties
  for (let serverApi in apiList) {
    // serverApi contains a group of related APIs
    for (let api in apiList[serverApi]) {
      // api is a single API within a group
      comm.log(`API: ${chalk.yellow(api)}`);
      comm.log(`  Hostname: ${apiList[serverApi][api].hostname}`);
      comm.log(`  Method  : ${apiList[serverApi][api].method}`);
      comm.log(`  Path    : ${apiList[serverApi][api].path}\n`);
    }
  }
};

/**
 * @command check
 * @description
 * Add 'check' command.
 * This command is used to invoke the 'check' action,
 * which checks and prints the current environment variables and API configuration.
 */
const command_check = program.command("check");
command_check
  .description("Check current environment of BIMIO.")
  .action(action_check);

/**
 * @description
 * Declare 'init' action.
 * This action is used to initialize a new project with the provided project name.
 * If the project name is not provided, it displays a help message.
 * @param {string} projectName - Name of the project
 * @returns {}
 */
const action_init = async projectName => {
  // If project name not provided, show error message and help
  if (!projectName) {
    comm.log(
      `${chalk.yellow("Project Name")} must be provided within ${chalk.yellow(
        "'init'"
      )} command.\n`
    );
    command_init.help();
    return;
  }
  // Create a new project with the given name
  await project.createProject(projectName);

  // Guide the user to change their current directory
  // to the newly created project directory
  comm.guideCommand("To change your directory ... ", `cd ${projectName}`);
};

/**
 * @command init
 * @description
 * Add 'init' command.
 * This command is used to invoke the 'init' action, which initializes a new project.
 * The '<projectName>' after 'init' indicates that the command takes an argument,
 * which is the name of the project to be created.
 */
const command_init = program.command("init <projectName>");
command_init
  .description(`Initialize a new project with the provided project name.`)
  .action(action_init);

/**
 * @description
 * Declare 'create' action.
 * This action is used to generate a standard structure following Hitbim's architecture.
 * This command creates either a plugin or a component depending on the options provided.
 * @param {{ plugin:Array<string>,
 *           component:Array<string>,
 *           directory:string= }}
 * options - Options can include 'plugin', 'component', and 'directory'
 * - 'plugin' and 'component' are arrays of names to be created
 * - 'directory' is an optional parameter specifying the destination for the created items
 * @returns {}
 */
const action_create = async options => {
  // If neither 'plugin' nor 'component' options are provided,
  // show a warning message and help
  if (!options.plugin && !options.component) {
    comm.warn(
      `Either option %s or %s must be selected within %s command.\n`,
      chalk.yellow("'--plugin'"),
      chalk.yellow("'--component'"),
      chalk.yellow("'create'")
    );
    command_create.help();
    return;
  }
  // If 'plugin' option is provided,
  // create a plugin for each name in the 'plugin' array
  if (options.plugin) {
    options.plugin.forEach(async pluginName => {
      // Create plugin start
      await plugin.createPlugin(pluginName, options.directory);
    });
  }
  // If 'component' option is provided,
  // create a component for each name in the 'component' array
  if (options.component) {
    options.component.forEach(async componentName => {
      // Create component start
      await component.createComponent(componentName, options.directory);
    });
  }
};

/**
 * @command create
 * @description
 * Add 'create' command.
 * This command is used to invoke the 'create' action,
 * which generates a standard structure following Hitbim's architecture.
 * This command can take multiple options: 'plugin', 'component', and 'directory'.
 * Each option is described in the .option() method.
 */
const command_create = program.command("create");
command_create
  .description("Generate a standard structure following Hitbim's architecture.")
  .option("-p, --plugin <pluginNames...>", "Generate a sample Plugin")
  .option("-c, --component <componentNames...>", "Generate a sample Component")
  .option(
    "-d, --directory <directory>",
    "(optional) Destination for generated items"
  )
  .action(action_create);

/**
 * @description
 * Declare 'run' action.
 * This action is used to run the current project so that the user can see the preview.
 * The server will start on the localhost, with the port specified in the options.
 * @param {{ port: string }} options
 * - The options object can contain 'port' which specifies the port
 * on which the localhost server should run. Default is 3000.
 * @returns {}
 */
const action_run = async options => {
  // Run project start
  await project.runProject(options.port);
};

/**
 * @command run
 * @description
 * Add 'run' command.
 * This command is used to start the server and run the current project.
 * It uses the 'action_run' function defined above.
 * The command takes an optional parameter 'port' to specify the port
 * on which the server should run. The default is 3000.
 */
const command_run = program.command("run");
command_run
  .description("Run Project to see the preview.")
  .option("-p, --port <port>", "(optional) Port for localhost, default : 3000")
  .action(action_run);

/**
 * @description
 * Declare 'stop' action.
 * This action is used to stop the currently running project.
 * No parameters are required.
 * @returns {}
 */
const action_stop = async () => {
  // Stop running project
  await project.stopProject();
};

/**
 * @command stop
 * @description
 * Add 'stop' command.
 * This command is used to stop the currently running project.
 * It uses the 'action_stop' function defined above.
 * No parameters are required to execute this command.
 */
const command_stop = program.command("stop");
command_stop.description("Stop running Project.").action(action_stop);

/**
 * @description
 * Declare 'signup' action.
 * This action opens the Hitbim signup page in the user's default browser,
 * allowing them to register for Hitbim Services.
 * It does not take any parameters and does not return any values.
 * @returns {}
 */
const action_signup = async () => {
  clearConsole();
  // Hitbim Signup page
  const hitbimSignup = require("./server/config.js")?.main_server?.signup;
  let hitbimLink = hitbimSignup
    ? `${hitbimSignup.hostname}${hitbimSignup.path}`
    : "https://developer.hitbim.com/bim/login?type=signup";
  comm.logWithColor(
    chalk.yellowBright,
    `${chalk.bold("Hitbim signup page")} has been opened in your browser.`
  );
  comm.guideCommand(
    `${chalk.bold("Sign up")} for more advanced use of ${chalk.bold(
      "Hitbim Services"
    )} ...`,
    chalk.underline(hitbimLink)
  );

  // Open Hitbim Signup page in brower
  openBrowser(hitbimLink);
};

/**
 * @command signup
 * Add 'signup' command.
 * This command is used to open the Hitbim signup page in the user's default browser,
 * allowing them to register for Hitbim Services.
 * It uses the 'action_signup' function defined above.
 * This command does not require any parameters.
 */
const command_signup = program.command("signup");
command_signup
  .description("Sign up for Hitbim Services.")
  .action(action_signup);

/**
 * Shows current user session
 */
const showUserSession = async () => {
  // Read current session
  let currentSession = await session.checkSession();
  // Modify time to readable texts
  let timeLeft = comm.getTimeLeft(currentSession.expires);
  comm.log("Currently logged in as %s", chalk.green(currentSession.email));
  comm.log("Your session expires in %s ...", chalk.yellowBright(timeLeft));
};

/**
 * @description
 * Declare 'login' action.
 * This action is used to log in to the Hitbim services.
 * If the user is already logged in, it will show the current user session.
 * If email and password are not provided in the options,
 * it will interactively ask for them.
 * @param {{ email:string=, password:string= }}
 * options - Options can include 'email' and 'password'
 * @returns {}
 */
const action_login = async options => {
  // If user is already logged in ..
  if ((await session.isLoggedIn()) === true) {
    comm.log("You are already logged in.\n");
    await showUserSession();
    comm.guideCommand("To check your current session ...", "bimio session");
    return;
  }

  let { email, password } = options;

  // If email or password is not provided, ask for them
  if (!options.email || !options.password) {
    comm.logWithColor(
      chalk.yellowBright,
      "Required arguments E-mail and Password are needed ...\n"
    );

    email = email || readlineSync.question("email    : ");
    password =
      password ||
      readlineSync.question("password : ", { hideEchoBack: true, mask: "" });
  }
  comm.log("");

  // Try login
  let loginResult = await session.login(email, password);
  if (loginResult.error) {
    // If a problem occurs
    comm.logWithColor(chalk.yellowBright, loginResult.msg);
  } else {
    // Successfully logged in
    comm.logWithColor(chalk.green, loginResult.msg);
  }
};

/**
 * @command login
 * @description
 * Add 'login' command.
 * Log in to Hitbim Services.
 * It will interactively ask for email and password
 * if they are not provided as options.
 */
const command_login = program.command("login");
command_login
  .description("Login to Hitbim Services.")
  .option("-e, --email <email>", "Email address")
  .option("-p, --password <password>", "Password")
  .action(action_login);

/**
 * @description
 * Declare 'logout' action.
 * This action is used to log out from the Hitbim services.
 * It will attempt to log out and print out the result message.
 * @returns {}
 */
const action_logout = async () => {
  // Try to logout
  let logoutResult = await session.logout();
  comm.log(logoutResult.msg);
};

/**
 * @command logout
 * @description
 * Add 'logout' command.
 * Log out from Hitbim Services. It will print out the result message.
 */
const command_logout = program.command("logout");
command_logout
  .description("Logout from Hitbim Services.")
  .action(action_logout);

/**
 * @description
 * Declare 'session' action.
 * This action is used to check the login status of the user.
 * If the user is logged in, it will show the user's session information.
 * If the user is not logged in, it will prompt to log in.
 * @returns {}
 */
const action_session = async () => {
  // If user is logged in ..
  if ((await session.isLoggedIn()) === true) showUserSession();
  // If user is not logged in ..
  else {
    comm.logWithColor(chalk.yellowBright, "You are not logged in ...");
    comm.guideLogin();
  }
};

/**
 * @command session
 * @description
 * Add 'session' command.
 * Check the login status of the user and display the relevant information.
 * If the user is logged in, it displays the user's session information.
 * If not, it provides guidance to log in.
 */
const command_session = program.command("session");
command_session
  .description(
    "Check whether the user is logged in or not, and show information."
  )
  .action(action_session);

/**
 * @description
 * Declare 'mylist' action.
 * This action shows a list of user's plugins or components from Hitbim Services.
 * User needs to be logged in to access this command.
 * Depending on the options provided,
 * it shows either a list of plugins, components, or both.
 * @param {{ plugin:boolean, component:boolean, all:boolean }} options
 * - Options can include 'plugin', 'component', and 'all'
 * - 'plugin' shows the list of plugins if true
 * - 'component' shows the list of components if true
 * - 'all' shows both the list of plugins and components if true
 * @returns {}
 */
const action_mylist = async options => {
  // If user is not logged in ..
  if ((await session.isLoggedIn()) !== true) {
    comm.logWithColor(
      chalk.yellowBright,
      "Login first to see your plugin list from Hitbim Services."
    );
    comm.guideLogin();
    return;
  }
  // Check if any option was provided
  if (!options.plugin && !options.component && !options.all) {
    comm.log(
      `Either option %s or %s or %s must be selected within %s command.\n`,
      chalk.yellow("'--plugin'"),
      chalk.yellow("'--component'"),
      chalk.yellow("'--all'"),
      chalk.yellow("'mylist'")
    );
    command_mylist.help();
    return;
  }
  // If option 'all' is provided ..
  if (options.all) {
    await plugin.showPluginList();
    await component.showComponentList();
    return;
  }
  // If option 'plugin' is provided ..
  if (options.plugin) {
    await plugin.showPluginList();
  }
  // If option 'component' is provided ..
  if (options.component) {
    await component.showComponentList();
  }
};

/**
 * @command mylist
 * @description
 * Add 'mylist' command.
 * This command shows a list of the user's items from Hitbim Services.
 * User needs to be logged in to access this command.
 * Depending on the options provided,
 * it shows either a list of plugins, components, or both.
 */
const command_mylist = program.command("mylist");
command_mylist
  .description("Show my list from Hitbim Services.")
  .option("-p, --plugin", "Show List of Plugins")
  .option("-c, --component", "Show List of Components")
  .option("-a, --all", "Show List of All")
  .action(action_mylist);

/**
 * @description
 * Declare 'download' action.
 * This action is used to download a user's plugin or component from Hitbim Services.
 * User needs to be logged in to access this command.
 * Depending on the options provided, it downloads either a plugin or a component.
 * @param {{ plugin:string, component:string }} options
 * - Options can include 'plugin' and 'component'
 * - 'plugin' downloads the plugin with the given plugin ID
 * - 'component' downloads the component with the given component ID
 * @returns {}
 */
const action_download = async options => {
  // If user is not logged in ..
  if ((await session.isLoggedIn()) !== true) {
    comm.logWithColor(
      chalk.yellowBright,
      "Login first to download your plugin from Hitbim Services."
    );
    comm.guideLogin();
    return;
  }
  // If any option was not provided ..
  if (!options.plugin && !options.component) {
    comm.log(
      `Either option %s or %s must be selected within %s command.\n`,
      chalk.yellow("'--plugin'"),
      chalk.yellow("'--component'"),
      chalk.yellow("'download'")
    );
    command_download.help();
    return;
  }
  // if option 'plugin' is provided ..
  if (options.plugin) {
    let pluginId = options.plugin;
    comm.logWithColor(chalk.cyan, `Downloading Plugin : ${pluginId} ... \n`);
    await plugin.downloadPlugin(pluginId);
  }
  // if option 'component' is provided ..
  if (options.component) {
    let componentId = options.component;
    comm.logWithColor(
      chalk.cyan,
      `Downloading Component : ${componentId} ... \n`
    );
    await component.downloadComponent(componentId);
  }
};

/**
 * @command download
 * @description
 * Add 'download' command.
 * This command is used to download a user's item from Hitbim Services.
 * User needs to be logged in to access this command.
 * Depending on the options provided, it downloads either a plugin or a component.
 */
const command_download = program.command("download");
command_download
  .description("Download from Hitbim Services.")
  .option("-p, --plugin <pluginId>", "Plugin ID to Download")
  .option("-c, --component <componentId>", "Component ID to Download")
  .action(action_download);

/**
 * @description
 * Declare 'upload' action.
 * This action is used to upload a user's plugin or component to Hitbim Services.
 * User needs to be logged in to access this command.
 * Depending on the options provided, it uploads either a plugin, a component, or all.
 * @param {{ plugin:string[], component:string[], all:boolean, new:boolean }} options
 * - Options can include 'plugin', 'component', 'all', and 'new'
 * - 'plugin' uploads the plugin(s) with the given plugin name(s)
 * - 'component' uploads the component(s) with the given component name(s)
 * - 'all' uploads all the plugins and components
 * - 'new' (optional) uploads as new if the plugin/component already exists
 * @returns {}
 */
const action_upload = async options => {
  // If user is not logged in ..
  if ((await session.isLoggedIn()) !== true) {
    comm.logWithColor(
      chalk.yellowBright,
      "Login first to upload your plugin to Hitbim Services."
    );
    comm.guideLogin();
    return;
  }
  // Check if any option was provided ..
  if (!options.plugin && !options.component && !options.all) {
    comm.log(
      `Either option %s or %s or %s must be selected within %s command.\n`,
      chalk.yellow("'--plugin'"),
      chalk.yellow("'--component'"),
      chalk.yellow("'--all'"),
      chalk.yellow("'upload'")
    );
    command_upload.help();
    return;
  }
  // If option 'all' is provided
  if (options.all) {
    comm.logWithColor(chalk.cyan, `Uploading All Plugins ...`);
    await plugin.uploadAllPlugins(options.new);
    return;
  }
  // If option 'plugin' is provided
  if (options.plugin) {
    options.plugin.forEach(async pluginName => {
      comm.logWithColor(
        chalk.cyan,
        `Uploading Plugin : "${pluginName}"${
          options.new ? " As new" : ""
        } ... \n`
      );
      await plugin.uploadPlugin(pluginName, options.new);
    });
  }
  // If option 'component' is provided
  if (options.component) {
    options.component.forEach(async componentName => {
      comm.logWithColor(
        chalk.cyan,
        `Uploading Component : "${componentName}"${
          options.new ? " As new" : ""
        } ... \n`
      );
      await component.uploadComponent(componentName, options.new);
    });
  }
};

/**
 * @command upload
 * @description
 * Add 'upload' command.
 * This command is used to upload a user's item to Hitbim Services.
 * User needs to be logged in to access this command.
 * Depending on the options provided, it uploads either a plugin, a component, or all.
 */
const command_upload = program.command("upload");
command_upload
  .description("Upload to Hitbim Services.")
  .option("-p, --plugin <pluginNames...>", "Upload Plugin")
  .option("-c, --component <componentNames...>", "Upload Component")
  .option("-a, --all", "Upload All")
  .option("-n, --new", "(optional) Upload as New")
  .action(action_upload);

/**
 * @description
 * Declare 'docs' action.
 * This action is used to open the Hitbim Docs page in the user's browser.
 * The URL is taken from the configuration file, but if it's not found, a default URL is used.
 * @returns {}
 */
const action_docs = async () => {
  clearConsole();
  // Hitbim Docs page
  const hitbimDocs = require("./server/config.js")?.main_server?.docs;
  let hitbimLink = hitbimDocs
    ? `${hitbimDocs.hostname}${hitbimDocs.path}#CLI_Overview`
    : "https://developer.hitbim.com/bim/docs#CLI_Overview";
  comm.logWithColor(
    chalk.yellowBright,
    `${chalk.bold("Hitbim Docs page")} has been opened in your browser.`
  );
  comm.guideCommand(
    `${chalk.bold("Read Docs")} for more advanced use of ${chalk.bold(
      "Hitbim CLI"
    )} ...`,
    chalk.underline(hitbimLink)
  );

  // Open Hitbim Docs page in brower
  openBrowser(hitbimLink);
};

/**
 * @command docs
 * @description
 * Add 'docs' command.
 * This command opens the Hitbim Docs page in the user's browser.
 * User can read the documentation for more advanced use of Hitbim CLI.
 */
const command_docs = program.command("docs");
command_docs
  .description("Show Docs on the Hitbim website.")
  .action(action_docs);

/**
 * @description
 * Declare 'help' action.
 * This action is used to display help information for the specified command.
 * If no command name is provided, it displays help for all commands.
 * If the command name is not found in the command list, it informs the user and displays help for all commands.
 * @param {string} commandName - The name of the command to get help for
 * @returns {}
 */
const action_help = commandName => {
  clearConsole();
  // If command name is not provided ..
  if (!commandName) {
    program.outputHelp();
    return;
  }

  // Find provided command name from command list ..
  const command = program.commands.find(c => c.name() === commandName);
  if (command) {
    command.help();
  } else {
    comm.logWithColor(
      chalk.yellowBright,
      `Command "${commandName}" not found.\n`
    );
    program.outputHelp();
  }
};

/**
 * @command help
 * @description
 * Add 'help' command.
 * This command displays help information for the specified command.
 * If no command is specified, it displays help for all commands.
 * If the command name is not found, it informs the user and
 * displays help for all commands.
 */
const command_help = program.command("help [commandName]");
command_help
  .description(
    "Display help information for the specified command, or all commands if no command is specified."
  )
  .action(action_help);

program.parse(process.argv);

// If option debug server ..
if (program.opts().debugServer) {
  // Enable debug server
  comm.logWithColor(chalk.yellowBright, "Debug Server Enabled ...\n");
  debug.enable("server");
}

// If option debug error ..
if (program.opts().debugError) {
  // Enable debug error
  comm.logWithColor(chalk.yellowBright, "Debug Error Enabled ...\n");
  debug.enable("error");
}
