"use strict";

const browserslist = require("browserslist");
const chalk = require("chalk");
const os = require("os");
const prompts = require("prompts");
const findUp = require("find-up");
const fs = require("fs");

const findManifest = async ({ cwd } = {}) => findUp("manifest.json", { cwd });
findManifest.sync = ({ cwd } = {}) => findUp.sync("manifest.json", { cwd });

const defaultBrowsers = {
  production: [">0.2%", "not dead", "not op_mini all"],
  development: [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version",
  ],
};

function shouldSetBrowsers(isInteractive) {
  if (!isInteractive) {
    return Promise.resolve(true);
  }

  const question = {
    type: "confirm",
    name: "shouldSetBrowsers",
    message:
      chalk.yellow("We're unable to detect target browsers.") +
      `\n\nWould you like to add the defaults to your ${chalk.bold(
        "manifest.json"
      )}?`,
    initial: true,
  };

  return prompts(question).then(answer => answer.shouldSetBrowsers);
}

function checkBrowsers(dir, isInteractive, retry = true) {
  const current = browserslist.loadConfig({
    config: "manifest.json",
    path: dir,
  });
  if (current != null) {
    return Promise.resolve(current);
  }

  if (!retry) {
    return Promise.reject(
      new Error(
        chalk.red("You must specify targeted browsers.") +
          os.EOL +
          `Please add a ${chalk.underline(
            "browserslist"
          )} key to your ${chalk.bold("manifest.json")}.`
      )
    );
  }

  return shouldSetBrowsers(isInteractive).then(shouldSetBrowsers => {
    if (!shouldSetBrowsers) {
      return checkBrowsers(dir, isInteractive, false);
    }

    return (
      findManifest({ cwd: dir })
        .then(filePath => {
          if (filePath == null) {
            return Promise.reject();
          }
          const manifest = JSON.parse(fs.readFileSync(filePath));
          manifest["browserslist"] = defaultBrowsers;
          fs.writeFileSync(
            filePath,
            JSON.stringify(manifest, null, 2) + os.EOL
          );

          browserslist.clearCaches();
          console.log();
        })
        // Swallow any error
        .catch(e => {
          console.log("ERROR SETTING UP BROWSER : ", e);
        })
        .then(() => checkBrowsers(dir, isInteractive, false))
    );
  });
}

module.exports = { defaultBrowsers, checkBrowsers };
