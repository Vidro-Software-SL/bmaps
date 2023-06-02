(function () {
  "use strict";
  /**
 * Factory for map mapAjaxOperations

 

 March 2017
*/

  angular.module("app").factory("mapAjaxOperations", [
    "$http",
    "$rootScope",
    function ($http, $rootScope) {
      var filename = "mapAjaxOperations.js",
        app_name = null,
        version = "1.0.2",
        baseUrl = null,
        token = null;

      // public API
      var dataFactory = {
        init: init,
        getLocalizedStrings: getLocalizedStrings,
        getFormDataForVisitForm: getFormDataForVisitForm,
        getProjectInfo: getProjectInfo,
        addGeometry: addGeometry,
        updateFeatureField: updateFeatureField,
        deleteElement: deleteElement,
        addVisit: addVisit,
        addVisitInfo: addVisitInfo,
        getVisit: getVisit,
        removeVisit: removeVisit,
        removeEvent: removeEvent,
        getVisitInfo: getVisitInfo,
      };

      return dataFactory;

      //****************************************************************
      //***********************       INIT       ***********************
      //****************************************************************

      function init(_token, _app_name) {
        token = _token;
        app_name = _app_name;
        var getUrl = window.location;
        baseUrl =
          getUrl.protocol +
          "//" +
          getUrl.host +
          "/" +
          getUrl.pathname.split("/")[1] +
          "/";
        if (getUrl.pathname.split("/")[1] === "dev") {
          baseUrl = baseUrl + "demo/";
        }
        log(
          "init(" +
            _token +
            "," +
            _app_name +
            ") baseUrl: " +
            baseUrl +
            " getUrl: " +
            getUrl,
          "info"
        );
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      //****************************************************************
      //*******************   LOCALIZED STRINGS   **********************
      //****************************************************************

      function getLocalizedStrings(callback) {
        log("getLocalizedStrings()", "info");
        //read strings
        var data2send = {};
        data2send.token = token;
        var localized_strings = {};
        $http
          .post(baseUrl + "ajax.strings.php", data2send, {})
          .success(function (data) {
            log("strings loaded", "success", data);
            if (data.status === "Accepted") {
              for (var i = 0; i < data.message.length; i++) {
                var key = Object.keys(data.message[i])[0];
                var value = Object.values(data.message[i])[0];
                localized_strings[key] = value;
              }
              callback(null, localized_strings);
            } else {
              callback(data.message, data);
            }
          })
          .error(function (error) {
            log("error requesting strings", "error", error);
            callback(error);
          });
      }
      //****************************************************************
      //*******************   LOCALIZED STRINGS   **********************
      //****************************************************************

      //****************************************************************
      //***********************      FORM DATA    **********************
      //****************************************************************

      function getFormDataForVisitForm(ajax_target, _token, okCb, koCb) {
        log("getFormDataForVisitForm(" + ajax_target + ")", "info");
        token = _token;
        var data2send = {};
        data2send.what = "GET_FORM_DATA";
        data2send.token = token;
        $http.post(ajax_target, data2send).success(function (data) {
          log("getFormData result:", "success", data);
          try {
            if (data.status === "Accepted") {
              okCb(data["message"]);
            } else {
              koCb(data, data["message"]);
            }
          } catch (e) {
            koCb(data, e);
          }
        });
      }

      //****************************************************************
      //***********************   END FORM DATA    *********************
      //****************************************************************

      //****************************************************************
      //***********************   GET PROJECT INFO *********************
      //****************************************************************

      function getProjectInfo(ajax_target, token, project_id, okCb, koCb) {
        var data2send = {};
        data2send.what = "GET_PROJECT_INFO";
        data2send.project_id = project_id;
        data2send.token = token;
        $http
          .post(ajax_target, data2send)
          .success(function (data) {
            log("getProjectInfo() result:", "success", data);
            if (data.status === "Accepted") {
              var use_layer_auth = Boolean(data.message.use_layer_auth);
              if (use_layer_auth) {
                log("request GET_USER_PERMISSIONS", "info");
                var data2send = {};
                data2send.what = "GET_USER_PERMISSIONS";
                data2send.project_id = project_id;
                data2send.token = token;
                $http
                  .post(ajax_target, data2send)
                  .success(function (dataPermissions) {
                    log(
                      "GET_USER_PERMISSIONS result",
                      "success",
                      dataPermissions
                    );
                    if (dataPermissions.status === "Accepted") {
                      data.message.dataPermissions = dataPermissions;
                      okCb(
                        data.message,
                        data.message.use_realtime,
                        dataPermissions.message
                      );
                    } else {
                      koCb(
                        data.message,
                        "Error requesting GET_USER_PERMISSIONS"
                      );
                    }
                  })
                  .error(function (error) {
                    log("error requesting GET_USER_PERMISSIONS", "error");
                    koCb(data.message, "Error requesting GET_USER_PERMISSIONS");
                  });
              } else {
                okCb(data.message, data.message.use_realtime, null);
              }
            } else {
              koCb(data.message, "error requesting getProjectInfo");
            }
          })
          .error(function (error) {
            koCb(error, "error requesting getProjectInfo");
          });
      }

      //****************************************************************
      //********************   END GET PROJECT INFO   ******************
      //****************************************************************

      //****************************************************************
      //********************       ADD GEOMETRY       ******************
      //****************************************************************

      function addGeometry(
        ajax_target,
        epsg,
        tableIdName,
        layer,
        geom,
        photo,
        editableAttributes,
        okCb,
        koCb
      ) {
        log(
          "addGeometry(" +
            ajax_target +
            "," +
            epsg +
            "," +
            tableIdName +
            "," +
            layer +
            "," +
            geom +
            "," +
            photo +
            ")",
          "info",
          editableAttributes
        );
        var data2send = new FormData();
        data2send.append("epsg", epsg);
        data2send.append("tableIdName", tableIdName);
        data2send.append("token", token);
        data2send.append("layer", layer);
        data2send.append("what", "ADD_GEOMETRY");
        data2send.append("geom", geom);
        if (photo) {
          data2send.append("file", photo);
        }
        //dynamic attributes
        for (var k in editableAttributes) {
          if (editableAttributes.hasOwnProperty(k)) {
            data2send.append(k, editableAttributes[k]);
          }
        }
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("addGeometry() result:", "success", data);
            if (data.status === "Accepted") {
              okCb();
            } else {
              koCb("Error requesting addGeometry");
            }
          })
          .error(function (error) {
            log("error requesting addGeometry", "error");
            koCb("Error requesting addGeometry");
          });
      }

      //****************************************************************
      //********************     END ADD GEOMETRY      *****************
      //****************************************************************

      //****************************************************************
      //********************      UPDATE ELEMENT      ******************
      //****************************************************************

      function updateFeatureField(
        ajax_target,
        id,
        tableIdName,
        epsg,
        postgresDbField,
        value,
        layer,
        okCb,
        koCb
      ) {
        log(
          "updateFeatureField(" +
            ajax_target +
            "," +
            epsg +
            "," +
            tableIdName +
            "," +
            layer +
            "," +
            id +
            "," +
            postgresDbField +
            "," +
            value +
            ")"
        );
        var data2send = new FormData();
        data2send.append("id", id);
        data2send.append("layer", layer);
        data2send.append("epsg", epsg);
        data2send.append("what", "UPDATE_FEATURE");
        data2send.append("token", token);
        data2send.append("tableIdName", tableIdName);

        if (postgresDbField != undefined) {
          data2send.append(postgresDbField.name, value);
        } else {
          data2send.append(fieldName, value);
        }

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("updateFeature() result:", "success", data);
            if (data.status === "Accepted") {
              okCb();
            } else {
              koCb("Error requesting updateFeature", data);
            }
          })
          .error(function (error) {
            log("error requesting updateFeature", "error");
            koCb("Error requesting updateFeature", error);
          });
      }

      //****************************************************************
      //********************   END UPDATE ELEMENT      *****************
      //****************************************************************

      //****************************************************************
      //********************       DELETE ELEMENT      *****************
      //****************************************************************

      function deleteElement(
        ajax_target,
        id,
        layer,
        tableIdName,
        geom,
        okCb,
        koCb
      ) {
        log(
          "deleteElement(" +
            ajax_target +
            "," +
            id +
            "," +
            tableIdName +
            "," +
            layer +
            ")"
        );
        var data2send = new FormData();
        data2send.append("id", id);
        data2send.append("layer", layer);
        data2send.append("what", "REMOVE_FEATURE");
        data2send.append("token", token);
        data2send.append("tableIdName", tableIdName);
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("deleteFeature() result:", "success", data);
            if (data.status === "Accepted") {
              okCb(geom);
            } else {
              koCb("Error requesting deleteFeature", null);
            }
          })
          .error(function (error) {
            log("error requesting deleteFeature", "error");
            koCb("Error requesting deleteFeature", error);
          });
      }

      //****************************************************************
      //********************     END DELETE ELEMENT      ***************
      //****************************************************************

      //****************************************************************
      //********************          GET VISIT        *****************
      //****************************************************************

      function getVisit(ajax_target, element_id, layer, extraData, okCb, koCb) {
        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "GET_VISIT");
        data2send.append("element_id", element_id);
        data2send.append("layer_id", layer);

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (result) {
            log("getVisit() result:", "success", result);
            if (result.status === "Accepted") {
              okCb(result.message, extraData);
            } else {
              koCb("Error requesting getVisit", result);
            }
          })
          .error(function (error) {
            log("error requesting getVisit", "error", error);
            koCb("Error requesting getVisit", error);
          });
      }

      //****************************************************************
      //********************        END GET VISIT        ***************
      //****************************************************************

      //****************************************************************
      //********************          ADD VISIT        *****************
      //****************************************************************

      function addVisit(
        ajax_target,
        epsg,
        pol_id,
        coordinates,
        layer,
        callback
      ) {
        log(
          "addVisit(" +
            ajax_target +
            "," +
            epsg +
            "," +
            pol_id +
            "," +
            coordinates +
            "," +
            layer +
            ")",
          "info"
        );
        var data2send = new FormData();
        data2send.append("epsg", epsg);
        data2send.append("token", token);
        data2send.append("what", "ADD_VISIT");
        data2send.append("element_id", pol_id);
        data2send.append("coordinates", coordinates);
        data2send.append("layer_id", layer);

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("addVisit() result:", "success", data);
            if (data.status === "Accepted") {
              callback(null, data.message);
            } else {
              callback("Error requesting addVisit", data);
            }
          })
          .error(function (error) {
            log("error requesting addVisit", "error", error);
            callback("Error requesting addVisit", error);
          });
      }

      //****************************************************************
      //********************        END ADD VISIT       ****************
      //****************************************************************

      //****************************************************************
      //******************         REMOVE VISIT        *****************
      //****************************************************************

      function removeVisit(ajax_target, visit_id, okCb, koCb) {
        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "REMOVE_VISIT");
        data2send.append("visit_id", visit_id);
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("removeVisit() result:", "success", data);
            if (data.status === "Accepted") {
              okCb();
            } else {
              koCb("Error requesting removeVisit", data);
            }
          })
          .error(function (error) {
            log("error requesting removeVisit", "error", error);
            koCb("Error requesting removeVisit", error);
          });
      }

      //****************************************************************
      //******************     END REMOVE VISIT        *****************
      //****************************************************************

      //****************************************************************
      //********************       GET VISIT INFO       ****************
      //****************************************************************

      function getVisitInfo(ajax_target, visit_id, okCb, koCb) {
        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "GET_VISIT_INFO");
        data2send.append("visit_id", visit_id);

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("getVisitInfo() result:", "success", data);
            if (data.status === "Accepted") {
              okCb(data);
            } else {
              koCb("Error requesting getVisitInfo", data);
            }
          })
          .error(function (error) {
            koCb("Error requesting getVisitInfo", error);
          });
      }

      //****************************************************************
      //********************       ADD VISIT INFO       ****************
      //****************************************************************

      function addVisitInfo(
        ajax_target,
        visit_id,
        heading,
        formData,
        images,
        compasses,
        photo,
        okCb,
        koCb
      ) {
        log(
          "addVisitInfo(" +
            ajax_target +
            "," +
            visit_id +
            "," +
            heading +
            "," +
            formData +
            ")",
          "info"
        );
        log("addVisitInfo images:", "info", images);
        log("addVisitInfo compasses:", "info", compasses);
        log("addVisitInfo photo:", "info", photo);
        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "ADD_VISIT_INFO");
        data2send.append("visit_id", visit_id);
        data2send.append("compass", heading);
        for (var prop in formData) {
          data2send.append(prop, formData[prop]);
        }
        data2send.append("photos", images);
        data2send.append("compasses", compasses);
        if (photo) {
          data2send.append("file", photo);
        }

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("addVisitInfo() result:", "success", data);
            if (data.status === "Accepted") {
              okCb();
            } else {
              koCb("Error requesting addVisitInfo", data);
            }
          })
          .error(function (error) {
            log("error requesting addVisitInfo", "error", error);
            koCb("Error requesting addVisitInfo", error);
          });
      }
      //****************************************************************
      //********************       END VISIT INFO       ****************
      //****************************************************************

      //****************************************************************
      //******************         REMOVE EVENT        *****************
      //****************************************************************

      function removeEvent(ajax_target, visit_id, event_id, callback) {
        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "REMOVE_EVENT");
        data2send.append("visit_id", visit_id);
        data2send.append("event_id", event_id);
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("removeVisit() result:", "success", data);
            if (data.status === "Accepted") {
              callback(null);
            } else {
              callback("Error requesting removeEvent", data);
            }
          })
          .error(function (error) {
            log("error requesting removeEvent", "error", error);
            callback("Error requesting removeEvent", error);
          });
      }

      //****************************************************************
      //******************      END REMOVE EVENT        ****************
      //****************************************************************

      //****************************************************************
      //***********************      HELPERS      **********************
      //****************************************************************

      //log function
      function log(evt, level, data) {
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename + " v." + version,
          level: level,
        });
      }

      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************
    },
  ]);
})();
