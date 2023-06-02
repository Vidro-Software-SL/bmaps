/* jshint esversion: 6 */

import RichLogger from '../src/richLogger';
import MapStorage from './mapStorage';
import axios from 'axios';
import FormUtils from '../forms/form_utils';

let _self = null,
  _version = '1.0.0',
  _events = null,
  _logger = null;
//modules
let _storage = null;
let _formUtils = null;			//form utils module

//offline layer for visit spots
let offlineVisitSpotsSource = null,
offlineVisitSpotsLayer = null,
map = null,
visitedfeautures = [],
geom_colors = {
  visited_spots_stroke_color: 'rgba(0, 0, 0, 0.99)',
  visited_spots_fill_color: 'rgba(0, 0, 0, 0.0)',
  visited_spots_shape: 'square',
  visited_spot_radius: 12
};

export default class VisitsOffline {

  constructor(options,events,logger) {
    if (typeof options === 'undefined') {
      throw new TypeError('no data');
    }
    if (typeof options.baseHref === 'undefined') {
      throw new TypeError('no options baseHref');
    }
    if (typeof events === 'undefined') {
      throw new TypeError('no events');
    }
    _events = events;
    if (typeof logger === 'undefined') {
      throw new TypeError('no logger');
    }
    _logger = logger;
    if (typeof options.storage === 'undefined') {
      _storage = new MapStorage(options,_events,_logger);
    }else{
      _storage = options.storage;
    }
    _self = this;
    _self._fileName = 'visits_offline.js';
    _self.options = options;
    _formUtils = new FormUtils(_self.options, events, _logger);
    _logger.info(_self._fileName, `Module loaded v.${_version}`,options);
  }

  getOfflineVisits(project_id){
    _logger.info(_self._fileName, `getOfflineVisits(${project_id})`);
    try{
      let ofVisits = _storage.getItem(`bmaps_${project_id}_visits`);
      if(ofVisits){
        return JSON.parse(ofVisits);
      }else{
        return [];
      }
    }catch(e){
      _logger.error(_self._fileName, 'getOfflineVisits',e);
      return [];
    }
  }

  /**
    storeVisitedSpot
      stores a visited spot

      @param project_id <int>
      @param geomString <string> geom string

   **/

  storeVisitedSpot(project_id,geomString){
    _logger.info(_self._fileName, `storeVisitedSpot(${project_id})`,geomString);
    if(geomString){
      if(_self.options.visited_spots_layer){
        if(typeof ol=="undefined" || !ol) return false;
        var ofVisits_spots = _self.getVisitedSpots(project_id);
        if(ofVisits_spots){
          let coordinates = null,
          format = new ol.format.WKT({}),
      		geom2Hightlight	= format.readGeometry(
      		geomString,
      			{
      				dataProjection: 	_self.options.epsg,
      				featureProjection: _self.options.epsg
      			}
      		);
          if(geom2Hightlight.getType()==="Point" || geom2Hightlight.getType()==="point"){

          }
          //check this with linestring and polygons!!!
          coordinates = geom2Hightlight.getCoordinates();
          ofVisits_spots.push(coordinates);
          //add feauture to map
          _self._renderFeauture(coordinates);
        }else{
          ofVisits_spots = [data];
        }
        _storage.setItem(`bmaps_${project_id}_visited_spots`,JSON.stringify(ofVisits_spots));
      }
    }
  }

  /**
    getVisitedSpots
      returns visited spots array

      @param project_id <int>
      @returns <array>
   **/

  getVisitedSpots(project_id){
    _logger.info(_self._fileName, `getVisitedSpots(${project_id})`);

    try{
      if(_self.options.visited_spots_layer){
        let ofVisits = _storage.getItem(`bmaps_${project_id}_visited_spots`);
        if(ofVisits){
          return JSON.parse(ofVisits);
        }else{
          return [];
        }
      }else{
        return [];
      }
    }catch(e){
      _logger.error(_self._fileName, 'getVisitedSpots',e);
      return [];
    }
  }

  /**
    clearVisitedSpots
      clears visited spots

      @param project_id <int>
   **/

