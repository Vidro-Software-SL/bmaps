/*jshint esversion: 6 */
angular.module('app').expandControllerTable = function($scope,$rootScope,blockUI,data){
  var fileName = 'controller.table.js 1.0.0',
  log = data.sharedMethods.log,
  mc = data.mc,
  mapToc = data.sharedModules.mapToc,
  mapFactory = data.sharedModules.mapFactory,
  getInfoForm = data.sharedMethods.getInfoForm,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  displayed = false;
  notifications_strings = data.strings;
  log(fileName,"expandControllerTable","info",data);
  var wsData = {};
  wsData.token = data.token;
  wsData.baseHref = data.baseHref;
  wsData.env = data.env;
  wsData.user_id = document.getElementById('user_id').value;
  wsData.project_id = data.project_id;
  wsData.limit = parseInt(document.getElementById('limit').value);
  wsData.serverInstance  = document.getElementById('serverInstance').value;
  mc.currentTablePage = 1;
  mc.tableNumberOfPages = 0;
  mc.tableFilterKey = null;
  mc.tableFilterValue = null;
  mc.filterFields = null;
  mc.tableFields = null;
  mc.orderKey = null;
  mc.orderSort = 'ASC';

  try{
    var _table = new Table(wsData);
  }catch(e){
    console.error(e);
  }

  $scope.getAttributesTable = function(){
    if(!displayed){
      var tableName = mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive());
      log(fileName,'getAttributesTable()',"info", tableName );
      getTable(tableName);
    }else{
      $scope.closeTable();
    }
  };

  function getTable(table){
    log(fileName,'getTable()','info',table);
    let filters = {};
    if(mc.tableFilterValue && (mc.tableFilterKey != notifications_strings.SELECT)){
      filters.field = mc.tableFilterKey;
      filters.value = mc.tableFilterValue;
    }
    let order = null;
    if(mc.orderKey!=null){
      order = {'key':mc.orderKey, 'sort': mc.orderSort};
    }
    _table.getTable(table,wsData.project_id,mc.currentTablePage,filters,order).then((msg)=>{
      log(fileName,'getTable()','info',msg);
      mc.attributesTable = 1;
      mc.tableIdName = msg.fields[0];
      if(mc.tableFilterKey===null){
        mc.tableFilterKey = notifications_strings.SELECT;
      }

      mc.filterFields = msg.fields;
      mc.filterFields.unshift(notifications_strings.SELECT);
      mc.tableFields = msg.fields;
      mc.tableData = msg.data;
      mc.tableNumberOfPages = msg.numberOfPages;
      displayed = true;
      applyChangesToScope();
    }).catch((e)=>{
      console.error(e);
      displayed = false;
    });
  }

  $scope.setTablePage = (pageNum)=>{
    log(fileName,'setTablePage()','info',pageNum);
    mc.currentTablePage = pageNum;
    mc.tableData = [];
    getTable(mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive()));
  };

  $scope.renderHeader = (key)=>{
    if(key===notifications_strings.SELECT){
      return false;
    }
    return true;
  };

  $scope.sort = (key)=>{
    if(key!=mc.orderKey){
      mc.orderKey = key;
      mc.orderSort = 'ASC';
    }else{
      if(mc.orderSort == 'ASC'){
        mc.orderSort = 'DESC';
      }else{
        mc.orderSort = 'ASC';
      }
    }

    log(fileName,'sort('+key+')','info',{'key': mc.orderKey, 'sort': mc.orderSort});
    if(mc.tableFilterKey === notifications_strings.SELECT){
      mc.tableFilterValue = null;
    }
		getTable(mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive()));
	};

  $scope.filter = ()=>{
    log(fileName,'filter()','info',{'key': mc.tableFilterKey, 'value': mc.tableFilterValue});
    if(mc.tableFilterKey === notifications_strings.SELECT){
      mc.tableFilterValue = null;
    }
		getTable(mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive()));
	};

  $scope.getInfoFromTable = (item)=>{
    log(fileName,'getInfoFromTable()','info',item);
    blockUI.start(notifications_strings.NOTIFICATION_SEARCHING);
    let layer = mapToc.getMarkedLayerAsActive();
    let db_table = mapToc.getTableNameByLayerName(layer);
    getInfoForm(layer,db_table,mc.tableIdName,getId(item,mc.tableIdName),false,null);
  };

  $rootScope.$on('formRendered',  (event, data)=>{
    if(displayed){
      var mapData = mapFactory.getMapData();
      var feauture = mapFactory.getHiglightedFeature();
      var newCenter = [  feauture.getGeometry().getExtent()[0],   feauture.getGeometry().getExtent()[1] - 150*mapData.viewResolution];
      mapFactory.setZoomLevelAndCenter(9,newCenter);
    }
  });

  $scope.getId = (item,id_name)=>{
    return getId(item,id_name);
  };

  function getId(item,id_name){
		return item[id_name];
	}

  $scope.closeTable = ()=>{
    mc.attributesTable = 0;
    mc.currentTablePage = 1;
    mc.tableNumberOfPages = 0;
    mc.tableFilterKey = null;
    mc.tableFilterValue = null;
    mc.filterFields = null;
    mc.tableData = null;
    displayed = false;
    mc.orderKey = null;
    mc.orderSort = 'ASC';
    applyChangesToScope();
  };

  //****************************************************************
  //************                 EXPORT            *****************
  //****************************************************************

  $scope.exportData = (format)=>{
      log(fileName,'exportData()','info',{'format': format});
    let filters = {};
    if(mc.tableFilterValue && (mc.tableFilterKey != notifications_strings.SELECT)){
      filters.field = mc.tableFilterKey;
      filters.value = mc.tableFilterValue;
    }
    let order = null;
    if(mc.orderKey!=null){
      order = {'key':mc.orderKey, 'sort': mc.orderSort};
    }
    blockUI.start(notifications_strings.ONPROCESS);
    //override default limit, for a "full export", we set limit to 1000 registers
    _table.setLimit(1000);
    _table.getTable(mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive()),wsData.project_id,0,filters,order).then((msg)=>{
      log(fileName,'exportData()','info',msg);
      _table.setLimit(wsData.limit);
      _table.exportCSVFile(msg.fields, msg.data, mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive())).then(()=>{
        blockUI.reset();
        applyChangesToScope();
      });
    }).catch((e)=>{
      console.error(e);
      displayed = false;
      _table.setLimit(wsData.limit);
    });
  };
  //****************************************************************
  //************                EXPORT             *****************
  //****************************************************************

  //****************************************************************
  //************                HELPERS            *****************
  //****************************************************************

  $scope.notSorted = function(obj){
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  };

  //****************************************************************
  //************              END  HELPERS         *****************
  //****************************************************************
};
