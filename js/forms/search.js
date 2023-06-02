/*jshint esversion: 6 */
(function () {
  "use strict";
  const util = require("util");
  const _events = require("events").EventEmitter;
  const axios = require("axios");
  let _self;
  let _token;
  let _baseHref;
  let _device;
  let _expected_api_version;
  let _activeTab = null;
  let _tabs = null;
  let _availableTabs = Array(
    "network",
    "search",
    "hydro",
    "workcat",
    "psector",
    "address",
    "visit"
  );

  util.inherits(Search, _events);

  function Search(options) {
    _token = options.token;
    _baseHref = options.baseHref;
    _device = options.device;
    _expected_api_version = options.expected_api_version;
    _self = this;
    setTimeout(function () {
      _self.emit("log", "Search.js", "Search module loaded", "success");
    }, 700);
  }
  function setToken(token) {
    _token = token;
  }
  //****************************************************************
  //*****************         GET SEARCH FORM        ***************
  //****************************************************************

  /***
		getSearchForm
			gets search  forms

			@scope public
			@param cb<function>

	***/

  function getSearchForm(info_type, cb) {
    _self.emit("log", "Search.js", "getSearchForm()", "info");
    var dataToSend = {};
    dataToSend.device = _device;
    dataToSend.info_type = info_type;
    dataToSend.token = _token;
    dataToSend.what = "GET_SEARCH";
    dataToSend.expected_api_version = _expected_api_version;
    let retorno = {};
    axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        try {
          if (response.data.status === "Accepted") {
            _self.emit(
              "log",
              "Search.js",
              "getSearchForm",
              "success",
              response.data.message
            );
            if (typeof response.data.message.formTabs != "undefined") {
              retorno = response.data.message.formTabs;
              for (let i = 0; i < retorno.length; i++) {
                if (
                  _availableTabs.indexOf(retorno[i].tabName.toLowerCase()) > -1
                ) {
                  for (let f = 0; f < retorno[i].fields.length; f++) {
                    if (retorno[i].fields[f]) {
                      if (retorno[i].fields[f].type === "combo") {
                        retorno[i].fields[f].comboValues = _assignValuesToCombo(
                          retorno[i].fields[f]
                        );
                        if (retorno[i].tabName.toLowerCase() === "address") {
                          retorno[i].fields[f].changeAction = "searchTown";
                        }
                      } else if (retorno[i].fields[f].type === "typeahead") {
                        if (
                          typeof retorno[i].fields[f].ChangeAction !=
                          "undefined"
                        ) {
                          retorno[i].fields[f].getDataAction =
                            retorno[i].fields[f].UpdateAction;
                          retorno[i].fields[f].selectAction = null;
                        } else {
                          let actions = _getTabActions(
                            retorno[i].tabName.toLowerCase(),
                            retorno[i].fields[f].name
                          );
                          retorno[i].fields[f].getDataAction =
                            actions.dataAction;
                          retorno[i].fields[f].selectAction =
                            actions.selectAction;
                        }

                        retorno[i].fields[f].tabName =
                          retorno[i].tabName.toLowerCase();
                        if (
                          typeof retorno[i].fields[f].searchService ==
                          "undefined"
                        ) {
                          retorno[i].fields[f].searchService = null;
                        }
                      }
                    }
                  }
                } else {
                  _self.emit(
                    "log",
                    "Search.js",
                    "getSearchForm tab " +
                      retorno[i].tabName +
                      " not implemented",
                    "error"
                  );
                }
              }
              //sets active tab
              let activeTabIndex = _getActiveTab(
                response.data.message.formTabs
              );
              retorno.activeTab =
                response.data.message.formTabs[activeTabIndex];
              retorno.activeTab.activeTabIndex = activeTabIndex;
              _tabs = retorno;
              cb(null, retorno);
            } else {
              cb("no fields", "no fields");
            }
          } else {
            cb(body, body.message);
          }
        } catch (e) {
          _self.emit("log", "Search.js", "getSearchForm", "error", e.message);
          cb("Error in getSearchForm: " + e.message, null);
        }
      })
      .catch((error) => {
        _self.emit("log", "Search.js", "getSearchForm", "error", error);
      });
  }

  //****************************************************************
  //*************           END GET SEARCH FORM      ***************
  //****************************************************************

  //****************************************************************
  //*****************           GET ADDRESS          ***************
  //****************************************************************

  /***
		getDataForAddress
			gets data for typeahead address with nominatim

			@scope public
			@param cb<function>

	***/

  function getDataForAddress(extent, val, searchService) {
    _self.emit(
      "log",
      "Search.js",
      "getDataForAddress(" + extent + "," + val + "," + searchService + ")",
      "info"
    );
    var options = {
      uri: _baseHref + "/ajax.address.php",
      qs: {
        criteria: val,
        country: "es",
        token: _token,
        extent: extent,
        service: searchService,
        json: 1,
      },
      json: true,
    };
    return axios
      .post(_baseHref + "/ajax.address.php", options)
      .then(function (response) {
        return response.data.map(function (item) {
          return item;
        });
      })
      .catch((error) => {
        return error;
      });
  }

  //****************************************************************
  //*************             END GET ADDRESS        ***************
  //****************************************************************

  //****************************************************************
  //*****************         UPDATE SEARCH          ***************
  //****************************************************************

  function updateSearch(fields, tabName, fieldName, val) {
    _self.emit(
      "log",
      "Search.js",
      "updateSearch(" + tabName + "," + fieldName + "," + val + ")",
      "info",
      fields
    );
    let _processedFields = _processDataToSend(tabName, fields);
    var dataToSend = {};
    dataToSend.device = _device;
    dataToSend.token = _token;
    dataToSend.what = "UPDATE_SEARCH";
    dataToSend.expected_api_version = _expected_api_version;
    dataToSend.searchData = JSON.stringify(_processedFields);
    dataToSend.json = 1;
    return axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        if (response.data.status === "Accepted") {
          return response.data.message.data.map(function (item) {
            return item;
          });
        } else {
          return response;
        }
      })
      .catch((error) => {
        return error;
      });
  }

  //****************************************************************
  //*****************        END UPDATE SEARCH       ***************
  //****************************************************************

  //****************************************************************
  //*****************       UPDATE SEARCH ADD        ***************
  //****************************************************************

  function updateSearchAdd(fields, tabName, fieldName, val) {
    _self.emit(
      "log",
      "Search.js",
      "updateSearchAdd(" + tabName + "," + fieldName + "," + val + ")",
      "info",
      fields
    );
    let _processedFields = _processDataToSend(tabName, fields);
    var dataToSend = {};
    dataToSend.device = _device;
    dataToSend.token = _token;
    dataToSend.what = "UPDATE_SEARCH_ADD";
    dataToSend.expected_api_version = _expected_api_version;
    dataToSend.searchData = JSON.stringify(_processedFields);
    dataToSend.json = 1;
    return axios
      .post(_baseHref + "/ajax.sewernet.php", dataToSend)
      .then(function (response) {
        if (response.data.status === "Accepted") {
          return response.data.message.data.map(function (item) {
            return item;
          });
        } else {
          return response;
        }
      })
      .catch((error) => {
        return error;
      });
  }

  //****************************************************************
  //****************      END UPDATE SEARCH ADD      ***************
  //****************************************************************

  //****************************************************************
  //****************       DATASET TYPEAHEAD         ***************
  //****************************************************************

  function searchDataSet(val, dataSet, feature) {
    _self.emit("log", "Search.js", "searchDataSet()", "info", {
      val: val,
      dataSet: dataSet,
      feature: feature,
    });
    return new Promise((resolve, reject) => {
      let retorn = [];
      let substrRegex;
      dataSet.map(function (item) {
        substrRegex = new RegExp(val, "i");
        if (substrRegex.test(item)) {
          retorn.push({ id: item, display_name: item });
        }
      });

      resolve(retorn);
    });
  }

  //****************************************************************
  //****************       END DATASET TYPEAHEAD      **************
  //****************************************************************

  //****************************************************************
  //*************           SETTERS/GETTERS          ***************
  //****************************************************************

  /***
		_assignValuesToCombo
			formats data for form combo component

			@scope private
			@param object<object>

			@return <json>

	***/

  function _assignValuesToCombo(object) {
    let comboValues = Array();
    try {
      for (let i = 0; i < object.comboIds.length; i++) {
        comboValues.push({
          id: object.comboIds[i],
          name: object.comboNames[i],
        });
      }
      return comboValues;
    } catch (e) {
      _self.emit(
        "log",
        "Search.js",
        "_assignValuesToCombo error formatting combo",
        "error",
        e.message
      );
      return false;
    }
  }

  /***
		_getTabActions
			assigns actions to typeahead components

			@scope private
			@param tabName <string>
			@param fieldName <string>

			@return <json>

	***/

  function _getTabActions(tabName, fieldName) {
    if (tabName.toLowerCase() === "search") {
      return {
        dataAction: "getDataForAddress",
        selectAction: "selectAddress",
      };
    } else if (tabName.toLowerCase() === "address") {
      if (fieldName === "add_street") {
        return {
          dataAction: "updateSearch",
          selectAction: "selectStreet",
        };
      } else if (fieldName === "add_postnumber") {
        return {
          dataAction: "updateSearchAdd",
          selectAction: "selectAddress",
        };
      } else {
        return {
          dataAction: "updateSearch",
          selectAction: "selectAddress",
        };
      }
    } else {
      return {
        dataAction: "updateSearch",
        selectAction: "executeSearch",
      };
    }
  }

  /***
		_processDataToSend
			gets the fields&values from a tab

			@scope private
			@param tabName<string>
			@param fields<json>

			@return <json>
	***/

  function _processDataToSend(tabName, fields) {
    let retorno = [];
    for (let i = 0; i < _tabs.length; i++) {
      if (_tabs[i].tabName === tabName) {
        let item = {};
        item["tabName"] = _tabs[i].tabName.toLowerCase();
        for (let key in fields) {
          for (let f = 0; f < _tabs[i].fields.length; f++) {
            if (_tabs[i].fields[f].name === key) {
              if (_tabs[i].fields[f].type === "combo") {
                //find comboName
                let name =
                  _tabs[i].fields[f].comboNames[
                    _tabs[i].fields[f].comboIds.indexOf(fields[key])
                  ];
                item[key] = { id: fields[key], name: name };
              } else if (_tabs[i].fields[f].type === "typeahead") {
                item[key] = { text: fields[key] };
              }
            }
          }
        }
        retorno.push(item);
      }
    }
    return retorno;
  }

  function _getActiveTab(tabs) {
    if (tabs.length > 0) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].active) {
          return i;
          break;
        }
      }
    }
  }

  //****************************************************************
  //*************          END SETTERS/GETTERS       ***************
  //****************************************************************

  module.exports = Search;
  Search.prototype.getSearchForm = getSearchForm;
  Search.prototype.getDataForAddress = getDataForAddress;
  Search.prototype.updateSearch = updateSearch;
  Search.prototype.updateSearchAdd = updateSearchAdd;
  Search.prototype.searchDataSet = searchDataSet;
  Search.prototype.setToken = setToken;
})();
