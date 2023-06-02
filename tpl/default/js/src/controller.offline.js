/*jshint esversion: 6 */
angular.module('app').expandControllerOffline = function($scope,$rootScope,blockUI,data){
  var fileName = 'controller.offline.js 1.0.0',
  log = data.sharedMethods.log,
  baseHref = data.baseHref,
  project_id = data.project_id,
  token = data.token,
  email = data.email,
  offline_background = data.offline_background,
  offlineLogin = data.offlineLogin,
  urlWMS = data.urlWMS,
  notifications_strings = data.strings,
  geom_colors = data.geom_colors,
  formsSewernet = data.sharedModules.formsSewernet,
  mapFactory = data.sharedModules.mapFactory,
  mapToc = data.sharedModules.mapToc,
  Bgs = data.sharedModules.Bgs,
  _login = data.sharedModules.login;
  off_download_data = data.off_download_data,
  off_download_data_ttl = data.off_download_data_ttl,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  notifyEvent = data.sharedMethods.notifyEvent,
  displayMapError = data.sharedMethods.displayMapError,
  prepareDataForgwSetVisit = data.sharedMethods.prepareDataForgwSetVisit,
  userName = document.getElementById('user_id').value;
  mc = data.mc;
  log(fileName,"expandControllerOffline","info",data);
  offlineSetup();
  //****************************************************************
  //******************           OFFLINE              **************
  //****************************************************************

  function offlineSetup(){
    log(fileName,"offlineSetup()","info");
    mc.offlineForced = false; //flag for control offline forced
    mc.pendingDumpButton = false; //hide dump button
    mc.deleteVisitsButton = false; //hide delete visist button
    mc.offline_rendering_status = false; //dom element for rendering status
    mc.offline_downloading_status = false; //dom element for downloading status
    mc.selectAreaToDownloadButton = true; //dom element for selectAreaButton
    mc.startDownloadGeoJSONButton = true; //dom element for downloading geoJson button
    mc.startDownloadBackgroundButton = false; //dom element for downloadBackgroundButton
    mc.startDownloadLayersButton = true; //dom element for DownloadLayersButton
    mc.downloadingDisabled = true; //flag for disable/enable buttons while downloading
    mc.showSavedAreasButton = false; //dom element for showSavedAreasButton
    mc.showingSavedAreas = false; //flag for controlling if saving areas are displayed in the mp
    mc.selectingArea = false; //flag for mark selectArea button
    mc.forceOfflineButton = false; //hide force oflline button
    mc.visitsStoredNumber = null; //info for displaying number of visits
    mc.visitsDate = null; //info for displaying visits date
    mc.storedBackGroundDate = null; //info for displaying background map stored date
    mc.storedGeoJSONDate = null; //info for displaying geojson downloaddate
    mc.offlineInfoAvailable = false; //hide offline info tab
    mc.totalStorageUsed = null; //total space in localstorage used
    mc.StoragGranted = null; //aprox available space in localstorage
    var somethingStored = false; //flag for detecting if there's info stored
    var offlineInfo = mapFactory.offlineGetInfo();
    log(fileName,"offlineSetup()","info",offlineInfo);
    if(offlineInfo.background_extent){
      mc.showSavedAreasButton       = true;
      mc.forceOfflineButton          = true;
      mc.storedBackGroundDate        = offlineInfo.background_stored_date;
      somethingStored                = true;
    }
    if(offlineInfo.geojson_stored_date){
      mc.storedGeoJSONDate        = offlineInfo.geojson_stored_date;
      somethingStored                = true;
    }
    if(somethingStored){
      mc.offlineInfoAvailable       = true;
      mc.showSavedAreasButton        = true;    //dom element for showSavedAreasButton
    }

    $rootScope.$on('tocReady', function(event, data) {
      log(fileName,"offlineSetup() tocReady event","info",{});
      if(mc.visit_offline){
        formsSewernet.setUpOfflineVisit(
          {
            'visit_offline':true,
            'storeName':`bmaps_${project_id}`,
            'cacheVersion': 'bmaps-0.0.2',
            'user_id'	: userName,
            'offlineLogin': offlineLogin,
            'urlWMS':urlWMS,
            'off_download_data_ttl': off_download_data_ttl,
            'off_download_data': off_download_data,
            'project_id': project_id,
            'epsg': mapFactory.epsg,
            'visited_spots_layer': mc.visited_spots_layer,
            'project_layers':{'names': mapToc.getAvailableLayers(),'tables':mapToc.getAvailableLayersTableNames(),'offline':mapToc.getOfflineLayers(),'visitable':mapToc.getVisitableLayers()},
          }
        ).then(function (response){
          mc.offline_reminder = mc.pendingDumpButton = mc.deleteVisitsButton = mc.pendingDumpButton = response.pending;   //display dump button
          //autodownload
          if(response.mustDowloadData){
            $scope.offlineDownloadLayers();
          }

        });
      }
    });

    applyChangesToScope();
  }

  $rootScope.$on('capabilities', function(event, data) {
    if(mc.visited_spots_layer && mc.visit_offline){
      log(fileName,"Render Visited Spots layer","info");
      //display layer with offline visited spots
      mc.offlineVisitedSpots = 1;
      let _data = {
        'map': mapFactory.getMap(),
        'geom_colors': geom_colors
      };
      formsSewernet.renderVisitedSpotsLayer(_data);
    }
  });
  //************** DOWNLOAD METHODS

  //select area button
  $scope.offlineSelectAreaToDownload  = function (){
    log(fileName,"offlineSelectAreaToDownload()","info");
    mapFactory.offlineSelectAreaToDownload(mc.offlineareatodownload);
  };

  //background download button
  $scope.offlineStartDownloadBackground  = function (useConfirm){
    log(fileName,"offlineStartDownloadBackground()","info",{'useConfirm':useConfirm});
    if (confirm(notifications_strings.OFFLINE_DOWNLOAD_BACKGROUND_ALERT)) {
      mapFactory.offlineConfigure('background',baseHref+'ajax.offline.php',mc.project_name,token,offline_background,useConfirm);
      blockUI.start(notifications_strings.OFFLINE_START_BG_DOWNLOAD);
    }
  };

  //download layers button
  $scope.offlineDownloadLayers  = function (useConfirm){
    log(fileName,"offlineDownloadLayers()","info",{'useConfirm':useConfirm});
    let availableFilterForLayers = {};
    let _availableLayers = mapToc.getAvailableLayers();
    blockUI.start();
    blockUI.message(notifications_strings.DOWNLOADING);
    mapFactory.getFeatureTypeFromWFS(_availableLayers).then((availableFilterForLayers)=>{
      log(fileName,"offlineDownloadLayers() getFeatureTypeFromWFS","info",{'availableFilterForLayers':availableFilterForLayers});
      mapFactory.offlineConfigure('layers',baseHref+'ajax.offline.php',mc.project_name,token,null,useConfirm,formsSewernet.getFilters(),availableFilterForLayers);
      formsSewernet.clearVisitedSpots();
    }).catch((e)=>{
      log(fileName,"offlineDownloadLayers() getFeatureTypeFromWFS","error",{'e':e});
      blockUI.reset();
    });
  };

  $scope.offlineDownloadForms  = function (){
    log(fileName,"offlineDownloadForms()","info");
    blockUI.start();
    blockUI.message(notifications_strings.OFFLINE_DOWNLOADING_VISIT_FORMS);
    formsSewernet.storeVisitForms();
  };

  //************** END DOWNLOAD METHODS

  //show saved areas button
  $scope.offlineShowSavedAreas  = function(){
    log(fileName,"offlineShowSavedAreas()","info",mc.showingSavedAreas);
    if(!mc.showingSavedAreas){
      mapFactory.offlineShowSavedAreas();
      mc.showingSavedAreas = true;
    }else{
      mapFactory.offlineHideSavedAreas();
      mc.showingSavedAreas   = false;
    }
    applyChangesToScope();
  };

  //clean visits button
  $scope.clearOfflineVisits = function(){
    if (confirm(notifications_strings.OFFLINE_DELETE_STORED_VISITS)) {
      formsSewernet.clearOfflineVisits({'project_id': project_id}).then(()=>{
        log(fileName,"clearOfflineVisits()","success");
      }).catch((e)=>{
        log(fileName,"clearOfflineVisits()","error",e);
      });
    }
  };

  //dump data button
  $scope.offlineDumpData  = function(){
    log(fileName,"offlineDumpData()","info");
    if(!mc.offline_downloading_status){
      blockUI.start(notifications_strings.OFFLINE_UPLOADING);
      formsSewernet.dumpOfflineVisits({'project_id': project_id}).then(()=>{
        log(fileName,"dumpOfflineVisits()","success");
      }).catch((e)=>{
        log(fileName,"dumpOfflineVisits()","error",e);
      });
    }
  };

  //offline reset button
  $scope.offlineReset  = function(){
    log(fileName,"offlineReset()","info");
    if(!mc.offline_downloading_status){
      mapFactory.offlineReset('bmaps-0.0.2');
      offlineSetup();
    }else{
      alert("Dowloading data, wait!");
    }
  };

  //force offline button
  $scope.toggleOffline    = function(){
    mc.offlineForced = mapFactory.forceOffline();
  };

  //donwload geojson method
  function downloadGeoJson(){
    log(fileName,"downloadGeoJson()","info");
    mc.offline_downloading_status = true;
    blockUI.start(notifications_strings.OFFLINE_START_LAYER_DOWNLOAD);
  }

  //show hide buttons
  function showHideDownloadButtons(selectAreaBt,saveBackgroundBt,selectingArea,showAreas,downloading,donwloadLayersBt){
    mc.selectAreaToDownloadButton           = selectAreaBt;
    mc.startDownloadBackgroundButton        = saveBackgroundBt;
    mc.startDownloadLayersButton            = true;
    mc.selectingArea                        = selectingArea;
    if(selectingArea){
      mc.startDownloadBackgroundButton      = saveBackgroundBt;
      mc.selectAreaToDownloadButton         = selectAreaBt;
    }
    mc.offline_downloading_status           = downloading;
    applyChangesToScope();
  }

  $scope.toggleVisitedSpots = function(){
    log(fileName,"toggleVisitedSpots","info",{'offlineVisitedSpots': mc.offlineVisitedSpots});
    formsSewernet.toggleVisitedSpots({
        'map': mapFactory.getMap(),
        'geom_colors': geom_colors
    }).then((result)=>{
      mc.offlineVisitedSpots = result;
    });
  };

  //event online status listener
  $scope.$on('appOnline', function(event,data){
    log(fileName,"on appOnline","info",data);
    if(data.status){
      notifyEvent("App online","success",true);
      appOnline = true;
      if(offlineLogin){
        //online login
        _login.syncroLogin({
          email: email,
          project_id:project_id,
          token: token
        }).then(function(response){
          log(fileName,"login offline/online syncro","success",{'oldToken': token, 'newToken':response});
          mapFactory.setOnlineMode();
          if(mc.available_bg_layers.length===0){
            Bgs.loadProjectBgs().then(function(response)  {
              log(fileName,"loadProjectBgs loaded","info",response);
              mc.available_bg_layers = response;
              applyChangesToScope();
              $scope.changeBackgroundMap('main');
            }).catch(function(error) {
              log(fileName,"loadProjectBgs","warn",error);
            });
          }else{
            $scope.changeBackgroundMap('main');
          }
          token = response;
          //show use tiled background checkbox
          if(mc.use_tiled_background){
            if(appOnline){
              loadAvailaibleTiled();
            }
          }
        }).catch(function(err){
          log(fileName,"login offline/online syncro","error",err);
        });
      }
    }else{
      notifyEvent("App offline","warning",true);
    }
  });

  //event listener
  $rootScope.$on('offlineDownloadEvent', function (event, data){
    log(fileName,"offlineDownloadEvent(): "+data.evt,"info",data);
    if(data.evt==="downloading"){
      mc.offline_downloading_status           = true;
      mc.startDownloadBackgroundButton        = false;
      mc.selectAreaToDownloadButton            = false;
      blockUI.message(notifications_strings.DOWNLOADING);
    }else if(data.evt==="done"){
      offlineSetup();
      blockUI.message(notifications_strings.OFFLINE_DOWNLOAD_SUCCESSFUL);
      setTimeout(function(){
        blockUI.reset();
        applyChangesToScope();
      },2000);
      showHideDownloadButtons(true,false,false,false,false);
    }else if(data.evt==="geoJSONStartDownload"){
      blockUI.message(notifications_strings.OFFLINE_START_LAYER_DOWNLOAD+" "+data.name);
      mc.offline_downloading_status = true;
    }else if(data.evt==="geoJSONStored"){
      blockUI.message(notifications_strings.OFFLINE_DOWNLOAD_SUCCESSFUL+" "+data.name);
    }else if(data.evt==="geoJSONStoredError"){
      offlineSetup();
      log(fileName,"geoJSONStoredError, layer: "+data.name+", error: ","error",data.error);
      notifyEvent(notifications_strings.OFFLINE_ERROR_DOWNLOAD_GEOJSON,"error",true);
      showHideDownloadButtons(true,false,false,true,false);
    }else if(data.evt==="geoJSONNoAvailableData"){
      notifyEvent(notifications_strings.OFFLINE_NO_LAYERS_TO_DOWNLOAD,"error",true);
      mc.offline_downloading_status = false;
      setTimeout(function(){
        blockUI.reset();
        applyChangesToScope();
      },2000);
      showHideDownloadButtons(true,false,false,true,false);
    }else if(data.evt==="geoJSONStoredEnd"){
      mc.offline_downloading_status = false;
      blockUI.message(notifications_strings.OFFLINE_DOWNLOAD_LAYERS_SUCCESS);
      if(mc.visit_offline){
        formsSewernet.storeDownloadDate();
        setTimeout(() => {
          blockUI.message(notifications_strings.OFFLINE_DOWNLOADING_VISIT_FORMS);
          formsSewernet.storeVisitForms();
        },1000);
      }else{
        formsSewernet.storeDownloadDate();
        setTimeout(()=>{
          blockUI.reset();
          applyChangesToScope();
        },2000);
      }
      showHideDownloadButtons(true,false,false,true,false);
    }else if(data.evt==="setDownloadButtons"){
      //show hidde donwload buttons
      showHideDownloadButtons(data.selectArea,data.startDownload,data.selectingArea,data.showAreas,data.downloading,data.donwloadLayersBt);
    }else if(data.evt==="startDownloadLayers"){
      mc.offline_downloading_status = true;
      blockUI.start(notifications_strings.OFFLINE_START_LAYER_DOWNLOAD);
    }else if(data.evt==="cancelDownload"){
      setTimeout(function(){
        blockUI.reset();
        applyChangesToScope();
      },100);
      showHideDownloadButtons(data.selectArea,data.startDownload,data.selectingArea,data.showAreas,data.downloading,data.donwloadLayersBt);
    }
    applyChangesToScope();
  });

  $rootScope.$on('offlineEvent', function (event, data){
      log(fileName,"offlineEvent() "+data.evt,"info",data);
      if(data.evt==="no_offline_data"){
        notifyEvent(notifications_strings.OFFLINE_NO_DATA_STORED_FOR+" "+data.name,"error",true);
        //mapToc.unMarkLayer(data.name);
        setTimeout(function(){
          blockUI.reset();
          applyChangesToScope();
        },200);
      }else if(data.evt==="renderingEvent"){
        mc.offline_rendering_status = true;
        blockUI.start(notifications_strings.RENDERING);
      }else if(data.evt==="renderEvent"){
        mc.offline_rendering_status = false;
        setTimeout(()=>{
          blockUI.start('');
          blockUI.reset();
          applyChangesToScope();
        },200);
      }else if(data.evt==='localStorageSpace'){
        log(fileName,"localStorageSpace: ","info",data);
        mc.usedPercentage = data.data.usedPercentage;
      }else if(data.evt==='dumpData'){
        if(data.text==="uploadingPhotos"){
          notifyEvent(notifications_strings.OFFLINE_UPLOADING_PHOTOS,"success",true);
        }else if(data.text==="uploadingEvents"){
          notifyEvent(notifications_strings.OFFLINE_UPLOADING_EVENTS,"success",true);
        }else if(data.text==="preparingPhoto"){
          notifyEvent(notifications_strings.OFFLINE_PREPARING_PHOTO,"success",true);
        }
      }else if(data.evt==='removingData'){
        notifyEvent(notifications_strings.OFFLINE_REMOVING_STORED_VISITS,"success",true);
      }
      applyChangesToScope();
  });

  //****************************************************************
  //******************          END OFFLINE           **************
  //****************************************************************


};
