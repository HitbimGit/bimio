"use strict";

require("../../config/config.js");

module.exports = {
  auth_server: {
    login: {
      hostname: process.env.AUTH_SERVER_LOGIN_HOSTNAME,
      method: process.env.AUTH_SERVER_LOGIN_METHOD,
      path: process.env.AUTH_SERVER_LOGIN_PATH,
    },
    refreshAccessToken: {
      hostname: process.env.AUTH_SERVER_REFRESH_HOSTNAME,
      method: process.env.AUTH_SERVER_REFRESH_METHOD,
      path: process.env.AUTH_SERVER_REFRESH_PATH,
    },
    logout: {
      hostname: process.env.AUTH_SERVER_LOGOUT_HOSTNAME,
      method: process.env.AUTH_SERVER_LOGOUT_METHOD,
      path: process.env.AUTH_SERVER_LOGOUT_PATH,
    },
  },
  plugin_server: {
    upload: {
      hostname: process.env.PLUGIN_SERVER_UPLOAD_HOSTNAME,
      method: process.env.PLUGIN_SERVER_UPLOAD_METHOD,
      path: process.env.PLUGIN_SERVER_UPLOAD_PATH,
    },
    update: {
      hostname: process.env.PLUGIN_SERVER_UPDATE_HOSTNAME,
      method: process.env.PLUGIN_SERVER_UPDATE_METHOD,
      path: process.env.PLUGIN_SERVER_UPDATE_PATH,
    },
    download: {
      hostname: process.env.PLUGIN_SERVER_DOWNLOAD_HOSTNAME,
      method: process.env.PLUGIN_SERVER_DOWNLOAD_METHOD,
      path: process.env.PLUGIN_SERVER_DOWNLOAD_PATH,
    },
    list: {
      hostname: process.env.PLUGIN_SERVER_LIST_HOSTNAME,
      method: process.env.PLUGIN_SERVER_LIST_METHOD,
      path: process.env.PLUGIN_SERVER_LIST_PATH,
    },
  },
};
