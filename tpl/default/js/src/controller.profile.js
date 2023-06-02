/*jshint esversion: 6 */
angular.module("app").expandControllerProfile = function (
  $scope,
  $rootScope,
  blockUI,
  data
) {
  var fileName = "controller.profile.js 1.0.0",
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

  log(fileName, "expandControllerProfile", "info", data);
  //formsSewernet.initFlowTrace();

  $rootScope.doFlowTrace = function (coordinates) {
    console.log("culo", selectedFlow);
    if (selectedFlow === "profile") {
      doProfile(coordinates);
    }
  };
  //****************************************************************
  //*****************           PROFILE         ********************
  //****************************************************************

  function doProfile(coordinates) {
    log(fileName, "doProfile()", "info", coordinates);
    const geojsonStyle = {
      stroke_color: "rgb(235, 167, 48, 1)",
      stroke_width: 4,
      circle_radius: 8,
      fill_color: "rgb(191, 156, 40, 0.33)",
    };
    /* mapFactory.addGeoJsonLayer("flowtrace");
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
        log(fileName, "doProfile callback", "error", err);
      })
      .finally(() => {});*/
  }

  //****************************************************************
  //*****************         END PROFILE      ********************
  //****************************************************************

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
