$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
function getBaseUrl() {
  var getUrl = window.location;
  var path = getUrl.pathname.split("/");
  var pathForDirectives = "";
  for (var i = 0; i < path.length - 1; i++) {
    if (path[i] != "") {
      pathForDirectives = pathForDirectives + "/" + path[i];
    }
  }
  return getUrl.protocol + "//" + getUrl.host + "" + pathForDirectives + "/";
}

//****************************************************************
//*******************         BT UPSTREAM      *******************
//****************************************************************

app.directive("upStream", function ($rootScope) {
  var state = false,
    toolName = "upstream",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/upstream.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipUpstream = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();

      elem.bind("click", function () {
        $rootScope.flowTraceEnabled = !$rootScope.flowTraceEnabled;
        $rootScope.$broadcast("flowTraceEnabled", {
          tool: "upstream",
          enabled: $rootScope.flowTraceEnabled,
        });

        $rootScope.closeTools();
        if ($rootScope.flowTraceEnabled) {
          setState(false);
        } else {
          $rootScope.$broadcast("flowTraceDisabled", {});
        }

        scope.$apply(function () {});
      });
      $rootScope.$on("flowTraceDisabled", function (event, data) {
        setState(true);
        elem.attr("disabled", false);
      });
      $rootScope.$on("flowTraceEnabled", function (event, data) {
        if (data.tool !== "upstream") {
          elem.attr("disabled", true);
        } else {
          elem.attr("disabled", false);
        }
      });
    },
  };
});

//****************************************************************
//*******************      END BT UPSTREAM   *********************
//****************************************************************

//****************************************************************
//*******************       BT DOWNSTREAM      *******************
//****************************************************************

app.directive("downStream", function ($rootScope) {
  var state = false,
    toolName = "downStream",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/downstream.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipDownstream = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.flowTraceEnabled = !$rootScope.flowTraceEnabled;
        $rootScope.$broadcast("flowTraceEnabled", {
          tool: "downstream",
          enabled: $rootScope.flowTraceEnabled,
        });

        $rootScope.closeTools();
        if ($rootScope.flowTraceEnabled) {
          setState(false);
        } else {
          $rootScope.$broadcast("flowTraceDisabled", {});
        }

        scope.$apply(function () {});
      });
      $rootScope.$on("flowTraceDisabled", function (event, data) {
        setState(true);
        elem.attr("disabled", false);
      });
      $rootScope.$on("flowTraceEnabled", function (event, data) {
        if (data.tool !== "downstream") {
          elem.attr("disabled", true);
        } else {
          elem.attr("disabled", false);
        }
      });
    },
  };
});
//****************************************************************
//*******************     END BT DOWNSTREAM    *******************
//****************************************************************

//****************************************************************
//***************        BT MEASURE LINE     *********************
//****************************************************************
app.directive("measureLine", function ($rootScope) {
  var state = false,
    toolName = "measureLine",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/mesure.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmeasure = attrs.tooltip;

      elem = _elem;
      elem.find("img").embedSVG();

      elem.bind("click", function () {
        $rootScope.closeTools();
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName, "LineString");
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {
          if (data.tool != toolName) {
            setState(true);
          }
        });
      });
    },
  };
});

//****************************************************************
//***************        BT MEASURE AREA     *********************
//****************************************************************
app.directive("measureArea", function ($rootScope) {
  var state = false,
    toolName = "measureArea",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/mesureArea.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmeasureArea = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click touchstart", function () {
        $rootScope.closeTools();

        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName, "Polygon");
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {
          if (data.tool != toolName) {
            setState(true);
          }
        });
      });
    },
  };
});

//****************************************************************
//***************        BT SELECT AREA     *********************
//****************************************************************
app.directive("selectArea", function ($rootScope) {
  var state = false,
    toolName = "selectArea",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/selectArea.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmeasureArea = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click touchstart", function () {
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName, "selectArea");
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {
          if (data.tool != toolName) {
            setState(true);
          }
        });
      });
    },
  };
});

//****************************************************************
//*************       BT MULTIPLE SELECT     *********************
//****************************************************************

