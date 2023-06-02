(function () {
  "use strict";
  /**
 * Factory for map TOC

 

 october 2017

 ******************************************************************************************************

 Available methods:

	- init
			initializes mapToc module

			@param _token  (string) token for cross site injection protection
			@param _app_name (string) for logging purposes
			@param _mc (angular element)
			@param _use_layer_auth (BOOL)
			@param _user_permissions (JSON)

	- formatLayers.
			builds TOC, checking if a layer is final layer or container,
			if is container, assigns isContainer= true

			@param rawlayers (JSON) - from project capabilities
			@return mc.layers (JSON) - assigns processed JSON to angular element mc.layers

	- setActiveLayer.
			sets active layer

			@param item (JSON) - TOC element
			@param index (int) - array position
			@return actions on mapFactory

	- userCanSeeLayer.
			checks if a user can see a layer, based on user_permissions

			@param layer (string) - layer name
			@return bool

	- getLayerProperties
			gets layer properties on database

			@param layer (string) - layer name
			@return JSON

	- addRemoveLayer.
			adds or removes a layer from map

			@param item (JSON) - TOC element
			@param index (int) - array position
			@return actions on mapFactory

	- addLayer
			adds a layer from map

			@param item (JSON) - TOC element

	- removeLayer
			removes a layer from map

			@param item (JSON) - TOC element

	- userCanEditLayer.
			checks if a user can edit a layer, based on user_permissions

			@param layer (JSON) - TOC element
			@return bool

	- addRemoveContainer.
			adds or removes a contrainer layer from map

			@param item (JSON) - TOC element
			@param index (int) - array position
			@param active (bool) - flag for knowing if is active layer
			@return actions on mapFactory

	- markActiveLayer
			adds properties to TOC element for graphic indication that is the active layer

			@param name (string) - layer name
			@return actions on mc.layers

	- unMarkLayer
			adds properties to TOC element for graphic indication that is NOT the active layer

			@param name (string) - layer name
			@return actions on mc.layers

	- getObjectLayerByLayerName
			returns full layer object based on layer name

			@param name (string) - layer name
			@return JSON (layer object)

	- getLayerNameByLayerTable
			returns layer name based on db table name

			@param name (string) - table name
			@return layer (string)

	- getTableNameByLayerName
			eturns db table  based on layer name

			@param name (string) - layer name
			@return db_table (string)

	- getAvailableLayersTableNames
			returns available layers table names

			@return layers_table_names (array)

	- getEditableLayers
			returns editable layers list

			@return editable_layers (array)

	-getOfflineLayers
			returns available offline layers

			@return offline_layers (array)

	- getVisitableLayers
			returns available visitable layers

			@return editable_layers (array)

	- getEditableLayersTableNames
			returns editable layers table names list

			@return editable_layers (array)

	- getTableNamesFromLayersNameList
			return table names list from a given list of layer names

			@param list (array)
			@return (array)

	- restoreCookieLayers
			gets mapStorage array and restores displayed layers.
			The scope is public because is used after offline recovery

	- getDisplayedLayers
			List of displayed layers
*/

  angular.module("app").factory("mapToc", [
    "$http",
    "$rootScope",
    "mapFactory",
    function ($http, $rootScope, mapFactory) {
      var filename = "mapToc.js",
        version = "1.2.1",
        app_name = null,
        mc = null,
        use_layer_auth = false,
        user_permissions = null,
        available_layers = Array(), //list of available layers
        layers_cookie = Array(), //list of layers in object format
        layers_table_names = Array(), //list of available layers table names
        offline_layers = Array(), //list of offline available layers
        visitable_layers = Array(), //list of vistable layers
        editable_layers = Array(), //list of editable layers
        editable_layers_table_names = Array(), //list of editable layers table names
        displayed_layers = Array(), //list of displayed layers
        project_id = null,
        useCookies = false, //flag for store or not TOC on a cookie
        token = null;

      // public API
      var dataFactory = {
        init: init,
        formatLayers: formatLayers,
        setActiveLayer: setActiveLayer,
        userCanSeeLayer: userCanSeeLayer,
        getLayerProperties: getLayerProperties,
        addRemoveLayer: addRemoveLayer,
        userCanEditLayer: userCanEditLayer,
        addRemoveContainer: addRemoveContainer,
        removeLayer: removeLayer,
        addLayer: addLayer,
        markActiveLayer: markActiveLayer,
        unMarkLayer: unMarkLayer,
        unMarkActiveLayer: unMarkActiveLayer,
        getAvailableLayers: getAvailableLayers,
        getAvailableLayersTableNames: getAvailableLayersTableNames,
        getRawLayers: getRawLayers,
        getOfflineLayers: getOfflineLayers,
        getVisitableLayers: getVisitableLayers,
        getEditableLayers: getEditableLayers,
        getObjectLayerByLayerName: getObjectLayerByLayerName,
        getLayerNameByLayerTable: getLayerNameByLayerTable,
        getTableNameByLayerName: getTableNameByLayerName,
        getEditableLayersTableNames: getEditableLayersTableNames,
        getTableNamesFromLayersNameList: getTableNamesFromLayersNameList,
        getLayerIndex: getLayerIndex,
        getMarkedLayerAsActive: getMarkedLayerAsActive,
        getDisplayedLayers: getDisplayedLayers,
        restoreCookieLayers: restoreCookieLayers,
      };
      return dataFactory;

      //****************************************************************
      //***********************       INIT       ***********************
      //****************************************************************

      function init(tocOptions, _mc, _user_permissions) {
        token = tocOptions.token;
        app_name = tocOptions.app_name;
        mc = _mc;
        use_layer_auth = tocOptions.use_layer_auth;
        user_permissions = _user_permissions;
        project_id = parseInt(tocOptions.project_id);
        useCookies = tocOptions.useCookies;
        //store editable layers
        for (var i = 0; i < user_permissions.length; i++) {
          if (user_permissions[i].edit) {
            editable_layers.push(user_permissions[i].qgis_name);
            editable_layers_table_names.push(user_permissions[i].db_table);
          }
          if (user_permissions[i].offline) {
            offline_layers.push(user_permissions[i].qgis_name);
          }
          if (user_permissions[i].visitable) {
            visitable_layers.push(user_permissions[i].qgis_name);
          }
        }
        mapFactory.injectDependency("mapToc", this);
        //**** query parameters ****/
        let queryPolId = getParameterByName("pol_id");
        if (queryPolId) {
          $rootScope.$broadcast("queryEvent", { evt: "searching" });
        }
        setTimeout(function () {
          //check url parameters
          let queryTable = getParameterByName("table");
          if (queryTable) {
            let layerName = getLayerNameByLayerTable(queryTable);
            if (queryPolId) {
              $rootScope.$broadcast("queryEvent", {
                evt: "found",
                pol_id: queryPolId,
                id_name: getParameterByName("id_name"),
                db_table: queryTable,
                layer: layerName,
              });
            }
          }
        }, 1100);
        //**** end query parameters ****/

        //if useCookies restore last session layers
        if (useCookies) {
          //try to restore zoom level and center
          try {
            var cookieName = "bmaps_" + project_id + "_tocCookie";
            var cookie = JSON.parse(getCookie(cookieName));
            if (typeof cookie.zoom_level != "undefined") {
              if (ol.extent.containsCoordinate(_mc.extent, cookie.center)) {
                mapFactory.setZoomLevelAndCenter(
                  cookie.zoom_level,
                  cookie.center
                );
              } else {
                log("Cookie coordinates outside extent");
              }
            }
          } catch (e) {}
          //needs a timeout for avoid overload and cookie zoom level override by default value
          setTimeout(function () {
            //check url parameters
            let queryTable = getParameterByName("table");
            if (queryTable) {
              resetActiveLayer();
              let layerName = getLayerNameByLayerTable(queryTable);
              setActiveLayer(
                getObjectLayerByLayerName(getLayerNameByLayerTable(layerName))
              );
              markActiveLayer(layerName);
              //let queryPolId = getParameterByName('pol_id');
              if (queryPolId) {
                $rootScope.$broadcast("queryEvent", {
                  evt: "found",
                  pol_id: queryPolId,
                  id_name: getParameterByName("id_name"),
                  db_table: queryTable,
                  layer: layerName,
                });
              }
            } else {
              restoreCookieLayers(project_id);
            }

            $rootScope.$on("mapMoveEnd", function (event, data) {
              if (typeof data.zoom_level != "undefined") {
                try {
                  var cookieName = "bmaps_" + project_id + "_tocCookie";
                  var cookie = JSON.parse(getCookie(cookieName));
                  if (!cookie) cookie = {};
                  cookie.zoom_level = data.zoom_level;
                  cookie.center = data.center;
                  setCookie(cookieName, JSON.stringify(cookie), 1);
                } catch (e) {
                  console.error("Error setting cookie on mapMoveEnd", e);
                }
              }
            });
          }, 2500);
        }
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      //****************************************************************
      //***********************       GETTERS    ***********************
      //****************************************************************

      function getAvailableLayers() {
        return available_layers;
      }
      function getRawLayers() {
        return mc.layers;
      }
      function getAvailableLayersTableNames() {
        return layers_table_names;
      }
      function getOfflineLayers() {
        return offline_layers;
      }
      function getVisitableLayers() {
        return visitable_layers;
      }
      function getLayerIndex(layer_name) {
        return available_layers.indexOf(layer_name);
      }
      function getDisplayedLayers() {
        return displayed_layers;
      }

      //****************************************************************
      //**********************     END GETTERS   ***********************
      //****************************************************************

      //****************************************************************
      //*************      LAYER PROPERTIES SETTER      ****************
      //****************************************************************

      function setLayerProperties(item, properties) {
        log("setLayerProperties()", { item: item, properties: properties });
        //first Level
        for (var i = 0; i < mc.layers.length; i++) {
          if (mc.layers[i].Name === item.Name) {
            for (var p = 0; p < properties.length; p++) {
              mc.layers[i][properties[p].name] = properties[p].value;
            }
          }
          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].Name === item.Name) {
                for (var p = 0; p < properties.length; p++) {
                  mc.layers[i].Layer[s][properties[p].name] =
                    properties[p].value;
                }
                if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                }
              }
            } //close secondedlevel
          }
        } //close first level
      }

      //****************************************************************
      //***********      END LAYER PROPERTIES SETTER     ***************
      //****************************************************************

      //****************************************************************
      //**********************    Format layers    *********************
      //****************************************************************

      function formatLayers(rawlayers) {
        log("formatLayers()", rawlayers);
        //first Level
        for (var i = 0; i < rawlayers.length; i++) {
          rawlayers[i].isContainer = false;
          rawlayers[i].isActiveLayer = false;
          available_layers.push(rawlayers[i].Name);
          //second level
          if (typeof rawlayers[i].Layer != "undefined") {
            rawlayers[i].isContainer = true;
            for (var s = 0; s < rawlayers[i].Layer.length; s++) {
              rawlayers[i].Layer[s].isContainer = false;
              rawlayers[i].Layer[s].isActiveLayer = false;
              available_layers.push(rawlayers[i].Layer[s].Name);
              //third level
              if (typeof rawlayers[i].Layer[s].Layer != "undefined") {
                rawlayers[i].Layer[s].isContainer = true;
                rawlayers[i].Layer[s].isActiveLayer = false;
                for (var t = 0; t < rawlayers[i].Layer[s].Layer.length; t++) {
                  //fourth level
                  rawlayers[i].Layer[s].Layer[t].isContainer = false;
                  rawlayers[i].Layer[s].Layer[t].isActiveLayer = false;
                  available_layers.push(rawlayers[i].Layer[s].Layer[t].Name);
                  if (
                    typeof rawlayers[i].Layer[s].Layer[t].Layer != "undefined"
                  ) {
                    rawlayers[i].Layer[s].Layer[t].isContainer = true;
                  }
                }
              }
            }
          }
        }
        mc.layers = rawlayers;
        setAvailableLayersTableNames();
      }

      //set table names for layers in the same order they're displayed on the TOC
      function setAvailableLayersTableNames() {
        var realLayers = [];
        for (var i = 0; i < available_layers.length; i++) {
          for (var p = 0; p < user_permissions.length; p++) {
            if (user_permissions[p].qgis_name === available_layers[i]) {
              layers_table_names.push(user_permissions[p].db_table);
              realLayers.push(available_layers[i]);
            }
          }
        }
        available_layers = realLayers;
        $rootScope.$broadcast("tocReady", {});
      }

      //****************************************************************
      //**********************  END Format layers    *******************
      //****************************************************************

      //****************************************************************
      //**********************   SET ACTIVE LAYER    *******************
      //****************************************************************

      function setActiveLayer(item, index) {
        log("setActiveLayer: " + index, item);
        if (typeof item != "object") {
          item = getObjectLayerByLayerName(item);
        }
        if (typeof item != "undefined") {
          if (!item.isContainer) {
            if (item.Name != mapFactory.getActiveLayerName()) {
              if (index != null) {
                resetActiveLayer();
              }
              var layer_displayed = mapFactory.getLayersDisplayed();
              if (layer_displayed.indexOf(item.Name) == -1) {
                if (!item.isSelected) {
                  item.isSelected = true;
                } else {
                  item.isSelected = false;
                }

                if (!item.isActiveLayer) {
                  item.isActiveLayer = true;
                } else {
                  item.isActiveLayer = false;
                }
                //render layer and add it to layers list
                if (available_layers.indexOf(item.Name) > -1) {
                  mapFactory.addLayer(item.Name);
                  //mark as active layer for infos
                  mapFactory.setActiveLayer(item.Name);
                }
              }
              var canEdit = userCanEditLayer(item.Name);
              if (canEdit) {
                mapFactory.getLayerAttributes(item.Name);
              }
              if (index != null) {
                if (!item.isActiveLayer) {
                  item.isActiveLayer = true;
                } else {
                  item.isActiveLayer = false;
                }
                mapFactory.setActiveLayer(item.Name);
              } else {
                log(
                  "mark current active layer as active " +
                    mapFactory.getActiveLayerName()
                );
              }
              //get legend
              $rootScope.$broadcast("legendEvent", {
                item: item,
                event: "show",
              });
              //enable/disable tools
              if (mapFactory.getLayersDisplayed().length > 0) {
                $rootScope.toolsDisabled = false;
              } else {
                $rootScope.toolsDisabled = true;
              }
            }
          }
        }
      }

      //****************************************************************
      //**********************  END SET ACTIVE LAYER    ****************
      //****************************************************************

      //****************************************************************
      //**********************    USER CAN SEE LAYER    ****************
      //****************************************************************

      function userCanSeeLayer(layer) {
        if (use_layer_auth) {
          for (var i = 0; i < user_permissions.length; i++) {
            if (user_permissions[i].qgis_name === layer) {
              return true;
            }
          }
        } else {
          return true;
        }
      }

      $rootScope.userCanEditLayer = function (layer) {
        return userCanEditLayer(layer);
      };

      //****************************************************************
      //**********************  END USER CAN SEE LAYER    **************
      //****************************************************************

      //****************************************************************
      //**********************    GET LAYER PROPERTIES    **************
      //****************************************************************

      function getLayerProperties(layer_name) {
        if (use_layer_auth) {
          for (var i = 0; i < user_permissions.length; i++) {
            if (user_permissions[i].qgis_name === layer_name) {
              var retorn = {};
              retorn.canSeeLayer = true;
              retorn.visitable = user_permissions[i].visitable;
              retorn.db_table = user_permissions[i].db_table;
              retorn.geometry = user_permissions[i].geometry;
              retorn.edit = user_permissions[i].edit;
              retorn.offline = user_permissions[i].offline;
              retorn.offline = user_permissions[i].offline;
              retorn.transparent = user_permissions[i].layer_transparent;
              retorn.geojson = user_permissions[i].geojson;
              retorn.geojson_fill_color =
                user_permissions[i].geojson_fill_color;
              retorn.geojson_stroke_color =
                user_permissions[i].geojson_stroke_color;
              retorn.geojson_point_radius =
                user_permissions[i].geojson_point_radius;
              retorn.geojson_point_fill =
                user_permissions[i].geojson_point_fill;
              retorn.geojson_stroke_width =
                user_permissions[i].geojson_stroke_width;

              if (typeof user_permissions[i].singletile != "undefined") {
                retorn.singletile = user_permissions[i].singletile;
              } else {
                //by default use singleTile
                retorn.singletile = true;
              }
              if (typeof user_permissions[i].gutter != "undefined") {
                retorn.gutter = user_permissions[i].gutter;
              } else {
                //by default use gutter=0
                retorn.gutter = 0;
              }
              return retorn;
            }
          }
        } else {
          return { canSeeLayer: false };
        }
      }

      //****************************************************************
      //*******************   END GET LAYER PROPERTIES    **************
      //****************************************************************

      //****************************************************************
      //******************        addRemoveLayer          **************
      //****************************************************************
      //single layer
      function addRemoveLayer(item, index) {
        log("addRemoveLayer() ", { item: item, index: index });
        var numberOflayersDisplayed = mapFactory.getLayersDisplayed().length;
        var showingLayer = false; //flag for marking or not active layer when there's only one layer
        if (item) {
          if (!item.isSelected) {
            showingLayer = true;
            addLayer(item, index);
          } else {
            removeLayer(item, index);
            $rootScope.$broadcast("legendEvent", { item: item, event: "hide" });
          }

          if (index != null) {
            if (item.isActiveLayer) {
              resetActiveLayer();
              selectNextAvailableActiveLayer();
            }
          }
          numberOflayersDisplayed = mapFactory.getLayersDisplayed().length;
          //enable/disable tools
          if (numberOflayersDisplayed > 0) {
            $rootScope.toolsDisabled = false;
          } else {
            $rootScope.toolsDisabled = true;
          }
          //set active layer if only 1 is displayed and this is activeLayer
          if (
            numberOflayersDisplayed === 1 ||
            typeof mapFactory.getActiveLayerName() === "undefined"
          ) {
            selectNextAvailableActiveLayer();
          } else if (numberOflayersDisplayed === 0) {
            if (showingLayer) {
              markActiveLayer(item.Name);
            }
          }
        }
      }

      function removeLayer(item, index) {
        item.isSelected = false;
        if (available_layers.indexOf(item.Name) > -1) {
          mapFactory.removeLayer(item.Name);
          addRemoveLayerFromCookie(item, index, false);
          displayed_layers.splice(displayed_layers.indexOf(item.Name), 1);
          var containerData = _getContainer(item.Name);
          if (containerData.container) {
            _markContainerAsVisible(containerData);
          }
        }
      }
      //****************************************************************
      //******************     END addRemoveLayer         **************
      //****************************************************************

      //****************************************************************
      //******************         addLayer            *****************
      //****************************************************************

      //method on container childs
      function addLayer(item) {
        log("addLayer()", item);
        if (available_layers.indexOf(item.Name) > -1) {
          var LayersDisplayed = mapFactory.getLayersDisplayed();
          if (LayersDisplayed.indexOf(item.Name) === -1) {
            item.isSelected = true;
            mapFactory.addLayer(item, null);
            addRemoveLayerFromCookie(item, null, true);
            displayed_layers.push(item.Name);
            var containerData = _getContainer(item.Name);
            if (containerData.container) {
              _markContainerAsVisible(containerData);
            } else {
              markActiveLayer(item.Name);
            }
          }
        }
      }

      //****************************************************************
      //******************         end addLayer           **************
      //****************************************************************

      //****************************************************************
      //**********************     USER CAN EDIT LAYER     *************
      //****************************************************************

      function userCanEditLayer(layer) {
        if (typeof layer != "undefined" && layer != "undefined" && layer) {
          log("userCanEditLayer(" + layer + ")");
          $rootScope.addPointDisabled = true;
          $rootScope.addLineDisabled = true;
          $rootScope.addPolygonDisabled = true;
          if (use_layer_auth && layer.toLowerCase() != "visits") {
            for (var i = 0; i < user_permissions.length; i++) {
              if (
                user_permissions[i].qgis_name === layer &&
                user_permissions[i].edit === 1
              ) {
                if (
                  user_permissions[i].geometry === "Point" ||
                  user_permissions[i].geometry === "MultiPoint"
                ) {
                  $rootScope.addPointDisabled = false;
                  $rootScope.$broadcast("define_geometryTypeInTools", {
                    toolName: user_permissions[i].geometry,
                  });
                } else if (
                  user_permissions[i].geometry === "Polygon" ||
                  user_permissions[i].geometry === "MultiPolygon"
                ) {
                  $rootScope.$broadcast("define_geometryTypeInTools", {
                    toolName: user_permissions[i].geometry,
                  });
                  $rootScope.addPolygonDisabled = false;
                } else if (
                  user_permissions[i].geometry === "LineString" ||
                  user_permissions[i].geometry === "MultiLineString"
                ) {
                  $rootScope.$broadcast("define_geometryTypeInTools", {
                    toolName: user_permissions[i].geometry,
                  });
                  $rootScope.addLineDisabled = false;
                }
                return true;
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
      //**********************  END USER CAN EDIT LAYER    *************
      //****************************************************************

      //****************************************************************
      //**********************     ADD/REMOVE CONTAINER    *************
      //****************************************************************

      //container layer
      function addRemoveContainer(item, index, active) {
        log(
          "addRemoveContainer(index: " + index + ", active: " + active + ")",
          item
        );
        //first Level
        for (var i = 0; i < mc.layers.length; i++) {
          if (mc.layers[i].Name === item.Name) {
            addRemoveLayerFromCookie(mc.layers[i], index, active);
            mc.layers[i].isSelected = active;
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].isContainer) {
                addRemoveContainer(mc.layers[i].Layer[s], null, active);
              } else {
                if (active === 0) {
                  mc.layers[i].Layer[s].isSelected = active;
                  mc.layers[i].Layer[s].isActiveLayer = false;
                  removeLayer(mc.layers[i].Layer[s], index);
                } else {
                  addLayer(mc.layers[i].Layer[s]);
                }
              }
            }
          }

          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].Name === item.Name) {
                addRemoveLayerFromCookie(mc.layers[i].Layer[s], index, active);
                mc.layers[i].Layer[s].isSelected = active;
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  if (mc.layers[i].Layer[s].isContainer) {
                    addRemoveContainer(
                      mc.layers[i].Layer[s].Layer[t],
                      null,
                      active
                    );
                  } else {
                    if (active === 0) {
                      mc.layers[i].Layer[s].Layer[t].isSelected = active;
                      mc.layers[i].Layer[s].Layer[t].isActiveLayer = false;
                      removeLayer(mc.layers[i].Layer[s].Layer[t], index);
                    } else {
                      addLayer(mc.layers[i].Layer[s].Layer[t]);
                    }
                  }
                }
                //third level is this working?????? -- CHECK THIS!
                if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                  for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                    mc.layers[i].Layer[s].isSelected = active;
                    if (active === 0) {
                      mc.layers[i].Layer[s].Layer[t].isSelected = active;
                      mc.layers[i].Layer[s].Layer[t].isActiveLayer = false;
                      removeLayer(mc.layers[i].Layer[s].Layer[t], index);
                    } else {
                      addLayer(mc.layers[i].Layer[s].Layer[t]);
                    }
                  } //close third level
                }
              }
            } //close secondedlevel
          }
        } //close first level

        //if no active layer, select first available. Wait 500ms until container layers are rendered
        if (typeof mapFactory.getActiveLayerName() == "undefined") {
          setTimeout(function () {
            selectNextAvailableActiveLayer();
          }, 500);
        }
      }

      //****************************************************************
      //********************   END ADD/REMOVE CONTAINER    *************
      //****************************************************************

      //****************************************************************
      //********************        MARK ACTIVE LAYER      *************
      //****************************************************************

      function markActiveLayer(name) {
        log("markActiveLayer(" + name + ")");
        if (typeof name != "undefined" && name != "undefined") {
          //first Level
          for (var i = 0; i < mc.layers.length; i++) {
            if (mc.layers[i].Name === name) {
              if (!mc.layers[i].isContainer) {
                mc.layers[i].isActiveLayer = true;
                mc.layers[i].isSelected = true;
              } else {
                mc.layers[i].isActiveLayer = false;
              }
              break;
            }
            //second level
            if (typeof mc.layers[i].Layer != "undefined") {
              for (var s = 0; s < mc.layers[i].Layer.length; s++) {
                if (mc.layers[i].Layer[s].Name === name) {
                  if (!mc.layers[i].Layer[s].isContainer) {
                    mc.layers[i].Layer[s].isActiveLayer = true;
                    mc.layers[i].Layer[s].isSelected = true;
                  } else {
                    mc.layers[i].Layer[s].isActiveLayer = false;
                  }
                  break;
                }
                //third level
                if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                  for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                    if (mc.layers[i].Layer[s].Layer[t].Name === name) {
                      if (!mc.layers[i].Layer[s].Layer[t].isContainer) {
                        mc.layers[i].Layer[s].Layer[t].isActiveLayer = true;
                        mc.layers[i].Layer[s].Layer[t].isSelected = true;
                      } else {
                        mc.layers[i].Layer[s].Layer[t].isActiveLayer = false;
                      }
                      break;
                    }
                  }
                }
              }
            }
          }
          if (useCookies && name) {
            storeActiveLayer(name);
          }
        }

        var canEdit = userCanEditLayer(name);
        if (canEdit) {
          mapFactory.getLayerAttributes(name);
        }
      }

      //****************************************************************
      //********************     END MARK ACTIVE LAYER     *************
      //****************************************************************

      //****************************************************************
      //********************      UNMARK ACTIVE LAYER      *************
      //****************************************************************

      function unMarkLayer(layer_name) {
        log("unMarkLayer(" + layer_name + ")");
        //first Level
        for (var i = 0; i < mc.layers.length; i++) {
          if (mc.layers[i].Name === layer_name) {
            mc.layers[i].isSelected = false;
          }
          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].Name === layer_name) {
                mc.layers[i].Layer[s].isSelected = false;
              }
              //third level
              if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  if (mc.layers[i].Layer[s].Layer[t].Name === layer_name) {
                    mc.layers[i].Layer[s].Layer[t].isSelected = false;
                  }
                }
              }
            }
          }
        }
        resetActiveLayer();
        selectNextAvailableActiveLayer();
      }

      function unMarkActiveLayer(layer_name) {
        log("unMarkActiveLayer(" + layer_name + ")");
        //first Level
        for (var i = 0; i < mc.layers.length; i++) {
          if (mc.layers[i].Name === layer_name) {
            mc.layers[i].isSelected = false;
          }
          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].Name === layer_name) {
                mc.layers[i].Layer[s].isSelected = false;
              }
              //third level
              if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  if (mc.layers[i].Layer[s].Layer[t].Name === layer_name) {
                    mc.layers[i].Layer[s].Layer[t].isSelected = false;
                  }
                }
              }
            }
          }
        }
      }
      //****************************************************************
      //********************    END  UNMARK ACTIVE LAYER   *************
      //****************************************************************

      //****************************************************************
      //********************        GET MARKED LAYER      **************
      //****************************************************************

      function getMarkedLayerAsActive() {
        //first Level
        var retorno = null;
        for (var i = 0; i < mc.layers.length; i++) {
          if (mc.layers[i].isActiveLayer) {
            retorno = mc.layers[i].Name;
            break;
          }
          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].isActiveLayer) {
                retorno = mc.layers[i].Layer[s].Name;
                break;
              }
              //third level
              if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  if (mc.layers[i].Layer[s].Layer[t].isActiveLayer) {
                    retorno = mc.layers[i].Layer[s].Layer[t].Name;
                    break;
                  }
                }
              }
            }
          }
        }
        return retorno;
      }

      //****************************************************************
      //********************     END GET MARKED LAYER     **************
      //****************************************************************

      //****************************************************************
      //***************  Get Object Layer By name   ********************
      //****************************************************************

      function getObjectLayerByLayerName(name) {
        log("getObjectLayerByLayerName(" + name + ")");
        var rawlayers = mc.layers;
        //first Level
        for (var i = 0; i < rawlayers.length; i++) {
          if (rawlayers[i].Name === name) {
            return rawlayers[i];
            break;
          }
          //second level
          if (typeof rawlayers[i].Layer != "undefined") {
            for (var s = 0; s < rawlayers[i].Layer.length; s++) {
              if (rawlayers[i].Layer[s].Name === name) {
                return rawlayers[i].Layer[s];
                break;
              }

              //third level
              if (typeof rawlayers[i].Layer[s].Layer != "undefined") {
                for (var t = 0; t < rawlayers[i].Layer[s].Layer.length; t++) {
                  if (rawlayers[i].Layer[s].Layer[t].Name === name) {
                    return rawlayers[i].Layer[s].Layer[t];
                    break;
                  }
                }
              }
            }
          }
        }
      }

      //****************************************************************
      //************  End Get Object Layer By name   *******************
      //****************************************************************

      //****************************************************************
      //************        get editable layers      *******************
      //****************************************************************

      function getEditableLayers() {
        return editable_layers;
      }

      function getEditableLayersTableNames() {
        return editable_layers_table_names;
      }

      //****************************************************************
      //************       end  get editable layers    *****************
      //****************************************************************

      //****************************************************************
      //***************    Get Layer Name By table   *******************
      //****************************************************************

      function getLayerNameByLayerTable(name) {
        log("getLayerNameByLayerTable(" + name + ")");
        for (var i = 0; i < user_permissions.length; i++) {
          if (user_permissions[i].db_table === name) {
            return user_permissions[i].qgis_name;
          }
        }
        return false;
      }

      //****************************************************************
      //**********     End Get Layer Name By table    ******************
      //****************************************************************

      //****************************************************************
      //***************    Get table By layer name   *******************
      //****************************************************************

      function getTableNameByLayerName(name) {
        log("getTableNameByLayerName(" + name + ")");
        if (getLayerIndex(name) > -1) {
          //	if(type)
          return layers_table_names[getLayerIndex(name)];
        }
      }

      //****************************************************************
      //**********     End  Get table By layer name   ******************
      //****************************************************************

      //****************************************************************
      //******     get table names from layer list names    ************
      //****************************************************************

      function getTableNamesFromLayersNameList(list) {
        var retorno = Array();
        var index = null;
        for (var i = 0; i < list.length; i++) {
          retorno.push(layers_table_names[getLayerIndex(list[i])]);
        }
        return retorno;
      }

      //****************************************************************
      //******    end get table names from layer list names    *********
      //****************************************************************

      function resetActiveLayer() {
        log("resetActiveLayer");
        //var activeLayer = getMarkedLayerAsActive();
        //first Level
        for (var i = 0; i < mc.layers.length; i++) {
          mc.layers[i].isActiveLayer = false;
          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              mc.layers[i].Layer[s].isActiveLayer = false;
              //third level
              if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  mc.layers[i].Layer[s].Layer[t].isActiveLayer = false;
                }
              }
            }
          }
        }
        mc.SinglePointInfo = false;
        mc.pointsInfo = false;
        mc.pointInfoActive = false;
        mc.addPointForm = false;
        mapFactory.setTool(null);
        //clean geometries added from othe layers
        mapFactory.cleanGeometries("all");
      }

      function layerIsContainer(layer) {
        log("layerIsContainer(" + layer + ")");
        for (var i = 0; i < mc.layers.length; i++) {
          if (mc.layers[i].Name === layer) {
            return mc.layers[i].isContainer;
            break;
          }
          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (mc.layers[i].Layer[s].Name === layer) {
                return mc.layers[i].Layer[s].isActiveLayer;
                break;
              }
              //third level
              if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  if (mc.layers[i].Layer[s].Layer[t].Name === layer) {
                    return mc.layers[i].Layer[s].Layer[t].isActiveLayer;
                    break;
                  }

                  //fourth level
                  if (
                    typeof mc.layers[i].Layer[s].Layer[t].Layer != "undefined"
                  ) {
                    for (
                      var f = 0;
                      f < mc.layers[i].Layer[s].Layer[t].Layer.length;
                      f++
                    ) {
                      if (
                        mc.layers[i].Layer[s].Layer[t].Layer[f].Name === layer
                      ) {
                        return mc.layers[i].Layer[s].Layer[t].Layer[f]
                          .isActiveLayer;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      function selectNextAvailableActiveLayer() {
        log(
          "selectNextAvailableActiveLayer()",
          mapFactory.getLayersDisplayed()
        );
        resetActiveLayer();
        var layerDisplayed = false;
        var layers_displayed = mapFactory.getLayersDisplayed();
        //find first available layer for select
        for (var i = 0; i < layers_displayed.length; i++) {
          if (!layerIsContainer(layers_displayed[i])) {
            markActiveLayer(layers_displayed[i]);
            //$rootScope.$broadcast('legendEvent',{});
            mapFactory.setActiveLayer(layers_displayed[i]);
            layerDisplayed = true;
            break;
          }
        }
        if (!layerDisplayed) {
          mapFactory.setTool(null);
          mapFactory.resetActiveLayer();
          mapFactory.resetAddTools();
          $rootScope.addPointDisabled = true;
          $rootScope.addLineDisabled = true;
          $rootScope.addPolygonDisabled = true;
          //selectNextAvailableALegend();
        }
      }

      function selectNextAvailableALegend() {
        log("selectNextAvailableALegend()");
        var layers_displayed = mapFactory.getLayersDisplayed();
        if (layers_displayed.length > 0) {
          //find first available layer for select
          for (var i = 0; i < layers_displayed.length; i++) {
            if (layerIsContainer(layers_displayed[i])) {
              $rootScope.$broadcast("legendEvent", {});
              break;
            }
          }
        } else {
          $rootScope.$broadcast("legendEvent", {});
        }
      }

      $rootScope.$on("notifyNoActiveLayer", function (event, data) {
        mc.legend = null;
        mc.showLegend = false;
        if ($("#legend").length > 0) {
          $("#legend").collapse("hide");
          $("#menuLegend").addClass("collapsed");
        }
      });

      //****************************************************************
      //***********************      COOKIES      **********************
      //****************************************************************

      function addRemoveLayerFromCookie(obj, index, what) {
        log("addRemoveLayerFromCookie(" + index + "," + what + "): ", obj);
        var existsOnCookie = false;
        for (var i = 0; i < layers_cookie.length; i++) {
          if (layers_cookie[i].Name === obj.Name) {
            if (what) {
              layers_cookie.push({ Name: obj.Name, item: obj, index: index });
            } else {
              layers_cookie.splice(i, 1);
            }
            existsOnCookie = true;
            break;
          }
        }
        if (what && !existsOnCookie) {
          if (obj.isContainer === false) {
            layers_cookie.push({ Name: obj.Name, item: obj, index: index });
          }
        }

        if (useCookies) {
          log(
            "addRemoveLayerFromCookie useCookies layers_cookie: ",
            layers_cookie
          );
          var cookieName = "bmaps_" + project_id + "_tocCookie";

          var cookie = {};
          if (cookieName) {
            cookie = JSON.parse(getCookie(cookieName));
            if (cookie === null) cookie = {};
            cookie.layers = layers_cookie;
          } else {
            cookie.layers = layers_cookie;
          }
          setCookie(cookieName, JSON.stringify(cookie), 1);
          if (layers_cookie.length === 0) {
            storeActiveLayer(null);
          }
        }
      }

      function storeActiveLayer(layer) {
        let cookieName = "bmaps_" + project_id + "_tocCookieSelectedLayer";
        if (layer) {
          localStorage.setItem(cookieName, layer);
        } else {
          localStorage.removeItem(cookieName);
        }
      }

      function restoreCookieLayers(project_id) {
        log("restoreCookieLayers(" + project_id + ")");
        var cookieName = "bmaps_" + project_id + "_tocCookie";
        var tocCookie = getCookie(cookieName);
        try {
          var cookie = JSON.parse(tocCookie);
          log("restoreCookieLayers()", cookie);
          for (var c = 0; c < cookie.layers.length; c++) {
            var lay = cookie.layers[c].item;
            mapFactory.addLayer(lay.Name);
            displayed_layers.push(lay.Name);
            setLayerProperties(lay, [{ name: "isSelected", value: true }]);
          }
          if (cookie.layers.length > 0) {
            setTimeout(function () {
              let storedLayer = localStorage.getItem(
                "bmaps_" + project_id + "_tocCookieSelectedLayer"
              );
              if (storedLayer) {
                mapFactory.setActiveLayer(storedLayer);
                markActiveLayer(storedLayer);
                userCanEditLayer(storedLayer);
              } else {
                mapFactory.setActiveLayer(cookie.layers[0].item.Name);
                markActiveLayer(cookie.layers[0].item.Name);
                userCanEditLayer(cookie.layers[0].item.Name);
              }

              $rootScope.$broadcast("legendEvent", {
                item: cookie.layers[0].item,
                event: "show",
              });
            }, 1000);
          }
          if (typeof cookie.zoom_level != "undefined") {
            mapFactory.setZoomLevelAndCenter(cookie.zoom_level, cookie.center);
          }
          layers_cookie = cookie.layers;
        } catch (e) {
          log("restoreCookieLayers() is empty or can't be parsed", cookie);
        }
      }

      function setCookie(cname, cvalue, exdays) {
        localStorage.setItem(cname, cvalue);
      }

      function getCookie(cname) {
        return localStorage.getItem(cname);
      }

      //****************************************************************
      //***********************    END  COOKIES   **********************
      //****************************************************************

      //****************************************************************
      //*****************         CONTAINER EYE        *****************
      //****************************************************************

      function _getContainer(layer_name) {
        let container = null;
        let childs = Array();
        let ready = false;
        //first Level
        for (var i = 0; i < mc.layers.length; i++) {
          //			container = mc.layers[i];
          childs = Array();
          if (mc.layers[i].Name === layer_name) {
            ready = true;
          }

          //second level
          if (typeof mc.layers[i].Layer != "undefined") {
            container = mc.layers[i];
            for (var s = 0; s < mc.layers[i].Layer.length; s++) {
              if (userCanSeeLayer(mc.layers[i].Layer[s].Name)) {
                childs.push(mc.layers[i].Layer[s].Name);
              }
              if (mc.layers[i].Layer[s].Name === layer_name) {
                ready = true;
              }
              //third level
              if (typeof mc.layers[i].Layer[s].Layer != "undefined") {
                container = mc.layers[i].Layer[s];
                for (var t = 0; t < mc.layers[i].Layer[s].Layer.length; t++) {
                  //fourth level ??
                  if (
                    typeof mc.layers[i].Layer[s].Layer[t].Layer != "undefined"
                  ) {
                  }
                } //end third level
              }
            } //end second level
            if (ready) {
              return { container: container, childs: childs };
            }
          }
        } // end first Level
        if (ready) {
          return { container: container, childs: childs };
        }
      }

      function _markContainerAsVisible(data) {
        var childsVisible = 0;
        for (var i = 0; i < data.childs.length; i++) {
          if (displayed_layers.indexOf(data.childs[i]) > -1) {
            childsVisible++;
          }
        }
        if (childsVisible === data.childs.length && childsVisible > 0) {
          setLayerProperties(data.container, [
            { name: "isSelected", value: true },
          ]);
          addRemoveLayerFromCookie(
            data.container,
            getLayerIndex(data.container.Name),
            true
          );
        } else {
          setLayerProperties(data.container, [
            { name: "isSelected", value: false },
          ]);
          addRemoveLayerFromCookie(
            data.container,
            getLayerIndex(data.container.Name),
            false
          );
        }
      }

      //****************************************************************
      //*****************         CONTAINER EYE        *****************
      //****************************************************************

      //****************************************************************
      //***********************      HELPERS      **********************
      //****************************************************************

      //log function
      function log(evt, data) {
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename + " v." + version,
        });
      }

      function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
      }
      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************
    },
  ]);
})();
