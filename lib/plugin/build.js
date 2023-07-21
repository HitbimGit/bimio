"use strict";

const archiver = require("archiver");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const debugError = require("debug")("error");

const comm = require("../common/common.js");

/**
 * Build the plugin by archiving the contents of the public/PLUGINS directory.
 *
 * The function follows these steps:
 * 1. Check if a build directory exists in the current project directory. If not, it creates one.
 * 2. Check if the target directory (./public/PLUGINS) exists. If not, it logs an error message and terminates the process.
 * 3. Count how many zip files already exist in the build directory to generate a unique file name for the new build.
 * 4. Create a write stream for the new zip file.
 * 5. Initialize an archiver to create the zip file.
 * 6. Set up error and close event handlers for the archiver and the write stream.
 * 7. Start the archiving process by selecting all files and directories in the target directory.
 * 8. Pipe the archiver output into the write stream.
 * 9. Finalize the archiver to finish the zipping process.
 */
exports.buildPlugin = function () {
  // Get the current working directory
  const projectDir = process.cwd();

  // Define the path for the build directory
  const buildDir = path.join(projectDir, "build");

  // If the build directory does not exist, create it
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  // Define the path for the target directory (./public/PLUGINS)
  const targetDir = path.join(projectDir, "./public/PLUGINS");

  // If the target directory does not exist, log an error and terminate the process
  if (!fs.existsSync(targetDir)) {
    comm.logWithColor(
      chalk.yellowBright,
      `Directory ${chalk.underline(targetDir)} is not found ...`
    );
    process.exit(1);
  }

  // Count how many zip files already exist in the build directory
  let count = 0;
  while (fs.existsSync(path.join(buildDir, `plugins-build-${count}.zip`))) {
    count++;
  }

  // Create a write stream for the new zip file
  const output = fs.createWriteStream(
    path.join(buildDir, `plugins-build-${count}.zip`)
  );

  // Initialize an archiver for the zip format
  const archive = archiver("zip");

  // Handle errors that occur during the archiving process
  archive.on("error", err => {
    comm.error(`Error [${err.message}] occurred while archiving ...`);
    debugError("Full Error : ", err);
    process.exit(1);
  });

  // Handle the close event for the write stream
  output.on("close", () => {
    comm.log(`build has been finalized`);
  });

  // Start the archiving process by selecting all files and directories in the target directory
  archive.glob("**/*", { cwd: targetDir, ignore: [] });

  // Pipe the archiver output into the write stream
  archive.pipe(output);

  // Finalize the archiver to finish the zipping process
  archive.finalize();
};