app.directive("multipleSelect", function ($rootScope) {
  var state = false,
    toolName = "multipleSelect",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/multipleSelect.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmultipleSelect = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      //reset button
      $rootScope.$on("reset-tools", function (event, data) {
        if (data.tool != toolName) {
          setState(true);
        } else {
          scope.setMultipleSelect(true);
          setState(false);
        }
      });
      elem.bind("click touchstart", function () {
        $rootScope.closeTools();

        setState(state);

        if (state) {
          scope.setMultipleSelect(true);
        } else {
          scope.setMultipleSelect(false);
        }

        scope.$apply(function () {});
      });
    },
  };
});

//****************************************************************
//*************       END MULTIPLE SELECT    *********************
//****************************************************************

//****************************************************************
//*************       BT POLYGON SELECT      *********************
//****************************************************************

app.directive("polygonSelect", function ($rootScope) {
  var state = false,
    toolName = "polygonSelect",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/polygonSelect.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmeasureArea = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click touchstart", function () {
        setState(state);

        if (state) {
          scope.setPolygonSelect(true);
          //scope.mc.mapFactory.setTool(toolName,'polygonSelect');
        } else {
          //	scope.mc.mapFactory.setTool(null);
          scope.setPolygonSelect(false);
        }

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {
          if (data.tool != toolName) {
            setState(true);
          }
        });
      });
    },
  };
});

//****************************************************************
//*************    END BT POLYGON SELECT     *********************
//****************************************************************

//****************************************************************
//*******************        BT ADDPOINT     *********************
//****************************************************************

app.directive("addPoint", function ($rootScope) {
  var state = false,
    toolName = "point",
    elem = null;

  function setState(scope, _st) {
    if (_st) {
      state = true;
      scope.selectedClass = "tool-selected";
    } else {
      state = false;
      scope.selectedClass = "";
    }
  }

  $rootScope.$on("define_geometryTypeInTools", function (event, data) {
    toolName = data.toolName;
  });
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/addPoint.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipaddPoint = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      $rootScope.$on("reset-tools", function (event, data) {
        if (data.tool === null && state) {
          setState(scope, false);
        }
      });
      elem.bind("click", function () {
        if (state) {
          scope.mc.mapFactory.setTool(null);
          scope.cancelReviewForm();
          setState(scope, false);
        } else {
          scope.mc.mapFactory.setTool(toolName);
          //addPoint to map
          scope.mc.mapFactory.addPoint();
          scope.displayDoneGeometryButton();
          setState(scope, true);
        }
        $rootScope.closeTools();
        scope.$apply(function () {});
      });
    },
  };
});

//****************************************************************
//*******************      END BT ADDPOINT   *********************
//****************************************************************

//****************************************************************
//*******************        BT ADDLINE      *********************
//****************************************************************

app.directive("addLine", function ($rootScope) {
  var state = false,
    toolName = "LineString",
    elem = null;

  function setState(scope, _st) {
    if (_st) {
      state = true;
      scope.selectedClass = "tool-selected";
    } else {
      state = false;
      scope.selectedClass = "";
    }
  }

  //reset button
  $rootScope.$on("define_geometryTypeInTools", function (event, data) {
    toolName = data.toolName;
  });

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/addLine.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipaddLine = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      $rootScope.$on("reset-tools", function (event, data) {
        if (data.tool === null && state) {
          setState(scope, false);
        }
      });
      elem.bind("click", function () {
        $rootScope.closeTools();
        if (state) {
          scope.mc.mapFactory.setTool(null);
          scope.cancelReviewForm();
          setState(scope, false);
        } else {
          scope.mc.mapFactory.setTool(toolName);
          setState(scope, true);
        }
        scope.$apply(function () {});
      });
    },
  };
});

//****************************************************************
//*******************       END BT ADDLINE   *********************
//****************************************************************

//****************************************************************
//*******************        BT POLYGON      *********************
//****************************************************************

