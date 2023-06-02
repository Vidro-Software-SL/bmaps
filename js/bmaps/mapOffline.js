(function () {
  /**
	 * Module for offline

	 
	 Version: 1.0.0
	 July 2012

		******************************************************************************************************

		Available methods:

		- init
				initializes module
					@param _proxyUrl (string) wmtms proxy url
					@param _touchDevice (int)

		- offlineDataAvailable
				get if there is offline data downloaded to local storage

		- getOfflineInfo
				gets info about stored info (extent, dates, ...)
					@return JSON

		- offlineReset
				resets storage

		- getEventId
				get last event id stored
					@return id(int)

		- setEventId
				set new event id and stores it
					@param id(int)

		- savePicture
				stores a photo (metadata in localStorage, binary in indexDb)

				@param visit_id(string)
				@param preview(binary)
				@param callback(function)

			*************** Background methods **************

		- offlineBackgroundAvailable
				get if there is offline background downloaded to local storage

		- offlineDataStoredDate
				gets stored date

		- displayBackground
				displays stored background
					@param source (ol.layer.Tile)
					@param extent (array)

		- selectAreaToDownload
				selects area to download, adds a feauture and interactions for dragging
					@param meters(int) number of meters for generate area to download
					@param _map(ol.map)

		- showSavedAreas
				renders saved areas
					@param _map(ol.map)

		- hideSavedAreas
				hides saved areas
					@param _map(ol.map)

		- hideBackground
				sets flag displayed offline background to false

		- downloadGeoJsonLayer
				Downloads a geoJSON from an url and stores it in localstorage
					@param layer (string) layer name: PROJECTNAME_layer.json

		- readOfflineGeoJSON
				Returns an stored geoJSON or null if is not available
					@param layer (string) layer name: PROJECTNAME_layer.json

		- readOfflineStyle
				Returns an stored js with styles or null if is not available
					@param layer (string) layer name: PROJECTNAME_layer.json

		- addVisitInfo

					@param visit_id
					@param heading
					@param formData
					@param images
					@param compasses
					@param photo
					@param okCb (function)
					@param koCb (function)

		- removeVisit

					@param visit_id (string)
					@param okCb (function)
					@param koCb (function)

		- getVisitEvents
				reads events from a visit

					@param visit_id (string)

		- updateEvent
				updates an stored event

					@param eventObj (object)
					@param key (string)
					@param value (string)

					@return bool

			*************** dump data methods **************

		- dumpData
				initiate dump data process to db

		-  setAjaxMethods
				sets ajax methods for dumping data
					@param _ajax_target (url)
					@param _ajaxMethodForVisit (function),
					@param _ajaxMethodForEvent (function)
					@param _mapPhotos (js module)

			*/
  angular.module("app").factory("mapOffline", [
    "$http",
    "$rootScope",
    "$window",
    "mapStorage",
    function ($http, $rootScope, $window, mapStorage) {
      var filename = "mapOffline.js",
        touchDevice = 0;
      var domainName = null; //domain name
      var storeName = "bmaps_default";
      var extentKey = "ga-offline-extent",
        maxZoom = 10, // max zoom level cached
        proxyUrl = null,
        isSelectorActive = false,
        isMenuActive = false,
        defaultResolutions = [
          4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500,
          1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1,
          0.5,
        ],
        wmsResolutions = defaultResolutions.concat([0.25, 0.1]),
        minRes = defaultResolutions[maxZoom],
        pool = 50,
        cursor,
        queue = [],
        projection = null,
        downloadableGeoJsons = [];

      var extent,
        isDownloading,
        isStorageFull,
        nbTilesCached,
        nbTilesEmpty,
        nbTilesFailed,
        nbTilesTotal,
        requests,
        sizeCached,
        startTime,
        getMagnitude,
        errorReport,
        localized_strings = {};

      //save
      var extentFeature = null; //ol.Feature for displaying extent to save
      var vectorSource = null; //source for extent selection
      var vectorLayer = null; //layer forextent selection
      var map = null; //ol.map
      var wmtsBackgroundRaster = null; //raster for wmtms background
      var extentSelect = null; //ol.interaction for select area to download
      var translateExtent = null; //ol.interaction for translate feature to select area to download
      var selectingAreaToDownload = false; //flag for knowing if selectin area to download is active or not
      var extentToSave = null; //extent for download
      var savedFeature = null; //ol.Feature for displaying saved background
      var vectorSourceSavedBg = null; //source saved background
      var vectorLayerSavedBg = null; //layer saved background
      var savedFeatureData = null; //ol.Feature for displaying saved data
      var vectorSourceSavedData = null; //source saved data
      var vectorLayerSavedData = null; //layer saved data
      var showingDownloadedAreas = false; //flag for knowing if is showing downloaded areas
      var mapPhotos = null; //photos module
      var _hashToDownload = null; //hash for download geoJson
      //background display
      var items = [];
      var tiles = [];
      var offlineBackgroundDisplayed = false;

      //dump data
      var ajaxMethodForVisit = null; //method for insertVisit ajax request
      var ajaxMethodForEvent = null; //method for insertEvent request
      var ajax_target = null;
      var token = null;
      var project_name = null;
      var userName = null;
      var project_id = null;
      var vidrotoken = null; //vidro token for vidroapi
      var vidroapi = null; //vidroapi url
      var project_name = null;

      // public API
      var dataFactory = {
        init: init,
        save: save,
        abort: abort,
        displayBackground: displayBackground,
        hideBackground: hideBackground,
        StartSaving: StartSaving,
        selectAreaToDownload: selectAreaToDownload,
        showSavedAreas: showSavedAreas,
        hideSavedAreas: hideSavedAreas,
        offlineConfigure: offlineConfigure,
        offlineDataAvailable: offlineDataAvailable,
        offlineBackgroundAvailable: offlineBackgroundAvailable,
        offlineDataStoredDate: offlineDataStoredDate,
        getAvailableGeoJson: getAvailableGeoJson, //download geoJSON
        readOfflineGeoJSON: readOfflineGeoJSON, //reads geoJSON stored
        readOfflineStyle: readOfflineStyle, //reads offline stored javascript with style
        readOfflineStyleGenericJsMethods: readOfflineStyleGenericJsMethods, //readsOffline generic methods for styling
        getVisit: getVisit, //TBR!!
        addVisit: addVisit, //TBR!!
        removeVisit: removeVisit, //TBR!!
        addVisitInfo: addVisitInfo, //TBR!!
        getVisitEvents: getVisitEvents, //TBR!!
        updateEvent: updateEvent, //TBR!!
        setAjaxMethods: setAjaxMethods,
        dumpData: dumpData,
        offlineReset: offlineReset,
        getOfflineInfo: getOfflineInfo,
        getEventId: getEventId,
        setEventId: setEventId,
        savePicture: savePicture,
        storeProjectInfo: storeProjectInfo,
        storeCapabilities: storeCapabilities,
        storeOfflineStrings: storeOfflineStrings,
        getStrings: getStrings,
        getCapAndPi: getCapAndPi,
      };
      return dataFactory;
      //****************************************************************
      //***********************      METHODS     ***********************
      //****************************************************************

      function init(
        _proxyUrl,
        _touchDevice,
        _localized_strings,
        _project_id,
        _project_name,
        _vidroapi,
        _vidrotoken
      ) {
        log(
          "init(" + _proxyUrl + "," + _touchDevice + "," + _project_id + ")",
          "info"
        );
        proxyUrl = _proxyUrl;
        touchDevice = _touchDevice;
        localized_strings = _localized_strings;
        var getUrl = window.location;
        domainName = getUrl.protocol + "//" + getUrl.host + "/";
        storeName = "bmaps_" + _project_id;
        project_id = _project_id;
        vidroapi = _vidroapi;
        vidrotoken = _vidrotoken;
        project_name = _project_name;
        /*	if(getUrl.pathname.split('/')[1]==="dev"){
				domainName = domainName+"demo/";
			}*/
        // On mobile we simulate synchronous tile downloading, because when
        // saving multilayers and/or layers with big size tile, browser is
        // crashing (mem or cpu).
        // TODO: Try using webworkers?
        pool = touchDevice ? 1 : 50;
        mapStorage.init(storeName);
        setupPrototypes();
        setTimeout(function () {
          $rootScope.$broadcast("offlineDownloadEvent", {
            evt: "setDownloadButtons",
            selectArea: true,
            startDownload: false,
            selectingArea: false,
            showAreas: true,
            downloading: false,
            donwloadLayersBt: false,
          });
        }, 1000);
      }

      //****************************************************************
      //***********************       GETTERS     **********************
      //****************************************************************

      function getOfflineInfo() {
        log("getOfflineInfo()", "info");
        var data = {
          offlineBackground: mapStorage.getItem(
            storeName + "_offlineBackground"
          ),
          background_extent: mapStorage.getItem(storeName + "_bgExtent"),
          background_stored_date: formatDate(
            mapStorage.getItem(storeName + "_bg_stored_date")
          ),
          offlineData: mapStorage.getItem(storeName + "_offlineData"),
          geojson_layers: mapStorage.getItem(storeName + "_geojson_layers"),
          geojson_stored_date: formatDate(
            mapStorage.getItem(storeName + "_geojson_stored_date")
          ),
          visits_stored_date: mapStorage.getItem(
            storeName + "_visits_stored_date"
          ),
        };
        mapStorage.localStorageSpace(function (err, data) {
          if (err) {
            console.log(err);
          } else {
            var totalUsed = data.indexDbUsedMb + data.localStorageUsed;
            $rootScope.$broadcast("offlineEvent", {
              evt: "localStorageSpace",
              data: data,
            });
          }
        });
        return data;
      }

      function offlineDataAvailable() {
        log("offlineDataAvailable()", "info");
        return mapStorage.getItem(storeName + "_offlineData");
      }

      function offlineBackgroundAvailable() {
        log("offlineBackgroundAvailable()", "info");
        return mapStorage.getItem(storeName + "_offlineBackground");
      }

      function offlineDataStoredDate() {
        log("offlineDataStoredDate()", "info");
        return mapStorage.getItem(storeName + "_geojson_stored_date");
      }

      //****************************************************************
      //***********************    END GETTERS    **********************
      //****************************************************************

      //****************************************************************
      //**********    Project info and capabilities    *****************
      //****************************************************************

      function storeProjectInfo(projectInfo, capabilities) {
        log("storeProjectInfo()", "info", projectInfo);
        mapStorage.setItem(
          storeName + "_projectInfo",
          JSON.stringify(projectInfo)
        );
      }

      function storeCapabilities(capabilities) {
        log("storeCapabilities()", "info", capabilities);
        mapStorage.setItem(
          storeName + "_capabilities",
          JSON.stringify(capabilities)
        );
      }

      function getCapAndPi(project_id) {
        log("getCapAndPi()", "info", project_id);
        storeName = "bmaps_" + project_id;
        return {
          projectInfo: JSON.parse(
            mapStorage.getItem(storeName + "_projectInfo")
          ),
          capabilities: JSON.parse(
            mapStorage.getItem(storeName + "_capabilities")
          ),
        };
      }
      //****************************************************************
      //********    END Project info and capabilities    ***************
      //****************************************************************

      //****************************************************************
      //********                END strings              ***************
      //****************************************************************

      function storeOfflineStrings(strings) {
        log("storeOfflineStrings()", "info", strings);
        mapStorage.setItem(storeName + "_strings", JSON.stringify(strings));
      }

      function getStrings(project_id) {
        log("getStrings()", "info", project_id);
        storeName = "bmaps_" + project_id;
        return {
          strings: JSON.parse(mapStorage.getItem(storeName + "_strings")),
        };
      }

      //****************************************************************
      //********                END strings              ***************
      //****************************************************************

      //****************************************************************
      //***********************      clear data   **********************
      //****************************************************************

      function offlineReset(version) {
        log("offlineReset()", "info");
        mapStorage.clearDatabase();
        mapStorage.resetFileSystem();
        mapStorage.clearCacheStorage(version);
      }

      //****************************************************************
      //***********************    end clear data   ********************
      //****************************************************************

      //****************************************************************
      //***********************      GEOJSON      **********************
      //****************************************************************
      function generateGeoJSON() {
        log("generateGeoJSON()", "info");
        var data2send = new FormData();
        data2send.append("token", token);
        data2send.append("what", "GENERATE_GEOJSON");
        data2send.append("project_name", project_name);
        data2send.append("userName", userName);
        userName;
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("generateGeoJSON()", "success", data);
          })
          .error(function (error) {
            log("error requesting generateGeoJSON", "error", error);
            //$rootScope.$broadcast('offlineDownloadEvent',{evt:"generateGeoJSON"});
          });
      }

      function removeGeneratedGeoJSON() {
        log("removeGeneratedGeoJSON()", "info");
        var hash = _hashToDownload.replace("_", "");
        var data2send = new FormData();
        //	data2send.append('token', 				token);
        //data2send.append('what', 					"GET_GEOJSON");
        data2send.append("what", "REMOVE_GENERATED_GEOJSON");
        data2send.append("project_name", project_name);
        data2send.append("extent_0", extentToSave[0]);
        data2send.append("extent_1", extentToSave[1]);
        data2send.append("extent_2", extentToSave[2]);
        data2send.append("extent_3", extentToSave[3]);
        data2send.append("userName", userName);
        data2send.append("hash", hash);

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("removeGeneratedGeoJSON() result:", "info", data);
          })
          .error(function (error) {
            log("error requesting removeGeneratedGeoJSON", "error", error);
          });
      }

      function getAvailableGeoJson(
        _ajax_target,
        _project_name,
        _token,
        _map,
        useConfirm,
        filters,
        availableFilterForLayers
      ) {
        log(
          "getAvailableGeoJson(" +
            _ajax_target +
            "," +
            _project_name +
            "," +
            _token +
            ")",
          "info",
          { useConfirm: useConfirm, filters: filters }
        );
        if (map === null) {
          map = _map;
        }
        ajax_target = _ajax_target;
        token = _token;
        project_name = _project_name;

        if (useConfirm) {
          if (
            typeof localized_strings.OFFLINE_DOWNLOAD_LAYERS_ALERT !=
            "undefined"
          ) {
            if (!confirm(localized_strings.OFFLINE_DOWNLOAD_LAYERS_ALERT)) {
              $rootScope.$broadcast("offlineDownloadEvent", {
                evt: "cancelDownload",
                selectArea: true,
                startDownload: false,
                selectingArea: false,
                showAreas: false,
                downloading: false,
                donwloadLayersBt: false,
              });
              return;
            }
          } else {
            if (
              !confirm(
                "You're going to download project layers. All previous data will be deleted!"
              )
            ) {
              $rootScope.$broadcast("offlineDownloadEvent", {
                evt: "cancelDownload",
                selectArea: true,
                startDownload: false,
                selectingArea: false,
                showAreas: false,
                downloading: false,
                donwloadLayersBt: false,
              });
              return;
            }
          }
        }

        $rootScope.$broadcast("offlineDownloadEvent", {
          evt: "startDownloadLayers",
          selectArea: false,
          startDownload: false,
          selectingArea: true,
          showAreas: false,
          downloading: true,
          donwloadLayersBt: false,
        });

        var data2send = new FormData();
        data2send.append("token", token);
        //data2send.append('what', 					"GET_GEOJSON");
        data2send.append("what", "GENERATE_GEOJSON");
        data2send.append("project_name", project_name);
        data2send.append("extent_0", extentToSave[0]);
        data2send.append("extent_1", extentToSave[1]);
        data2send.append("extent_2", extentToSave[2]);
        data2send.append("extent_3", extentToSave[3]);
        data2send.append("filters", JSON.stringify(filters));
        data2send.append(
          "availableFilterForLayers",
          JSON.stringify(availableFilterForLayers)
        );
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("getAvailableGeoJson() result:", "info", data);
            if (data.status === "Accepted") {
              mapStorage.removeItem(storeName + "_geojson_layers");
              for (var i = 0; i < data.message.files.length; i++) {
                downloadableGeoJsons.push(data.message.files[i]);
              }
              _proceedToDownloadGeoJsons(
                downloadableGeoJsons,
                data.message.hash
              );
            } else {
              $rootScope.$broadcast("offlineDownloadEvent", {
                evt: "geoJSONNoAvailableData",
              });
            }
          })
          .error(function (error) {
            log("error requesting getAvailableGeoJson", "error", error);
            $rootScope.$broadcast("offlineDownloadEvent", {
              evt: "geoJSONNoAvailableData",
            });
            restoreInteractions(map);
            $rootScope.$broadcast("offlineDownloadEvent", {
              evt: "setDownloadButtons",
              selectArea: true,
              startDownload: false,
              selectingArea: false,
              showAreas: false,
              downloading: false,
              donwloadLayersBt: false,
            });
          });
      }

      function _proceedToDownloadGeoJsons(downloadableGeoJsons, hash) {
        _hashToDownload = hash + "_";
        log(
          "_proceedToDownloadGeoJsons(" + hash + ") result:",
          "info",
          downloadableGeoJsons
        );
        if (downloadableGeoJsons.length > 0) {
          downloadGeoJsonLayer(
            downloadableGeoJsons[0],
            callbackDownloadGeoJsonOk,
            callbackDownloadGeoJsonKo
          );
        } else {
          $rootScope.$broadcast("offlineDownloadEvent", {
            evt: "geoJSONNoAvailableData",
          });
        }
      }

      function callbackDownloadGeoJsonOk(layer_name) {
        log("callbackDownloadGeoJsonOk(" + layer_name + ")");
        var index = downloadableGeoJsons.indexOf(layer_name);
        if (index > -1) {
          downloadableGeoJsons.splice(index, 1);
        }
        $rootScope.$broadcast("offlineDownloadEvent", {
          evt: "geoJSONStored",
          name: layer_name.replace(_hashToDownload, ""),
        });
        if (downloadableGeoJsons.length > 0) {
          log("Waiting 2s to start downloading next layer");
          setTimeout(function () {
            log("Downloading: " + downloadableGeoJsons[0]);
            downloadGeoJsonLayer(
              downloadableGeoJsons[0],
              callbackDownloadGeoJsonOk,
              callbackDownloadGeoJsonKo
            );
          }, 2000);
        } else {
          log("No more layers", "info");
          hideSavedAreas();
          $rootScope.$broadcast("offlineDownloadEvent", {
            evt: "geoJSONStoredEnd",
          });
          removeGeneratedGeoJSON();
        }
      }

      function callbackDownloadGeoJsonKo(layer_name, msg, data) {
        log(
          "callbackDownloadGeoJsonKo(" + layer_name + "," + msg + ")",
          "info",
          data
        );
        $rootScope.$broadcast("offlineDownloadEvent", {
          evt: "geoJSONStoredError",
          name: layer_name.replace(_hashToDownload, ""),
          error: data,
        });
      }

      function downloadGeoJsonLayer(layer_name, okCb, koCb) {
        log(
          "downloadGeoJsonLayer(" + layer_name + ")",
          "info",
          _hashToDownload
        );

        //	var url = domainName+"bmaps/offline/"+layer_name;
        var url = `${vidroapi}giswater/geojson/${project_id}/${layer_name}`;
        $rootScope.$broadcast("offlineDownloadEvent", {
          evt: "geoJSONStartDownload",
          name: layer_name.replace(_hashToDownload, ""),
        });
        $http({
          method: "GET",
          url: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${vidrotoken}`,
          },
        })
          .success(function (data) {
            log(
              "downloadGeoJsonLayer(" + layer_name + ") result: ",
              "info",
              data
            );
            //store flags
            setTimeout(function () {
              var layer_name_to_store = `${project_name}_${layer_name}`;
              //	var extension 						= layer_name_to_store.split(".");
              //if(extension[extension.length-1]==="json"){
              log(
                "downloadGeoJsonLayer(" + layer_name + ") store JSON",
                "info",
                data
              );

              mapStorage.setItem(
                storeName + "_geojson_stored_date",
                new Date()
              );
              var geojson_stored_layers = JSON.parse(
                mapStorage.getItem(storeName + "_geojson_layers")
              );

              if (geojson_stored_layers) {
                geojson_stored_layers.push(layer_name_to_store);
              } else {
                geojson_stored_layers = Array(layer_name_to_store);
              }
              mapStorage.setItem(
                storeName + "_geojson_layers",
                JSON.stringify(geojson_stored_layers)
              );
              setTimeout(function () {
                mapStorage.setItem(storeName + "_offlineData", true);
                //store geoJSON in local storage
                mapStorage.removeItem(layer_name);
                setTimeout(function () {
                  log(
                    "Layer downloaded from server, inserting data in localForage",
                    "info"
                  );
                  mapStorage.setTile(
                    layer_name_to_store,
                    JSON.stringify(data.message),
                    function (err, content) {
                      if (err) {
                        log(
                          "downloadGeoJsonLayer (" +
                            layer_name +
                            ") error inserting",
                          "error",
                          err
                        );
                        koCb(layer_name, err, data.message);
                      } else {
                        log(
                          "downloadGeoJsonLayer (" +
                            layer_name_to_store +
                            ") successfully stored localForage",
                          "success"
                        );
                        okCb(layer_name);
                      }
                    }
                  );
                }, 100);
              }, 200);

              /*	}else{
						log("downloadGeoJsonLayer("+layer_name+") store JS","info",data);
					//	mapStorage.removeFileFromFileSystem(layer_name.replace(_hashToDownload, ''))
						mapStorage.writeFileOnFileSystem(layer_name.replace(_hashToDownload, ''),data.message,function(err,msg){
							if(err){
                console.error("error writing data")
								koCb(layer_name,"downloadGeoJsonLayer("+layer_name+") error on filesystem",err);
							}else{
								okCb(layer_name);
							}
						});
						//
					}*/
            }, 100);
          })
          .error(function (response) {
            log(
              "downloadGeoJsonLayer(" + layer_name + ") error: ",
              "error",
              response
            );
            koCb(
              layer_name,
              "downloadGeoJsonLayer(" + layer_name + ") error on get",
              url
            );
          });
      }

      function readOfflineGeoJSON(layer, cb) {
        log("readOfflineGeoJSON(" + layer + ")", "info");
        layer = layer.split(" ").join("XXX");
        var request = window.indexedDB.open(domainName);
        request.onerror = function (err) {
          log("request.onerror", "error", err);
          cb("error reading geoJSON for layer: " + layer + " " + err, err);
        };
        request.onsuccess = function (event) {
          log("request.onsuccess", "success", event);
          var db = event.target.result;
          var trans = db.transaction(storeName, IDBTransaction.READ_ONLY);
          var store = trans.objectStore(storeName);
          var request2 = store.get(layer);
          request2.onerror = function (event2) {
            log("request2.onerror", "error", event2);
            cb(event2, null);
          };
          request2.onsuccess = function (event3) {
            log("request2.onsuccess", "success", event3);
            try {
              var storedGeoJson = event3.target.result;
              if (storedGeoJson) {
                cb(null, JSON.parse(storedGeoJson));
              } else {
                cb(null, null);
              }
            } catch (e) {
              log(
                "error parsing stored geoJSON for layer: " + layer,
                "error",
                e
              );
              cb(
                "error parsing stored geoJSON for layer: " + layer,
                storedGeoJson
              );
            }
          };
        };
      }

      function readOfflineStyle(layer, cb) {
        log("readOfflineStyle(" + layer + ")", "info");
        layer = layer.split(" ").join("XXX");
        mapStorage.readFileFromFileSystem(layer, function (err, func) {
          if (err) {
            cb("error reading stylesheet for layer: " + layer + " " + err, err);
            return;
          } else {
            log("readOfflineStyle readFileFromFileSystem", "success");
            cb(null, func);
          }
        });
      }

      function readOfflineStyleGenericJsMethods(fileName, cb) {
        log("readOfflineStyleGenericJsMethods", "info", fileName);
        mapStorage.readFileFromFileSystem(fileName, function (err, func) {
          if (err) {
            cb(err, err);
            return;
          } else {
            log("readOfflineStyleGenericJsMethods", "success");
            cb(null, func);
          }
        });
      }
      //****************************************************************
      //***********************     END GEOJSON   **********************
      //****************************************************************
      //****************************************************************

      //****************************************************************
      //***********************     SAVE BACKGROUND   ******************
      //****************************************************************
      //Selects area for download
      function selectAreaToDownload(meters, _map) {
        log("selectAreaToDownload(" + meters + ")", "info");
        if (map === null) {
          map = _map;
        }
        renderAreaToDownLoad(meters);
      }

      //configures are to download
      function offlineConfigure(
        _map,
        what,
        ajax_target,
        project_name,
        token,
        _userName,
        _bgOptions,
        useConfirm,
        filters,
        availableFilterForLayers
      ) {
        log("offlineConfigure()", "info", {
          _map: _map,
          what: what,
          ajax_target: ajax_target,
          project_name: project_name,
          token: token,
          _userName: _userName,
          _bgOptions: _bgOptions,
          useConfirm: useConfirm,
        });

        if (map === null) {
          map = _map;
        }
        userName = _userName;
        $rootScope.$broadcast("offlineDownloadEvent", {
          evt: "setDownloadButtons",
          selectArea: false,
          startDownload: false,
          selectingArea: false,
          showAreas: false,
          downloading: true,
          donwloadLayersBt: true,
        });
        getExtenToDownload();
        if (what === "background") {
          if (_bgOptions === null) {
            //default background
            _bgOptions = {
              bg_base_url:
                "https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/service",
              layer: "topogris",
              matrixSet: "UTM25831",
            };
          }
          renderWMTSLayers(_bgOptions);
        } else {
          //download layers
          log("offlineConfigure()", "info", extentToSave);
          getAvailableGeoJson(
            ajax_target,
            project_name,
            token,
            map,
            useConfirm,
            filters,
            availableFilterForLayers
          );
        }
      }

      function renderWMTSLayers(bgOptions) {
        if (typeof bgOptions == "undefined") {
          //default background
          bgOptions = {
            bg_base_url:
              "https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wmts/service",
            layer: "topogris",
            matrixSet: "UTM25831",
          };
        }
        log("renderWMTSLayers()", "info");
        var parser = new ol.format.WMTSCapabilities();
        $http({
          method: "GET",
          url:
            bgOptions.bg_base_url +
            "?service=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities",
        }).success(function (data) {
          try {
            var result = parser.read(data);
            var options = ol.source.WMTS.optionsFromCapabilities(result, {
              layer: bgOptions.layer,
              matrixSet: bgOptions.matrixSet,
            });
            options.urls[0] = bgOptions.bg_base_url;
            var source = new ol.source.WMTS(options);
            var tileGrid = source.getTileGrid();
            defaultResolutions = tileGrid.getResolutions();
            wmtsBackgroundRaster = new ol.layer.Tile({});
            wmtsBackgroundRaster.setSource(source);
            map.addLayer(wmtsBackgroundRaster);
            //once is rendered, start saving
            save(data, bgOptions);
          } catch (e) {
            alert("Error rendering wmts background layer:\n" + e);
          }
        });
      }

      function save(capabilities, bgOptions) {
        log("Save()", "info");
        // Get the cacheable layers
        var layers = getCacheableLayers(map.getLayers().getArray(), true);

        if (layers.length == 0) {
          if (
            typeof localized_strings.OFFLINE_DOWNLOAD_NO_BACKGROUND_ALERT !=
            "undefined"
          ) {
            alert(localized_strings.OFFLINE_DOWNLOAD_NO_BACKGROUND_ALERT);
          } else {
            alert("offline_no_cacheable_layers");
          }
          return;
        }
        if (
          typeof localized_strings.OFFLINE_DOWNLOAD_BACKGROUND_ALERT !=
          "undefined"
        ) {
          //legacy confirm delete database
          /*	if (!confirm(localized_strings.OFFLINE_DOWNLOAD_BACKGROUND_ALERT)) {
						return;
					}*/
        } else {
          /*	if (!confirm(localized_strings.OFFLINE_DOWNLOAD_BACKGROUND_ALERT)) {
						return;
					}*/
        }

        $rootScope.$broadcast("offlineDownloadEvent", { evt: "downloading" });
        //delete previous data
        //mapStorage.clearDatabase();
        initDownloadStatus();
        //empty previous storage
        mapStorage.removeItem(storeName + "_bgCapabilities");

        mapStorage.removeItem(storeName + "_bg_stored_date");
        //store capabilities in local storage
        mapStorage.setItem(storeName + "_bgCapabilities", capabilities);
        mapStorage.setItem(storeName + "_bgBaseUrl", bgOptions.bg_base_url);
        mapStorage.setItem(storeName + "_bgLayer", bgOptions.layer);
        mapStorage.setItem(storeName + "_bgMatrixSet", bgOptions.matrixSet);
        mapStorage.setItem(storeName + "_offlineBackground", true);
        //add donwloaded extent to offline db
        var currentExtent = mapStorage.getItem(storeName + "_bgExtent");
        if (!currentExtent) {
          currentExtent = Array();
        } else {
          currentExtent = JSON.parse(currentExtent);
        }
        currentExtent.push(extentToSave.toString());

        mapStorage.setItem(
          storeName + "_bgExtent",
          JSON.stringify(currentExtent)
        );
        mapStorage.setItem(storeName + "_bg_stored_date", new Date());
        extent = extentToSave;
        // We go through all the cacheable layers.
        projection = map.getView().getProjection();
        queue = [];
        log("save()-> layers: ", "info", layers);
        for (var i = 0, ii = layers.length; i < ii; i++) {
          var layer = layers[i];
          // if the layer is a KML
          if (isKmlLayer(layer) && "/^https?:///.test(layer.url)") {
            $http
              .get(proxyUrl + encodeURIComponent(layer.url))
              .success(function (data) {
                mapStorage.setItem(layer.id, data);
              });
            layersBg.push(false);
            continue;
          }
          var source = layer.getSource();
          var tileGrid = source.getTileGrid();
          var tileUrlFunction = source.getTileUrlFunction();
        }
        // For each zoom level we generate the list of tiles to download:
        for (var zoom = 0; zoom <= maxZoom; zoom++) {
          var z = zoom; // data zoom level
          if (!isCacheableLayer(layer, z)) {
            continue;
          }
          var tileExtent = extent;
          var tileRange = tileGrid.getTileRangeForExtentAndZ(tileExtent, z);
          var centerTileCoord = [
            z,
            (tileRange.minX + tileRange.maxX) / 2,
            (tileRange.minY + tileRange.maxY) / 2,
          ];
          var queueByZ = [];
          for (var x = tileRange.minX; x <= tileRange.maxX; x++) {
            for (var y = tileRange.minY; y <= tileRange.maxY; y++) {
              var tileCoord = [z, x, y];
              var tile = {
                magnitude: getMagnitude(tileCoord, centerTileCoord),
                url: tileUrlFunction(
                  tileCoord,
                  ol.has.DEVICE_PIXEL_RATIO,
                  projection
                ),
              };
              queueByZ.push(tile);
            }
          }
          // We sort tiles by distance from the center
          // The first must be dl in totality so no need to sort tiles,
          // the storage goes full only for the 2nd or 3rd layers.
          if (i > 0 && zoom > 6) {
            queueByZ.sort(function (a, b) {
              return a.magnitude - b.magnitude;
            });
          }
          queue = queue.concat(queueByZ);
        }
        // Start downloading tiles.
        isDownloading = true;
        nbTilesTotal = queue.length;
        startTime = new Date().getTime();
        cursor = 0;
        runNextRequests();
      }

      function runNextRequests() {
        log("runNextRequests()", "info");
        var requestsLoaded = 0;
        for (
          var j = cursor, jj = cursor + pool;
          j < jj && j < nbTilesTotal;
          j++
        ) {
          if (isStorageFull) {
            break;
          }
          var tile = queue[j];
          var tileUrl = transformIfAgnostic(tile.url);
          var xhr = new XMLHttpRequest();
          xhr.tileUrl = tile.url;
          xhr.open("GET", tileUrl, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = function (e) {
            var response = e.target.response;
            if (!response || response.byteLength === 0) {
              // Tile empty
              nbTilesEmpty++;
              onTileSuccess(0);
            } else {
              readResponse(
                e.target.tileUrl,
                response,
                e.target.getResponseHeader("content-type")
              );
            }
            onLoadEnd(++requestsLoaded, j);
          };
          xhr.onerror = function (e) {
            onTileError(e.target.tileUrl, "Request error");
            onLoadEnd(++requestsLoaded, j);
          };
          xhr.onabort = function (e) {
            onTileError(e.target.tileUrl, "Request abort");
            onLoadEnd(++requestsLoaded, j);
          };
          xhr.ontimeout = function (e) {
            onTileError(e.target.tileUrl, "Request timed out");
            onLoadEnd(++requestsLoaded, j);
          };
          xhr.send();
          requests.push(xhr);
          cursor++;
        }
      }

      // Defines if a layer is cacheable at a specific data zoom level.
      function isCacheableLayer(layer, z) {
        if (layer.getSource() instanceof ol.source.TileImage) {
          if (layer.getSource().getTileGrid()) {
            var resolutions = layer.getSource().getTileGrid().getResolutions();
            var max = layer.getMaxResolution() || resolutions[0];
            if (!z && max > minRes) {
              return true;
            }
            var min =
              layer.getMinResolution() || resolutions[resolutions.length - 1];
            var curr = resolutions[z];
            if (curr && max > curr && curr >= min) {
              return true;
            }
          } else {
            return false;
          }
        } else if (isKmlLayer(layer)) {
          if (layer instanceof ol.layer.Image) {
            alert("Layer too big: " + layer.label);
          } else {
            return true;
          }
        } else {
          // TODO: inform the user about which layer can't be saved in the help
        }
        return false;
      }

      // Get cacheable layers of a map.
      function getCacheableLayers(layers, onlyVisible) {
        var cache = [];
        for (var i = 0, ii = layers.length; i < ii; i++) {
          var layer = layers[i];
          if (onlyVisible && !layer.getVisible()) {
            //continue;
          }
          if (layer instanceof ol.layer.Group) {
            cache = cache.concat(
              getCacheableLayers(layer.getLayers().getArray())
            );
          } else if (isCacheableLayer(layer)) {
            cache.push(layer);
          }
        }
        return cache;
      }

      // We can't use xmlhttp2.onloadend event because it's doesn't work on
      // android browser
      function onLoadEnd(nbLoaded, nbTotal) {
        if (!isStorageFull && nbLoaded == pool) {
          // $timeout service with an interval doesn't work on android
          // browser.
          if (nbTotal % 200 === 0) {
            // We make a pause to don't break the safari browser (cpu).
            setTimeout(runNextRequests, 5000);
          } else {
            runNextRequests();
          }
        }
      }

      //****************************************************************
      //***********************    END SAVE       **********************
      //****************************************************************

      //****************************************************************
      //***********************       ABORT       **********************
      //****************************************************************

      function abort() {
        isDownloading = false;
        // We abort the requests and clear the storage
        for (var j = 0, jj = requests.length; j < jj; j++) {
          requests[j].abort();
        }
        // Clear tiles database
        mapStorage.clearTiles(function (err) {
          if (err) {
            //OJO
            alert("offline_clear_db_error");
          } else {
            initDownloadStatus();
            // Remove specific property of layers (currently only KML layers)
            var layersId = gaStorage.getItem(layersKey).split(",");
            for (var j = 0, jj = layersId.length; j < jj; j++) {
              //OJO
              mapStorage.removeItem(layersId[j]);
            }
            $rootScope.$broadcast("gaOfflineAbort");
          }
        });
      }

      //****************************************************************
      //***********************      END ABORT    **********************
      //****************************************************************

      //****************************************************************
      //******************      BACKGROUND DISPLAY        **************
      //****************************************************************
      function hideBackground() {
        log("hideBackground()", "info");
        offlineBackgroundDisplayed = false;
      }

      function displayBackground(raster, extent) {
        log("displayBackground", "info", raster);
        log("displayBackground", "info", extent);
        if (!offlineBackgroundDisplayed) {
          function getAllItems(db, callback) {
            var trans = db.transaction(storeName, IDBTransaction.READ_ONLY);
            var store = trans.objectStore(storeName);
            trans.oncomplete = function (evt) {
              //based on capabilities stored in localstorage
              var storedCapabilities = mapStorage.getItem(
                storeName + "_bgCapabilities"
              );
              var parser = new ol.format.WMTSCapabilities();
              var result = parser.read(storedCapabilities);
              var options = ol.source.WMTS.optionsFromCapabilities(result, {
                layer: mapStorage.getItem(storeName + "_bgLayer"),
                matrixSet: mapStorage.getItem(storeName + "_bgMatrixSet"),
                url: mapStorage.getItem(storeName + "_bgBaseUrl"),
                /*	tileLoadFunction: function(imageTile, src) {
																								var imgElement = imageTile.getImage();
																								// check if image data for src is stored in your cache
																								var imgsrc 		= getRoomIndex('key',src);
																								imgElement.src = mapStorage.decompress(imgsrc);
																							}*/
              });
              options.urls[0] = mapStorage.getItem(storeName + "_bgBaseUrl");
              var source = new ol.source.WMTS(options);

              defaultResolutions = source.getTileGrid().getResolutions();

              function customLoader(imageTile, src) {
                var imgElement = imageTile.getImage();
                // check if image data for src is stored in your cache
                var imgsrc = getRoomIndex("key", src);
                imgElement.src = mapStorage.decompress(imgsrc);
              }
              source.setTileLoadFunction(customLoader);
              raster.setSource(source);
              offlineBackgroundDisplayed = true;
              function getRoomIndex(key, value) {
                for (var p = 0; p < tiles.length; p++) {
                  if (tiles[p].key === value) {
                    return tiles[p].value;
                  }
                }
              }
            };

            var cursorRequest = store.openCursor();

            cursorRequest.onerror = function (error) {
              console.warn(error);
            };

            cursorRequest.onsuccess = function (evt) {
              var cursor = evt.target.result;
              if (cursor) {
                items.push(cursor.key);
                tiles.push({ key: cursor.key, value: cursor.value });
                cursor.continue();
              }
            };
          }

          var request = window.indexedDB.open(domainName);
          request.onerror = function (event) {
            // Do something with request.errorCode!
          };
          request.onsuccess = function (event) {
            getAllItems(event.target.result, function (items) {});
          };
        } else {
          log("offline background already displayed", "warn");
        }
      }

      //****************************************************************
      //******************   END BACKGROUND DISPLAY        *************
      //****************************************************************

      //****************************************************************
      //*********************         EXTENT      **********************
      //****************************************************************

      //****************************************************************
      //*********************       END EXTENT      ********************
      //****************************************************************

      function StartSaving(proxyUrl) {
        // Nothing to save or only KML layers
        if (queue.length == 0) {
          alert("offline_no_cacheable_layers");
          abort();
          return;
        }
        // We can't use xmlhttp2.onloadend event because it's doesn't work on
        // android browser
        var onLoadEnd = function (nbLoaded, nbTotal) {
          if (!isStorageFull && nbLoaded == pool) {
            // $timeout service with an interval doesn't work on android
            // browser.
            //OJO
            if (gaBrowserSniffer.ios && nbTotal % 200 === 0) {
              // We make a pause to don't break the safari browser (cpu).
              setTimeout(runNextRequests, 5000);
            } else {
              runNextRequests();
            }
          }
        };
      }

      //****************************************************************
      //***********************    END  METHODS   **********************
      //****************************************************************

      //****************************************************************
      //***********************       VISITS      **********************
      //****************************************************************

      //******************    checkPreviousVisit      ******************

      function checkPreviousVisit(element_id, layer) {
        log("checkPreviousVisit(" + element_id + "," + layer + ")", "info");
        var visits = mapStorage.getItem(storeName + "_visits");
        var exists = false;
        if (visits) {
          //check previous visits
          var parsedVisits = JSON.parse(visits);
          for (var i = 0; i < parsedVisits.length; i++) {
            var item = parsedVisits[i];
            if (item["temporalId"] === layer + ":" + element_id) {
              exists = true;
              break;
            }
          }
        }
        return exists;
      }

      //******************    end checkPreviousVisit  ******************

      //******************          getVisit          ******************

      function getVisit(element_id, layer, extraData, okCb, koCb) {
        log("getVisit()", "info");
        var exists = checkPreviousVisit(element_id, layer);
        if (exists) {
          okCb("update", extraData);
        } else {
          okCb("insert", extraData);
        }
      }

      //******************        end getVisit        ******************

      //******************          addVisit          ******************

      function addVisit(epsg, pol_id, coordinates, layer, callback) {
        log(
          "addVisit(" +
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
        var newElement = {
          epsg: epsg,
          pol_id: pol_id,
          coordinates: coordinates,
          layer: layer,
          temporalId: layer + ":" + pol_id,
        };
        var visits = JSON.parse(mapStorage.getItem(storeName + "_visits"));
        var temporalEventId = getEventId();
        temporalEventId = temporalEventId + 1;
        setEventId(temporalEventId);
        var returnObj = {
          layer_id: layer,
          element_id: pol_id,
          visit_id: layer + ":" + pol_id,
          temporalEventId: temporalEventId,
        };
        if (visits !== null) {
          //visits stored, check if a previous visit for this element exists
          if (!checkPreviousVisit(pol_id, layer)) {
            visits.push(newElement);
            mapStorage.setItem(storeName + "_visits", JSON.stringify(visits));
            returnObj["status"] = "insert";
          } else {
            returnObj["status"] = "update";
          }
          callback(null, returnObj);
          log(
            "addVisit temporal id: " +
              layer +
              ":" +
              pol_id +
              " event temporalId: " +
              temporalEventId,
            "success"
          );
        } else {
          //no visits stored
          mapStorage.setItem(
            storeName + "_visits",
            JSON.stringify([newElement])
          );
          var returnObj = {
            layer_id: layer,
            element_id: pol_id,
            status: "insert",
            visit_id: layer + ":" + pol_id,
          };
          callback(null, returnObj);
        }
        mapStorage.removeItem(storeName + "_visits_stored_date");
        mapStorage.setItem(storeName + "_visits_stored_date", new Date());
      }

      //******************        end addVisit        ******************

      //******************        removeVisit          *****************

      function removeVisit(visit_id, okCb, koCb) {
        log("removeVisit(" + visit_id + ")", "info");
        var visits = mapStorage.getItem(storeName + "_visits");
        var index = -1;
        if (visits) {
          //check if previous visits
          var parsedVisits = JSON.parse(visits);
          for (var i = 0; i < parsedVisits.length; i++) {
            var item = parsedVisits[i];
            if (item["temporalId"] === visit_id) {
              index = i;
              break;
            }
          }
          parsedVisits.splice(index, 1);
          mapStorage.setItem("visits", JSON.stringify(parsedVisits));
          okCb();
        }
      }

      //******************         end removeVisit     *****************
      function getVisitEvents(visit_id) {
        log("getVisitEvents(" + visit_id + ")", "info");
        var visit_events = JSON.parse(
          mapStorage.getItem(storeName + "_visit_events")
        );
        var returnData = [];
        for (var i = 0; i < visit_events.length; i++) {
          if (visit_events[i]["visit_id"] === visit_id) {
            returnData.push(visit_events[i]);
          }
        }
        return returnData;
      }

      function setEventId(id) {
        log("setEventId(" + id + ")", "info");
        mapStorage.setItem(storeName + "_event_id", parseInt(id));
      }

      function getEventId() {
        log("getEventId()", "info");
        var id = mapStorage.getItem(storeName + "_event_id");
        if (id === null) {
          log("getEventId() not id stored", "info");
          mapStorage.setItem(storeName + "_event_id", 1);
          return 0;
        } else {
          log("getEventId() last id stored: " + id, "info");
          return parseInt(id);
        }
      }
      //****************************************************************
      //********************         END VISITS         ****************
      //****************************************************************
      //****************************************************************
      //***********************   DUMP DATA TO DB  *********************
      //****************************************************************

      //***********************        dumpData     ********************
      //TBR!!!!  initiate dumping data to db
      function dumpData() {
        log("dumpData()", "info");
      }

      //***********************   InsertNextVisit  *********************
      //try to insert visit in DB and get real visit ID
      function InsertNextVisit(visit, _visit_events) {
        log("InsertNextVisit(" + visit + ")", "info", _visit_events);
        $rootScope.$broadcast("offlineEvent", {
          evt: "dumpData",
          text: "InsertNextVisit",
        });
        var ve = _visit_events;
        ajaxMethodForVisit(
          ajax_target,
          visit.epsg,
          visit.pol_id,
          visit.coordinates,
          visit.layer,
          function (e, data) {
            //remove visit from local storage
            removeVisit(
              visit.temporalId,
              function () {
                log("removeVisit(" + visit.temporalId + ") OK", "success");
              },
              function () {
                log("removeVisit(" + visit.temporalId + ") KO", "warn");
              }
            );
            for (var e = 0; e < ve.length; e++) {
              //updates events visit id with real id (the one that cames from DB)
              updateEvent(ve[e], "visit_id", data.visit_id);
              //update photos id_visit
              updatePhotovisitId(ve[e].temporalEventId, data.visit_id);
            }

            var visit_events = getVisitEvents(data.visit_id);
            log("InsertNextVisit, initiate photos uploading in 1s", "info");
            setTimeout(function () {
              if (visit_events.length > 0) {
                //inserts events in DB
                InsertNextEvent(data.visit_id);
              }
            }, 1000);
          },
          function (msg, data) {
            log("InsertNextVisit :" + msg, "error", data);
          }
        );
      }

      //***********************   InsertNextEvent  *********************
      function InsertNextEvent(visit_id) {
        log("InsertNextEvent(" + visit_id + ")", "info");
        var visit_events = getVisitEvents(visit_id);
        log(
          "InsertNextEvent - visit_events: " + visit_events.length,
          "info",
          visit_events
        );
        if (visit_events.length > 0) {
          var event = visit_events[0];
          //first upload photos
          uploadPhotosFromEvent(event, function (e, data) {
            log(
              "InsertNextEvent uploadPhotosFromEvent " +
                data.temporalEventId +
                " result:" +
                e,
              "info",
              data
            );
            if (e === "done") {
              log(
                "InsertNextEvent, all photos uploaded, starting inserting event...",
                "success"
              );
              $rootScope.$broadcast("offlineEvent", {
                evt: "dumpData",
                text: "uploadingEvents",
              });
              //read event with updated photos
              var _event = getEvent(event.temporalEventId);
              //inserts event in DB
              ajaxMethodForEvent(
                ajax_target,
                _event.visit_id,
                _event.compass,
                _event.formData,
                _event.photos,
                _event.compasses,
                null,
                function () {
                  log("InsertNextEvent ajaxMethodForEvent ok", "info");
                  removeEvent(event);
                  InsertNextEvent(visit_id);
                },
                function (msg, data) {
                  log("InsertNextEvent ajaxMethodForEvent" + msg, "warn", data);
                }
              );
            }
          });
        } else {
          log("InsertNextEvent no more events", "info");
          dumpData();
        }
      }

      function uploadPhotosFromEvent(storedEvent, callback) {
        log(
          "uploadPhotosFromEvent(" + storedEvent.temporalEventId + ")",
          "info",
          storedEvent
        );
        $rootScope.$broadcast("offlineEvent", {
          evt: "dumpData",
          text: "uploadingPhotos",
        });
        //upload photos
        var eventPhotos = getOfflinePhotosFromEvent(
          storedEvent.temporalEventId
        );
        if (eventPhotos.length > 0) {
          log(
            "uploadPhotosFromEvent event " +
              storedEvent.temporalEventId +
              " has " +
              eventPhotos.length +
              " photos",
            "info"
          );
          //get Photo
          getPhoto(eventPhotos[0].photo_id, function (e, photo) {
            if (e === null) {
              //try to upload photo
              mapPhotos.savePicture(
                ajax_target,
                storedEvent.visit_id,
                photo,
                function (e2, visit_id, data) {
                  if (e2 === null) {
                    //real photo_id is in data.photo_id
                    //remove photo form temporal and update event
                    updateEventPhoto(
                      storedEvent.temporalEventId,
                      eventPhotos[0].photo_id,
                      data.photo_id
                    );
                    removePhoto(eventPhotos[0].photo_id, function () {
                      //wait 5s to upload next photo
                      $rootScope.$broadcast("offlineEvent", {
                        evt: "dumpData",
                        text: "preparingPhoto",
                      });
                      log(
                        "uploadPhotosFromEvent " +
                          storedEvent.temporalEventId +
                          " pause 3 seconds",
                        "info"
                      );
                      //upload next photo
                      setTimeout(function () {
                        log(
                          "uploadPhotosFromEvent next photo from event: " +
                            storedEvent.temporalEventId,
                          "info"
                        );
                        uploadPhotosFromEvent(storedEvent, callback);
                      }, 3000);
                    });
                  } else {
                    log(
                      "uploadPhotosFromEvent savePicture(" + e2 + ")",
                      "error",
                      data
                    );
                  }
                }
              );
            } else {
              log("uploadPhotosFromEvent getPhoto(" + e + ")", "error", photo);
            }
          });
        } else {
          setTimeout(function () {
            log(
              "uploadPhotosFromEvent " +
                storedEvent.temporalEventId +
                " no photos to upload",
              "info"
            );
            callback("done", storedEvent);
          }, 200);
        }
      }

      //****************************************************************
      //********************   END DUMP DATA TO DB   *******************
      //****************************************************************

      //****************************************************************
      //********************           EVENTS          *****************
      //****************************************************************

      //********************        addVisitInfo       *****************

      function addVisitInfo(
        visit_id,
        heading,
        formData,
        images,
        compasses,
        photo,
        okCb,
        koCb
      ) {
        log("addVisitInfo(" + visit_id + "," + heading + ")", "info", formData);
        var formDataToStore = {};
        for (var prop in formData) {
          formDataToStore[prop] = formData[prop];
        }
        var data2send = {
          what: "ADD_VISIT_INFO",
          visit_id: visit_id,
          compass: heading,
          photos: images,
          compasses: compasses,
          temporalEventId: getEventId(),
          formData: formDataToStore,
        };
        var visit_events = JSON.parse(
          mapStorage.getItem(storeName + "_visit_events")
        );
        if (visit_events !== null) {
          visit_events.push(data2send);

          mapStorage.setItem(
            storeName + "_visit_events",
            JSON.stringify(visit_events)
          );
        } else {
          mapStorage.setItem(
            storeName + "_visit_events",
            JSON.stringify([data2send])
          );
        }
        mapStorage.removeItem(storeName + "_visits_stored_date");
        mapStorage.setItem(storeName + "_visits_stored_date", new Date());
        okCb();
      }

      //********************     end addVisitInfo      *****************

      //********************         getEvent          *****************

      function getEvent(event_id) {
        log("getEvent(" + event_id + ")", "info");
        var visit_events = JSON.parse(
          mapStorage.getItem(storeName + "_visit_events")
        );
        if (visit_events !== null) {
          //find event in stored JSON
          for (var i = 0; i < visit_events.length; i++) {
            if (visit_events[i].temporalEventId === event_id) {
              return visit_events[i];
              break;
            }
          }
        } else {
          return false;
        }
      }

      //********************       end getEvent        *****************

      //********************        updateEvent        *****************

      function updateEvent(eventObj, key, value) {
        log("updateEvent(" + key + "," + value + ")", "info", eventObj);
        var visit_events = JSON.parse(
          mapStorage.getItem(storeName + "_visit_events")
        );
        if (visit_events !== null) {
          //find event in stored JSON
          for (var i = 0; i < visit_events.length; i++) {
            if (JSON.stringify(visit_events[i]) === JSON.stringify(eventObj)) {
              visit_events[i][key] = value;
              break;
            }
          }
          mapStorage.setItem(
            storeName + "_visit_events",
            JSON.stringify(visit_events)
          );
          return true;
        } else {
          return false;
        }
      }

      //********************     end updateEvent       *****************

      //********************        removeEvent        *****************

      function removeEvent(eventObj) {
        log("removeEvent(" + eventObj.temporalEventId + ")", "info", eventObj);
        var visit_events = JSON.parse(
          mapStorage.getItem(storeName + "_visit_events")
        );
        if (visit_events !== null) {
          //find event in stored JSON
          for (var i = 0; i < visit_events.length; i++) {
            if (visit_events[i].temporalEventId === eventObj.temporalEventId) {
              visit_events.splice(i, 1);
              break;
            }
          }
          mapStorage.setItem(
            storeName + "_visit_events",
            JSON.stringify(visit_events)
          );
          return true;
        } else {
          return false;
        }
      }
      //********************     end rem oveEvent      *****************

      //****************************************************************
      //********************          END EVENTS       *****************
      //****************************************************************

      //****************************************************************
      //***********************       PHOTOS      **********************
      //****************************************************************

      function getPhotos() {
        //log("getPhotos()","info");
        var photos_list = JSON.parse(mapStorage.getItem(storeName + "_photos"));
        if (photos_list === null) {
          photos_list = Array();
        }
        return photos_list;
      }

      function addPhotoId() {
        log("addPhotoId", "info");
        var id = getPhotoId();
        id = id + 1;
        mapStorage.setItem(storeName + "_photo_id", parseInt(id));
        return id;
      }

      function getPhotoId() {
        log("getPhotoId()", "info");
        var id = mapStorage.getItem(storeName + "_photo_id");
        if (id === null) {
          log("getPhotoId() not id stored", "info");
          mapStorage.setItem(storeName + "_photo_id", 1);
          return 0;
        } else {
          log("getPhotoId() last id stored: " + id, "info");
          return parseInt(id);
        }
      }

      function savePicture(visit_id, preview, metaData, callback) {
        log("savePicture(" + visit_id + ")", "info");
        if (visit_id != "" && visit_id != null) {
          var temporalPhotoId = addPhotoId();
          var photos = getPhotos();
          var newElement = {
            photo_id: temporalPhotoId,
            event_id: getEventId(),
            visit_id: visit_id,
            metaData: metaData,
          };
          photos.push(newElement);
          mapStorage.setItem(storeName + "_photos", JSON.stringify(photos));
          var returnData = {
            status: "Accepted",
            message: newElement,
            code: 200,
          };

          mapStorage.setTile(
            "photo_" + temporalPhotoId,
            mapStorage.compress(preview),
            function (err, content) {
              if (err) {
                mapPhotos.addPhoto(preview);
                callback(err, "Error requesting savePicture", content);
              } else {
                log(
                  "Photo photo_" +
                    temporalPhotoId +
                    " successfully stored localForage",
                  "success"
                );
                callback(null, visit_id, newElement);
              }
            }
          );
        } else {
          log("savePicture() no visit_id: " + visit_id, "warn");
          callback("no visit_id", "no visit_id: " + visit_id, null);
        }
      }

      function removePhoto(photo_id, callback) {
        log("removePhoto(" + photo_id + ")", "info");
        //remove photo from indexDb
        mapStorage.removeTile("photo_" + photo_id, function () {
          log("photo removed photo_" + photo_id, "success");
          //remove photo from list
          var currentPhotos = getPhotos();
          for (var i = 0; i < currentPhotos.length; i++) {
            if (currentPhotos[i].photo_id === photo_id) {
              currentPhotos.splice(i, 1);
            }
          }
          mapStorage.setItem(
            storeName + "_photos",
            JSON.stringify(currentPhotos)
          );
          callback();
        });
      }

      function getOfflinePhotosFromEvent(event_id) {
        log("getOfflinePhotosFromEvent(" + event_id + ")", "info");
        var photos = getPhotos();
        var _return = Array();
        for (var i = 0; i < photos.length; i++) {
          if (photos[i].event_id === event_id) {
            _return.push(photos[i]);
          }
        }
        log(
          "getOfflinePhotosFromEvent(" + event_id + ") photos:",
          "info",
          _return
        );
        return _return;
      }

      function getPhoto(photo_id, callback) {
        log("getPhoto(" + photo_id + ")", "info");
        mapStorage.getTile("photo_" + photo_id, function (e, data) {
          if (e) {
            log("getPhoto(" + photo_id + ") error: " + e, "error", data);
          }
          callback(e, data);
        });
      }

      function updateEventPhoto(event_id, old_photo_id, new_photo_id) {
        log(
          "updateEventPhoto(" +
            event_id +
            "," +
            old_photo_id +
            "," +
            new_photo_id +
            ")",
          "info"
        );
        var currentEvent = getEvent(event_id);
        if (currentEvent) {
          var photosToUpdate = currentEvent.photos;
          for (var i = 0; i < photosToUpdate.length; i++) {
            if (photosToUpdate[i] === old_photo_id) {
              photosToUpdate[i] = new_photo_id;
              break;
            }
          }
          //uopdate event with real photoid
          var visit_events = JSON.parse(
            mapStorage.getItem(storeName + "_visit_events")
          );
          if (visit_events !== null) {
            //find event in stored JSON
            for (var i = 0; i < visit_events.length; i++) {
              if (visit_events[i].temporalEventId === event_id) {
                visit_events[i].photos = photosToUpdate;
                break;
              }
            }
            mapStorage.setItem(
              storeName + "_visit_events",
              JSON.stringify(visit_events)
            );
          }
        }
      }

      function updatePhotovisitId(event_id, visit_id) {
        log("updatePhotovisitId(" + event_id + "," + visit_id + ")", "info");
        var currentPhotos = getPhotos();
        for (var i = 0; i < currentPhotos.length; i++) {
          if (currentPhotos[i].event_id === event_id) {
            currentPhotos[i].visit_id = visit_id;
          }
        }
        mapStorage.setItem(
          storeName + "_photos",
          JSON.stringify(currentPhotos)
        );
      }

      //****************************************************************
      //***********************    END PHOTOS     **********************
      //****************************************************************

      //****************************************************************
      //***********************   	 HELPERS      **********************
      //****************************************************************

      //sets ajax methods
      function setAjaxMethods(
        _ajax_target,
        _ajaxMethodForVisit,
        _ajaxMethodForEvent,
        _mapPhotos
      ) {
        log("setAjaxMethods()", "info");
        ajaxMethodForVisit = _ajaxMethodForVisit;
        ajaxMethodForEvent = _ajaxMethodForEvent;
        ajax_target = _ajax_target;
        mapPhotos = _mapPhotos;
      }

      function showSavedAreas(_map) {
        log("showSavedAreas()", "info");
        if (map === null) {
          map = _map;
        }
        drawSavedBackground();
      }

      function hideSavedAreas(_map) {
        log("hideSavedAreas()", "info");
        if (map === null) {
          map = _map;
        }
        restoreInteractions(map);
      }

      //Gets displayed extent based project. Used for download layers and background map
      function getDisPlayedExtent() {
        var displayedExtent = map.getView().calculateExtent(map.getSize());
        var extentToSave;
        //check size, if is too big create an extent of 5km2
        if (
          displayedExtent[2] - displayedExtent[0] > 10000 ||
          displayedExtent[3] - displayedExtent[1] > 10000
        ) {
          var center = map.getView().getCenter();
          extentToSave = ol.extent.buffer(center.concat(center), 5000);
        } else {
          extentToSave = displayedExtent;
        }
        return extentToSave;
      }

      //Removes interaction and feature for selected download area
      function restoreInteractions(_map) {
        log("restoreInteractions()", "info");
        if (map === null) {
          map = _map;
        }
        selectingAreaToDownload = false;
        showingDownloadedAreas = false;
        //add drapPan interaction (move map)
        var dragPan;
        map.getInteractions().forEach(function (interaction) {
          if (interaction instanceof ol.interaction.DragPan) {
            dragPan = interaction;
          }
        }, this);
        //remove interaction for moving feature for selecting area
        if (extentSelect) {
          map.removeInteraction(extentSelect);
        }
        if (translateExtent) {
          map.removeInteraction(translateExtent);
        }
        if (!dragPan) {
          var adddragPan = new ol.interaction.DragPan({ kinetic: false });
          map.addInteraction(adddragPan);
        }
        if (extentFeature) {
          vectorSource.removeFeature(extentFeature);
          extentFeature = null;
        }
        if (vectorLayer) {
          map.removeLayer(vectorLayer);
          vectorLayer = null;
          vectorSource = null;
        }
        if (extentFeature) {
          vectorSourceSavedBg.removeFeature(savedFeature);
          savedFeature = null;
        }
        if (vectorLayerSavedBg) {
          map.removeLayer(vectorLayerSavedBg);
          vectorLayerSavedBg = null;
          vectorSourceSavedBg = null;
        }
      }
      //Selects area for download
      function renderAreaToDownLoad(meters) {
        log("renderAreaToDownLoad(" + meters + ")", "info");
        if (selectingAreaToDownload) {
          $rootScope.$broadcast("offlineDownloadEvent", {
            evt: "setDownloadButtons",
            selectArea: true,
            startDownload: false,
            selectingArea: false,
            showAreas: true,
            downloading: false,
            donwloadLayersBt: false,
          });
          restoreInteractions();
        } else {
          $rootScope.$broadcast("offlineDownloadEvent", {
            evt: "setDownloadButtons",
            selectArea: true,
            startDownload: true,
            selectingArea: true,
            showAreas: true,
            downloading: false,
            donwloadLayersBt: true,
          });
          selectingAreaToDownload = true;
          var extentToSave = calculateExtentToSave(
            map.getView().getCenter(),
            meters
          );
          /*
			[minx, miny, maxx, maxy]
			TL ,y					TR

			BL 							BR*/
          /*
			Use project extent
			var extentToSave	= getDisPlayedExtent();*/
          var topLeft = [extentToSave[0], extentToSave[3]];
          var topRight = [extentToSave[0], extentToSave[1]];
          var bottomRight = [extentToSave[2], extentToSave[1]];
          var bottomLeft = [extentToSave[2], extentToSave[3]];

          vectorSource = new ol.source.Vector({});
          vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            zIndex: 999,
          });
          map.addLayer(vectorLayer);
          //put layer on top

          extentFeature = new ol.Feature({
            geometry: new ol.geom.Polygon([
              [topLeft, topRight, bottomRight, bottomLeft],
            ]),
          });
          extentFeature.setStyle(styleFunction);
          function styleFunction() {
            return [
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: "rgb(120, 120, 120)",
                  width: 1,
                }),
                fill: new ol.style.Fill({
                  color: "rgba(64, 65, 64, 0.1)",
                }),
                text: new ol.style.Text({
                  font: "10px Calibri,sans-serif",
                  textBaseline: "bottom",
                  textAlign: "center",
                  fill: new ol.style.Fill({ color: "#001f03" }),
                  text: localized_strings.OFFLINE_AREA_TO_SAVE,
                }),
              }),
            ];
          }
          vectorSource.addFeature(extentFeature);
          //remove drapPan interaction (move map)
          var dragPan;
          map.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
              dragPan = interaction;
            }
          }, this);
          if (dragPan) {
            map.removeInteraction(dragPan);
          }
          //add interaction for moving feature for selecting area
          extentSelect = new ol.interaction.Select();
          translateExtent = new ol.interaction.Translate({
            features: new ol.Collection([extentFeature]),
          });
          map.addInteraction(translateExtent);
          map.addInteraction(extentSelect);
        }
      }

      function getExtenToDownload() {
        log("getExtenToDownload()", "info");
        if (extentFeature) {
          extentToSave = extentFeature.getGeometry().getExtent();
          log("getExtenToDownload() selected area: " + extentToSave);
          restoreInteractions(map);
        } else {
          extentToSave = getDisPlayedExtent();
          log("getExtenToDownload() project extent: " + extentToSave, "info");
        }
        return extentToSave;
      }

      //renders saved background as reference
      function drawSavedBackground() {
        log("drawSavedBackground()", "info");
        if (!showingDownloadedAreas) {
          var bgExtent = mapStorage.getItem(storeName + "_bgExtent");
          if (bgExtent) {
            vectorSourceSavedBg = new ol.source.Vector({});
            vectorLayerSavedBg = new ol.layer.Vector({
              source: vectorSourceSavedBg,
              zIndex: 999,
            });
            map.addLayer(vectorLayerSavedBg);
            var currentDownloadedExtents = JSON.parse(bgExtent);
            for (var i = 0; i < currentDownloadedExtents.length; i++) {
              var extentToDisplay = currentDownloadedExtents[i].split(",");
              var topLeft = [extentToDisplay[0], extentToDisplay[3]];
              var topRight = [extentToDisplay[0], extentToDisplay[1]];
              var bottomRight = [extentToDisplay[2], extentToDisplay[1]];
              var bottomLeft = [extentToDisplay[2], extentToDisplay[3]];
              savedFeature = new ol.Feature({
                geometry: new ol.geom.Polygon([
                  [topLeft, topRight, bottomRight, bottomLeft],
                ]),
              });
              savedFeature.setStyle(styleFunction);
              function styleFunction() {
                return [
                  new ol.style.Style({
                    stroke: new ol.style.Stroke({
                      color: "#FF8C00",
                      width: 1,
                    }),
                    fill: new ol.style.Fill({
                      color: "rgba(249, 159, 25, 0.1)",
                    }),
                    text: new ol.style.Text({
                      font: "9px Calibri,sans-serif",
                      fill: new ol.style.Fill({ color: "#FF8C00" }),
                      text: localized_strings.OFFLINE_SAVED_BACKGROUND_AREA,
                    }),
                  }),
                ];
              }
              vectorSourceSavedBg.addFeature(savedFeature);
              showingDownloadedAreas = true;
            }
          } else {
            log("drawSavedBackground() no saved background", "warn");
          }
        }
      }

      //renders saved data as reference
      function drawSavedData() {
        log("drawSavedData()", "info");
        if (!showingDownloadedAreas) {
          var bgExtent = mapStorage.getItem(storeName + "_dataExtent");
          if (bgExtent) {
            var extentToDisplay = bgExtent.split(",");
            var topLeft = [extentToDisplay[0], extentToDisplay[3]];
            var topRight = [extentToDisplay[0], extentToDisplay[1]];
            var bottomRight = [extentToDisplay[2], extentToDisplay[1]];
            var bottomLeft = [extentToDisplay[2], extentToDisplay[3]];

            vectorLayerSavedData = new ol.source.Vector({});
            vectorSourceSavedData = new ol.layer.Vector({
              source: vectorSourceSavedData,
              zIndex: 999,
            });
            map.addLayer(vectorLayerSavedData);
            savedFeatureData = new ol.Feature({
              geometry: new ol.geom.Polygon([
                [topLeft, topRight, bottomRight, bottomLeft],
              ]),
            });
            savedFeatureData.setStyle(styleFunction);
            function styleFunction() {
              return [
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: "#FF8C00",
                    width: 1,
                  }),
                  fill: new ol.style.Fill({
                    color: "rgba(249, 159, 25, 0.1)",
                  }),
                  text: new ol.style.Text({
                    font: "9px Calibri,sans-serif",
                    fill: new ol.style.Fill({ color: "#FF8C00" }),
                    text: localized_strings.OFFLINE_SAVED_BACKGROUND_AREA,
                  }),
                }),
              ];
            }
            vectorLayerSavedData.addFeature(savedFeatureData);
            showingDownloadedAreas = true;
          } else {
            log("drawSavedData() no saved data", "warn");
          }
        }
      }

      function calculateExtentToSave(center, area) {
        return ol.extent.buffer(center.concat(center), area);
      }

      function formatDate(stringDate) {
        var newfecha = new Date(Date.parse(stringDate));
        return (
          newfecha.getDay() +
          "/" +
          newfecha.getMonth() +
          "/" +
          newfecha.getYear() +
          " " +
          newfecha.getHours() +
          ":" +
          newfecha.getMinutes()
        );
      }

      // Download status
      function isDownloading() {
        return co;
      }
      /*
// Offline selector stuff
function isSelectorActive() {
	return isSelectorActive;
}*/
      /*
function showSelector() {
	isSelectorActive 	= true;
}
*/
      /*
function hideSelector() {
	isSelectorActive 	= false;
};

function toggleSelector() {
	isSelectorActive 	= !isSelectorActive;
};
*/
      /*
// Offline menu stuff
function isMenuActive() {
	return isMenuActive;
};
/*
function showMenu() {
	isMenuActive 		= true;
};

function hideMenu() {
	isMenuActive 		= false;
};

function toggleMenu() {
	isMenuActive 			= !isMenuActive;
};
*/
      // Test if a layer is a KML layer added by the ImportKML tool or
      // permalink
      // @param olLayerOrId  An ol layer or an id of a layer
      function isKmlLayer(olLayerOrId) {
        if (!olLayerOrId) {
          return false;
        }
        if (angular.isString(olLayerOrId)) {
          return /^KML\|\|/.test(olLayerOrId);
        }
        return olLayerOrId.type == "KML";
      }

      // Update download status
      var progress;
      function onDlProgress() {
        if (isDownloading) {
          var nbTiles = nbTilesCached + nbTilesFailed;
          var percent = parseInt((nbTiles * 100) / nbTilesTotal, 10);

          // Trigger event only when needed
          if (percent != progress) {
            progress = percent;
            $rootScope.$broadcast("gaOfflineProgress", progress);
          }
          // Download finished
          if (nbTilesCached + nbTilesFailed == nbTilesTotal) {
            isDownloading = false;
            var percentCached = parseInt(
              (nbTilesCached * 100) / nbTilesTotal,
              10
            );

            if (percentCached <= 95) {
              // Download failed
              //$rootScope.$broadcast('gaOfflineError');
              alert("offline_less_than_95");
            } else {
              // Download succeed
              //mapStorage.setItem(extentKey, extent);
              log("background end download", "success");
              $rootScope.$broadcast("offlineDownloadEvent", { evt: "done" });
              map.removeLayer(wmtsBackgroundRaster);
              wmtsBackgroundRaster = null;
            }
          }
        }
      }

      // Tile saving error
      function onTileError(tileUrl, msg) {
        if (isStorageFull) {
          return;
        }
        nbTilesFailed++;
        errorReport += "\nTile failed: " + tileUrl + "\n Cause:" + msg;
        onDlProgress();
      }

      // Tile saving success
      function onTileSuccess(size) {
        if (isStorageFull) {
          return;
        }
        sizeCached += size;
        nbTilesCached++;
        onDlProgress();
      }

      // Read xhr response
      function readResponse(tileUrl, response, type) {
        if (isStorageFull) {
          return;
        }
        //OJO - revisado
        var blob = arrayBufferToBlob(response, type);
        // FileReader is strictly used to transform a blob to a base64 string
        var fileReader = new FileReader();
        fileReader.onload = function (evt) {
          //OJO - revisado
          mapStorage.setTile(
            getTileKey(tileUrl),
            mapStorage.compress(evt.target.result),
            function (err, content) {
              log("storing tile: " + tileUrl, "info");
              if (isStorageFull) {
                return;
              }
              if (err) {
                if (err.code == err.QUOTA_ERR) {
                  isStorageFull = true;
                  //OJO - revisado
                  alert("not enouth space");
                  nbTilesFailed = nbTilesTotal - nbTilesCached;
                  onDlProgress();
                } else {
                  onTileError(tileUrl, "Write db failed, code:" + err.code);
                }
              } else {
                onTileSuccess(blob.size);
              }
            }
          );
        };

        fileReader.onerror = function (evt) {
          onTileError(tileUrl, "File read failed");
        };

        fileReader.onabort = function (evt) {
          onTileError(tileUrl, "File read aborted");
        };

        fileReader.readAsDataURL(blob);
      }

      function getTileKey(tileUrl) {
        return tileUrl.replace(/^\/\/wmts[0-9]/, "");
      }

      function arrayBufferToBlob(buffer, contentType) {
        if ($window.WebKitBlobBuilder) {
          // BlobBuilder is deprecated, only used in Android Browser
          var builder = new WebKitBlobBuilder();
          builder.append(buffer);
          return builder.getBlob(contentType);
        } else {
          return new Blob([buffer], { type: contentType });
        }
      }

      function initDownloadStatus() {
        isDownloading = false;
        isStorageFull = false;
        nbTilesCached = 0;
        nbTilesEmpty = 0;
        nbTilesFailed = 0;
        nbTilesTotal = 0;
        requests = [];
        sizeCached = 0;
        errorReport = "";
      }

      //log function
      function log(evt, level, data) {
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename,
          level: level,
        });
      }

      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************

      //****************************************************************
      //****************************************************************
      //****************************************************************
      //*****************             WTF              *****************
      //****************************************************************
      //****************************************************************
      //****************************************************************

      // Get the magnitude of 3D vector from an origin.
      // Used to order tiles by the distance from the map center.
      function getMagnitude(a, origin) {
        return Math.sqrt(
          Math.pow(a[1] + 0.5 - origin[1], 2) +
            Math.pow(a[2] + 0.5 - origin[2], 2) +
            Math.pow(a[0] - origin[0], 2)
        );
      }
      function transformIfAgnostic(url) {
        if (/^\/\//.test(url)) {
          url = location.protocol + url;
        }
        return url;
      }
      function setupPrototypes() {
        /**
         * A representation of a contiguous block of tiles.  A tile range is specified
         * by its min/max tile coordinates and is inclusive of coordinates.
         *
         * @constructor
         * @param {number} minX Minimum X.
         * @param {number} maxX Maximum X.
         * @param {number} minY Minimum Y.
         * @param {number} maxY Maximum Y.
         * @struct
         */
        ol.TileRange = function (minX, maxX, minY, maxY) {
          /**
           * @type {number}
           */
          this.minX = minX;
          /**
           * @type {number}
           */
          this.maxX = maxX;
          /**
           * @type {number}
           */
          this.minY = minY;
          /**
           * @type {number}
           */
          this.maxY = maxY;
        };

        /**
         * @param {number} minX Minimum X.
         * @param {number} maxX Maximum X.
         * @param {number} minY Minimum Y.
         * @param {number} maxY Maximum Y.
         * @param {ol.TileRange|undefined} tileRange TileRange.
         * @return {ol.TileRange} Tile range.
         */
        ol.TileRange.createOrUpdate = function (
          minX,
          maxX,
          minY,
          maxY,
          tileRange
        ) {
          if (typeof fileRange != "undefined") {
            tileRange.minX = minX;
            tileRange.maxX = maxX;
            tileRange.minY = minY;
            tileRange.maxY = maxY;
            return tileRange;
          } else {
            return new ol.TileRange(minX, maxX, minY, maxY);
          }
        };
        ol.TileCoord = function (x, y, z) {
          var opt_tileCoord = Array();
          opt_tileCoord[0] = z;
          opt_tileCoord[1] = x;
          opt_tileCoord[2] = y;
          return opt_tileCoord;
        };

        ol.tilecoord = {};
        /**
         * @param {number} z Z.
         * @param {number} x X.
         * @param {number} y Y.
         * @param {ol.TileCoord=} opt_tileCoord Tile coordinate.
         * @return {ol.TileCoord} Tile coordinate.
         */
        ol.tilecoord.createOrUpdate = function (z, x, y, opt_tileCoord) {
          if (typeof opt_tileCoord != "undefined") {
            opt_tileCoord[0] = z;
            opt_tileCoord[1] = x;
            opt_tileCoord[2] = y;
            return opt_tileCoord;
          } else {
            return [z, x, y];
          }
        };

        /**
         * @private
         * @type {ol.TileCoord}
         */

        ol.tilegrid.TileGrid.tmpTileCoord_ = new ol.TileCoord(0, 0, 0);
        ol.tilegrid.TileGrid.prototype.getTileRangeForExtentAndZ = function (
          extent,
          z,
          opt_tileRange
        ) {
          var resolution = this.getResolution(z);
          return this.getTileRangeForExtentAndResolution(
            extent,
            resolution,
            opt_tileRange
          );
        };

        ol.tilegrid.TileGrid.prototype.getTileRangeForExtentAndResolution =
          function (extent, resolution, opt_tileRange) {
            var tileCoord = ol.tilegrid.TileGrid.tmpTileCoord_;
            this.getTileCoordForXYAndResolution_(
              extent[0],
              extent[1],
              resolution,
              false,
              tileCoord
            );
            var minX = tileCoord[1];
            var minY = tileCoord[2];
            this.getTileCoordForXYAndResolution_(
              extent[2],
              extent[3],
              resolution,
              true,
              tileCoord
            );
            return ol.TileRange.createOrUpdate(
              minX,
              tileCoord[1],
              minY,
              tileCoord[2],
              opt_tileRange
            );
          };
        ol.tilegrid.TileGrid.prototype.getTileCoordForXYAndResolution_ =
          function (
            x,
            y,
            resolution,
            reverseIntersectionPolicy,
            opt_tileCoord
          ) {
            var z = this.getZForResolution(resolution);
            var scale = resolution / this.getResolution(z);
            var origin = this.getOrigin(z);
            var tileSize = this.getTileSize(z);

            var tileCoordX =
              (scale * (x - origin[0])) / (resolution * tileSize);
            var tileCoordY =
              (scale * (y - origin[1])) / (resolution * tileSize);

            if (reverseIntersectionPolicy) {
              tileCoordX = Math.ceil(tileCoordX) - 1;
              tileCoordY = Math.ceil(tileCoordY) - 1;
            } else {
              tileCoordX = Math.floor(tileCoordX);
              tileCoordY = Math.floor(tileCoordY);
            }

            return ol.tilecoord.createOrUpdate(
              z,
              tileCoordX,
              tileCoordY,
              opt_tileCoord
            );
          };
        ol.tilegrid.TileGrid.prototype.getZForResolution = function (
          resolution
        ) {
          return kk(defaultResolutions, resolution, 0);

          function kk(arr, target, direction) {
            var n = arr.length;
            if (arr[0] <= target) {
              return 0;
            } else if (target <= arr[n - 1]) {
              return n - 1;
            } else {
              var i;
              if (direction > 0) {
                for (i = 1; i < n; ++i) {
                  if (arr[i] < target) {
                    return i - 1;
                  }
                }
              } else if (direction < 0) {
                for (i = 1; i < n; ++i) {
                  if (arr[i] <= target) {
                    return i;
                  }
                }
              } else {
                for (i = 1; i < n; ++i) {
                  if (arr[i] == target) {
                    return i;
                  } else if (arr[i] < target) {
                    if (arr[i - 1] - target < target - arr[i]) {
                      return i - 1;
                    } else {
                      return i;
                    }
                  }
                }
              }
              // We should never get here, but the compiler complains
              // if it finds a path for which no number is returned.

              return n - 1;
            }
          }
        };
      }
      //****************************************************************
      //****************************************************************
      //****************************************************************
      //*****************            END WTF           *****************
      //****************************************************************
      //****************************************************************
      //****************************************************************
    },
  ]);
})();