  clearVisitedSpots(){
    _logger.info(_self._fileName, `clearVisitedSpots()`);
    try{
      _storage.removeItem(`bmaps_${_self.options.project_id}_visited_spots`);
      if(offlineVisitSpotsSource){
        offlineVisitSpotsSource.clear();
      }
    }catch(e){
      _logger.error(_self._fileName, 'clearVisitedSpots',e);
      return false;
    }
  }

  /**
    renderVisitedSpotsLayer
      creates a vector layer and vector source for display visited spots feautures

      @param options <JSON>
                map:  ol.Map instance

      @returns <boolean>
   **/
  renderVisitedSpotsLayer(options){
    _logger.info(_self._fileName, `renderVisitedSpotsLayer()`,options);
    try{
      if(_self.options.visited_spots_layer){
        if (!ol) return false;
        map = options.map;
        if(typeof options.geom_colors.visited_spots_stroke_color!="undefined" && options.geom_colors.visited_spots_stroke_color!=''){
          geom_colors.visited_spots_stroke_color = options.geom_colors.visited_spots_stroke_color;
        }
        if(typeof options.geom_colors.visited_spots_fill_color!="undefined" && options.geom_colors.visited_spots_fill_color!=''){
          geom_colors.visited_spots_fill_color = options.geom_colors.visited_spots_fill_color;
        }
        if(typeof options.geom_colors.visited_spots_shape!="undefined" && options.geom_colors.visited_spots_shape!=''){
          geom_colors.visited_spots_shape = options.geom_colors.visited_spots_shape;
        }
        if(typeof options.geom_colors.visited_spot_radius!="undefined" && options.geom_colors.visited_spot_radius!=''){
          geom_colors.visited_spot_radius = options.geom_colors.visited_spot_radius;
        }

        if(typeof map!="undefined" && ol){
          offlineVisitSpotsSource = new ol.source.Vector({});
          offlineVisitSpotsLayer = new ol.layer.Vector({
                                      source: offlineVisitSpotsSource
                                    });
          map.addLayer(offlineVisitSpotsLayer);
          //render offline spots
          _self._renderOfflineVisitSpots();
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }catch(e){
      _logger.error(_self._fileName, `renderVisitedSpotsLayer()`,e);
    }
  }
  /**
    _renderOfflineVisitSpots
      renders offline visited spots
   **/
  _renderOfflineVisitSpots(){
    _logger.info(_self._fileName, `_renderOfflineVisitSpots()`);
    if(_self.options.visited_spots_layer){
      if(offlineVisitSpotsSource){
        offlineVisitSpotsSource.clear();
      }
      var ofVisits_spots = _self.getVisitedSpots(_self.options.project_id);
      if(ofVisits_spots){
        for(let i=0;i<ofVisits_spots.length;i++){
          _self._renderFeauture(ofVisits_spots[i]);
        }
      }
    }
  }
  /**
    _renderFeauture
      adds a feauture to vector source of visited spots

      @param coordinates <array> x,y

      @returns <boolean>
   **/
  _renderFeauture(coordinates){
    _logger.info(_self._fileName, '_renderFeauture() coordinates()',{'coordinates':coordinates});
    try{
      if(_self.options.visited_spots_layer){
        if(typeof ol=="undefined" || !ol) return false;
        let newFeature = new ol.Feature(),
        featureGeom = null;
        if(geom_colors.visited_spots_shape==="square"){
          featureGeom = new ol.style.RegularShape({
                fill: new ol.style.Fill({color: geom_colors.visited_spots_fill_color}),
                stroke: new ol.style.Stroke({
                  color: geom_colors.visited_spots_stroke_color,
                  width: 1
                }),
                points: 4,
                radius: geom_colors.visited_spot_radius,
                angle: Math.PI / 4
              });
        }else{
          featureGeom = new ol.style.Circle({
                radius: geom_colors.visited_spot_radius,
                fill: new ol.style.Fill({color: geom_colors.visited_spots_fill_color}),
                stroke: new ol.style.Stroke({
                  color: geom_colors.visited_spots_stroke_color,
                  width: 1
                })
              });
        }

        newFeature.setStyle(new ol.style.Style({
                                  image: featureGeom
                              })
                            );
        newFeature.setGeometry(new ol.geom.Point(coordinates));
        if(offlineVisitSpotsSource){
          offlineVisitSpotsSource.addFeature(newFeature);
        }
      }
      return true;
    }catch(e){
      _logger.error(_self._fileName, '_renderFeauture()',e);
      return false;
    }
  }

  /**
    toggleVisitedSpots
      displays/hides visited spots layer
   **/
  toggleVisitedSpots(options){
    return new Promise((resolve, reject) => {
      if(offlineVisitSpotsLayer){
        _logger.info(_self._fileName, 'toggleVisitedSpots',{'displayed':offlineVisitSpotsLayer.getVisible()});
        if(offlineVisitSpotsLayer.getVisible()){
          offlineVisitSpotsLayer.setVisible(false);
          resolve(false);
        }else{
          offlineVisitSpotsLayer.setVisible(true);
          resolve(true);
        }
      }else{
        _logger.info(_self._fileName, 'toggleVisitedSpots',options);
        _self.renderVisitedSpotsLayer(options);
        resolve(true);
      }
    });
  }

  clearOfflineVisits(data){
    _logger.info(_self._fileName, 'clearOfflineVisits',data);
    return new Promise((resolve, reject) => {
      try{
        _storage.removeItem(`bmaps_${data.project_id}_visits`);
        //clear photos
        _self._ClearProjectPhotos(data.project_id);
        resolve();
      }catch(e){
        _logger.error(_self._fileName, 'clearOfflineVisits',e);
        reject(e);
      }
		});
  }

  storeOfflineVisit(project_id,data){
    _logger.info(_self._fileName, `storeOfflineVisit(${project_id})`,data);
    var ofVisits = _self.getOfflineVisits(project_id);
    if(ofVisits){
      ofVisits.push(data);
      if(_self.options.visited_spots_layer && typeof data.selectedGeomString!="undefined"){
        //add feauture to map and store on visited spots layers
        _self.storeVisitedSpot(project_id,data.selectedGeomString);
      }
    }else{
      ofVisits = [data];
    }
    _storage.setItem(`bmaps_${project_id}_visits`,JSON.stringify(ofVisits));
  }

  dumpOfflineVisits(data){
    _logger.info(_self._fileName, 'dumpOfflineVisits',data);
    return new Promise((resolve, reject) => {
      try{
        _self.options.project_id = data.project_id;
        let ofVisits = _self.getOfflineVisits(_self.options.project_id);
        if(ofVisits.length>0){
          if(ofVisits[0].type==='data'){
            _self._insertNextVisit(ofVisits[0]);
          }else{
            _self._uploadPhoto(ofVisits[0]);
          }
        }else{
          _events.emit("offlineEvent","dumpData",{"text":"no visits to dump"});
        }
        resolve();
      }catch(e){
        _logger.error(_self._fileName, 'dumpOfflineVisits',e);
        reject(e);
      }
		});
  }

  _insertNextVisit(data){
    _logger.info(_self._fileName, '_insertNextVisit',data);
    if(data.type==='file'){
      _self._uploadPhoto(data);
    }else{
      _events.emit("offlineEvent","dumpData",{"text":"InsertNextVisit"});
      data.dataToSend.token					= _self.options.token;
      axios.post(_self.options.baseHref+'/ajax.sewernet.php',   data.dataToSend).then(function (response) {
       _logger.success(_self._fileName, '_insertNextVisit response',response.data.message);
        if(response.data.status==="Accepted"){
          _self._updatePhotosVisitId(data.pol_id,data.id_name,response.data.message.body.feature.id);
          _self._udpateVisitIdAndRemoveVisit(data.pol_id,data.id_name,response.data.message.body.feature.id);
        }else{
          _logger.error(_self._fileName, '_insertNextVisit error',response.data.message);
          _events.emit("offlineEvent","dumpData",{"text":"UploadVisitsError"});
        }
      })
      .catch( (error) => {
        _logger.error(_self._fileName, '_insertNextVisit error',error);
        _events.emit("offlineEvent","dumpData",{"text":"UploadVisitsError"});
      });
    }
  }

  _udpateVisitIdAndRemoveVisit(pol_id,id_name,visit_id){
    _logger.info(_self._fileName, '_udpateVisitIdAndRemoveVisit',{'pol_id': pol_id,'id_name':id_name,'visit_id':visit_id});
    let ofVisits = _self.getOfflineVisits(_self.options.project_id);
    //remove first element
    ofVisits.shift();
    if(ofVisits.length>0){
      for(let i=0;i<ofVisits.length;i++){
        if(ofVisits[i].pol_id==pol_id && ofVisits[i].id_name==id_name){
          ofVisits[i].dataToSend.id = visit_id;
          _storage.setItem(`bmaps_${_self.options.project_id}_visits`,JSON.stringify(ofVisits));
          //reredend offline visited spots with updated data
          _self._renderOfflineVisitSpots();
          setTimeout(()=>{
            _self._insertNextVisit(ofVisits[i]);
          },500);
          break;
        }else{
          _storage.setItem(`bmaps_${_self.options.project_id}_visits`,JSON.stringify(ofVisits));
          setTimeout(()=>{
            _self._insertNextVisit(ofVisits[i]);
          },500);
        }
      }
    }else{
      _events.emit("offlineEvent","dumpData",{"text":"UploadVisitsDone"});
      //clear visited spots
      _self.clearVisitedSpots();
      //clear project photos
      _self._ClearProjectPhotos(_self.options.project_id);
      _storage.setItem(`bmaps_${_self.options.project_id}_visits`,JSON.stringify(ofVisits));

    }
  }

  //****************************************************************
  //***********************       PHOTOS      **********************
  //****************************************************************

  /*
    saveVisitPicture
      stores locally a photo

      @param data {JSON}
      @param preview {binary}
      @param fileName {string}

      @return {promise}
  */

  saveVisitPicture(data,preview,fileName,metaData){
    _logger.info(_self._fileName, 'saveVisitPicture',{'pol_id': data.pol_id,'id_name':data.id_name,'fileName':fileName,'metaData':metaData});
    return new Promise((resolve, reject) => {
      var temporalPhotoId 	= _self._addPhotoId();
      var photos 						= _self._getPhotos(_self.options.project_id);
      var newElement				= {
        'photo_id': temporalPhotoId,
        'pol_id': data.pol_id,
        'id_name': data.id_name,
        'visit_id': null,
        'hash': null,
        'metaData': metaData
      };
      photos.push(newElement);
      _storage.setItem(`bmaps_${_self.options.project_id}_photos`,JSON.stringify(photos));
      var returnData = {
        'status'	: "Accepted",
        'message'	: newElement,
        'code'		: 200
      };

      let compressedData = _storage.compress(preview);
      _storage.setTile(`photo_${temporalPhotoId}`,compressedData).then(()=>{
        _logger.success(_self._fileName, `Photo photo_${temporalPhotoId} successfully stored localForage`);
        _self.storeOfflineVisit(_self.options.project_id,{'pol_id':data.pol_id,'id_name':data.id_name,'tableName':data.tableName,'dataToSend':data,'type':'file','temporalId':temporalPhotoId,'fileName':fileName});
        resolve(`Photo photo_${temporalPhotoId} successfully stored localForage`);
      }).catch((e)=>{
        _logger.error(_self._fileName, `Photo photo_${temporalPhotoId} error storing localForage`,e);
        reject(e);
      });
    });
  }

  /*
    _uploadPhoto
      upload locally stored photo

      @param data {JSON}

      @return {promise}
  */

  _uploadPhoto(data){
    _logger.info(_self._fileName, '_uploadPhoto()',data);
    return new Promise((resolve, reject) => {
      let photo = _self._getPhoto(data.temporalId);
      let metaData = null;
      if(photo.hash!=null){
        if(typeof photo.metaData!='undefined'){
          metaData = photo.metaData;
        }
        //foto already uploaded
        var photosToSend = _formUtils.formatPhotoData(data.fileName,photo.hash,data.dataToSend.id,JSON.parse(data.dataToSend.deviceTrace),metaData);
        data.dataToSend.photos = JSON.stringify([photosToSend]);
        data.type='data';
        _self._insertNextVisit(data);
        resolve(photo.hash);
        return;
      }
      //1. Upload photo
      _storage.getTile(`photo_${data.temporalId}`).then((binary)=>{
        if(binary===null){
          _logger.error(_self._fileName, '_uploadPhoto() error, couldn\'t read photo data',binary);
          reject("Foto data is empty");
          return false;
        }
        var data2send = new FormData();
        data2send.append('what', "UPLOAD_PHOTO");
        data2send.append('token', _self.options.token);
        data2send.append('file', binary);
        data2send.append('metaData', metaData);

        axios.post(_self.options.baseHref+'/ajax.addPhoto.php',   data2send).then(function (response) {
         _logger.success(_self._fileName, '_uploadPhoto response',response.data.message);
          if(response.data.status==="Accepted"){
            //2. Delete local photo
            _self._removePhoto(`${data.temporalId}`).then(()=>{
              //3. update local foto dara with online hash (in case dump fails we'll need it)
              _self._updateOfflinePhoto(data.temporalId,response.data.message.photo_id);
              //4. create visit with file
              var photosToSend = _formUtils.formatPhotoData(data.fileName,response.data.message.photo_id,data.dataToSend.id,JSON.parse(data.dataToSend.deviceTrace),metaData);
              data.dataToSend.photos = JSON.stringify([photosToSend]);
              data.type='data';
              _self._insertNextVisit(data);
              resolve(response.data.message);
            }).catch((e)=>{
              reject(e);
            });
          }else{
            _logger.error(_self._fileName, '_uploadPhoto error',response.data.message);
            reject(response.data.message);
          }
        }).catch( (error) => {
          _logger.error(_self._fileName, '_uploadPhoto error',error);
          reject(e);
        });
      }).catch((e)=>{
        _logger.error(_self._fileName, '_uploadPhoto error getting stored image',e);
        reject(e);
      });
    });
  }

  _updateOfflinePhoto(photo_id,hash){
    _logger.info(_self._fileName, `_updateOfflinePhoto()`,{'photo_id':photo_id,'hash':hash});
    let photos_list = JSON.parse(_storage.getItem(`bmaps_${_self.options.project_id}_photos`));
    if(photos_list!=null){
      for(let i=0;i<photos_list.length;i++){
        if(photos_list[i].photo_id===photo_id){
          photos_list[i].hash = hash;
          break;
        }
      }
    _storage.setItem(`bmaps_${_self.options.project_id}_photos`,JSON.stringify(photos_list));
    }
  }

  _getPhotos(project_id){
    _logger.info(_self._fileName, `_getPhotos(${project_id})`);
    let photos_list 			= JSON.parse(_storage.getItem(`bmaps_${_self.options.project_id}_photos`));
    if(photos_list===null){
      photos_list = Array();
    }
    return photos_list;
  }

  _getPhoto(photo_id){
    let photos_list = JSON.parse(_storage.getItem(`bmaps_${_self.options.project_id}_photos`));
    if(photos_list!=null){
      for(let i=0;i<photos_list.length;i++){
        if(photos_list[i].photo_id===photo_id){
          return photos_list[i];
        }
      }
    }
  }

  _addPhotoId(){
    _logger.info(_self._fileName, '_addPhotoId()');
    let id 	= _self._getPhotoId();
    if(id===null){
      id = 1;
    }else{
      id 			= id+1;
    }
    _storage.setItem('bmaps_photo_id',parseInt(id));
    return id;
  }

  _getPhotoId(){
    _logger.info(_self._fileName, '_getPhotoId()');
    let id = _storage.getItem('bmaps_photo_id');
    if(id===null){
      _logger.info(_self._fileName, '_getPhotoId() not id stored()');
      _storage.setItem('bmaps_photo_id',1);
      return 0;
    }else{
      _logger.info(_self._fileName, `_getPhotoId() last id stored ${id}`);
      return parseInt(id);
    }
  }

  _ClearProjectPhotos(project_id){
    _logger.info(_self._fileName, `_ClearPhotos${project_id}`);
    let ofPhotos = _self._getPhotos(project_id);
    for(var i=0;i<ofPhotos.length;i++){
      _self._removePhoto(ofPhotos[i].photo_id);
    }

  }

  _removePhoto(photo_id){
    _logger.info(_self._fileName, '_removePhoto',{'photo_id': photo_id});
    return new Promise((resolve, reject) => {
      _storage.removeTile("photo_"+photo_id).then(()=>{
        _logger.success(_self._fileName, `removed photo_${photo_id} from localForage`);
        //remove photo from list
        var currentPhotos = _self._getPhotos(_self.options.project_id);
        for(var i=0;i<currentPhotos.length;i++){
          if(`photo_${currentPhotos[i].photo_id}`===photo_id){
            currentPhotos.splice(i,1);
          }
        }
        _storage.setItem(`bmaps_${_self.options.project_id}_photos`,JSON.stringify(currentPhotos));
        resolve();
      }).catch((e)=>{
        _logger.error(_self._fileName, `Photo photo_${photo_id} error removing from localForage`,e);
        reject();
      });
    });
  }

  _updatePhotosVisitId(pol_id,id_name,visit_id){
    _logger.info(_self._fileName, '_updatePhotosVisitId',{'pol_id': pol_id,'id_name':id_name,'visit_id':visit_id});
    var ofPhotos 	= _self._getPhotos(_self.options.project_id);
    if(ofPhotos.length>0){
      for(let i=0;i<ofPhotos.length;i++){
        if(ofPhotos[i].pol_id==pol_id && ofPhotos[i].id_name==id_name){
          ofPhotos[i].visit_id = visit_id;
        }
      }
      _storage.setItem(`bmaps_${_self.options.project_id}_photos`,JSON.stringify(ofPhotos));
    }
  }
  //****************************************************************
  //*********************     END PHOTOS      **********************
  //****************************************************************

  storeDownloadDate(){
    _logger.info(_self._fileName, 'storeDownloadDate',{});
    _storage.setItem(`bmaps_${_self.options.project_id}_lastDownload`,new Date().addHours(_self.options.off_download_data_ttl).toString());
  }




    /*



    //try to insert visit in DB and get real visit ID
    function InsertNextVisit(visit,_visit_events){
      log("InsertNextVisit("+visit+")","info",_visit_events);
      $rootScope.$broadcast('offlineEvent',{evt:"dumpData",text:"InsertNextVisit"});
      var ve					= _visit_events;
      ajaxMethodForVisit(ajax_target,visit.epsg,visit.pol_id,visit.coordinates,visit.layer,function(e,data){
        //remove visit from local storage
        removeVisit(visit.temporalId,function(){
          log("removeVisit("+visit.temporalId+") OK","success");
        },function(){
          log("removeVisit("+visit.temporalId+") KO","warn");
        });
        for(var e=0;e<ve.length;e++){
          //updates events visit id with real id (the one that cames from DB)
          updateEvent(ve[e],'visit_id',data.visit_id);
          //update photos id_visit
          updatePhotovisitId(ve[e].temporalEventId,data.visit_id);
        }

        var visit_events = getVisitEvents(data.visit_id);
        log("InsertNextVisit, initiate photos uploading in 1s","info");
        setTimeout(function(){
          if(visit_events.length>0){
            //inserts events in DB
            InsertNextEvent(data.visit_id);
          }
        },1000);
      },function(msg,data){
        log("InsertNextVisit :"+msg,"error",data);
      });
    }





     */


  /*function checkPreviousVisit(element_id,layer){
    log("checkPreviousVisit("+element_id+","+layer+")","info")
    var visits 			= mapStorage.getItem(storeName+'_visits');
    var exists			= false;
    if(visits){
      //check previous visits
      var parsedVisits = JSON.parse(visits);
      for(var i=0;i<parsedVisits.length;i++){
        var item = parsedVisits[i];
        if(item['temporalId']===layer+":"+element_id){
          exists 	= true;
          break;
        }
      }
    }
    return exists;
  }*/

  //******************    end checkPreviousVisit  ******************
/*	function setEventId(id){
    log("setEventId("+id+")","info");
    _storage.setItem(`bmaps_${_options.project_id}_ov_${response.table}`,JSON.stringify(res));
    mapStorage.setItem(storeName+'_event_id',parseInt(id));
  }

  function getEventId(){
    log("getEventId()","info");
    var id = mapStorage.getItem(storeName+'_event_id');
    if(id===null){
      log("getEventId() not id stored","info");
      mapStorage.setItem(storeName+'_event_id',1);
      return 0;
    }else{
      log("getEventId() last id stored: "+id,"info");
      return parseInt(id);
    }
  }*/

}
  Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
  };