app.directive("addPolygon", function ($rootScope) {
  var state = false,
    toolName = "Polygon",
    elem = null;

  function setState(scope, _st) {
    if (_st) {
      state = true;
      scope.selectedClass = "tool-selected";
    } else {
      state = false;
      scope.selectedClass = "";
    }
  }

  //reset button
  $rootScope.$on("define_geometryTypeInTools", function (event, data) {
    toolName = data.toolName;
  });

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/addPolygon.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipaddPolygon = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      $rootScope.$on("reset-tools", function (event, data) {
        if (data.tool === null && state) {
          setState(scope, false);
        }
      });
      elem.bind("click", function () {
        $rootScope.closeTools();
        if (state) {
          scope.mc.mapFactory.setTool(null);
          scope.cancelReviewForm();
          setState(scope, false);
        } else {
          scope.mc.mapFactory.setTool(toolName);
          setState(scope, true);
        }
        scope.$apply(function () {});
      });
    },
  };
});

//****************************************************************
//******************      END BT POLYGON     *********************
//****************************************************************

//****************************************************************
//*******************         BT ZOOM IN     *********************
//****************************************************************

app.directive("zoomIn", function ($rootScope) {
  var state = false,
    toolName = "zoomIn",
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/zoomIn.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipZoomIn = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        scope.mc.mapFactory.zoomIn();
      });
      $rootScope.$on("zoomButtons", function (event, data) {
        if (!data.zoomIn) {
          attrs.$set("disabled", "disabled");
        } else {
          elem.attr("disabled", false);
        }
      });
    },
  };
});

//****************************************************************
//*******************     END  BT ZOOM IN    *********************
//****************************************************************

//****************************************************************
//*******************         BT ZOOM OUT     ********************
//****************************************************************

app.directive("zoomOut", function ($rootScope) {
  var state = false,
    toolName = "zoomOut",
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/zoomOut.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipZoomOut = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        scope.mc.mapFactory.zoomOut();
      });
      $rootScope.$on("zoomButtons", function (event, data) {
        if (!data.zoomOut) {
          attrs.$set("disabled", "disabled");
        } else {
          elem.attr("disabled", false);
        }
      });
    },
  };
});
//****************************************************************
//*******************      END BT ZOOM OUT     *******************
//****************************************************************

//****************************************************************
//*******************    BT TRACK POSITION     *******************
//****************************************************************

app.directive("trackPosition", function ($rootScope) {
  var state = false,
    toolName = "track",
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/track.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipTrack = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
        scope.mc.mapFactory.trackPosition("local");
      });
    },
  };
});

//****************************************************************
//*******************   END BT TRACK POSITION  *******************
//****************************************************************

//****************************************************************
//*******************          BT SEARCH       *******************
//****************************************************************

app.directive("buttonSearch", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btSearch.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipSearch = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//*******************       END BT SEARCH      *******************
//****************************************************************

//****************************************************************
//*******************          BT SEARCH       *******************
//****************************************************************

app.directive("buttonFilter", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btFilters.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipFilters = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//*******************       END BT SEARCH      *******************
//****************************************************************

//****************************************************************
//*******************          BT PRINT       *******************
//****************************************************************

app.directive("buttonPrint", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btPrint.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipPrint = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//*******************       END BT PRINT      *******************
//****************************************************************

//****************************************************************
//*******************       BT ZOOM EXTENT     *******************
//****************************************************************

app.directive("zoomExtent", function ($rootScope) {
  var state = false,
    toolName = "extent",
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/extend.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipExtent = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        scope.mc.mapFactory.zoomToExtend();
      });
    },
  };
});

//****************************************************************
//*******************      END BT ZOOM EXTENT   ******************
//****************************************************************

//****************************************************************
//*******************        BT NEW MINCUT     *******************
//****************************************************************

app.directive("newMincut", function ($rootScope) {
  var state = false,
    toolName = "newMincut",
    elem = null;

  function setState(scope, _st) {
    if (_st) {
      state = true;
      scope.selectedClass = "tool-selected";
    } else {
      state = false;
      scope.selectedClass = "";
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/newMincut.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipMincut = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();

      elem.bind("click", function () {
        $rootScope.newMincut();
        $rootScope.closeTools();
        scope.$apply(function () {});
      });
    },
  };
});

