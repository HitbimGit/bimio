/**
 * @fileoverview emulator.js
 * @since 23.06.27
 * @author HyunHo <john_an@hitbim.com>
 * @copyright
 * {@link https://hitbim.com Hitbim} © 2023 All Rights Reserved
 *
 *
 * All files and information contained in this Software are copyright by {@link https://hitbim.com Hitbim},
 * and may not be duplicated, copied, modified or adapted, in any way without our written permission.
 *
 *
 * Our Software, Tools, Website, and Services may contain our service marks or trademarks as well as those of our affiliates
 * or other companies, in the form of words, graphics, and logos.
 *
 *
 * Your use of our Software and Services does not constitute any right or license for you
 * to use our Services, Tools, Software, marks or trademarks, without the prior written permission of {@link https://hitbim.com Hitbim}.
 *
 *
 * Our Content, as found within our Software, Website, Tools and Services, are protected under United States and foreign copyrights.
 * The copying, redistribution, use or publication by you of any such Content, is strictly prohibited.
 * Your use of our Software, Website, Tools and Services does not grant you any ownership rights to our Content.
 *
 *
 * Copyright © {@link https://hitbim.com Hitbim} ©. All Rights Reserved.
 */

/**
 * @description
 * initial Android mockup height
 * @type {number}
 */
const aHeight = 912;
/**
 * @description
 * initial Android mockup width
 * @type {number}
 */
const aWidth = 420;
/**
 * @description
 * initial iPhone mockup height
 * @type {number}
 */
const iHeight = 868;
/**
 * @description
 * initial iPhone mockup width
 * @type {number}
 */
const iWidth = 427;
/**
 * @description
 * Android status bar height
 * @type {number}
 */
const aStatusHeight = 38;
/**
 * @description
 * iPhone status bar height
 * @type {number}
 */
const iStatusHeight = 35;
/**
 * @description
 * initial height of device container frame.
 * used for calculation of scale value according to screen size.
 * @type {number}
 */
let initHeight = 0;
/**
 * @description
 * current device frame type.
 * can be "android" or "iphone"
 */
let currentDeviceFrameType = "android";
/**
 * @description
 * used as tabbar height
 * @type {number}
 */
let g_tabbarHeight = 65;
/**
 * @description
 * list of all plugins data
 * @type {Array<Object>}
 */
let appData;
/**
 * @description
 * current plugin data
 * @type {Object}
 */
let pluginData;
/**
 * @description
 * @type {Object}
 * all the components data
 */
let componentData;
/**
 * @description
 * tabbar data
 * @type {Object}
 */
let tabbarData;
/**
 * @description
 * saves whether this project has tabbar or not
 * @type {boolean}
 */
let hasTabbar = false;

// document ready
$(function () {
  appData = $("main").data("app");
  componentData = $("main").data("component");
  pluginData = appData[0];
  if (componentData) {
    tabbarData = componentData["tabbar"];
    if (tabbarData) hasTabbar = true;
  }

  // [init] device frame load
  loadDeviceFrame(currentDeviceFrameType);

  const init_pluginPath = getFullPath({
    type: "plugin",
    plugin: pluginData.pluginName,
    page: pluginData.index,
  });

  // load initial plugin content
  loadPluginContent(init_pluginPath);

  if (hasTabbar) {
    const init_tabbarPath = getFullPath({
      type: "tabbar",
      page: tabbarData.index,
    });
    loadTabbarContent(init_tabbarPath);
  } else {
    removeTabbar();
  }

  // check fullscreen capability and remove zoomout
  if (!checkFullScreenMode()) {
    $(".ems-device-button.zoomout").remove();
  }

  // device frame change
  $(".ems-device-button").on("click", function () {
    if ($(this).hasClass("refresh")) {
      const emsTabbarIframeDiv = document.getElementById(
        "ems-tabbar-iframe-div"
      );
      if (emsTabbarIframeDiv) {
        emsTabbarIframeDiv.style.display = "block";
        emsTabbarIframeDiv.style.visibility = "visible";
      }
      document
        .getElementById("ems-device-iframe")
        .contentDocument.location.reload(true);
    } else if ($(this).hasClass("zoomout")) {
      if (!checkFullScreenMode()) {
        $(this).remove();
        return;
      }
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        closeFullScreenMode();
      } else {
        $(this).addClass("active");
        openFullScreenMode();
      }
    } else {
      $(this).addClass("active");
      if ($(this).hasClass("android")) {
        // android
        if (currentDeviceFrameType === "android") return;
        $(".ems-device-button.iphone").removeClass("active");
        currentDeviceFrameType = "android";
      } else {
        // iphone
        if (currentDeviceFrameType === "iphone") return;
        $(".ems-device-button.android").removeClass("active");
        currentDeviceFrameType = "iphone";
      }
      const emsTabbarIframeDiv = document.getElementById(
        "ems-tabbar-iframe-div"
      );
      if (emsTabbarIframeDiv) {
        emsTabbarIframeDiv.style.display = "block";
        emsTabbarIframeDiv.style.visibility = "visible";
      }
      // pluginData = appData[0];
      const pluginPath = getFullPath({
        type: "plugin",
        plugin: pluginData.pluginName,
        page: pluginData.index,
      });
      loadPluginContent(pluginPath);
      loadDeviceFrame(currentDeviceFrameType);

      if (hasTabbar) {
        const tabbarPath = getFullPath({
          type: "tabbar",
          page: tabbarData.index,
        });
        loadTabbarContent(tabbarPath);
      } else {
        removeTabbar();
      }
    }
  });

  // when device iframe loaded
  $("#ems-device-iframe").on("load", function () {
    let head = $(this).contents().find("head");
    let css = `<style type="text/css">
      *::-webkit-scrollbar {
        display: none;
      }
      * { 
      -ms-overflow-style: none;
      scrollbar-width: none;
      }
    </style>`;
    $(head).append(css);
    $(this).contents().find("body").css("padding-bottom", "65px");
  });

  // when tabbar iframe loaded
  $("#ems-device-iframe-tabbar").on("load", function () {
    let head = $(this).contents().find("head");
    let css = `<style type="text/css">
    *::-webkit-scrollbar {
      display: none;
    }
    * { 
    -ms-overflow-style: none;
    scrollbar-width: none;
    }
  </style>`;
    $(head).append(css);
  });

  // when plugin item is clicked
  $("#plugin-list").on("click", ".plugin-item", function () {
    if ($(this).hasClass("selected")) return;

    $(".plugin-item").removeClass("selected");
    $(this).addClass("selected");

    let pName = $(this).data("name");

    setConfig({ plugin: pName });
  });

  // when Hitbim log is clicked
  $(".hb-logo").on("click", function () {
    window.open("https://developer.hitbim.com", "_blank");
  });
});

