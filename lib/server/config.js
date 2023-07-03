/**
 * @todo
 * Modify this file to read URLS from .env_ files
 */

"use strict";

function checkEnv() {
  switch (process.env.NODE_ENV) {
    case "prod":
    case "production":
      return prod_api_list;
    case "dev":
    case "develop":
    case "development":
      return dev_api_list;
    case "local":
      return local_api_list;
    default:
      return prod_api_list;
  }
}

// auth_server_URL: "https://oauth.hitbim.com",
// cli_server_URL: "https://cli.hitbim.com",
// plugin_server_URL: "https://plugin.hitbim.com",
// main_server_URL: "https://developer.hitbim.com",
// compiler_server_URL: "https://compiler.hitbim.com",
const prod_api_list = {
  auth_server: {
    login: {
      hostname: "https://auth.hitbim.com",
      method: "POST",
      path: "/api/auth/token",
    },
    refreshAccessToken: {
      hostname: "https://auth.hitbim.com",
      method: "PUT",
      path: "/api/auth/token",
    },
    logout: {
      hostname: "https://auth.hitbim.com",
      method: "DELETE",
      path: "/api/auth/token",
    },
  },
  plugin_server: {
    upload: {
      hostname: "https://review.hitbim.com",
      method: "POST",
      path: "/api/review/cli/upload",
    },
    update: {
      hostname: "https://review.hitbim.com",
      method: "PUT",
      path: "/api/review/cli/upload",
    },
    download: {
      hostname: "https://review.hitbim.com",
      method: "POST",
      path: "/api/review/cli/download",
    },
    list: {
      hostname: "https://review.hitbim.com",
      method: "GET",
      path: "/api/review/cli/mylist",
    },
  },
};

const dev_api_list = {
  auth_server: {
    login: {
      hostname: "http://10.20.151.66:56115",
      method: "POST",
      path: "/api/auth/token",
    },
    refreshAccessToken: {
      hostname: "http://10.20.151.66:56115",
      method: "PUT",
      path: "/api/auth/token",
    },
    logout: {
      hostname: "http://10.20.151.66:56115",
      method: "DELETE",
      path: "/api/auth/token",
    },
  },
  plugin_server: {
    upload: {
      hostname: "http://10.20.151.42:27604",
      method: "POST",
      path: "/api/review/cli/upload",
    },
    update: {
      hostname: "http://10.20.151.42:27604",
      method: "PUT",
      path: "/api/review/cli/upload",
    },
    download: {
      hostname: "http://10.20.151.42:27604",
      method: "POST",
      path: "/api/review/cli/download",
    },
    list: {
      hostname: "http://10.20.151.42:27604",
      method: "GET",
      path: "/api/review/cli/mylist",
    },
  },
};

const local_api_list = {
  auth_server: {
    login: {
      hostname: "http://localhost:8081",
      method: "POST",
      path: "/login",
    },
    refreshAccessToken: {
      hostname: "http://localhost:8081",
      method: "POST",
      path: "/refresh",
    },
    logout: {
      hostname: "http://localhost:8081",
      method: "DELETE",
      path: "/logout",
    },
  },
  plugin_server: {
    upload: {
      hostname: "http://localhost:8081",
      method: "POST",
      path: "/upload",
    },
    update: {
      hostname: "http://localhost:8081",
      method: "PUT",
      path: "/upload",
    },
    download: {
      hostname: "http://localhost:8081",
      method: "GET",
      path: "/download",
    },
    list: {
      hostname: "http://localhost:8081",
      method: "GET",
      path: "/mylist",
    },
  },
};

module.exports = checkEnv();