//****************************************************************
//*******************    END BT NEW MINCUT   *********************
//****************************************************************

//****************************************************************
//******************      BT MANAGE MINCUT     *******************
//****************************************************************

app.directive("manageMincut", function ($rootScope) {
  var state = false,
    toolName = "manageMincut",
    elem = null;

  function setState(scope, _st) {
    if (_st) {
      state = true;
      scope.selectedClass = "tool-selected";
    } else {
      state = false;
      scope.selectedClass = "";
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/manageMincut.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipManageMincut = "Manage mincut";
      elem = _elem;
      elem.find("img").embedSVG();

      elem.bind("click", function () {
        $rootScope.closeTools();
        $rootScope.manageMincut();
        scope.$apply(function () {});
      });
    },
  };
});

//****************************************************************
//****************    END BT MANAGE MINCUT   *********************
//****************************************************************

//****************************************************************
//*****************     BT DATE SELECTOR       *******************
//****************************************************************

app.directive("buttonDateSelector", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btDateSelector.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipDate = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//***********       END BT DATE SELECTOR         *****************
//****************************************************************

//****************************************************************
//*****************           BT Table         *******************
//****************************************************************

app.directive("buttonTable", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btTable.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipTable = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//***********              END BT TABLE          *****************
//****************************************************************

//****************************************************************
//*****************           BT Visits         ******************
//****************************************************************

app.directive("buttonVisits", function ($rootScope) {
  var toolName = "visit",
    elem = null;
  function setState(scope, state) {
    if (state) {
      scope.selectedClassVisits = "tool-selected";
    } else {
      scope.selectedClassVisits = "";
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btVisits.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipVisits = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
        scope.$apply(function () {});
      });
      $rootScope.$on("visitButton", function (event, data) {
        if ($rootScope.visit_version == 2) {
          setState(scope, data.active);
        }
      });
    },
  };
});

app.directive("buttonVisitManager", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btVisitManager.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipVisitmanager = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

app.directive("buttonIncidence", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btIncidence.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipInci = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});
//****************************************************************
//***********              END BT VISITS         *****************
//****************************************************************

//****************************************************************
//***********                BT GO2EPA           *****************
//****************************************************************

app.directive("buttonGo2epa", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/go2epa.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipgo2epa = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//***********             END BT GO2EPA          *****************
//****************************************************************

//****************************************************************
//***********             BT AccessControl       *****************
//****************************************************************

app.directive("buttonAccessControl", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/buttonAccessControl.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipAccessControl = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//***********            END BT AccessControl    *****************
//****************************************************************

//****************************************************************
//***********               BT MutliUpdate       *****************
//****************************************************************

app.directive("buttonMultiUpdate", function ($rootScope) {
  var state = false,
    elem = null;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/btMultiUpdate.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipMultiUpdate = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.closeTools();
      });
    },
  };
});

//****************************************************************
//***********            END BT MutliUpdate      *****************
//****************************************************************

//****************************************************************
//*******************     FORM COMPONENTS    *********************
//****************************************************************
app.directive("formHidden", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formHidden.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.dataType = directiveData.dataType;
      scope.fieldName = directiveData.name;
      scope.value = directiveData.value;
      $rootScope.feature[scope.fieldName] = scope.value;
      $rootScope.$on("updateValue", function (event, data) {
        if (scope.fieldName === data.fieldName) {
          scope.value = data.value;
          $rootScope.feature[name] = scope.value;
        }
      });
    },
  };
});

