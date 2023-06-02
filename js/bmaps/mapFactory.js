(function () {
  //'use strict';
  /**
 * Factory for map

 
 Version: 2.0.0
 March 2016

	******************************************************************************************************

	Available methods:

	- init
			initializes map module
				@param _env (string) 'env' or 'prod' -> for logging purposes
				@param _urlWMS  (string) url for WMS/WFS requests
				@param _urlWMTS (string) url for WMTS requests
				@param _token  (string) token for cross site injection protection
				@param _project  (object) JSON object with project properties
				@param _app_name (string) for logging purposes
				@param _useGeolocation  (boolean)
				@param _max_feature  (int) max number of return features in multiple selection
				@param touchDevice (int)
				@param notifications_strings (Object) localized strings
	- resize
			Updates map size (for responsive methods)

	- addLayer
			Add a layer to map (makes WMS request)
				@param layer_name (string) layer name

	- removeLayer
			Removes a layer from map
				@param layer_name (string) layer name

	- doWMSInfo
			does WMS info
				@param coordinates (array)

	- getMapData
			Returns a JSON with map info (epsg,extent,layers,layersVars,activeLayer)

	- getWMSProjectSettings
			Returns ProjectSettings from WMS

				@param setting (string) xml node name to retrive
				@return promise

	- setTool
			Select tool for map interaction
				@param tool (string) tool name: point,LineString,Polygon,selectMore,measureLine,selectArea
				@param option additional parameters for a tool

	- setActiveLayer
			Sets active layer
				@param layer_name (string) layer name

	- getActiveLayer
			returns active layer index

	- getActiveLayerName
			returns active layer name

	- reloadLayer
			reloads a layer
				@param layer_name (string) layer name

	- reloadDisplayedLayers
			reloads all displayed layers

	- getLayersDisplayed
			returns array with layers displayed in map

	- getOLLayersDisplayed
			returns array with OL layers displayed in map - Open Layers object!!

	- renderBackground
			Renders background map
				@param ol source
				@param container (string) first o second background

	- getBackgroundSource
			gets background source
				@param container {string} - 'main' or 'secondary'

	-	setTiledOverBackground
			Sets tiled second background
				@param what (boolean)
				@param 	layer (string)
				@param  matrixSet (string)
				@param extent_filter

	- setUseGeolocation
			Activates/desactivates geolocation method
				@param what (boolean)

	- setMaxFeatures
			Sets  max number of return features in multiple selection
				@param number (int)

	- setSocket
			Sets websocket connection status
				@param status (int)

	- getLayerAttributes
			obtains layer availables attributes names
				@param layer (string)

	- addSocketGeometry
			Adds a geometry when websocket event is received
				@param geom (string) geometry in ol.format.WKT
				@param geomProjection (string)
				@param layer_name (string)
				@param source (string) - 'socket' or 'local'

	- addTemporalGeometry
			Adds a temporal geometry for highlight something
				@param geom (string) geometry in ol.format.WKT
				@param source (string) - 'socket' or 'local'
				@param removeAfter (int milliseconds) - if > 0 removes after milliseconds removes the added geometry

	- setanimateFeature
			sets flag animateFeature for force explosion animation
			@param what (Boolean)

	- highlightSelectedFeature
			Higlights a selectedFeature
					@param geom (string) geometry in OL string

	- doInfoFromCoordinates
			Simulates a select point from given coordinates
				@param coordinates (Array(float x, float y))
				@param feauture_id (string) OPTIONAL
				@param layers (string) OPTIONAL - list of all layers in toc, for filtering query

	- featureDeleted
			Event received when a feature is deleted. Renders in map the geometry
				@param geom (string) geometry in ol.format.WKT

	- cleanGeometries
			Cleans added geometries
				@param what (string) what to clean

	- resetAddTools
			Calls mapAddTool resetAddTools for cancel adding element

	- addPoint
			Starts addPoint at mapAddTool

	- clearAddPoint
			clears addPoint at mapAddTool

	- forceEndDrawing
			when is a drawing tool activated, force "drawEnd" event

	- setInitEndDates
			sets initial and end date for WMS/WFS quert
				@param initDate
				@param endDate

	- setFilters
			sets exploitation and states filter for WMS/WFS
			@param filters (object) containing expl_id(array) and state(array)

	- getFormatedFilterDates
				@returns a JSON with initDate and endDate properties

	- getLayerFilters
				@param layer_name
				@returns a string with the filter for a layer (used for print composer, for example)

	- getPostgresFieldName
			gets postgres field name of an attribute
				@param position (int) array position

	- trackPosition
			tracks user position

	- getHeading
			gets heading from geolocation

	- toogleUsersUbication
			show/hide vector layer with users ubication
				@param users (array) array with user list

	- addFeautureRemoteUser
			adds a feauture with user ubication
				@param user (array) array with user data

	- removeFeautureRemoteUser
			removes a feauture with user ubication
				@param user (array) array with user data

	- updateFeautureRemoteUser
			updates a feauture with user ubication
				@param user (array) array with user data

	- getUsersUbicationVisible
			gets if vector layer with user's ubications is visible or not

	- zoomToExtend
			zoom map to original extend

	- zoomIn
			zooms in one level

	- zoomOut
			zooms out one level

	- getHiglightedFeature
			returns highlighted feauture

	- zoomToHiglightedFeature
			zooms to highLightGeometry

	- setZoomLevelAndCenter:
			sets zoom to a level and centers map on coordinates
			@param level (int)
			@param center (array)

	- getZoomLevel
			returns zoom zoom level

	- getZoomFromResolution
			returns zoom from current view resolution

	- getResolution
			returns OL View resolution

	- extentContainsCoordinates
			checks if map extent contains coordinates

	- toggleCoordinates
			shows/hides mouse position control (coordinates in real time)

	- toggleScale
			shows scaleLine control

  - getPolygonSelect
  		gets polygon drawn for select

  - multipleSelectAddRemoveElement
      adds or removes an element to multiple selectAction

      @param data (json) {'id':int,'id_name':string, 'geometry':string, 'table': string, 'feature': ol.feature}

  - resetMultipleSelect
      resets MultipleSelect data

  - getMultipleData,
      gets multiple select data

      @return data (json) {'id':int,'id_name':string, 'geometry':string, 'table': string, 'feature': ol.feature}

  - setMultipleSelect
      set/unset multiple select option

      @param what (boolean)

  - setMultipleSelectData
  		sets multiple select data, in case is erased and temporary stored we can reset it with this method

  		@param  data (json) {'id':int,'id_name':string, 'geometry':string, 'table': string, 'feature': ol.feature}

  - getMultipleSelect
      gets multiple select status (enabled/disabled)

      @return boolean

	- offlineDownloadGeoJsonLayer
			downloads geojson layer
				@param layer (string)

	- storeOfflineStoreCapabilities
			stores capabilities for offline use

	- storeOfflineStoreProjectInfo
			stores project info for offline use (include user permissions)

	- storeOfflineStrings
			stores UI strings

	- getStrings
			get stored UI strings

	- getOfflineGetCapAndPi
			get stored capabilities and project info

	- getLocalizedStringValue
			returns localized string value
			@param constant (string)- constant name
			@return string

	- addresschosen
			zooms and highlight a feature

			@param coordinates (array) x,y
			@param highlight (boolean)

	- setMincutId
			sets mincut id (used on filters)

			@param mincut_id (integer)

	-	setCurrentLayerTableName
			sets _CurrentLayerTableName

			@param db_table <string>

	- getCurrentLayerTableName
			@return _CurrentLayerTableName

	- getCurrentLayerName
			@return _CurrentLayerName

	- addGeoJson


	******************************************************************************************************

	Available properties:

	- map (ol.Map object)
	- mapSelectTool (select tools module)

	******************************************************************************************************
*/

  angular.module("app").factory("mapFactory", [
    "$http",
    "$rootScope",
    "mapMeasureTools",
    "mapSelectTool",
    "mapAddTool",
    "mapOffline",
    "mapAjaxOperations",
    "mapStorage",
    "mapPhotos",
    function (
      $http,
      $rootScope,
      mapMeasureTools,
      mapSelectTool,
      mapAddTool,
      mapOffline,
      mapAjaxOperations,
      mapStorage,
      mapPhotos
    ) {
      if (!ol) return {};

      var map,
        env,
        epsg,
        extent,
        urlWMS,
        urlWMTS,
        baseHref,
        token,
        project,
        app_name,
        userName,
        zoom_level,
        min_zoom_level = 9,
        online_min_zoom_level = 9,
        max_zoom_level = 25,
        localized_strings = {}, //obj containining localized strings
        appOnline = false, //flag detecting if app is online or offline
        raster = null, //background raster
        second_raster = null, //background raster for second background
        rasterOverBackground = null, //raster for tiled background
        tileRendered = false, //flag for controlling tiled is loaded
        layers = Array(),
        layersVars = Array(),
        chachedLayers = Array(), //array containing layers that have been rendered at least once
        activeLayer = null,
        _CurrentLayerTableName = null, //db table of last selected layer
        _CurrentLayerName = null, //toc name of last selected layer
        filename = "mapFactory.js",
        version = "2.3.0",
        tiled_layer_name = null, //tiled background layer
        tiled_matrixset = null, //tiled background matrixSet
        viewProjection = null,
        viewResolution = null,
        useGeolocation = null,
        geolocation = null, //geolocation object for tools
        max_features = null, //limit of features for queries
        ws_status = 0, //websocket connection status
        onlineBackgroundsource = null, //ol.layer.Tile for background
        onlineSecond_Backgroundsource = null, //ol.layer.Tile for second background
        clickedCooordinates = null,
        editing = false, //flag for knowing if is editing or not
        //offline
        offlineForced = false, //flag for detecting if oflline is forced
        //offline symbology colours and width for lines
        offline_stroke_color = "#3ac82e",
        offline_stroke_width = 3,
        offline_fill_color = "#30d263",
        //offline symbology colours and radius for point
        offline_point_fill = "#32CD32",
        offline_point_radius = 3,
        //tools
        toolSelected = null, //tool selected
        toolMode = null, //tool mode (for measure "line" or "area")
        vectorSource, //source for temporal geometry
        vectorLayer, //layer for temporal geometry
        //geolocatization & tracking position
        trackVectorSource = null, //source for tracking position marker
        trackVectorLayer = null, //layer for tracking position marker
        remoteTrackVectorLayer = null, //layer for remote users tracking
        remoteTrackVectorSource = null, //source for remote tracking position markers
        trackingPosition = null, //ol.Geolocation for tracking position
        geoLocalizedNotificate = false, //flag for notificate geolocated only once
        //when add geometries to map, add temporal geoms for avoid page reload and animation effect
        animateFeature = true, //flag for animation effects or not
        addStyle = null, //temporal point
        duration = 3000, //animation duration
        start = null, //mark for init animation
        measureStyle = null, //style for measureTools
        selectStyle = null, //style for selectTools
        touchDevice = 0, //0 no touch device, 1 touch device (mobiler or tablet)
        _filters = null, //filters for WMS/WFS
        initDate = null, //filter initial date for WMS/WFS
        filter_expl_id = Array(), //filter exploitation for WMS/WFS
        filter_state = Array(), //filter state for WMS/WFS
        filter_mincut = Array(), //filter mincut for WMS/WFS
        lot_id = Array(), //filter lot_id for WMS/WFS
        mincut_id = null, //mincut id used for filters
        endDate = null, //filter end date for WMS/WFS
        layerFieldNames = null, //postgres field names used for edition
        mapToc = null, //mapToc module
        clickDisabled = false, //disable click on map (used for avoid info after double clicks, e.g. addLine)
        genericOfflineStylesLoaded = false, //flag for load or not generic offline style js methods
        genericStyles = null,
        extent_filter = null, //filter for tiles, vinculated to extent request
        geoJsonLayer = false, //flowtrace layer added
        capabilities; //map capabilities

      // public API
      var dataFactory = {
        map: map, // ol.Map
        mapSelectTool: mapSelectTool,
        epsg: epsg,
        init: init,
        resize: resize,
        injectDependency: injectDependency,
        addLayer: addLayer,
        removeLayer: removeLayer,
        doWMSInfo: doWMSInfo,
        getMap: getMap,
        getMapData: getMapData,
        getWMSProjectSettings: getWMSProjectSettings,
        setTool: setTool,
        zoomToExtend: zoomToExtend,
        setExtent: setExtent,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomToHiglightedFeature: zoomToHiglightedFeature,
        setZoomLevelAndCenter: setZoomLevelAndCenter,
        getZoomLevel: getZoomLevel,
        getZoomFromResolution: getZoomFromResolution,
        getResolution: getResolution,
        extentContainsCoordinates: extentContainsCoordinates,
        setActiveLayer: setActiveLayer,
        resetActiveLayer: resetActiveLayer,
        getActiveLayer: getActiveLayer,
        getActiveLayerName: getActiveLayerName,
        getCurrentLayerTableName: getCurrentLayerTableName,
        setCurrentLayerTableName: setCurrentLayerTableName,
        getCurrentLayerName: getCurrentLayerName,
        reloadLayer: reloadLayer,
        reloadDisplayedLayers: reloadDisplayedLayers,
        getLayersDisplayed: getLayersDisplayed,
        getOLLayersDisplayed: getOLLayersDisplayed,
        renderBackground: renderBackground,
        getBackgroundSource: getBackgroundSource,
        setTiledOverBackground: setTiledOverBackground,
        setUseGeolocation: setUseGeolocation,
        setMaxFeatures: setMaxFeatures,
        setSocket: setSocket,
        addSocketGeometry: addSocketGeometry,
        addTemporalGeometry: addTemporalGeometry,
        setanimateFeature: setanimateFeature,
        doInfoFromCoordinates: doInfoFromCoordinates,
        getHiglightedFeature: getHiglightedFeature,
        highlightSelectedFeature: highlightSelectedFeature,
        featureDeleted: featureDeleted,
        getLayerAttributes: getLayerAttributes,
        editGeometry: editGeometry,
        endEditGeometry: endEditGeometry,
        cleanGeometries: cleanGeometries,
        resetAddTools: resetAddTools,
        addPoint: addPoint,
        clearAddPoint: clearAddPoint,
        forceEndDrawing: forceEndDrawing,
        toggleCoordinates: toggleCoordinates,
        toggleScale: toggleScale,
        //multiple/polygon select
        multipleSelectAddRemoveElement: multipleSelectAddRemoveElement,
        resetMultipleSelect: resetMultipleSelect,
        getMultipleData: getMultipleData,
        setMultipleSelect: setMultipleSelect,
        getPolygonSelect: getPolygonSelect,
        getMultipleSelect: getMultipleSelect,
        setMultipleSelectData: setMultipleSelectData,
        //offline module
        offlineConfigure: offlineConfigure,
        offlineReset: offlineReset,
        offlineStartDownload: offlineStartDownload,
        offlineSelectAreaToDownload: offlineSelectAreaToDownload,
        OfllineGetAvailableGeoJson: OfllineGetAvailableGeoJson,
        forceOffline: forceOffline,
        getOnlineStatus: getOnlineStatus,
        offlineShowSavedAreas: offlineShowSavedAreas,
        offlineHideSavedAreas: offlineHideSavedAreas,
        offlineGetInfo: getOfflineInfo,
        storeOfflineStoreCapabilities: storeOfflineStoreCapabilities,
        storeOfflineStoreProjectInfo: storeOfflineStoreProjectInfo,
        storeOfflineStrings: storeOfflineStrings,
        getStrings: getStrings,
        getOfflineGetCapAndPi: getOfflineGetCapAndPi,
        setOnlineMode: setOnlineMode,
        //end offline module
        getclickedCooordinates: getclickedCooordinates,
        setInitEndDates: setInitEndDates,
        setFilters: setFilters,
        getFormatedFilterDates: getFormatedFilterDates,
        getFeatureTypeFromWFS: getFeatureTypeFromWFS,
        getLayerFilters: getLayerFilters,
        getPostgresFieldName: getPostgresFieldName,
        ajaxGetFormDataForVisitForm: ajaxGetFormDataForVisitForm,
        ajaxGetProjectInfo: ajaxGetProjectInfo,
        ajaxAddGeometry: ajaxAddGeometry,
        ajaxUpdateFeatureField: ajaxUpdateFeatureField,
        ajaxDeleteElement: ajaxDeleteElement,
        ajaxAddVisit: ajaxAddVisit,
        ajaxAddVisitInfo: ajaxAddVisitInfo,
        ajaxGetVisit: ajaxGetVisit,
        ajaxRemoveVisit: ajaxRemoveVisit,
        ajaxRemoveEvent: ajaxRemoveEvent,
        ajaxGetVisitInfo: ajaxGetVisitInfo,
        //photos module
        photosSavePicture: photosSavePicture,
        photosAddPhoto: photosAddPhoto,
        photosShowPhoto: photosShowPhoto,
        photosDeletePhoto: photosDeletePhoto,
        photosGetLists: photosGetLists,
        photosReset: photosReset,
        //end photos modules
        addresschosen: addresschosen,
        //geolocation
        trackPosition: trackPosition,
        stopTracking: stopTracking,
        getHeading: getHeading,
        toogleUsersUbication: toogleUsersUbication,
        addFeautureRemoteUser: addFeautureRemoteUser,
        removeFeautureRemoteUser: removeFeautureRemoteUser,
        updateFeautureRemoteUser: updateFeautureRemoteUser,
        getUsersUbicationVisible: getUsersUbicationVisible,
        //end geolocation
        getLocalizedStringValue: getLocalizedStringValue,
        //mincut
        setMincutId: setMincutId,
        addGeoJson,
        removeGeoJsonLayer,
        addGeoJsonLayer,
      };

      return dataFactory;

      //****************************************************************
      //***********************       INIT       ***********************
      //****************************************************************

      function init(
        _env,
        _urlWMS,
        _urlWMTS,
        _token,
        _project,
        _app_name,
        _useGeolocation,
        _max_features,
        _touchDevice,
        options
      ) {
        env = _env;
        urlWMS = _urlWMS;
        urlWMTS = _urlWMTS;
        token = _token;
        project = _project;
        app_name = _app_name;
        useGeolocation = _useGeolocation;
        max_features = _max_features;
        touchDevice = _touchDevice;
        userName = options.userName;
        tiled_layer_name = options.tiled_layer_name;
        tiled_matrixset = options.tiled_matrixSet;
        baseHref = options.baseHref;

        log(
          "init(" +
            _env +
            "," +
            _urlWMS +
            "," +
            _token +
            "," +
            _project +
            "," +
            _app_name +
            "," +
            _useGeolocation +
            "," +
            _max_features +
            "," +
            _touchDevice +
            ")",
          "info",
          options
        );
        //offline init
        mapOffline.init(
          urlWMS,
          touchDevice,
          localized_strings,
          project.id,
          project.project_name,
          options.vidroapi,
          options.vidrotoken
        );
        if (navigator.onLine) {
          log("App online", "info");
          appOnline = true;
        } else {
          log("App offline", "info");
          appOnline = false;
          loadGenericOfflineStyles();
          //$rootScope.$broadcast('appOnline',{status: appOnline});
        }
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOfflineStatus);
        //ajax operations
        mapAjaxOperations.init(token, _app_name);

        //load strings
        if (navigator.onLine) {
          mapAjaxOperations.getLocalizedStrings(function (e, data) {
            if (e === null) {
              log("getLocalizedStrings()", "success", data);
              localized_strings = data;
            } else {
              log("getLocalizedStrings()", "error: " + e, data);
            }
            //send strings to controller
            $rootScope.$broadcast("stringsLoaded", localized_strings);
          });
        } else {
          var offlinestrings = mapOffline.getStrings(project.id);
          if (offlinestrings) {
            //send strings to controller
            $rootScope.$broadcast("stringsLoaded", offlinestrings.strings);
          }
        }

        //photos init
        mapPhotos.init(token, _app_name);
        //get Capabilities
        var parser = new ol.format.WMSCapabilities();
        if (navigator.onLine) {
          log(
            "GetCapabilities() online: " +
              urlWMS +
              "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities",
            "info"
          );
          $http({
            method: "GET",
            url: urlWMS + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities",
          }).success(function (data) {
            capabilities = parser.read(data);
            if (document.getElementById("map")) {
              log("GetCapabilities() online", "success", capabilities);
              renderMap();
            } else {
              alert("No DOM element id='map' present!");
            }
          });
        } else {
          log("GetCapabilities() offline", "info");
          var capa = getOfflineGetCapAndPi(project.id);

          capabilities = capa.capabilities;
          if (document.getElementById("map")) {
            log("GetCapabilities() offline", "success", capabilities);
            renderMap();
          } else {
            alert("No DOM element id='map' present!");
          }
        }
        //keyboard events
        document.addEventListener(
          "keydown",
          function (evt) {
            var e = window.event || evt;
            var key = e.which || e.keyCode;
            if (18 == key) {
              log("Alt pressed", "info");
              setTool("selectArea");
            } else if (16 == key) {
              log("Shift pressed", "info");
              setTool("selectMore");
            }
          },
          false
        );

        document.addEventListener(
          "keyup",
          function (evt) {
            var e = window.event || evt;
            var key = e.which || e.keyCode;
            if (18 == key) {
              log("Alt UNpressed", "info");
              setTool(null);
            } else if (16 == key) {
              log("Shift UNpressed", "info");
              setTool(null);
            }
          },
          false
        );
        //end keyboard events
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      //****************************************************************
      //***********************     RENDER MAP   ***********************
      //****************************************************************

      function renderMap() {
        //sets epsg from capabilities or from db
        if (project.use_capabilities) {
          log("Using capabilities", "info");
          epsg = capabilities.Capability.Layer.BoundingBox[0].crs;
          extent = capabilities.Capability.Layer.BoundingBox[0].extent;
        } else {
          log("Not using capabilities", "info");
          epsg = project.epsg;
          extent = project.extent;
        }
        if (project.use_area_of_interest && project.extent) {
          log("Use area of interest", "info");
          extent = project.extent;
          extent_filter = project.extent_filter;
        }
        log("Extension:", "info", extent);

        var projection = ol.proj.get(epsg);

        //background raster
        raster = new ol.layer.Tile({});
        //second background raster
        if (project.use_double_background) {
          second_raster = new ol.layer.Tile({});
        }
        //zomm level
        if (project.zoom_level) {
          if (parseInt(project.zoom_level) <= max_zoom_level) {
            zoom_level = parseInt(project.zoom_level);
          }
        } else {
          zoom_level = min_zoom_level;
        }
        //min_zoom_level = 17;
        log("Map projection:", "info", projection);
        log("Zoom levels:", "info", {
          min: min_zoom_level,
          max: max_zoom_level,
          zoom_level: zoom_level,
        });

        //sets de view
        var view = new ol.View({
          projection: projection,
          extent: extent,
          center: [extent[0], extent[1]],
          zoom: zoom_level,
          minZoom: min_zoom_level,
          //maxZoom:    max_zoom_level,
          //zoomFactor: 4,
        });

        log("Map epsg:", "info", epsg);

        //remove rotation interactions

        var interactions = ol.interaction.defaults({
          altShiftDragRotate: false,
          pinchRotate: false,
          doubleClickZoom: false,
        });
        //sets the map
        map = new ol.Map({
          target: "map",
          layers: layers,
          interactions: interactions,
          renderer: "canvas",
          //renderer: 		'webgl'
        });
        //adds background rasters
        if (raster) {
          map.addLayer(raster);
        }
        if (second_raster) {
          map.addLayer(second_raster);
        }

        map.setView(view);
        //zoom to extent
        map.getView().fit(extent, map.getSize());
        if (project.use_area_of_interest) {
          log(
            "Constraint zoom to area of interes",
            "info",
            map.getView().getZoom()
          );
          min_zoom_level = map.getView().getZoom();
        }
        //add control zoom to extent
        var zoomToExtentControl = new ol.control.ZoomToExtent({
          extent: extent,
        });

        map.addControl(zoomToExtentControl);

        //stores projection&resoultion in global vars
        viewProjection = view.getProjection();
        viewResolution = view.getResolution();

        //map rendered, broadcast capabilities
        $rootScope.$broadcast("capabilities", capabilities);

        //markers & temporal geometry
        vectorSource = new ol.source.Vector({});
        vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          zIndex: 999,
          updateWhileInteracting: true,
          opacity: 1,
        });

        map.addLayer(vectorLayer);

        //Set styles for overlay geometries
        if (project.geom_colors == undefined) {
          project.geom_colors = {};
          //default colors for select/edit geometries
          project.geom_colors.select_stroke_color = "rgba(0,71,252,1)";
          project.geom_colors.select_fill_color = "rgba(252,0,0,0.72)";
          project.geom_colors.edit_stroke_color = "rgba(0,71,252,1)";
          project.geom_colors.edit_fill_color = "rgba(252,0,0,0.72)";
          project.geom_colors.measure_fill_color = "rgba(255,230,0,0.24)";
          project.geom_colors.measure_stroke_color = "rgba(255,0,0,1)";
          project.polygon_select_stroke_color = "rgb(0, 144, 176)";
          project.polygon_select_fill_color = "rgba(0, 144, 176, 0.15)";
        }
        setStyles(project.geom_colors);
        vectorLayer.setStyle(selectStyle);
        //listener for animate points
        vectorSource.on("addfeature", function (e) {
          if (animateFeature) {
            flash(e.feature);
          }
        });

        //define project projection in proj4
        //proj4.defs("EPSG:25831","+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

        if (useGeolocation === 1) {
          // create a Geolocation object setup to track the position of the device
          geolocation = new ol.Geolocation({
            tracking: true,
            projection: epsg,
          });
        }

        if (parseInt(localStorage.getItem("showCoordinates"))) {
          toggleCoordinates();
        }

        if (parseInt(localStorage.getItem("showScale")) === 1) {
          toggleScale();
        }

        //******* TOOLS initialization
        //measure
        mapMeasureTools.init(
          map,
          epsg,
          viewProjection,
          vectorSource,
          vectorLayer,
          token,
          app_name,
          project.geom_colors,
          touchDevice,
          localized_strings
        );
        //select
        mapSelectTool.init(
          map,
          epsg,
          viewProjection,
          viewResolution,
          vectorSource,
          token,
          app_name,
          urlWMS,
          max_features,
          project.geom_colors,
          touchDevice,
          mapToc,
          dataFactory
        );

        //add
        mapAddTool.init(
          map,
          epsg,
          viewProjection,
          viewResolution,
          vectorSource,
          token,
          app_name,
          urlWMS,
          project.geom_colors,
          localized_strings
        );

        map.on("activateAnimations", function (evt) {
          animateFeature = true;
        });
        map.on("deactivateAnimations", function (evt) {
          animateFeature = false;
        });
        //click event
        map.on("click", function (evt) {
          clickedCooordinates = evt.coordinate;
          log("click coordinates: " + evt.coordinate, "info");
          log("toolSelected: " + toolSelected, "info");
          if (editing) {
            endEditGeometry();
          }
          //if toolSelected adds point
          if (
            toolSelected === "point" ||
            toolSelected === "MultiPoint" ||
            toolSelected === "Point"
          ) {
            //mapAddTool.addPoint(evt.coordinate,toolSelected);
          } else if (
            toolSelected === "LineString" ||
            toolSelected === "MultiLineString"
          ) {
            mapAddTool.initLine(toolSelected);
          } else if (
            toolSelected === "Polygon" ||
            toolSelected === "MultiPolygon"
          ) {
            mapAddTool.initPolygon(toolSelected);
          } else if (
            toolSelected === "measureLine" ||
            toolSelected === "measureArea"
          ) {
            if (mapMeasureTools.getMeasureCount() > 0) {
              mapMeasureTools.initMeasure(toolMode);
              vectorLayer.setStyle(measureStyle);
            }
          } else if (toolSelected === "polygonSelect") {
            //once is the polygon is drawn, set style to null, polygon will be removed
            vectorLayer.setStyle(null);
          } else {
            //for tools as addLine we need to disable click due to use of double click events
            if (!clickDisabled) {
              if (appOnline) {
                $rootScope.$broadcast("clickedCoordinates", {
                  coordinates: clickedCooordinates,
                });
              } else {
                mapSelectTool.selectPointOffline(
                  evt.pixel,
                  clickedCooordinates,
                  mapToc.getMarkedLayerAsActive()
                );
              }
            }
          }
        });
        map.getView().on("change:resolution", function (e) {
          var currZoom = map.getView().getZoom();
          if (currZoom < min_zoom_level) {
            map.getView().setZoom(min_zoom_level);
            currZoom = min_zoom_level;
          }
        });
        map.on("moveend", function (e) {
          var currZoom = map.getView().getZoom();
          if (currZoom < min_zoom_level) {
            map.getView().setZoom(min_zoom_level);
            currZoom = min_zoom_level;
          }
          if (currZoom != zoom_level) {
            zoom_level = currZoom;
          }
          $rootScope.$broadcast("mapMoveEnd", {
            coordinates: clickedCooordinates,
            zoom_level: zoom_level,
            center: map.getView().getCenter(),
          });
        });

        if (project.use_tiled_background) {
          setTiledOverBackground(
            true,
            tiled_layer_name,
            tiled_matrixset,
            false
          );
        }

        if (project.offline) {
          var ofllineIndicator = document.createElement("IMG");
          ofllineIndicator.src = "img/ic/offline.svg";
          ofllineIndicator.style.display = "none";
          ofllineIndicator.setAttribute("id", "offlineIndicator");
          var element = document.createElement("div");
          element.className = "ol-scale-coordinates";
          element.appendChild(ofllineIndicator);
          var OfllineDisplayIndicator = new ol.control.Control({
            element: element,
          });
          map.addControl(OfllineDisplayIndicator);
        }

        if (!appOnline) {
          //this will load offline if available
          setOfflineMode();
        }
      }

      //****************************************************************
      //***********************  END RENDER MAP  ***********************
      //****************************************************************

      //****************************************************************
      //***********************     ADD LAYER    ***********************
      //****************************************************************

      function addLayer(item, index) {
        var legend_event;
        var layer_name;
        if (typeof item == "object") {
          layer_name = item.Name;
        } else {
          layer_name = item;
        }
        log("addLayer(" + layer_name + "," + index + ")", "info");
        //check if is a chached layer
        var cachedIndex = chachedLayers.indexOf(layer_name);
        if (cachedIndex > -1) {
          log(layer_name + " is in cache", "info");
          if (layersVars[cachedIndex].getVisible()) {
            legend_event = "hide";
            layersVars[cachedIndex].setVisible(false);
          } else {
            legend_event = "show";
            layersVars[cachedIndex].setVisible(true);
          }
        } else {
          log(layer_name + " is NOT in cache", "info");
          if (layers.indexOf(layer_name) === -1) {
            legend_event = "show";
            displayLayer(layer_name, false, item, index);
          } else {
            legend_event = "hide";
            removeLayer(layer_name);
          }
        }

        $rootScope.$broadcast("legendEvent", {
          item: item,
          event: legend_event,
        });
      }

      function removeLayer(layer_name) {
        log("removeLayer(" + layer_name + ")", "info");
        var index = layers.indexOf(layer_name);
        map.removeLayer(layersVars[index]);
        layersVars.splice(layers.indexOf(layer_name), 1);
        chachedLayers.splice(layers.indexOf(layer_name), 1);
        layers.splice(layers.indexOf(layer_name), 1);
        if (layers.indexOf(layer_name) === activeLayer) {
          setActiveLayer(false);
        }
      }

      function reloadLayer(layer_name) {
        log("reloadLayer(" + layer_name + ")", "info");
        if (appOnline) {
          removeLayer(layer_name);
          addLayer(layer_name);
        } else {
          setTimeout(function () {
            removeLayer(layer_name);
            displayLayer(layer_name);
          }, 500);
        }
      }

      function reloadDisplayedLayers() {
        log("reloadDisplayedLayers()", "info", layers);
        var layersToReaload = [];
        chachedLayers = [];
        for (var i = 0; i < layers.length; i++) {
          layersToReaload.push(layers[i]);
        }
        for (var l = 0; l < layersToReaload.length; l++) {
          reloadLayer(layersToReaload[l]);
        }
      }

      //displays
      function displayLayer(layer_name, reload, item, index) {
        log("displayLayer(" + layer_name + "," + reload + ")", "info", item);
        if (layer_name) {
          layer_name = layer_name.split("XXX").join(" ");
        }
        var lay = null;
        var source = null;
        if (layers.indexOf(layer_name) > -1) {
          if (reload && appOnline) {
            layersVars[layers.indexOf(layer_name)]
              .getSource()
              .updateParams({ time: Date.now() });
          }
        } else {
          if (appOnline) {
            //request layer features (used on filters)
            _getFeatureTypeFromWFS(
              layer_name,
              function (layerAvailableFilters) {
                var LayerProperties = mapToc.getLayerProperties(layer_name);
                if (typeof LayerProperties == "undefined") {
                  log(
                    "displayLayer(" + layer_name + ") getLayerProperties error",
                    "error",
                    LayerProperties
                  );
                  return false;
                }
                var source;
                var lay;
                var transparent = "true";
                if (parseInt(LayerProperties.transparent) === 0)
                  transparent = "false";
                if (parseInt(LayerProperties.geojson) === 1) {
                  //Load from geojson

                  log(
                    "displayLayer(" + layer_name + ") from GeoJSON",
                    "info",
                    LayerProperties
                  );
                  return $http
                    .get(baseHref + "ajax.vidro.php", {
                      params: {
                        m: "GET",
                        uri:
                          "giswater/geojson/" + project.id + "/" + layer_name,
                        token: token,
                      },
                    })
                    .then(
                      function (response) {
                        log(
                          "displayLayer(" + layer_name + ") from GeoJSON",
                          "success",
                          response.data
                        );
                        var features = new ol.format.GeoJSON().readFeatures(
                          response.data
                        );
                        if (features.length > 0) {
                          source = new ol.source.Vector({
                            features: features,
                            useSpatialIndex: true,
                          });
                          //style layers by geometryType
                          var geometryType = features[0]
                            .getGeometry()
                            .getType();
                          log(
                            "displayLayer from GeoJSON geometry type: " +
                              geometryType,
                            "info"
                          );
                          var style = null;
                          if (
                            geometryType === "LineString" ||
                            geometryType === "MultiLineString"
                          ) {
                            style = new ol.style.Style({
                              fill: new ol.style.Fill({
                                color: LayerProperties.geojson_fill_color,
                              }),
                              stroke: new ol.style.Stroke({
                                color: LayerProperties.geojson_stroke_color,
                                width: LayerProperties.geojson_stroke_width,
                              }),
                              text: new ol.style.Text({
                                font: "12px Calibri,sans-serif",
                                fill: new ol.style.Fill({
                                  color: "#000",
                                }),
                              }),
                            });
                          } else if (
                            geometryType === "Point" ||
                            geometryType === "MultiPoint"
                          ) {
                            style = new ol.style.Style({
                              image: new ol.style.Circle({
                                radius: LayerProperties.geojson_point_radius,
                                fill: new ol.style.Fill({
                                  color: LayerProperties.geojson_point_fill,
                                }),
                              }),
                            });
                          }
                          lay = new ol.layer.Vector({
                            extent: extent,
                            name: layer_name,
                            source: source,
                          });
                          if (style) {
                            lay.setStyle(style);
                          }
                          if (lay) {
                            chachedLayers.push(layer_name);
                            layersVars.push(lay);
                            layers.push(layer_name);
                            map.addLayer(lay);
                            //nofify toc active layer
                            mapToc.setActiveLayer(item, index);
                            mapToc.markActiveLayer(getActiveLayerName());
                          }
                        }
                      },
                      function errorCallback(response) {
                        log(
                          "displayLayer from GeoJSON error",
                          "error",
                          response
                        );
                        return response;
                      }
                    );
                  //END GEOJSON LAYER
                } else {
                  //LOAD FROM WMS
                  if (LayerProperties.singletile) {
                    log(
                      "displayLayer(" + layer_name + ") rendered as singleTile",
                      "info",
                      LayerProperties
                    );
                    //render based on a single image
                    source = new ol.source.ImageWMS({
                      url: urlWMS,
                      params: {
                        LAYERS: layer_name,
                        FILTER:
                          layer_name +
                          ":" +
                          getWMSFilters(layer_name, layerAvailableFilters),
                        TRANSPARENT: transparent,
                      },
                      crossOrigin: "Anonymous",
                    });
                    lay = new ol.layer.Image({
                      extent: extent,
                      name: layer_name,
                      source: source,
                    });
                  } else {
                    log(
                      "displayLayer(" + layer_name + ") rendered as multiTile",
                      "info",
                      LayerProperties
                    );
                    //render based on tiles
                    source = new ol.source.TileWMS({
                      url: urlWMS,
                      gutter: parseInt(LayerProperties.gutter),
                      params: {
                        LAYERS: layer_name,
                        FILTER:
                          layer_name +
                          ":" +
                          getWMSFilters(layer_name, layerAvailableFilters),
                        TRANSPARENT: transparent,
                      },
                      crossOrigin: "Anonymous",
                    });
                    lay = new ol.layer.Tile({
                      extent: extent,
                      name: layer_name,
                      source: source,
                    });
                  }
                }
                if (lay) {
                  chachedLayers.push(layer_name);
                  layersVars.push(lay);
                  layers.push(layer_name);
                  map.addLayer(lay);
                  //nofify toc active layer
                  mapToc.setActiveLayer(item, index);
                  mapToc.markActiveLayer(getActiveLayerName());
                  //}
                } else {
                  log("displayLayer error", "error");
                }
              }
            );
          } else {
            /****** render offline layer *******/
            if (mapOffline.offlineDataAvailable()) {
              //read geojson from local storage
              $rootScope.$broadcast("offlineEvent", {
                evt: "renderingEvent",
                name: layer_name,
              });
              mapOffline.readOfflineGeoJSON(
                project.project_name + "_" + layer_name,
                function (err, storedGeoJSON) {
                  if (err) {
                    log("readOfflineGeoJSON: " + err, storedGeoJSON, "error");
                  }
                  if (storedGeoJSON) {
                    var features = new ol.format.GeoJSON().readFeatures(
                      storedGeoJSON
                    );
                    if (features.length > 0) {
                      source = new ol.source.Vector({
                        features: features,
                        useSpatialIndex: true,
                      });
                      //style layers by geometryType
                      var geometryType = features[0].getGeometry().getType();
                      log(
                        "Offline layer geometry type: " + geometryType,
                        "info"
                      );
                      var style = null;
                      if (
                        geometryType === "LineString" ||
                        geometryType === "MultiLineString"
                      ) {
                        style = new ol.style.Style({
                          fill: new ol.style.Fill({
                            color: offline_fill_color,
                          }),
                          stroke: new ol.style.Stroke({
                            color: offline_stroke_color,
                            width: offline_stroke_width,
                          }),
                          text: new ol.style.Text({
                            font: "12px Calibri,sans-serif",
                            fill: new ol.style.Fill({
                              color: "#000",
                            }),
                          }),
                        });
                      } else if (
                        geometryType === "Point" ||
                        geometryType === "MultiPoint"
                      ) {
                        style = new ol.style.Style({
                          image: new ol.style.Circle({
                            radius: offline_point_radius,
                            fill: new ol.style.Fill({
                              color: offline_point_fill,
                            }),
                          }),
                        });
                      }
                      lay = new ol.layer.Vector({
                        extent: extent,
                        name: layer_name,
                        source: source,
                      });
                      if (style) {
                        lay.setStyle(style);
                      }

                      //check if there's stored style
                      mapOffline.readOfflineStyle(
                        project.project_name + "_" + layer_name + ".js",
                        function (err, storedStyle) {
                          if (err) {
                            log("readOfflineStyle: " + err, "warn");
                            renderOfflineLayer(lay, layer_name);
                          } else {
                            if (storedStyle) {
                              log("readOfflineStyle", "success");
                              log(
                                "readOfflineStyle storedStyle",
                                "info",
                                storedStyle
                              );
                              eval(genericStyles);
                              eval(storedStyle);
                              layer_name = layer_name.split(" ").join("XXX");
                              var functionName =
                                "style_" +
                                project.project_name +
                                "_" +
                                layer_name;
                              lay = new ol.layer.Vector({
                                extent: extent,
                                name: layer_name,
                                source: source,
                                style: eval(functionName),
                              });
                              renderOfflineLayer(lay, layer_name);
                            } else {
                              renderOfflineLayer(lay, layer_name);
                            }
                          }
                        }
                      );
                    } else {
                      $rootScope.$broadcast("offlineEvent", {
                        evt: "no_offline_data",
                        name: layer_name,
                      });
                      lay = null;
                    }
                  } else {
                    $rootScope.$broadcast("offlineEvent", {
                      evt: "no_offline_data",
                      name: layer_name,
                    });
                    lay = null;
                  }
                }
              );
            } else {
              $rootScope.$broadcast("offlineEvent", {
                evt: "no_offline_data",
                name: "all",
              });
            }
          }
        }
      }

      function renderOfflineLayer(lay, layer_name) {
        //end render offline layer
        layersVars.push(lay);
        layer_name = layer_name.split("XXX").join(" ");
        layers.push(layer_name);
        map.addLayer(lay);
        $rootScope.$broadcast("offlineEvent", {
          evt: "renderEvent",
          name: layer_name,
        });
        //nofify toc active layer
        if (
          typeof item != "undefined" &&
          item != "undefined" &&
          typeof index != "undefined" &&
          index != "undefined"
        ) {
          mapToc.setActiveLayer(item, index);
          mapToc.markActiveLayer(mapToc.getMarkedLayerAsActive());
        }
      }

      function createTextStyle(
        feature,
        resolution,
        labelText,
        labelFont,
        labelFill,
        placement
      ) {
        if (feature.hide || !labelText) {
          return;
        }

        var textStyle = new ol.style.Text({
          font: labelFont,
          text: labelText,
          textBaseline: "middle",
          textAlign: "left",
          offsetX: 8,
          offsetY: 3,
          placement: placement,
          maxAngle: 0,
          fill: new ol.style.Fill({
            color: labelFill,
          }),
        });

        return textStyle;
      }

      function getPostgresFieldName(alias) {
        log("getPostgresFieldName(" + alias + ")", "info");
        for (var i = 0; i < layerFieldNames.length; i++) {
          if (layerFieldNames[i].alias === alias) {
            return {
              name: layerFieldNames[i].name,
              type: layerFieldNames[i].type,
            };
            break;
          }
        }
      }

      function getLayerAttributes(layer) {
        log("getLayerAttributes(" + layer + ")", "info");

        //replace spaces with _ when WFS version 1.0.0 spaces aren't allowed
        layer = layer.replace(/\s+/g, "_");
        try {
          var url =
            urlWMS +
            "?SERVICE=WFS&VERSION=1.0.0&REQUEST=describeFeatureType&typename=" +
            layer +
            "&initDate=" +
            initDate +
            "&endDate=" +
            endDate +
            "&username=" +
            userName;
          log("url", "info", url);
          $.get(url, function (response, status) {
            var json = xml2json(response);
            log("getLayerAttributes(" + layer + ")", "info", json);
            if (
              json.schema.complexType != undefined &&
              json.schema.complexType != "undefined"
            ) {
              var attributtes = null;

              var dataToIterate = null;

              if (typeof json.schema.complexType.length != "undefined") {
                for (var l = 0; l < json.schema.complexType.length; l++) {
                  if (json.schema.complexType[l].name === `${layer}Type`) {
                    dataToIterate = json.schema.complexType[l];
                    break;
                  }
                }
              } else {
                dataToIterate = json.schema.complexType;
              }
              if (typeof dataToIterate.complexContent != "undefined") {
                attributtes =
                  dataToIterate.complexContent.extension.sequence.element;
                //if has photos
                var foto_node_id = false;
                var retorn = Array();
                layerFieldNames = Array();
                var idField = null;
                for (var i = 0; i < attributtes.length; i++) {
                  if (
                    attributtes[i].name === "id" ||
                    attributtes[i].name === "arc_id" ||
                    attributtes[i].name === "pol_id" ||
                    attributtes[i].name === "node_id"
                  ) {
                    idField = attributtes[i].name;
                  }
                  if (attributtes[i].name != "foto_node_id") {
                    retorn.push(attributtes[i].name);
                  }
                  if (attributtes[i].name === "foto_node_id") {
                    foto_node_id = true;
                  }
                  layerFieldNames.push({
                    name: attributtes[i].name,
                    alias: attributtes[i].alias,
                    type: attributtes[i].type,
                  });
                }
                $rootScope.$broadcast("layerAttributesReceived", {
                  fields: retorn,
                  idField: idField,
                  foto_node_id: foto_node_id,
                });
              }
            } else {
              log(
                "Error in getLayerAttributes json doesn't contain schema.complexType node",
                "warn"
              );
            }
          });
        } catch (e) {
          log("error in getLayerAttributes(" + layer + ")", "warn");
          $rootScope.$broadcast("displayMapError", {
            err: "error in getLayerAttributes(" + layer + ")",
          });
        }
      }

      function setActiveLayer(layer_name) {
        log("setActiveLayer(" + layer_name + ")", "info");
        _CurrentLayerName = layer_name;
        //select first layer of array, if is available in case we remove activeLayer
        if (layers.indexOf(layer_name) === -1) {
          if (layers.length > 0) {
            activeLayer = layers[0];
            $rootScope.$broadcast("hideMapError", { err: "No error" });
          } else {
            activeLayer = null;
            $rootScope.$broadcast("notifyNoActiveLayer", {});
          }
        } else {
          activeLayer = layers.indexOf(layer_name);
          $rootScope.$broadcast("hideMapError", { err: "No error" });
        }

        if (activeLayer != null) {
          $rootScope.$broadcast("notifyActiveLayer", {
            activeLayer: activeLayer,
            activaLayerName: getActiveLayerName(),
          });
        }
        mapSelectTool.clearHighlight();
      }

      function resetActiveLayer() {
        log("resetActiveLayer() " + activeLayer, "info");
        activeLayer = null;
      }
      function getLayersDisplayed() {
        log("getLayersDisplayed: ", "info", layers);
        return layers;
      }
      function getOLLayersDisplayed() {
        return layersVars;
      }
      function getActiveLayer() {
        log("getActiveLayer: " + activeLayer, "info");
        return activeLayer;
      }

      function getActiveLayerName() {
        if (typeof layers[activeLayer] != "undefined") {
          //log("getActiveLayerName: activeLayer: "+activeLayer+", name: "+layers[activeLayer],"info",layers);
          return layers[activeLayer];
        } else {
          return false;
        }
      }
      //****************************************************************
      //***********************   END  ADD LAYER ***********************
      //****************************************************************

      //****************************************************************
      //***********************      WMS INFO    ***********************
      //****************************************************************

      function doWMSInfo(clickedCooordinates) {
        log("doWMSInfo()", "info", clickedCooordinates);
        mapSelectTool.selectPoint(
          clickedCooordinates,
          getMapData(),
          map.getView().getResolution()
        );
      }

      //****************************************************************
      //********************     END WMS INFO    ***********************
      //****************************************************************

      //****************************************************************
      //*******************   WMS PROJECT SETTINGS  ********************
      //****************************************************************

      function getWMSProjectSettings(setting) {
        log(
          "getWMSProjectSettings(" +
            setting +
            "): " +
            urlWMS +
            "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetProjectSettings",
          "info"
        );
        return $http
          .get(
            urlWMS + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetProjectSettings",
            {
              params: {
                json: 1,
              },
            }
          )
          .then(
            function (response) {
              var parser = new DOMParser();
              var xmlDoc = parser.parseFromString(response.data, "text/xml");
              var data = xmlDoc.getElementsByTagName(setting);
              return data;
            },
            function errorCallback(response) {
              log(
                "getWMSProjectSettings(" + setting + ") - errorCallback",
                "error",
                response
              );
              return response;
            }
          );
      }

      //****************************************************************
      //****************  END WMS PROJECT SETTINGS  ********************
      //****************************************************************

      //****************************************************************
      //***********************     BACKGROUND   ***********************
      //****************************************************************

      function renderBackground(source, container) {
        log("renderBackground(" + container + ")", "info", source);
        var rasterToUse = raster;
        var sourceToUse = onlineBackgroundsource;
        if (container === "secondary") {
          rasterToUse = second_raster;
          sourceToUse = onlineSecond_Backgroundsource;
        }
        onlineBackgroundsource = source;
        rasterToUse.setSource(source);
      }

      function getBackgroundSource(container) {
        log("getBackgroundSource(" + container + ")", "info");
        var rasterToUse = raster;
        if (container === "secondary") {
          rasterToUse = second_raster;
        }
        return rasterToUse.getSource();
      }
      //****************************************************************
      //***********************    END BACKGROUND  *********************
      //****************************************************************

      function setTiledOverBackground(what, layer, matrixSet, setRendered) {
        log("setTiledOverBackground()", "info", {
          what: what,
          layer: layer,
          matrixSet: matrixSet,
          setRendered: setRendered,
          extent_filter: extent_filter,
          rasterOverBackground: rasterOverBackground,
        });
        try {
          map.removeLayer(rasterOverBackground);
        } catch (e) {}

        if (what) {
          tiled_matrixset = matrixSet;
          tiled_layer_name = layer;
          if (typeof extent_filter != "undefined") {
            if (
              extent_filter != null &&
              extent_filter != "null" &&
              extent_filter != "" &&
              extent_filter != false &&
              extent_filter != "false"
            ) {
              tiled_layer_name = tiled_layer_name + extent_filter;
            }
          }
          if (tiled_matrixset != null && tiled_layer_name != null) {
            rasterOverBackground = new ol.layer.Tile({});
            $http({
              method: "GET",
              url:
                urlWMTS + "?service=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities",
            }).success(function (data) {
              //try{
              var parser = new ol.format.WMTSCapabilities();
              var result = parser.read(data);
              var options = ol.source.WMTS.optionsFromCapabilities(result, {
                layer: tiled_layer_name,
                matrixSet: tiled_matrixset,
                crossOrigin: "anonymous",
              });
              options.urls[0] = urlWMTS;
              rasterOverBackground.setSource(
                new ol.source.WMTS(
                  /** @type {!olx.source.WMTSOptions} */ (options)
                )
              );
            });
            tileRendered = true;
            map.addLayer(rasterOverBackground);
          } else {
            log(
              "TILED BACKGROUND ERROR: tiled_layer_name or tiled_matrixset not defined",
              "error"
            );
          }
        } else {
          map.removeLayer(rasterOverBackground);
          rasterOverBackground = null;
          if (setRendered) {
            tileRendered = false;
          }
        }
      }

      //****************************************************************
      //***********************    ADD GEOMETRY   **********************
      //****************************************************************

      function addTemporalGeometry(geometry, source, removeAfter) {
        log(
          "addTemporalGeometry(" + source + "," + removeAfter + ")",
          "info",
          geometry
        );
        if (typeof geometry != "undefined") {
          var iconFeature = new ol.Feature({ geometry: geometry });
          var geomType = iconFeature.getGeometry().getType();
          iconFeature.setStyle(addStyle);
          vectorSource.addFeature(iconFeature);
          if (typeof activeLayer != "undefined" && activeLayer != null) {
            displayLayer(getActiveLayerName(activeLayer), true);
          }
          //after N seconds I remove the added geometry
          if (removeAfter > 0) {
            setTimeout(function () {
              vectorSource.clear();
            }, removeAfter);
          }
        }
      }

      function setanimateFeature(what) {
        log("setanimateFeature(" + what + ")", "info");
        animateFeature = what;
      }
      //receives geometry from websocket
      function addSocketGeometry(geom, geomProjection, layer_name, source) {
        log(
          "addSocketGeometry(" +
            geom +
            "," +
            geomProjection +
            "," +
            layer_name +
            "," +
            source +
            ")",
          "info"
        );
        if (layers.indexOf(layer_name) != -1) {
          var format = new ol.format.WKT({});
          var rawGeometry = format.readGeometry(geom, {
            dataProjection: geomProjection,
            featureProjection: epsg,
          });
          addTemporalGeometry(rawGeometry, source, 0);
        }
      }

      //animate new added features
      function flash(feature) {
        var start = new Date().getTime();
        var listenerKey;
        function animate(event) {
          var vectorContext = event.vectorContext;
          var frameState = event.frameState;
          var flashGeom = feature.getGeometry().clone();
          var elapsed = frameState.time - start;
          var elapsedRatio = elapsed / duration;
          // radius will be 5 at start and 30 at end.
          var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
          var opacity = ol.easing.easeOut(1 - elapsedRatio);
          var flashStyle = new ol.style.Style({
            image: new ol.style.Circle({
              radius: radius,
              snapToPixel: false,
              stroke: new ol.style.Stroke({
                color: "rgba(255, 0, 0, " + opacity + ")",
                width: 1,
                opacity: opacity,
              }),
            }),
          });

          vectorContext.setStyle(flashStyle);
          vectorContext.drawGeometry(flashGeom, null);
          if (elapsed > duration) {
            ol.Observable.unByKey(listenerKey);
            return;
          }
          // tell OL3 to continue postcompose animation
          frameState.animate = true;
        }
        listenerKey = map.on("postcompose", animate);
      }

      //****************************************************************
      //***********************  END ADD GEOMETRY   ********************
      //****************************************************************

      //****************************************************************
      //***********************    EDIT GEOMETRY    ********************
      //****************************************************************

      function editGeometry() {
        log("editGeometry(), editing: " + editing, "info");
        if (!editing) {
          editing = true;
          mapAddTool.editGeometry(mapSelectTool.getSelectedFeauture());
        }
      }

      function endEditGeometry() {
        if (editing) {
          log("endEditGeometry()", "info");
          mapAddTool.endEditGeometry();
          mapSelectTool.clearHighlight();
          editing = false;
        }
      }

      function highlightSelectedFeature(geomString) {
        var format = new ol.format.WKT({});
        var geom2Hightlight = format.readGeometry(geomString, {
          dataProjection: epsg,
          featureProjection: epsg,
        });
        return mapSelectTool.highLightGeometry(geom2Hightlight);
      }
      //****************************************************************
      //***********************  END EDIT GEOMETRY    ******************
      //****************************************************************

      function featureDeleted(geometry) {
        log("featureDeleted()", "info", geometry);
        mapSelectTool.clearHighlight();
        if (typeof activeLayer != "undefined") {
          displayLayer(getActiveLayerName(activeLayer), true);
        }
      }

      //****************************************************************
      //***********************        TOOLS        ********************
      //****************************************************************

      function forceEndDrawing() {
        mapAddTool.forceEndDrawing();
      }

      //simulate a click on the map for selecting a point
      function doInfoFromCoordinates(clickedCooordinates, feauture_id, layers) {
        log("doInfoFromCoordinates()", "info", clickedCooordinates);
        mapSelectTool.selectPoint(
          clickedCooordinates,
          getMapData(),
          map.getView().getResolution(),
          layers,
          feauture_id
        );
      }

      //selects the tool for map edition
      function setTool(tool, option) {
        log(
          "setTool(" + tool + "," + option + "), toolSelected: " + toolSelected,
          "info"
        );

        if (
          (toolSelected === "point" ||
            toolSelected === "MultiPoint" ||
            toolSelected === "Point") &&
          tool === null
        ) {
          //if option, point submitted to database
          if (option) {
            var geom = mapAddTool.fixPoint();
            if (ws_status === 0) {
              addTemporalGeometry(geom, "local", 0);
            }
          } else {
            mapAddTool.resetAddTools();
          }
        } else if (
          (toolSelected === "LineString" ||
            toolSelected === "MultiLineString") &&
          tool === null
        ) {
          var geom = mapAddTool.fixGeometry();
          if (ws_status === 0) {
            addTemporalGeometry(geom, "local", 0);
          }
        } else if (
          (toolSelected === "Polygon" || toolSelected === "MultiPolygon") &&
          tool === null
        ) {
          var geom = mapAddTool.fixGeometry();
          if (ws_status === 0) {
            addTemporalGeometry(geom, "local", 0);
          }
          //TBR	}else if(toolSelected==="selectMore" && tool===null){
          //	mapSelectTool.setMultiple(false);
        } else if (
          toolSelected === "measureLine" ||
          toolSelected === "measureArea"
        ) {
          mapMeasureTools.endMeasure();
          /* TBR }else if(toolSelected==="selectArea" && tool===null){
			var dragPan = new ol.interaction.DragPan({kinetic: false});
			map.addInteraction(dragPan);
			mapSelectTool.removeSelectArea();*/
        } else if (toolSelected === "polygonSelect" && tool === null) {
          //this cleans the polygon when tool is unselected
          mapSelectTool.removePolygonSelect();
        } else if (tool === "multipleSelect") {
          //unset multiple select on selectTools
          mapSelectTool.setMultiple(false);
        }

        /* TBR!!!
		if(tool==="selectArea"){
			mapSelectTool.selectArea(getMapData());
		}else if(tool==="selectMore"){
			mapSelectTool.setMultiple(true);
		}else */
        if (tool === "point" || tool === "Point") {
          if (useGeolocation === 1) {
            $rootScope.$broadcast("reset-tools", { tool: tool });
            mapAddTool.addPoint(geolocation.getPosition(), tool);
          }
        } else if (
          tool === "LineString" ||
          tool === "MultiLineString" ||
          tool === "Polygon"
        ) {
          mapAddTool.resetAddTools();
        } else if (tool === "measureLine" || tool === "measureArea") {
          mapMeasureTools.initMeasure(option);
          vectorLayer.setStyle(measureStyle);
        } else if (tool === "polygonSelect") {
          mapSelectTool.initPolygonSelect(option);
        } else if (tool === "multipleSelect") {
          //set multiple select on selectTools
          mapSelectTool.setMultiple(true);
        }

        toolSelected = tool;
        toolMode = option; //set toolMode if is defined
        if (useGeolocation !== 1) {
          $rootScope.$broadcast("reset-tools", { tool: toolSelected });
        }
        if (!appOnline) {
          $rootScope.addPointDisabled = true;
          $rootScope.addLineDisabled = true;
          $rootScope.addPolygonDisabled = true;
        }
        //temporal click disable
        clickDisabled = true;
        setTimeout(function () {
          clickDisabled = false;
        }, 500);
      }

      function getPolygonSelect() {
        return mapSelectTool.getPolygonSelect();
      }

      function multipleSelectAddRemoveElement(data) {
        return mapSelectTool.addRemoveElement(data);
      }

      function resetMultipleSelect() {
        mapSelectTool.resetMultipleSelect();
      }

      function getMultipleData() {
        return mapSelectTool.getMultipleData();
      }

      function setMultipleSelect(what) {
        mapSelectTool.setMultiple(what);
      }

      function getMultipleSelect(what) {
        return mapSelectTool.getMultiple();
      }

      function setMultipleSelectData(data) {
        mapSelectTool.setMultipleSelectData(data);
      }

      //****************************************************************
      //***********************      END TOOLS      ********************
      //****************************************************************

      //****************************************************************
      //***************         GEOLOCATION TOOL       *****************
      //****************************************************************

      function trackPosition(who) {
        log("trackPosition(" + who + ") -", "info", trackingPosition);
        if (trackingPosition === null) {
          log("trackPosition() Initializing", "info");
          $rootScope.$broadcast("geoLocalizeEvent", { evt: "GEOLOCATING" });
          trackingPosition = new ol.Geolocation({
            projection: map.getView().getProjection(),
          });

          trackingPosition.setTracking(true);
          var accuracyFeature = new ol.Feature();
          trackingPosition.on("change:accuracyGeometry", function () {
            accuracyFeature.setGeometry(trackingPosition.getAccuracyGeometry());
          });
          if (who === "local") {
            var positionFeature = new ol.Feature();
            positionFeature.setStyle(
              new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 6,
                  fill: new ol.style.Fill({
                    color: "#3399CC",
                  }),
                  stroke: new ol.style.Stroke({
                    color: "#fff",
                    width: 2,
                  }),
                }),
              })
            );
          }
          trackingPosition.on("change:position", function () {
            log("trackPosition() -> geolocation change:position", "info");
            var coordinates = trackingPosition.getPosition();
            if (!geoLocalizedNotificate) {
              $rootScope.$broadcast("geoLocalizeEvent", {
                evt: "GEOLOCATED",
                coordinates: coordinates,
              });
              geoLocalizedNotificate = true;
              positionFeature.setGeometry(
                coordinates ? new ol.geom.Point(coordinates) : null
              );
              map.getView().setCenter(coordinates);
              map.getView().setZoom(18);
            }
          });

          trackingPosition.on("change", function () {
            log("trackPosition() -> geolocation change()", "info");
            if (who === "remote") {
              $rootScope.$broadcast("geoLocalizeEvent", {
                evt: "GEOLOCATION_CHANGE",
                coordinates: trackingPosition.getPosition(),
              });
            }
          });

          trackingPosition.on("error", function (error) {
            $rootScope.$broadcast("geoLocalizeEvent", {
              evt: "GEOLOCATION_ERROR",
            });
            log("trackPosition() -> geolocation error: " + error.message),
              "warn";
          });
          if (who === "local") {
            //markers & temporal geometry
            trackVectorSource = new ol.source.Vector({});
            trackVectorLayer = new ol.layer.Vector({
              source: trackVectorSource,
            });
            trackVectorSource.addFeature(positionFeature);
            trackVectorSource.addFeature(accuracyFeature);
            map.addLayer(trackVectorLayer);
          }
        } else {
          log("trackPosition() stopping", "info");
          trackingPosition.setTracking(false);
          trackingPosition = null;
          map.removeLayer(trackVectorLayer);
          trackVectorSource = null;
          geoLocalizedNotificate = false;
        }
      }

      function stopTracking(who) {
        log("stopTracking(" + who + ")", "info");
        if (trackingPosition != null) {
          trackingPosition.setTracking(false);
          trackingPosition = null;
          if (who === "local") {
            map.removeLayer(trackVectorLayer);
            trackVectorSource = null;
            trackVectorSource = null;
            geoLocalizedNotificate = false;
          }
        }
      }

      function getHeading() {
        log("getHeading()", "info");
        if (trackingPosition !== null) {
          if (typeof trackingPosition.getHeading() != "undefined") {
            log(
              "getHeading() geolocated: ",
              "info",
              trackingPosition.getHeading()
            );
            return trackingPosition.getHeading();
          } else {
            log("getHeading() geolocated:couldn't extract heading", "warn");
            return 0.0;
          }
        } else {
          return 0.0;
        }
      }

      function getUsersUbicationVisible() {
        if (remoteTrackVectorLayer === null) {
          return false;
        } else {
          return true;
        }
      }

      function toogleUsersUbication(users) {
        if (remoteTrackVectorLayer === null) {
          remoteTrackVectorSource = new ol.source.Vector({});
          remoteTrackVectorLayer = new ol.layer.Vector({
            source: remoteTrackVectorSource,
          });
          map.addLayer(remoteTrackVectorLayer);
          for (var i = 0; i < users.length; i++) {
            if (typeof users[i].coordinates != null) {
              addFeautureRemoteUser(users[i]);
            }
          }
          localStorage.setItem("usersUbication", 1);
          $rootScope.$broadcast("visualizationTools", {
            key: "usersUbication",
            value: true,
          });
        } else {
          map.removeLayer(remoteTrackVectorLayer);
          remoteTrackVectorSource = null;
          remoteTrackVectorLayer = null;
          localStorage.setItem("usersUbication", 0);
          $rootScope.$broadcast("visualizationTools", {
            key: "usersUbication",
            value: false,
          });
        }
      }

      function addFeautureRemoteUser(user) {
        var remotePositionFeature = new ol.Feature({ name: user.socket_id });
        remotePositionFeature.setStyle(
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({
                color: "#cc337c",
              }),
              stroke: new ol.style.Stroke({
                color: "#fff",
                width: 2,
              }),
            }),
            text: new ol.style.Text({
              text: user.nick,
              fill: new ol.style.Fill({ color: "black" }),
              stroke: new ol.style.Stroke({ color: "yellow", width: 1 }),
              offsetX: -20,
              offsetY: 20,
            }),
          })
        );
        remotePositionFeature.setGeometry(
          user.coordinates ? new ol.geom.Point(user.coordinates) : null
        );
        remoteTrackVectorSource.addFeature(remotePositionFeature);
        map.getView().setCenter(user.coordinates);
        map.getView().setZoom(18);
      }

      function removeFeautureRemoteUser(user) {
        if (remoteTrackVectorLayer != null) {
          var features = remoteTrackVectorSource.getFeatures();
          remoteTrackVectorSource.getFeatures().forEach(function (ftr) {
            if (ftr.get("name") === user.socket_id) {
              remoteTrackVectorSource.removeFeature(ftr);
            }
          });
        }
      }

      function updateFeautureRemoteUser(user) {
        if (remoteTrackVectorLayer != null) {
          var features = remoteTrackVectorSource.getFeatures();
          remoteTrackVectorSource.getFeatures().forEach(function (ftr) {
            if (ftr.get("name") === user.socket_id) {
              ftr.setGeometry(
                user.coordinates ? new ol.geom.Point(user.coordinates) : null
              );
            }
          });
        }
      }

      //****************************************************************
      //***************      END GEOLOCATION TOOL       ****************
      //****************************************************************

      //****************************************************************
      //******************           OFFLINE              **************
      //****************************************************************

      function offlineShowSavedAreas() {
        log("offlineShowSavedAreas()", "info");
        mapOffline.showSavedAreas(map);
      }

      function offlineHideSavedAreas() {
        log("offlineHideSavedAreas()", "info");
        mapOffline.hideSavedAreas(map);
      }

      function offlineSelectAreaToDownload(meters) {
        log("offlineSelectAreaToDownload(" + meters + ")", "info");
        if (typeof meters == "undefined") {
          meters = 2500;
        }
        mapOffline.selectAreaToDownload(meters, map);
      }
      function offlineConfigure(
        what,
        ajax_target,
        project_name,
        token,
        offline_background,
        useConfirm,
        filters,
        availableFilterForLayers
      ) {
        log("offlineConfigure(" + what + ")", "info", ajax_target);
        //get background data from backoffice
        var getUrl = window.location;
        domainName = getUrl.protocol + "//" + getUrl.host + "/";

        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "GET_BACKGROUND_INFO");
        data2send.append("bg_id", offline_background);
        data2send.append("userName", userName);
        $http
          .post(baseHref + "ajax.offline.php", data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("offlineConfigure getBackgroundInfo result:", "success", data);
            try {
              var bgOptions = null;
              if (data.status === "Accepted") {
                //check if is a customo background
                var uri = data.message.service_uri;
                if (uri.substring(0, 9) === "LOCALHOST") {
                  uri = uri.replace("LOCALHOST", baseHref);
                }
                bgOptions = {
                  bg_base_url: uri,
                  layer: data.message.layer,
                  matrixSet: data.message.matrixSet,
                };
              }
            } catch (e) {}

            mapOffline.offlineConfigure(
              map,
              what,
              ajax_target,
              project_name,
              token,
              userName,
              bgOptions,
              useConfirm,
              filters,
              availableFilterForLayers
            );
          });
      }

      function offlineStartDownload() {
        log("offlineStartDownload()", "info");
        mapOffline.save(map, layersVars);
      }

      function OfllineGetAvailableGeoJson(ajax_target, project_name, token) {
        log(
          "OfllineGetAvailableGeoJson(" +
            ajax_target +
            "," +
            project_name +
            "," +
            token +
            ")",
          "info"
        );
        mapOffline.getAvailableGeoJson(
          ajax_target,
          project_name,
          token,
          map,
          false
        );
      }

      //checking offline/online
      function updateOnlineStatus(e) {
        if (!offlineForced) {
          log("updateOnlineStatus() - App online", "info");
          appOnline = true;
          $rootScope.$broadcast("appOnline", { status: appOnline });
          //maybe set a delay here???
          //setOnlineMode();
        } else {
          log("updateOnlineStatus() - offline forced!", "info");
        }
      }

      function updateOfflineStatus(e) {
        log("updateOfflineStatus() - App offline", "info");
        setOfflineMode();
      }

      function offlineReset(version) {
        log("offlineReset()", "info");
        if (confirm(localized_strings.OFFLINE_RESET_CONFIRMATION)) {
          mapOffline.offlineReset(version);
        }
      }
      function getOfflineInfo() {
        log("getOfflineInfo()", "info");
        return mapOffline.getOfflineInfo();
      }

      function setOfflineMode() {
        log("setOfflineMode()", "info");
        appOnline = false;
        loadGenericOfflineStyles();
        $rootScope.$broadcast("appOnline", { status: appOnline });
        if (second_raster) {
          second_raster.setVisible(false);
        }
        if (
          mapOffline.offlineBackgroundAvailable() ||
          mapOffline.offlineDataAvailable()
        ) {
          //load offline background
          mapOffline.displayBackground(raster, extent);
          setTiledOverBackground(false, null, null, false);
          reloadDisplayedLayers();
          //hijack zoom level
          min_zoom_level = project.offline_min_zoom;

          if (map.getView().getZoom() < min_zoom_level) {
            map.getView().setZoom(min_zoom_level);
          }
          map.getView().setMinZoom(min_zoom_level);
        }
        //show offline indicator
        var indicator = document.getElementById("offlineIndicator");
        if (indicator) {
          indicator.style.display = "block";
        }
      }

      function setOnlineMode() {
        log("setOnlineMode()", "info");
        appOnline = navigator.onLine;
        if (appOnline) {
          raster.setSource(null);
          mapOffline.hideBackground();
          mapToc.restoreCookieLayers();

          raster.setSource(onlineBackgroundsource);
          if (second_raster) {
            second_raster.setVisible(true);
          }
          min_zoom_level = 9;
          map.getView().setMinZoom(min_zoom_level);
          if (project.use_tiled_background && tileRendered) {
            setTiledOverBackground(
              true,
              tiled_layer_name,
              tiled_matrixset,
              true
            );
          }
          reloadDisplayedLayers();
          //hide offline indicator
          var indicator = document.getElementById("offlineIndicator");
          if (indicator) {
            indicator.style.display = "none";
          }
        }
      }

      function getOnlineStatus() {
        return appOnline;
      }

      function forceOffline() {
        log("forceOffline()", "info");
        if (offlineForced) {
          offlineForced = false;
          setOnlineMode();
        } else {
          setOfflineMode();
          offlineForced = true;
        }
        log("offlineForced: " + offlineForced, "info");
        return offlineForced;
      }

      function loadGenericOfflineStyles() {
        //load generic js styles methods
        if (!genericOfflineStylesLoaded) {
          mapOffline.readOfflineStyleGenericJsMethods(
            project.project_name + "_qgis2web_expressions.js",
            function (err, _genericStyles) {
              if (err) {
                log("readOfflineStyleGenericJsMethods: " + err, "warn");
              }
              if (_genericStyles) {
                log("readOfflineStyleGenericJsMethods", "success");
                genericStyles = _genericStyles;
                genericOfflineStylesLoaded = true;

                if (genericStyles != "file not found") {
                  eval(genericStyles);
                }
              } else {
                log(
                  "readOfflineStyleGenericJsMethods: no genericStyles",
                  "warn"
                );
              }
            }
          );
        }
      }

      function storeOfflineStoreProjectInfo(projectInfo) {
        log("storeOfflineStoreProjectInfo", "info", projectInfo);
        mapOffline.storeProjectInfo(projectInfo);
      }

      function storeOfflineStrings(strings) {
        log("storeOfflineStrings", "info", strings);
        mapOffline.storeOfflineStrings(strings);
      }

      function storeOfflineStoreCapabilities(capabilities) {
        log("storeOfflineStoreCapabilities", "info", capabilities);
        mapOffline.storeCapabilities(capabilities);
      }

      function getOfflineGetCapAndPi(project_id) {
        log("getOfflineGetCapAndPi", "info", project_id);
        return mapOffline.getCapAndPi(project_id);
      }

      function getStrings(project_id) {
        log("getStrings", "info", project_id);
        return mapOffline.getStrings(project_id);
      }

      //****************************************************************
      //******************          END OFFLINE           **************
      //****************************************************************

      //****************************************************************
      //**************     PHOTOS MODULE INTERFACE    ******************
      //****************************************************************
      function photosAddPhoto(photo_id, heading) {
        mapPhotos.addPhoto(photo_id, heading);
      }

      function photosShowPhoto(ajax_target, photo_id, okCb, koCb) {
        mapPhotos.showPhoto(ajax_target, photo_id, okCb, koCb);
      }

      function photosSavePicture(
        ajax_target,
        visit_id,
        preview,
        layer,
        metadata,
        callback
      ) {
        if (appOnline) {
          mapPhotos.savePicture(
            ajax_target,
            visit_id,
            preview,
            layer,
            metadata,
            callback
          );
        } else {
          mapOffline.savePicture(visit_id, preview, metadata, callback);
        }
      }

      function photosDeletePhoto(
        ajax_target,
        photo_id,
        layer_name,
        pol_id,
        tableIdName,
        cbOk,
        cbKo
      ) {
        mapPhotos.deletePhoto(
          ajax_target,
          photo_id,
          layer_name,
          pol_id,
          tableIdName,
          cbOk,
          cbKo
        );
      }

      function photosGetLists() {
        return mapPhotos.getLists();
      }

      function photosReset() {
        mapPhotos.resetLists();
      }

      //****************************************************************
      //**************  END PHOTOS MODULE INTERFACE    *****************
      //****************************************************************

      //****************************************************************
      //**************       AJAX MODULE INTERFACE    ******************
      //****************************************************************

      function ajaxGetFormDataForVisitForm(ajax_target, token, okCb, koCb) {
        mapAjaxOperations.getFormDataForVisitForm(
          ajax_target,
          token,
          okCb,
          koCb
        );
      }
      function ajaxGetProjectInfo(ajax_target, token, project_id, okCb, koCb) {
        mapAjaxOperations.getProjectInfo(
          ajax_target,
          token,
          project_id,
          okCb,
          koCb
        );
      }
      function ajaxAddGeometry(
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
        mapAjaxOperations.addGeometry(
          ajax_target,
          epsg,
          tableIdName,
          layer,
          geom,
          photo,
          editableAttributes,
          okCb,
          koCb
        );
      }
      function ajaxUpdateFeatureField(
        ajax_target,
        id,
        tableIdName,
        epsg,
        fieldName,
        value,
        layer,
        okCb,
        koCb
      ) {
        var postgresDbField = getPostgresFieldName(fieldName);
        mapAjaxOperations.updateFeatureField(
          ajax_target,
          id,
          tableIdName,
          epsg,
          postgresDbField,
          value,
          layer,
          okCb,
          koCb
        );
      }
      function ajaxDeleteElement(
        ajax_target,
        id,
        layer,
        tableIdName,
        geom,
        okCb,
        koCb
      ) {
        mapAjaxOperations.deleteElement(
          ajax_target,
          id,
          layer,
          tableIdName,
          geom,
          okCb,
          koCb
        );
      }
      function ajaxAddVisit(
        ajax_target,
        epsg,
        pol_id,
        coordinates,
        layer,
        callback
      ) {
        if (appOnline) {
          mapAjaxOperations.addVisit(
            ajax_target,
            epsg,
            pol_id,
            coordinates,
            layer,
            callback
          );
        } else {
          //mock addVisit request
          mapOffline.addVisit(epsg, pol_id, coordinates, layer, callback);
        }
        mapPhotos.resetLists();
      }
      function ajaxAddVisitInfo(
        ajax_target,
        visit_id,
        heading,
        formData,
        photo,
        okCb,
        koCb
      ) {
        var photos = mapPhotos.getLists();
        if (appOnline) {
          mapAjaxOperations.addVisitInfo(
            ajax_target,
            visit_id,
            heading,
            formData,
            photos.photos,
            photos.compasses,
            photo,
            okCb,
            koCb
          );
        } else {
          //mock getVisit request
          mapOffline.addVisitInfo(
            visit_id,
            heading,
            formData,
            photos.photos,
            photos.compasses,
            photo,
            okCb,
            koCb
          );
        }
      }
      function ajaxGetVisit(
        ajax_target,
        element_id,
        layer,
        extraData,
        okCb,
        koCb
      ) {
        if (appOnline) {
          mapAjaxOperations.getVisit(
            ajax_target,
            element_id,
            layer,
            extraData,
            okCb,
            koCb
          );
        } else {
          //mock getVisit request
          mapOffline.getVisit(element_id, layer, extraData, okCb, koCb);
        }
      }
      function ajaxRemoveVisit(ajax_target, visit_id, okCb, koCb) {
        if (appOnline) {
          mapAjaxOperations.removeVisit(ajax_target, visit_id, okCb, koCb);
        } else {
          //mock removeVisit request
          mapOffline.removeVisit(visit_id, okCb, koCb);
        }
      }
      function ajaxRemoveEvent(ajax_target, visit_id, event_id, callback) {
        if (appOnline) {
          mapAjaxOperations.removeEvent(
            ajax_target,
            visit_id,
            event_id,
            callback
          );
        } else {
          //mock removeEvent request - called from visits layer, no implemented offline, yet
          //mapOffline.removeEvent(visit_id,event_id,callbackb);
        }
      }
      function ajaxGetVisitInfo(ajax_target, visit_id, okCb, koCb) {
        mapAjaxOperations.getVisitInfo(ajax_target, visit_id, okCb, koCb);
      }
      //****************************************************************
      //**************     END AJAX MODULE INTERFACE    ****************
      //****************************************************************

      //****************************************************************
      //***********************       FILTERS     **********************
      //****************************************************************

      function getFeatureTypeFromWFS(availableLayers) {
        log("getFeatureTypeFromWFS()", "info", {
          availableLayers: availableLayers,
        });
        return new Promise((resolve, reject) => {
          let availableFilterForLayers = [];
          for (let i = 0; i < availableLayers.length; i++) {
            _getFeatureTypeFromWFS(
              availableLayers[i],
              (layerAvailableFilters) => {
                availableFilterForLayers.push({
                  layer: availableLayers[i],
                  availableFilters: layerAvailableFilters,
                });
                if (i === availableLayers.length - 1) {
                  log(
                    "getFeatureTypeFromWFS()",
                    "success",
                    availableFilterForLayers
                  );
                  resolve(availableFilterForLayers);
                }
              }
            );
          }
        });
      }
      //Get from WFS layer available features, used for filters
      function _getFeatureTypeFromWFS(layer_name, cb) {
        log("_getFeatureTypeFromWFS(" + layer_name + ")", "info");
        layer_name = layer_name.split("XXX").join(" ");
        var retorno = Array();
        try {
          if (layer_name) {
            layer_name = layer_name.replace(/ /g, "_");
            var url =
              urlWMS +
              "?service=WFS&request=DescribeFeatureType&version=1.0.0&typename=" +
              layer_name;
            log("_getFeatureTypeFromWFS url", "info", url);
            $.get(url, function (response, status) {
              var json = xml2json(response);
              log(
                "_getFeatureTypeFromWFS(" + layer_name + ")",
                "success",
                json
              );
              var dataToIterate = null;
              if (typeof json.schema != "undefined") {
                if (typeof json.schema.complexType != "undefined") {
                  if (typeof json.schema.complexType.length != "undefined") {
                    for (var l = 0; l < json.schema.complexType.length; l++) {
                      if (
                        json.schema.complexType[l].name === `${layer_name}Type`
                      ) {
                        dataToIterate = json.schema.complexType[l];
                        break;
                      }
                    }
                  } else {
                    dataToIterate = json.schema.complexType;
                  }
                }
              }
              if (dataToIterate) {
                if (typeof dataToIterate.complexContent != "undefined") {
                  if (
                    typeof dataToIterate.complexContent.extension != "undefined"
                  ) {
                    if (
                      typeof dataToIterate.complexContent.extension.sequence !=
                      "undefined"
                    ) {
                      if (
                        typeof dataToIterate.complexContent.extension.sequence
                          .element != "undefined"
                      ) {
                        for (
                          var i = 0;
                          i <
                          dataToIterate.complexContent.extension.sequence
                            .element.length;
                          i++
                        ) {
                          retorno.push(
                            dataToIterate.complexContent.extension.sequence
                              .element[i].name
                          );
                        }
                      }
                    }
                  }
                }
              }
              cb(retorno);
            });
          } else {
            cb(retorno);
          }
        } catch (e) {
          log("error in _getFeatureTypeFromWFS(" + layer_name + ")", "warn", e);
          cb(retorno);
        }
      }

      function setInitEndDates(_initDate, _endDate) {
        log("setInitEndDates(" + _initDate + "," + _endDate + ")", "info");
        var day = _initDate.getDate();
        var month = ("0" + (_initDate.getMonth() + 1)).slice(-2);
        var year = _initDate.getFullYear();
        initDate = year + "-" + month + "-" + day;
        day = _endDate.getDate();
        month = ("0" + (_endDate.getMonth() + 1)).slice(-2);
        year = _endDate.getFullYear();
        endDate = year + "-" + month + "-" + day;
      }

      function getFormatedFilterDates() {
        var retorn = {};
        retorn.initDate = initDate;
        retorn.endDate = endDate;
        return retorn;
      }

      function setFilters(filters) {
        log("setFilters()", "info", filters);
        /*OLD HARDCODED FILTERS, TO BE REMOVED!!!
		if(typeof filters.selector_expl!="undefined"){
			filter_expl_id 	= filters.selector_expl;
		}
		if(typeof filters.selector_state!="undefined"){
			filter_state		= filters.selector_state;
		}
		if(typeof filters.lot_id!="undefined"){
			lot_id		= filters.lot_id;
		}
    if(typeof filters.selector_species!="undefined"){
      filter_species = filters.selector_species;
    }
		if(typeof filters.selector_campaign!="undefined"){
			filter_campaign = filters.selector_campaign;
		}*/
        _filters = filters;
      }

      function getWMSFilters(layer_name, layerAvailableFilters) {
        log("getWMSFilters(" + layer_name + ")", "info", {
          filters: _filters,
          layerAvailableFilters: layerAvailableFilters,
        });
        var filter = "";
        if (layerAvailableFilters.indexOf("from_date") > -1) {
          log("getWMSFilters applying filter 'from_date'", "info");
          filter +=
            '"from_date"  > \'' +
            initDate +
            "' AND \"to_date\" < '" +
            endDate +
            "'";
        }
        if (layerAvailableFilters.indexOf("username") > -1) {
          log("getWMSFilters applying filter 'username'", "info");
          if (filter != "") {
            filter += " AND ";
          }
          filter += '"username" = \'' + userName + "'";
        }

        if (typeof mincut_id != null) {
          if (layerAvailableFilters.indexOf("result_id") > -1) {
            log("getWMSFilters applying filter 'result_id'", "info");
            if (filter != "") {
              filter += " AND ";
            }
            filter += '"result_id" = ' + mincut_id;
          }
        }

        for (const prop in _filters) {
          log("getWMSFilters filter iteration", "info", {
            filter: prop,
            value: _filters[prop],
            layerAvailableFilters: layerAvailableFilters,
          });
          if (layerAvailableFilters.indexOf(prop) > -1) {
            log(
              "getWMSFilters filter:" +
                prop +
                " is available for layer " +
                layer_name +
                " should apply filter",
              "info"
            );
            if (filter != "") {
              filter += " AND ";
            }

            if (_filters[prop].length > 0) {
              filter += `\"${prop}\" IN ( ${_filters[prop].join(" , ")} )`;
            } else {
              filter += `\"${prop}\" IN ( -1 )`;
            }
          }
        }
        log("getWMSFilters(" + layer_name + ")", "info", filter);
        return filter;
      }

      function getLayerFilters(layer_name) {
        log("getLayerFilters()", "info", { layer_name: layer_name });
        return new Promise((resolve, reject) => {
          if (appOnline) {
            _getFeatureTypeFromWFS(
              layer_name,
              function (layerAvailableFilters) {
                log(
                  "getLayerFilters() _getFeatureTypeFromWFS",
                  "info",
                  layerAvailableFilters
                );
                resolve(getWMSFilters(layer_name, layerAvailableFilters));
              }
            );
          } else {
            reject("offline");
          }
        });
      }
      //****************************************************************
      //***********************    END FILTERS     *********************
      //****************************************************************

      //****************************************************************
      //***********************        ZOOM       **********************
      //****************************************************************

      function setExtent(_extent) {
        log("setExtent()", "info", { extent: extent, "new extent": _extent });
        if (_extent === null) return;
        extent = _extent;
        let _vi = new ol.View({
          projection: viewProjection,
          extent: extent,
          center: [extent[0], extent[1]],
          zoom: zoom_level,
          minZoom: min_zoom_level,
        });

        map.setView(_vi);
      }
      //zoom to extent
      function zoomToExtend() {
        log("zoomToExtend()", "info", extent);
        map.getView().fit(extent, map.getSize());
        setZoomButtons();
      }

      function zoomIn() {
        if (map.getView().getZoom() < max_zoom_level) {
          map.getView().setZoom(map.getView().getZoom() + 1);
          log("zoomIn() -> Zoom level " + map.getView().getZoom(), "info");
        } else {
          log(
            "zoomIn() -> max level reached " + map.getView().getZoom(),
            "warn"
          );
          //should disable button
        }
        setZoomButtons();
      }

      function zoomOut() {
        if (map.getView().getZoom() > min_zoom_level) {
          log("zoomOut() -> Zoom level " + map.getView().getZoom(), "info");
          map.getView().setZoom(map.getView().getZoom() - 1);
        } else {
          log(
            "zoomOut() -> minimum level reached " + map.getView().getZoom(),
            "warn"
          );
          //should disable button
        }
        setZoomButtons();
      }

      function setZoomLevelAndCenter(level, center) {
        log("setZoomLevelAndCenter(" + level + ")", "info", center);
        try {
          if (level > min_zoom_level && level < max_zoom_level) {
            map.getView().setZoom(level);
          }
          if (typeof center == "object") {
            map.getView().setCenter(center);
          }
        } catch (e) {}
      }

      //resets directives
      function setZoomButtons() {
        var zoomIn = true;
        var zoomOut = true;
        if (map.getView().getZoom() <= 9) {
          zoomOut = false;
        }
        if (map.getView().getZoom() >= 25) {
          zoomIn = false;
        }
        $rootScope.$broadcast("zoomButtons", {
          zoomIn: zoomIn,
          zoomOut: zoomOut,
        });
      }

      function getHiglightedFeature() {
        return mapSelectTool.getSelectedFeauture();
      }

      function zoomToHiglightedFeature(geomString) {
        log("zoomToHiglightedFeature()", "info", geomString);
        if (typeof geomString != "undefined" && !geomString) {
          if (
            typeof mapSelectTool
              .getSelectedFeauture()
              .getGeometry()
              .getExtent() == "object"
          ) {
            map
              .getView()
              .fit(
                mapSelectTool.getSelectedFeauture().getGeometry().getExtent(),
                map.getSize()
              );
          }
        } else {
          var format = new ol.format.WKT({});
          var geom2Hightlight = format.readGeometry(geomString, {
            dataProjection: epsg,
            featureProjection: epsg,
          });
          map.getView().fit(geom2Hightlight.getExtent(), map.getSize());
        }
        if (getZoomLevel() >= 21) {
          map.getView().setZoom(21);
        }
        setZoomButtons();
      }

      function getZoomLevel() {
        return map.getView().getZoom();
      }

      function getZoomFromResolution() {
        return map
          .getView()
          .getZoomForResolution(map.getView().getResolution());
      }

      //****************************************************************
      //***********************      END ZOOM     **********************
      //****************************************************************

      //****************************************************************
      //***********************     ADD GEOJSON   **********************
      //****************************************************************

      function addGeoJson(geojson, style, layer_name = "geojson") {
        let stroke_color = style.stroke_color
          ? style.stroke_color
          : style.offline_stroke_color;
        let stroke_width = style.stroke_width
          ? style.stroke_width
          : offline_stroke_width;
        let fill_color = style.fill_color
          ? style.fill_color
          : offline_fill_color;
        let circle_radius = style.circle_radius ? style.circle_radius : 4;
        log("addGeoJson(", "info", { geojson, style });
        let features = new ol.format.GeoJSON().readFeatures(
          JSON.stringify(geojson)
        );

        log("addGeoJson features", "info", { features });
        if (features.length > 0) {
          let currentGeoJSONLayer = null;

          map
            .getLayers()
            .getArray()
            .filter((layer) => layer.get("name") === layer_name)
            .forEach((layer) => {
              currentGeoJSONLayer = layer;
              log("addGeoJson found geoJSONLayer", "success", { layer_name });
            });

          let source = currentGeoJSONLayer.getSource();

          /* source = new ol.source.Vector({
            features: features,
            useSpatialIndex: true,
          });*/
          //style layers by geometryType
          var geometryType = features[0].getGeometry().getType();
          log(
            "displayLayer from GeoJSON geometry type: " + geometryType,
            "info"
          );

          var style = new ol.style.Style({
            fill: new ol.style.Fill({
              color: fill_color,
            }),
            stroke: new ol.style.Stroke({
              color: stroke_color,
              width: stroke_width,
            }),
            image: new ol.style.Circle({
              radius: circle_radius,
              fill: new ol.style.Fill({
                color: fill_color,
              }),
            }),
            text: new ol.style.Text({
              font: "12px Calibri,sans-serif",
              fill: new ol.style.Fill({
                color: "#000",
              }),
            }),
          });

          if (style) currentGeoJSONLayer.setStyle(style);

          source.addFeatures(features);
        }
      }

      function addGeoJsonLayer(layer_name) {
        log("addGeoJsonLayer", "info", { layer_name });
        if (!geoJsonLayer) {
          var lay = new ol.layer.Vector({
            extent: extent,
            name: layer_name,
            source: new ol.source.Vector({}),
          });
          map.addLayer(lay);
          geoJsonLayer = true;
          log("addGeoJsonLayer", "success", { layer_name });
        }
      }

      function removeGeoJsonLayer(layer_name) {
        log("removeGeoJsonLayer", "info", { layer_name });
        map
          .getLayers()
          .getArray()
          .filter((layer) => layer.get("name") === layer_name)
          .forEach((layer) => {
            geoJsonLayer = false;
            map.removeLayer(layer);
            log("removeGeoJsonLayer", "success", { layer_name });
          });
      }
      //****************************************************************
      //**********************   END ADD GEOJSON  **********************
      //****************************************************************

      //****************************************************************
      //***********************      HELPERS      **********************
      //****************************************************************

      function setMincutId(_mincut_id) {
        mincut_id = _mincut_id;
      }

      function addresschosen(coordinates, highlight) {
        map.getView().setCenter(coordinates);
        map.getView().setZoom(20);
        if (highlight) {
          mapSelectTool.addresschosen(coordinates);
        }
      }

      //inject dependency dynamiclly
      function injectDependency(name, dependency) {
        if (name === "mapToc") {
          mapToc = dependency;
        }
      }

      function getResolution() {
        return map.getView().getResolution();
      }

      //gets map info for displaying it
      function getMapData() {
        var mapData = {};
        mapData.epsg = epsg;
        mapData.extent = extent;
        mapData.currentExtent = map.getView().calculateExtent();
        mapData.viewResolution = map.getView().getResolution();
        mapData.projection = map.getView().getProjection();
        mapData.center = map.getView().getCenter();
        mapData.layers = layers;
        mapData.layersVars = layersVars;
        mapData.activeLayer = activeLayer;
        return mapData;
      }

      function getMap() {
        return map;
      }

      function getclickedCooordinates() {
        if (clickedCooordinates) {
          return clickedCooordinates;
        } else {
          return map.getView().getCenter();
        }
      }
      //activate/desactivate geolocation
      function setUseGeolocation(what) {
        log("setUseGeolocation(" + what + ")", "info");
        useGeolocation = what;
        if (geolocation === null) {
          // create a Geolocation object setup to track the position of the device
          geolocation = new ol.Geolocation({
            tracking: true,
            projection: epsg,
          });
        }
      }

      //sets maxinum selectable number of features
      function setMaxFeatures(number) {
        log("setMaxFeatures(" + number + ")", "info");
        if (!isNaN(number)) {
          max_features = number;
          mapSelectTool.setMaxFeatures(max_features);
        }
      }

      //sets websocket connection status
      function setSocket(status) {
        log("setSocket(" + status + ")", "info");
        ws_status = status;
      }

      function resize() {
        log("resize()", "info");
        if (map) {
          map.updateSize();
        }
      }

      function cleanGeometries(what, resetTool) {
        log("cleanGeometries(" + what + ")", "info");
        //Reset tools if a tool is selected
        if (resetTool === null) {
          setTool(null);
        }
        if (what === "all") {
          vectorSource.clear();
          mapSelectTool.clearHighlight();
          mapAddTool.resetAddTools();
          map.getOverlays().forEach(function (lyr) {
            map.removeOverlay(lyr);
          });
        } else if (what === "selected") {
          mapSelectTool.clearHighlight();
        }
      }

      function setCurrentLayerTableName(db_table) {
        _CurrentLayerTableName = db_table;
        _CurrentLayerName = mapToc.getLayerNameByLayerTable(db_table);
      }

      function getCurrentLayerTableName() {
        return _CurrentLayerTableName;
      }

      function getCurrentLayerName() {
        return _CurrentLayerName;
      }

      function resetAddTools() {
        log("resetAddTools()", "info");
        mapAddTool.resetAddTools();
      }

      function addPoint() {
        log("addPoint()", "info");
        mapAddTool.addPoint(map.getView().getCenter(), toolSelected);
      }

      function clearAddPoint() {
        log("clearAddPoint()", "info");
        mapAddTool.clearAddPoint();
      }

      //fix styles for geometric overlays
      function setStyles(geom_colors) {
        log("setStyles()", "info", geom_colors);
        measureStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: geom_colors.measure_fill_color,
          }),
          stroke: new ol.style.Stroke({
            color: geom_colors.measure_stroke_color,
            lineDash: [10, 10],
            width: 2,
          }),
        });

        selectStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: geom_colors.select_stroke_color,
            width: 2,
          }),
          stroke: new ol.style.Stroke({
            color: geom_colors.select_fill_color,
          }),
        });

        addStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: geom_colors.select_fill_color,
          }),
          stroke: new ol.style.Stroke({
            color: geom_colors.select_stroke_color,
            width: 2,
          }),
          image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
              color: geom_colors.select_fill_color,
            }),
            stroke: new ol.style.Stroke({
              color: geom_colors.select_stroke_color,
              width: 2,
            }),
          }),
        });
      }

      function toggleCoordinates() {
        var controlExists = false;
        map.getControls().forEach(function (con) {
          if (con instanceof ol.control.MousePosition) {
            controlExists = con;
          }
        });
        if (!controlExists) {
          var mousePosition = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(2),
            projection: epsg,
            target: document.getElementById("myposition"),
            undefinedHTML: "&nbsp;",
          });
          map.addControl(mousePosition);
          localStorage.setItem("showCoordinates", 1);
          $rootScope.$broadcast("visualizationTools", {
            key: "showCoordinates",
            value: true,
          });
        } else {
          map.removeControl(controlExists);
          localStorage.setItem("showCoordinates", 0);
          $rootScope.$broadcast("visualizationTools", {
            key: "showCoordinates",
            value: false,
          });
        }
      }

      function extentContainsCoordinates(coordinates) {
        log("extentContainsCoordinates()", "info", coordinates);
        return ol.extent.containsCoordinate(extent, coordinates);
      }

      function toggleScale() {
        var controlExists = false;
        map.getControls().forEach(function (con) {
          if (con instanceof ol.control.ScaleLine) {
            controlExists = con;
          }
        });
        if (!controlExists) {
          var scaleLineControl = new ol.control.ScaleLine({
            units: "metric",
            target: document.getElementById("units"),
          });
          map.addControl(scaleLineControl);
          localStorage.setItem("showScale", 1);
          $rootScope.$broadcast("visualizationTools", {
            key: "showScale",
            value: true,
          });
        } else {
          map.removeControl(controlExists);
          localStorage.setItem("showScale", 0);
          $rootScope.$broadcast("visualizationTools", {
            key: "showScale",
            value: false,
          });
        }
      }

      //log function
      function log(evt, level, data) {
        if (typeof level == "undefined") {
          level = "log";
        }
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename + " v." + version,
          level: level,
        });
      }

      function getLocalizedStringValue(constant) {
        return localized_strings[constant];
      }
      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************
    },
  ]);
})();