// functions
// device frame load
/**
 *
 * @param {*} type
 */
function loadDeviceFrame(type) {
  initHeight = $("#ems-device-container").height();
  const devcieIframe = $("#ems-device-iframe");
  const tabbarIframe = $("#ems-tabbar-iframe-div");
  devcieIframe.addClass("loading");
  tabbarIframe.addClass("loading");
  let deviceHtml = ``;
  let scaleValue = 0;
  let statusHeight = 0;
  // set HTML
  if (type == "android") {
    // android
    $("#ems-tabbar-iframe-div > .bar").css("display", "none");
    deviceHtml += `
    <div class="device device-google-pixel-6-pro device-black device-android" id="ems-device-frame">
      <div class="device-frame">
        <div class="device-screen screen">
          <div class="status-bar android">
            <div class="status-bar-time">00:00</div>
            <div class="status-bar-info">
                <span class="material-symbols-outlined">signal_cellular_alt</span>
                <span class="material-symbols-outlined">wifi</span>
                <span class="material-symbols-outlined">battery_full_alt</span>
            </div>
          </div>
          <div id="ems-display-frame"></div>
        </div>
      </div>
      <div class="device-stripe"></div>
      <div class="device-header"></div>
      <div class="device-sensors"></div>
      <div class="device-btns"></div>
      <div class="device-power"></div>
    </div>
    `;

    $("#ems-device-frame-div").html(deviceHtml);

    scaleValue = initHeight / $(".device-android").height();
    statusHeight = aStatusHeight;
  } else {
    // iphone
    deviceHtml += `
    <div class="device device-iphone-14 device-black device-ios" id="ems-device-frame">
      <div class="device-frame">
        <div class="device-screen screen">
          <div class="status-bar iphone">
            <div class="status-bar-time">00:00</div>
            <div class="status-bar-info">
                <span class="material-symbols-outlined">signal_cellular_alt</span>
                <span class="material-symbols-outlined">wifi</span>
                <span class="material-symbols-outlined">battery_full_alt</span>
            </div>
          </div>
          <div id="ems-display-frame"></div>
        </div>
      </div>
      <div class="device-stripe"></div>
      <div class="device-header"></div>
      <div class="device-sensors"></div>
      <div class="device-btns"></div>
      <div class="device-power"></div>
    </div>
    `;

    $("#ems-device-frame-div").html(deviceHtml);

    scaleValue = initHeight / $(".device-ios").height();
    statusHeight = iStatusHeight;
  }

  // Fit Device Size
  $("#ems-device-frame-div").css("transform", `scale(${scaleValue})`);
  const deviceFrameContainer = $("#ems-device-frame-container");
  const deviceFrame = $("#ems-device-frame");
  deviceFrameContainer.width(deviceFrame[0].getBoundingClientRect().width);
  deviceFrameContainer.height(deviceFrame[0].getBoundingClientRect().height);

  // Fit Screen Size
  const screenEl = $(".screen").eq(0);
  const displayFrame = $("#ems-display-frame");
  displayFrame.css("height", screenEl.height() - statusHeight);

  // Set Iframe Position
  devcieIframe.width(displayFrame.width());
  devcieIframe.height(displayFrame.height());
  devcieIframe.offset({
    left: displayFrame.offset().left,
    top: displayFrame.offset().top,
  });
  const borderRadiusScreenEl = screenEl.css("border-radius");
  devcieIframe.css(
    "border-radius",
    `0 0 ${borderRadiusScreenEl} ${borderRadiusScreenEl}`
  );
  devcieIframe.css("transform-origin", "top left");
  devcieIframe.css("transform", `scale(${scaleValue})`);

  tabbarIframe.width(displayFrame.width());
  tabbarIframe.height(g_tabbarHeight);
  let tabbarBottom;
  if (type == "android") {
    tabbarBottom = scaleValue * 25;
  } else {
    tabbarBottom = scaleValue * 15;
  }
  tabbarIframe.offset({
    left: displayFrame.offset().left,
  });

  tabbarIframe.css(
    "border-radius",
    `0 0 ${borderRadiusScreenEl} ${borderRadiusScreenEl}`
  );
  tabbarIframe.css("bottom", `${tabbarBottom}px`);
  tabbarIframe
    .children()
    .css(
      "border-radius",
      `0 0 ${borderRadiusScreenEl} ${borderRadiusScreenEl}`
    );
  tabbarIframe.css("transform-origin", "bottom left");
  tabbarIframe.css("transform", `scale(${scaleValue})`);

  // time set
  $(".status-bar-time").eq(0).text(getCurrentTime());

  $(".status-bar").css(
    "border-radius",
    `${borderRadiusScreenEl} ${borderRadiusScreenEl} 0 0`
  );

  devcieIframe.removeClass("loading");
  tabbarIframe.removeClass("loading");
}