app.directive("formText", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formText.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.dataType = directiveData.dataType;
      scope.placeholder = directiveData.placeholder;
      scope.label = directiveData.label;
      scope.fieldName = directiveData.name;
      scope.changeAction = directiveData.changeAction;
      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }
      scope.errorClass = "";
      scope.erroMsg = $rootScope.getLocatedString("FORM_ERROR_INVALID_TYPE");
      scope.displayError = false;
      scope.value = directiveData.value;
      $rootScope.feature[scope.fieldName] = scope.value;
      scope.updateFieldValue = function (name) {
        if ($rootScope.validateInput(scope.value.toString(), scope.dataType)) {
          scope.errorClass = "";
          scope.displayError = false;
        } else {
          scope.errorClass = "formError";
          scope.displayError = true;
        }
        $rootScope.feature[name] = scope.value;
      };
      scope.updateAction = function () {
        $rootScope.executeUpdate(
          scope.changeAction,
          scope.fieldName,
          scope.value
        );
      };

      $rootScope.$on("updateValue", function (event, data) {
        if (scope.fieldName === data.fieldName) {
          scope.value = data.value;
          $rootScope.feature[name] = scope.value;
        }
      });
    },
  };
});

app.directive("formCombo", function ($rootScope) {
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formCombo.htm",
    link: function (scope, _elem, attrs) {
      var directiveData = JSON.parse(attrs.data);
      scope.dataType = directiveData.dataType;
      scope.label = directiveData.label;
      scope.fieldName = directiveData.name;
      scope.comboItems = directiveData.comboValues;

      if (directiveData.selectedId == "" && scope.comboItems.length > 0) {
        scope.value = scope.comboItems[0].id;
      } else {
        //check if index really exist on combo ids, if not assign first element
        if (getIndex(directiveData.selectedId) > -1) {
          scope.value = directiveData.selectedId;
        } else {
          if (typeof scope.comboItems[0] != "undefined") {
            scope.value = scope.comboItems[0].id;
          } else {
            scope.value = null;
          }
        }
      }
      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }
      if (typeof attrs.style != "undefined") {
        scope.style = attrs.style;
      } else {
        scope.style = "form-component--key-value";
      }

      if (typeof directiveData.comboGeometry != "undefined") {
        scope.geometry = directiveData.comboGeometry;
      } else {
        scope.geometry = null;
      }
      scope.changeAction = directiveData.changeAction;

      $rootScope.feature[scope.fieldName] = scope.value;
      scope.updateFieldValue = function (name) {
        $rootScope.cleanInputs(scope.value, scope.dataType);
        $rootScope.feature[name] = scope.value;
      };

      function getIndex(element) {
        for (var i = 0; i < scope.comboItems.length; i++) {
          if (scope.comboItems[i].id === element) {
            return i;
            break;
          }
        }
      }
      scope.updateAction = function () {
        $rootScope.feature[scope.fieldName] = scope.value;

        if (
          typeof directiveData.widgetAction != "undefined" &&
          directiveData.widgetAction != null
        ) {
          $rootScope.widgetAction(
            directiveData.widgetAction,
            scope.fieldName,
            scope.value
          );
        } else {
          //find geometry string on geometry array
          var geomString = null;
          if (scope.geometry) {
            geomString = scope.geometry[getIndex(scope.value)];
          }
          $rootScope.executeUpdate(
            scope.changeAction,
            scope.fieldName,
            scope.value,
            geomString
          );
        }
      };
    },
  };
});

app.directive("formArea", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formTextArea.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.changeAction = directiveData.changeAction;
      scope.dataType = directiveData.dataType;
      scope.label = directiveData.label;
      scope.fieldName = directiveData.name;
      scope.value = directiveData.value;
      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }
      $rootScope.feature[scope.fieldName] = scope.value;
      scope.updateFieldValue = function (name) {
        $rootScope.feature[name] = scope.value;
      };
      scope.updateAction = function () {
        if (scope.value != null) {
          $rootScope.executeUpdate(
            scope.changeAction,
            scope.fieldName,
            scope.value
          );
        }
      };
    },
  };
});

