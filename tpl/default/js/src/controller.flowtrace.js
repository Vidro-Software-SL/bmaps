/*jshint esversion: 6 */
angular.module("app").expandControllerFlowtrace = function (
  $scope,
  $rootScope,
  blockUI,
  data
) {
  var fileName = "controller.flowtrace.js 1.0.0",
    log = data.sharedMethods.log,
    baseHref = data.baseHref,
    notifications_strings = data.strings,
    formsSewernet = data.sharedModules.formsSewernet,
    mapFactory = data.sharedModules.mapFactory,
    applyChangesToScope = data.sharedMethods.applyChangesToScope,
    notifyEvent = data.sharedMethods.notifyEvent,
    displayMapError = data.sharedMethods.displayMapError,
    _selectActiveTab = data.sharedMethods._selectActiveTab,
    hidePreviousForms = data.sharedMethods.hidePreviousForms,
    selectedFlow = null;
  mc = data.mc;

  log(fileName, "expandControllerFlowtrace", "info", data);
  formsSewernet.initFlowTrace();

  $rootScope.doFlowTrace = function (coordinates) {
    console.log("culo", selectedFlow);
    if (selectedFlow === "downstream") {
      downStream(coordinates);
    } else if (selectedFlow === "upstream") {
      upStream(coordinates);
    }
  };
  //****************************************************************
  //*****************          UPSTREAM         ********************
  //****************************************************************

  function upStream(coordinates) {
    log(fileName, "upStream()", "info", coordinates);
    const geojsonStyle = {
      stroke_color: "rgb(235, 167, 48, 1)",
      stroke_width: 4,
      circle_radius: 8,
      fill_color: "rgb(191, 156, 40, 0.33)",
    };
    mapFactory.addGeoJsonLayer("flowtrace");
    formsSewernet
      .doUpstream(coordinates[0], coordinates[1], mapFactory.getResolution())
      .then((response) => {
        log(fileName, "doUpstream callback", "success", response);
        let result = [];
        result = result.concat(
          response.message.line.features,
          response.message.polygon.features,
          response.message.point.features
        );
        if (result.length > 0) {
          mapFactory.addGeoJson(
            {
              type: "FeatureCollection",
              features: result,
            },
            geojsonStyle,
            "flowtrace"
          );
          $rootScope.flowTraceEnabled = false;
          $rootScope.$broadcast("flowTraceDisabled", {});
          selectedFlow = null;
        }
      })
      .catch((err) => {
        log(fileName, "doUpstream callback", "error", err);
      })
      .finally(() => {});
  }

  //****************************************************************
  //*****************         END UPSTREAM      ********************
  //****************************************************************

  //****************************************************************
  //*****************        DOWNSTREAM         ********************
  //****************************************************************

  function downStream(coordinates) {
    log(fileName, "downStream()", "info", coordinates);
    const geojsonStyle = {
      stroke_color: "rgb(235, 74, 117, 1)",
      stroke_width: 4,
      circle_radius: 8,
      fill_color: "rgb(191, 156, 40, 0.33)",
    };
    mapFactory.addGeoJsonLayer("flowtrace");
    formsSewernet
      .doDownStream(coordinates[0], coordinates[1], mapFactory.getResolution())
      .then((response) => {
        log(fileName, "doDownStream callback", "success", response);
        let result = [];
        result = result.concat(
          response.message.line.features,
          response.message.polygon.features,
          response.message.point.features
        );
        if (result.length > 0) {
          mapFactory.addGeoJson(
            {
              type: "FeatureCollection",
              features: result,
            },
            geojsonStyle,
            "flowtrace"
          );
          $rootScope.flowTraceEnabled = false;
          $rootScope.$broadcast("flowTraceDisabled", {});
          selectedFlow = null;
        }
      })
      .catch((err) => {
        log(fileName, "doUpstream callback", "error", err);
        console.error(err);
      })
      .finally(() => {});
  }

  $rootScope.$on("flowTraceEnabled", function (event, data) {
    log(fileName, "flowtrace activated", "info", { event, data });
    selectedFlow = data.tool;
    notifyEvent(notifications_strings.CLICK_ON_LOCATION, "info", true);
    mapFactory.removeGeoJsonLayer("flowtrace");
  });

  //****************************************************************
  //*****************       END DOWNSTREAM      ********************
  //****************************************************************

  //****************************************************************
  //*****************       END FLOWTRACE      *********************
  //****************************************************************
};