// get current time and format for time set
// hh:mm
function getCurrentTime() {
  var d = new Date();
  var hour = ("0" + d.getHours()).slice(-2);
  var min = ("0" + d.getMinutes()).slice(-2);
  return `${hour}:${min}`;
}

// load content in iframe
function loadPluginContent(url) {
  $("#ems-device-iframe").attr("src", url);
  // document.getElementById(
  //   "ems-device-iframe"
  // ).contentWindow.document.location.href = url;
}

/**
 * remove tabbar iframe
 */
function removeTabbar() {
  $("#ems-device-iframe-tabbar").css({ display: "none" });
}

/**
 * load tabbar in iframe
 * @param {string} url
 */
function loadTabbarContent(url) {
  $("#ems-device-iframe-tabbar").attr("src", url);
}

/**
 * @param {Object} params
 * @param {string} params.type plugin or tabbar
 * @param {string} params.plugin plugin name
 * @param {string} params.page html name
 * @returns {string} Full path
 */
function getFullPath(params) {
  if (params.type == "plugin") {
    // plugins
    return `/PLUGINS/${params.plugin}/${params.page}`;
  } else if (params.type == "tabbar") {
    // tabbar
    return `/COMPONENTS/tabbar/${params.page}`;
  }
}

/**
 * @param {Object} params
 * @param {string} params.plugin plugin name
 * @returns
 */
function setConfig(params) {
  let selectedPlugin;
  try {
    selectedPlugin =
      appData[
        appData
          .map(function (item) {
            return item.pluginName;
          })
          .indexOf(params.plugin)
      ];
  } catch (e) {
    console.error("ERROR! : ", e);
    return;
  }
  if (!selectedPlugin) return;

  pluginData = selectedPlugin;
  const pluginPath = getFullPath({
    type: "plugin",
    plugin: pluginData.pluginName,
    page: pluginData.index,
  });

  loadPluginContent(pluginPath);
}

var docV = document.documentElement;

/**
 * Check Full Screen Mode Capability
 * @returns {boolean}
 */
function checkFullScreenMode() {
  if (docV.requestFullscreen) return true;
  else if (docV.webkitRequestFullscreen)
    // Chrome, Safari (webkit)
    return true;
  else if (docV.mozRequestFullScreen)
    // Firefox
    return true;
  else if (docV.msRequestFullscreen)
    // IE or Edge
    return true;
  else return false;
}

/**
 * Open Full Screen Mode
 */
function openFullScreenMode() {
  if (docV.requestFullscreen) docV.requestFullscreen();
  else if (docV.webkitRequestFullscreen)
    // Chrome, Safari (webkit)
    docV.webkitRequestFullscreen();
  else if (docV.mozRequestFullScreen)
    // Firefox
    docV.mozRequestFullScreen();
  else if (docV.msRequestFullscreen)
    // IE or Edge
    docV.msRequestFullscreen();
}

/**
 * Exit Full Screen Mode
 */
function closeFullScreenMode() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen)
    // Chrome, Safari (webkit)
    document.webkitExitFullscreen();
  else if (document.mozCancelFullScreen)
    // Firefox
    document.mozCancelFullScreen();
  else if (document.msExitFullscreen)
    // IE or Edge
    document.msExitFullscreen();
}

window.addEventListener("resize", function () {
  loadDeviceFrame(currentDeviceFrameType);
});