app.directive("formCheck", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formCheck.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.dataType = directiveData.feature;
      scope.label = directiveData.label;
      scope.dataType = directiveData.dataType;
      scope.fieldName = directiveData.name;
      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }
      if (
        directiveData.value == "t" ||
        directiveData.value == "true" ||
        directiveData.value == "True" ||
        directiveData.value == true
      ) {
        scope.value = true;
        $rootScope.feature[directiveData.name] = scope.value;
      } else {
        $rootScope.feature[directiveData.name] = "false";
      }
      scope.clickCheck = function (name) {
        if (!scope.value) {
          $rootScope.feature[name] = "false"; //as boolean data arrives as null to php
        } else {
          $rootScope.feature[name] = scope.value;
        }
        if (typeof directiveData.changeAction != "undefined") {
          $rootScope.executeUpdate(
            directiveData.changeAction,
            scope.fieldName,
            $rootScope.feature[name]
          );
        }
      };
    },
  };
});

app.directive("formTypeahead", function ($rootScope) {
  var directiveData;
  var comboItems;

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formTypeAhead.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.dataType = directiveData.dataType;
      scope.label = directiveData.label;
      scope.changeAction = directiveData.changeAction;
      scope.getDataAction = directiveData.getDataAction;
      scope.comboIds = directiveData.comboIds; //for dataset search
      scope.selectDataAction = directiveData.selectAction;
      scope.tabName = directiveData.tabName;
      scope.dataset = directiveData.dataset;
      //for dataset typeahead set value
      if (scope.getDataAction === "dataset") {
        if (
          typeof directiveData.value != "undefined" &&
          typeof directiveData.comboIds != "undefined" &&
          typeof directiveData.dataset != "undefined"
        ) {
          scope.value =
            scope.dataset[scope.comboIds.indexOf(directiveData.value)];
        }
      }
      //strings
      scope.noresultsMsg = directiveData.noresultsMsg;
      scope.loadingMsg = directiveData.loadingMsg;
      scope.placeholder = directiveData.placeholder;
      scope.fieldName = directiveData.name;
      //external search services
      scope.searchService = directiveData.searchService;
      //threshold when suggested search fires
      scope.threshold = 3;
      if (typeof directiveData.threshold != "undefined") {
        scope.threshold = parseInt(directiveData.threshold);
      }

      //disabled
      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }
      $rootScope.$on("formField_disabled", function (event, data) {
        if (data.name === scope.fieldName) {
          scope.disabled = data.disabled;
          if (typeof data.value != "undefined") {
            scope.value = data.value;
          }
        }
      });
      //end disabled

      //set scope value
      setRootScopeValue(scope);

      scope.getData = function (val) {
        if (val.length >= scope.threshold) {
          $rootScope.feature[scope.fieldName] = val;
          return $rootScope.getTypeAheadDataAction(
            scope.tabName,
            scope.fieldName,
            scope.getDataAction,
            val,
            scope.searchService,
            scope.dataset
          );
        }
      };

      scope.selectAction = function ($item, $model, $label, $event) {
        setRootScopeValue(scope);
        $rootScope.selectTypeAheadAction(
          scope.selectDataAction,
          $item,
          $model,
          $label,
          $event
        );
        if (typeof scope.changeAction != "undefined")
          $rootScope.executeUpdate(
            scope.changeAction,
            scope.fieldName,
            parseInt(scope.comboIds[scope.dataset.indexOf(scope.value)])
          );
      };
      function setRootScopeValue(scope) {
        if (scope.getDataAction === "dataset") {
          //get ID from comboIds value
          $rootScope.feature[scope.fieldName] = parseInt(
            scope.comboIds[scope.dataset.indexOf(scope.value)]
          );
        } else {
          $rootScope.feature[scope.fieldName] = scope.value;
        }
      }
    },
  };
});

app.directive("formButton", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.label = directiveData.label;
      scope.fieldName = directiveData.name;

      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }
      //TBR
      if (typeof directiveData.buttonAction != "undefined") {
        scope.action = directiveData.buttonAction;
      }
      //TBR
      if (typeof directiveData.widgetAction != "undefined") {
        scope.action = directiveData.widgetAction;
      }
      //TBR
      if (typeof directiveData.clickAction != "undefined") {
        scope.action = directiveData.clickAction;
      }

      scope.buttonAction = function (name) {
        if (typeof scope.action != "undefined") {
          $rootScope.buttonAction(scope.action, scope.fieldName);
        }
      };

      scope.template = function () {
        if (directiveData.position === "footer") {
          return getBaseUrl() + "js/directives/formButtonFloat.htm";
        } else {
          return getBaseUrl() + "js/directives/formButton.htm";
        }
      };
    },
    template: '<ng-include src="template()"></ng-include>',
  };
});

