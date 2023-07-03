const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Must be 256 bits (32 characters)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "hitbim-bimio-cli-1-20230608-1449";
const IV_LENGTH = 16; // For AES, this is always 16
// Project Path
const BIMIO_PATH = path.join(os.homedir(), "bimio");
// Token Path
const TOKEN_PATH = path.join(BIMIO_PATH, "tokens.json");

function encrypt(text) {
  if (!text) text = "";

  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  if (!text) return "";

  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

function saveTokens(accessToken, refreshToken, email, expires) {
  const tokenData = {
    accessToken: encrypt(accessToken),
    refreshToken: encrypt(refreshToken),
    email: encrypt(email),
    expires: encrypt(expires.toString()),
  };

  if (!fs.existsSync(BIMIO_PATH)) {
    fs.mkdirSync(BIMIO_PATH);
  }

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData));
}

function loadTokens() {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }

  const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));

  return {
    accessToken: decrypt(tokenData.accessToken),
    refreshToken: decrypt(tokenData.refreshToken),
    email: decrypt(tokenData.email),
    expires: decrypt(tokenData.expires),
  };
}

function removeTokens() {
  if (fs.existsSync(TOKEN_PATH)) {
    // Delete the token file
    fs.unlinkSync(TOKEN_PATH);
    return true;
  }
  return false;
}

function getTokenPath() {
  return TOKEN_PATH;
}

module.exports = {
  /**
   * @prop {function} get
   * @author HyunHo
   * @since 23.06.08
   * @param {}
   * @returns {Object}
   * accessToken, refreshToken, email, expires
   */
  get: loadTokens,
  /**
   * @prop {function} set
   * @author HyunHo
   * @since 23.06.08
   * @param {string} accessToken access token for requests to Hitbim services
   * @param {string} refreshToken refresh token to get new access token
   * @param {string} email user email address
   * @param {string} expires expiration date of refresh token
   */
  set: saveTokens,
  /**
   * @prop {function} remove
   * @author HyunHo
   * @since 23.06.08
   */
  remove: removeTokens,
  /**
   * @prop {string} path
   * Path where tokens exist
   * @author HyunHo
   * @since 23.06.08
   */
  path: (function () {
    return getTokenPath();
  })(),
};
