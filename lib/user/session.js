const chalk = require("chalk");
const ip = require("ip");

const tokens = require("./tokens.js");
const safeRequest = require("../server/saferequest.js");
const serverConfig = require("../server/config.js");
const comm = require("../common/common.js");

const debugError = require("debug")("error");
const debugServer = require("debug")("server");

const session = {
  /**
   * @function login
   * @author HyunHo
   * @since 23.06.26
   * @param {string} email Email address
   * @param {string} password Password
   * @returns {Object}
   */
  login: async function (email, password) {
    let clientIP = ip.address();
    try {
      const response = await safeRequest.send(serverConfig.auth_server.login, {
        id: email,
        password: password,
        ip: clientIP,
      });

      debugServer("Response from server : ", response);

      if (response.status === 200) {
        let { accessToken, refreshToken, expires } = response.data.data;
        if (accessToken && refreshToken) {
          tokens.set(accessToken, refreshToken, email, expires);
          return { error: false, msg: "Successfully logged in!" };
        } else if (response.error || response.data.error) {
          return {
            error: true,
            msg:
              response.msg ||
              response.data?.msg ||
              response.data?.message ||
              "Something went wrong ...",
          };
        } else {
          // Login Failure
          return {
            error: true,
            msg: response.data.message || "Tokens not found ...",
          };
        }
      } else {
        // Server response code not 200
        debugServer(
          `request failed with status code [${response.status}]\n` +
            `Details : ${
              response.msg || response.data.msg || response.data.message
            }`
        );
        return {
          error: true,
          msg: response.data.message || "Something went wrong ...",
        };
      }
    } catch (error) {
      // Login Failure
      debugError("Full Error : ", error);

      return { error: true, msg: "Error occured while logging in ..." };
    }
  },

  /**
   * @function logout
   * @author HyunHo
   * @since 23.06.26
   * @returns {Object}
   */
  logout: async function () {
    if (!tokens.get()) {
      return { error: false, msg: chalk.yellowBright("Already logged out.") };
    }
    safeRequest
      .send(serverConfig.auth_server.logout, {
        token: tokens.get().refreshToken,
      })
      .then(response => {
        debugServer("Response from server : ", response);
      });

    if (tokens.remove()) {
      return { error: false, msg: chalk.green("Successfully logged out.") };
    }

    return { error: false, msg: chalk.yellowBright("Already logged out ...") };
  },

  /**
   * @function expire
   * @author HyunHo
   * @since 23.06.30
   * @returns {Object}
   */
  expire: async function () {
    return tokens.remove();
  },

  /**
   * @function checkSession
   * @author HyunHo
   * @since 23.06.26
   * @returns {Object}
   */
  checkSession: async function () {
    let tokenData = tokens.get();
    if (tokenData) {
      return {
        isLoggedIn: true,
        email: tokenData.email,
        expires: tokenData.expires,
      };
    } else {
      return { isLoggedIn: false };
    }
  },

  /**
   * @function isLoggedIn
   * @author HyunHo
   * @since 23.06.26
   * @lastupdate 23.06.30
   * @returns {boolean}
   */
  isLoggedIn: async function () {
    let tokenData = tokens.get();
    if (tokenData) {
      if (comm.getTimeLeft(tokenData.expires) === "expired") {
        this.expire();
        return false;
      }
      return true;
    } else {
      return false;
    }
  },
};

module.exports = session;