app.directive("formDatepicker", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formDatepicker.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.dataType = directiveData.feature;
      scope.changeAction = directiveData.changeAction;
      scope.label = directiveData.label;
      scope.dataType = directiveData.dataType;
      scope.fieldName = directiveData.name;
      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }

      scope.format = "dd-MM-yyyy";
      scope.altInputFormats = ["M!/d!/yyyy"];
      scope.formats = ["dd-MM-yyyy"];
      var init_date = new Date();
      if (directiveData.value != "") {
        var splitDate = directiveData.value.split("-");
        init_date = new Date(
          splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0]
        );
      }

      scope.value = init_date;
      $rootScope.feature[directiveData.name] = scope.value;
      scope.dp_filter_options = {
        opened: false,
        showWeeks: false,
      };
      scope.set_date = function () {
        $rootScope.feature[scope.fieldName] = scope.value;
      };
      scope.dp_open = function () {
        if (scope.dp_filter_options.opened) {
          scope.dp_filter_options.opened = false;
        } else {
          scope.dp_filter_options.opened = true;
        }
      };
      scope.updateAction = function () {
        if (scope.value != null) {
          $rootScope.feature[scope.fieldName] = scope.value;
          $rootScope.executeUpdate(
            scope.changeAction,
            scope.fieldName,
            scope.value
          );
        }
      };
    },
  };
});

app.directive("formDatepickertime", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formDatepickertime.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);

      scope.changeAction = directiveData.changeAction;
      scope.label = directiveData.label;
      scope.dataType = directiveData.dataType;
      scope.fieldName = directiveData.name;
      if (directiveData.value) {
        scope.value = directiveData.value;
      } else {
        scope.value = null;
      }

      setTimeout(function () {
        $("#" + scope.fieldName).datetimepicker({
          format: "Y-m-d H:i:s",
          dayOfWeekStart: 1,
        });
      }, 100);

      if (typeof directiveData.disabled != "undefined") {
        scope.disabled = directiveData.disabled;
      } else {
        scope.disabled = false;
      }

      $rootScope.feature[scope.fieldName] = scope.value;

      scope.updateAction = function () {
        if (scope.value != null) {
          $rootScope.feature[scope.fieldName] = scope.value;
          $rootScope.executeUpdate(
            scope.changeAction,
            scope.fieldName,
            scope.value
          );
        }
      };
      $rootScope.$on("destroyDirectives", function (event, data) {
        scope.$destroy();
        _elem.remove();
      });
    },
  };
});

app.directive("formDivider", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formDivider.htm",
    link: function (scope, _elem, attrs) {},
  };
});

app.directive("formLabel", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formLabel.htm",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.style = directiveData.style;
      scope.text = directiveData.text;
    },
  };
});

