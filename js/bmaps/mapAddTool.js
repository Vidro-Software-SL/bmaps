(function () {
  "use strict";
  /**
 * Factory add elements for map

 

 Jan/Feb 2016
*/

  angular.module("app").factory("mapAddTool", [
    "$http",
    "$rootScope",
    function ($http, $rootScope) {
      if (!ol) return {};

      var filename = "mapAddTool.js",
        app_name = null,
        viewProjection = null,
        viewResolution = null,
        vectorSource = null,
        map = null,
        epsg = null,
        canAddPoint = true,
        iconStyle = null, //icon displayed when adding point
        urlWMS = null,
        pointCoordinates = null,
        isDrawing = false,
        pointerMoveListener, //listener pointer move
        drawStyle,
        draw, //draw interaction
        sketch, //draw feature for measuring
        helpTooltipElement, //The help tooltip element
        helpTooltip, //Overlay to show the help messages
        continuePolygonMsg = "Click to continue drawing the polygon", //Message to show when a user is drawing a polygon
        continueLineMsg = "Click to continue drawing the line", //Message to show when the user is drawing a line.
        helpMsg = "Click to start drawing",
        //LISTENERS
        pointerdragEvent = null,
        movestartEvent = null,
        moveendEvent = null,
        resolutionEvent = null,
        lastGeometry = null,
        dragInteraction = null,
        drawStartEvent = null,
        drawEndEvent = null,
        geom_colors = {},
        editSelect = null, //edit interactions
        modify = null, //edit interactions
        modifiedGeometry = null, //feature modified geometry
        localized_strings = null,
        token = null;

      // public API
      var dataFactory = {
        init: init,
        addPoint: addPoint,
        clearAddPoint: clearAddPoint,
        fixPoint: fixPoint,
        initLine: initLine,
        initPolygon: initPolygon,
        fixGeometry: fixGeometry,
        resetAddTools: resetAddTools,
        editGeometry: editGeometry,
        endEditGeometry: endEditGeometry,
        forceEndDrawing: forceEndDrawing,
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
        _geom_colors,
        _localized_strings
      ) {
        map = _map;
        epsg = _epsg;
        viewProjection = _viewProjection;
        viewResolution = _viewResolution;
        vectorSource = _vectorSource;
        token = _token;
        app_name = _app_name;
        urlWMS = _urlWMS;
        geom_colors = _geom_colors;
        localized_strings = _localized_strings;
        iconStyle = new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 16],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            opacity: 1,
            src: "../../js/dist/marker.png",
          }),
        });

        log(
          "init(" + _map + "," + _epsg + "," + _token + "," + _app_name + ")"
        );
        if (
          typeof localized_strings.CLICK_TO_CONTINUE_DRAWING_POLYGON !=
          "undefined"
        ) {
          continuePolygonMsg =
            localized_strings.CLICK_TO_CONTINUE_DRAWING_POLYGON;
          continueLineMsg = localized_strings.CLICK_TO_CONTINUE_DRAWING_LINE;
          helpMsg = localized_strings.CLICK_TO_START_DRAWING;
        }
        drawStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: geom_colors.edit_fill_color,
          }),
          stroke: new ol.style.Stroke({
            color: geom_colors.edit_stroke_color,
            lineDash: [10, 10],
            width: 2,
          }),
          image: new ol.style.Icon({
            anchor: [0.5, 4],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            opacity: 1,
            src: "../../js/dist/point.png",
          }),
        });

        //register event pointer move
        pointerMoveListener = map.on("pointermove", pointerMoveHandler);
        var event = new Event("deactivateAnimations");
        dispatchEvent(event);
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      //****************************************************************
      //***********************     ADD POINT    ***********************
      //****************************************************************

      function addPoint(coordinates, type) {
        log(
          "addPoint: " +
            coordinates +
            ", canAddPoint: " +
            canAddPoint +
            ", type: " +
            type
        );
        if (canAddPoint) {
          map.dispatchEvent("deactivateAnimations");
          pointCoordinates = coordinates;
          $rootScope.$broadcast("addPointCoordinates", {
            coord: pointCoordinates,
          });
          var geomType = null; //store geometry type in var for Point or multipoint selection
          if (type === "MultiPoint") {
            geomType = new ol.geom.MultiPoint([map.getView().getCenter()]);
          } else {
            geomType = new ol.geom.Point(map.getView().getCenter());
          }
          var iconFeature = new ol.Feature({
            geometry: geomType,
          });
          iconFeature.setStyle(iconStyle);

          //add target box to vector source
          vectorSource.addFeature(iconFeature);
          notifyGeometry(iconFeature.getGeometry());

          //add initial point
          lastGeometry = coordinates;
          notifyGeometry(geomType);

          canAddPoint = false;
          $rootScope.$broadcast("addingPoint", { adding: true, type: "point" });

          pointerdragEvent = map.on("pointerdrag", function () {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          movestartEvent = map.on("movestart", function () {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          moveendEvent = map.on("moveend", function () {
            log(
              "addPoint: moveend " +
                map.getView().getCenter() +
                ", canAddPoint: " +
                canAddPoint +
                ", type: " +
                type
            );
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          resolutionEvent = map.getView().on("change:resolution", function (e) {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          iconFeature.on(
            "change",
            function () {
              notifyGeometry(this.getGeometry());
            },
            iconFeature
          );
        }
      }

      //returns point geometry and reset tools
      function fixPoint() {
        var geometry = new ol.geom.Point(lastGeometry);
        resetAddTools();
        pointCoordinates = null;
        lastGeometry = null;
        map.dispatchEvent("activateAnimations");
        return geometry;
      }

      //clears addPoint tool
      function clearAddPoint() {
        log("clearAddPoint()");
        vectorSource.clear();
        /*var dragPan;
		map.getInteractions().forEach(function(interaction) {
			if (interaction instanceof ol.interaction.DragPan) {
				dragPan = interaction;
			}
		}, this);
		if (!dragPan) {
			var adddragPan = new ol.interaction.DragPan({kinetic: false});
			map.addInteraction(adddragPan);
		}*/
        map.dispatchEvent("activateAnimations");
        canAddPoint = true;
      }

      //****************************************************************
      //***********************   END ADD POINT    *********************
      //****************************************************************

      //****************************************************************
      //**********************    ADD LINE/POLYIGON    *****************
      //****************************************************************

      function initPolygon(type) {
        log("initPolygon(" + type + ")");
        if (!isDrawing) {
          resetAddTools();
          addInteraction(type);
          isDrawing = true;
          $rootScope.$broadcast("addingPoint", { adding: true, type: type });
        }
      }

      function initLine(type) {
        log("initLine(" + type + ")");
        if (!isDrawing) {
          resetAddTools();
          addInteraction(type);
          isDrawing = true;
          $rootScope.$broadcast("addingPoint", { adding: true, type: type });
        }
      }

      function addInteraction(type) {
        log("addInteraction()", type);
        draw = new ol.interaction.Draw({
          source: vectorSource,
          type: /** @type {ol.geom.GeometryType} */ (type),
          style: drawStyle,
        });

        map.addInteraction(draw);

        createHelpTooltip();

        drawStartEvent = draw.on(
          "drawstart",
          function (evt) {
            log("drawstart");
            // set sketch
            sketch = evt.feature;
          },
          this
        );

        drawEndEvent = draw.on(
          "drawend",
          function (evt) {
            log("drawend");
            notifyGeometry(sketch.getGeometry());
            if (draw) {
              map.removeInteraction(draw);
              draw = null;
            }
          },
          this
        );
      }

      function forceEndDrawing() {
        log("forceEndDrawing");
        console.log(sketch);
        notifyGeometry(sketch.getGeometry());
        if (draw) {
          map.removeInteraction(draw);
          draw = null;
        }
      }
      //returns line/polygon geometry and reset tools
      function fixGeometry() {
        log("fixGeometry()");
        if (sketch) {
          var geometry = sketch.getGeometry();
          //unset sketch
          sketch = null;
          resetAddTools();
          return geometry;
        }
      }

      //****************************************************************
      //******************     END ADD LINE/POLYGON    *****************
      //****************************************************************

      //****************************************************************
      //*******************       GEOMETRY EDITION      ****************
      //****************************************************************

      function editGeometry(feature) {
        log("editGeometry()", feature);
        modifiedGeometry = null;
        if (
          feature.getGeometry().getType() === "Point" ||
          feature.getGeometry().getType() === "MultiPoint"
        ) {
          //create a new feauture for marking point
          map.dispatchEvent("deactivateAnimations");
          var iconFeature = new ol.Feature({
            geometry: feature.getGeometry(),
          });
          iconFeature.setStyle(iconStyle);
          vectorSource.addFeature(iconFeature);
          //remove highlighted feature
          map.dispatchEvent("removeHighlightedFeauture");

          //center map on pointer
          map.getView().setCenter(feature.getGeometry().getCoordinates());
          pointerdragEvent = map.on("pointerdrag", function () {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          movestartEvent = map.on("movestart", function () {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          moveendEvent = map.on("moveend", function () {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });
          resolutionEvent = map.getView().on("change:resolution", function (e) {
            iconFeature.getGeometry().setCoordinates(map.getView().getCenter());
          });

          iconFeature.on(
            "change",
            function () {
              modifiedGeometry = feature.getGeometry();
              notifyGeometry(modifiedGeometry);
            },
            feature
          );
        } else {
          map.getView().setCenter(feature.getGeometry().getFirstCoordinate());
          feature.setStyle(drawStyle);
          editSelect = new ol.interaction.Select({
            wrapX: false,
          });
          var features = new ol.Collection();
          features.push(feature);
          modify = new ol.interaction.Modify({
            features: features,
          });
          map.getInteractions().extend([editSelect, modify]);

          modify.on("modifystart", function (evt) {
            evt.features.forEach(function (feature) {
              modifiedGeometry = feature.getGeometry();
              notifyGeometry(modifiedGeometry);
            });
          });
          modify.on("modifyend", function (evt) {
            evt.features.forEach(function (feature) {
              modifiedGeometry = feature.getGeometry();
              notifyGeometry(modifiedGeometry);
            });
          });
        }
      }

      function endEditGeometry() {
        log("endEditGeometry()");
        map.dispatchEvent("activateAnimations");
        map.removeInteraction(editSelect);
        map.removeInteraction(modify);
        editSelect = null;
        modify = null;
        modifiedGeometry = null;
        //remove lisenrs
        if (pointerdragEvent) {
          ol.Observable.unByKey(pointerdragEvent);
        }
        if (movestartEvent) {
          ol.Observable.unByKey(movestartEvent);
        }
        if (moveendEvent) {
          ol.Observable.unByKey(moveendEvent);
        }
        if (resolutionEvent) {
          ol.Observable.unByKey(resolutionEvent);
        }
      }

      //****************************************************************
      //*******************     END GEOMETRY EDITION      **************
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

        var tooltipCoord = evt.coordinate;
        if (sketch) {
          var output;
          var geom = sketch.getGeometry();
          if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (
            geom instanceof ol.geom.LineString ||
            geom instanceof ol.geom.MultiLineString
          ) {
            helpMsg = continueLineMsg;
            tooltipCoord = geom.getLastCoordinate();
          }
        }
        if (helpTooltipElement) {
          helpTooltipElement.innerHTML = helpMsg;
          helpTooltip.setPosition(evt.coordinate);
        }
      }

      /**
       * Creates a new help tooltip
       */
      function createHelpTooltip() {
        if (helpTooltipElement) {
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement("div");
        helpTooltipElement.className = "tooltipbase";
        helpTooltip = new ol.Overlay({
          element: helpTooltipElement,
          offset: [15, 0],
          positioning: "center-left",
        });
        map.addOverlay(helpTooltip);
      }

      function resetAddTools() {
        log("resetAddTools()");
        if (draw) {
          map.removeInteraction(draw);
          draw = null;
        }
        if (dragInteraction) {
          map.removeInteraction(dragInteraction);
          dragInteraction = null;
        }
        if (helpTooltipElement) {
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
          helpTooltipElement = null;
        }
        if (vectorSource) {
          vectorSource.clear();
        }
        var dragPan;
        if (map.getInteractions().getLength() > 0) {
          map.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
              dragPan = interaction;
            }
          }, this);
          if (!dragPan) {
            var adddragPan = new ol.interaction.DragPan({ kinetic: false });
            map.addInteraction(adddragPan);
          }
        }
        canAddPoint = true;
        isDrawing = false;

        //remove lisenrs
        if (pointerdragEvent) {
          ol.Observable.unByKey(pointerdragEvent);
        }
        if (movestartEvent) {
          ol.Observable.unByKey(movestartEvent);
        }
        if (moveendEvent) {
          ol.Observable.unByKey(moveendEvent);
        }
        if (resolutionEvent) {
          ol.Observable.unByKey(resolutionEvent);
        }
      }

      /*
		Notifies geometry
		param geometry: ol.geom.*
	*/
      function notifyGeometry(geometry) {
        log("notifyGeometry()", geometry.getType());
        var format = new ol.format.WKT({});
        var rawGeometry = format.writeGeometry(geometry);
        lastGeometry = geometry.getCoordinates();
        $rootScope.$broadcast("notifyGeometry", {
          geometry: rawGeometry,
          type: geometry.getType(),
        });
      }

      //log function
      function log(evt, data) {
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename,
        });
      }

      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************
    },
  ]);
})();
