(function () {
  "use strict";
  /**
 * Factory measure tools for map

 

 Jan/Feb 2016
*/

  angular.module("app").factory("mapMeasureTools", [
    "$http",
    "$rootScope",
    function ($http, $rootScope) {
      //function mapService($http,$rootScope){
      if (!ol) return {};

      var filename = "mapMeasureTool.js",
        app_name = null,
        viewProjection = null,
        map = null,
        epsg = null,
        //tools
        vectorSource,
        vectorLayer,
        draw, //draw interaction
        drawStyle,
        sketch, //draw feature for measuring
        pointerMoveListener, //listener pointer move
        helpTooltipElement, //The help tooltip element
        helpTooltip, //Overlay to show the help messages
        measureTooltipElement, //The measure tooltip element
        measureTooltip, //Overlay to show the measurement,
        continuePolygonMsg = "Click  continue drawing the polygon", //Message to show when a user is drawing a polygon
        continueLineMsg = "Click to continue drawing the line", //Message to show when the user is drawing a line.
        initialMsg = "Click to start drawing",
        helpMsg,
        //continuePolygonMsg	= 'Click to continue drawing the polygon'			//Message to show when the user is drawing a polygon.
        isMeasuring = false, //flag for know if is measuring or not
        measuringMode = null, //store measureLine or measureArea
        drawStartEvent = null,
        drawEndEvent = null,
        geom_colors = null,
        touchDevice = 0,
        measureCount = 0, //number of measures done, used or activate the tool again
        token = null;

      // public API
      var dataFactory = {
        init: init,
        initMeasure: initMeasure,
        endMeasure: endMeasure,
        getMeasureCount: getMeasureCount,
      };
      return dataFactory;

      //****************************************************************
      //***********************       INIT       ***********************
      //****************************************************************

      function init(
        _map,
        _epsg,
        _viewProjection,
        _vectorSource,
        _vectorLayer,
        _token,
        _app_name,
        _geom_colors,
        _touchDevice,
        localized_strings
      ) {
        map = _map;
        viewProjection = _viewProjection;
        token = _token;
        vectorSource = _vectorSource;
        vectorLayer = _vectorLayer;
        app_name = _app_name;
        epsg = epsg;
        geom_colors = _geom_colors;
        touchDevice = _touchDevice;
        if (
          typeof localized_strings.CLICK_TO_CONTINUE_MEASURING != "undefined" &&
          localized_strings.CLICK_TO_CONTINUE_MEASURING != "undefined"
        ) {
          continuePolygonMsg = localized_strings.CLICK_TO_CONTINUE_MEASURING;
          continueLineMsg = localized_strings.CLICK_TO_CONTINUE_MEASURING;
        }
        if (
          typeof localized_strings.CLICK_TO_START_MEASURING != "undefined" &&
          localized_strings.CLICK_TO_START_MEASURING != "undefined"
        ) {
          initialMsg = localized_strings.CLICK_TO_START_MEASURING;
        }
        helpMsg = initialMsg;
        drawStyle = new ol.style.Style({
          fill: new ol.style.Fill({
            color: geom_colors.measure_fill_color,
          }),
          stroke: new ol.style.Stroke({
            color: geom_colors.measure_stroke_color,
            lineDash: [10, 10],
            width: 2,
          }),
        });
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      function initMeasure(mode) {
        log("initMeasure(" + mode + ") - isMeasuring: " + isMeasuring);
        if (!isMeasuring) {
          if (touchDevice === 1) {
            //register event pointer move if is mobile
            pointerMoveListener = map.on("click", pointerMoveHandler);
          } else {
            //register event pointer move if is desktop
            pointerMoveListener = map.on("pointermove", pointerMoveHandler);
          }
          addInteraction(mode);
          isMeasuring = true;
          measuringMode = mode;
          measureCount = 0;
        }
      }

      function endMeasure() {
        log("endMeasure()");
        map.un(pointerMoveListener);
        if (drawStartEvent) {
          draw.un(drawStartEvent);
        }
        if (draw) {
          map.removeInteraction(draw);
        }
        map.removeOverlay(helpTooltipElement);
        sketch = null;
        drawStartEvent = null;
        drawEndEvent = null;
        isMeasuring = false;
        draw = null;
        pointerMoveListener = null;
        if (helpTooltipElement) {
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = null;
        measureTooltipElement = null;
      }

      //****************************************************************
      //***********************   	   MEASURE        ******************
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
            output = formatArea(geom); // @type {ol.geom.Polygon}
            helpMsg = continuePolygonMsg;
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(geom); // @type {ol.geom.LineString}
            helpMsg = continueLineMsg;
            tooltipCoord = geom.getLastCoordinate();
          }
          if (
            typeof measureTooltipElement != "undefined" &&
            measureTooltipElement
          ) {
            measureTooltipElement.innerHTML = output;
          }
          if (typeof measureTooltip != "undefined" && measureTooltip) {
            measureTooltip.setPosition(tooltipCoord);
          }
        }
        if (typeof helpTooltipElement != "undefined" && helpTooltipElement) {
          helpTooltipElement.innerHTML = helpMsg;
        }
        if (typeof helpTooltip != "undefined" && helpTooltip) {
          helpTooltip.setPosition(evt.coordinate);
        }
      }

      function addInteraction(type) {
        draw = new ol.interaction.Draw({
          source: vectorSource,
          type: /** @type {ol.geom.GeometryType} */ (type),
          style: drawStyle,
        });

        map.addInteraction(draw);
        createMeasureTooltip();
        createHelpTooltip();

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
            measureTooltipElement.className = "tooltipbase tooltip-static";
            measureTooltip.setOffset([0, -7]);
            //unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            if (helpTooltipElement) {
              map.removeOverlay(helpTooltipElement);
              helpTooltipElement.parentNode.removeChild(helpTooltipElement);
              helpTooltipElement = null;
              helpMsg = initialMsg;
            }
            log(pointerMoveListener);
            map.un(pointerMoveListener);
            if (drawStartEvent) {
              draw.un(drawStartEvent);
            }
            if (drawEndEvent) {
              draw.un(drawEndEvent);
            }
            map.removeInteraction(draw);
            isMeasuring = false;
            measureCount++;
          },
          this
        );
      }

      /**
       * format length output
       * @param {ol.geom.LineString} line
       * @return {string}
       */
      function formatLength(line) {
        var length = Math.round(line.getLength() * 100) / 100;
        var output;
        output = Math.round(length * 100) / 100 + " " + "m";

        return output;
      }

      /**
       * format length output
       * @param {ol.geom.Polygon} polygon
       * @return {string}
       */
      function formatArea(polygon) {
        var area = polygon.getArea();
        var output;
        output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
        return output;
      }

      //****************************************************************
      //***********************      END MEASURE      ******************
      //****************************************************************

      //****************************************************************
      //***********************      HELPERS      **********************
      //****************************************************************

      //log function
      function log(evt, data) {
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename,
        });
      }

      /**
       * Creates a new help tooltip
       */

      function createHelpTooltip() {
        helpTooltipElement = document.createElement("div");
        helpTooltipElement.className = "tooltipbase";
        helpTooltip = new ol.Overlay({
          element: helpTooltipElement,
          offset: [15, 0],
          positioning: "center-left",
        });
        map.addOverlay(helpTooltip);
      }

      /**
       * Creates a new measure tooltip
       */

      function createMeasureTooltip() {
        if (measureTooltipElement) {
          map.removeOverlay(helpTooltipElement);
        }
        measureTooltipElement = document.createElement("div");
        measureTooltipElement.className = "tooltipbase tooltip-measure";
        measureTooltip = new ol.Overlay({
          element: measureTooltipElement,
          offset: [0, -15],
          positioning: "bottom-center",
        });

        map.addOverlay(measureTooltip);
      }

      /**
       * Returns the number of measures done, used for reactivate the tool
       */

      function getMeasureCount() {
        log("getMeasureCount() " + measureCount);
        return measureCount;
      }

      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************
    },
  ]);
})();
