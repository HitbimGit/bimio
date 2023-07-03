"use strict";

require("../config/config.js");

const { Command } = require("commander");
const chalk = require("chalk");
const readline = require("readline");

const plugin = require("./plugin/plugin.js");
const component = require("./component/component.js");
const project = require("./project/project.js");
const comm = require("./common/common.js");
const session = require("./user/session.js");
const openBrowser = require("./utils/openBrowser.js");
const clearConsole = require("./utils/clearConsole.js");

const program = new Command();

program
  .name("bimio")
  .description("CLI for Hitbim Plugin Development")
  .version(
    `${comm.version}`,
    "-v, --version",
    "Display current bimio version number"
  )
  .helpOption("-h, --help", "Display help for command");

// Add 'init' command
let command_init = program.command("init <projectName>");
command_init
  .description(`Initialize a new project with the provided project name.`)
  .action(async projectName => {
    // If project name not provided ..
    if (!projectName) {
      comm.log(
        `${chalk.yellow("Project Name")} must be provided within ${chalk.yellow(
          "'init'"
        )} command.\n`
      );
      command_init.help();
      return;
    }
    // Create project start
    await project.createProject(projectName);

    comm.guideCommand("To change your directory ... ", `cd ${projectName}`);
  });

// Add 'create' command
let command_create = program.command("create");
command_create
  .description("Generate a standard structure following Hitbim's architecture.")
  .option("-p, --plugin <pluginNames...>", "Generate a sample Plugin")
  .option("-c, --component <componentNames...>", "Generate a sample Component")
  .option(
    "-d, --directory <directory>",
    "(optional) Destination for generated items"
  )
  .action(async options => {
    // If option 'plugin' or 'component' is not provided ..
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
    // If option 'plugin' is provided ..
    if (options.plugin) {
      options.plugin.forEach(async pluginName => {
        // Create plugin start
        await plugin.createPlugin(pluginName, options.directory);
      });
    }
    // If option 'component' is provided ..
    if (options.component) {
      options.component.forEach(async componentName => {
        // Create component start
        await component.createComponent(componentName, options.directory);
      });
    }
  });

// Add 'run' command
let command_run = program.command("run");
command_run
  .description("Run Project to see the preview.")
  .option("-p, --port <port>", "(optional) Port for localhost, default : 3000")
  .action(async options => {
    // Run project start
    await project.runProject(options.port);
  });

// Add 'stop' command
let command_stop = program.command("stop");
command_stop.description("Stop running Project.").action(async () => {
  // Stop running project
  await project.stopProject();
});

// Add 'signup' command
program
  .command("signup")
  .description("Sign up for Hitbim Services.")
  .action(async () => {
    clearConsole();
    // Hitbim Signup page
    const hitbimLink = "https://developer.hitbim.com/account?type=signup";
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
  });

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

// Add 'login' command
program
  .command("login")
  .description("Login to Hitbim Services.")
  .option("-e, --email <email>", "Email address")
  .option("-p, --password <password>", "Password")
  .action(async options => {
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
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      email =
        email ||
        (await new Promise(resolve => rl.question("email    : ", resolve)));
      password =
        password ||
        (await new Promise(resolve => rl.question("password : ", resolve)));

      rl.close();
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
  });

// Add 'logout' command
program
  .command("logout")
  .description("Logout from Hitbim Services")
  .action(async () => {
    // Try to logout
    let logoutResult = await session.logout();
    comm.log(logoutResult.msg);
  });

// Add 'session' command
program
  .command("session")
  .description(
    "Check whether the user is logged in or not, and show information."
  )
  .action(async () => {
    // If user is logged in ..
    if ((await session.isLoggedIn()) === true) showUserSession();
    // If user is not logged in ..
    else {
      comm.logWithColor(chalk.yellowBright, "You are not logged in ...");
      comm.guideLogin();
    }
  });

// Add 'mylist' command
let command_mylist = program.command("mylist");
command_mylist
  .description("Show my list from Hitbim Services.")
  .option("-p, --plugin", "Show List of Plugins")
  .option("-c, --component", "Show List of Components")
  .option("-a, --all", "Show List of All")
  .action(async options => {
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
  });

// Add 'download' command
let command_download = program.command("download");
command_download
  .description("Download from Hitbim Services.")
  .option("-p, --plugin <pluginId>", "Plugin ID to Download")
  .option("-c, --component <componentId>", "Component ID to Download")
  .action(async options => {
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
  });

// Add 'upload' command
let command_upload = program.command("upload");
command_upload
  .description("Upload to Hitbim Services.")
  .option("-p, --plugin <pluginNames...>", "Upload Plugin")
  .option("-c, --component <componentNames...>", "Upload Component")
  .option("-a, --all", "Upload All")
  .option("-n, --new", "(optional) Upload as New")
  .action(async options => {
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
  });

// Add 'help' command
program
  .command("help [commandName]")
  .description(
    "Display help information for the specified command, or all commands if no command is specified."
  )
  .action(commandName => {
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
  });

program.parse(process.argv);
