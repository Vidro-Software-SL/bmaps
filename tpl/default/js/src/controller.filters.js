/*jshint esversion: 6 */
angular.module('app').expandControllerFilters = function($scope,$rootScope,blockUI,data){
  var fileName = 'controller.filters.js 1.0.0',
  log = data.sharedMethods.log,
  baseHref = data.baseHref,
  notifications_strings = data.strings,
  formsSewernet = data.sharedModules.formsSewernet,
  mapFactory = data.sharedModules.mapFactory,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  notifyEvent = data.sharedMethods.notifyEvent,
  displayMapError = data.sharedMethods.displayMapError,
  _selectActiveTab= data.sharedMethods._selectActiveTab,
  hidePreviousForms = data.sharedMethods.hidePreviousForms;
  mc = data.mc;
  log(fileName,"expandControllerFilers","info",data);
  /*formsSewernet.on('notifyToMap',function(data,extraData){
    if(data==="Filters ready"){
      log("Filters ready","info",extraData);
      if(mc.use_area_of_interest){
        log("Filters ready should apply zoom to extent","info");
        formsSewernet.getExtent({}).then((msg)=>{
          log(fileName,"getExtent","success",msg.message.geometry);
          mapFactory.setExtent(msg.message.geometry);
        }).catch((e)=>{
          log(fileName,"getExtent","error",e);
        });
      }
    }
  });*/
  //****************************************************************
  //*****************          FILTERS         *********************
  //****************************************************************
  $scope.getFormFilters = function(){
    if(mapFactory.getOnlineStatus()){
      log(fileName,"getFormFilters()","info");
      hidePreviousForms();
      mc.clickedButton        = "filter";
      mc.formName              = notifications_strings.FILTERS;
      formsSewernet.getFormFilters(mc.use_tiled_background,   function(err,msg){
        if(err){
          log(fileName,"getFormFilters callback","error",msg,err);
          notifyEvent(msg,"error",true);
        }else{
          log(fileName,"getFormFilters callback","success",msg);
          if(msg==="Filters not implemented"){
            mc.btFilters     = false; //hide filters button
          }else{
            mc.btFilters     = true; //show filters button

            let finalTabs = removeNonVisibleTabs(msg);
            finalTabs.activeTab = msg.activeTab;


            mc.filterTabs   = finalTabs;
            mc.activeTab    = finalTabs.activeTab;
            mapFactory.cleanGeometries('all');
            mc.formFilters  = true;

            mapFactory.setFilters(formsSewernet.getFilters());
            mapFactory.reloadDisplayedLayers();
          }
          applyChangesToScope();
          _selectActiveTab(msg.activeTab.activeTabIndex,'dynamicForm');
        }
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  };

  function removeNonVisibleTabs(data){
    let retorno = {};
    return filterVisible(data)
    function filterVisible(tabs){
      return tabs.filter(tab=>Number(tab.visible)!==0);
    }
  }

  $scope.updateFilters = function(field,value){
    updateFilters(field,value);
  };

  function updateFilters(field,value){
    log(fileName,"updateFilters("+field+","+value+")","info",typeof mc.activeTab);
    var activeTabName = mc.activeTab;
    if(typeof mc.activeTab=="object"){
       activeTabName = mc.activeTab.tabName;
    }
    if(field==='select_all'){
      blockUI.start(notifications_strings.ONPROCESS);
      formsSewernet.updateAllFilters(mc.filterTabs,mc.activeTab,value,activeTabName).then(function(msg){
        log(fileName,"updateAllFilters callback","success",msg);
        hidePreviousForms();
        blockUI.reset();
        mc.clickedButton        = "filter";
        mc.formName              = notifications_strings.FILTERS;
        mc.btFilters     = true; //show filters button
        mc.filterTabs   = msg;
        mc.activeTab    = msg.activeTab;
        mapFactory.cleanGeometries('all');
        mc.formFilters  = true;
        mapFactory.setFilters(formsSewernet.getFilters());
        mapFactory.reloadDisplayedLayers();
        notifyEvent(notifications_strings.FILTERS_UPDATED,"success",true);
        applyChangesToScope();
        _selectActiveTab(msg.activeTab.activeTabIndex,'dynamicForm');
      }).catch(function(e){
        log(fileName,"updateAllFilters callback","error",e);
      });
    }else{
      formsSewernet.updateFilters(field,value,activeTabName,function(err,msg){
        if(err){
          log(fileName,"updateFilters callback","error",msg,err);
          notifyEvent(msg,"error",true);
        }else{
          log(fileName,"updateFilters callback","success",msg);

          notifyEvent(notifications_strings.FILTERS_UPDATED,"success",true);
          mapFactory.setFilters(formsSewernet.getFilters());
          mapFactory.reloadDisplayedLayers();
          applyChangesToScope();
        }
      });
    }
  }



  //****************************************************************
  //*****************         END FILTERS      *********************
  //****************************************************************
};
