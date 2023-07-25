"use strict";

const prompts = require("prompts");
const chalk = require("chalk");
const clearConsole = require("../utils/clearConsole.js");

const comm = {
  log: function () {
    return console.log.apply(console, arguments);
  },

  logWithColor: function () {
    const colorFunction = arguments[0];
    if (typeof colorFunction === "function") {
      const messages = Array.prototype.slice.call(arguments, 1);
      const coloredMessages = messages.map(message => colorFunction(message));
      return console.log.apply(console, coloredMessages);
    }
    return console.log.apply(console, arguments);
  },

  warn: function () {
    return console.warn.apply(console, arguments);
  },

  error: function () {
    return console.error.apply(console, arguments);
  },

  /**
   * @function getTimeLeft
   * @since 23.06.29
   * @param {*} time Time would be used to make new Date Object
   * @returns {string} converted time compared with now
   */
  getTimeLeft: function (time) {
    const diffInSeconds = Math.floor((new Date(time) - new Date()) / 1000);

    if (diffInSeconds < 0) {
      return "expired";
    }

    const days = Math.floor(diffInSeconds / (3600 * 24));
    if (days > 0) {
      return days + " days";
    }

    const hours = Math.floor(diffInSeconds / 3600);
    if (hours > 0) {
      return hours + " hours";
    }

    const mins = Math.floor((diffInSeconds % 3600) / 60);
    if (mins > 0) {
      return mins + " minutes";
    }

    return (diffInSeconds % 60) + " seconds";
  },

  /**
   * @function confirm
   * @author HyunHo
   * @since 23.06.29
   * @param {string} message
   * message remained yellow
   * @param {string} question
   * question want to ask
   * @returns {boolean}
   */
  confirm: async function (message, question) {
    return new Promise((resolve, reject) => {
      const isInteractive = process.stdout.isTTY;
      if (isInteractive) {
        clearConsole();
        const options = {
          type: "confirm",
          name: "confirmed",
          message: chalk.yellow(message) + "\n\n" + question,
          initial: true,
        };
        prompts(options).then(answer => {
          if (answer.confirmed) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        reject("Console not interactive ...");
      }
    });
  },

  /**
   * @function guideCommand
   * @param {string} message
   * guide message
   * @param {string} command
   * command line
   */
  guideCommand: function (message, command) {
    console.log(`\n${message}\n\n  ${chalk.bold(command)}\n\n`);
  },

  /**
   * @function guideLogin
   * @description
   * function to inform user login
   */
  guideLogin: function () {
    this.guideCommand("To login to Hitbim Services ...", "bimio login");
  },

  /**
   * @function formatResultMessage
   * @description
   * Format a result message
   * @param {boolean} error - Indicates whether an error occurred
   * @param {string} message - The result message
   * @param {Object} data - Any additional data to include with the message
   * @returns {Object} Formatted result message
   */
  formatResultMessage: (error = true, message = "", data = {}) => {
    let msg = error ? "process failed" : "process was successful";
    return { error: error, message: message ? message : msg, data: data };
  },

  version: (function () {
    const fs = require("fs");
    const path = require("path");
    const packageJson = fs.readFileSync(
      path.join(__dirname, "../../package.json"),
      "utf-8"
    );

    if (!packageJson) {
      return "0.0.0";
    }

    const packageObj = JSON.parse(packageJson);
    return packageObj.version;
  })(),
};

module.exports = comm;
