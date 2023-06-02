/*jshint esversion: 6 */
(function () {
  "use strict";
  /**
 * Factory, select tools for map

 

 Jan/Feb 2016
*/

  angular.module("app").factory("mapSelectTool", [
    "$http",
    "$rootScope",
    function ($http, $rootScope) {
      //function mapService($http,$rootScope){
      if (!ol) return {};

      var filename = "mapSelectTool.js",
        version = "1.1.0",
        app_name = null,
        viewProjection = null,
        viewResolution = null,
        vectorSource = null,
        map = null,
        epsg = null,
        canAddPoint = true,
        dragBox = null, //drag box for select area
        urlWMS = null,
        vectorSourceForPoints = null,
        vectorLayerForPoints = null,
        pointCoordinates = null,
        highLightLayer = null, //layer for highlighted town
        highLightSource = null, //source for highlifgted polygon
        multipleSelection = false,
        isPolygonSelecting = false,
        pointerMoveListener, //listener pointer move
        drawStyle,
        draw,
        drawStartEvent,
        drawEndEvent,
        sketch,
        highlightStyle,
        highlightedLayers = Array(),
        highlightedGeoms = Array(),
        selectedFeatures = Array(), //array with selected features info
        multipleSelectData = {
          id: Array(),
          geometry: Array(),
          id_name: Array(),
          table: Array(),
          feature: Array(),
        },
        max_features = null, //limit of features for queries
        token = null,
        geom_colors = {}, //object with color customization for select/edit geometries
        touchDevice = 0, //0 no touch device, 1 touch device (mobiler or tablet)
        mapToc = null, //TOC object and methods
        mapFactory = null,
        sensibilityFactor = 3, //sensibility factor to increase tolerance on clic/touch
        selectedFeauture = null; //selected feauture for edit/delete methods
      // public API
      var dataFactory = {
        init: init,
        selectPoint: selectPoint,
        selectPointOffline: selectPointOffline,
        getMultiple: getMultiple,
        addRemoveElement: addRemoveElement,
        resetMultipleSelect: resetMultipleSelect,
        getMultipleData: getMultipleData,
        setMultipleSelectData: setMultipleSelectData,
        setMultiple: setMultiple,
        highLightGeometry: highLightGeometry,
        clearHighlight: clearHighlight,
        setMaxFeatures: setMaxFeatures,
        getSelectedFeauture: getSelectedFeauture,
        addresschosen: addresschosen,
        initPolygonSelect: initPolygonSelect,
        getPolygonSelect: getPolygonSelect,
        removePolygonSelect: removePolygonSelect,
      };
      return dataFactory;

      //****************************************************************
      //***********************       INIT       ***********************
      //****************************************************************

      function init(
        _map,
        _epsg,
        _viewProjection,
        _viewResolution,
        _vectorSource,
        _token,
        _app_name,
        _urlWMS,
        _max_features,
        _geom_colors,
        _touchDevice,
        _mapToc,
        _mapFactory
      ) {
        map = _map;
        epsg = _epsg;
        viewProjection = _viewProjection;
        viewResolution = _viewResolution;
        vectorSource = _vectorSource;
        token = _token;
        app_name = _app_name;
        urlWMS = _urlWMS;
        max_features = _max_features;
        geom_colors = _geom_colors;
        touchDevice = _touchDevice;
        mapToc = _mapToc;
        mapFactory = _mapFactory;
        if (touchDevice != 0) {
          sensibilityFactor = 20;
        }

        log(
          "init(" +
            _map +
            "," +
            _epsg +
            "," +
            _token +
            "," +
            _app_name +
            "," +
            _geom_colors +
            "," +
            _touchDevice +
            ")",
          "info"
        );
        log("sensibilityFactor: " + sensibilityFactor, "info");

        vectorSourceForPoints = new ol.source.Vector({});
        vectorLayerForPoints = new ol.layer.Vector({
          source: vectorSourceForPoints,
        });

        map.addLayer(vectorLayerForPoints);

        highLightSource = new ol.source.Vector();
        highLightLayer = new ol.layer.Vector({
          source: highLightSource,
          zIndex: 999,
        });
        // Add the vector layer to the map.
        map.addLayer(highLightLayer);

        map.on("removeHighlightedFeauture", function (evt) {
          highLightSource.clear();
        });
        highlightStyle = new ol.style.Style({
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
        _setDrawStyle("measure");
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      //****************************************************************
      //******************       POLYGON SELECT       ******************
      //****************************************************************

      function initPolygonSelect(mode) {
        log(
          "initPolygonSelect(" + mode + ") - isMeasuring: " + isPolygonSelecting
        );
        if (!isPolygonSelecting) {
          if (touchDevice === 1) {
            //register event pointer move if is mobile
            pointerMoveListener = map.on("click", pointerMoveHandler);
          } else {
            //register event pointer move if is desktop
            pointerMoveListener = map.on("pointermove", pointerMoveHandler);
          }
          _setDrawStyle("polygonSelect");
          addInteraction("Polygon");
          isPolygonSelecting = true;
        }
      }

      function getPolygonSelect() {
        if (sketch) {
          var format = new ol.format.WKT({});
          var raw_geometry = format.writeGeometry(sketch.getGeometry());
          return raw_geometry;
        } else {
          return null;
        }
      }

      function removePolygonSelect() {
        log("removePolygonSelect", "info");
        if (sketch) {
          vectorSource.removeFeature(sketch);
        }
        map.removeInteraction(draw);
        _setDrawStyle("measure");
        isPolygonSelecting = false;
      }

      //****************************************************************
      //*******************	   END POLYGON SELECT     ******************
      //****************************************************************

      //****************************************************************
      //***********************   SELECT POINT    **********************
      //****************************************************************

      function selectPointOffline(pixel, clickedCooordinates, layer_name) {
        log(
          "selectPointOffline " +
            pixel +
            ", clickedCooordinates: " +
            clickedCooordinates +
            " layer: " +
            layer_name,
          "info"
        );
        if (!multipleSelection) {
          clearHighlight();
        }
        var feature = map.forEachFeatureAtPixel(
          pixel,
          function (feature, layer) {
            return feature;
          },
          {
            hitTolerance: 5,
            layerFilter: function (layer) {
              return layer.get("name") === layer_name;
            },
          }
        );
        if (feature) {
          log("selectPointOffline feature found", "success", feature);
          var coordinates = feature.getGeometry().getCoordinates();
          var Attributes = [];
          var properties = feature.getProperties();
          for (var o in properties) {
            if (o != "geometry") {
              Attributes.push({ name: o, value: properties[o] });
            }
          }
          var ol3Geom = feature.getGeometry();
          var format = new ol.format.WKT();
          var wktRepresenation = format.writeGeometry(ol3Geom);
          Attributes.push({ name: "geometry", value: wktRepresenation });
          selectFeature(feature, Attributes, coordinates, layer_name);
        }
      }

      function selectPoint(
        coordinates,
        mapData,
        _viewResolution,
        layerList,
        feature_id
      ) {
        log(
          "selectPoint() multipleSelection: " +
            multipleSelection +
            " resolution: " +
            _viewResolution +
            " feature_id: " +
            feature_id,
          "info",
          coordinates
        );
        //update resolution on each click!
        viewResolution = _viewResolution;
        if (!multipleSelection) {
          clearHighlight();
        }
        var infoOptionsObj = {
          INFO_FORMAT: "text/xml",
        };
        if (typeof layerList != "undefined") {
          log(
            "selectPoint() feature_id: " + feature_id + " layerList: ",
            "info",
            layerList
          );
          infoOptionsObj["QUERY_LAYERS"] = layerList;
        }
        $rootScope.$broadcast("featureInfoRequested", {});
        if (mapData.layersVars.length > 0) {
          if (typeof mapData.layersVars[mapData.activeLayer] != "undefined") {
            var selectableLayer = mapData.layersVars[mapData.activeLayer];
            var url = selectableLayer
              .getSource()
              .getGetFeatureInfoUrl(
                coordinates,
                Math.min(Math.max(viewResolution * sensibilityFactor, 1), 1),
                viewProjection,
                infoOptionsObj
              );
          } else {
            var url = false;
            $rootScope.$broadcast("displayMapError", {
              err: "Layer is not selectable",
            });
          }
        } else {
          log("selectPoint no layer rendered, info on all layers", "warn");
          infoOptionsObj["QUERY_LAYERS"] = mapToc
            .getAvailableLayers()
            .toString();
          //add one layer for do getGetFeatureInfoUrl request
          mapFactory.addLayer(mapToc.getRawLayers()[0].Name, 0);
          var url = mapFactory
            .getOLLayersDisplayed()[0]
            .getSource()
            .getGetFeatureInfoUrl(
              coordinates,
              viewResolution * 5,
              viewProjection,
              infoOptionsObj
            );
          ///remove layer
          mapFactory.removeLayer(mapToc.getRawLayers()[0].Name);
        }
        if (url) {
          log("selectPoint url", "info", url);
          var parser = new ol.format.GeoJSON();
          $http.get(url).success(function (response) {
            var json = xml2json(response);
            log("selectPoint xml2json", "info", json);
            //Broadcast event for data rendering
            var returnData = {};
            returnData.Attributes = false;
            try {
              if (
                typeof json.GetFeatureInfoResponse !== "undefined" ||
                json.GetFeatureInfoResponse != ""
              ) {
                if (
                  typeof json.GetFeatureInfoResponse.Layer.length ===
                  "undefined"
                ) {
                  if (
                    typeof json.GetFeatureInfoResponse.Layer.Feature !=
                    "undefined"
                  ) {
                    if (
                      typeof json.GetFeatureInfoResponse.Layer.Feature
                        .Attribute != "undefined"
                    ) {
                      var feauture = json.GetFeatureInfoResponse.Layer.Feature;
                      selectFeature(
                        feauture,
                        feauture.Attribute,
                        coordinates,
                        json.GetFeatureInfoResponse.Layer.name
                      );
                    }
                  } else {
                    $rootScope.$broadcast("featureInfoReceived", { length: 0 });
                  }
                } else {
                  log(
                    "GetFeatureInfoResponse from doInfoFromCoordinates - feature_id: " +
                      feature_id,
                    "info",
                    json.GetFeatureInfoResponse
                  );
                  for (
                    var i = 0;
                    i < json.GetFeatureInfoResponse.Layer.length;
                    i++
                  ) {
                    if (
                      typeof json.GetFeatureInfoResponse.Layer[i].Feature !=
                      "undefined"
                    ) {
                      if (
                        typeof json.GetFeatureInfoResponse.Layer[i].Feature
                          .Attribute != "undefined"
                      ) {
                        var feauture =
                          json.GetFeatureInfoResponse.Layer[i].Feature;

                        if (typeof feature_id != "undefined") {
                          if (feauture.Attribute[0].value == feature_id) {
                            if (
                              mapFactory
                                .getLayersDisplayed()
                                .indexOf(
                                  json.GetFeatureInfoResponse.Layer[i].name
                                ) === -1
                            ) {
                              mapFactory.addLayer(
                                json.GetFeatureInfoResponse.Layer[i].name,
                                i
                              );
                              mapFactory.setActiveLayer(
                                json.GetFeatureInfoResponse.Layer[i].name
                              );
                            }
                            selectFeature(
                              feauture,
                              feauture.Attribute,
                              coordinates,
                              json.GetFeatureInfoResponse.Layer[i].name
                            );
                            break;
                          }
                        } else {
                          if (
                            mapFactory
                              .getLayersDisplayed()
                              .indexOf(
                                json.GetFeatureInfoResponse.Layer[i].name
                              ) === -1
                          ) {
                            mapFactory.addLayer(
                              json.GetFeatureInfoResponse.Layer[i].name,
                              i
                            );
                            mapFactory.setActiveLayer(
                              json.GetFeatureInfoResponse.Layer[i].name
                            );
                          }
                          selectFeature(
                            feauture,
                            feauture.Attribute,
                            coordinates,
                            json.GetFeatureInfoResponse.Layer[i].name
                          );
                          break;
                        }
                      }
                    }
                    //notify nothing found at this coordinates
                    if (i + 1 === json.GetFeatureInfoResponse.Layer.length) {
                      $rootScope.$broadcast("featureInfoReceived", {
                        length: 0,
                      });
                    }
                  }
                }
              }
            } catch (e) {
              log("Couldn't find info in json", "warn");
              $rootScope.$broadcast("featureInfoReceived", null);
            }
          });
        }
        /*	}else{
				log("selectPoint no layer rendered","warn");
				$rootScope.$broadcast('displayMapError',{err: "You must select a layer"});
			}*/
      }

      function selectFeature(feature, Attributes, coordinates, layer_name) {
        log(
          "selectFeature(" + coordinates + "," + layer_name + ")",
          "info",
          Attributes
        );
        var pol_id = Attributes[0].value;
        var pol_id_name = Attributes[0].name;
        var featureAlreadySelected = featureIsSelected(pol_id);
        /*if(mapFactory.getLayersDisplayed().indexOf(layer_name)===-1){
			//mark layer as active layer
			mapFactory.setActiveLayer(layer_name);

			//$scope.setActiveLayer(mapToc.getObjectLayerByLayerName(data[0].layer));
		}*/
        //if is not selected, add the feature to array and map
        if (featureAlreadySelected === -1) {
          var item = {
            pol_id: pol_id,
            pol_id_name: pol_id_name,
            Attributes: Attributes,
            lat: coordinates[0],
            lon: coordinates[1],
            layer: layer_name,
            foto_node_id: null,
          };
          //If exists add foto_node_id (object with features photos)
          var foto_node_id = findByName(Attributes, "foto_node_id");
          if (typeof foto_node_id != "undefined") {
            item.foto_node_id = foto_node_id;
          }
          try {
            var raw_geometry = findByName(Attributes, "geometry");
            //generate geometry
            var format = new ol.format.WKT({});
            var geom2Hightlight = format.readGeometry(raw_geometry.value, {
              dataProjection: epsg,
              featureProjection: epsg,
            });
            item.geometryWKT = raw_geometry.value;
            highLightGeometry(geom2Hightlight);
          } catch (e) {
            log("Couldn't find geometry in feature attributes", "warn");
          }
          selectedFeatures.push(item);
        } else {
          //if is already selected, remove it
          if (multipleSelection) {
            selectedFeatures.splice(featureAlreadySelected, 1);
            removeGeometryFromMap(
              highlightedLayers[featureAlreadySelected],
              featureAlreadySelected
            );
          }
        }
        //************** Send data to DOM
        $rootScope.$broadcast("featureInfoReceived", selectedFeatures);
      }

      //****************************************************************
      //***********************   END SELECT POINT    ******************
      //****************************************************************

      //****************************************************************
      //***********************    MULTIPLE SELECT    ******************
      //****************************************************************

      function setMultiple(mode) {
        log("setMultiple(" + mode + ")", "info", multipleSelection);
        multipleSelection = mode;
      }

      function getMultiple() {
        log("getMultiple()", "info", multipleSelection);
        return multipleSelection;
      }

      function getMultipleData() {
        return multipleSelectData;
      }

      function addRemoveElement(data) {
        log("addRemoveElement()", "info", data);
        //data should be (json) {'id':int,'id_name':string, 'geometry':string, 'table': string, 'feature': ol.feature}
        var index = _findElement(data);
        if (index === -1) {
          //add element
          multipleSelectData.id.push(data.id);
          multipleSelectData.geometry.push(data.geometry);
          multipleSelectData.id_name.push(data.id_name);
          multipleSelectData.table.push(data.table);
          var feature = highLightGeometry(geomStringToOlGeo(data.geometry));
          multipleSelectData.feature.push(feature);
          log("addRemoveElement() ADD", "info", multipleSelectData);
        } else {
          //remove element
          var highlightPos = highlightedGeoms.indexOf(data.geometry);
          removeGeometryFromMap(highlightedLayers[highlightPos], highlightPos);
          multipleSelectData.id.splice(index, 1);
          multipleSelectData.geometry.splice(index, 1);
          multipleSelectData.id_name.splice(index, 1);
          multipleSelectData.table.splice(index, 1);
          multipleSelectData.feature.splice(index, 1);
          log("addRemoveElement() REMOVE", "info", multipleSelectData);
        }
      }

      function _findElement(data) {
        //find element and return position
        return multipleSelectData.geometry.indexOf(data.geometry);
      }

      function resetMultipleSelect() {
        log("resetMultipleSelect()", "info");
        multipleSelectData = {
          id: Array(),
          geometry: Array(),
          id_name: Array(),
          table: Array(),
          feature: Array(),
        };
        clearHighlight();
      }

      function setMultipleSelectData(data) {
        log("setMultipleSelectData()", "info", data);
        multipleSelectData = data;
        /*	for(var i=0;i<multipleSelectData.geometry.length;i++){
		//	highLightGeometry(geomStringToOlGeo(multipleSelectData.geometry[i]))
	}*/
      }

      //****************************************************************
      //*******************    END MULTIPLE SELECT    ******************
      //****************************************************************

      //****************************************************************
      //*******************       ADDRESS CHOOSEN     ******************
      //****************************************************************

      function addresschosen(coordinates) {
        log("addresschosen()", "info", coordinates);
        clearHighlight();
        var addressFeature = new ol.Feature();
        addressFeature.setStyle(
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({
                color: "#72cc33",
              }),
              stroke: new ol.style.Stroke({
                color: "#fff",
                width: 2,
              }),
            }),
          })
        );

        addressFeature.setGeometry(new ol.geom.Point(coordinates));
        highLightSource.addFeature(addressFeature);
      }
      //****************************************************************
      //*******************     END ADDRESS CHOOSEN   ******************
      //****************************************************************

      //****************************************************************
      //***********************      HELPERS      **********************
      //****************************************************************

      /**
       * Handle pointer move.
       * @param {ol.MapBrowserEvent} evt
       */
      function pointerMoveHandler(evt) {
        //log("pointerMoveHandler",evt);
        if (evt.dragging) {
          return;
        }
      }

      function addInteraction(type) {
        draw = new ol.interaction.Draw({
          source: vectorSource,
          type: /** @type {ol.geom.GeometryType} */ (type),
          style: drawStyle,
        });

        map.addInteraction(draw);

        drawStartEvent = draw.on(
          "drawstart",
          function (evt) {
            log("drawstart");
            sketch = evt.feature;
          },
          this
        );

        drawEndEvent = draw.on(
          "drawend",
          function (evt) {
            log("drawend");
            log(pointerMoveListener);
            map.un(pointerMoveListener);
            if (drawStartEvent) {
              draw.un(drawStartEvent);
            }
            if (drawEndEvent) {
              draw.un(drawEndEvent);
            }
            map.removeInteraction(draw);
            if (isPolygonSelecting) {
              //dispatch event
              $rootScope.$broadcast("polygonSelect", {
                polygon: getPolygonSelect(),
              });
            }
          },
          this
        );
      }

      function clearHighlight() {
        log("clearHighlight()", "info");
        if (highLightSource) {
          highLightSource.clear();
          highlightedLayers = Array();
          highlightedGeoms = Array();
          selectedFeatures = Array();
        }
      }

      function geomStringToOlGeo(geostring) {
        log("geomStringToOlGeo()", "info", geostring);
        var format = new ol.format.WKT({});
        return format.readGeometry(geostring, {
          dataProjection: epsg,
          featureProjection: epsg,
        });
      }

      /*
		highLightGeometry
			renders in map selected features
		param geometryData: ol.geom.*
	*/
      function highLightGeometry(geometryData, geometryType) {
        log("highLightGeometry()", "info", {
          geometryData: geometryData,
          geometryType: geometryType,
          highlightedGeoms: highlightedGeoms,
        });
        var format = new ol.format.WKT(),
          geomString = format.writeGeometry(geometryData);
        //************** Highlight selected polygon
        var feature = new ol.Feature({ geometry: geometryData });
        if (highlightedGeoms.indexOf(geometryData) === -1) {
          feature.setStyle(highlightStyle);
          highLightSource.addFeature(feature);
          highlightedLayers.push(feature);
          highlightedGeoms.push(geomString);
          //************** END Highlight
          selectedFeauture = feature;
        }
        return feature;
      }

      //removes a geometry from the map
      function removeGeometryFromMap(feature, index) {
        log("removeGeometryFromMap()", "info", {
          feature: feature,
          index: index,
        });
        highLightSource.removeFeature(feature);
        highlightedLayers.splice(index, 1);
        highlightedGeoms.splice(index, 1);
        highLightSource.refresh();
      }

      //checks if a feature is already selected
      function featureIsSelected(pol_id) {
        for (var i = 0; i < selectedFeatures.length; i++) {
          if (selectedFeatures[i].pol_id === pol_id) {
            return i;
          }
        }
        return -1;
      }

      //finds a property by name in feature object
      function findByName(source, name) {
        for (var i = 0; i < source.length; i++) {
          if (source[i].name === name) {
            return source[i];
          }
        }
      }

      function setMaxFeatures(number) {
        log("setMaxFeatures(" + number + ")", "info");
        if (!isNaN(number)) {
          max_features = number;
        }
      }

      //return selectedfeature
      function getSelectedFeauture() {
        return selectedFeauture;
      }

      //As measure tool and polygon select tool use different draw style, we use this method for setting teh style
      function _setDrawStyle(type) {
        let fillColour = geom_colors.measure_fill_color;
        let strokeColour = geom_colors.measure_stroke_color;
        if (type === "polygonSelect") {
          fillColour = geom_colors.polygon_select_fill_color;
          strokeColour = geom_colors.polygon_select_stroke_color;
        }

        drawStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: fillColour,
          }),
          stroke: new ol.style.Stroke({
            color: strokeColour,
            lineDash: [1, 1],
            width: 2,
          }),
        });
      }

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

