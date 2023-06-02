/*jshint esversion: 6 */
angular.module('app').expandControllerVisits = function($scope,$rootScope,blockUI,data){
  var fileName = 'controller.visits.js 1.0.0',
  log = data.sharedMethods.log,
  baseHref = data.baseHref,
  hidePreviousForms = data.sharedMethods.hidePreviousForms,
  doHighlightGeom = data.sharedMethods.doHighlightGeom,
  renderApiMessage = data.sharedMethods.renderApiMessage,
  notifyEvent = data.sharedMethods.notifyEvent,
  displayMapError = data.sharedMethods.displayMapError,
  _selectActiveTab = data.sharedMethods._selectActiveTab,
  mc = data.mc,
  info_type = data.info_type,
  mapToc = data.sharedModules.mapToc,
  mapFactory = data.sharedModules.mapFactory,
  getInfoForm = data.sharedMethods.getInfoForm,
  formsSewernet = data.sharedModules.formsSewernet,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  displayed = false;
  notifications_strings = data.strings;
  log(fileName,"expandControllerTable","info",data);

  //****************************************************************
  //**************              VISITS            ******************
  //**************       NEW IMPLEMENTATION       ******************
  //****************************************************************

  $scope.gwGetVisit = function(type){
    log(fileName,"gwGetVisit("+type+")","info",type);
    if($rootScope.visit_version=='1'){
      $scope.addVisit();
    }else{
      mc.formFeatureData  = null;
      $rootScope.feature  = [];
      mc.visitType = type;
      if(mc.pol_id==null && type=="visit" && !mc.AddingVisit){
        $rootScope.$broadcast('visitButton',{active:true});
        mc.AddingVisit = true;
        notifyEvent(notifications_strings.VISITS_ACTIVATED,"success",true);
      }else if(mc.pol_id==null && type=="visit" && mc.AddingVisit){
        $rootScope.$broadcast('visitButton',{active:false});
        mc.AddingVisit = false;
        mc.pol_id = null;
        mc.pol_id_name = null;
        mapFactory.cleanGeometries('all');
        notifyEvent(notifications_strings.VISITS_DEACTIVATED,"warning",true);
      }else{
        gwGetVisit({},null,false);
      }
    }
  };

  $rootScope.gwGetVisit = gwGetVisit;
  function gwGetVisit(formParameters,extraData,chapuza){
    log(fileName,"gwGetVisit()","info",{'chapuza':chapuza,'pol_id':mc.pol_id, 'mc.AddingIncidence':mc.AddingIncidence,'feature':$rootScope.feature,'extraData':extraData,'formParameters':formParameters});
    if(mc.pol_id || mc.AddingIncidence || chapuza){
      var currentTableName = mc.infoTableName;
        if(typeof extraData=="undefined") extraData = null;
        log(fileName,"gwGetVisit()","info");
        var deviceTrace = {
              "xcoord":null,
              "ycoord":  null,
              "compass": null
        };
        if(mc.point_coordinates){
          deviceTrace = {
                "xcoord":  mc.point_coordinates[0],
                "ycoord":  mc.point_coordinates[1],
                "compass": mc.heading
          };
        }

        if(currentTableName===null){
          var marked_layer = mapToc.getMarkedLayerAsActive()
          if(marked_layer){
            currentTableName = mapToc.getTableNameByLayerName(marked_layer);
          }
        }
        var dataToSend = {
          'pol_id': mc.pol_id,
          'id_name':mc.pol_id_name,
          'visitType': mc.visitType,
          'tableName':currentTableName,
          'visit_id':mc.visit_id,
          'info_type':info_type,
          'formParameters':formParameters,
          'formFeatureData':mc.formFeatureData,
          'formPagination':mc.formPagination,
          'formData':$rootScope.feature,
          'deviceTrace':deviceTrace,
          'extraData':extraData,
          'chapuza':chapuza,
          'isOffline':false,
          'online': mapFactory.getOnlineStatus()
        };
        formsSewernet.gwGetVisit(dataToSend,function(err,msg){
          if(err){
            log(fileName,"gwGetVisit","error",msg);
            let level = 'error';
            if(typeof msg.status!="undefined"){
              level = msg.status;
            }
            if(typeof msg.message!="undefined"){
              msg = msg.message;
            }
            notifyEvent(msg,level,true);
            mc.pol_id = null;
            mc.pol_id_name = null;
            mapFactory.cleanGeometries('all');
            $rootScope.$broadcast('visitButton',{active:false});
            mc.AddingVisit = false;
            applyChangesToScope();
            return false;
          }
          var AddingIncidence = mc.AddingIncidence; //hidePreviousForms resets mc.AddingIncidence!!
          hidePreviousForms();
          mc.visitType        = null;
          mc.AddingIncidence   = AddingIncidence;
          mc.clickedButton     = "visits";
          log(fileName,"gwGetVisit callback","success",msg);
          if(mc.pol_id===null){
            if(typeof msg.data.geometry!="undefined"){
              mc.pol_id = msg.feature.id;
              mc.pol_id_name = msg.feature.idName;
            }
          }

          if(typeof msg.data.geometry!="undefined"){
            log(fileName,"gwGetVisit callback geometry detected","info",msg.data.geometry);
            for(var i=0;i<msg.data.geometry.length;i++){
              if(msg.data.geometry[i].st_astext!=null){
                mapFactory.addSocketGeometry(msg.data.geometry[i].st_astext,mapFactory.epsg,mapFactory.getActiveLayerName(),'socket');
                mapFactory.zoomToHiglightedFeature(msg.data.geometry[i].st_astext);
              }
            }
          }

          $rootScope.visitFormContent = msg.formTabs[0].fields;
          _renderVisitForm(msg,formParameters);
        });

    }else{
      //if no pol_id (no info) display addPoint behavior
      if(!$rootScope.AddingVisit){
        mc.AddingIncidence = true;
        mapFactory.addPoint();
        mc.btEndGeometry = true;
      }
    }
  }
  $rootScope.prepareDataForgwSetVisit = prepareDataForgwSetVisit;
  function prepareDataForgwSetVisit(){
    log(fileName,"prepareDataForgwSetVisit()","info",{'formFeatureData':mc.formFeatureData,'point_coordinates':mc.point_coordinates});
    var deviceTrace = {
          "xcoord":    null,
          "ycoord":    null,
          "compass":   null
    };
    if(mc.point_coordinates){
      if(typeof mc.point_coordinates=="object"){
        deviceTrace = {
              "xcoord":  mc.point_coordinates[0],
              "ycoord":  mc.point_coordinates[1],
              "compass": mc.heading
        };
      }else{
        let point_coordinates_str = mc.point_coordinates.split(" ");
        deviceTrace = {
              "xcoord":  point_coordinates_str[0],
              "ycoord":  point_coordinates_str[1],
              "compass": mc.heading
        };
        point_coordinates_str = null;
      }
    }
    let photos = [];
    if(mc.pointPhotos.length>0){
      for(var i=0;i<mc.pointPhotos.length;i++){
        let link = `${baseHref}external.doc.php?img=`;
        if(mc.pointPhotos[i].fextension==='png' || mc.pointPhotos[i].fextension==='jpg' || mc.pointPhotos[i].fextension==='gif'){
          link = `${baseHref}external.image.php?img=`;
        }
        var photo = {
            'photo_url':link,
            'hash': mc.pointPhotos[i].photo_id,
            'fextension': mc.pointPhotos[i].fextension
        };
        photos.push(photo);
      }
    }
    //offline form hasn't got pol id value, we must override it
    if(!mapFactory.getOnlineStatus()){
      $rootScope.feature[mc.pol_id_name] = mc.pol_id;
    }
    return {
      'pol_id': mc.pol_id,
      'pol_id_name': mc.pol_id_name,
      'info_type': info_type,
      'featureType': mc.formFeatureData.featureType,
      'tableName': mc.formFeatureData.tableName,
      'idName': mc.formFeatureData.idName,
      'id': mc.formFeatureData.id,
      'formData': $rootScope.feature,
      'deviceTrace': deviceTrace,
      'photos': photos,
      "selectedGeomString": mc.selectedGeomString
    };

  }


  $rootScope.gwSetVisit = gwSetVisit;
  function gwSetVisit(){
    let tempGeom = null; //temporal geometry for explosions
    mc.clickedButton   = "visits";
    formsSewernet.gwSetVisit(prepareDataForgwSetVisit(),function(err,msg){
      if(err){
        log(fileName,"gwSetVisit","error",msg,err);
        notifyEvent(msg,"error",true);
        mc.pointPhotos = Array();
        return false;
      }
      log(fileName,"gwSetVisit callback","gwSetVisit",msg);
      renderApiMessage(msg.message);
      mc.pointPhotos = Array();

      if(typeof msg.body.data.geometry!="undefined"){
        if(typeof msg.body.data.geometry.st_astext!="undefined"){
          log("setVisit callback geometry detected","info",msg.body.data.geometry);
          for(var i=0;i<msg.body.data.geometry.st_astext.split(',').length;i++){
            tempGeom = msg.body.data.geometry.st_astext.split(',')[i];
            if(tempGeom!=null){
              mapFactory.setanimateFeature(true);
              mapFactory.highlightSelectedFeature(tempGeom);
              mapFactory.addSocketGeometry(tempGeom,mc.epsg,mapToc.getMarkedLayerAsActive(),'socket');
            }
          }
        }
      }

      //reload displayed layers and close form
      mapFactory.reloadDisplayedLayers();
      if(mc.notifications===0){
        $scope.closePointInfo();
      }
      if(mc.AddingVisit){
        mc.pol_id = null;
      }
      if(tempGeom!=null){
        mapFactory.highlightSelectedFeature(tempGeom);
        setTimeout(()=>{
          mapFactory.cleanGeometries('selected');
        },5000);
      }
      applyChangesToScope();
    });

  }

  function _renderVisitForm(msg){
    mc.clickedAction = null;
    $rootScope.feature = [];
    mc.activeTab = msg.activeTab;
    mc.filterTabs = msg.formTabs;
    mc.formFilters = true;
    mc.formName = msg.formName;
    mc.formId = msg.formId;
    mc.formFeatureData = msg.feature;
    mc.formParameters = msg.formTabs[msg.activeTab.activeTabIndex].tabFunction.parameters;
    mc.visit_id = msg.feature.id;
    mc.formPagination = msg.formTabs[msg.activeTab.activeTabIndex].pageInfo;
    if(typeof msg.data!="undefined"){
      if(typeof msg.data.geometry!="undefined"){
        doHighlightGeom(msg.data);
      }
    }
    renderApiMessage(msg.msgToDisplay);
    applyChangesToScope();
    _selectActiveTab(msg.activeTab.activeTabIndex,'dynamicForm');
  }

  $scope.gwGetVisitManager = function(){
    mc.formFeatureData = null;
    $rootScope.feature = [];
    gwGetVisitManager({},null);
  }

  $rootScope.gwGetVisitManager = gwGetVisitManager;
  function gwGetVisitManager(formParameters,extraData){
    if(mapFactory.getOnlineStatus()){
      if(typeof extraData=="undefined") extraData = null;
      log(fileName,"gwGetVisitManager()","info");
      var deviceTrace = {
            "xcoord":null,
            "ycoord":  null,
            "compass": null
      };

      formsSewernet.gwGetVisitManager(mc.pol_id,mc.pol_id_name,mc.visit_id,info_type,formParameters,mc.formFeatureData,mc.formPagination,$rootScope.feature,deviceTrace,extraData,function(err,msg){
        if(err){
          log(fileName,"gwGetVisitManager","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        hidePreviousForms();
        mc.clickedButton   = "visitManager";
        log(fileName,"gwGetVisitManager callback","success",msg);
        _renderVisitForm(msg,formParameters);
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }
  $rootScope.gw_api_setvisitmanagerstart = gw_api_setvisitmanagerstart;
  function gw_api_setvisitmanagerstart(formParameters,extraData){
    if(mapFactory.getOnlineStatus()){
      if(typeof extraData=="undefined") extraData = null;
      log(fileName,"gw_api_setvisitmanagerstart()","info");
      var deviceTrace = {
            "xcoord":null,
            "ycoord":  null,
            "compass": null
      };
      if(mc.point_coordinates){
        deviceTrace = {
              "xcoord":  mc.point_coordinates[0],
              "ycoord":  mc.point_coordinates[1],
              "compass": mc.heading
        };
      }

      formsSewernet.gw_api_setvisitmanagerstart(mc.pol_id,mc.pol_id_name,mc.visit_id,info_type,formParameters,mc.formFeatureData,mc.formPagination,$rootScope.feature,deviceTrace,extraData,function(err,msg){
        if(err){
          log(fileName,"gw_api_setvisitmanagerstart","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        hidePreviousForms();
        mc.clickedButton   = "visits";
        log(fileName,"gw_api_setvisitmanagerstart callback","success",msg);
        _renderVisitForm(msg,formParameters);
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }

  $rootScope.gw_api_setvisitmanagerend = gw_api_setvisitmanagerend;
  function gw_api_setvisitmanagerend(formParameters,extraData){
    if(mapFactory.getOnlineStatus()){
      if(typeof extraData=="undefined") extraData = null;
      log(fileName,"gw_api_setvisitmanagerend()","info");
      var deviceTrace = {
            "xcoord":null,
            "ycoord":  null,
            "compass": null
      };
      if(mc.point_coordinates){
        deviceTrace = {
              "xcoord":  mc.point_coordinates[0],
              "ycoord":  mc.point_coordinates[1],
              "compass": mc.heading
        };
      }

      formsSewernet.gw_api_setvisitmanagerend(mc.pol_id,mc.pol_id_name,mc.visit_id,info_type,formParameters,mc.formFeatureData,mc.formPagination,$rootScope.feature,deviceTrace,extraData,function(err,msg){
        if(err){
          log(fileName,"gw_api_setvisitmanagerstart","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        hidePreviousForms();
        mc.clickedButton   = "visits";
        log(fileName,"gw_api_setvisitmanagerend callback","success",msg);
        _renderVisitForm(msg,formParameters);
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }

  $rootScope.gwSetVisitManager = gwSetVisitManager;
  function gwSetVisitManager(formParameters,extraData){
    if(mapFactory.getOnlineStatus()){
      log(fileName,"gwSetVisitManager()","info");
      var deviceTrace = {
            "xcoord":null,
            "ycoord":  null,
            "compass": null
      };
      if(mc.point_coordinates){
        deviceTrace = {
              "xcoord":  mc.point_coordinates[0],
              "ycoord":  mc.point_coordinates[1],
              "compass": mc.heading
        };
      }
      formsSewernet.gwSetVisitManager(mc.pol_id,mc.pol_id_name,mc.visit_id,info_type,formParameters,mc.formFeatureData,mc.formPagination,$rootScope.feature,deviceTrace,extraData,function(err,msg){
        if(err){
          log(fileName,"gwSetVisitManager","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        hidePreviousForms();
        mc.clickedButton   = "visits";
        log(fileName,"gwSetVisitManager callback","success",msg);
        reloadFilters();
        if(mc.visit_offline){
          //force download data
          $scope.offlineDownloadLayers(false);
        }
        _renderVisitForm(msg,formParameters);
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }

  function reloadFilters(){
    log(fileName,"reloadFilters()","info");
    formsSewernet.getFormFilters(mc.use_tiled_background,   function(err,msg){
      if(err){
        log(fileName,"reloadFilters callback","error",msg,err);
      }else{
        log(fileName,"reloadFilters callback","success",msg);
        mapFactory.setFilters(formsSewernet.getFilters());
        mapFactory.reloadDisplayedLayers();
        applyChangesToScope();
      }
    });
  }

  $rootScope.gwSetDelete = gwSetDelete;
  function gwSetDelete(dataToDelete){
    log(fileName,"gwSetDelete","info",dataToDelete);
    if(mapFactory.getOnlineStatus()){
      mc.clickedButton   = "visits";

      formsSewernet.gwSetDelete(mc.pol_id,mc.pol_id_name,info_type,dataToDelete.featureType,dataToDelete.tableName,dataToDelete.idName,dataToDelete.id,$rootScope.feature,function(err,msg){
        if(err){
          log("gwSetDelete","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        log(fileName,"gwSetDelete callback","success",msg);
        renderApiMessage(msg.message);
        mc.formFeatureData = null;
        $rootScope.feature = [];
        gwGetVisitManager(mc.formParameters,null);
        applyChangesToScope();
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }

  $rootScope.gwGetLot = gwGetLot;
  function gwGetLot(dataForFunction){
    log(fileName,"gwGetLot","info",dataForFunction);
    if(mapFactory.getOnlineStatus()){
      mc.clickedButton   = "visits";

      formsSewernet.gwGetLot(mc.pol_id,mc.pol_id_name,info_type,dataForFunction.featureType,dataForFunction.tableName,dataForFunction.idName,dataForFunction.id,$rootScope.feature,function(err,msg){
        if(err){
          log("gwGetLot","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        log(fileName,"gwGetLot callback","success",msg);

        mc.formFeatureData = null;
        $rootScope.feature = [];

        if(typeof msg.data.geometry!="undefined"){
          log(fileName,"gwGetLot callback geometry detected","info",msg.data.geometry);
          for(var i=0;i<msg.data.geometry.length;i++){
            if(msg.data.geometry[i].st_astext!=null){
              mapFactory.addSocketGeometry(msg.data.geometry[i].st_astext,mapFactory.epsg,mapFactory.getActiveLayerName(),'socket');
              mapFactory.zoomToHiglightedFeature(msg.data.geometry[i].st_astext);
            }
          }
        }
        mapFactory.reloadDisplayedLayers();
        _renderVisitForm(msg,dataForFunction);
        applyChangesToScope();
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }

  $rootScope.gwSetLot = gwSetLot;
  function gwSetLot(){
    if(mapFactory.getOnlineStatus()){
      mc.clickedButton   = "visits";
      log(fileName,"gwSetLot()","info",mc.formFeatureData);
      var deviceTrace = {
            "xcoord":null,
            "ycoord":  null,
            "compass": null
      };
      if(mc.point_coordinates){
        deviceTrace = {
              "xcoord":  mc.point_coordinates[0],
              "ycoord":  mc.point_coordinates[1],
              "compass": mc.heading
        };
      }
      formsSewernet.gwSetLot(mc.pol_id,mc.pol_id_name,info_type,mc.formFeatureData.featureType,mc.formFeatureData.tableName,mc.formFeatureData.idName,mc.formFeatureData.id,$rootScope.feature,deviceTrace,function(err,msg){
        if(err){
          log(fileName,"gwSetLot","error",msg,err);
          notifyEvent(msg,"error",true);
          return false;
        }
        log(fileName,"gwSetLot callback","gwSetLot",msg);
        renderApiMessage(msg.message);
        $scope.backButtonClicked();
        mapFactory.cleanGeometries('all');
        mapFactory.reloadDisplayedLayers();
        applyChangesToScope();
      });
    }else{
      notifyEvent(notifications_strings.OFFLINE_FUNCTION_NOT_AVAILABLE,"warning",true);
    }
  }


  $rootScope.gwSetVehicleLoad = gwSetVehicleLoad;
  function gwSetVehicleLoad(){
    var deviceTrace = {
          "xcoord":null,
          "ycoord":  null,
          "compass": null
    }

    if(mapFactory.getOnlineStatus()){
      if(mc.pointPhotos.length>0){
        $rootScope.feature['hash'] = mc.pointPhotos[0].photo_id;
        $rootScope.feature['photo_url'] = `${baseHref}external.image.php?img=`;
        mc.pointPhotos = Array();
      }
      log(fileName,"gwSetVehicleLoad()","info",$rootScope.feature);
      formsSewernet.gwSetVehicleLoad(info_type,$rootScope.feature,deviceTrace).then((msg)=>{
        log(fileName,'gwSetVehicleLoad()','info',msg)
        //notifyEvent(msg.message.text,"success",true);
        renderApiMessage(msg.content.message);

        if( msg.form){
          //if(msg.message.body.length>0){

          _renderVisitForm(msg.content);

        }

        applyChangesToScope();
      }).catch((e)=>{
        log(fileName,"gwSetVehicleLoad","error",e,e);
        notifyEvent(JSON.stringify(e),"error",true);
      });

    }
  }

  //****************************************************************
  //**************            END VISITS          ******************
  //**************       NEW IMPLEMENTATION       ******************
  //****************************************************************

  //****************************************************************
  //**************        SET UNIT INTERVAL       ******************
  //****************************************************************


    $rootScope.gw_fct_setunitinterval = gw_fct_setunitinterval;
    function gw_fct_setunitinterval(){
      var deviceTrace = {
            "xcoord":null,
            "ycoord":  null,
            "compass": null
      }

      if(mapFactory.getOnlineStatus()){
        log(fileName,"gw_fct_setunitinterval()","info",$rootScope.feature);
        formsSewernet.gw_fct_setunitinterval(info_type,$rootScope.feature,deviceTrace).then((msg)=>{
          log(fileName,'gw_fct_setunitinterval()','info',msg)
          //notifyEvent(msg.message.text,"success",true);

          mapFactory.reloadDisplayedLayers();
          _renderVisitForm(msg);
          applyChangesToScope();
        }).catch((e)=>{

          log(fileName,"gw_fct_setunitinterval","error",e);
          notifyEvent(JSON.stringify(e),"error",true);
        });

      }
    }

};
