"use strict";

var chalk = require("chalk");
var execSync = require("child_process").execSync;
var execFileSync = require("child_process").execFileSync;
var path = require("path");

var execOptions = {
  encoding: "utf8",
  stdio: [
    "pipe", // stdin (default)
    "pipe", // stdout (default)
    "ignore", //stderr
  ],
};

function getProcessIdOnPort(port) {
  return execFileSync(
    "lsof",
    ["-i:" + port, "-P", "-t", "-sTCP:LISTEN"],
    execOptions
  )
    .split("\n")[0]
    .trim();
}

function getProcessCommand(processId, processDirectory) {
  var command = execSync(
    "ps -o command -p " + processId + " | sed -n 2p",
    execOptions
  );

  command = command.replace(/\n$/, "");

  return command;
}

function getDirectoryOfProcessById(processId) {
  return execSync(
    "lsof -p " +
      processId +
      ' | awk \'$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}\'',
    execOptions
  ).trim();
}

function getProcessForPort(port) {
  try {
    var processId = getProcessIdOnPort(port);
    var directory = getDirectoryOfProcessById(processId);
    var command = getProcessCommand(processId, directory);
    return (
      chalk.cyan(command) +
      chalk.grey(" (pid " + processId + ")\n") +
      chalk.blue("  in ") +
      chalk.cyan(directory)
    );
  } catch (e) {
    return null;
  }
}

module.exports = getProcessForPort;
