"use strict";

const axios = require("axios");
const chalk = require("chalk");
const debugServer = require("debug")("server");
const debugError = require("debug")("error");

const comm = require("../common/common.js");
const config = require("./config.js");
const token = require("../user/tokens.js");
const errors = require("./error.js");
const ApiError = errors.ApiError;
const ApiErrors = errors.ApiErrors;

/**
 * @function setResultByStatus
 * @author HyunHo
 * @since 23.06.14
 * @lastupdate 23.06.15
 * @param {Object} res Response from server by axios
 * @returns {Object}
 */
async function setResultByStatus(res) {
  if (res.status) {
    switch (res.status) {
      case 200:
      case 201:
      case 202:
      case 203:
        // Success
        return res;
      case 400:
        // Invalid User
        return ApiErrors.invalid_user;
      case 401:
        // If Unauthorized Error Occurred
        return ApiErrors.token_expired;
      case 403:
        // Verification Failure
        token.remove();
        return ApiErrors.invalid_auth;
      case 404:
        // Resource Not Found
        return ApiErrors.not_found;
      case 405:
        // No Permission
        return ApiErrors.invalid_permission;
      case 408:
        // No Response From Server
        return ApiErrors.no_response;
      case 500:
        // Internal Server Error
        return ApiErrors.internal_error;
      case 511:
        // Auth Token Not Found
        return ApiErrors.required_auth;
      default:
        return new ApiError(res.status, res.statusText, res.config, res.data);
    }
  } else {
    return ApiErrors.internal_error;
  }
}

/**
 * @function refreshAccessToken
 * @author HyunHo
 * @since 23.06.08
 * @lastupdate 23.06.09
 * @returns {string | null}
 * Returns access token or null
 */
async function refreshAccessToken() {
  comm.log("Refreshing Access Token ...");
  let tokens = token.get();
  if (tokens) {
    comm.log("Sending Refresh Token to server ...");
    try {
      const response = await callApi(config.auth_server.refreshAccessToken, {
        refreshToken: tokens.refreshToken,
      });
      comm.log(
        "Regenerating AccessToken ... ",
        response.status === 200
          ? chalk.green("Success")
          : chalk.redBright("Failure")
      );
      if (response.status === 200) {
        const { accessToken } = response.data;

        token.set(
          accessToken,
          tokens.refreshToken,
          tokens.email,
          tokens.expires
        );

        return accessToken;
      } else if (response.status === 401) {
        comm.logWithColor(
          chalk.yellowBright,
          "Your session has been expired. Please authenticate again."
        );

        token.remove();
        return null;
      } else {
        comm.logWithColor(
          chalk.redBright,
          "Failed to refresh access token ..."
        );

        token.remove();
        return null;
      }
    } catch (err) {
      // Notify that the refresh token is not valid
      comm.logWithColor(
        chalk.redBright,
        "Error occured while refreshing AccessToken ... ",
        err.message
      );
      debugError("Full Error : ", err);
      token.remove();
      return null;
    }
  } else {
    return null;
  }
}

/**
 * @function callApi
 * @author HyunHo
 * @since 23.06.08
 * @lastupdate 23.07.03
 * @param {Object} api server api
 * @param {string} api.method method of api
 * @param {string} api.hostname domain url of api-server
 * @param {string} api.path end-point of api
 * @param {Object=} data data to be sent
 * @param {Object=} headers headers to be sent
 * @param {Object=} options options additional axios options to be passed
 * @returns {Object}
 * Returns response
 */
async function callApi(api, data = {}, headers = {}, options = {}) {
  // Check if api is correctly set ..
  if (!api || !api.hostname || !api.path || !api.method) {
    return {
      error: true,
      data: null,
      status: 404,
      message: ".env file not found ..",
    };
  }

  // Make URL ..
  const url = `${api.hostname}${api.path}`;
  const method = api.method;

  debugServer(`Calling URL : (${method}) ${url} ...\n`);

  // Make options for axios ..
  const finalOptions = {
    method: method,
    url: url,
    headers: headers,
    data: data,
    ...options,
  };

  try {
    // Send request to server ..
    return await axios(finalOptions);
  } catch (error) {
    // When error occurs ..
    debugError(`Error in callApi : ${error.message}`);
    debugError(`Full Error : ${error}`);
    if (error.response) {
      // Request was successfully sent
      // but server responded with a status code out of range of 2xx.
      return {
        error: true,
        data: error.response.data,
        status: error.response.status,
        statusText: error.response.statusText,
        config: error.response.config,
      };
    } else if (error.request) {
      // Request was successfully sent
      // but no response was received.
      return ApiErrors.no_response;
    } else {
      // Error occured while setting up the request
      return ApiErrors.internal_error;
    }
  }
}

/**
 * @function authenticatedRequest
 * @author HyunHo
 * @since 23.06.08
 * @lastupdate 23.06.15
 * @param {boolean} recursive auto send request again
 * @param {Object} api server api
 * @param {string} api.method method of api
 * @param {string} api.hostname domain url of api-server
 * @param {string} api.path end-point of api
 * @param {Object=} data data to be sent
 * @param {Object=} headers headers to be sent
 * @returns {Object}
 * Returns response from server called
 */
async function authenticatedRequest(
  recursive,
  api,
  data = {},
  headers = {},
  options = {}
) {
  /**
   * @inner
   * @function callApiWithToken
   * @since 23.06.09
   * @param {string} accessToken
   * @returns {Object}
   */
  async function callApiWithToken(accessToken) {
    if (!accessToken) {
      return ApiErrors.required_auth;
    }
    return await callApi(
      api,
      data,
      {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
      { ...options }
    );
  }

  /**
   * @inner
   * @function recursiveCall
   * @since 23.06.15
   * @param {Object} res Response Object from api call
   * @returns {Object} Response Object from api recursive call
   */
  async function recursiveCall(res) {
    const result = await setResultByStatus(res);
    if (result.status === 401) {
      let newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        return ApiErrors.required_auth;
      }
      if (recursive) {
        return await callApiWithToken(newAccessToken);
      } else {
        return ApiErrors.token_expired;
      }
    } else {
      return result;
    }
  }

  try {
    const response = await callApiWithToken(token.get()?.accessToken);
    return await recursiveCall(response);
  } catch (err) {
    if (err.reponse) {
      return await recursiveCall(err.reponse);
    } else {
      comm.logWithColor(
        chalk.redBright,
        "Error while seding Request with Token :  ",
        err.message
      );
      debugError("Full Error : ", err);
      return ApiErrors.internal_error;
    }
  }
}

module.exports = {
  /**
   * @prop {function} send
   * @author HyunHo
   * @since 23.06.08
   * @lastupdate 23.06.09
   * @param {Object} api server api
   * @param {string} api.method method of api
   * @param {string} api.hostname domain url of api-server
   * @param {string} api.path end-point of api
   * @param {Object=} data data to be sent
   * @param {Object=} headers headers to be sent
   * @returns {Object}
   * Returns response
   */
  send: callApi,
  /**
   * @prop {function} sendWithToken
   * @author HyunHo
   * @since 23.06.08
   * @lastupdate 23.06.15
   * @param {boolean} recursive auto send request again
   * @param {Object} api server api
   * @param {string} api.method method of api
   * @param {string} api.hostname domain url of api-server
   * @param {string} api.path end-point of api
   * @param {Object=} data data to be sent
   * @param {Object=} headers data to be sent
   * @returns {Object}
   * Returns response
   */
  sendWithToken: authenticatedRequest,
};
