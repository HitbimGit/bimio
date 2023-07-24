"use strict";

const { createComponent } = require("./create.js");
const { uploadComponent } = require("./upload.js");
const { downloadComponent } = require("./download.js");
const { showComponentList } = require("./mylist.js");

const component = {
  createComponent: createComponent,

  uploadComponent: uploadComponent,

  downloadComponent: downloadComponent,

  showComponentList: showComponentList,
};

module.exports = component;
