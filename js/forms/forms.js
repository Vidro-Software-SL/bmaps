/*jshint esversion: 6 */
import Go2Epa from "./go2epa";
import MultiUpdate from "./multiupdate";
import { version } from "./package.json";
(function () {
  ("use strict");
  const util = require("util");
  const axios = require("axios");
  const MobileDetect = require("mobile-detect");
  const FormsContentsSewernet = require("./formsContents");
  const Visits = require("./visits");
  const EventsSewernet = require("./events");
  const FeaturesSewernet = require("./features");
  const Filters = require("./filters");
  const Search = require("./search");
  const Print = require("./print");
  const Mincut = require("./mincut");
  const DatesSelector = require("./dateselector");
  const FlowTrace = require("./flowtrace");
  const _events = require("events").EventEmitter;

  let _baseHref;
  let _self;
  let _token = null;
  let _device = 3; //<int> 1 mobile, 2 tablet, 3 desktop
  let _project_type = "ws"; //<string> ws or ud
  let _info_type = 0; //<int> info type, 0 full info - 100 limited info
  let _expected_api_version = "1.1.0"; //expected api version
  let _formsContents;
  let _visits;
  let _features;
  let _eventsModule;
  let _datesSelector;
  let _filters;
  let _search;
  let _print;
  let _mincut;
  let _go2epa;
  let _MultiUpdate;
  let _flowTrace;
  let _excludingMincut = false; //flag for detecting mincut exclusion
  let _mincutValveLayerTableName = null; //table name layer for mincut valves
  let _mincutGeometryForZoom = null; //store feature geometry for highlight and zoom after upsert mincut
  let _id_name_mincut = null; //store id_name for mincut (hidePreviousForms empties global vars)
  let _pol_id_mincut = null; //store pol_id for mincut (hidePreviousForms empties global vars)
  let _historyObj = []; //<object> store form navigation
  let constants = new Map();
  let _options = null; //options object
  let _vidrotoken;
  let _vidroapi;
  let _project_id;
  util.inherits(FormsSewernet, _events);

  function FormsSewernet(options) {
    _baseHref = options.baseHref;
    if (typeof options.project_type !== "undefined") {
      _project_type = options.project_type.toLowerCase();
    }
    if (typeof options.info_type !== "undefined") {
      _info_type = parseInt(options.info_type);
    }
    _expected_api_version = options.expected_api_version;
    _self = this;
    var md = new MobileDetect(window.navigator.userAgent);
    if (md.mobile() && !md.tablet()) {
      _device = 1; //mobile
    } else if (md.tablet() && md.mobile()) {
      _device = 2; //tablet
    }
    _options = options;
    _options.device = _device;
    _vidrotoken = options.vidrotoken;
    _vidroapi = options.vidroapi;
    _project_id = options.project_id;
    _formsContents = new FormsContentsSewernet({
      project_type: _project_type,
      expected_api_version: _expected_api_version,
    });
    setTimeout(function () {
      _self.emit("log", "form.js", "FormsSewernet loaded", "success");
    }, 500);
  }
  //set session token
  function setToken(token) {
    _token = token;
    _options.token = _token;
    _visits = new Visits(_options);
    _visits.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _visits.on("offlineEvent", (evt, data) => {
      console.log("offlineEvent on forms");
      _self.emit("offlineEvent", evt, data);
    });

    _eventsModule = new EventsSewernet({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      expected_api_version: _expected_api_version,
    });
    _eventsModule.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _features = new FeaturesSewernet({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      expected_api_version: _expected_api_version,
    });
    _features.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _search = new Search({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      expected_api_version: _expected_api_version,
    });
    _search.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _search.on("notifyToMap", function (data, extraData) {
      _self.emit("notifyToMap", data, extraData);
    });
    _print = new Print({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      expected_api_version: _expected_api_version,
    });
    _print.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _print.on("notifyToMap", function (data, extraData) {
      _self.emit("notifyToMap", data, extraData);
    });
    _mincut = new Mincut({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      expected_api_version: _expected_api_version,
    });
    _mincut.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _mincut.on("notifyToMap", function (data, extraData) {
      _self.emit("notifyToMap", data, extraData);
    });

    _datesSelector = new DatesSelector({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      expected_api_version: _expected_api_version,
      use_tiled_background: _options.use_tiled_background,
    });
    _datesSelector.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _datesSelector.on("notifyToMap", function (data, extraData) {
      _self.emit("notifyToMap", data, extraData);
    });
    _MultiUpdate = new MultiUpdate({
      env: _options.env,
      baseHref: _baseHref,
      device: _device,
      token: _token,
    });
    _go2epa = new Go2Epa({
      env: _options.env,
      baseHref: _baseHref,
      device: _device,
      token: _token,
    });
  }
  function setLocalizedStrings(stringsObject) {
    /*stringsObject.forEach( function (eachObj){
			for (var key in eachObj) {
				if (eachObj.hasOwnProperty(key)){
					constants.set(key,eachObj[key]);
				}
			}
		});*/
    _options.strings = stringsObject;
    if (_filters) {
      _filters.setLocalizedStrings(_options.strings);
    }
    return true;
  }

  //****************************************************************
  //********************    GET WEB FORMS      *********************
  //****************************************************************

  //******************        GENERIC FORM     *********************

  function getWebForms(formIdentifier, layer, pol_id, id_name, tabName, cb) {
    _self.emit(
      "log",
      "form.js",
      "getWebForms(" +
        formIdentifier +
        "," +
        layer +
        "," +
        pol_id +
        "," +
        id_name +
        "," +
        tabName +
        ")",
      "info"
    );
    let dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.device = _device;
    dataToSend.form = formIdentifier;
    dataToSend.pol_id = pol_id;
    dataToSend.id_name = id_name;
    dataToSend.tabName = tabName;
    dataToSend.token = _token;
    dataToSend.expected_api_version = _expected_api_version;
    dataToSend.what = "ELEMENTS";
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        _self.emit(
          "log",
          "forms.js",
          "getWebForms",
          "success",
          response.data.message
        );
        if (response.data.status === "Accepted") {
          cb(null, response.data.message);
        } else {
          cb(response.data.code, response.data.message);
        }
      })
      .catch((error) => {
        _self.emit("log", "form.js", "getWebForms", "error", error);
      });
  }

  function getWebFormsForConnect(layer, pol_id, id_name, cb) {
    _self.emit(
      "log",
      "form.js",
      "getWebFormsForConnect(" + layer + "," + pol_id + "," + id_name + ")",
      "info"
    );
    let upstream;
    let downstream;
    //if(_project_type==="ud"){
    if (id_name != "arc_id") {
      //load upstream
      _self.emit(
        "log",
        "form.js",
        "getWebFormsForConnect - request upstream/downstream",
        "info"
      );
      getWebForms(
        "v_ui_node_x_connection_upstream",
        layer,
        pol_id,
        id_name,
        null,
        function (err, response) {
          if (err && err != 404) {
            _self.emit(
              "log",
              "form.js",
              "getWebFormsForConnect error on request upstream",
              "error",
              err
            );
            cb(err, null);
          } else {
            if (err === 404) {
              _self.emit(
                "log",
                "form.js",
                "getWebFormsForConnect no data for upstream/downstream",
                "warn",
                err
              );
              cb(null, { upstream: null, downtream: null });
            }
            cb(null, response);
          }
        }
      );
    } else {
      getWebForms(
        "v_ui_arc_x_connection",
        layer,
        pol_id,
        id_name,
        null,
        function (err, response) {
          if (err && err != 404) {
            _self.emit(
              "log",
              "form.js",
              "getWebFormsForConnect error on request v_ui_arc_x_connection",
              "error",
              err
            );
            cb(err, null);
          } else {
            if (err === 404) {
              _self.emit(
                "log",
                "form.js",
                "getWebFormsForConnect no data for v_ui_arc_x_connection",
                "warn",
                err
              );
            } else {
              let related = response;
              let dataToSend = {};
              dataToSend.layer = layer;
              dataToSend.pol_id = pol_id;
              dataToSend.device = _device;
              dataToSend.id_name = id_name;
              dataToSend.token = _token;
              dataToSend.what = "GET_NODES_FOR_ARC_CONNECT";
              dataToSend.expected_api_version = _expected_api_version;
              axios
                .post(_baseHref + "/ajax.sewernet.php", dataToSend)
                .then(function (response) {
                  _self.emit(
                    "log",
                    "form.js",
                    "getWebFormsForConnect",
                    "success",
                    response.data.message
                  );
                  if (response.data.status === "Accepted") {
                    cb(null, {
                      table: response.data.message.table,
                      node1: response.data.message.node1[0],
                      node2: response.data.message.node2[0],
                    });
                  } else {
                    cb(true, { related: response.data });
                  }
                })
                .catch((error) => {
                  _self.emit(
                    "log",
                    "form.js",
                    "getWebFormsForConnect error on request",
                    "error",
                    error
                  );
                });
            }
          }
        }
      );
    }
    /*	}else{
			return false;
		}*/
  }
  //******************     END GENERIC FORM    *********************

  //****************************************************************
  //*******************     INFO FORM TAB FILES     ****************
  //****************************************************************

  function getInfoFiles(pol_id, id_name, selected_layer, tableName) {
    _self.emit("log", "form.js", "getInfoFiles()", "info", {
      pol_id: pol_id,
      id_name: id_name,
      selected_layer: selected_layer,
      tableName: tableName,
    });
    return new Promise((resolve, reject) => {
      let dataToSend = {};
      //dataToSend.layer			= layer
      dataToSend.device = _device;
      dataToSend.pol_id = pol_id;
      dataToSend.id_name = id_name;
      dataToSend.selected_layer = selected_layer;
      dataToSend.tableName = tableName;
      dataToSend.token = _token;
      dataToSend.what = "GET_INFO_FILES";
      dataToSend.expected_api_version = _expected_api_version;
      axios
        .post(_baseHref + "/ajax.sewernet.php", dataToSend)
        .then(function (response) {
          _self.emit(
            "log",
            "visits.js",
            "getInfoFiles",
            "success",
            response.data.message
          );
          resolve(response.data.message.body);
        })
        .catch((e) => {
          _self.emit(
            "log",
            "visits.js",
            "getInfoFiles",
            "error",
            response.data
          );
          reject(e);
        });
    });
  }

  function setFeatureFile(
    pol_id,
    idName,
    info_type,
    tableName,
    photos,
    deviceTrace
  ) {
    _self.emit("log", "form.js", "setFeatureFile()", "info", {
      pol_id: pol_id,
      idName: idName,
      info_type: info_type,
      tableName: tableName,
      photos: photos,
      deviceTrace: deviceTrace,
    });
    return new Promise((resolve, reject) => {
      let dataToSend = {};
      dataToSend.device = _device;
      dataToSend.id = pol_id;
      dataToSend.idName = idName;
      dataToSend.tableName = tableName;
      dataToSend.token = _token;
      dataToSend.info_type = info_type;
      dataToSend.deviceTrace = JSON.stringify(deviceTrace);
      dataToSend.photos = JSON.stringify(photos);
      dataToSend.what = "SET_FEAUTURE_FILE";
      dataToSend.expected_api_version = _expected_api_version;
      axios
        .post(_baseHref + "/ajax.sewernet.php", dataToSend)
        .then(function (response) {
          _self.emit(
            "log",
            "visits.js",
            "setFeatureFile",
            "success",
            response.data.message
          );
          resolve(response.data.message.body);
        })
        .catch((e) => {
          _self.emit(
            "log",
            "visits.js",
            "setFeatureFile",
            "error",
            response.data
          );
          reject(e);
        });
    });
  }

  function deleteFeatureFile(pol_id, file_id, info_type) {
    _self.emit("log", "form.js", "deleteFeatureFile()", "info", {
      pol_id: pol_id,
      file_id: file_id,
      info_type: info_type,
    });
    return new Promise((resolve, reject) => {
      let dataToSend = {};
      dataToSend.device = _device;
      dataToSend.id = pol_id;
      dataToSend.file_id = file_id;
      dataToSend.token = _token;
      dataToSend.info_type = info_type;
      dataToSend.what = "DELETE_FEAUTURE_FILE";
      dataToSend.expected_api_version = _expected_api_version;
      axios
        .post(_baseHref + "/ajax.sewernet.php", dataToSend)
        .then(function (response) {
          _self.emit(
            "log",
            "visits.js",
            "deleteFeatureFile",
            "success",
            response.data.message
          );
          resolve(response.data.message.body);
        })
        .catch((e) => {
          _self.emit(
            "log",
            "visits.js",
            "deleteFeatureFile",
            "error",
            response.data
          );
          reject(e);
        });
    });
  }

  //****************************************************************
  //*******************    END INFO FORM TAB FILES  ****************
  //****************************************************************

  //****************************************************************
  //*******************      END GET WEB FORMS      ****************
  //****************************************************************

  //****************************************************************
  //*******************             VISITS          ****************
  //****************************************************************

  function deleteVisit(visit_id, layer, cb) {
    if (visit_id === constants.get("SELECT")) {
      cb("no visit_id", false);
    } else {
      _visits.deleteVisit(visit_id, layer, cb);
    }
  }

  function getWebFormsForVisit(formIdentifier, pol_id, id_name, options, cb) {
    _self.emit(
      "log",
      "form.js",
      "getWebFormsForVisit(" + formIdentifier + "," + pol_id + ")",
      "info",
      options
    );
    _visits.getWebFormsForVisit(
      formIdentifier,
      pol_id,
      id_name,
      options,
      constants,
      cb
    );
  }

  function upsertVisit(layer, coordinates, epsg, pol_id, id_name, cb) {
    _self.emit(
      "log",
      "form.js",
      "insertVisit(" +
        layer +
        "," +
        coordinates +
        "," +
        epsg +
        "," +
        pol_id +
        "," +
        id_name +
        ")",
      "info"
    );
    _visits.upsertVisit(layer, coordinates, epsg, pol_id, id_name, cb);
  }

  function updateVisit(layer, visit_id, key, value, pol_id, id_name, cb) {
    _visits.updateVisit(layer, visit_id, key, value, pol_id, id_name, cb);
  }

  function getVisitsFromFeature(layer, pol_id, id_name, options, cb) {
    _self.emit(
      "log",
      "form.js",
      "getVisitsFromFeature(" + layer + "," + pol_id + ")",
      "info",
      options
    );
    _visits.getVisitsFromFeature(layer, pol_id, id_name, options, cb);
  }

  function getParameterIdFromParameterType(layer, paramaterType, id_name, cb) {
    _visits.getParameterIdFromParameterType(layer, paramaterType, id_name, cb);
  }

  //visits new implementation
  function gwGetVisit(data, cb) {
    data.device = _device;
    _visits.gwGetVisit(data, cb);
  }

  function gwSetVisit(data, cb) {
    data.device = _device;
    _visits.gwSetVisit(data, cb);
  }

  function gwSetDelete(
    pol_id,
    id_name,
    info_type,
    featureType,
    tableName,
    idname,
    id,
    formData,
    cb
  ) {
    _visits.gwSetDelete(
      pol_id,
      id_name,
      info_type,
      featureType,
      tableName,
      idname,
      id,
      formData,
      _device,
      cb
    );
  }

  function gwGetVisitManager(
    pol_id,
    id_name,
    visit_id,
    info_type,
    formParameters,
    formFeatureData,
    formPagination,
    formData,
    deviceTrace,
    extraData,
    cb
  ) {
    _visits.gwGetVisitManager(
      pol_id,
      id_name,
      visit_id,
      info_type,
      formParameters,
      formFeatureData,
      formPagination,
      formData,
      deviceTrace,
      extraData,
      _device,
      cb
    );
  }

  function gw_api_setvisitmanagerend(
    pol_id,
    id_name,
    visit_id,
    info_type,
    formParameters,
    formFeatureData,
    formPagination,
    formData,
    deviceTrace,
    extraData,
    cb
  ) {
    _visits.gw_api_setvisitmanagerend(
      pol_id,
      id_name,
      visit_id,
      info_type,
      formParameters,
      formFeatureData,
      formPagination,
      formData,
      deviceTrace,
      extraData,
      _device,
      cb
    );
  }

  function gw_api_setvisitmanagerstart(
    pol_id,
    id_name,
    visit_id,
    info_type,
    formParameters,
    formFeatureData,
    formPagination,
    formData,
    deviceTrace,
    extraData,
    cb
  ) {
    _visits.gw_api_setvisitmanagerstart(
      pol_id,
      id_name,
      visit_id,
      info_type,
      formParameters,
      formFeatureData,
      formPagination,
      formData,
      deviceTrace,
      extraData,
      _device,
      cb
    );
  }

  function gwSetVisitManager(
    pol_id,
    id_name,
    visit_id,
    info_type,
    formParameters,
    formFeatureData,
    formPagination,
    formData,
    deviceTrace,
    extraData,
    cb
  ) {
    _visits.gwSetVisitManager(
      pol_id,
      id_name,
      visit_id,
      info_type,
      formParameters,
      formFeatureData,
      formPagination,
      formData,
      deviceTrace,
      extraData,
      _device,
      cb
    );
  }

  function gwGetLot(
    pol_id,
    id_name,
    info_type,
    featureType,
    tableName,
    idname,
    id,
    formData,
    cb
  ) {
    _visits.gwGetLot(
      pol_id,
      id_name,
      info_type,
      featureType,
      tableName,
      idname,
      id,
      formData,
      _device,
      cb
    );
  }

  function gwSetLot(
    pol_id,
    id_name,
    info_type,
    featureType,
    tableName,
    idname,
    id,
    formData,
    deviceTrace,
    cb
  ) {
    _visits.gwSetLot(
      pol_id,
      id_name,
      info_type,
      featureType,
      tableName,
      idname,
      id,
      formData,
      deviceTrace,
      _device,
      cb
    );
  }

  function gwSetVehicleLoad(info_type, formData, deviceTrace) {
    return _visits.gwSetVehicleLoad(info_type, formData, deviceTrace, _device);
  }

  function gw_fct_setunitinterval(info_type, formData, deviceTrace) {
    return _visits.gw_fct_setunitinterval(
      info_type,
      formData,
      deviceTrace,
      _device
    );
  }

  function setUpOfflineVisit(props) {
    return _visits.setUpOfflineVisit(props);
  }
  function clearOfflineVisits(data) {
    return _visits.clearOfflineVisits(data);
  }
  function clearVisitedSpots() {
    return _visits.clearVisitedSpots();
  }
  function dumpOfflineVisits(data) {
    return _visits.dumpOfflineVisits(data);
  }
  function saveVisitPicture(data, preview, fileName, metaData) {
    data.device = _device;
    return _visits.saveVisitPicture(data, preview, fileName, metaData);
  }
  function renderVisitedSpotsLayer(options) {
    return _visits.renderVisitedSpotsLayer(options);
  }
  function toggleVisitedSpots(options) {
    return _visits.toggleVisitedSpots(options);
  }
  function storeVisitForms() {
    _visits.storeVisitForms();
  }
  function storeDownloadDate() {
    return _visits.storeDownloadDate();
  }
  //****************************************************************
  //*******************         END VISITS         *****************
  //****************************************************************

  //****************************************************************
  //*******************            EVENTS          *****************
  //****************************************************************

  function getEventFormTypeAndEvent(
    visit_parameter_id,
    pol_id,
    id_name,
    layer,
    cb
  ) {
    _eventsModule.getEventFormTypeAndEvent(
      visit_parameter_id,
      pol_id,
      id_name,
      layer,
      cb
    );
  }

  function insertEvent(
    layer,
    visit_id,
    pol_id,
    id_name,
    eventData,
    formId,
    photos,
    compasses,
    cb
  ) {
    _eventsModule.insertEvent(
      layer,
      visit_id,
      pol_id,
      id_name,
      eventData,
      formId,
      photos,
      compasses,
      cb
    );
  }

  function deleteEvent(layer, event_id, cb) {
    _eventsModule.deleteEvent(layer, event_id, cb);
  }

  function getEvent(layer, event_id, pol_id, id_name, cb) {
    _eventsModule.getEvent(layer, event_id, pol_id, id_name, cb);
  }

  function updateEvent(layer, event_id, key, value, pol_id, id_name, cb) {
    _eventsModule.updateEvent(layer, event_id, key, value, pol_id, id_name, cb);
  }

  //****************************************************************
  //*******************         END EVENTS         *****************
  //****************************************************************

  //****************************************************************
  //*******************           GALLERY          *****************
  //****************************************************************

  function getGallery(layer, type, id, cb) {
    _self.emit(
      "log",
      "form.js",
      "getGallery(" + layer + "," + type + "," + id + ")",
      "info"
    );
    let dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.type = type;
    dataToSend.id = id;
    dataToSend.token = _token;
    dataToSend.what = "GET_GALLERY";
    dataToSend.expected_api_version = _expected_api_version;
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        _self.emit(
          "log",
          "forms.js",
          "getGallery",
          "success",
          response.data.message
        );
        if (response.data.status === "Accepted") {
          cb(null, response.data.message);
        } else {
          cb(response.data.code, response.data.message);
        }
      })
      .catch((error) => {
        _self.emit("log", "form.js", "getGallery", "error", error);
      });
  }

  function deletePhoto(layer, hash, cb) {
    _self.emit(
      "log",
      "form.js",
      "deletePhoto(" + layer + "," + hash + ")",
      "info"
    );
    let dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.hash = hash;
    dataToSend.token = _token;
    dataToSend.what = "DELETE_EVENT_PHOTO";
    dataToSend.expected_api_version = _expected_api_version;
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        _self.emit(
          "log",
          "forms.js",
          "deletePhoto",
          "success",
          response.data.message
        );
        if (response.data.status === "Accepted") {
          cb(null, response.data.message);
        } else {
          cb(response.data.code, response.data.message);
        }
      })
      .catch((error) => {
        _self.emit("log", "form.js", "deletePhoto", "error", error);
      });
  }
  //****************************************************************
  //*******************        END GALLERY         *****************
  //****************************************************************

  //****************************************************************
  //*******************         FEATURES           *****************
  //****************************************************************

  function getInsertFeatureForm(layer, db_table, cb) {
    _features.getInsertFeatureForm(layer, db_table, cb);
  }

  function insertFeature(layer, db_table, epsg, formData, geometry, cb) {
    _features.insertFeature(layer, db_table, epsg, formData, geometry, cb);
  }

  function deleteFeature(layer, db_table, id_name, id, cb) {
    _features.deleteFeature(layer, db_table, id_name, id, cb);
  }

  function updateFeature(layer, db_table, key, value, pol_id, id_name, cb) {
    _features.updateFeature(layer, db_table, key, value, pol_id, id_name, cb);
  }

  function updateFeatureGeometry(
    layer,
    db_table,
    epsg,
    pol_id,
    id_name,
    geometry,
    cb
  ) {
    _features.updateFeatureGeometry(
      layer,
      db_table,
      epsg,
      pol_id,
      id_name,
      geometry,
      cb
    );
  }

  function getInfoForm(
    layer,
    db_table,
    id_name,
    pol_id,
    edit,
    pointAttributtes,
    cb
  ) {
    _features.getInfoForm(
      layer,
      db_table,
      id_name,
      pol_id,
      edit,
      pointAttributtes,
      _info_type,
      cb
    );
  }

  function getInfoFormFromCoordinates(
    x,
    y,
    active_layer,
    visible_layers,
    editable_layers,
    epsg,
    zoomlevel,
    use_tiled_background,
    visitable,
    cb
  ) {
    _features.getInfoFormFromCoordinates(
      x,
      y,
      active_layer,
      visible_layers,
      editable_layers,
      epsg,
      zoomlevel,
      _info_type,
      use_tiled_background,
      visitable,
      cb
    );
  }

  function getInfoFromPolygon(data) {
    data.device = _device;
    return _features.getInfoFromPolygon(data);
  }

  //****************************************************************
  //*******************       END FEATURES      ********************
  //****************************************************************

  //****************************************************************
  //******************    GET FEATURE TYPE      ********************
  //****************************************************************

  //not used!!! Is for connect tab, solved by faking an info on the map
  function getFeatureType(featurecat_id, layer, cb) {
    _self.emit(
      "log",
      "form.js",
      "getFeatureType(" + featurecat_id + "," + layer + ")",
      "info"
    );
    let dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.featurecat_id = featurecat_id;
    dataToSend.token = _token;
    dataToSend.what = "GET_FEATURE_TYPE";
    dataToSend.expected_api_version = _expected_api_version;
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        _self.emit(
          "log",
          "forms.js",
          "getFeatureType",
          "success",
          response.data.message
        );
        if (response.data.status === "Accepted") {
          cb(null, response.data.message);
        } else {
          cb(response.data.code, response.data.message);
        }
      })
      .catch((error) => {
        _self.emit("log", "form.js", "getFeatureType", "error", error);
      });
  }

  //****************************************************************
  //******************    END GET FEATURE TYPE  ********************
  //****************************************************************

  //****************************************************************
  //********************    FORM AND TABS      *********************
  //****************************************************************

  /***
		getTableFromLayer_id_name
			obtains wich db table should be used in a request based on layer_id_name or specific form identifier

			@param formId <string>
			@param layer_id_name <string>

			@return <string>
	***/

  function getTableFromLayer_id_name(formId, layer_id_name) {
    return _formsContents.getTableFromLayer_id_name(formId, layer_id_name);
  }

  /***
		getTableFromLayer_id_name
			obtains wich db table should be used in a request based on layer_id_name or specific form identifier

			@param formId <string>
			@param layer_id_name <string>

			@return <string>

	***/

  function getFormByFormId(formId) {
    return _formsContents.getFormByFormId(formId);
  }

  //****************************************************************
  //*******************    END FORM AND TABS   *********************
  //****************************************************************

  //****************************************************************
  //*************                FILTERS             ***************
  //****************************************************************

  function initFilters(use_tiled_background) {
    _filters = new Filters({
      project_type: _project_type,
      token: _token,
      baseHref: _baseHref,
      device: _device,
      use_tiled_background: use_tiled_background,
      expected_api_version: _expected_api_version,
      strings: _options.strings,
    });
    _filters.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _filters.on("notifyToMap", function (data, extraData) {
      _self.emit("notifyToMap", data, extraData);
    });
  }

  function getFilters() {
    return _filters.getFilters();
  }
  function getFormFilters(use_tiled_background, cb) {
    _filters.getFormFilters(use_tiled_background, cb);
  }

  function updateFilters(field, value, filterName, cb) {
    _filters.updateFilters(field, value, filterName, cb);
  }

  function updateAllFilters(tabs, selectedTab, value, tabName) {
    return _filters.updateAllFilters(tabs, selectedTab, value, tabName);
  }
  //****************************************************************
  //*************              END FILTERS           ***************
  //****************************************************************

  //****************************************************************
  //*************                  SEARCH            ***************
  //****************************************************************

  function getSearchForm(cb) {
    _search.getSearchForm(_info_type, cb);
  }

  function getDataForAddress(extent, val, searchService) {
    return _search.getDataForAddress(extent, val, searchService);
  }

  function updateSearch(fields, tabName, fieldName, val) {
    return _search.updateSearch(fields, tabName, fieldName, val);
  }

  function updateSearchAdd(fields, tabName, fieldName, val) {
    return _search.updateSearchAdd(fields, tabName, fieldName, val);
  }

  function searchDataSet(val, dataSet, feature) {
    return _search.searchDataSet(val, dataSet, feature);
  }

  //****************************************************************
  //*************               END SEARCH           ***************
  //****************************************************************

  //****************************************************************
  //*************                  PRINT             ***************
  //****************************************************************

  function getPrintForm(composer, cb) {
    _print.getPrintForm(composer, cb);
  }

  function printComposer(composer, extent, map, tiledLayers, filters, cb) {
    _print.printComposer(composer, extent, map, tiledLayers, filters, cb);
  }

  function updatePrint(formData, extent, use_tiled_background, cb) {
    _print.updatePrint(formData, extent, use_tiled_background, cb);
  }

  function captureScreen(map, cb) {
    _print.captureScreen(map, cb);
  }
  //****************************************************************
  //*************                END PRINT           ***************
  //****************************************************************

  //****************************************************************
  //*************                 MINCUT             ***************
  //****************************************************************

  function getMincut(x, y, epsg, mincut_id_arg, id_name, cb) {
    _mincut.getMincut(x, y, epsg, mincut_id_arg, id_name, cb);
  }

  function getInfoMincut(id_name, pol_id, fromDate, toDate, cb) {
    _mincut.getInfoMincut(id_name, pol_id, fromDate, toDate, cb);
  }

  function upsertMincut(mincut_id, x, y, srid, id_name, pol_id, formData, cb) {
    _mincut.upsertMincut(
      mincut_id,
      x,
      y,
      srid,
      _device,
      id_name,
      pol_id,
      formData,
      cb
    );
  }

  function getMincutManager(cb) {
    _mincut.getMincutManager(_device, cb);
  }

  function updateMincutManager(formData, tabName, cb) {
    _mincut.updateMincutManager(formData, tabName, _device, cb);
  }

  function excludeFromMincut(valve_id, mincut_id, cb) {
    _mincut.excludeFromMincut(valve_id, mincut_id, _device, cb);
  }

  function endMincut(mincut_id, id_name, pol_id, formData, cb) {
    _mincut.endMincut(mincut_id, _device, id_name, pol_id, formData, cb);
  }

  function startMincut(mincut_id, cb) {
    _mincut.startMincut(mincut_id, _device, cb);
  }

  function processGetMincut(body, cb) {
    _mincut.processGetMincut(body, cb);
  }

  function updateMincutAdd(fields, tabName, fieldName, val) {
    return _mincut.updateMincutAdd(fields, tabName, fieldName, val);
  }

  function setMincutValveLayerTableName(value) {
    _mincutValveLayerTableName = value;
  }

  function getMincutValveLayerTableName() {
    return _mincutValveLayerTableName;
  }

  function setMincutGeometryForZoom(value) {
    _mincutGeometryForZoom = value;
  }

  function getMincutGeometryForZoom() {
    return _mincutGeometryForZoom;
  }

  function setId_name_mincut(value) {
    _id_name_mincut = value;
  }

  function getId_name_mincut() {
    return _id_name_mincut;
  }

  function setPol_id_mincut(value) {
    _pol_id_mincut = value;
  }

  function getPol_id_mincut() {
    return _pol_id_mincut;
  }
  //****************************************************************
  //*************                END MINCUT          ***************
  //****************************************************************

  //****************************************************************
  //*************            DATES SELECTOR          ***************
  //****************************************************************

  function getDatesForm(use_tiled_background, cb) {
    _datesSelector.getDatesForm(use_tiled_background, cb);
  }
  function setFilterDate(formData, cb) {
    _datesSelector.setFilterDate(formData, cb);
  }

  //****************************************************************
  //*************          END DATES SELECTOR        ***************
  //****************************************************************

  //****************************************************************
  //*************        SET FORM COORDINATES        ***************
  //****************************************************************

  /*
		setFormCoordinates


	*/
  function setFormCoordinates(pos_x, pos_y, srid, zoom, form_id, uniqueId, cb) {
    try {
      _self.emit(
        "log",
        "forms.js",
        "setFormCoordinates(" +
          pos_x +
          "," +
          pos_y +
          "," +
          zoom +
          "," +
          form_id +
          "," +
          uniqueId +
          ")",
        "info"
      );
      let dataToSend = {};
      dataToSend.pos_x = pos_x;
      dataToSend.pos_y = pos_y;
      dataToSend.form_id = form_id;
      dataToSend.zoom = zoom;
      dataToSend.device = _device;
      dataToSend.srid = srid;
      dataToSend.uniqueId = uniqueId;
      dataToSend.token = _token;
      dataToSend.what = "SET_FORM_COORDINATES";
      dataToSend.expected_api_version = _expected_api_version;
      axios
        .post(_baseHref + "/ajax.sewernet.php", dataToSend)
        .then(function (response) {
          _self.emit(
            "log",
            "forms.js",
            "setFormCoordinates",
            "success",
            response.data.message
          );
          if (response.data.status === "Accepted") {
            cb(null, response.data.message);
          } else {
            cb(response.data.message, response.data.message);
          }
        })
        .catch((error) => {
          _self.emit("log", "form.js", "setFormCoordinates", "error", error);
        });
    } catch (e) {
      _self.emit("log", "form.js", "setFormCoordinates error", "error", e);
      cb(e, false);
    }
  }

  //****************************************************************
  //************       END SET FORM COORDINATES        *************
  //****************************************************************

  /*
		getValueFromEditableField
			finds a value on editData from an info (used e.g on excludeMincut)
	*/
  function getValueFromEditableField(data, fieldToFind) {
    if (typeof data.editData != "undefined") {
      if (typeof data.editData.fields != "undefined") {
        for (let i = 0; i < data.editData.fields.length; i++) {
          if (data.editData.fields[i].name === fieldToFind) {
            return data.editData.fields[i].value;
            break;
          }
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //****************************************************************
  //****************   DISPLAY OR NOT INPUTS   *********************
  //****************************************************************

  /***
		showInput
			checks if a a DOM element should be displayed or not for a given form

			@param formId <string> form identifier
			@param inputName <string> DOM element

			@return <BOOLEAN>

	***/

  function showInput(formId, inputName) {
    if (formId === "F11") {
      switch (inputName) {
        case "btAddVisit":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F12") {
      switch (inputName) {
        case "btAddVisit":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F13") {
      switch (inputName) {
        case "btAddVisit":
        case "btsConnectNode":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F21") {
      switch (inputName) {
        case "btVisitManager":
        case "select_visitcat_id":
        case "code":
        case "btAdd":
        case "tableViewEvents":
        case "checkVisitDone":
        case "checkVisitSuspended":
        case "parameter_type":
        case "parameter_id":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F22") {
      switch (inputName) {
        case "Value":
        case "btAddPhoto":
        case "btViewGallery":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F23") {
      switch (inputName) {
        case "Value":
        case "position_id":
        case "position_value":
        case "btAddPhoto":
        case "btViewGallery":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F24") {
      switch (inputName) {
        case "Value":
        case "position_id":
        case "position_value":
        case "value1":
        case "value2":
        case "geom1":
        case "geom2":
        case "geom3":
        case "btAddPhoto":
        case "btViewGallery":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F27") {
      switch (inputName) {
        case "btDeletePicture":
        case "btSeePicture":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F51") {
      switch (inputName) {
        case "review.arc_id":
        case "review.y1":
        case "review.y2":
        case "review.arc_type":
        case "review.matcat_id":
        case "review.shape":
        case "review.geom1":
        case "review.geom2":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F52") {
      switch (inputName) {
        case "review.node_id":
        case "review.top_elev":
        case "review.node_type":
        case "review.matcat_id":
        case "review.shape":
        case "review.geom1":
        case "review.geom2":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F53") {
      switch (inputName) {
        case "review.connec_id":
        case "review.y1":
        case "review.y2":
        case "review.connec_type":
        case "review.matcat_id":
        case "review.shape":
        case "review.geom1":
        case "review.geom2":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F54") {
      switch (inputName) {
        case "review.gully_id":
        case "review.top_elev":
        case "review.ymax":
        case "review.sandbox":
        case "review.matcat_id":
        case "review.gratecat_id":
        case "review.units":
        case "review.groove":
        case "review.siphon":
        case "review.connec_matcat":
        case "review.shape":
        case "review.geom1":
        case "review.geom2":
        case "review.featurecat_id":
        case "review.feature_id":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F55") {
      switch (inputName) {
        case "review.arc_id":
        case "review.matcat_id":
        case "review.pnom":
        case "review.dnom":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F56") {
      switch (inputName) {
        case "review.node_id":
        case "review.elevation":
        case "review.depth":
        case "review.from_plot":
        case "review.node_type":
        case "review.nodecat_id":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else if (formId === "F57") {
      switch (inputName) {
        case "review.connec_id":
        case "review.matcat_id":
        case "review.pnom":
        case "review.dnom":
        case "review.annotation":
        case "review.observ":
        case "review.done":
          return true;
          break;
        default:
          return false;
          break;
      }
    } else {
      return false;
    }
  }
  //****************************************************************
  //*************     END DISPLAY OR NOT INPUTS   ******************
  //****************************************************************

  function cleanInputs(value, type) {
    let retorn;
    if (
      value == "undefined" ||
      typeof value === "undefined" ||
      typeof type === "undefined"
    ) {
      return "";
    }
    if (type === "int") {
      retorn = parseInt(value);
      if (isNaN(retorn)) {
        retorn = "";
      }
    } else if (type === "double") {
      if (!isNaN(parseFloat(value))) {
        if (!isFinite(value)) {
          retorn = "";
        } else {
          retorn = parseFloat(parseFloat(value).toFixed(2));
        }
      } else {
        retorn = "";
      }
    } else if (type === "string") {
      retorn = value;
    } else {
      retorn = "";
    }
    return retorn;
  }

  function validateInput(value, type) {
    let retorn;
    if (
      value == "undefined" ||
      typeof value === "undefined" ||
      typeof type === "undefined"
    ) {
      retorn = false;
    } else {
      if (type === "int") {
        retorn = parseInt(value);
        if (isNaN(retorn)) {
          retorn = false;
        } else {
          retorn = true;
        }
      } else if (type === "double") {
        if (!isNaN(parseFloat(value))) {
          if (!isFinite(value)) {
            retorn = false;
          } else {
            retorn = true;
          }
        } else {
          retorn = false;
        }
      } else {
        retorn = true;
      }
    }
    return retorn;
  }

  //****************************************************************
  //*************             FORM HISTORY        ******************
  //****************************************************************

  /***
		getFormHistory
			gets form history for navigation in forms

			@return <JSON> or NULL

	***/

  function getFormHistory() {
    _self.emit("log", "form.js", "getFormHistory()", "info", _historyObj);
    if (_historyObj.length > 0) {
      return _historyObj[_historyObj.length - 1];
    } else {
      return _historyObj;
    }
  }
  /***
		addFormHistory
			add form history object

			@param info <JSON> or NULL

			@return <BOOLEAN>

	***/

  function addFormHistory(info) {
    _self.emit("log", "form.js", "addFormHistory()", "info", info);
    if (typeof info != "object" || info === null) {
      return false;
    } else {
      let canAdd = true;
      for (var i = 0; i < _historyObj.length; i++) {
        if (_historyObj[i].formId === info.formId) {
          canAdd = false;
          break;
        }
      }
      if (canAdd) {
        _historyObj.push(info);
      }
      return true;
    }
  }

  function removeFormHistory(title) {
    _self.emit("log", "form.js", "removeFormHistory(" + title + ")", "info");
    if (typeof title != "string" || title === null) {
      return false;
    } else {
      for (var i = 0; i < _historyObj.length; i++) {
        if (_historyObj[i].formId === title) {
          _historyObj.splice(i, 1);
        }
      }
      return true;
    }
  }
  /***
		resetFormHistory
			empty form history object
			@return <BOOLEAN>

	***/

  function resetFormHistory() {
    _self.emit("log", "form.js", "resetFormHistory()", "info");
    _historyObj = new Array();
    return true;
  }

  /***
		showBackBt
			checks if a a backButton element should be displayed or not

			@return <BOOLEAN>

	***/

  function showBackBt() {
    if (_historyObj.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  /***
		updateHistoryTab
			updates tab for display correct tab in a form

			@param tab <int>

	***/

  function updateHistoryTab(tab) {
    if (_historyObj && !isNaN(tab) && tab !== null) {
      _historyObj.tab = tab;
    } else {
      if (_historyObj) {
        delete _historyObj["tab"];
      }
    }
  }

  //****************************************************************
  //*************           END  FORM HISTORY       ****************
  //****************************************************************

  //****************************************************************
  //*************          Exclude for mincut       ****************
  //****************************************************************
  function setExcludingMincut(bool) {
    _excludingMincut = bool;
  }
  function getExcludingMincut() {
    return _excludingMincut;
  }

  //****************************************************************
  //*************       END Exclude for mincut      ****************
  //****************************************************************

  //****************************************************************
  //*************              FLOWTRACE             ***************
  //****************************************************************

  function initFlowTrace() {
    _flowTrace = new FlowTrace({
      project_type: _project_type,
      token: _token,
      vidrotoken: _vidrotoken,
      baseHref: _baseHref,
      device: _device,
      project_id: _project_id,
      strings: _options.strings,
      vidroapi: _vidroapi,
    });
    _flowTrace.on("log", function (mod, data, level, extraData) {
      _self.emit("log", mod, data, level, extraData);
    });
    _flowTrace.on("notifyToMap", function (data, extraData) {
      _self.emit("notifyToMap", data, extraData);
    });
  }

  /*function getFilters() {
    return _filters.getFilters();
  }
  function getFormFilters(use_tiled_background, cb) {
    _filters.getFormFilters(use_tiled_background, cb);
  }

  function updateFilters(field, value, filterName, cb) {
    _filters.updateFilters(field, value, filterName, cb);
  }

  function updateAllFilters(tabs, selectedTab, value, tabName) {
    return _filters.updateAllFilters(tabs, selectedTab, value, tabName);
  }*/
  //****************************************************************
  //*************              END FLOWTRACE         ***************
  //****************************************************************

  module.exports = FormsSewernet;
  window.FormsSewernet = FormsSewernet;
  FormsSewernet.prototype.getVersion = () => {
    return version;
  };
  FormsSewernet.prototype.getInfoForm = getInfoForm;
  FormsSewernet.prototype.getInfoFormFromCoordinates =
    getInfoFormFromCoordinates;
  FormsSewernet.prototype.getInfoFromPolygon = getInfoFromPolygon;
  FormsSewernet.prototype.getWebForms = getWebForms;
  FormsSewernet.prototype.getInfoFiles = getInfoFiles;
  FormsSewernet.prototype.setFeatureFile = setFeatureFile;
  FormsSewernet.prototype.deleteFeatureFile = deleteFeatureFile;
  FormsSewernet.prototype.getFormHistory = getFormHistory;
  FormsSewernet.prototype.addFormHistory = addFormHistory;
  FormsSewernet.prototype.resetFormHistory = resetFormHistory;
  FormsSewernet.prototype.showBackBt = showBackBt;
  FormsSewernet.prototype.removeFormHistory = removeFormHistory;
  FormsSewernet.prototype.updateHistoryTab = updateHistoryTab;
  FormsSewernet.prototype.setLocalizedStrings = setLocalizedStrings;
  FormsSewernet.prototype.showInput = showInput;
  FormsSewernet.prototype.deleteVisit = deleteVisit;
  FormsSewernet.prototype.upsertVisit = upsertVisit;
  FormsSewernet.prototype.getVisitsFromFeature = getVisitsFromFeature;
  FormsSewernet.prototype.getParameterIdFromParameterType =
    getParameterIdFromParameterType;
  FormsSewernet.prototype.updateVisit = updateVisit;
  FormsSewernet.prototype.getEventFormTypeAndEvent = getEventFormTypeAndEvent;
  FormsSewernet.prototype.insertEvent = insertEvent;
  FormsSewernet.prototype.getEvent = getEvent;
  FormsSewernet.prototype.updateEvent = updateEvent;
  FormsSewernet.prototype.deleteEvent = deleteEvent;
  FormsSewernet.prototype.getWebFormsForConnect = getWebFormsForConnect;
  FormsSewernet.prototype.getWebFormsForVisit = getWebFormsForVisit;
  FormsSewernet.prototype.cleanInputs = cleanInputs;
  FormsSewernet.prototype.validateInput = validateInput;
  FormsSewernet.prototype.getTableFromLayer_id_name = getTableFromLayer_id_name; //TBR!!!!
  FormsSewernet.prototype.getFormByFormId = getFormByFormId;
  FormsSewernet.prototype.getGallery = getGallery;
  FormsSewernet.prototype.deletePhoto = deletePhoto;
  FormsSewernet.prototype.getInsertFeatureForm = getInsertFeatureForm;
  FormsSewernet.prototype.insertFeature = insertFeature;
  FormsSewernet.prototype.deleteFeature = deleteFeature;
  FormsSewernet.prototype.updateFeature = updateFeature;
  FormsSewernet.prototype.updateFeatureGeometry = updateFeatureGeometry;
  FormsSewernet.prototype.initFilters = initFilters;
  FormsSewernet.prototype.updateFilters = updateFilters;
  FormsSewernet.prototype.getFilters = getFilters;
  FormsSewernet.prototype.getFormFilters = getFormFilters;
  FormsSewernet.prototype.getSearchForm = getSearchForm;
  FormsSewernet.prototype.getDataForAddress = getDataForAddress;
  FormsSewernet.prototype.updateSearch = updateSearch;
  FormsSewernet.prototype.updateSearchAdd = updateSearchAdd;
  FormsSewernet.prototype.searchDataSet = searchDataSet;
  FormsSewernet.prototype.getPrintForm = getPrintForm;
  FormsSewernet.prototype.updatePrint = updatePrint;
  FormsSewernet.prototype.printComposer = printComposer;
  FormsSewernet.prototype.captureScreen = captureScreen;
  FormsSewernet.prototype.getInfoMincut = getInfoMincut;
  FormsSewernet.prototype.getMincut = getMincut;
  FormsSewernet.prototype.getExcludingMincut = getExcludingMincut;
  FormsSewernet.prototype.setExcludingMincut = setExcludingMincut;
  FormsSewernet.prototype.upsertMincut = upsertMincut;
  FormsSewernet.prototype.getMincutManager = getMincutManager;
  FormsSewernet.prototype.updateMincutManager = updateMincutManager;
  FormsSewernet.prototype.excludeFromMincut = excludeFromMincut;
  FormsSewernet.prototype.processGetMincut = processGetMincut;
  FormsSewernet.prototype.setFormCoordinates = setFormCoordinates;
  FormsSewernet.prototype.updateMincutAdd = updateMincutAdd;
  FormsSewernet.prototype.endMincut = endMincut;
  FormsSewernet.prototype.startMincut = startMincut;
  FormsSewernet.prototype.setMincutValveLayerTableName =
    setMincutValveLayerTableName;
  FormsSewernet.prototype.getMincutValveLayerTableName =
    getMincutValveLayerTableName;
  FormsSewernet.prototype.setMincutGeometryForZoom = setMincutGeometryForZoom;
  FormsSewernet.prototype.getMincutGeometryForZoom = getMincutGeometryForZoom;
  FormsSewernet.prototype.setId_name_mincut = setId_name_mincut;
  FormsSewernet.prototype.getId_name_mincut = getId_name_mincut;
  FormsSewernet.prototype.setPol_id_mincut = setPol_id_mincut;
  FormsSewernet.prototype.getPol_id_mincut = getPol_id_mincut;
  FormsSewernet.prototype.getValueFromEditableField = getValueFromEditableField;
  FormsSewernet.prototype.getDatesForm = getDatesForm;
  FormsSewernet.prototype.setFilterDate = setFilterDate;
  FormsSewernet.prototype.gwGetVisit = gwGetVisit;
  FormsSewernet.prototype.gwSetVisit = gwSetVisit;
  FormsSewernet.prototype.gwSetDelete = gwSetDelete;
  FormsSewernet.prototype.gwGetVisitManager = gwGetVisitManager;
  FormsSewernet.prototype.gw_api_setvisitmanagerstart =
    gw_api_setvisitmanagerstart;
  FormsSewernet.prototype.gw_api_setvisitmanagerend = gw_api_setvisitmanagerend;
  FormsSewernet.prototype.gwSetVisitManager = gwSetVisitManager;
  FormsSewernet.prototype.gwGetLot = gwGetLot;
  FormsSewernet.prototype.gwSetLot = gwSetLot;
  FormsSewernet.prototype.gwSetVehicleLoad = gwSetVehicleLoad;
  FormsSewernet.prototype.setUpOfflineVisit = setUpOfflineVisit;
  FormsSewernet.prototype.storeVisitForms = storeVisitForms;
  FormsSewernet.prototype.clearOfflineVisits = clearOfflineVisits;
  FormsSewernet.prototype.clearVisitedSpots = clearVisitedSpots;
  FormsSewernet.prototype.dumpOfflineVisits = dumpOfflineVisits;
  FormsSewernet.prototype.saveVisitPicture = saveVisitPicture;
  FormsSewernet.prototype.toggleVisitedSpots = toggleVisitedSpots;
  FormsSewernet.prototype.renderVisitedSpotsLayer = renderVisitedSpotsLayer;
  FormsSewernet.prototype.setToken = setToken;
  FormsSewernet.prototype.updateAllFilters = updateAllFilters;
  FormsSewernet.prototype.storeDownloadDate = storeDownloadDate;
  FormsSewernet.prototype.storeDownloadDate = storeDownloadDate;
  FormsSewernet.prototype.gw_fct_setunitinterval = gw_fct_setunitinterval;
  FormsSewernet.prototype.getgo2epa = () => {
    return _go2epa.getgo2epa();
  };
  FormsSewernet.prototype.setgo2epa = (data) => {
    return _go2epa.setgo2epa(data, _device);
  };
  FormsSewernet.prototype.showThumb = (hash) => {
    _self.emit("log", "form.js", "showThumb(" + hash + ")", "info");
    var noCache = Math.floor(Math.random() * 100 + 1);
    return axios
      .get(`${_baseHref}external.thumb.php?img=${hash}&noCache=${noCache}`)
      .then(function (result) {
        return result.data;
      });
  };
  FormsSewernet.prototype.getInfoFile = (hash) => {
    _self.emit("log", "form.js", "getInfoFile(" + hash + ")", "info");
    var noCache = Math.floor(Math.random() * 100 + 1);
    return axios
      .get(
        `${_baseHref}external.getinfofile.php?img=${hash}&noCache=${noCache}`
      )
      .then(function (result) {
        return result.data;
      });
  };
  FormsSewernet.prototype.getExtent = (data) => {
    _self.emit("log", "form.js", "getExtent()", "info", data);
    let dataToSend = {};
    dataToSend.data = data;
    dataToSend.token = _token;
    dataToSend.what = "GET_EXTENT";
    return axios
      .post(`${_baseHref}/ajax.sewernet.php`, dataToSend)
      .then(function (result) {
        return result.data;
      });
  };
  FormsSewernet.prototype.getmultiupdate = (ids, db_table) => {
    return _MultiUpdate.getmultiupdate(ids, _info_type, db_table);
  };
  FormsSewernet.prototype.setmultiupdate = (ids, db_table, idName, data) => {
    return _MultiUpdate.setmultiupdate(ids, db_table, idName, data, _info_type);
  };
  FormsSewernet.prototype.initFlowTrace = initFlowTrace;
  FormsSewernet.prototype.doUpstream = (xcoord, ycoord, zoomRatio) => {
    return _flowTrace.doUpstream(xcoord, ycoord, zoomRatio);
  };
  FormsSewernet.prototype.doDownStream = (xcoord, ycoord, zoomRatio) => {
    return _flowTrace.doDownStream(xcoord, ycoord, zoomRatio);
  };
})();
