"use strict";

const { Command } = require("commander");

// require("../config/config.js");

const plugin = require("./plugin/plugin.js");
const project = require("./project/project.js");
const cnst = require("./constants.js");
const comm = require("./common/common.js");

const program = new Command();

// program.version(`${process.env.BIM_IO_VERSION}`);
program.version(`${comm.version}`);

// Add 'init' command
program
  .command("init <projectName>")
  .description("Initialize a new project with the provided project name")
  .action(async projectName => {
    await project.createProject(projectName);
  });

// Add 'run' command
program
  .command("run <projectName>")
  .description("Run the project to see the preview")
  .action(async projectName => {
    await project.runProject(projectName);
  });

// Add 'create-plugin' command
program
  .command("create-plugin <pluginNames...>")
  .description("Generate a sample plugin structure")
  .action(pluginNames => {
    pluginNames.forEach(async pluginName => {
      await plugin.createPlugin(pluginName);
    });
  });

// Add 'help' command
program
  .command("help [commandName]")
  .description(
    "Display help information for the specified command, or all commands if no command is specified"
  )
  .action(commandName => {
    if (!commandName) {
      program.outputHelp();
      return;
    }

    const command = program.commands.find(c => c.name() === commandName);
    if (command) {
      command.help();
    } else {
      comm.log(
        cnst.BIM_MSG_LOG_RED + `Error: Command "${commandName}" not found.`
      );
      program.outputHelp();
    }
  });

// If no arguments are provided, show help
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);
