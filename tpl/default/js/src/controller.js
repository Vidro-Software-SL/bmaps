(function () {
  "use strict";
  /***
  SEWERNET Main Controller



  Augoust 2017

***/
  angular.module("app").requires.push("blockUI");
  angular.module("app").config(function (blockUIConfig) {
    // Disable automatically blocking of the user interface
    blockUIConfig.autoBlock = false;
    // Change the default overlay message
    blockUIConfig.message = "Loading";
    // Change the default delay to 100ms before the blocking is visible
    blockUIConfig.delay = 100;
  });
  var module = angular.module("app").controller("mainController", Controller);

  Controller.$inject = [
    "mapFactory",
    "loggerService",
    "fileReader",
    "$rootScope",
    "$scope",
    "$http",
    "mapToc",
    "cfpLoadingBar",
    "blockUI",
  ];

  function Controller(
    mapFactory,
    loggerService,
    fileReader,
    $rootScope,
    $scope,
    $http,
    mapToc,
    cfpLoadingBar,
    blockUI
  ) {
    var mc = this;
    mc.project_name = null;
    mc.epsg = "Searching...";
    mc.extent = "Searching...";
    mc.layers = null; //array containg layers
    mc.projectInfo = false; //show hide project info container
    mc.showLayers = false; //show hide layers container
    mc.addedGeometry = null; //container for added geometry data
    mc.mapError = false; //map error container
    mc.pointPhotos = Array(); //array containg photos from a given point
    mc.PhotosLowResolution = 1; //flag for user low resolution photos
    mc.point_coordinates = null; //var containing point clicked coordinates
    mc.ChangeBackground = false; //show hide change background select
    mc.backgroundmap = null; //background map
    mc.geolocate = 0; //flag for use geolocation or not
    mc.max_features = 30; //limit of features for queries
    mc.visit_id = null; //visit id
    mc.visitInfo = null; //visit info content
    mc.visitStatus = null; //visit status (insert or update)
    mc.heading = null; //compass heading
    mc.pol_id = null; //selected element ID
    mc.pol_id_name = null; //selected element name of geometry (arc_id, node_id...)
    mc.btAddVisit = false; //button "add visit" visibility
    mc.linkPath = null; //linkPath for forms
    mc.clickedButton = null; //container for identify wich button was clicked
    mc.offlineActivated = false; //offline functionality activated/deactivated
    mc.offlineareatodownload = 0; //area in meter for background download
    mc.offlineVisitedSpots = 0; //show/hide layer for
    mc.formName = null; //form name label
    mc.show_use_tiled_background = false; //show/hide checkbox use tiled background
    mc.use_tiled_background = false;
    mc.use_second_background = false;
    mc.selected_tiled = null; //selected tiled
    mc.available_bg_layers = []; //initial values for background select
    mc.offline_reminder = false; //flag for show or not offline upload reminder
    mc.selectedGeomString = null; //string with selected geometry string
    //initial status for tools
    $rootScope.addPointDisabled = true;
    $rootScope.addLineDisabled = true;
    $rootScope.addPolygonDisabled = true;
    $rootScope.filtersDisabled = true;
    $rootScope.newMincutDisabled = true;
    $rootScope.multipleSelectDisabled = true; //initially multipleSelect disabled
    $rootScope.polygonSelectDisabled = true; //initially polygonSelect disabled
    $rootScope.tableDisabled = true; //initially table disabled
    $rootScope.visitDisabled = true;
    $rootScope.visitManagerDisabled = false;
    $rootScope.incidenceDisabled = false;
    $rootScope.toolsDisabled = true; //flag for tools disabled if no layer displayed
    $rootScope.multiUpdateDisabled = true; //multiupdate disabled
    $rootScope.flowTraceEnabled = false; //user clicked on flowtraces buttons
    $rootScope.flowTraceTool = null; //upstream of downstream
    mc.AddingVisit = false;
    mc.visit_filters = [];
    $rootScope.skin = "default"; //skin for directives
    //expose macFactory to directives
    if (mapFactory) {
      mc.mapFactory = mapFactory;
    }
    mc.layerAttributes = Array(); //attributes that can be edited on a layer
    mc.editableAttributes = {}; //container for attributtes
    mc.tableIdName = null; //name of id field in db table
    mc.available_tiled_layers = Array();
    var app_name = "bmaps",
      file_name = "controller.js",
      version = "1.0.7",
      ajax_target = "ajax.projects.php",
      use_layer_auth = false,
      use_toc_cookie = false, //flag for use or not cookie for restore last TOC
      user_permissions = Array(),
      userName = null,
      expected_api_version = null,
      baseHref,
      env,
      project_id,
      token,
      wsToken = null, //token for websocket authetication
      urlWMS,
      urlWMTS,
      offlineLogin = 0,
      off_download_data = false,
      off_download_data_ttl = 24,
      email = null,
      tiled_layer_name = null, //tiled background layer
      tiled_matrixSet = null, //tiled background matrixSet
      urlSocket,
      photoMode, //"upload" or "attach" photo for uploading on form submit
      touchDevice = 0, //0 no touch device, 1 touch device (mobiler or tablet)
      geom_colors = {}, //object with color customization for select/edit geometries
      legendTextColor = "#FFFFFF", //default legend textColor
      legendTextSize = "6", //default legend textSize
      currentLegendLayer = null, //current legend layer name
      notifications_strings = {}, //object for notifications strings
      geom_colors = {}, //colors for select/edit geometries
      currentFormContainer = null, //global var for know wich form is displayed
      layerProperties = null, //global var for layer properties (visitable, editable, geometry,dbName)
      _dpDayNames = ["D", "L", "M", "X", "J", "V", "S"], //dayNames for datepickers
      alterNativeInfo = null, //alternative Action for info
      formIdForAlternativeInfo = null, //store formId for alternative info
      NOzoomToHiglight = false, //flag for override zoom to highlight on renderInfo
      featureInfoReceivedData = null, //global var for storing featureInfoReceived data for forms reloading
      offline_background = null, //global var for storing offline background id, defined in backoffice
      printing = false, //global var for controlling if print form is opened
      geolocated = false, //user is geolocated,flag for controlling events
      realtTimeRequester = null, //store info from remote requests - used for notifications
      _login = null, //login module
      appOnline = true,
      rt = null, //real time library
      Bgs = null, //backgrounds library
      vidroapi = null,
      vidrotoken = null,
      selected_tiled = null,
      defaultInfo = "giswater"; //default info (component_info on db)
    //buttons visibility
    mc.btFilter = 0; //filters button
    mc.btSearch = 0; //search button
    mc.btFit = 0; //fit button
    mc.btZoomIn = 0; //ZoomIn button
    mc.btZoomOut = 0; //ZoomOut button
    mc.btGeolocalize = 0; //geolocalize button
    mc.btAddLine = 0; //AddLine button
    mc.btAddPoint = 0; //AddPoint button
    mc.btAddPolygon = 0; //AddPolygon button
    mc.btMincut = 0; //Mincut button
    mc.btFlowTrace = 0; //flowTrace button
    mc.btmultipleSelect = 0; //Multiple selection button
    mc.btpolygonSelect = 0;
    mc.btPrint = 0; //print button
    mc.btDateSelector = 0; //date selector button
    mc.btTable = 0; //attributes table button
    mc.btMeasureLine = 0; //measure line button
    mc.btMeasureArea = 0; //measure area button
    mc.btVisits = 0; //visits button
    mc.btVisitManager = 0; //visit manager button
    mc.btIncidence = 0; //Incidence button
    mc.btGo2epa = 0; //epa2go button
    mc.btAccessControl = 0; //Access Control button
    mc.btProfile = 0; //profile button
    mc.btMultiupdate = 0; //mutliple update button
    $rootScope.visit_version = 2; //visit version to be used
    mc.debug = 0; //hide debug menu
    mc.infoTableName = null; //table name received from info
    //end buttons visibility
    mc.btEndGeometry = false; //display buttons "Done" and "Cancel" when adding point or editing geometry
    //forms
    mc.formType = null; //sets form type based on activelayer
    var formsSewernet = null; //library for controlling foms
    var displayedTabs = []; //array containing current displayed tabs
    var project_type = null; //ud or ws project type
    var info_type = 0; //info type
    mc.formAddfeature = 0; //container for form add feature
    $rootScope.feature = {}; //container for form feauture fields
    mc.global_sys_id = null; //sys_id from lists component
    //// Form filters
    mc.formFilters = false; //container for form filters
    //attributes table
    mc.attributesTable = 0;
    //notifications
    mc.notifications = 0;
    //Mincut
    mc.mincut_id = null; //mincut id for exclude valves
    mc.formMincut = false; //container for form mincut
    mc.excludingMincut = false; //flag for visual mark on exclude button
    mc.btEndBlockAction = 0;
    mc.AddingIncidence = false; //flag for control if user is adding a visit incidence
    mc.visitType = null; //visit type 'visit' or 'incidence'
    mc.visited_spots_layer = true; //use visited spots layer OJO, change to false
    mc.realTimeusers = []; //real time users list
    mc.usersUbication = false;
    mc.autologout = false; //flag for autologout user
    mc.btAcceptTabFiles = false; //footer button accept info tabFiles - TBR when info is redone
    mc.offline_layers = 0; //number of available offline layers
    mc.use_area_of_interest = false; //confine user inside area
    //****************************************************************
    //***********************     INIT APP     ***********************
    //****************************************************************

    $rootScope.initApp = function (
      _baseHref,
      _urlWMS,
      _urlWMTS,
      _env,
      _project_id,
      _urlSocket,
      _touchDevice,
      _wsToken,
      _skin,
      _project_type,
      _info_type,
      _userName,
      _offlineLogin,
      _email,
      debug,
      _vidroapi,
      _vidrotoken,
      _expected_api_version
    ) {
      baseHref = _baseHref;
      env = _env;
      project_id = _project_id;
      urlWMS = _urlWMS;
      urlWMTS = _urlWMTS;
      urlSocket = _urlSocket;
      project_type = _project_type;
      info_type = _info_type;
      expected_api_version = _expected_api_version;
      touchDevice = parseInt(_touchDevice);
      userName = _userName;
      wsToken = _wsToken;
      offlineLogin = _offlineLogin;
      vidroapi = _vidroapi;
      vidrotoken = _vidrotoken;
      email = _email;
      $rootScope.skin = _skin;
      mc.controllerVersion = version;
      if (parseInt(debug) === 1) mc.debug = 1;
      loggerService.init(env);
      log(
        "initApp(" +
          _baseHref +
          "," +
          _urlWMS +
          "," +
          _env +
          "," +
          _project_id +
          "," +
          _urlSocket +
          "," +
          _touchDevice +
          "," +
          _wsToken +
          "," +
          _skin +
          "," +
          _project_type +
          "," +
          _info_type +
          "," +
          _userName +
          ")",
        "info"
      );
      if (navigator.onLine) {
        log("app Online", "info");
        appOnline = true;
      } else {
        log("app Offline", "info");
        appOnline = false;
      }
      _login = new Login({
        baseHref: baseHref,
        env: env,
        offlineLogin: offlineLogin,
      });
      //custom forms
      formsSewernet = new FormsSewernet({
        baseHref: baseHref,
        token: token,
        project_type: project_type,
        info_type: info_type,
        env: env,
        expected_api_version: expected_api_version,
        strings: notifications_strings,
        project_id: project_id,
        visited_spots_layer: mc.visited_spots_layer,
        use_tiled_background: mc.use_tiled_background,
        vidrotoken,
        vidroapi,
      });
      mc.formVersion = formsSewernet.getVersion();
      formsSewernet.on("log", function (mod, data, level, extraData) {
        logExternal(mod, data, level, extraData);
      });

      formsSewernet.on("notifyToMap", function (data, extraData) {
        if (data === "Filters ready") {
          //show/hide button
          mc.btFilters = false;
          if (typeof extraData == "object") {
            if (Object.keys(extraData).length > 0) {
              mc.btFilters = true;
              $rootScope.filtersDisabled = false;
              mapFactory.setFilters(extraData);
            }
          }
        } else if (data === "DateFilters ready") {
          /*  var splitDate = extraData.date_to.split(" ");
          var splitDateDate = splitDate[0].split("-");
          var Date_to = new Date(splitDateDate[1]+"-"+splitDateDate[2]+"-"+splitDateDate[0]+" "+splitDate[1]);
          var splitDateFrom = extraData.date_from.split(" ");
          var splitDateFromDate = splitDateFrom[0].split("-");
          var DateFrom = new Date(splitDateFromDate[1]+"-"+splitDateFromDate[2]+"-"+splitDateFromDate[0]+" "+splitDateFrom[1]);
*/
          var DateFrom = new Date(extraData.date_from);
          var Date_to = new Date(extraData.date_to);
          mapFactory.setInitEndDates(DateFrom, Date_to);
          $rootScope.feature.date_from = DateFrom;
          $rootScope.feature.date_to = Date_to;
          setFilterDate();
        }
        applyChangesToScope();
      });

      formsSewernet.on("offlineEvent", (evt, data) => {
        log("offlineEvent()" + evt, "info", data);
        if (evt === "dumpData") {
          if (data.text === "no visits to dump") {
            blockUI.message(notifications_strings.OFFLINE_DUMP_DONE);
            setTimeout(function () {
              blockUI.reset();
              applyChangesToScope();
            }, 2000);
          } else if (data.text === "InsertNextVisit") {
            notifyEvent(
              notifications_strings.OFFLINE_UPLOADING_VISIT,
              "success",
              true
            );
            applyChangesToScope();
          } else if (data.text === "visitFormDownloadDone") {
            blockUI.message(
              notifications_strings.OFFLINE_DOWNLOADED_VISIT_FORMS
            );
            setTimeout(() => {
              blockUI.reset();
              applyChangesToScope();
            }, 2000);
          } else if (data.text === "UploadVisitsDone") {
            blockUI.message(notifications_strings.OFFLINE_DUMP_DONE);
            setTimeout(function () {
              blockUI.reset();
              applyChangesToScope();
            }, 2000);
          } else if (data.text === "UploadVisitsError") {
            blockUI.message(notifications_strings.OFFLINE_DUMP_ERROR);
            setTimeout(function () {
              blockUI.reset();
              applyChangesToScope();
            }, 2000);
          } else if (data.text === "visitFormDownloadError") {
            blockUI.message("error downloading forms");
            //blockUI.message(notifications_strings.OFFLINE_DUMP_DONE);
            setTimeout(function () {
              blockUI.reset();
              applyChangesToScope();
            }, 2000);
          } else if (data.text === "noDownloadbaleForms") {
            blockUI.message("No available offline forms");
            //blockUI.message(notifications_strings.OFFLINE_DUMP_DONE);
            setTimeout(function () {
              blockUI.reset();
              applyChangesToScope();
            }, 2000);
          }

          /*else if(data.text==="uploadingPhotos"){
              notifyEvent(notifications_strings.OFFLINE_UPLOADING_PHOTOS,"success",true);
            }else if(data.text==="preparingPhoto"){
              notifyEvent(notifications_strings.OFFLINE_PREPARING_PHOTO,"success",true);
            }*/
        } else if (evt === "removingData") {
          notifyEvent(
            notifications_strings.OFFLINE_REMOVING_STORED_VISITS,
            "success",
            true
          );
        }
        applyChangesToScope();
      });

      //get sesion token
      _login
        .getCurrentToken({ email: email })
        .then(function (response) {
          log("getCurrentToken", "success", response);
          token = response;
          formsSewernet.setToken(token);
          //backgrounds module
          Bgs = new bgsBmaps(
            {
              baseHref: baseHref,
              env: env,
              token: token,
              project_id: project_id,
              touchDevice: touchDevice,
            },
            ol
          );

          if (appOnline === true && mc.available_bg_layers.length === 0) {
            Bgs.loadProjectBgs()
              .then(function (response) {
                mc.available_bg_layers = response;
              })
              .catch(function (error) {
                log("loadProjectBgs", "warn", error);
              });
          }
          getProjectInfo();
        })
        .catch(function (error) {
          log("getCurrentToken", "warn", error);
        });
    };

    //****************************************************************
    //***********************   END INIT APP    **********************
    //****************************************************************

    function getProjectInfo() {
      //request project info a permissions
      if (appOnline) {
        if (mc.project_name === null) {
          log("getProjectInfo()", "info", token);
          mapFactory.ajaxGetProjectInfo(
            baseHref + ajax_target,
            token,
            project_id,
            projectInfoCbOk,
            projectInfoCbKo
          );
        }
      } else {
        var capAndPi = mapFactory.getOfflineGetCapAndPi(project_id);
        projectInfoCbOk(
          capAndPi.projectInfo,
          false,
          capAndPi.projectInfo.dataPermissions.message
        );
      }
    }

    //***********************   Callbacks for project info request        ********************

    function projectInfoCbOk(data, realtime, user_permisions) {
      log("projectInfoCbOk", "success", data);
      use_layer_auth = Boolean(data.use_layer_auth);
      use_toc_cookie = Boolean(data.tocusecookie);
      mc.project_name = data.project_name;
      mc.backgroundmap = data.background;
      mc.bgInfo = data.bgInfo;
      Bgs.setProjectBgsProperty("bg_main", data.background);
      Bgs.setProjectBgsProperty("bgInfo_main", data.bgInfo);
      //customize colors
      geom_colors.select_stroke_color = data.geom_select_stroke_color;
      geom_colors.select_fill_color = data.geom_select_fill_color;
      geom_colors.edit_stroke_color = data.geom_edit_stroke_color;
      geom_colors.edit_fill_color = data.geom_edit_fill_color;
      geom_colors.measure_fill_color = data.measure_fill_color;
      geom_colors.measure_stroke_color = data.measure_stroke_color;
      geom_colors.visited_spots_stroke_color = data.visited_spots_stroke_color;
      geom_colors.visited_spots_shape = data.visited_spots_shape;
      geom_colors.visited_spots_fill_color = data.visited_spots_fill_color;
      geom_colors.visited_spot_radius = data.visited_spot_radius;
      geom_colors.polygon_select_stroke_color =
        data.polygon_select_stroke_color;
      geom_colors.polygon_select_fill_color = data.polygon_select_fill_color;
      //mc.visited_spots_layer = Boolean(data.visited_spots_layer); OJO!!!!
      mc.visited_spots_layer = true;
      data.geom_colors = geom_colors;
      if (typeof data.legendtextcolor != "undefined") {
        legendTextColor = data.legendtextcolor;
      }
      if (typeof data.legendfontsize != "undefined") {
        legendTextSize = data.legendfontsize;
      }
      if (use_layer_auth) {
        user_permissions = data.dataPermissions.message;
      }
      if (typeof data.visit_version != "undefined") {
        $rootScope.visit_version = data.visit_version;
      }
      if (typeof data.visit_offline != "undefined") {
        mc.visit_offline = data.visit_offline;
      }
      if (typeof data.off_download_data != "undefined") {
        off_download_data = data.off_download_data;
      }
      if (typeof data.off_download_data_ttl != "undefined") {
        off_download_data_ttl = data.off_download_data_ttl;
      }
      if (typeof data.component_info != "undefined") {
        if (data.component_info === "wms") defaultInfo = data.component_info;
      }
      //show/hide buttons
      try {
        var buttons = JSON.parse(data.buttons);
        for (var key in buttons) {
          if (buttons[key]) {
            mc["bt" + key] = 1;
          }
        }
      } catch (e) {
        notifyEvent("Error setting buttons visibility", "error", true);
      }
      //end show/hide buttons
      mc.PhotosLowResolution = true;
      //second background
      if (data.use_double_background) {
        mc.second_background = data.second_background;
        mc.use_second_background = true;
        Bgs.setProjectBgsProperty("bg_secondary", data.second_background);
        Bgs.setProjectBgsProperty("bgInfo_secondary", data.bgInfo_secondary);
      }
      //show use tiled background checkbox
      if (data.use_tiled_background) {
        mc.show_use_tiled_background = true;
        selected_tiled = data.selected_tiled; //we need to assign value to var "selected_tiled", if not the select on the UI doesn't show the selected option
        tiled_layer_name = data.tiled.layer;
        tiled_matrixSet = data.tiled.matrixset;
        if (appOnline) {
          loadAvailaibleTiled();
        }
      }
      mc.use_tiled_background = data.use_tiled_background;

      if (appOnline) {
        formsSewernet.initFilters(mc.use_tiled_background);
      }
      mc.use_area_of_interest = data.use_area_of_interest;
      //offline
      mc.offlineActivated = Boolean(data.offline);

      mc.offlineareatodownload = parseInt(data.offlinearea);
      offline_background = data.offline_background;
      //maintain alive session based on backoffice flag
      if (data.autologout) {
        mc.autologout = true;
      }
      //use notifications
      if (data.notifications) {
        mc.notifications = parseInt(data.notifications);
      }
      data.vidroapi = vidroapi;
      data.vidrotoken = vidrotoken;
      setInterval(heartBeat, 121000);
      initModules(data, realtime);
      //if offline is activated, store capabilities and user permissions
      if (mc.offlineActivated) {
        mapFactory.storeOfflineStoreProjectInfo(data);
      }
    }

    function projectInfoCbKo(data, e) {
      log("projectInfoCbKo:" + e, "error", data);
      displayMapError({ err: e });
    }

    //***********************   END Callbacks for project info request      ********************

    function initModules(project, realtime) {
      var options = {
        userName,
        tiled_layer_name,
        tiled_matrixSet,
        baseHref,
        vidroapi,
        vidrotoken,
      };

      mapFactory.init(
        env,
        urlWMS,
        urlWMTS,
        token,
        project,
        app_name,
        mc.geolocate,
        mc.max_features,
        touchDevice,
        options
      );
      //websocket
      if (realtime) {
        var soOptions = {
          urlSocket: urlSocket,
          project_name: project.project_name,
          ws_token: wsToken,
          project_id: project_id,
          baseHref: baseHref,
          userName: userName,
          env: env,
        };
        rt = new RealTimeBmaps(soOptions);

        rt.on("socketStatus", function (data) {
          log("realTime on socketStatus", "info", data);
          mapFactory.setSocket(data.status);
          applyChangesToScope();
        });

        rt.on("socket_new_geometry", function (data) {
          log("realTime on socket_new_geometry", "info", data);
          mapFactory.addSocketGeometry(
            data.geom,
            data.epsg,
            mapToc.getLayerNameByLayerTable(data.db_table),
            "socket"
          );
        });

        rt.on("socket_user", function (data) {
          log("realTime on socket_user", "info", data);
          mc.realTimeusers = data.users;
          mc.me = data.me;
          if (data.status === "coordinates") {
            var coordInExtent = mapFactory.extentContainsCoordinates(
              data.affectedUser.coordinates
            );
            //add user feature and center map in coordinates
            if (mc.usersUbication) {
              mapFactory.addFeautureRemoteUser(data.affectedUser);
            }
            if (!coordInExtent) {
              realTimeNotification(
                data.affectedUser.userName +
                  " " +
                  notifications_strings.OUT_OF_EXTENT,
                "warning",
                false,
                data.requester
              );
            }
            realTimeNotification(
              data.affectedUser.userName +
                " " +
                notifications_strings.LOCALIZED,
              "info",
              false,
              data.requester
            );
          } else if (data.status === "coordinatesUpdate") {
            if (mc.usersUbication) {
              mapFactory.updateFeautureRemoteUser(data.affectedUser);
            }
          } else if (data.status === "stopRemoteLocalizeUser") {
            if (mc.usersUbication) {
              mapFactory.removeFeautureRemoteUser(data.affectedUser);
            }
          } else if (data.status === "joined") {
            if (rt.getSocketId() != data.affectedUser.socket_id) {
              realTimeNotification(
                data.affectedUser.userName +
                  " " +
                  notifications_strings.NOTIFICATION_USER_CONNECTED,
                "info",
                false,
                "All"
              );
            }
          } else if (data.status === "gone") {
            if (rt.getSocketId() != data.affectedUser.socket_id) {
              realTimeNotification(
                data.affectedUser.userName +
                  " " +
                  notifications_strings.NOTIFICATION_USER_DISCONNECTED,
                "info",
                false,
                "All"
              );
            }
            mapFactory.removeFeautureRemoteUser(data.affectedUser);
          }
          applyChangesToScope();
        });

        rt.on("socket_localizeUser", function (data) {
          log("realTime socket_localizeUser", "info", data);
          realtTimeRequester = data.requester;
          if (data.evt === "startTracking") {
            mapFactory.trackPosition("remote");
          } else if (data.evt === "stopTracking") {
            mapFactory.stopTracking("remote");
            geolocated = false;
          }
        });

        $scope.remoteLocalizeUser = function (item) {
          log("realTime remoteLocalizeUser", "info", item);
          if (!item.localized) {
            rt.remoteLocalizeUser(item.socket_id, "start");
            if (!mapFactory.getUsersUbicationVisible()) {
              mapFactory.toogleUsersUbication(mc.realTimeusers);
            }
            realTimeNotification(
              item.userName + " " + notifications_strings.LOCALIZING_USER,
              "info",
              false,
              "All"
            );
          } else {
            var coordInExtent = mapFactory.extentContainsCoordinates(
              item.coordinates
            );
            if (mc.usersUbication) {
              mapFactory.addresschosen(item.coordinates, false);
            }
            if (!coordInExtent) {
              realTimeNotification(
                item.userName + " " + notifications_strings.OUT_OF_EXTENT,
                "warning",
                false,
                "All"
              );
            }
          }
        };

        $scope.stopLocalizeUser = function (socket_id) {
          log("realTime stopLocalizeUser", "info", socket_id);
          rt.remoteLocalizeUser(socket_id, "stop");
          if (!mapFactory.getUsersUbicationVisible()) {
            mapFactory.toogleUsersUbication(mc.realTimeusers);
          }
        };

        $scope.toogleUsersUbication = function () {
          log("realTime toogleUsersUbication: " + mc.usersUbication, "info");
          mapFactory.toogleUsersUbication(mc.realTimeusers);
        };

        $scope.toogleUsersNotifications = function () {
          log(
            "realTime toogleUsersNotifications: " + mc.usersNotifications,
            "info"
          );
          if (parseInt(localStorage.getItem("usersNotifications"))) {
            localStorage.setItem("usersNotifications", 0);
            mc.usersNotifications = false;
          } else {
            localStorage.setItem("usersNotifications", 1);
            mc.usersNotifications = true;
          }
        };
        if (parseInt(localStorage.getItem("usersNotifications"))) {
          mc.usersNotifications = true;
        }
      }

      //filter dates
      var init_date = new Date();
      mapFactory.setInitEndDates(
        new Date(init_date.setMonth(init_date.getMonth() - 60)),
        new Date(init_date.setDate(init_date.getDate() + 1))
      );
      //info from query pol_id (link on table)
      $rootScope.$on("queryEvent", function (event, data) {
        log("on queryEvent", "info", data);
        if (data.evt === "found") {
          blockUI.reset();
          getInfoForm(
            data.layer,
            data.db_table,
            data.id_name,
            data.pol_id,
            true,
            null
          );
        } else if (data.evt === "searching") {
          blockUI.start(notifications_strings.NOTIFICATION_SEARCHING);
        }
      });
    }

    $scope.zoomIn = function () {
      mapFactory.zoomIn();
    };

    $scope.zoomOut = function () {
      mapFactory.zoomOut();
    };

    //****************************************************************
    //***********************    UI LISTENERS    *********************
    //****************************************************************

    $scope.cleanGeometries = function () {
      mapFactory.cleanGeometries("all");
    };

    //*******************  BACKGROUND EVENTS    ******************

    $scope.toggleBackGround = function () {
      if (mc.ChangeBackground) {
        mc.ChangeBackground = false;
      } else {
        mc.ChangeBackground = true;
      }
    };

    $scope.changeBackgroundMap = function (container) {
      var bg_id = mc.backgroundmap;
      if (container === "secondary") {
        bg_id = mc.second_background;
      }
      log("ChangeBackground(" + container + ") ", "info", bg_id);

      Bgs.getBackground(bg_id)
        .then(function (response) {
          mapFactory.renderBackground(response, container);
        })
        .catch(function (error) {
          log("getBackground: ", "warn", error);
        });
    };

    $scope.toogleUseTiledBackground = function () {
      log("toogleUseTiledBackground: ", "info", mc.use_tiled_background);
      mc.formFilters = false; //container for filters form
      mapFactory.setTiledOverBackground(
        mc.use_tiled_background,
        tiled_layer_name,
        tiled_matrixSet,
        true
      );
    };

    $scope.changeBackgroundTiled = function () {
      log("changeBackgroundTiled: ", "info", mc.selected_tiled);
      getTiledInfo(mc.selected_tiled, true);
    };

    //***********************  END BACKGROUND EVENTS   ***********

    //***********************     GEOLOCATION          ***********
    $scope.toogleGeolocation = function () {
      log("toogleGeolocation: " + mc.geolocate, "info");
      mapFactory.setUseGeolocation(mc.geolocate);
      mapFactory.trackPosition("local");
    };
    //***********************    END GEOLOCATION      ************
    $scope.toggleCoordinates = function () {
      log("toggleCoordinates: " + mc.showCoordinates, "info");
      mapFactory.toggleCoordinates();
    };
    $scope.toggleScale = function () {
      log("toggleScale: " + mc.showScale, "info");
      mapFactory.toggleScale();
    };
    //***********************    FEAUTURES LIMIT      ************
    $scope.setFeatureLimit = function () {
      log("setFeatureLimit: " + mc.max_features, "info");
      mapFactory.setMaxFeatures(mc.max_features);
    };
    //***********************    END  FEAUTURES LIMIT ************

    function doHighlightGeom(msg) {
      if (typeof msg != "undefined") {
        if (typeof msg.geometry != "undefined") {
          if (msg.geometry.st_astext != null) {
            if (!mapFactory.getMultipleSelect()) {
              mapFactory.cleanGeometries("all");
            }
            return mapFactory.highlightSelectedFeature(msg.geometry.st_astext);
          }
        }
      }
      return false;
    }
    //***********************  LAYERS EVENTS    ******************

    $scope.addRemoveLayer = function (item, index) {
      log("addRemoveLayer: ", "info", item);
      if (item.isContainer) {
        if (item.isSelected) {
          var active = 0;
        } else {
          var active = 1;
        }
        mapToc.addRemoveContainer(item, index, active);
      } else {
        mapToc.addRemoveLayer(item, index);
      }
    };

    $scope.setActiveLayer = function (item, index) {
      log("setActiveLayer: ", "info", item);
      if (!item.isContainer) {
        //check if layer is displayed
        if (mapFactory.getLayersDisplayed().indexOf(item.Name) > -1) {
          mapToc.setActiveLayer(item, index);
          mapToc.markActiveLayer(mapFactory.getActiveLayerName());
        } else {
          layerProperties = null;
          mapToc.addRemoveLayer(item, index);
        }
      } else {
        log("setActiveLayer " + item.Name + " is container", "info");
      }
    };

    function setVisitButtonEnabled(layer_name) {
      log("setVisitButtonEnabled", "info", layer_name);

      if ($rootScope.visit_version == "1") {
        //add visit button show/hide
        if (typeof layer_name != "undefined" && layer_name) {
          var layerProperties = mapToc.getLayerProperties(layer_name);
          if (typeof layerProperties != "undefined") {
            if (layerProperties.visitable == 1) {
              $rootScope.visitDisabled = false;
            } else {
              $rootScope.visitDisabled = true;
            }
          } else {
            log("Couldn't find layer properties for " + layer_name, "warn");
          }
        } else {
          log("Layer is undefined or doesn't exists on the TOC", "warn");
        }
      } else {
        if (!layer_name) {
          $rootScope.visitDisabled = true;
        } else {
          //check if layer is visitable or not for enabling button
          const layerProperties = mapToc.getLayerProperties(layer_name);
          if (typeof layerProperties != "undefined") {
            if (layerProperties.visitable == 1) {
              $rootScope.visitDisabled = false;
            } else {
              $rootScope.visitDisabled = true;
            }
          }
        }
      }
    }

    $scope.userCanEditLayer = function () {
      return mapToc.userCanEditLayer(mapFactory.getActiveLayerName());
    };

    $scope.$on("notifyActiveLayer", function (event, data) {
      log("notifyActiveLayer: ", "info", data);
      layerProperties = mapToc.getLayerProperties(data.activaLayerName);
      mc.pol_id = null;
      mc.pol_id_name = null;
      mapToc.unMarkActiveLayer(mapToc.getMarkedLayerAsActive());
      mapToc.markActiveLayer(data.activaLayerName);
      applyChangesToScope();
    });

    $scope.$on("notifyNoActiveLayer", function (event, data) {
      log("notifyNoActiveLayer: ", "info", data);
      mc.legend = null;
    });

    $scope.userCanSeeLayer = function (layer) {
      return mapToc.userCanSeeLayer(layer);
    };
    //***********************  END LAYERS EVENTS   **************

    $scope.selectArea = function () {
      log("selectArea: " + mc.toolSelectArea, "info");
      if (!mc.toolSelectArea) {
        resetTools();
        mc.toolSelectArea = true;
        mapFactory.setTool("selectArea");
      } else {
        resetTools();
      }
    };

    //map addingpoint activated
    $scope.$on("addingPoint", function (event, data) {
      log("on addingPoint", "info", data);
      applyChangesToScope();
    });

    function closePointInfo() {
      log("closePointInfo()", "info");
      mc.point_coordinates = null;
      mc.pointAttributtes = Array();
      mc.pol_id = null;
      mc.pol_id_name = null;
      mc.infoTableName = null;
      hidePreviousForms();
      mc.excludingMincut = false;
      formsSewernet.setExcludingMincut(false);
      alterNativeInfo = null;
      mapFactory.cleanGeometries("selected");
      mapFactory.endEditGeometry();
      //just for review forms, cancel tools
      mapFactory.setTool(null);
      mapFactory.clearAddPoint();
      //$rootScope.visitDisabled= true;
      mc.clickedAction = null;
      mc.AddingIncidence = false;
      mc.visitType = null;
    }

    $scope.closePointInfo = function () {
      closePointInfo();
    };

    $scope.editGeometry = function () {
      log("editGeometry()");
      mapFactory.editGeometry();
      mc.editBt = false;
      mc.btEndGeometry = true;
      //hide form
      mc[currentFormContainer] = 0;
    };

    $scope.endEditGeometry = function () {
      log("endEditGeometry()", "info");
      mc.editBt = true;
      mapFactory.endEditGeometry();
      if (mc.pol_id) {
        updateFeatureGeometry();
      }
      //draw temporal geometry
      mapFactory.addSocketGeometry(
        mc.addedGeometry,
        mapFactory.epsg,
        mapFactory.getActiveLayerName(),
        "local"
      );
    };

    $scope.cancelEditGeometry = function () {
      log("cancelEditGeometry()");
      mc.editBt = true;
      mapFactory.endEditGeometry();
      mapFactory.resetAddTools();
    };

    $scope.displayDoneGeometryButton = function () {
      mc.btEndGeometry = true;
    };

    $scope.endGeometry = function () {
      mc.btEndGeometry = false;
      if (mc.AddingIncidence) {
        var format = new ol.format.WKT({});

        var pointGeom = format.readGeometry(mc.addedGeometry, {
          dataProjection: mc.epsg,
          featureProjection: mc.epsg,
        });
        mc.point_coordinates = pointGeom.getCoordinates();
        mapFactory.resetAddTools();
        if (mc.AddingIncidence) {
          $rootScope.gwGetVisit({}, null, false);
        }
        //if no pol_id (no info) display addPoint behavior
      } else {
        if (mc.pol_id != null) {
          $scope.endEditGeometry();
          //reopen Form
          mc[currentFormContainer] = 1;
        } else {
          //only for node. For arc is the tool who opens the form
          $scope.openAddFeautureForm();
        }
      }
      applyChangesToScope();
    };

    $scope.cancelGeometry = function () {
      mc.btEndGeometry = false;
      mc.AddingIncidence = false;
      mapFactory.setTool(null);
      $scope.cancelEditGeometry();
      if (mc.pol_id != null) {
        //reopen form
        mc[currentFormContainer] = 1;
      }
      applyChangesToScope();
    };

    $scope.isNotId = function (name) {
      if (name != mc.tableIdName) {
        return true;
      }
    };

    //event received when user clicks on map and select tool is selected
    $scope.$on("featureInfoRequested", function (event, data) {
      log("featureInfoRequested", "info", data);
      notifyEvent(notifications_strings.NOTIFICATION_SEARCHING, "info", false);
      mc.mapError = false;
      applyChangesToScope();
    });

    //event received when feature info from clicked point is received and select tool is selected
    $scope.$on("featureInfoReceived", function (event, data) {
      log("featureInfoReceived", "info", data);
      mc.pointPhotos = Array();
      featureInfoReceivedData = data;
      formsSewernet.resetFormHistory();
      if (data) {
        if (data.length === 1) {
          if (mc.AddingVisit) {
            mc.pointAttributtes = data[0].Attributes;
            mc.point_coordinates = data[0].lat + " " + data[0].lon;
            mc.pol_id = data[0].pol_id;
            mc.pol_id_name = data[0].pol_id_name;
            if (typeof data[0].geometryWKT != "undefined") {
              mc.selectedGeomString = data[0].geometryWKT;
            } else {
              mc.selectedGeomString = `POINT(${mc.point_coordinates})`;
            }
            $scope.gwGetVisit("visit");
          } else {
            renderPointInfoActive(data, "renderPointInfoActive");
          }
        } else if (data.length === 0) {
          log("featureInfoReceived - no feature selected!!", "warn");
          //show no info message
          mc.pol_id = null;
          mc.pol_id_name = null;
          mapFactory.cleanGeometries("all");
          notifyEvent(
            notifications_strings.NOTIFICATION_NOTHING_FOUND,
            "warning",
            true
          );
        } else {
          log("featureInfoReceived - Multiple point received", "info");
          mc.multiplePointsSelected = data;
          applyChangesToScope();
        }
      } else {
        notifyEvent(
          notifications_strings.NOTIFICATION_NOTHING_FOUND,
          "warning",
          true
        );
      }
    });

    //event broadcasted from featuresDirectives.js
    $scope.$on("reset-tools", function (event, data) {
      log("reset-tools", "info", data);
      mc.btEndGeometry = 0;
      //hide info if is going to add something
      if (
        data.tool === "Point" ||
        data.tool === "MultiPoint" ||
        data.tool === "MultiLineString" ||
        data.tool === "LineString" ||
        data.tool === "MultiPolygon" ||
        data.tool === "Polygon"
      ) {
        mapFactory.cleanGeometries("all", "noresetetTool");
        mc.pol_id = null;
        mc.pol_id_name = null;
        hidePreviousForms();
      }
    });

    function renderPointInfoActive(data, previousAction) {
      log("renderPointInfoActive()", "info", data);
      hidePreviousForms();
      mc.linkPath = null;
      mc.btAddVisit = false;
      if (layerProperties) {
        mc.btAddVisit = layerProperties.visitable;
      }
      if (data) {
        mc.pointAttributtes = data[0].Attributes;
        mc.point_coordinates = data[0].lat + " " + data[0].lon;
        mc.pol_id = data[0].pol_id;
        mc.pol_id_name = data[0].pol_id_name;
        if (typeof data[0].geometryWKT != "undefined") {
          mc.selectedGeomString = data[0].geometryWKT;
        } else {
          mc.selectedGeomString = `POINT(${mc.point_coordinates})`;
        }
        var canEditLayer = mapToc.userCanEditLayer(data[0].layer);
        if (canEditLayer) {
          mc.addedGeometry = data[0].geometryWKT;
          mc.editBt = true;
        }
      }
      if (mapFactory.getOnlineStatus()) {
        if (typeof layerProperties == "undefined") {
          layerProperties = {};
          layerProperties.db_table = null;
        }
        getInfoForm(
          mapFactory.getCurrentLayerName(),
          layerProperties.db_table,
          mc.pol_id_name,
          true,
          mc.pol_id,
          data
        );
        applyChangesToScope();
      } else {
        var msg = {};
        msg.formTabs = {};
        msg.formTabs.formTabs = Array("tabInfo");
        msg.formTabs.tabLabel = Array("Info");
        msg.formTabs.tabText = Array("");
        msg.mincut = false;
        msg.idName = data[0].pol_id_name;
        $rootScope.feature = data[0];
        renderInfo(
          data[0].layer,
          msg,
          msg.idName,
          data[0].pol_id,
          data,
          true,
          previousAction
        );
      }
    }

    function getInfoForm(
      layer,
      db_table,
      id_name,
      pol_id,
      zoomToHiglight,
      data
    ) {
      log(
        "getInfoForm(" +
          layer +
          "," +
          db_table +
          "," +
          id_name +
          "," +
          pol_id +
          "," +
          zoomToHiglight +
          ")",
        "info",
        data
      );
      hidePreviousForms();
      if (mapFactory.getOnlineStatus()) {
        var canEditLayer = mapToc.userCanEditLayer(layer);
        formsSewernet.getInfoForm(
          layer,
          db_table,
          id_name,
          pol_id,
          canEditLayer,
          {},
          function (err, msg) {
            blockUI.reset();
            if (err) {
              if (typeof msg != "undefined") {
                log("getInfoForm error", "error", msg);
                notifyEvent(JSON.stringify(msg), "error", true);
              } else {
                log("getInfoForm error", "error", err);
                notifyEvent(JSON.stringify(err), "error", true);
              }
            } else {
              log("getInfoForm", "success", msg);
              mapFactory.setCurrentLayerTableName(msg.tableName);
              //add to multiple select
              _addToMultipleSelect(msg);
              renderInfo(
                layer,
                msg,
                id_name,
                pol_id,
                data,
                zoomToHiglight,
                "getInfoForm"
              );
            }
          }
        );
      } else {
        log("getInfoForm handle here offline behauviour", "warn");
      }
      applyChangesToScope();
    }

    $rootScope.$on("mapMoveEnd", function (event, data) {
      if (printing) {
        log("on mapMoveEnd()", "info", data);
        printAction(false);
      }
    });

    $scope.setMultipleSelect = function (what) {
      log("setMultipleSelect", "info", what);
      if (what) {
        $rootScope.polygonSelectDisabled = true;
        mapFactory.setMultipleSelect(true);
        notifyEvent(
          notifications_strings.MULTIPLE_SELECT_ACTIVATED,
          "success",
          true
        );
      } else {
        mapFactory.setMultipleSelect(false);
        notifyEvent(
          notifications_strings.MULTIPLE_SELECT_DEACTIVATED,
          "success",
          true
        );
        enableDefaultButtons();
      }
    };

    $scope.setPolygonSelect = function (what) {
      log("setPolygonSelect", "info", what);
      if (what) {
        $rootScope.multipleSelectDisabled = true;
        mapFactory.setTool("polygonSelect", "polygonSelect");
        mapFactory.cleanGeometries("all");
        mapFactory.resetMultipleSelect();
      } else {
        mapFactory.setTool(null);
        enableDefaultButtons();
      }
    };

    $rootScope.$on("clickedCoordinates", function (event, data) {
      log("on clickedCoordinates()", "info", data);
      formsSewernet.resetFormHistory();
      var coordinates = data.coordinates;
      mc.point_coordinates = coordinates;
      mc.selectedGeomString = null;
      if (!$rootScope.flowTraceEnabled) {
        getInfoFormFromCoordinates(coordinates[0], coordinates[1], false);
      } else {
        $rootScope.doFlowTrace(coordinates);
      }
    });

    $rootScope.$on("polygonSelect", function (event, data) {
      log("on polygonSelect()", "info", data);
      getInfoFormFromPolygon(data.polygon);
    });

    function _formatDataForInfo() {
      log("_formatDataForInfo()", "info");
      layerProperties = mapToc.getLayerProperties(
        mapFactory.getCurrentLayerName()
      );
      if (formsSewernet.getExcludingMincut()) {
        layerProperties.db_table = formsSewernet.setMincutValveLayerTableName();
      }
      var visibleLayersNames = mapToc.getTableNamesFromLayersNameList(
        mapFactory.getLayersDisplayed()
      );
      if (typeof layerProperties == "undefined") {
        layerProperties = {};
        layerProperties.db_table = null;
        layerProperties.visitable = false;
      }
      //get toc marked layer
      var marked_layer_db_name = null;
      var marked_layer = mapToc.getMarkedLayerAsActive();
      if (marked_layer) {
        marked_layer_db_name = mapToc.getTableNameByLayerName(marked_layer);
      }
      var editableLayersTableName = Array();
      if (visibleLayersNames.length > 0 || mc.use_tiled_background) {
        editableLayersTableName = mapToc.getEditableLayersTableNames();
      }
      return {
        layerProperties: layerProperties,
        marked_layer_db_name: marked_layer_db_name,
        marked_layer: marked_layer,
        visibleLayersNames: visibleLayersNames,
        editableLayersTableName: editableLayersTableName,
      };
    }
    function getInfoFormFromPolygon(polygon) {
      log("getInfoFormFromPolygon()", "info", polygon);
      var dataForInfo = _formatDataForInfo();
      if (
        dataForInfo.visibleLayersNames.length > 0 ||
        mc.use_tiled_background
      ) {
        log(
          "getInfoFormFromPolygon editable Layers Table Names",
          "info",
          dataForInfo.editableLayersTableName
        );
        var dataToSend = {};
        dataToSend.polygon = polygon;
        dataToSend.active_layer = dataForInfo.marked_layer_db_name;
        dataToSend.visible_layers = dataForInfo.visibleLayersNames;
        dataToSend.editable_layers = dataForInfo.editableLayersTableName;
        dataToSend.epsg = mc.epsg;
        dataToSend.zoomlevel = mapFactory.getResolution();
        dataToSend.use_tiled_background = mc.use_tiled_background;
        formsSewernet
          .getInfoFromPolygon(dataToSend)
          .then((msg) => {
            log("getInfoFormFromPolygon", "success", msg);
            //clean polygon
            $scope.setPolygonSelect(false);
            //disable polygon tool
            mapFactory.setTool(null);
            //enable multiple select
            mapFactory.setTool("multipleSelect");
            mapFactory.cleanGeometries("all");
            mapFactory.resetMultipleSelect();
            notifyEvent(
              notifications_strings.MULTIPLE_SELECT_ACTIVATED,
              "success",
              true
            );
            for (var i = 0; i < msg.results.length; i++) {
              if (typeof msg.results[i].geometry != "undefined") {
                if (msg.results[i].geometry != null) {
                  //add to multiple select
                  let itemForMutipleSelect = {
                    pol_id: msg.results[i].id,
                    idName: msg.idName,
                    geometry: msg.results[i].geometry,
                    tableName: msg.tableName,
                  };
                  _addToMultipleSelect(itemForMutipleSelect);
                }
              }
            }
            $rootScope.newMincutDisabled = true;
            if (typeof msg.mincut != "undefined") {
              if (msg.mincut) {
                $rootScope.newMincutDisabled = false;
              }
            }
            applyChangesToScope();
          })
          .catch((err) => {
            log("getInfoFormFromPolygon error", "error", err);
            notifyEvent(JSON.stringify(err), "error", true);
            //clean polygon
            $scope.setPolygonSelect(false);
            //disable polygon tool
            mapFactory.setTool(null);
            enableDefaultButtons();
            applyChangesToScope();
          });
      }
    }

    function getInfoFormFromCoordinates(x, y, zoomToHiglight) {
      log(
        "getInfoFormFromCoordinates(x: " +
          x +
          ",y: " +
          y +
          ", zoomToHiglight: " +
          zoomToHiglight +
          ") alternativeInfo: " +
          alterNativeInfo,
        "info"
      );
      if (alterNativeInfo === "setCoordinates") {
        setFormCoordinates(x, y);
      } else {
        if (defaultInfo === "wms") {
          mapFactory.doWMSInfo([x, y]);
          return;
        }
        //check if multiple select is activated and store current data, because hidePreviousForms will remove it
        var isMultipleSelect = mapFactory.getMultipleSelect();
        var multipleSelectTempData = null;
        if (isMultipleSelect) {
          multipleSelectTempData = mapFactory.getMultipleData();
        }
        hidePreviousForms();
        layerProperties = mapToc.getLayerProperties(
          mapToc.getMarkedLayerAsActive()
        );
        if (formsSewernet.getExcludingMincut()) {
          layerProperties.db_table =
            formsSewernet.setMincutValveLayerTableName();
        }
        var visibleLayersNames = mapToc.getTableNamesFromLayersNameList(
          mapFactory.getLayersDisplayed()
        );

        if (typeof layerProperties == "undefined") {
          layerProperties = {};
          layerProperties.db_table = null;
          layerProperties.visitable = false;
        }
        //get toc marked layer
        var marked_layer_db_name = null;
        var marked_layer = mapToc.getMarkedLayerAsActive();
        if (marked_layer) {
          marked_layer_db_name = mapToc.getTableNameByLayerName(marked_layer);
        }
        log(
          "getInfoFormFromCoordinates visible Table Layers Names",
          "info",
          visibleLayersNames
        );
        if (visibleLayersNames.length > 0 || mc.use_tiled_background) {
          var editableLayersTableName = mapToc.getEditableLayersTableNames();
          log(
            "getInfoFormFromCoordinates editable Layers Table Names",
            "info",
            editableLayersTableName
          );
          formsSewernet.getInfoFormFromCoordinates(
            x,
            y,
            marked_layer_db_name,
            visibleLayersNames,
            editableLayersTableName,
            mc.epsg,
            mapFactory.getResolution(),
            mc.use_tiled_background,
            layerProperties.visitable,
            function (err, msg) {
              if (err) {
                if (err === "No features found") {
                  log(
                    "getInfoFormFromCoordinates No features found, try WMS info",
                    "warn",
                    msg
                  );
                  //try wms info
                  NOzoomToHiglight = true; //don't zoom to element
                  mapFactory.doWMSInfo([x, y]);
                } else {
                  log("getInfoFormFromCoordinates error", "error", err);
                  notifyEvent(JSON.stringify(msg), "error", true);
                }
              } else {
                log("getInfoFormFromCoordinates", "success", msg);
                //for visit version 1, force enable button
                if ($rootScope.visit_version == 1) {
                  if (typeof msg.visitability != "undefined")
                    $rootScope.visitDisabled = !msg.visitability; //oposite because is a button disabled property
                } else {
                  //check if affected info layer is visitable or not for enabling button
                  const layerPropertiesAffectedInfo = mapToc.getLayerProperties(
                    mapToc.getLayerNameByLayerTable(msg.tableName)
                  );
                  if (typeof layerPropertiesAffectedInfo != "undefined") {
                    if (layerPropertiesAffectedInfo.visitable == 1) {
                      $rootScope.visitDisabled = false;
                    } else {
                      $rootScope.visitDisabled = true;
                    }
                  } else {
                    if (typeof msg.visitability != "undefined")
                      $rootScope.visitDisabled = !msg.visitability; //oposite because is a button disabled property}
                  }
                }
                if (msg.message === "no results") {
                  if (
                    msg.use_tiled_background === null ||
                    !msg.use_tiled_background
                  ) {
                    //try wms info
                    NOzoomToHiglight = true; //don't zoom to element
                    mapFactory.doWMSInfo([x, y]);
                  } else {
                    notifyEvent(
                      notifications_strings.NOTIFICATION_NOTHING_FOUND,
                      "warning",
                      true
                    );
                  }
                } else {
                  if (!isMultipleSelect) {
                    mapFactory.cleanGeometries("all");
                  }
                  mapFactory.setCurrentLayerTableName(msg.tableName);
                  var layer = mapToc.getLayerNameByLayerTable(msg.tableName);
                  mc.infoTableName = msg.tableName;
                  if (typeof layer != "undefined") {
                    if (!formsSewernet.getExcludingMincut()) {
                      //enable new mincut button if fits
                      $rootScope.newMincutDisabled = true;
                      if (typeof msg.mincut != "undefined") {
                        if (msg.mincut) {
                          $rootScope.newMincutDisabled = false;
                        }
                      }

                      //add to multiple select
                      _addToMultipleSelect(msg);
                      //if multiple select is activated, do not show form,
                      //just highlight element and store it in multiple select data
                      if (isMultipleSelect) {
                        mapFactory.setMultipleSelectData(
                          multipleSelectTempData
                        );
                      } else {
                        //***************** Display info form *************************
                        renderInfo(
                          layer,
                          msg,
                          msg.idName,
                          msg.pol_id,
                          null,
                          zoomToHiglight,
                          "getInfoFormFromCoordinates"
                        );
                      }
                    } else {
                      //find node_id
                      var node_id = formsSewernet.getValueFromEditableField(
                        msg,
                        "node_id"
                      );
                      if (node_id) {
                        excludeFromMincut(node_id);
                      } else {
                        notifyEvent(
                          "node_id not found - cannot execute excludeFromMincut",
                          "error",
                          true
                        );
                        getMincut(mc.mincut_id);
                      }
                      mc.excludingMincut = false;
                      formsSewernet.setExcludingMincut(false);
                    }
                  } else {
                    log(
                      "getInfoFormFromCoordinates error layer for " +
                        msg.tableName +
                        " not found on TOC",
                      "error"
                    );
                    notifyEvent("Layer not found", "error", true);
                  }
                }
              }
            }
          );
        } else {
          //if no layers displayed and no tiled
          if (mc.second_background && mc.second_background !== "none") {
            _doBackgroundInfo(mc.second_background, "secondary");
          } else {
            _doBackgroundInfo(mc.backgroundmap, "main");
          }
        }
      }
      applyChangesToScope();
    }

    function _addToMultipleSelect(msg) {
      log("_addToMultipleSelect", "info", msg);
      $rootScope.multiUpdateDisabled = false; //enable multiupdate button
      //add element for multiple select
      if (typeof msg.geometry != "undefined") {
        if (msg.geometry.st_astext != null) {
          mapFactory.multipleSelectAddRemoveElement({
            id: msg.pol_id,
            id_name: msg.idName,
            geometry: msg.geometry.st_astext,
            table: msg.tableName,
          });
        }
      }
    }

    function _doBackgroundInfo(bgId, container) {
      Bgs.getInfoFromBackground(
        bgId,
        mapFactory.getBackgroundSource(container),
        mc.point_coordinates,
        mapFactory.getMapData()
      )
        .then(function (response) {
          log("getInfoFromBackground", "success", response);
        })
        .catch(function (error) {
          if (error.type === "background") {
            log("getInfoFromBackground " + error.error, "info");
          } else {
            log("getInfoFromBackground error", "warn", error);
          }

          if (error.message === "no features") {
            notifyEvent(
              notifications_strings.NOTIFICATION_NOTHING_FOUND,
              "warning",
              true
            );
          }
        });
    }
    //***************      RENDER INFO FORM    ***********************
    function renderInfo(
      layer,
      msg,
      id_name,
      pol_id,
      data,
      zoomToHiglight,
      previousAction
    ) {
      log(
        "renderInfo(layer: " +
          layer +
          ",id_name: " +
          id_name +
          ", pol_id: " +
          pol_id +
          ", zoomToHiglight: " +
          zoomToHiglight +
          ", previousAction: " +
          previousAction +
          ")",
        "info",
        msg
      );
      if (
        mapFactory.getLayersDisplayed().indexOf(layer) === -1 &&
        !mc.use_tiled_background
      ) {
        mapToc.addRemoveLayer(mapToc.getObjectLayerByLayerName(layer));
      }
      var formAndTab = msg.formTabs;
      //if idName comes from DB, if not use the one received as parameter
      if (typeof msg.idName != "undefined") {
        id_name = msg.idName;
      }
      mc.pol_id = pol_id;
      mc.pol_id_name = id_name;
      if (mc.pol_id === null) {
        notifyEvent("NO POL_ID!!!", "error", true);
      }
      //data for backButton
      formAndTab.id_name = id_name;
      formAndTab.pol_id = pol_id;
      formAndTab.layer = layer;
      formAndTab.action = previousAction;
      formAndTab.formParent = "formInfo";
      if (typeof data != "undefined") {
        formAndTab.data = data;
      } else {
        //fake data for form History
        var data = Array({
          Attributes: msg.editData.fields,
          lat: 0,
          lon: 0,
          pol_id: mc.pol_id,
          pol_id_name: mc.pol_id_name,
        });
        formAndTab.data = data;
      }
      formAndTab.status = status;
      formAndTab.elementSelectorForWebForms = "v_ui_element_x_" + id_name[0];
      formAndTab.docSelectorForWebForms = "v_ui_doc_x_" + id_name[0];
      formAndTab.visitSelectorForWebForms = "v_ui_om_visit_x_" + id_name[0];
      //end data for backButton
      id_name = mc.pol_id_name.split("_");

      //mincut=true show mincut button
      $rootScope.newMincutDisabled = true;
      $rootScope.multipleSelectDisabled = false;
      if (typeof msg.mincut != "undefined") {
        if (msg.mincut) {
          $rootScope.newMincutDisabled = false;
        }
      }

      if (typeof msg.editData != "undefined") {
        log("renderInfo using DB info", "info");
        $rootScope.feature = {};
        mc.edit_feature_form = msg.editData.fields;
      } else {
        log("renderInfo using QGIS/ info", "info");
        mc.edit_feature_form = [];
      }
      if (typeof msg.linkPath != "undefined") {
        mc.linkPath = msg.linkPath.link;
      }
      mc.btAddVisit = false;
      mc.editBt = false;
      //add visit button show/hide
      if (typeof layer != "undefined" && layer) {
        var layerProperties = mapToc.getLayerProperties(layer);
        if (typeof layerProperties != "undefined") {
          if (mapFactory.getOnlineStatus()) {
            mc.btAddVisit = layerProperties.visitable;
            if (layerProperties.edit === 1) {
              mc.editBt = true;
            } else {
              mc.editBt = false;
            }
          }
        } else {
          log("Couldn't find layer properties for " + layer, "warn");
        }
      } else {
        log("Layer is undefined or doesn't exists on the TOC", "warn");
      }

      if (typeof msg.geometry != "undefined") {
        if (msg.geometry.st_astext != null) {
          //highLightGeometry
          mc.selectedGeomString = msg.geometry.st_astext;
          //highlight is done by bmaps/mapSelectTool.js->addRemoveElement;
          if (zoomToHiglight && !NOzoomToHiglight) {
            mapFactory.zoomToHiglightedFeature(null);
          } else {
            $rootScope.$broadcast("formRendered", {});
          }
        }
      }
      if (mc.AddingVisit) {
        if (typeof msg.visitability != "undefined") {
          if (msg.visitability == 1) {
            $scope.gwGetVisit("visit");
          } else {
            displayForm(mc.pol_id_name, null, formAndTab);
          }
        } else {
          displayForm(mc.pol_id_name, null, formAndTab);
        }
      } else {
        displayForm(mc.pol_id_name, null, formAndTab);
      }
      NOzoomToHiglight = false;
      applyChangesToScope();
    }
    //***************    END RENDER INFO FORM    *********************

    //****************************************************************
    //******************      END POINT INFO       *******************
    //****************************************************************

    //****************************************************************
    //***********************        HELPERS     *********************
    //****************************************************************

    function loadAvailaibleTiled() {
      var data2send = {};
      data2send.what = "GET_TILED";
      data2send.project_id = project_id;
      data2send.token = token;
      $http
        .post(baseHref + "ajax.projects.php", data2send)
        .success(function (data) {
          loggerService.log(
            "app_projects -> MainController.js loadAvailaibleTiled() result:",
            data
          );
          if (data.status === "Accepted") {
            var available_tiled_layers = Array();
            for (var i = 0; i < data.message.length; i++) {
              if (data.message[i].assigned === true) {
                available_tiled_layers.push(data.message[i]);
              }
            }
            mc.available_tiled_layers = available_tiled_layers;
            mc.selected_tiled = selected_tiled;
          }
        })
        .error(function (error) {
          loggerService.log(
            "app_projects -> MainController.js",
            "error requesting loadAvailaibleTiled"
          );
        });
    }

    function getTiledInfo(tiled_id, render) {
      var data2send = {};
      data2send.what = "GET_TILED_INFO";
      data2send.tiled_id = tiled_id;
      data2send.token = token;
      $http
        .post(baseHref + "ajax.projects.php", data2send)
        .success(function (data) {
          loggerService.log(
            "app_projects -> MainController.js getTiledInfo() result:",
            data
          );
          if (data.status === "Accepted") {
            tiled_layer_name = data.message.layer;
            tiled_matrixSet = data.message.matrixset;
            if (render) {
              loggerService.log(
                "app_projects -> MainController.js render tiled bg",
                {
                  use_tiled_background: mc.use_tiled_background,
                  tiled_layer_name: tiled_layer_name,
                  tiled_matrixSet: tiled_matrixSet,
                }
              );
              mapFactory.setTiledOverBackground(
                mc.use_tiled_background,
                tiled_layer_name,
                tiled_matrixSet,
                false
              );
              applyChangesToScope();
            }
          }
        })
        .error(function (error) {
          loggerService.log(
            "app_projects -> MainController.js",
            "error requesting getTiledInfo"
          );
        });
    }

    //map resized event for responsive features
    $scope.$on("mapResized", function (event, data) {
      mapFactory.resize();
    });

    function getLegend(item) {
      log("getLegend", "info", item);
      if (mapFactory.getOnlineStatus()) {
        if (legendTextSize === null) legendTextSize = 9;
        var legendUrl =
          urlWMS +
          "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphics&FORMAT=image%2Fpng&BOXSPACE=1&LAYERSPACE=2&SYMBOLSPACE=1&SYMBOLHEIGHT=2&ITEMFONTFAMILY=Arial&LAYERFONTSIZE=" +
          legendTextSize +
          "&ITEMFONTSIZE=" +
          legendTextSize +
          "&ICONLABELSPACE=2&LAYERTITLE=FALSE&ITEMFONTCOLOR=%23" +
          legendTextColor +
          "&SYMBOLSPACE=2&LAYERTITLESPACE=0&TRANSPARENT=true&LAYERS=" +
          item.Name +
          "&DPI=96";
        item.legend = legendUrl;
        log("getLegend: " + legendUrl, "info", mapToc.getMarkedLayerAsActive());
      }
      if (item.Name === mapToc.getMarkedLayerAsActive()) {
        setVisitButtonEnabled(item.Name);
      }
      applyChangesToScope();
    }

    function hideLegend(item) {
      log("hideLegend()", "info", mapToc.getDisplayedLayers().length);
      item.legend = "img/pixel.png";
      if (mapToc.getDisplayedLayers().length < 1) {
        $rootScope.visitDisabled = true;
      }
      applyChangesToScope();
    }

    //legend event
    $scope.$on("legendEvent", function (event, data) {
      log("legendEvent()", "info", data);
      var selector;
      if (typeof data.item != "object") {
        selector = data.item;
        var newItem = {};
        newItem.Name = data.item;
        newItem.Title = data.item;
        data.item = newItem;
      }

      if (typeof data.item.Title != "undefined") {
        selector = $scope.trimSpacesFromLayerName(data.item.Title);
        log("legendEvent: " + selector, "info");

        try {
          if (data.event === "show") {
            setTimeout(function () {
              $("#layout_" + selector).switchLayoutChildren("open");
            }, 100);
            getLegend(data.item);
            $rootScope.multipleSelectDisabled = false;
            $rootScope.polygonSelectDisabled = false;
            $rootScope.tableDisabled = false;
          } else {
            setTimeout(function () {
              $("#layout_" + selector).switchLayoutChildren("close");
            }, 100);
            if (mapToc.getDisplayedLayers().length === 0) {
              $rootScope.multipleSelectDisabled = true;
              $rootScope.polygonSelectDisabled = true;
              $rootScope.tableDisabled = true;
            }

            hideLegend(data.item);
          }
        } catch (e) {
          log("on legendEvent", "error", e);
        }
      }
    });

    $scope.trimSpacesFromLayerName = function (name) {
      if (typeof name != "undefined") {
        return name.replace(/\s/g, "");
      }
    };

    //getcapabilities readed
    $scope.$on("capabilities", function (event, data) {
      log("on capabilities", "success", data);
      var mapData = mapFactory.getMapData();
      mc.epsg = mapData.epsg;
      mc.extent = mapData.extent;
      //set epsg for background and render backgrounds
      Bgs.setEpsg(mc.epsg);
      Bgs.getBackground(mc.backgroundmap)
        .then(function (response) {
          mapFactory.renderBackground(response, "main");
        })
        .catch(function (error) {});

      if (mc.use_second_background) {
        Bgs.getBackground(Bgs.getProjectBgsProperty("bg_secondary"))
          .then(function (response) {
            mapFactory.renderBackground(response, "secondary");
          })
          .catch(function (error) {});
      }
      //TOC
      var tocOptions = {
        token: token,
        app_name: app_name,
        use_layer_auth: use_layer_auth,
        project_id: project_id,
        useCookies: use_toc_cookie,
      };
      mapToc.init(tocOptions, mc, user_permissions);
      mapToc.formatLayers(data.Capability.Layer.Layer);
      if (mc.offlineActivated) {
        mapFactory.storeOfflineStoreCapabilities(data);
      }
    });

    //geolocalization events
    $scope.$on("geoLocalizeEvent", function (event, data) {
      log("on geoLocalizeEvent", "info", data);
      log("realTime geoLocalizeEvent", "info", data);
      if (data.evt === "GEOLOCATING") {
        notifyEvent(notifications_strings.GEOLOCATING, "success", true);
      } else if (data.evt === "GEOLOCATED") {
        notifyEvent(notifications_strings.GEOLOCATED, "success", true);
        if (rt) {
          rt.sendLocalCoordindates(
            { coordinates: data.coordinates, requester: realtTimeRequester },
            "new"
          );
        }
        geolocated = true;
      } else if (data.evt === "GEOLOCATION_ERROR") {
        notifyEvent(notifications_strings.GEOLOCATION_ERROR, "error", true);
      } else if (data.evt === "GEOLOCATION_CHANGE") {
        if (rt) {
          var action = "update";
          if (!geolocated) {
            geolocated = true;
            action = "new";
          }
          rt.sendLocalCoordindates(
            { coordinates: data.coordinates, requester: realtTimeRequester },
            action
          );
        }
      }
    });

    //log event
    $scope.$on("logEvent", function (event, data) {
      if (data.extradata) {
        loggerService.log(
          app_name + " -> " + data.file,
          data.evt,
          data.level,
          data.extradata
        );
      } else {
        loggerService.log(app_name + " -> " + data.file, data.evt, data.level);
      }
    });

    function log(evt, level, extradata) {
      if (extradata) {
        loggerService.log(
          app_name + "-> " + file_name + " v." + version,
          evt,
          level,
          extradata
        );
      } else {
        loggerService.log(
          app_name + "-> " + file_name + " v." + version,
          evt,
          level
        );
      }
    }

    function logExternal(mod, evt, level, extradata) {
      if (extradata) {
        loggerService.log(mod, evt, level, extradata);
      } else {
        loggerService.log(mod, evt, level);
      }
    }

    $scope.$on("displayMapError", function (event, data) {
      log("on displayMapError", "error", data);
      displayMapError(data);
    });

    function displayMapError(data) {
      log("displayMapError()", "error", data);
      notifyEvent(data.err, "error", false);
      applyChangesToScope();
    }

    $scope.$on("hideMapError", function (event, data) {
      log("on hideMapError", "info", data);
      if (mc.mapError) {
        mc.mapError = false;
      }
    });

    $scope.$on("stringsLoaded", function (event, data) {
      log("on stringsLoaded", "info", data);
      notifications_strings = data;
      //if offline is activated, store strings
      if (mc.offlineActivated && mapFactory.getOnlineStatus()) {
        mapFactory.storeOfflineStrings(data);
      }
      if (formsSewernet) {
        formsSewernet.setLocalizedStrings(data);
      }
      setUpControllers();
    });

    function resetTools() {
      mapFactory.setTool(null);
    }

    $scope.$on("applyChangesToScope", function (event, data) {
      applyChangesToScope();
    });

    $scope.applyChangesToScope = function () {
      applyChangesToScope();
    };

    function applyChangesToScope() {
      try {
        if (
          $scope.$root.$$phase != "$apply" &&
          $scope.$root.$$phase != "$digest"
        ) {
          $scope.$apply();
        }
      } catch (e) {
        console.warn("error in applyChangesToScope() ", e);
      }
    }

    $rootScope.$on("displayError", function (event, data) {
      log("on displayError", "error", data);
      notifyEvent(data.msg, "error", false);
    });

    $rootScope.$on("visualizationTools", function (event, data) {
      log("on visualizationTools", "info", data);
      mc[data.key] = data.value;
    });

    function heartBeat() {
      log("heartBeat()", "info");
      if (mapFactory.getOnlineStatus()) {
        var data2send = new FormData();
        data2send.append("what", "HEARTBEAT");
        data2send.append("token", token);
        $http
          .post(baseHref + "ajax.addInfo.php", data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("heartBeat() result:", "info", data);
            if (data != "OK") {
              log("KO in heartBeat", "warn");
              location.href = baseHref + "home.php";
            }
          })
          .error(function (error) {
            log("error requesting heartBeat", "warn");
          });
      }
    }

    //realtime notifications require a localstorage flag
    function realTimeNotification(notification, level, hide, requester) {
      if (parseInt(localStorage.getItem("usersNotifications"))) {
        if (requester === "All" || requester.socket_id === rt.getSocketId()) {
          notifyEvent(notification, level, hide);
        }
      }
    }

    function notifyEvent(txt, type, hidePrevious) {
      log("notifyEvent(" + txt + "," + type + "," + hidePrevious + ")", "info");
      /*
            txt -> text to diplay in notification
            type -> error, warning, success, info
            hidePrevius -> remove previous notifications
      */

      if (hidePrevious) {
        $(".notifyjs-wrapper").click();
      }
      var options = {
        showAnimation: "show",
        hideAnimation: "hide",
        position: "top center",
        showDuration: 0,
        hideDuration: 0,
        autoHide: true,
        autoHideDelay: 5000,
        clickToHide: true,
      };
      if (type === "error") {
        options.className = "error";
        options.autoHideDelay = 5000;
      } else if (type === "success") {
        options.className = "success";
        options.autoHideDelay = 3000;
      } else if (type === "info") {
        options.className = "info";
        options.autoHideDelay = 3000;
      } else if (type === "warning") {
        options.className = "warning";
        options.autoHideDelay = 3000;
      }
      if (txt != "" && txt != null) {
        $.notify(txt, options);
      } else {
        $.notify("generic error", options);
      }
    }

    $scope.showInput = function (formId, inputName) {
      return formsSewernet.showInput(formId, inputName);
    };

    $scope.showBackBt = function () {
      return formsSewernet.showBackBt();
    };

    $scope.getTabLabel = function (tabName) {
      if (typeof tabName != "undefined" && tabName != "undefined") {
        return mc["label_" + tabName];
      } else {
        return false;
      }
    };

    $scope.getTabText = function (tabName) {
      if (typeof tabName != "undefined" && tabName != "undefined") {
        return mc["tabText_" + tabName];
      } else {
        return false;
      }
    };

    function displayForm(layer_id_name, wichForm, formAndTab) {
      log(
        "displayForm(" + layer_id_name + "," + wichForm + ")",
        "info",
        formAndTab
      );
      if (
        typeof layer_id_name != "undefined" &&
        typeof wichForm != "undefined"
      ) {
        //add form to history handler
        formAndTab.layer_id_name = layer_id_name;
        formsSewernet.addFormHistory(formAndTab);
        //display form containermc.elementSelectorForWebForms
        mc.debugFormName = formAndTab.formName;
        mc.formId = formAndTab.formId;
        if (mc.formId == "F25") {
          mc.debugFormName =
            mapFactory.getLocalizedStringValue("VISIT_MANAGER");
        }
        //select container to display
        mc[formAndTab.formParent] = 1;
        currentFormContainer = formAndTab.formParent;
        //reset displayed tabs
        for (var dt = 0; dt < displayedTabs.length; dt++) {
          mc[displayedTabs[dt]] = 0;
        }
        displayedTabs = [];
        //display tabs
        for (var t = 0; t < formAndTab.formTabs.length; t++) {
          displayedTabs.push(formAndTab.formTabs[t]);
          mc[formAndTab.formTabs[t]] = 1;

          if (typeof formAndTab.tabLabel != "undefined") {
            if (typeof formAndTab.tabLabel[t] != "undefined") {
              mc["label_" + formAndTab.formTabs[t]] = formAndTab.tabLabel[t];
            }
          }
          if (typeof formAndTab.tabText != "undefined") {
            if (typeof formAndTab.tabText[t] != "undefined") {
              mc["tabText_" + formAndTab.formTabs[t]] = formAndTab.tabText[t];
            }
          }
        }

        //set getter for Elements on getWebFormsSelector
        mc.elementSelectorForWebForms = formAndTab.elementSelectorForWebForms;
        //set getter for Docs on getWebFormsSelector
        mc.docSelectorForWebForms = formAndTab.docSelectorForWebForms;
        //set getter for Visit on getWebFormsSelector
        mc.visitSelectorForWebForms = formAndTab.visitSelectorForWebForms;

        //select first tab
        try {
          var li = $(".forms-area li").eq(0);
          li.addClass("active");
          var relatedContent = li.closest(".drop-down-form").find(".content");
          relatedContent.find(".tab-content").first().show();
        } catch (e) {
          log("Error selecting first tab on form", "error", e);
        }
      } else {
        hidePreviousForms();
      }
    }

    function hidePreviousForms() {
      log("hidePreviousForms()", "info");
      //hide elements that could be displayed on previous actions
      mc.select_parameter_type = false; //container for add visit form parameter_type select
      mc.event_id = null; //event id
      mc.editBt = false;
      mc.formFilters = false; //container for filters form
      mc.formMincut = false; //container for form mincut
      mc.filterTabs = null;
      mc.activeTab = null;
      mc.formParameters = null;
      mc.formPagination = null;
      mc.clickedButton = null;
      mc.formName = null;
      mc.parameter_type = null;
      mc.btAcceptTabFiles = false; //footer button accept info tabFiles - TBR when info is redone
      //$rootScope.multipleSelectDisabled = true;
      //only empty multiple data if multipleSelect disabled and MultipleData contains
      //more than 1 element, thus we can do a multipleSelect from a regular info
      if (
        !mapFactory.getMultipleSelect() &&
        mapFactory.getMultipleData().id.length >= 1
      ) {
        mapFactory.resetMultipleSelect();
        $rootScope.newMincutDisabled = true;
        $rootScope.multiUpdateDisabled = true;
      }
      printing = false;
      mc.AddingIncidence = false;
      //hide previous tabs
      for (var pt = 0; pt < displayedTabs.length; pt++) {
        mc[displayedTabs[pt]] = 0;
      }
      //hide selected tab
      try {
        var tabs = $(".forms-area");
        tabs.find("li").removeClass("active");
        var relatedContent = tabs
          .find("li")
          .closest(".drop-down-form")
          .find(".content");
        relatedContent.find(".tab-content").hide();
      } catch (e) {
        log("Error hidding selected tab on form", "error", e);
      }
      //always hide visit button for visit version 1
      if ($rootScope.visit_version == 1) {
        $rootScope.visitDisabled = true;
      }
      //hide form
      mc.formInfo = 0;
      mc.formAddfeature = 0;
      $rootScope.$broadcast("destroyDirectives", {});

      //enable/disable visit button
      setVisitButtonEnabled(mapFactory.getActiveLayerName());

      resetDatePickers();
      applyChangesToScope();
    }

    function _stringToDate(string) {
      var splitDate = string.split("-");
      return new Date(splitDate[1] + "-" + splitDate[0] + "-" + splitDate[2]);
    }

    function _stringToTimestamp(string) {
      return new Date(string).getTime() / 1000;
    }

    function _setDateForDatePicker(modifyDate, unit) {
      var init_date = new Date();
      init_date = new Date(init_date.setMonth(init_date.getMonth() + 1));
      var dateObj = init_date;
      if (unit === "month") {
        dateObj = new Date(
          init_date.setMonth(init_date.getMonth() + modifyDate)
        );
      } else if (unit === "day") {
        dateObj = new Date(init_date.setDate(init_date.getDate() + modifyDate));
      }
      var month = dateObj.getUTCMonth() + 1;
      if (month < 10) {
        month = "0" + month;
      }
      var _dateForDp = new Date(
        dateObj.getUTCFullYear() + "/" + month + "/" + dateObj.getUTCDate()
      );
      var retorno = {
        dateObj: dateObj,
        dateForDp: _dateForDp,
      };
      return retorno;
    }

    //****************************************************************
    //***********************    END HELPERS     *********************
    //****************************************************************

    //****************************************************************
    //*****************        SEARCH ADDRESS      *******************
    //****************************************************************

    $scope.getLocation = function (val) {
      var md = mapFactory.getMapData();
      return $http
        .get(baseHref + "/ajax.nominatim.php", {
          params: {
            criteria: val,
            country: "es",
            token: token,
            extent: ol.proj
              .transformExtent(
                md.extent,
                ol.proj.get(md.epsg),
                ol.proj.get("EPSG:4326")
              )
              .toString(),
            json: 1,
          },
        })
        .then(function (response) {
          return response.data.map(function (item) {
            return item;
          });
        });
    };

    $scope.selectAddress = function (item, model, label) {
      log("selectAddress()", "info");
      mapFactory.addresschosen([item.lon, item.lat], true);
    };

    //****************************************************************
    //*****************     END  SEARCH ADDRESS    *******************
    //****************************************************************

    //****************************************************************
    //******************        FORMS INFO       *********************
    //****************************************************************

    function setUpVisitDatePickers() {
      var dateForFrom = _setDateForDatePicker(-60, "month");
      $("#dp_visit_from").datepicker({
        dateFormat: "dd-mm-yy",
        defaultDate: dateForFrom.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true,
      });
      $("#dp_visit_from").datepicker("setDate", dateForFrom.dateForDp);

      var dateForTo = _setDateForDatePicker(+1, "day");
      $("#dp_visit_to").datepicker({
        dateFormat: "dd-mm-yy",
        defaultDate: dateForTo.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true,
      });
      $("#dp_visit_to").datepicker("setDate", dateForTo.dateForDp);

      $scope.dp_visit_from = $("#dp_visit_from").val();
      $scope.dp_visit_to = $("#dp_visit_to").val();

      //mincut DatePickers
      /*  $("#dp_mincut_to").datepicker({
        dateFormat: "dd-mm-yy",
        defaultDate: dateForTo.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true
      });
      $("#dp_mincut_to").datepicker("setDate", dateForTo.dateForDp);
      $("#dp_mincut_from").datepicker({
        dateFormat: "dd-mm-yy",
        defaultDate: dateForFrom.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true
      });
      $("#dp_mincut_from").datepicker( "setDate", dateForFrom.dateForDp);*/

      //mincut DatePickerTime
      $("#dp_mincut_to").datetimepicker({
        format: "Y-m-d H:i:s",
        defaultDate: dateForTo.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true,
      });
      $("#dp_mincut_to").datetimepicker("setDate", dateForTo.dateForDp);
      $("#dp_mincut_from").datetimepicker({
        format: "Y-m-d H:i:s",
        defaultDate: dateForFrom.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true,
      });
      $("#dp_mincut_from").datetimepicker("setDate", dateForFrom.dateForDp);

      $scope.dp_mincut_to = $("#dp_mincut_to").val();
      $scope.dp_mincut_from = $("#dp_mincut_from").val();
    }

    function resetDatePickers() {
      $("#dp_visit_to").datepicker("destroy");
      $("#dp_visit_to").val("");
      $("#dp_visit_from").datepicker("destroy");
      $("#dp_visit_from").val("");
      $scope.dp_visit_from = $("#dp_visit_from").val();
      $scope.dp_visit_to = $("#dp_visit_to").val();
      //mincut datepickers
      $("#dp_mincut_to").datepicker("destroy");
      $("#dp_mincut_to").val("");
      $("#dp_mincut_from").datepicker("destroy");
      $("#dp_mincut_from").val("");
      $scope.dp_mincut_to = $("#dp_mincut_to").val();
      $scope.dp_mincut_from = $("#dp_mincut_from").val();
    }

    $scope.getVisitWebForms = function (
      formIdentifier,
      formSelectedOptName,
      formOptionsName
    ) {
      if ($("#dp_visit_from").val() === "") {
        setUpVisitDatePickers();
      } else {
        $scope.dp_visit_from = $("#dp_visit_from").val();
        $scope.dp_visit_to = $("#dp_visit_to").val();
      }
      var options = {};
      options.visit_start = _stringToDate($scope.dp_visit_from);
      options.visit_end = _stringToDate($scope.dp_visit_to);
      //options.parameter_id    = null;
      //options.parameter_type  = null;
      //options.feature_type    = true;
      if (mc.visit_filters.length > 0) {
        for (var i = 0; i < mc.visit_filters.length; i++) {
          for (var key in mc.visit_filters[i]) {
            options[key] = mc.visit_filters[i][key];
          }
        }
      }
      log(
        "getVisitWebForms(" +
          formIdentifier +
          "," +
          formSelectedOptName +
          "," +
          formOptionsName +
          "," +
          mc.pol_id +
          "," +
          mc.pol_id_name +
          ")",
        "info",
        options
      );
      //display visits
      formsSewernet.getVisitsFromFeature(
        mapToc.getMarkedLayerAsActive(),
        mc.pol_id,
        mc.pol_id_name,
        options,
        function (err, msg) {
          if (err) {
            log(
              "getVisitsFromFeature on getVisitWebForms callback",
              "error",
              msg
            );
            notifyEvent(err, "error", true);
          } else {
            log(
              "getVisitsFromFeature on getVisitWebForms callback",
              "success",
              msg
            );
            mc.visitData_options = msg.visits;
            mc.visitData_filters = null;
            if (typeof msg.filters != "undefined")
              mc.visitData_filters = msg["filters"];

            applyChangesToScope();
          }
        }
      );
      /*
    Display events
    formsSewernet.getWebFormsForVisit(formIdentifier,mc.pol_id,mc.pol_id_name,options,function(err,msg){

        if(err){
          log("getVisitWebForms callback","error",msg);
          notifyEvent(err,"error",true);
        }else{
          log("getVisitWebForms callback","success",msg);
          mc['parameter_type_options']   = msg.parameter_type_options;
          mc['parameter_type']           = msg.parameter_type;
          mc['parameter_id_options']     = msg.parameter_id_options;
          mc['parameter_id']             = msg.parameter_id;
          mc['visitData_options']       = msg.visitData_options;
          var layerProperties           = mapToc.getLayerProperties(mapToc.getMarkedLayerAsActive());
          mc.layerVisitable = layerProperties.visitable;
          applyChangesToScope();
        }
      });*/
    };

    $scope.openEventForm = function (event_id, parameter_id) {
      log("openEventForm(" + event_id + "," + parameter_id + ")", "info");
      hidePreviousForms();
      formsSewernet.getEventFormTypeAndEvent(
        parameter_id,
        mc.pol_id,
        mc.pol_id_name,
        mapFactory.getCurrentLayerName(),
        function (err, response) {
          if (err) {
            log("getEventFormTypeAndEvent callback", "error", response);
            notifyEvent(response, "error", true);
          } else {
            log("getEventFormTypeAndEvent callback", "success", response);
            mc.event_parameter_id = response.event.parameter_id.id;
            mc.pointAttributtes = response.event;
            mc.event_id = response.event_id;
            var formAndTab = formsSewernet.getFormByFormId(response.formType);
            var layerProperties = mapToc.getLayerProperties(
              mapFactory.getCurrentLayerName()
            );
            mc.layerVisitable = layerProperties.visitable;
            displayForm(mc.pol_id_name, response.formType, formAndTab);
            mc.pointPhotos = Array();
          }
          applyChangesToScope();
        }
      );
    };

    $scope.getElement = function (element) {
      log("getElement()", "info", element);
      var err = 0;
      if (typeof element.sys_table_id == "undefined") {
        log("getElement no sys_table_id", "error");
        notifyEvent("no sys_table_id", "error", true);
        err++;
      }
      if (typeof element.sys_idname == "undefined") {
        log("getElement no sys_idname", "error");
        notifyEvent("no sys_idname", "error", true);
        err++;
      }
      if (typeof element.sys_id == "undefined") {
        log("getElement no sys_id", "error");
        notifyEvent("no sys_id", "error", true);
        err++;
      }
      if (err === 0) {
        var layer = mapToc.getLayerNameByLayerTable(element.sys_table_id);
        getInfoForm(
          layer,
          element.sys_table_id,
          element.sys_idname,
          element.sys_id,
          true,
          null
        );
      }
    };

    $scope.openDoc = function (path, hash, fextension) {
      log("openDoc()", "info", {
        path: path,
        fextension: fextension,
        hash: hash,
      });
      var urlToOpen = null;
      if (typeof hash == "undefined") {
        if (typeof path != "undefined") {
          urlToOpen = path;
        }
      } else {
        urlToOpen = getBaseUrl() + "external.image.php?img=" + hash;
        if (
          fextension == "doc" ||
          fextension == "pdf" ||
          fextension == "txt" ||
          fextension == "rtf" ||
          fextension == "odt" ||
          fextension == "svg"
        ) {
          urlToOpen =
            getBaseUrl() +
            "external.doc.php?img=" +
            hash +
            "&fextension=" +
            fextension;
        }
      }
      if (urlToOpen) {
        window.open(urlToOpen);
      } else {
        notifyEvent("no link o file identifier", "error", true);
      }
    };

    $rootScope.openDoc = $scope.openDoc;

    $scope.getConnect = function () {
      log("getConnect()", "info");
      var upstream;
      var downstream;
      mc["node1"] = null;
      mc["node2"] = null;
      mc["connect_related_options"] = null;
      mc["upstream_options"] = null;
      mc["downstream_options"] = null;

      formsSewernet.getWebFormsForConnect(
        mapFactory.getCurrentLayerName(),
        mc.pol_id,
        mc.pol_id_name,
        function (err, msg) {
          if (err) {
            log("getConnect callback", "error", err);
            notifyEvent("Error requesting connect", "error", true);
          } else {
            log("getConnect callback", "success", msg);
            //upstream
            if (msg.upstream) {
              mc["upstream_options"] = msg.upstream;
            }
            if (msg.downstream_label) {
              mc["downstream_label"] = msg.downstream_label;
            }
            if (msg.upstream_label) {
              mc["upstream_label"] = msg.upstream_label;
            }
            //downstream
            if (msg.downstream) {
              mc["downstream_options"] = msg.downstream;
            }
            if (msg.table) {
              mc["connect_related_options"] = msg.table;
            }
            if (msg.node1) {
              mc["node1"] = msg.node1;
            }
            if (msg.node2) {
              mc["node2"] = msg.node2;
            }
            applyChangesToScope();
          }
        }
      );
    };

    $scope.openConnect = function (wich) {
      log("openConnect() ->", "info", wich);
      var err = 0;
      if (typeof wich.sys_table_id == "undefined") {
        log("openConnect no sys_table_id", "error");
        notifyEvent("no sys_table_id", "error", true);
        err++;
      }
      if (typeof wich.sys_idname == "undefined") {
        log("openConnect no sys_idname", "error");
        notifyEvent("no sys_idname", "error", true);
        err++;
      }
      if (typeof wich.sys_id == "undefined") {
        log("openConnect no sys_id", "error");
        notifyEvent("no sys_id", "error", true);
        err++;
      }
      if (err === 0) {
        getInfoForm(
          mapToc.getLayerNameByLayerTable(wich.sys_table_id),
          wich.sys_table_id,
          wich.sys_idname,
          wich.sys_id,
          true,
          null
        );
      }
    };

    $scope.getWebForms = function (
      formIdentifier,
      formSelectedOptName,
      formOptionsName,
      tabName
    ) {
      mc[formOptionsName] = [];
      mc[formSelectedOptName] = null;
      dogetWebForms(
        formIdentifier,
        formSelectedOptName,
        formOptionsName,
        mc.pol_id,
        mc.pol_id_name,
        tabName,
        function (err, msg) {
          if (err) {
            log("getWebForms callback", "error", msg, err);
            notifyEvent(msg, "error", true);
          } else {
            log("getWebForms callback", "success", msg);
            if (msg.length > 0) {
              mc[formOptionsName] = msg;
              //mark first option as selected
              mc[formSelectedOptName] = mc[formOptionsName][0];
            }
          }
          applyChangesToScope();
        }
      );
    };

    function dogetWebForms(
      formIdentifier,
      formSelectedOptName,
      formOptionsName,
      pol_id,
      pol_id_name,
      tabName,
      cb
    ) {
      log(
        "dogetWebForms(" +
          formIdentifier +
          "," +
          formSelectedOptName +
          "," +
          formOptionsName +
          "," +
          pol_id +
          "," +
          pol_id_name +
          "," +
          tabName +
          ")",
        "info"
      );
      formsSewernet.getWebForms(
        formIdentifier,
        mapFactory.getCurrentLayerName(),
        pol_id,
        pol_id_name,
        tabName,
        function (err, msg) {
          cb(err, msg);
        }
      );
    }

    //******************    FORMS INFO - TAB FILES   *********************

    $scope.getTabFiles = function () {
      log("getTabFiles", "info", mc.tabFiles);
      let currentLayer = mapToc.getMarkedLayerAsActive();

      formsSewernet
        .getInfoFiles(
          mc.pol_id,
          mc.pol_id_name,
          currentLayer,
          mapToc.getTableNameByLayerName(currentLayer)
        )
        .then((msg) => {
          log("getTabFiles callback", "success", msg);
          mc.tabFilesFields = msg.data.fields;
          mc.btAcceptTabFiles = true;
          applyChangesToScope();
        })
        .catch((e) => {
          log("getTabFiles callback", "error", e);
        });
    };

    $scope.setFeatureFile = function () {
      log("setFeatureFile", "info");
      let photos = [];
      if (mc.pointPhotos.length > 0) {
        for (var i = 0; i < mc.pointPhotos.length; i++) {
          let link = `${baseHref}external.doc.php?img=`;
          if (
            mc.pointPhotos[i].fextension === "png" ||
            mc.pointPhotos[i].fextension === "jpg" ||
            mc.pointPhotos[i].fextension === "gif"
          ) {
            link = `${baseHref}external.image.php?img=`;
          }
          var photo = {
            photo_url: link,
            hash: mc.pointPhotos[i].photo_id,
            fextension: mc.pointPhotos[i].fextension,
          };
          photos.push(photo);
        }
      }
      var deviceTrace = {
        xcoord: null,
        ycoord: null,
        compass: null,
      };
      if (mc.point_coordinates) {
        if (typeof mc.point_coordinates == "object") {
          deviceTrace = {
            xcoord: mc.point_coordinates[0],
            ycoord: mc.point_coordinates[1],
            compass: mc.heading,
          };
        } else {
          deviceTrace = {
            xcoord: point_coordinates_str[0],
            ycoord: point_coordinates_str[1],
            compass: mc.heading,
          };
        }
      }

      formsSewernet
        .setFeatureFile(
          mc.pol_id,
          mc.pol_id_name,
          info_type,
          mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive()),
          photos,
          deviceTrace
        )
        .then((msg) => {
          log("setFeatureFile callback", "success", msg);
          mc.pointPhotos = Array();
          $scope.getTabFiles();
          applyChangesToScope();
        })
        .catch((e) => {
          log("setFeatureFile callback", "error", e);
        });
    };

    //******************    END FORMS INFO - TAB FILES   *********************

    $scope.backButtonClicked = function () {
      log("backButtonClicked()", "info", { formId: mc.formId });
      if (typeof mc.formId != "undefined") {
        formsSewernet.removeFormHistory(mc.formId);
        var formAndTab = formsSewernet.getFormHistory();
        log("backButtonClicked display form", "info", formAndTab);
        //redo request for form
        if (typeof formAndTab.action != "undefined") {
          if (formAndTab.action === "renderPointInfoActive") {
            var layer_db_table = mapToc.getTableNameByLayerName(
              formAndTab.layer
            );
            if (typeof layer_db_table != "undefined") {
              getInfoForm(
                formAndTab.layer,
                layer_db_table,
                formAndTab.layer_id_name,
                formAndTab.pol_id,
                true,
                formAndTab.data
              );
            } else {
              hidePreviousForms();
            }
          } else if (formAndTab.action === "getInfoFormFromCoordinates") {
            //formsSewernet.removeFormHistory(formAndTab.formId);
            if (mc.point_coordinates) {
              getInfoFormFromCoordinates(
                mc.point_coordinates[0],
                mc.point_coordinates[1],
                false
              );
            } else {
              hidePreviousForms();
            }
          } else if (formAndTab.action === "addVisit") {
            $scope.addVisit(mc.visit_id);
          } else {
            displayForm(
              formAndTab.layer_id_name,
              formAndTab.formId,
              formAndTab
            );
          }
        } else {
          displayForm(formAndTab.layer_id_name, formAndTab.formId, formAndTab);
        }
      } else {
        hidePreviousForms();
      }
    };

    //*******************          VISITS        *********************
    $scope.addVisit = function () {
      log("addVisit()", "info");
      hidePreviousForms();
      mc.btAddVisit = false;
      var mapData = mapFactory.getMapData();
      mc.code = "";
      mc.visit_id = null;
      mc.events = null;
      formsSewernet.upsertVisit(
        mapFactory.getCurrentLayerName(),
        mapFactory.getclickedCooordinates(),
        mapData.epsg,
        mc.pol_id,
        mc.pol_id_name,
        function (err, msg) {
          if (err) {
            log("addVisit callback", "error", msg);
            notifyEvent(JSON.stringify(msg), "error", true);
          } else {
            log("addVisit in upsertVisit callback", "success", msg);
            mc["visitcat_id_options"] = msg.visitcat_id_options;
            mc["visitcat_id"] = msg.visitcat_id;
            mc.visit_id = msg.visit_id;
            mc.events = msg.events;
            mc.code = msg.code;
            //mark radio button isDone
            markRadioButtonVisitIsDone(msg.visit_isDone);
            mc.parameter_type_options = msg.parameter_type_options;
            mc.parameter_type = msg.parameter_type;
            mc.parameter_id = msg.parameter_id;
            mc.parameter_id_options = msg.parameter_id_options;
            var formAndTab = formsSewernet.getFormByFormId("F21");
            formAndTab.action = "addVisit"; //for back button
            displayForm(mc.pol_id_name, "F21", formAndTab);
            applyChangesToScope();
          }
        }
      );
    };

    function markRadioButtonVisitIsDone(is_done) {
      log("markRadioButtonVisitIsDone(" + is_done + ")", "info");
      if (is_done == "f" || !is_done || is_done == 0) {
        mc.visit_suspended = true;
        mc.visit_done = false;
      } else {
        mc.visit_suspended = false;
        mc.visit_done = true;
      }
    }

    $scope.clickRadioVisitIsDone = function (what) {
      log("clickRadioVisitIsDone(" + what + ")", "info");
      markRadioButtonVisitIsDone(what);
      $scope.updateVisit("is_done", what);
    };

    $scope.updateVisit = function (key, value) {
      log("updateVisit(" + key + "," + value + ")", "info");
      var mapData = mapFactory.getMapData();
      formsSewernet.updateVisit(
        mapFactory.getCurrentLayerName(),
        mc.visit_id,
        key,
        value,
        mc.pol_id,
        mc.pol_id_name,
        function (err, msg) {
          if (err) {
            log("updateVisit callback", "error", msg);
            notifyEvent(msg, "error", true);
          } else {
            log("updateVisit callback", "success", msg);
            if (typeof msg.geometry != "undefined" && msg.geometry != "") {
              let geoElements = msg.geometry.split(",");
              for (let i = 0; i < geoElements.length; i++) {
                //converion to ol.geom
                var format = new ol.format.WKT({});
                var rawGeometry = format.readGeometry(geoElements[i], {
                  dataProjection: mapData.epsg,
                  featureProjection: mapData.epsg,
                });
                mapFactory.addTemporalGeometry(rawGeometry, "local", 1);
              }
            }
            notifyEvent(
              notifications_strings.NOTIFICATION_VISIT_UPDATED,
              "success",
              true
            );
          }
          applyChangesToScope();
        }
      );
    };

    function resetVisitManagerDatePickers() {
      $("#dp_visit_manager_from").datepicker("destroy");
      $("#dp_visit_manager_from").val("");
      $("#dp_visit_manager_to").datepicker("destroy");
      $("#dp_visit_manager_to").val("");
      var dateForFrom = _setDateForDatePicker(-60, "month");
      $("#dp_visit_manager_from").datepicker({
        dateFormat: "dd-mm-yy",
        defaultDate: dateForFrom.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true,
      });
      $("#dp_visit_manager_from").datepicker("setDate", dateForFrom.dateForDp);

      var dateForTo = _setDateForDatePicker(+1, "day");
      $("#dp_visit_manager_to").datepicker({
        dateFormat: "dd-mm-yy",
        defaultDate: dateForTo.dateObj,
        dayNamesMin: _dpDayNames,
        changeYear: true,
      });
      $("#dp_visit_manager_to").datepicker("setDate", dateForTo.dateForDp);

      $scope.dp_visit_manager_from = $("#dp_visit_manager_from").val();
      $scope.dp_visit_manager_to = $("#dp_visit_manager_to").val();
    }
    $scope.openVisitManager = function () {
      resetVisitManagerDatePickers();
      log("openVisitManager()", "info");
      getVisitsFromFeature();
    };
    $scope.getVisitsFromFeature = function () {
      getVisitsFromFeature();
    };
    function getVisitsFromFeature() {
      log("getVisitsFromFeature()", "info");
      mc.visit_id = null;
      mc["visitData_options"] = [];
      var options = {};
      options.visit_start = _stringToDate($scope.dp_visit_manager_from);
      options.visit_end = _stringToDate($scope.dp_visit_manager_to);

      options.feature_type = true;
      let formIdentifier = formsSewernet.getTableFromLayer_id_name(
        "F25",
        mc.pol_id_name
      );
      formsSewernet.getVisitsFromFeature(
        mapFactory.getCurrentLayerName(),
        mc.pol_id,
        mc.pol_id_name,
        options,
        function (err, msg) {
          if (err) {
            log(
              "getVisitsFromFeature on openVisitManager callback",
              "error",
              msg
            );
            notifyEvent(err, "error", true);
          } else {
            hidePreviousForms();
            log(
              "getVisitsFromFeature on openVisitManager callback",
              "success",
              msg
            );

            mc["visitData_options"] = msg["visits"];
            var formAndTab = formsSewernet.getFormByFormId("F25");
            formAndTab.action = "openVisitManager"; //for back button
            mc.tabInfo = null; //hide default info tab
            displayForm(mc.pol_id_name, "F25", formAndTab);
            applyChangesToScope();
          }
        }
      );
    }

    $scope.selectVisit = function (visit_id) {
      log("selectVisit(" + visit_id + ")", "info");
      //unmark/mark selected visit
      for (var i = 0; i < mc["visitData_options"].length; i++) {
        $("#li_visit_" + i).removeClass("active");
        if (mc["visitData_options"][i].sys_id === visit_id) {
          $("#li_visit_" + i).addClass("active");
        }
      }
      mc.visit_id = visit_id;
      if ($rootScope.visit_version == "1") {
        $scope.openVisit();
      } else {
        $rootScope.feature = [];
        $rootScope.gwGetVisit({}, null, true);
      }
    };

    $scope.openVisit = function () {
      log("openVisit() - selected visit_id:", "info", mc.visit_id);
      if (mc.visit_id != null) {
        $scope.addVisit(mc.visit_id);
      }
    };

    $scope.deleteVisit = function () {
      log("deleteVisit() - selected visit_id", "info", mc.visit_id);
      if (mc.visit_id != null) {
        if (
          confirm(mapFactory.getLocalizedStringValue("CONFIRM_DELETE_VIST"))
        ) {
          formsSewernet.deleteVisit(
            mc.visit_id,
            mapFactory.getCurrentLayerName(),
            function (err, result) {
              if (err) {
                log("deleteVisit callback", "error", err);
                notifyEvent(err, "error", true);
              }
              if (result) {
                $scope.openVisitManager();
              } else {
                log("error in deleteVisit", "error");
              }
            }
          );
        }
      }
    };
    //*******************          END VISITS     *********************

    //*******************          EVENTS        *********************
    function cleanFields() {
      mc.pointAttributtes = null;
      mc.event_parameter_id = "";
      mc.position_id = null;
      mc.position_value = "";
      mc.geom1 = "";
      mc.geom2 = "";
      mc.geom3 = "";
      mc.event_value = "";
      mc.value1 = "";
      mc.value2 = "";
      mc.text = "";
      mc.event_id = null;
      mapFactory.photosReset();
      mc.pointPhotos = Array();
    }

    $scope.addEvent = function () {
      log("addEvent() - parameter_id:", "info", mc.parameter_id);
      cleanFields();
      //hide parameter_id select
      mc.select_parameter_type = false;
      mc.event_parameter_id = mc.parameter_id;
      try {
        if (typeof mc.parameter_id != "undefined") {
          if (mc.parameter_id.id !== null) {
            formsSewernet.getEventFormTypeAndEvent(
              mc.event_parameter_id,
              mc.pol_id,
              mc.pol_id_name,
              mapFactory.getCurrentLayerName(),
              function (err, response) {
                if (err) {
                  log("getEventFormType callback", "error", response);
                  notifyEvent(JSON.stringify(response), "error", true);
                  return;
                }
                log(
                  "getEventFormType in addEvent callback",
                  "success",
                  response
                );
                var formAndTab = formsSewernet.getFormByFormId(
                  response.formToDisplay
                );
                var layerProperties = mapToc.getLayerProperties(
                  mapFactory.getCurrentLayerName()
                );
                mc.layerVisitable = layerProperties.visitable;
                mc.fields = response.fields;
                displayForm(mc.pol_id_name, response.formToDisplay, formAndTab);
                applyChangesToScope();
              }
            );
            hidePreviousForms();
          } else {
            log("AddEvent parameter id error", "error", mc.parameter_id);
            notifyEvent("AddEvent parameter id error", "error", true);
          }
        } else {
          log("AddEvent parameter id error", "error", mc.parameter_id);
          notifyEvent("AddEvent parameter id error", "error", true);
        }
      } catch (e) {
        log("AddEvent error", "error", e);
        notifyEvent("Add event error: " + e, "error", true);
      }
    };

    $scope.showParameterTypeSelect = function () {
      log("showParameterTypeSelect()", "info");
      //show hide select
      if (mc.select_parameter_type) {
        mc.select_parameter_type = false;
      } else {
        mc.select_parameter_type = true;
      }
    };

    $scope.changeParameterType = function () {
      log("showParameterTypeSelect()", "info");
      formsSewernet.getParameterIdFromParameterType(
        mapFactory.getCurrentLayerName(),
        mc.parameter_type,
        mc.pol_id_name,
        function (err, response) {
          if (err) {
            log("showParameterTypeSelect callback", "error", err);
            notifyEvent(JSON.stringify(err), "error", true);
          } else {
            log("showParameterTypeSelect callback", "success", response);
            mc.parameter_id = response[0].id;
            mc.parameter_id_options = response;
            mc.select_parameter_type = false; //hide select
            applyChangesToScope();
          }
        }
      );
    };

    $scope.submitEvent = function () {
      log("submitEvent() fomId: " + mc.formId, "info", mc.pointAttributtes);
      var photosAndCompasses = mapFactory.photosGetLists();
      formsSewernet.insertEvent(
        mapFactory.getCurrentLayerName(),
        mc.visit_id,
        mc.pol_id,
        mc.pol_id_name,
        $rootScope.feature,
        mc.formId,
        photosAndCompasses.photos,
        photosAndCompasses.compasses,
        function (err, response) {
          if (err) {
            log("submitEvent callback", "error", response, err);
            notifyEvent(response.message, "error", true);
          } else {
            notifyEvent(
              notifications_strings.NOTIFICATION_EVENT_ADDED,
              "success",
              true
            );
            cleanFields();
            $scope.addVisit(mc.visit_id);
          }
        }
      );
    };

    $scope.getEvent = function (event_id) {
      log("getEvent(" + event_id + ")", "info");
      if ($rootScope.visit_version == "1") {
        cleanFields();
        hidePreviousForms();
        formsSewernet.getEvent(
          mapFactory.getCurrentLayerName(),
          event_id,
          mc.pol_id,
          mc.pol_id_name,
          function (err, response) {
            if (err) {
              log("getEvent callback", "error", response, err);
              notifyEvent(response, "error", true);
            } else {
              log("getEvent callback", "success", response);
              mc.event_id = event_id;
              var formAndTab = formsSewernet.getFormByFormId(
                response.formToDisplay
              );
              mc.fields = response.fields;
              mc.photos = response.event_data.photos;
              mc.btAddVisit = false;
              var layerProperties = mapToc.getLayerProperties(
                mapFactory.getCurrentLayerName()
              );
              mc.layerVisitable = layerProperties.visitable;
              //  mc.deleteBt             = false;
              displayForm(mc.pol_id_name, response.formToDisplay, formAndTab);
              applyChangesToScope();
            }
          }
        );
      }
    };

    $scope.updateEvent = function (key, value) {
      if (mc.event_id != null) {
        log("updateEvent(" + key + "," + value + ")", "info");
        var mapData = mapFactory.getMapData();
        formsSewernet.updateEvent(
          mapFactory.getCurrentLayerName(),
          mc.event_id,
          key,
          value,
          mc.pol_id,
          mc.pol_id_name,
          function (err, msg) {
            if (err) {
              log("updateEvent callback", "error", msg, err);
              notifyEvent(msg, "error", true);
            } else {
              log("updateEvent callback", "success", msg);
              notifyEvent(
                notifications_strings.NOTIFICATION_EVENT_UPDATED,
                "success",
                true
              );
            }
            applyChangesToScope();
          }
        );
      }
    };

    $scope.deleteEvent = function () {
      log("deleteEvent(): " + mc.event_id, "info");
      if (mc.event_id != null) {
        formsSewernet.deleteEvent(
          mapFactory.getCurrentLayerName(),
          mc.event_id,
          function (err, msg) {
            if (err) {
              log("deleteEvent callback", "error", msg, err);
              notifyEvent(msg, "error", true);
            } else {
              notifyEvent(
                notifications_strings.NOTIFICATION_EVENT_REMOVED,
                "success",
                true
              );
            }
            $scope.addVisit(mc.visit_id);
          }
        );
      }
    };

    $scope.viewGallery = function (type, id) {
      log("viewGallery(" + type + "," + id + ")", "info");
      var formAndTab = formsSewernet.getFormByFormId("F27");
      formAndTab.action = "openVisitManager"; //for back button
      mc.tabInfo = null; //hide default info tab
      mc.gallery = Array();
      formsSewernet.getGallery(
        mapFactory.getCurrentLayerName(),
        type,
        id,
        function (err, msg) {
          if (err) {
            log("viewGallery callback", "error", msg, err);
            notifyEvent(msg, "error", true);
          } else {
            log("viewGallery callback", "success", msg);
            hidePreviousForms();
            mc.gallery = msg.photos;
            mc.event_id = id;
            var layerProperties = mapToc.getLayerProperties(
              mapFactory.getCurrentLayerName()
            );
            mc.layerVisitable = layerProperties.visitable;
            displayForm(mc.pol_id_name, "F27", formAndTab);
            applyChangesToScope();
          }
        }
      );
    };

    $scope.deletePhoto = function (hash) {
      log("deletePhoto(" + hash + ")", "info");
      formsSewernet.deletePhoto(
        mapFactory.getCurrentLayerName(),
        hash,
        function (err, msg) {
          if (err) {
            log("deletePhoto callback", "error", msg, err);
            notifyEvent(msg, "error", true);
          } else {
            log("deletePhoto callback", "success", msg);
            notifyEvent(
              notifications_strings.NOTIFICATION_PHOTO_REMOVED,
              "success",
              true
            );
            $scope.viewGallery("event", mc.event_id);
          }
        }
      );
    };
    //*******************        END EVENTS      *********************

    $scope.displayAttribute = function (attr_name) {
      if (attr_name.substring(0, 4) != "sys_") {
        return true;
      } else {
        return false;
      }
    };

    //****************************************************************
    //*******************      END FORMS INFO    *********************
    //****************************************************************

    //****************************************************************
    //*****************       FORMS FEATURES     *********************
    //****************************************************************

    //receives added/modified geometry from mapFactory
    $scope.$on("notifyGeometry", function (event, data) {
      log("on notifyGeometry", "info", data);
      mc.addedGeometry = data.geometry;
      //  Open review forms
      if (mc.pol_id === null) {
        if (data.type === "Line" || data.type === "LineString") {
          mapFactory.setTool(null);
          $scope.openAddFeautureForm();
        } else if (data.type === "Polygon" || data.type === "MultiPolygon") {
          mapFactory.setTool(null);
          $scope.openAddFeautureForm();
        }
      }
      applyChangesToScope();
    });

    $scope.openAddFeautureForm = function () {
      log(
        "openAddFeautureForm layer: " + mapFactory.getCurrentLayerName(),
        "info"
      );
      mc.pol_id = null;
      mc.pol_id_name = null;
      $rootScope.feature = {};
      if (layerProperties === null) {
        layerProperties = mapToc.getLayerProperties(
          mapToc.getMarkedLayerAsActive()
        );
      }
      //get form name for review layer
      formsSewernet.getInsertFeatureForm(
        mapFactory.getCurrentLayerName(),
        layerProperties.db_table,
        function (err, msg) {
          if (err) {
            log("openAddFeautureForm callback", "error", msg);
            notifyEvent(JSON.stringify(msg), "error", true);
          } else {
            log("openAddFeautureForm callback", "success", msg);
            var formAndTab = {};
            formAndTab.action = "renderReview";
            mc.debugFormName = "Form : F52 Add Feature";
            mc.formId = "F52";
            //select container to display
            mc.formAddfeature = 1;
            currentFormContainer = mc.formAddfeature;
            mc.add_feature_form = msg.fields;
            applyChangesToScope();
          }
        }
      );
    };

    $scope.cancelReviewForm = function () {
      log("cancelReviewForm()", "info");
      mapFactory.setTool(null);
      hidePreviousForms();
      mapFactory.clearAddPoint();
      mapFactory.cleanGeometries("all");
      mc.pol_id_name = null;
      mc.pol_id = null;
      $rootScope.addPointDisabled = true;
      $rootScope.addLineDisabled = true;
      $rootScope.addPolygonDisabled = true;
      mapToc.userCanEditLayer(mapFactory.getCurrentLayerName());
    };

    $scope.submitInsertFeatureForm = function () {
      log("submitInsertFeatureForm()", "info", $rootScope.feature);
      mapFactory.setTool(null, true);
      formsSewernet.insertFeature(
        mapFactory.getCurrentLayerName(),
        layerProperties.db_table,
        mc.epsg,
        $rootScope.feature,
        mc.addedGeometry,
        function (err, msg) {
          if (err) {
            log("submitInsertFeatureForm callback", "error", msg, err);
            notifyEvent(msg, "error", true);
          } else {
            log("submitInsertFeatureForm callback", "success", msg);
            notifyEvent(
              notifications_strings.NOTIFICATION_FEATURE_ADDED,
              "success",
              true
            );
            $rootScope.feature = {};
            mapFactory.setTool(null);
            hidePreviousForms();
            mapFactory.clearAddPoint();
            applyChangesToScope();
            mapFactory.reloadLayer(mapToc.getMarkedLayerAsActive());
          }
        }
      );
    };

    //TBR
    function getReview() {
      log("getReview()", "info");
      //get form name for review layer
      formsSewernet.getReview(
        mapFactory.getCurrentLayerName(),
        mc.pol_id_name,
        mc.pol_id,
        function (err, msg) {
          if (err) {
            log("getReview callback", "error", msg, err);
            notifyEvent(msg, "error", true);
          } else {
            log("getReview callback", "success", msg);
            var formAndTab = formsSewernet.getFormByFormId(msg.formToDisplay);
            formAndTab.action = "renderReview";
            mc.debugFormName =
              "Form review: " + formAndTab.formId + " " + formAndTab.formName;
            mc.formId = formAndTab.formId;
            //select container to display
            mc[formAndTab.formParent] = 1;
            currentFormContainer = formAndTab.formParent;
            mc.edit_feature_form = msg.fields;
            mc.editBt = true;
            applyChangesToScope();
          }
        }
      );
    }
    //END TBR
    $scope.deleteFeature = function () {
      if (confirm(notifications_strings.CONFIRM_DELETE)) {
        deleteFeature();
      }
    };

    function deleteFeature() {
      log("deleteFeature()", "info", { layerProperties: layerProperties });
      if (layerProperties.db_table === null) {
        layerProperties = mapToc.getLayerProperties(
          mapFactory.getCurrentLayerName()
        );
      }
      formsSewernet.deleteFeature(
        mapFactory.getCurrentLayerName(),
        layerProperties.db_table,
        mc.pol_id_name,
        mc.pol_id,
        function (err, msg) {
          if (err) {
            log("deleteFeature callback", "error", msg, err);
            notifyEvent(msg, "error", true);
          } else {
            log("deleteFeature callback", "success", msg);
            notifyEvent(
              notifications_strings.NOTIFICATION_FEATURE_REMOVED,
              "success",
              true
            );
            $rootScope.feature = {};
            mapFactory.setTool(null);
            mapFactory.cleanGeometries("all");
            hidePreviousForms();
            mapFactory.reloadLayer(mapFactory.getCurrentLayerName());
            $rootScope.addPointDisabled = true;
            $rootScope.addLineDisabled = true;
            $rootScope.addPolygonDisabled = true;
            mc.pol_id_name = null;
            mc.pol_id = null;
            mapToc.userCanEditLayer(mapFactory.getCurrentLayerName());
            applyChangesToScope();
          }
        }
      );
    }

    $scope.updateFeature = function (key, value) {
      //if(value!=""){
      if (
        mc.pol_id != null &&
        mapToc.userCanEditLayer(mapFactory.getCurrentLayerName())
      ) {
        log("updataeFeature(" + key + "," + value + ")", "info", {
          layerProperties: layerProperties,
        });
        var mapData = mapFactory.getMapData();
        if (layerProperties.db_table === null) {
          //getMarkedLayerAsActive
          layerProperties = mapToc.getLayerProperties(
            mapFactory.getCurrentLayerName()
          );
        }
        formsSewernet.updateFeature(
          mapFactory.getCurrentLayerName(),
          layerProperties.db_table,
          key,
          value,
          mc.pol_id,
          mc.pol_id_name,
          function (err, msg) {
            if (err) {
              log("updateFeature callback", "error", msg, err);
              notifyEvent(msg, "error", true);
            } else {
              log("updateFeature callback", "success", msg);
              notifyEvent(
                notifications_strings.NOTIFICATION_FEATURE_UPDATED,
                "success",
                true
              );
            }
            applyChangesToScope();
          }
        );
      }
      //}
    };

    function updateFeatureGeometry() {
      log("updateFeatureGeometry()", "info", mc.pol_id);
      if (mc.pol_id != null) {
        var mapData = mapFactory.getMapData();
        formsSewernet.updateFeatureGeometry(
          mapFactory.getCurrentLayerName(),
          layerProperties.db_table,
          mc.epsg,
          mc.pol_id,
          mc.pol_id_name,
          mc.addedGeometry,
          function (err, msg) {
            if (err) {
              log("updateFeatureGeometry callback", "error", msg, err);
              notifyEvent(msg, "error", true);
            } else {
              log("updateFeatureGeometry callback", "success", msg);
              notifyEvent(
                notifications_strings.NOTIFICATION_FEATURE_UPDATED,
                "success",
                true
              );
              mapFactory.cleanGeometries("all");
              mapFactory.highlightSelectedFeature(mc.addedGeometry);
              mc.editBt = true;
              mapFactory.reloadDisplayedLayers();
            }
            applyChangesToScope();
          }
        );
      }
    }

    //****************************************************************
    //*****************    END FORMS FEATURES    *********************
    //****************************************************************

    //****************************************************************
    //*****************          SEARCH          *********************
    //****************************************************************

    $scope.getSearchForm = function () {
      if (mapFactory.getOnlineStatus()) {
        log("getSearchForm()", "info");
        hidePreviousForms();
        mc.clickedButton = "search";
        mc.formName = notifications_strings.SEARCH;
        formsSewernet.resetFormHistory();
        formsSewernet.getSearchForm(function (err, msg) {
          if (err) {
            log("getSearchForm callback", "error", msg);
            notifyEvent(JSON.stringify(msg), "error", true);
          } else {
            log("getSearchForm callback", "success", msg);
            $rootScope.feature = {};
            mc.filterTabs = msg;
            mc.activeTab = msg.activeTab;
            mapFactory.cleanGeometries("all");
            mc.formFilters = true;
            applyChangesToScope();
            _selectActiveTab(msg.activeTab.activeTabIndex, "dynamicForm");
          }
        });
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };

    $rootScope.getTypeAheadDataAction = function (
      tabName,
      fieldName,
      action,
      val,
      searchService,
      dataSet
    ) {
      if (action === "getDataForAddress") {
        var md = mapFactory.getMapData();
        var searchExtent = ol.proj
          .transformExtent(
            md.extent,
            ol.proj.get(md.epsg),
            ol.proj.get("EPSG:4326")
          )
          .toString();
        return formsSewernet
          .getDataForAddress(searchExtent, val, searchService)
          .then(function (result) {
            log("getTypeAheadDataAction getDataForAddress", "success", result);
            return result;
          });
      } else if (action === "updateSearch") {
        return formsSewernet
          .updateSearch($rootScope.feature, tabName, fieldName, val)
          .then(function (result) {
            if (result.status === "Failed") {
              log(
                "getTypeAheadDataAction updateSearch",
                "error",
                result.message
              );
              return false;
            } else {
              log("getTypeAheadDataAction updateSearch", "success", result);
              if (tabName === "address") {
                //for tab address, enable/disable `add_postnumber` field
                $rootScope.$broadcast("formField_disabled", {
                  name: "add_postnumber",
                  disabled: true,
                  value: "",
                });
              }
              return result;
            }
          });
      } else if (action === "updateSearchAdd") {
        return formsSewernet
          .updateSearchAdd($rootScope.feature, tabName, fieldName, val)
          .then(function (result) {
            if (result.status === "Failed") {
              log(
                "getTypeAheadDataAction updateSearchAdd",
                "error",
                result.message
              );
              return false;
            } else {
              log("getTypeAheadDataAction updateSearchAdd", "success", result);
              return result;
            }
          });
      } else if (action === "updatemincut_add") {
        return formsSewernet
          .updateMincutAdd($rootScope.feature, tabName, fieldName, val)
          .then(function (result) {
            if (result.status === "Failed") {
              log(
                "getTypeAheadDataAction updateMincutAdd",
                "error",
                result.message
              );
              return false;
            } else {
              log("getTypeAheadDataAction updateMincutAdd", "success", result);
              return result;
            }
          });
      } else if (action === "dataset") {
        return formsSewernet
          .searchDataSet(val, dataSet, $rootScope.feature)
          .then(function (result) {
            if (result.status === "Failed") {
              log("getTypeAheadDataAction dataset", "error", result.message);
              return false;
            } else {
              log("getTypeAheadDataAction dataset", "success", result);
              return result;
            }
          });
      } else {
        log(
          "getTypeAheadDataAction action " + action + " not defined",
          "error"
        );
      }
    };

    $rootScope.selectTypeAheadAction = function (action, item, model, label) {
      log("selectTypeAheadAction(" + action + ")", "info", item);
      if (action === "selectAddress") {
        selectAddress(item);
      } else if (action === "selectStreet") {
        //for tab address, enable/disable `add_postnumber` field
        $rootScope.$broadcast("formField_disabled", {
          name: "add_postnumber",
          disabled: false,
          value: "",
        });
        if (item.st_astext != null) {
          mapFactory.zoomToHiglightedFeature(item.st_astext);
        }
      } else if (action === "select_updatemincut_add") {
        updateMincutManager();
      } else if (action === "setWidgetValue") {
        log("" + action, "success", item);
      } else {
        log("" + action, "success", item);
        //check required parameters
        var errForGIF = 0; //error for getInfoForm (GIF)
        var errString = "Missing paramaters: ";
        if (typeof item.sys_table_id == "undefined") {
          errForGIF++;
          errString += "no sys_table_id ";
        }
        if (typeof item.sys_idname == "undefined") {
          errForGIF++;
          errString += "no sys_idname ";
        }
        if (typeof item.sys_id == "undefined") {
          errForGIF++;
          errString += "no sys_id ";
        }
        var err = errForGIF;
        if (errForGIF > 0) {
          errString = "Missing paramaters: ";
          //check if sys_x and sys_y are defined
          if (typeof item.sys_x == "undefined") {
            err++;
            errString += "no sys_x ";
          }
          if (typeof item.sys_x == "undefined") {
            err++;
            errString += "no sys_x ";
          }
        }

        if (err === 0) {
          var item_layer = mapToc.getLayerNameByLayerTable(item.sys_table_id);
          if (
            typeof item.sys_y != "undefined" &&
            typeof item.sys_x != "undefined"
          ) {
            mapFactory.addresschosen([item.sys_x, item.sys_y], true);
          }
          if (errForGIF === 0) {
            getInfoForm(
              item_layer,
              item.sys_table_id,
              item.sys_idname,
              item.sys_id,
              true,
              {}
            );
          }
        } else {
          notifyEvent(errString, "error", true);
        }
      }
    };

    function selectAddress(item) {
      log("selectAddress()", "info", item);
      var coordinates;
      if (typeof item.sys_y != "undefined") {
        item.lat = item.sys_y;
      }
      if (typeof item.sys_x != "undefined") {
        item.lon = item.sys_x;
      }
      if (typeof item.srid != "undefined") {
        if (item.srid === mc.epsg) {
          coordinates = [parseFloat(item.lon), parseFloat(item.lat)];
        } else {
          coordinates = ol.proj.fromLonLat(
            [parseFloat(item.lon), parseFloat(item.lat)],
            mc.epsg
          );
        }
      } else {
        coordinates = ol.proj.fromLonLat(
          [parseFloat(item.lon), parseFloat(item.lat)],
          mc.epsg
        );
      }
      mapFactory.addresschosen(coordinates, true);
    }

    //****************************************************************
    //*****************         END SEARCH       *********************
    //****************************************************************

    //****************************************************************
    //*****************            PRINT         *********************
    //****************************************************************

    $scope.getPrint = function () {
      if (mapFactory.getOnlineStatus()) {
        log("getPrint()", "info");
        hidePreviousForms();
        mc.clickedButton = "print";
        mc.formName = notifications_strings.PRINT;
        mapFactory
          .getWMSProjectSettings("ComposerTemplate")
          .then(function (result) {
            formsSewernet.getPrintForm(result, function (err, msg) {
              if (err) {
                log("getPrint callback", "error", msg, err);
                notifyEvent(msg, "error", true);
              } else {
                log("getPrint callback", "success", msg);
                $rootScope.feature = {};
                mc.filterTabs = msg;
                mc.activeTab = msg.activeTab;
                mapFactory.cleanGeometries("all");
                mc.formFilters = true;
                applyChangesToScope();
              }
            });
          });
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };

    function printAction(generateComposer) {
      if (mapFactory.getOnlineStatus()) {
        var md = mapFactory.getMapData();
        log("printAction(" + generateComposer + ")", "info");
        if (generateComposer) {
          notifyEvent(notifications_strings.GENERATING_PRINT, "success", true);
        }

        formsSewernet.updatePrint(
          $rootScope.feature,
          md.currentExtent.toString(),
          mc.use_tiled_background,
          function (err, msg) {
            if (err) {
              log("printAction", "error", msg, err);
              notifyEvent(msg, "error", true);
            } else {
              log("printAction callback", "success", msg);
              doHighlightGeom(msg);
              printing = true;
              if (generateComposer) {
                //format layer names for print
                let tiledLayers = Array();
                let filters = Array();
                let totalChecked = 0;
                var layersDisplayed = mapFactory.getLayersDisplayed();
                if (msg.tiledLayers) {
                  if (
                    layersDisplayed.length === 0 &&
                    msg.tiledLayers.length === 0
                  ) {
                    doPrintComposer();
                  }
                  for (let i = 0; i < msg.tiledLayers.length; i++) {
                    let layer_name = mapToc.getLayerNameByLayerTable(
                      msg.tiledLayers[i]
                    );
                    if (layer_name != "false" && layer_name != false)
                      tiledLayers.push(layer_name);
                    totalChecked++;
                    if (
                      totalChecked ===
                      layersDisplayed.length + msg.tiledLayers.length
                    ) {
                      //if(layersDisplayed.length===0){
                      doPrintComposer();
                    }
                  }
                }
                var layersDisplayed = mapFactory.getLayersDisplayed();
                for (let i = 0; i < layersDisplayed.length; i++) {
                  if (layersDisplayed[i]) {
                    if (
                      layersDisplayed[i] != "false" &&
                      layersDisplayed[i] != false
                    ) {
                      tiledLayers.push(layersDisplayed[i]);
                    }
                    mapFactory
                      .getLayerFilters(layersDisplayed[i])
                      .then((msgFilters) => {
                        filters.push(`${layersDisplayed[i]}:${msgFilters}`);
                        totalChecked++;
                        if (
                          totalChecked ===
                          layersDisplayed.length + msg.tiledLayers.length
                        ) {
                          doPrintComposer();
                        }
                      });
                  }
                }

                function doPrintComposer() {
                  log("doPrintComposer", "info", {
                    fiters: filters,
                    tiledLayers: tiledLayers,
                  });
                  formsSewernet.printComposer(
                    msg.composerName,
                    msg.extent,
                    msg.map,
                    tiledLayers.toString(),
                    filters.join(";"),
                    function (err, msg) {
                      if (err) {
                        log("printAction", "error", msg, err);
                        notifyEvent(msg, "error", true);
                      }
                    }
                  );
                }
              }
            }
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }
    //****************************************************************
    //*****************          END PRINT       *********************
    //****************************************************************

    //****************************************************************
    //****************        DATE SELECTOR        *******************
    //****************************************************************

    $scope.getDatesForm = function () {
      if (mapFactory.getOnlineStatus()) {
        log("getDatesForm()", "info");
        hidePreviousForms();
        mc.clickedButton = "dateSelector";
        mc.formName = notifications_strings.PRINT;
        formsSewernet.getDatesForm(
          mc.use_tiled_background,
          function (err, msg) {
            if (err) {
              log("getDatesForm callback", "error", msg, err);
              notifyEvent(String(err), "error", true);
            } else {
              log("getDatesForm callback", "success", msg);

              $rootScope.feature = {};
              mc.filterTabs = msg;
              mc.activeTab = msg.activeTab;
              mapFactory.cleanGeometries("all");
              mc.formFilters = true;
              applyChangesToScope();
            }
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };

    function setFilterDate() {
      if (mapFactory.getOnlineStatus()) {
        log("setFilterDate()", "info", $rootScope.feature);
        formsSewernet.setFilterDate($rootScope.feature, function (err, msg) {
          if (err) {
            log("setFilterDate", "error", err);
            notifyEvent(msg, "error", true);
          } else {
            log("setFilterDate callback", "success", msg);
            if (
              typeof $rootScope.feature.date_from != "undefined" &&
              typeof $rootScope.feature.date_to != "undefined"
            ) {
              if (typeof $rootScope.feature.date_from == "string") {
                var splitDate = $rootScope.feature.date_from.split(" ");
                splitDate = splitDate[0].split("-");
                var DateFrom = new Date(
                  splitDate[1] + "-" + splitDate[2] + "-" + splitDate[0]
                );
              } else {
                DateFrom = $rootScope.feature.date_from;
              }
              if (typeof $rootScope.feature.date_to == "string") {
                var splitDate = $rootScope.feature.date_to.split(" ");
                splitDate = splitDate[0].split("-");
                var Date_to = new Date(
                  splitDate[1] + "-" + splitDate[2] + "-" + splitDate[0]
                );
              } else {
                Date_to = $rootScope.feature.date_to;
              }
              mapFactory.setInitEndDates(DateFrom, Date_to);
            }
            mapFactory.reloadDisplayedLayers();
            hidePreviousForms();
          }
        });
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }
    //****************************************************************
    //*************       END DATE SELECTOR       *********************
    //****************************************************************

    //****************************************************************
    //*****************            MINCUT        *********************
    //****************************************************************

    //******************* mincut tab on info
    $scope.getInfoMincut = function () {
      if (mapFactory.getOnlineStatus()) {
        blockUI.start(notifications_strings.ONPROCESS);
        log("getInfoMincut()", "info");
        mc.mincutData = Array();
        //timestamps DatePickers
        if ($("#dp_mincut_from").val() === "") {
          setUpVisitDatePickers();
        } else {
          $scope.dp_mincut_from = $("#dp_mincut_from").val();
          $scope.dp_mincut_to = $("#dp_mincut_to").val();
        }
        var toDate = _stringToDate($scope.dp_mincut_to);
        var fromDate = _stringToDate($scope.dp_mincut_from);
        formsSewernet.getInfoMincut(
          mc.pol_id_name,
          mc.pol_id,
          fromDate,
          toDate,
          function (err, msg) {
            if (err) {
              log("getInfoMincut", "error", msg, err);
              notifyEvent(msg, "error", true);
              return false;
            }
            log("getInfoMincut callback", "success", msg);
            if (typeof msg.mincuts != "undefined") {
              mc.mincutData = msg.mincuts;
            }
            blockUI.reset();
            applyChangesToScope();
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };
    //******************* end mincut tab on info

    function getMincutFromMincutManager(mincut_id_arg, x, y, id_name) {
      mc.point_coordinates = Array(x, y);
      formsSewernet.setId_name_mincut(id_name);
      getMincut(mincut_id_arg);
    }

    //******************* mincut form
    $scope.getMincut = function (mincut_id_arg) {
      getMincut(mincut_id_arg);
    };

    function getMincut(mincut_id_arg) {
      if (mapFactory.getOnlineStatus()) {
        mapFactory.setMultipleSelect(false);
        enableDefaultButtons();
        blockUI.start(notifications_strings.ONPROCESS);
        log("getMincut()", "info", mincut_id_arg);
        mc.activeTab = null;
        mc.mincutTabs = null;
        mc.mincut_id = mincut_id_arg;
        var x = 0;
        var y = 0;
        if (mc.point_coordinates) {
          x = mc.point_coordinates[0];
          y = mc.point_coordinates[1];
        }

        formsSewernet.getMincut(
          x,
          y,
          mc.epsg,
          mincut_id_arg,
          formsSewernet.getId_name_mincut(),
          function (err, msg) {
            if (err) {
              log("getMincut", "error", msg, err);
              notifyEvent(msg, "error", true);
              return false;
            }
            log("getMincut callback", "success", msg);
            if (msg.mincut_id) {
              mapFactory.setMincutId(msg.mincut_id);
            }
            renderMincutForm(msg);
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }

    function renderMincutForm(msg) {
      formsSewernet.setMincutValveLayerTableName(null);
      //render mincut valves layers
      if (typeof msg.mincutValveLayer != "undefined") {
        if (typeof msg.mincutValveLayer.layer_table_name != "undefined") {
          formsSewernet.setMincutValveLayerTableName(
            msg.mincutValveLayer.layer_table_name
          );
        }
      }
      if (formsSewernet.getMincutValveLayerTableName()) {
        var mincutLayer = mapToc.getLayerNameByLayerTable(
          formsSewernet.getMincutValveLayerTableName()
        );
        if (mapFactory.getLayersDisplayed().indexOf(mincutLayer) === -1) {
          mapToc.setActiveLayer(
            mapToc.getObjectLayerByLayerName(mincutLayer),
            mapToc.getLayerIndex(mincutLayer)
          );
          mapToc.markActiveLayer(mincutLayer);
          setTimeout(function () {
            mapFactory.setActiveLayer(mincutLayer);
            //highLightGeometry
            doHighlightGeom(msg);
          }, 200);
        }
      } else {
        notifyEvent("No mincutValveLayer on response", "error", true);
      }
      $rootScope.feature = [];
      mc.activeTab = msg.activeTab;
      mc.mincutTabs = msg.formTabs;
      mc.formMincut = true;
      mc.formName = msg.formInfo.formName;
      mc.formId = msg.formInfo.formId;
      if (msg.mincut_id != "FALSE") {
        mapFactory.reloadDisplayedLayers();
      }
      //highLightGeometry
      doHighlightGeom(msg);
      blockUI.reset();
      applyChangesToScope();
      _selectActiveTab(msg.activeTab.activeTabIndex, "dynamicForm_formMincut");
    }

    $rootScope.newMincut = function () {
      log("newMincut()", "info");
      formsSewernet.setId_name_mincut(mc.pol_id_name);
      formsSewernet.setPol_id_mincut(mc.pol_id);
      hidePreviousForms();
      getMincut(null);
    };
    //******************* end mincut form

    //******************* manage mincut
    $rootScope.manageMincut = function () {
      if (mapFactory.getOnlineStatus()) {
        log("manageMincut()", "info");
        hidePreviousForms();
        formsSewernet.getMincutManager(function (err, msg) {
          if (err) {
            log("manageMincut", "error", msg, err);
            notifyEvent(msg, "error", true);
            return false;
          }
          log("manageMincut callback", "success", msg);
          renderMincutManagerForm(msg);
        });
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };

    function updateMincutManager() {
      if (mapFactory.getOnlineStatus()) {
        log("updateMincutManager()", "info", mc.activeTab);
        var tabName = mc.activeTab;
        formsSewernet.updateMincutManager(
          $rootScope.feature,
          tabName,
          function (err, msg) {
            if (err) {
              log("updateMincutManager", "error", msg, err);
              notifyEvent(msg, "error", true);
              return false;
            }
            log("updateMincutManager callback", "success", msg);
            renderMincutManagerForm(msg);
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }

    function renderMincutManagerForm(msg) {
      $rootScope.feature = [];
      mc.filterTabs = msg;
      mc.activeTab = msg.activeTab.tabName;
      mc.formName = msg.formName;
      mc.clickedButton = "mincut";
      mc.formFilters = true;
      applyChangesToScope();
      _selectActiveTab(msg.activeTab.activeTabIndex, "dynamicForm");
    }
    //******************* end manage mincut

    //******************* upsert mincut
    $scope.upsertMincut = function () {
      if (mapFactory.getOnlineStatus()) {
        var selectedData = mapFactory.getMultipleData();
        var pol_ids = Array();
        var tableName = null; //is used??? TBR
        var id_name = formsSewernet.getId_name_mincut();
        //in case more than one element selected
        if (selectedData.id.length > 1) {
          for (var i = 0; i < selectedData.id.length; i++) {
            pol_ids.push(selectedData.id[i]);
          }
          tableName = selectedData.table[0]; //get table from first selected element
          id_name = selectedData.id_name[0];
        } else {
          pol_ids.push(formsSewernet.getPol_id_mincut());
        }
        var x = null;
        var y = null;
        if (mc.point_coordinates) {
          x = mc.point_coordinates[0];
          y = mc.point_coordinates[1];
        }
        log("upsertMincut()", "info", $rootScope.feature);
        blockUI.start(notifications_strings.ONPROCESS);
        formsSewernet.upsertMincut(
          mc.mincut_id,
          x,
          y,
          mc.epsg,
          id_name,
          pol_ids,
          $rootScope.feature,
          function (err, msg) {
            if (err) {
              log("upsertMincut", "error", msg, err);
              notifyEvent("Mincut error", "error", true);
              blockUI.reset();
              applyChangesToScope();
              return false;
            }
            log("upsertMincut callback", "success", msg);
            if (typeof msg.infoMessage != "undefined") {
              notifyEvent(msg.infoMessage, "success", true);
            } else {
              notifyEvent(
                notifications_strings.NOTIFICATION_MINCUT_INSERT,
                "success",
                true
              );
            }
            mc.mincut_id = msg.mincut_id;
            $rootScope.$broadcast("updateValue", {
              fieldName: "mincut_id",
              value: mc.mincut_id,
            });
            mapFactory.setMincutId(mc.mincut_id);
            if (typeof msg.visibleLayers != "undefined") {
              var dl = mapToc.getDisplayedLayers();
              for (var i = 0; i < msg.visibleLayers.length; i++) {
                var ln = mapToc.getLayerNameByLayerTable(msg.visibleLayers[i]);
                if (ln) {
                  if (dl.indexOf(ln) === -1) {
                    mapToc.addLayer(mapToc.getObjectLayerByLayerName(ln), null);
                  }
                } else {
                  log(
                    "upsertMincut() " +
                      msg.visibleLayers[i] +
                      " doesn't exists in TOC",
                    "error"
                  );
                }
              }
              mapFactory.reloadDisplayedLayers();
            } else {
              mapFactory.reloadDisplayedLayers();
            }
            if (typeof msg.geometry != "undefined") {
              if (msg.geometry.st_astext != null) {
                try {
                  mapFactory.zoomToHiglightedFeature(msg.geometry.st_astext);
                } catch (e) {
                  log(
                    "upsertMincut() error trying to highlight geometry",
                    "warn",
                    e
                  );
                }
              }
            }
            blockUI.reset();
            applyChangesToScope();
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };
    //******************* end upsert mincut

    //******************* exclude mincut
    $scope.setExcludeMincut = function () {
      if (mapFactory.getOnlineStatus()) {
        if (formsSewernet.getExcludingMincut()) {
          log("setExcludeMincut()", "info", false);
          mc.excludingMincut = false;
          formsSewernet.setExcludingMincut(false);
          alterNativeInfo = null;
        } else {
          log("setExcludeMincut()", "info", true);
          mc.excludingMincut = true;
          formsSewernet.setExcludingMincut(true);
        }
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    };

    function excludeFromMincut(valve_id) {
      if (mapFactory.getOnlineStatus()) {
        log("excludeFromMincut(" + valve_id + ")", "info", mc.mincut_id);
        blockUI.start(notifications_strings.ONPROCESS);
        formsSewernet.excludeFromMincut(
          valve_id,
          mc.mincut_id,
          function (err, msg) {
            if (err) {
              log("excludeFromMincut", "error", msg, err);
              notifyEvent(msg, "error", true);

              return false;
            }
            log("excludeFromMincut callback", "success", msg);
            formsSewernet.processGetMincut(msg, function (err, response) {
              renderMincutForm(response);
            });
            applyChangesToScope();
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }
    //******************* end exclude mincut
    function startMincut(mincut_id) {
      if (mapFactory.getOnlineStatus()) {
        log("startMincut(" + mincut_id + ")", "info");
        blockUI.start(notifications_strings.ONPROCESS);
        formsSewernet.startMincut(mincut_id, function (err, msg) {
          if (err) {
            log("startMincut", "error", msg, err);
            notifyEvent(msg.message, "error", true);
            blockUI.reset();
            return false;
          }
          log("startMincut callback", "success", msg);
          formsSewernet.processGetMincut(msg, function (err, response) {
            renderMincutForm(response);
          });
          applyChangesToScope();
        });
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }

    function endMincut(mincut_id) {
      if (mapFactory.getOnlineStatus()) {
        log("endMincut(" + mincut_id + ")", "info");
        blockUI.start(notifications_strings.ONPROCESS);
        formsSewernet.endMincut(
          mincut_id,
          formsSewernet.getId_name_mincut(),
          formsSewernet.getPol_id_mincut(),
          $rootScope.feature,
          function (err, msg) {
            if (err) {
              log("endMincut", "error", msg, err);
              notifyEvent(msg, "error", true);
              return false;
            }
            log("endMincut callback", "success", msg);
            formsSewernet.processGetMincut(msg, function (err, response) {
              renderMincutForm(response);
            });
            applyChangesToScope();
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }

    //****************************************************************
    //*****************          END MINCUT      *********************
    //****************************************************************

    //****************************************************************
    //***************    SET FORM COORDINATES     ********************
    //****************************************************************

    function setFormCoordinates(x, y) {
      if (mapFactory.getOnlineStatus()) {
        log(
          "setFormCoordinates(" + x + "," + y + ") action: " + alterNativeInfo,
          "info"
        );
        formsSewernet.setFormCoordinates(
          x,
          y,
          mc.epsg,
          mapFactory.getResolution(),
          formIdForAlternativeInfo,
          mc.mincut_id,
          function (err, msg) {
            if (err) {
              log("setFormCoordinates", "error", msg, err);
              notifyEvent(msg, "error", true);
              return false;
            }
            log("setFormCoordinates callback", "success", msg);
            mc.btEndBlockAction = 0;
            alterNativeInfo = null;
            formIdForAlternativeInfo = null;
            formsSewernet.processGetMincut(msg, function (err, response) {
              renderMincutForm(response);
            });
            applyChangesToScope();
          }
        );
      } else {
        notifyEvent(
          notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,
          "warning",
          true
        );
      }
    }

    //****************************************************************
    //**************    END SET FORM COORDINATES    ******************
    //****************************************************************

    //****************************************************************
    //**************                GO2EPA          ******************
    //****************************************************************
    $scope.go2epa = () => {
      log("go2epa()", "info");
      let msg = formsSewernet.getgo2epa();
      mc.clickedAction = null;
      $rootScope.feature = [];
      mc.activeTab = msg.activeTab;
      mc.filterTabs = msg.formTabs;
      mc.formFilters = true;
      mc.formName = msg.formName;
      mc.formId = msg.formId;
      applyChangesToScope();
      _selectActiveTab(0, "dynamicForm");
    };

    //****************************************************************
    //**************            END GO2EPA          ******************
    //****************************************************************

    //****************************************************************
    //**************               HELPERS          ******************
    //****************************************************************

    function renderApiMessage(msg) {
      var lev = "success";
      if (typeof msg != "undefined") {
        if (typeof msg.level != "undefined") {
          if (msg.level == "1") {
            lev = "warning";
          } else if (msg.level == "2") {
            lev = "error";
          }
        }
        if (typeof msg.text != "undefined") {
          notifyEvent(msg.text, lev, true);
        }
      }
    }

    function _selectActiveTab(index, selector) {
      var li = $("." + selector);
      li.removeClass("active");
      li.hide();
      try {
        var li = $("." + selector).eq(index);
        li.show();
      } catch (e) {
        log("Error selecting first tab on form", "error", e);
      }
      applyChangesToScope();
    }

    $rootScope.buttonAction = function (action, fieldName) {
      log("buttonAction(" + action + "," + fieldName + ")", "info");
      mc.clickedAction = action;
      if (action === "printAction") {
        printAction(true);
      } else if (action === "captureScreenAction") {
        blockUI.start(notifications_strings.GENERATING_PRINT);
        formsSewernet.captureScreen(mapFactory.getMap(), function (err, msg) {
          setTimeout(function () {
            blockUI.reset();
            applyChangesToScope();
          }, 100);
          if (err) {
            notifyEvent(msg, "warning", true);
            return;
          }
        });
      } else if (action === "mincutLocation") {
        formIdForAlternativeInfo = mc.formId; //store formId
        mc.btEndBlockAction = 1;
        alterNativeInfo = "setCoordinates";
        hidePreviousForms();
      } else if (action === "mincutEndMincut") {
        endMincut(mc.mincut_id);
      } else if (action === "mincutStartMincut") {
        startMincut(mc.mincut_id);
      } else if (action === "filterDateAction") {
        setFilterDate();
      } else if (action === "gwSetVisit") {
        $rootScope.gwSetVisit();
      } else if (action === "closePointInfo") {
        try {
          var method = eval(action);
          method();
        } catch (e) {
          log("buttonAction method error " + action, "warn", e);
        }
      } else if (action === "gwGetLot") {
        var dataForFunction = {
          featureType: "visit",
          tableName: "om_visit_lot",
          idName: "id",
          id: null,
        };
        $rootScope.gwGetLot(dataForFunction);
      } else if (action === "gwSetLot") {
        $rootScope.gwSetLot();
      } else if (action === "gwSetFileInsert") {
        $scope.addPicture("upload");
      } else if (action === "gwGetVisitManager") {
        mc.formParameters.form.navigation = {
          currentActiveTab: mc.activeTab.tabName,
          clickedAction: action,
        };
        $rootScope.gwGetVisitManager(mc.formParameters.form.navigation);
      } else if (action === "backButtonClicked") {
        $scope.backButtonClicked();
      } else if (action === "gwSetVisitManagerEnd") {
        $rootScope.gw_api_setvisitmanagerend(mc.formParameters);
      } else if (action === "gwSetVisitManagerStart") {
        $rootScope.gw_api_setvisitmanagerstart(mc.formParameters);
      } else if (action === "gwSetVisitManager") {
        $rootScope.gwSetVisitManager(mc.formParameters, null);
      } else if (action === "gwSetVehicleLoad") {
        $rootScope.gwSetVehicleLoad();
      } else if (action === "gwSetInterval") {
        $rootScope.gw_fct_setunitinterval();
      } else if (action === "deleteFeature") {
        $scope.deleteFeature();
      } else if (action === "notifyAction") {
        $rootScope.buildNotification();
      } else if (action === "accessControlAction") {
        $rootScope.accessControlAttempt();
      } else if (action === "setgo2epa") {
        blockUI.start("Executant...");
        formsSewernet
          .setgo2epa($rootScope.feature)
          .then((msg) => {
            log("setgo2epaSS", "success", msg);
            blockUI.start("Simulació finalitzada");
            setTimeout(() => {
              blockUI.reset();
              applyChangesToScope();
            }, 3000);
            hidePreviousForms();
          })
          .catch((e) => {
            log("setgo2epa", "error", e);
            blockUI.start("Simulació finalitzada");
            setTimeout(() => {
              blockUI.reset();
              applyChangesToScope();
            }, 3000);
            hidePreviousForms();
          });
      } else if (action === "setmultiupdate") {
        $rootScope.setmultiupdate();
      }
    };

    $scope.deleteAction = function (item) {
      log("deleteAction()", "info", item);
      if (item.actionFunction === "gwSetDelete") {
        if (mc.global_sys_id != null) {
          var dataToDelete = {
            featureType: item.actionTable.feautureType,
            tableName: item.actionTable.tableName,
            idName: item.actionTable.idName,
            id: mc.global_sys_id,
          };
          mc.global_sys_id = null;
          $rootScope.gwSetDelete(dataToDelete);
        }
      }
    };

    $rootScope.widgetAction = function (action, fieldName, value) {
      log(
        "widgetAction(" + action + "," + fieldName + "," + value + ")",
        "info",
        $rootScope.feature
      );
      if (action === "gwGetVisit") {
        if (typeof mc.activeTab != "undefined") {
          mc.formParameters.form.navigation = {
            currentActiveTab: mc.activeTab.tabName,
          };
        }
        $rootScope.gwGetVisit(mc.formParameters, null, false);
      } else if (action === "gwGetVisitManager") {
        if (typeof mc.activeTab != "undefined") {
          mc.formParameters.form.navigation = {
            currentActiveTab: mc.activeTab.tabName,
          };
        }
        $rootScope.gwGetVisitManager(mc.formParameters, null, false);
      } else if (action === "gwSetVehicleParameter") {
        if (typeof mc.activeTab != "undefined") {
          mc.formParameters.form.navigation = {
            currentActiveTab: mc.activeTab.tabName,
          };
        }
        $rootScope.gw_api_setvehicleload(mc.formParameters, null, false);
      } else if (action === "notificationSelectedRole") {
        $rootScope.notificationSelectedRole(value);
      } else if (action === "notificationSelectedUser") {
        $rootScope.notificationSelectedUser(value);
      }
    };

    $rootScope.selectAction = function (item) {
      log("selectAction()", "info", item.actionFunction);
      if (item.actionFunction === "gwGetVisit") {
        if (mc.global_sys_id != null) {
          mc.visit_id = mc.global_sys_id;
          $rootScope.feature = [];
          mc.formFeatureData = null;
          mc.formPagination = null;
          $rootScope.gwGetVisit({}, null, true);
        }
      } else if (item.actionFunction === "gwGetLot") {
        if (mc.global_sys_id != null) {
          var dataForFunction = {
            featureType: "visit",
            tableName: "om_visit_lot",
            idName: "id",
            id: mc.global_sys_id,
          };
          $rootScope.gwGetLot(dataForFunction);
        }
      }
    };

    //set sys_id global from form lists. When you select an element from a list component, we store its sys_id
    $rootScope.setGlobal_sys_id = function (sys_id) {
      log("setGlobal_sys_id(" + sys_id + ")");
      mc.global_sys_id = sys_id;
    };

    $scope.cancelAction = function () {
      log("cancelAction() action: " + alterNativeInfo, "info");
      if (alterNativeInfo === "setCoordinates") {
        setFormCoordinates(null, null);
      }
    };

    $rootScope.cleanInputs = function (data, type) {
      return formsSewernet.cleanInputs(data, type);
    };

    $rootScope.validateInput = function (data, type) {
      return formsSewernet.validateInput(data, type);
    };

    $rootScope.getLocatedString = function (key) {
      return notifications_strings[key];
    };

    $rootScope.closeTools = function () {
      //hides tool bar on mobile when a button is clicked
      $("#menuToolsMobile").toggleClass("open closed");
      $(".menu-tools .tools").toggleClass("open closed");
      $(".bottom-sheet").toggleClass("with-side-tools-open");
    };

    $rootScope.executeUpdate = function (action, key, value, geometry) {
      $rootScope.$broadcast("executeUpdate", {
        action: action,
        key: key,
        value: value,
        geometry: geometry,
      });
      if (action === "updateVisit") {
        $scope.updateVisit(key, value);
      } else if (action === "updateEvent") {
        $scope.updateEvent(key, value);
      } else if (action === "updateFeature") {
        $scope.updateFeature(key, value);
      } else if (action === "updateFilters") {
        $scope.updateFilters(key, value);
      } else if (action === "searchTown") {
        mapFactory.zoomToHiglightedFeature(geometry);
      } else if (action === "getMincut") {
        getMincutFromMincutManager(
          value.sys_id,
          value.sys_x,
          value.sys_y,
          value.sys_id_name
        );
        mapFactory.reloadDisplayedLayers();
        //zoom to coordinates
        mapFactory.addresschosen([value.sys_x, value.sys_y], false);
      } else if (action === "gw_fct_updateprint") {
        printAction(false);
      } else if (action === "updateMincutManager") {
        updateMincutManager();
      } else if (action === "gwGetVisitManager") {
        if (typeof mc.activeTab != "undefined") {
          mc.formParameters.form.navigation = {
            currentActiveTab: mc.activeTab.tabName,
          };
        }
        $rootScope.gwGetVisitManager(mc.formParameters, null, false);
      } else if (action === "gwGetVisit") {
        if (typeof mc.activeTab != "undefined") {
          mc.formParameters.form.navigation = {
            currentActiveTab: mc.activeTab.tabName,
          };
        }
        $rootScope.gwGetVisit(mc.formParameters, null, false);
      } else if (action === "applyVisitFilters") {
        var fil = {};
        fil[key] = value;
        mc.visit_filters.push(fil);
        $scope.getVisitWebForms(
          mc.visitSelectorForWebForms,
          "visitData",
          "visitData_options"
        );
      } else {
        //console.error("action not defined",action)
      }
    };

    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    $scope.setActiveTab = function (activeTab, action) {
      log("setActiveTab(" + activeTab + ")", "info", action);
      var currentActiveTab = mc.activeTab.tabName;
      //$rootScope.feature  = [];
      mc.activeTab = activeTab;
      var method;
      if (typeof action != "undefined") {
        if (action.name === "gwGetVisit") {
          method = $rootScope.gwGetVisit;
        } else if (action.name === "gwGetVisitManager") {
          method = $rootScope.gwGetVisitManager;
        } else {
          method = eval(action.name);
        }

        try {
          //$rootScope.feature  = [];
          action.parameters.form.navigation = {
            currentActiveTab: currentActiveTab,
          };
          log(
            "setActiveTab calling method " + action.name,
            "info",
            action.parameters
          );
          method(action.parameters);
        } catch (e) {
          log(
            "setActiveTab(" +
              activeTab +
              ") method " +
              action.name +
              " not defined",
            "warn",
            e
          );
        }
      }
    };

    function enableDefaultButtons() {
      log("enableDefaultButtons", "info", null);
      $rootScope.polygonSelectDisabled = false;
      $rootScope.multipleSelectDisabled = false;
    }

    function setUpControllers() {
      //controllers
      var dataForControllers = {
        mc: mc,
        baseHref: baseHref,
        token: token,
        env: env,
        email: email,
        strings: notifications_strings,
        project_id: project_id,
        offline_background: offline_background,
        offlineLogin: offlineLogin,
        off_download_data: off_download_data,
        off_download_data_ttl: off_download_data_ttl,
        urlWMS: urlWMS,
        info_type: info_type,
        geom_colors: geom_colors,
        sharedModules: {
          mapFactory: mapFactory,
          formsSewernet: formsSewernet,
          mapToc: mapToc,
          login: _login,
          Bgs: Bgs,
        },
        sharedMethods: {
          log: logExternal,
          getInfoForm: getInfoForm,
          applyChangesToScope: applyChangesToScope,
          displayMapError: displayMapError,
          notifyEvent: notifyEvent,
          hidePreviousForms: hidePreviousForms,
          _selectActiveTab: _selectActiveTab,
          hidePreviousForms: hidePreviousForms,
          doHighlightGeom: doHighlightGeom,
          renderApiMessage: renderApiMessage,
        },
      };
      angular
        .module("app")
        .expandControllerTable($scope, $rootScope, blockUI, dataForControllers);
      angular
        .module("app")
        .expandControllerVisits(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerOffline(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerFilters(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerNotifications(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerAccessControl(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerPhotos(
          $scope,
          $rootScope,
          blockUI,
          fileReader,
          cfpLoadingBar,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerMultiUpdate(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerFlowtrace(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );
      angular
        .module("app")
        .expandControllerProfile(
          $scope,
          $rootScope,
          blockUI,
          dataForControllers
        );

      if (mc.autologout) {
        angular
          .module("app")
          .expandControlleAutologout(
            $scope,
            $rootScope,
            blockUI,
            dataForControllers
          );
      }
    }
  }
})();
