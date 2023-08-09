"use strict";

const { createComponent } = require("./create.js");
const { uploadComponent } = require("./upload.js");
const { downloadComponent } = require("./download.js");
const { showComponentList } = require("./mylist.js");

const component = {
  /**
   * @description
   * Create a new component with samples.
   * @function createComponent
   * @author HyunHo
   * @since 23.08.08
   * @param {string} componentName Component Name
   * @param {string} projectPath Project Directory
   * @returns {Promise<void>}
   */
  createComponent: createComponent,

  uploadComponent: uploadComponent,

  downloadComponent: downloadComponent,

  showComponentList: showComponentList,
};

module.exports = component;
