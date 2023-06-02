$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
app.directive("selectMore", function ($rootScope) {
  var state = false,
    toolName = "selectMore",
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

  //reset button
  $rootScope.$on("reset-tools", function (event, data) {
    if (data.tool != toolName) {
      setState(true);
    } else {
      setState(false);
    }
  });

  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/selectMore.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipselectMore = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName);
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
      });
    },
  };
});

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
  //reset button
  $rootScope.$on("reset-tools", function (event, data) {
    if (data.tool != toolName) {
      setState(true);
    } else {
      setState(false);
    }
  });
  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/selectArea.htm",
    link: function (scope, _elem, attrs) {
      scope.selectArea = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName);
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

app.directive("addPoint", function ($rootScope) {
  var state = false,
    toolName = "point",
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

  //reset button
  $rootScope.$on("reset-tools", function (event, data) {
    if (data.tool != toolName) {
      setState(true);
    } else {
      if (!$rootScope.addPointDisabled) {
        setState(false);
      }
    }
  });

  $rootScope.$on("define_geometryTypeInTools", function (event, data) {
    toolName = data.toolName;
  });
  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/addPoint.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipaddPoint = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName);
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
      });
    },
  };
});

app.directive("addPolygon", function ($rootScope) {
  var state = false,
    toolName = "Polygon",
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

  //reset button
  $rootScope.$on("reset-tools", function (event, data) {
    if (data.tool != toolName) {
      setState(true);
    } else {
      if (!$rootScope.addPopolygonDisabled) {
        setState(false);
      }
    }
  });
  $rootScope.$on("define_geometryTypeInTools", function (event, data) {
    toolName = data.toolName;
  });
  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/addPolygon.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipaddPolygon = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName);
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
      });
    },
  };
});

app.directive("addLine", function ($rootScope) {
  var state = false,
    toolName = "LineString",
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

  //reset button
  $rootScope.$on("reset-tools", function (event, data) {
    if (data.tool != toolName) {
      setState(true);
    } else {
      if (!$rootScope.addLineDisabled) {
        setState(false);
      }
    }
  });
  //reset button
  $rootScope.$on("define_geometryTypeInTools", function (event, data) {
    toolName = data.toolName;
  });

  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/addLine.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipaddLine = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        setState(state);

        if (state) {
          scope.mc.mapFactory.setTool(toolName);
        } else {
          scope.mc.mapFactory.setTool(null);
        }

        scope.$apply(function () {});
      });
    },
  };
});

app.directive("measureLine", function ($rootScope) {
  var state = false,
    toolName = "measureLine",
    elem = null;
  //_template 	= '<button class="btn btn-default-custom tool-regla" ng-disabled="toolsDisabled" data-toggle="tooltip" data-placement="left" data-container="body" title="{{tooltipmeasure}}"></button>'

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
    templateUrl: "../../tpl/directives_tpl/mesure.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmeasure = attrs.tooltip;

      elem = _elem;
      elem.find("img").embedSVG();
      //elem.bind('click touchstart', function() {
      elem.bind("click", function () {
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

app.directive("measureArea", function ($rootScope) {
  var state = false,
    toolName = "measureArea",
    elem = null;

  //var _template 	= '<button class="btn btn-default-custom tool-area" ng-disabled="toolsDisabled" data-toggle="tooltip" data-placement="left" data-container="body" title="{{tooltipmeasureArea}}"></button>'

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
    templateUrl: "../../tpl/directives_tpl/mesureArea.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipmeasureArea = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click touchstart", function () {
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

app.directive("cleanScreen", function ($rootScope) {
  var state = false,
    toolName = "delete",
    elem = null;

  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/delete.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipclean = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        scope.mc.mapFactory.cleanGeometries("all");

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {});
      });
    },
  };
});

app.directive("trackPosition", function ($rootScope) {
  var state = false,
    toolName = "track",
    elem = null;

  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/sewernet/directives/track.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipclean = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        scope.mc.mapFactory.trackPosition();

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {});
      });
    },
  };
});

app.directive("zoomExtent", function ($rootScope) {
  var state = false,
    toolName = "extent",
    elem = null;

  return {
    restrict: "E",
    replace: "true",
    templateUrl: "../../tpl/directives_tpl/extend.htm",
    link: function (scope, _elem, attrs) {
      scope.tooltipclean = attrs.tooltip;
      elem = _elem;
      elem.find("img").embedSVG();
      elem.bind("click", function () {
        scope.mc.mapFactory.zoomToExtend();

        scope.$apply(function () {});
        //reset button
        $rootScope.$on("reset-tools", function (event, data) {});
      });
    },
  };
});