/*TBR
//****************************************************************
	//***********************    SELECT AREA    **********************
	//****************************************************************

	function selectArea(mapData){
		log("selectArea()","info",mapData);

		if(mapData.layersVars.length>0){

			var dragPan;
			map.getInteractions().forEach(function(interaction) {
				if (interaction instanceof ol.interaction.DragPan) {
					dragPan = interaction;
				}
			}, this);
			if (dragPan) {
				map.removeInteraction(dragPan);
			}


			dragBox 	= new ol.interaction.DragBox({
									//condition: ol.events.condition.shiftKeyOnly,
									style: new ol.style.Style({
										stroke: new ol.style.Stroke({
												color: [0, 0, 255, 1]
												})
									})
						});

			map.addInteraction(dragBox);

			dragBox.on('boxend', function(e) {
				$rootScope.$broadcast('featureInfoRequested',{});
				var dragBoxExtent 	= dragBox.getGeometry().getExtent();
				var etrs89_31N		= new ol.proj.Projection({
										code: 'EPSG:25831',
										extent: dragBoxExtent,
										units: 'm'
									});
				ol.proj.addProjection(etrs89_31N);
				log("selectArea Extent:","info",dragBoxExtent)
				log("MAP EPSG:","info",epsg)
				var extent = ol.proj.transformExtent(dragBoxExtent, epsg, 'EPSG:25831');
				log("selectArea Extent transformed:","info",extent);
				var url		= urlWMS+"?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typeName="+mapData.layers[mapData.activeLayer]+"&bbox="+ extent.join(',') + "&outputFormat=GeoJSON&maxFeatures="+max_features;
				log("url","info",url);


				$.get(url, function(response, status){
					//clean anti slash
					response 	= response.replace(/[/\\*]/g, "|");
					response	= JSON.parse(response);
					log("geoJSON","info",response);
					selectedFeatures	= Array();
					clearHighlight();
					multipleSelection	= true;

					var geojsonFormat = new ol.format.GeoJSON();
					var newFeatures = geojsonFormat.readFeatures(response);

					log("WFS features","info",newFeatures)
					for(var i=0;i<newFeatures.length;i++){
						log("Feature","info",response.features[i]);
						var returnData			= {}
						returnData.Attributes	= false;
						if(typeof response.features[i].geometry!== 'undefined'){
							if(typeof response.features[i].properties!== 'undefined'){
								var output 		= Array();
								for (var key in response.features[i].properties) {
									// must create a temp object to set the key using a variable
									var tempObj 	= {};
									tempObj.name 	= key;
									tempObj.value 	= response.features[i].properties[key];
									output.push(tempObj);
								}

							returnData.Attributes		= output;

							var pol_id					= response.features[i].id;
							var item = {
												"pol_id"		: pol_id,
												"Attributes"	: returnData.Attributes,
												"lat"			: extent[0],
												"lon"			: extent[1]
							}
							selectedFeatures.push(item);
							//log("Feature: ",item);
							//generate geometry
							try{
								var format				= new ol.format.WKT({});
								var raw_geometry	= format.writeGeometry(
																			newFeatures[i].getGeometry()
																		);
								var geom2Hightlight	= format.readGeometry(
																				raw_geometry,
																					{
																						dataProjection: 'EPSG:25831',
																						featureProjection: epsg
																					}
																			);
								highLightGeometry(geom2Hightlight);
							}catch(e){
								log("Couldn't find geometry in feature attributes","warn");
							}
						}}
					}

					$rootScope.$broadcast('featureInfoReceived',selectedFeatures);
					multipleSelection	= false;
					map.getView().fit(dragBoxExtent, map.getSize());
				});

			});

			// clear selection when drawing a new box and when clicking on the map
			dragBox.on('boxstart', function(e) {
				clearHighlight();
			});

		}else{
			log("selectArea no layer rendered","info");
			$rootScope.$broadcast('displayMapError',{err: "You must select a layer"});
			multipleSelection	= false;
		}
	}

	function removeSelectArea(){
		log("removeSelectArea()","info");
		var box;
		map.getInteractions().forEach(function(interaction) {
			if (interaction instanceof ol.interaction.DragBox) {
				box = interaction;
			}
		}, this);
		if (box) {
			map.removeInteraction(box);
		}
	}*/

//****************************************************************
//*********************** END SELECT AREA    *********************
//****************************************************************
