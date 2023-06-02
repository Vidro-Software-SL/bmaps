/*jshint esversion: 6 */
angular.module('app').expandControllerMultiUpdate = function($scope,$rootScope,blockUI,data){
  var fileName = 'controller.multiupdate.js 1.0.0',
  log = data.sharedMethods.log,
  baseHref = data.baseHref,
  notifications_strings = data.strings,
  formsSewernet = data.sharedModules.formsSewernet,
  mapFactory = data.sharedModules.mapFactory,
  mapToc = data.sharedModules.mapToc,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  notifyEvent = data.sharedMethods.notifyEvent,
  displayMapError = data.sharedMethods.displayMapError,
  hidePreviousForms = data.sharedMethods.hidePreviousForms,
  mc = data.mc;

  log(fileName,"expandControllerMultiUpdate","info",data);
  $scope.multiUpdate = function(){
    let multipleData = mapFactory.getMultipleData();
    if(multipleData.id.length>0){
      formsSewernet.getmultiupdate(multipleData.id,multipleData.table[0]).then((msg)=>{
        log(fileName,"multiUpdate() callback","success",msg);

        hidePreviousForms();
        $rootScope.feature = [];
        mc.filterTabs = msg;
        mc.activeTab = msg.activeTab;
        mc.formFilters = true;
        mapFactory.setMultipleSelect(false);
        //clean polygon
        $scope.setPolygonSelect(false);
        //disable polygon tool
        mapFactory.setTool(null);
        applyChangesToScope();
    }).catch((e)=>{
        log(fileName,"multiUpdate()","error",e);
        notifyEvent(e,"error",true);
        //clean polygon
        $scope.setPolygonSelect(false);
        //disable polygon tool
        mapFactory.setTool(null);
        applyChangesToScope();
      });
    }else{
      notifyEvent("no elements selected","error",true);
    }
  };

  $rootScope.setmultiupdate = ()=>{
    log(fileName,"setmultiupdate()","info");
    let multipleData = mapFactory.getMultipleData();
    formsSewernet.setmultiupdate(multipleData.id,multipleData.table[0],multipleData.id_name[0],$rootScope.feature).then((msg)=>{
      log(fileName,"setmultiupdate()","success",msg);
      if(typeof msg.message!="undefined"){
        if(typeof msg.message.message!="undefined") notifyEvent(msg.message.message,"success",true);
      }
      $rootScope.multiUpdateDisabled = true;
      mapFactory.resetMultipleSelect();
      hidePreviousForms();
      $rootScope.multipleSelectDisabled = false;
      applyChangesToScope();
    }).catch((e)=>{
      log(fileName,"setmultiupdate()","error",e);
      notifyEvent(e.message,"error",true);
      $rootScope.multiUpdateDisabled = true;
      mapFactory.resetMultipleSelect();
      hidePreviousForms();
      $rootScope.multipleSelectDisabled = false;
      applyChangesToScope();
    });
  };


};
