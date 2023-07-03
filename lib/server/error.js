"use strict";

/**
 * @class ApiError
 * @author HyunHo
 * @since 23.06.13
 * @description
 * Error object with details
 * @param {number} status - http response code
 * @param {string} msg - Error message
 * @param {string} desc - Error description
 * @param {object} data - Data from server
 */
class ApiError {
  constructor(status, msg, desc, data = {}) {
    this.error = true;
    this.status = status;
    this.msg = msg;
    this.desc = desc;
    this.data = data;
    this.details = null;
  }
}
ApiError.prototype.withDetails = function (details) {
  this.details = details;
  return this;
};

let ApiErrors = {};
ApiErrors.invalid_user = new ApiError(
  400,
  "INVALID_USER",
  "Authentication failed. Please check your account and password."
);
ApiErrors.token_expired = new ApiError(
  401,
  "EXPIRED_AUTH",
  "Auth token has been expired. Please authenticate again."
);
ApiErrors.invalid_auth = new ApiError(
  403,
  "INVALID_AUTH",
  "Valid auth token is required. Please provide a valid auth token along with request."
);
ApiErrors.not_found = new ApiError(
  404,
  "NOT_FOUND",
  "The resource referenced by request does not exists."
);
ApiErrors.invalid_permission = new ApiError(
  405,
  "INVALID_PERMISSION",
  "Permission denied. Current user does not have required permissions for this resource."
);
ApiErrors.no_response = new ApiError(
  408,
  "NO_RESPONSE",
  "Request was successfully sent but no response was received."
);
ApiErrors.internal_error = new ApiError(
  500,
  "INTERNAL_ERROR",
  "Something went wrong on server. Please try again later."
);
ApiErrors.required_auth = new ApiError(
  511,
  "REQUIRED_AUTH",
  "Authentication is required. Please verify authorization first."
);

module.exports = {
  ApiError: ApiError,
  ApiErrors: ApiErrors,
};
