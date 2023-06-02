/*jshint esversion: 6 */
(function () {
  "use strict";
  const util = require("util");
  const _events = require("events").EventEmitter;
  const axios = require("axios");

  let _project_type = "ws"; //<string> ws or ud
  let _self;
  let _token;
  let _baseHref;
  let _device;
  let _expected_api_version;

  util.inherits(EventsSewernet, _events);

  function EventsSewernet(options) {
    if (typeof options.project_type !== "undefined") {
      _project_type = options.project_type.toLowerCase();
    }
    _token = options.token;
    _baseHref = options.baseHref;
    _device = options.device;
    _expected_api_version = options.expected_api_version;
    _self = this;
    setTimeout(function () {
      _self.emit("log", "EventsSewernet.js", "Visits loaded", "success");
    }, 500);
  }
  function setToken(token) {
    _token = token;
  }
  function _setFieldValue(name, value, fields, disabled) {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].name === name) {
        fields[i].value = value;
        fields[i].disabled = disabled;
        break;
      }
    }
    return fields;
  }

  function _addInternalKeysToFields(fields, key, value) {
    for (let i = 0; i < fields.length; i++) {
      fields[i][key] = value;
    }
  }

  function _assignValuesToCombo(object) {
    let comboValues = Array();
    try {
      for (let i = 0; i < object.comboKeys.length; i++) {
        comboValues.push({
          id: object.comboKeys[i],
          name: object.comboValues[i],
        });
      }
      return comboValues;
    } catch (e) {
      _self.emit(
        "log",
        "EventsSewernet.js",
        "getEventFormTypeAndEvent error formatting combo",
        "error",
        e.message
      );
      return false;
    }
  }
  //****************************************************************
  //*******************     GET EVENT FORM TYPE     ****************
  //****************************************************************

  function getEventFormTypeAndEvent(
    visit_parameter_id,
    pol_id,
    id_name,
    layer,
    cb
  ) {
    _self.emit(
      "log",
      "EventsSewernet.js",
      "getEventFormTypeAndEvent(" +
        visit_parameter_id +
        "," +
        pol_id +
        "," +
        id_name +
        "," +
        layer +
        ")",
      "info"
    );
    let dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.visit_parameter_id = visit_parameter_id;
    dataToSend.arc_id = pol_id;
    dataToSend.id_name = id_name;
    dataToSend.token = _token;
    dataToSend.what = "GET_EVENT_FORM_TYPE_AND_EVENT";
    dataToSend.expected_api_version = _expected_api_version;
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        _self.emit(
          "log",
          "EventsSewernet.js",
          "getEventFormTypeAndEvent",
          "success",
          response.data
        );
        if (response.data.status === "Accepted") {
          try {
            let retorno = {};
            retorno.formToDisplay = response.data.message.formToDisplay;
            retorno.fields = response.data.message.fields;
            for (let i = 0; i < retorno.fields.length; i++) {
              if (retorno.fields[i].type === "combo") {
                retorno.fields[i].comboValues = _assignValuesToCombo(
                  retorno.fields[i]
                );
              }
            }
            retorno.fields = _setFieldValue(
              "parameter_id",
              visit_parameter_id,
              response.data.message.fields,
              true
            );
            _addInternalKeysToFields(
              retorno.fields,
              "formDataContainer",
              "eventData"
            );
            _addInternalKeysToFields(
              retorno.fields,
              "changeAction",
              "updateEvent"
            );
            //retorno.position 	= body.message.position;
            cb(null, retorno);
          } catch (e) {
            _self.emit(
              "log",
              "EventsSewernet.js",
              "getEventFormTypeAndEvent",
              "error",
              e.message
            );
            cb("Error in event: " + e.message, null);
          }
        } else {
          _self.emit(
            "log",
            "EventsSewernet.js",
            "getEventFormTypeAndEvent",
            "warn",
            response.data.message
          );
          cb(response.data.code, response.data.message);
        }
      })
      .catch((error) => {
        _self.emit(
          "log",
          "DateSelector.js",
          "getEventFormTypeAndEvent",
          "error",
          error
        );
      });
  }

  //****************************************************************
  //*****************    END GET EVENT FORM TYPE     ***************
  //****************************************************************

  //****************************************************************
  //*****************          INSERT EVENT          ***************
  //****************************************************************

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
    _self.emit(
      "log",
      "EventsSewernet.js",
      "insertEvent(" +
        layer +
        "," +
        visit_id +
        "," +
        pol_id +
        "," +
        id_name +
        "," +
        formId +
        ")",
      "info",
      [eventData, photos, compasses]
    );
    var dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.visit_id = visit_id;
    dataToSend.pol_id = pol_id;
    dataToSend.id_name = id_name;
    dataToSend.formId = formId;
    //dynamic attributes
    for (var k in eventData) {
      if (eventData.hasOwnProperty(k)) {
        dataToSend[k] = eventData[k];
      }
    }
    dataToSend.photos = photos;
    dataToSend.compasses = compasses;
    dataToSend.token = _token;
    dataToSend.what = "INSERT_EVENT";
    dataToSend.expected_api_version = _expected_api_version;
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        try {
          if (response.data.status === "Accepted") {
            _self.emit(
              "log",
              "EventsSewernet.js",
              "insertEvent",
              "success",
              response.data.message
            );
            cb(null, response.data.message.event_id);
          } else {
            cb(response.data.status, response.data.message);
          }
        } catch (e) {
          _self.emit(
            "log",
            "EventsSewernet.js",
            "insertEvent",
            "error",
            e.message
          );
          cb("Error in event: " + e.message, null);
        }
      })
      .catch((error) => {
        _self.emit("log", "DateSelector.js", "insertEvent", "error", error);
      });
  }

  //****************************************************************
  //*****************        END INSERT EVENT        ***************
  //****************************************************************

  function getEvent(layer, event_id, pol_id, id_name, cb) {
    _self.emit(
      "log",
      "EventsSewernet.js",
      "getEvent(" + layer + "," + event_id + "," + pol_id + "," + id_name + ")",
      "info"
    );
    var dataToSend = {};
    dataToSend.layer = layer;
    dataToSend.event_id = event_id;
    dataToSend.pol_id = pol_id;
    dataToSend.id_name = id_name;
    dataToSend.token = _token;
    dataToSend.what = "GET_EVENT";
    dataToSend.expected_api_version = _expected_api_version;
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        try {
          if (response.data.status === "Accepted") {
            _self.emit(
              "log",
              "EventsSewernet.js",
              "getEvent",
              "success",
              response.data.message
            );
            try {
              let retorno = {};
              retorno.event_data = response.data.message.event_data;
              retorno.formToDisplay =
                response.data.message.form_data.formToDisplay;
              retorno.fields = response.data.message.form_data.fields;
              for (let i = 0; i < retorno.fields.length; i++) {
                if (retorno.fields[i].type === "combo") {
                  retorno.fields[i].comboValues = _assignValuesToCombo(
                    retorno.fields[i]
                  );
                  retorno.fields[i].selectedValue =
                    retorno.event_data[retorno.fields[i].name];
                } else {
                  let disabled = false;
                  if (retorno.fields[i].name === "parameter_id") {
                    disabled = true;
                  }
                  retorno.fields = _setFieldValue(
                    retorno.fields[i].name,
                    retorno.event_data[retorno.fields[i].name],
                    retorno.fields,
                    disabled
                  );
                }
              }
              _addInternalKeysToFields(
                retorno.fields,
                "formDataContainer",
                "eventData"
              );
              _addInternalKeysToFields(
                retorno.fields,
                "changeAction",
                "updateEvent"
              );
              cb(null, retorno);
            } catch (e) {
              _self.emit(
                "log",
                "EventsSewernet.js",
                "getEvent",
                "error",
                e.message
              );
              cb("Error in event: " + e.message, null);
            }
          } else {
            cb(body.status, body.message);
          }
        } catch (e) {
          _self.emit(
            "log",
            "EventsSewernet.js",
            "getEvent",
            "error",
            e.message
          );
          cb("Error in event: " + e.message, null);
        }
      })
      .catch((error) => {
        _self.emit("log", "events.js", "getEvent", "error", error);
      });
  }

  function deleteEvent(layer, event_id, cb) {
    try {
      _self.emit(
        "log",
        "events.js",
        "deleteEvent(" + layer + "," + event_id + ")",
        "info"
      );
      let dataToSend = {};
      dataToSend.layer = layer;
      dataToSend.event_id = event_id;
      dataToSend.token = _token;
      dataToSend.what = "DELETE_EVENT";
      dataToSend.expected_api_version = _expected_api_version;
      axios
        .post(_baseHref + "/ajax.sewernet.php", dataToSend)
        .then(function (response) {
          if (response.data.status === "Accepted") {
            _self.emit(
              "log",
              "events.js",
              "deleteEvent response",
              "success",
              response.data.message
            );
            cb(null, response.data.message);
          } else {
            cb(response.data.message, false);
          }
        })
        .catch((error) => {
          _self.emit("log", "DateSelector.js", "deleteEvent", "error", error);
        });
    } catch (e) {
      _self.emit("log", "events.js", "deleteEvent error", "error", e);
      cb(e, false);
    }
  }

  function updateEvent(layer, event_id, key, value, pol_id, id_name, cb) {
    try {
      _self.emit(
        "log",
        "events.js",
        "updateEvent(" +
          layer +
          "," +
          key +
          "," +
          value +
          "," +
          pol_id +
          "," +
          id_name +
          ")",
        "info"
      );
      let dataToSend = {};
      dataToSend.layer = layer;
      dataToSend.pol_id = pol_id;
      dataToSend.id_name = id_name;
      dataToSend.event_id = event_id;
      dataToSend.key = key;
      dataToSend.value = value;
      dataToSend.token = _token;
      dataToSend.what = "UPDATE_EVENT";
      dataToSend.expected_api_version = _expected_api_version;
      axios
        .post(_baseHref + "/ajax.sewernet.php", dataToSend)
        .then(function (response) {
          if (response.data.status === "Accepted") {
            _self.emit(
              "log",
              "events.js",
              "updateEvent response",
              "success",
              response.data.message
            );
            cb(null, response.data.message);
          } else {
            cb(response.data.message, false);
          }
        })
        .catch((error) => {
          _self.emit("log", "events.js", "updateEvent", "error", error);
        });
    } catch (e) {
      _self.emit("log", "events.js", "updateEvent error", "error", e);
      cb(e, false);
    }
  }

  module.exports = EventsSewernet;
  EventsSewernet.prototype.getEventFormTypeAndEvent = getEventFormTypeAndEvent;
  EventsSewernet.prototype.insertEvent = insertEvent;
  EventsSewernet.prototype.getEvent = getEvent;
  EventsSewernet.prototype.updateEvent = updateEvent;
  EventsSewernet.prototype.deleteEvent = deleteEvent;
  EventsSewernet.prototype.setToken = setToken;
})();
