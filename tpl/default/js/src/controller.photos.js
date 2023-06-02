/*jshint esversion: 6 */
angular.module('app').expandControllerPhotos = function($scope,$rootScope,blockUI,fileReader,cfpLoadingBar,data){
  var fileName = 'controller.photos.js 1.0.0',
  log = data.sharedMethods.log,
  baseHref = data.baseHref,
  notifications_strings = data.strings,
  formsSewernet = data.sharedModules.formsSewernet,
  mapFactory = data.sharedModules.mapFactory,
  mapToc = data.sharedModules.mapToc,
  applyChangesToScope = data.sharedMethods.applyChangesToScope,
  notifyEvent = data.sharedMethods.notifyEvent,
  displayMapError = data.sharedMethods.displayMapError,
  info_type = data.info_type,
  mc = data.mc;
  fextension = null;
  log(fileName,"expandControllerPhotos","info",data);
  //****************************************************************
  //******************          PHOTOS           *******************
  //****************************************************************

  //show picture preview
  $scope.showContent  = function($fileContent){
    log(fileName,"showContent()","info",{'fileContent':$fileContent});
    fileReader.readAsDataUrl($scope.file, $scope).then(function(result) {
      mc.showPreview = true;
      mc.preview = result;
      if(photoMode==="upload"){
        if(mc.visit_version=='1'){
          savePicture();
        }else{
          if(mapFactory.getOnlineStatus()){
            savePicture();
          }else{
            blockUI.start(notifications_strings.OFFLINE_STORING_PHOTO);
            let attachedTo = "feature";
            if(mc.visit_id!="" && mc.visit_id!=null){
              attachedTo = "visit";
            }
            let metadata = {};
            metadata.attachedTo = attachedTo;
            metadata.visit_id = mc.visit_id;
            metadata.layer = mapToc.getMarkedLayerAsActive();
            metadata.table = mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive());
            metadata.pol_id = mc.pol_id;
            metadata.idName = mc.pol_id_name;
            formsSewernet.saveVisitPicture($rootScope.prepareDataForgwSetVisit(),mc.preview,$('#takepicture').val(),metadata).then((response)=>{
              log(fileName,"saveVisitPicture","success",response);
              blockUI.message(notifications_strings.OFFLINE_PHOTO_STORED);
              setTimeout(function(){
                blockUI.reset();
                applyChangesToScope();
              },2000);
            }).catch((e)=>{
              log(fileName,"saveVisitPicture","error",e);
              blockUI.message(e);
              setTimeout(function(){
                blockUI.reset();
                applyChangesToScope();
              },2000);
            });
          }
        }
      }
    });
    applyChangesToScope();
  };

  //click on camera icon
  $scope.addPicture = function (mode){
    log(fileName,"addPicture("+mode+")","info");
    mc.preview = null;
    photoMode = mode;
    $("#takepicture").click();
  };

  //save picture, called by uploader callback
  function savePicture(){
    log(fileName,"savePicture()","info");
    let attachedTo = "feature";
    if(mc.visit_id!="" && mc.visit_id!=null){
      attachedTo = "visit";
    }


    let metadata = {};
    metadata.attachedTo = attachedTo;
    metadata.visit_id = mc.visit_id;
    metadata.layer = mapToc.getMarkedLayerAsActive();
    metadata.table = mapToc.getTableNameByLayerName(mapToc.getMarkedLayerAsActive());
    metadata.pol_id = mc.pol_id;
    metadata.idName = mc.pol_id_name;
    var filesToUploads = document.getElementById('takepicture').files;
    var file = filesToUploads[0];
    if (file) {
      metadata.fileName = file.name;
    }
    cfpLoadingBar.start();
    ResizeImage(mc.preview).then((result)=>{
      log(fileName,"savePicture ResizeImage()","success",{'fextension':fextension,'result':result});
      mc.preview = result;
      mapFactory.photosSavePicture(baseHref+'ajax.addInfo.php',mc.visit_id,mc.preview,mapFactory.getCurrentLayerName(),JSON.stringify(metadata),
        function(e,visit_id,data){
          if(e){
            log(fileName,"savePicture("+e+")","error",data);
            displayMapError({err: e});
            $('#takepicture').val('');
            mc.preview          = null;
          }else{
            log(fileName,"savePicture("+visit_id+")","success",data);
            mc.heading = mapFactory.getHeading();
            mc.preview = null;
            if(mc.visit_version=='1'){
              mapFactory.photosAddPhoto(data.photo_id,mc.heading);
              mc.pointPhotos.push(data);
            }else{
              //new visits implementations
              if(typeof mc.activeTab!="undefined"){
                if(mc.formParameters!=null){
                  if(typeof mc.formParameters.form!="undefined"){
                    mc.formParameters.form.navigation = {"currentActiveTab":mc.activeTab.tabName,"clickedAction":mc.clickedAction};
                  }
                }
              }
              //TBR
              //if(mc.clickedButton === "visitManager"){
                data.fextension = fextension;
                mc.pointPhotos.push(data);
                notifyEvent(notifications_strings.NOTIFICATION_PHOTO_ADDED,"success",true);
            //  }else{
              //  $rootScope.gwGetVisit(mc.formParameters,{"action":"newFile","fileName":$('#takepicture').val(),"hash":data.photo_id},false);
            //  }
            }
            //end new visits implementation
            notifyEvent(notifications_strings.NOTIFICATION_PHOTO_ADDED,"success",true);
            cfpLoadingBar.complete();
            $('#takepicture').val('');
            applyChangesToScope();
          }
          applyChangesToScope();
        }
      );
    }).catch((e)=>{
      log(fileName,"savePicture ResizeImage()","error",{'e':e});
    });
  }

  $scope.deleteImg    = function(photo_id,id){
    log(fileName,"deleteImg("+photo_id+","+id+")","info");
    mapFactory.photosDeletePhoto(baseHref+'ajax.addInfo.php',photo_id,mapFactory.getCurrentLayerName(),mc.pol_id,mc.tableIdName,function(_photo_id){
      log(fileName,"deleteImg OK("+photo_id+","+id+")","success");
      removePhotoFromArray(photo_id);
      if(typeof id!="undefined"){
        //new visits implementation
        if(typeof mc.activeTab!="undefined"){
          if(mc.formParameters!=null){
            if(typeof mc.formParameters.form!="undefined"){
              mc.formParameters.form.navigation = {"currentActiveTab":mc.activeTab.tabName, "clickedAction":"deleteFile"};
            }
          }
        }
        if(mc.visit_id!="" && mc.visit_id!=null){
          if(mc.formParameters===null) mc.formParameters = {};
          $rootScope.gwGetVisit(mc.formParameters,{"action":"deleteFile","deleteFile":{"feature":id}},false);
        }else{
          formsSewernet.deleteFeatureFile(mc.pol_id,id,mc.info_type).then((msg)=>{
            log(fileName,"deleteFeatureFile","success",msg);
            notifyEvent(notifications_strings.NOTIFICATION_PHOTO_REMOVED,"success",true);
            $scope.getTabFiles();
          }).catch((e)=>{
            log(fileName,"deleteFeatureFile","error",e);
          });
        }
      }
    },callbackDeletePhotoKo);
  };

  function callbackDeletePhotoKo(msg,data){
    log(fileName,"callbackDeletePhotoKo("+msg+")","error",data);
    displayMapError({err: msg});
  }

  function removePhotoFromArray(_id){
    if(mc.pointPhotos){
    log(fileName,"removePhotoFromArray("+_id+")","info");
      var index = mc.pointPhotos.indexOf(_id);
      mc.pointPhotos.splice(index, 1);
    }
  }

  $scope.showPhoto  = function(src){
    log(fileName,"showPhoto("+src+")","info");
    mc.loadingPhoto    = true;
    mc.displayPhoto    = false;
    window.open(baseHref+"external.image.php?img="+src);
    //mapFactory.photosShowPhoto(baseHref+'show.image.php?img=',src,callBackShowPhotoOk,callBackShowPhotoKo);
  };

  function callBackShowPhotoOk(data,noCache){
    log(fileName,"callBackShowPhotoOk(data,"+noCache+")","success",data);
    mc.displayPhotoSrc   = data;
    mc.phpotoNoCache     = noCache;
    $('.lightbox').click();
    mc.displayPhoto      = true;
    mc.loadingPhoto      = false;
    applyChangesToScope();
  }

  function callBackShowPhotoKo(){
    displayMapError({err: "Error requesting showPhoto"});
    log(fileName,"callBackShowPhotoOk()","error");
  }

  $scope.closePhoto = function(){
    log(fileName,"closePhoto()","info");
    var modal         = $('#previewImageModal');
    mc.displayPhoto   = null;
    applyChangesToScope();
    modal.modal('hide');
  };

  //****************************************************************
  //******************         END PHOTOS           ****************
  //****************************************************************

  function ResizeImage() {
    return new Promise((resolve, reject) => {
      if(mc.PhotosLowResolution){
        log(fileName,"ResizeImage() use resized image","info");
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          var filesToUploads = document.getElementById('takepicture').files;
            var file = filesToUploads[0];
            if (file) {
              fextension = file.name.split('.').pop();
              log(fileName,"ResizeImage() file info","info",{'file':file,'fextension':fextension});

              if(file.type==="image/jpeg" || file.type==="image/png"){
              var reader = new FileReader();
              reader.onload = function (readerEvent) {
                 var image = new Image();
                 image.onload = function (imageEvent) {
                    // Resize the image
                    var canvas = document.createElement('canvas'),
                        max_size = 544,// TODO : pull max size from a site config
                        width = image.width,
                        height = image.height;
                     if (width > height) {
                         if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                         }
                     } else {
                         if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                         }
                     }
                     canvas.width = width;
                     canvas.height = height;
                     canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                     var dataUrl = canvas.toDataURL('image/jpeg');
                     resolve(dataUrl);
                 };
                 image.src = readerEvent.target.result;
              };
              reader.readAsDataURL(file);
            }else{
              log(fileName,"ResizeImage() is not an image, not resizing","info");
              resolve(mc.preview);
            }
          }else{
            log(fileName,"ResizeImage() NO file","info");
          }
        } else {
          reject('The File APIs are not fully supported in this browser.');
        }
      }else{
        log(fileName,"ResizeImage() use original image","info");
        resolve(mc.preview);
      }
    });
  }

  $rootScope.loadThumb = function (hash){
    log(fileName,"loadThumb()","info",{'hash':hash});
    return  formsSewernet.showThumb(hash);
  };

  $rootScope.getInfoFile = function (hash){
    log(fileName,"getInfoFile()","info",{'hash':hash});
    return formsSewernet.getInfoFile(hash);
  };
};