app.directive("formList", function ($rootScope) {
  return {
    restrict: "E",
    replace: "true",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.changeAction = directiveData.changeAction;
      scope.label = directiveData.label;
      scope.values = directiveData.value;
      scope.fieldName = directiveData.name;
      scope.selectedId = null;
      scope.selectAction = function (item) {
        for (var i = 0; i < scope.values.length; i++) {
          $("#li_element_" + i).removeClass("active");
          scope.values[i].selected = false;
          if (scope.values[i].sys_id === item.sys_id) {
            $("#li_element_" + i).addClass("active");
            scope.values[i].selected = true;
          }
        }
        if (typeof item.sys_id != "undefined") {
          $rootScope.setGlobal_sys_id(item.sys_id);
        } else {
          $rootScope.$broadcast("logEvent", {
            evt: "NO sys_id",
            extradata: item,
            file: "toolsDirectives.js formList",
            level: "warn",
          });
        }
        //$rootScope.feature[directiveData.name] = scope.values;
      };

      scope.clickAction = function (item) {
        $rootScope.executeUpdate(scope.changeAction, scope.fieldName, item);
      };

      $rootScope.$on("executeUpdate", function (event, data) {
        try {
          for (var i = 0; i < scope.values.length; i++) {
            $("#li_element_" + i).removeClass("active");
            scope.values[i].selected = false;
            //$rootScope.feature[directiveData.name] = null;
            //delete $rootScope.feature[directiveData.name];
          }
        } catch (e) {
          console.warn(e);
        }
      });

      scope.openDoc = function (url, hash, fextension) {
        $rootScope.openDoc(url, hash, fextension);
      };
      scope.template = function () {
        if (directiveData.type === "iconList") {
          return getBaseUrl() + "js/directives/formIconList.htm";
        } else {
          return getBaseUrl() + "js/directives/formList.htm";
        }
      };
    },
    template: '<ng-include src="template()"></ng-include>',
  };
});

app.directive("formThumb", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formThumb.htm",
    link: function (scope, _elem, attrs) {
      if (typeof attrs.data != "undefined") {
        $rootScope.loadThumb(attrs.data).then((msg) => {
          scope.imageVal = msg;
          applyChangesToScope();
        });
      }
    },
  };
});
app.directive("formThumbDoc", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/formThumbDoc.htm",
    link: function (scope, _elem, attrs) {
      if (typeof attrs.data != "undefined") {
        $rootScope.getInfoFile(attrs.data).then((msg) => {
          let length = 20;
          var fileName = msg.fileName;
          if (typeof fileName == "undefined") {
            scope.fileName = "";
          } else {
            if (fileName == null) {
              scope.fileName = "";
            }
            if (fileName.length <= length) {
              scope.fileName = fileName;
            } else {
              scope.fileName = fileName.substring(0, length) + "...";
            }
          }
          applyChangesToScope();
        });
      }
    },
  };
});

app.directive("formImage", function ($rootScope) {
  var directiveData;
  return {
    restrict: "E",
    replace: "true",
    link: function (scope, _elem, attrs) {
      directiveData = JSON.parse(attrs.data);
      scope.changeAction = directiveData.changeAction;
      scope.label = directiveData.label;
      if (typeof directiveData.imageVal != "undefined") {
        scope.imageVal = directiveData.imageVal.image;
      }
      scope.fieldName = directiveData.name;

      scope.template = function () {
        return getBaseUrl() + "js/directives/formImage.htm";
      };
    },
    template: '<ng-include src="template()"></ng-include>',
  };
});
//****************************************************************
//****************************************************************

//****************************************************************
//*******************       BT DOWNSTREAM      *******************
//****************************************************************

app.directive("profile", function ($rootScope) {
  var state = false,
    toolName = "profile",
    elem = null;
  function setState(_st) {
    if (_st) {
      state = false;
      elem.removeClass("tool-selected");
    } else {
      state = true;
      elem.addClass("tool-selected");
    }
  }

  return {
    restrict: "E",
    replace: "true",
    templateUrl: getBaseUrl() + "js/directives/profile.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipProfile = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        $rootScope.flowTraceEnabled = !$rootScope.flowTraceEnabled;
        $rootScope.$broadcast("flowTraceEnabled", {
          tool: "profile",
          enabled: $rootScope.flowTraceEnabled,
        });

        $rootScope.closeTools();
        if ($rootScope.flowTraceEnabled) {
          setState(false);
        } else {
          $rootScope.$broadcast("flowTraceDisabled", {});
        }

        scope.$apply(function () {});
      });
      $rootScope.$on("flowTraceDisabled", function (event, data) {
        setState(true);
        elem.attr("disabled", false);
      });
      $rootScope.$on("flowTraceEnabled", function (event, data) {
        if (data.tool !== "profile") {
          elem.attr("disabled", true);
        } else {
          elem.attr("disabled", false);
        }
      });
    },
  };
});
//****************************************************************
//*******************     END BT PROFILE    *******************
//****************************************************************
