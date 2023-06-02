/*jshint esversion: 6 */
(function () {
  ("use strict");
  const util = require("util");
  const _events = require("events").EventEmitter;
  const axios = require("axios");
  let _project_type = "ud"; //<string> ws or ud
  let _self;
  let _token;
  let _baseHref;
  let _device;
  let _vidrotoken;
  let _vidroapi;
  let _project_id;
  let _expected_api_version;
  let _activeTab = null;
  let _tabs = null;
  let _strings = null;

  util.inherits(FlowTrace, _events);

  function FlowTrace(options) {
    if (typeof options.project_type !== "undefined") {
      _project_type = options.project_type.toLowerCase();
    }
    _baseHref = options.baseHref;
    _device = options.device;
    _token = options.token;
    _vidrotoken = options.vidrotoken;
    _vidroapi = options.vidroapi;

    _project_id = options.project_id;
    _strings = options.strings;
    _self = this;
    setTimeout(function () {
      _self.emit("log", "FlowTrace.js", "FlowTrace module loaded", "success");
    }, 500);
  }

  //****************************************************************
  //*****************            UPSTREAM            ***************
  //****************************************************************
  function doUpstream(xcoord, ycoord, zoomRatio) {
    return new Promise((resolve, reject) => {
      _self.emit(
        "log",
        "FlowTrace.js",
        `doUpstream(${xcoord},${ycoord},${zoomRatio})`,
        "info"
      );
      var dataToSend = {};
      dataToSend.device = 5; //_device;
      dataToSend.x = xcoord;
      dataToSend.y = ycoord;
      dataToSend.zoomRatio = zoomRatio;
      let headers = { "Content-Type": "application/json" };
      headers.Authorization = `Bearer ${_vidrotoken}`;
      let endPoint = `${_vidroapi}giswater/upstream/${_project_id}`;

      axios
        .post(endPoint, dataToSend, { headers: headers })
        .then((response) => {
          resolve({ message: response.data.message, code: 200 });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //****************************************************************
  //*************              END UPSTREAM          ***************
  //****************************************************************

  //****************************************************************
  //*****************           DOWNSTREAM           ***************
  //****************************************************************
  function doDownStream(xcoord, ycoord, zoomRatio) {
    return new Promise((resolve, reject) => {
      _self.emit(
        "log",
        "FlowTrace.js",
        `doDownStream(${xcoord},${ycoord},${zoomRatio})`,
        "info"
      );
      var dataToSend = {};
      dataToSend.device = 5; //_device;
      dataToSend.x = xcoord;
      dataToSend.y = ycoord;
      dataToSend.zoomRatio = zoomRatio;
      let headers = { "Content-Type": "application/json" };
      headers.Authorization = `Bearer ${_vidrotoken}`;
      let endPoint = `${_vidroapi}giswater/downstream/${_project_id}`;

      axios
        .post(endPoint, dataToSend, { headers: headers })
        .then((response) => {
          resolve({ message: response.data.message, code: 200 });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //****************************************************************
  //*************            END DOWNSTREAM          ***************
  //****************************************************************
  module.exports = FlowTrace;
  FlowTrace.prototype.doUpstream = doUpstream;
  FlowTrace.prototype.doDownStream = doDownStream;
})();
