/* jshint esversion: 6 */
import {EventEmitter} from 'events';
import RichLogger from '../src/richLogger';
import MapStorage from './mapStorage';
import VisitsOffline from './visits_offline';
import {version} from './package';

let _self = null,
  _events = null,
  _strings = [],
  _offlineLogin = false,
  _logger = null;
//modules
let _storage = null,
_visitOffline = null;
export default class Offline extends EventEmitter {

  constructor(options,events) {
    super();
    if (typeof options === 'undefined') {
      throw new TypeError('no data');
    }
    if (typeof options.baseHref === 'undefined') {
      throw new TypeError('no options baseHref');
    }
    if (typeof options.env === 'undefined') {
      options.env = 'prod';
    }
    if (typeof options.offlineLogin !== 'undefined') {
      _offlineLogin = options.offlineLogin;
    }
    if (typeof events != 'undefined') {
      _events = events;
    }else{
      _events = EventEmitter;
    }
    if (typeof options.localForageVersion === 'undefined') {
      throw new TypeError('no options localForageVersion');
    }
    _logger = new RichLogger(options.env, {});
    _self = this;
    _self._version = version;
    _self._fileName = 'offline.js';
    _self.options = options;
    if (typeof options.strings !== 'undefined') {
      _strings = options.strings;
    }
    _logger.info(_self._fileName, `Module loaded v.${ _self._version}`);
    _storage = new MapStorage(options,_events,_logger);
    options.storage = _storage;
    _visitOffline = new VisitsOffline(options,_events,_logger);
  }

  //****************************************************************
  //*********************         INFO        **********************
  //****************************************************************

  getOfflineInfo(){
    _logger.info(_self._fileName, 'getOfflineInfo()');
    return new Promise((resolve, reject) => {
      var stored_keys = [];
      var stored_credentials = [];
      var stored_projects = [];
      var stored_project_data = [];
      _self.checkServiceWorker();
      for (var key in localStorage){
        var value = null;
        if(key.includes('stored_date')){
          value = _self.formatDate(_storage.getItem(key));
          stored_keys.push({'key': key, 'value': value});
        }else if(key.includes('offlineLogin_')){
          //find offline login credentials
          var cred = JSON.parse(_storage.getItem(key));
          stored_credentials.push({'email': cred.email, 'key': key});
        }else if(key.includes('bmaps_')){
          //find offline project info
          //find project id
          var processKey = key.split('bmaps_');
          var project_id = processKey[1].split('_');
          let pIkey = `bmaps_${project_id[0]}_projectInfo`;
          let alias = _self.getStoredProjectAlias(pIkey);
          var index = stored_projects.indexOf(`${alias} - ${project_id[0]}`);
          if(index===-1){
            stored_projects.push(`${alias} - ${project_id[0]}`);
            stored_project_data.push([{'pretty': project_id[1], 'key': processKey}]);
          }else{
            var stored_pr = stored_project_data[index];
            stored_pr.push({'pretty': project_id[1], 'key': processKey});
          }
        }
      }

      _storage.localStorageSpace().then((response)=>{
        var data = {
          'totalUsed':  `${response.totalUsed} Mb`,
          'usedPercentage': response.usedPercentage,
          'indexDbUsedMb': `${response.indexDbUsedMb} Mb`,
          'localStorageUsed': `${response.localStorageUsed} Mb`,
          'stored_keys': stored_keys,
          'stored_credentials': stored_credentials,
          'stored_projects': stored_projects,
          'stored_project_data': stored_project_data,
          'stored_cookie': _storage.getItem('tocCookie')
        };
        _logger.info(_self._fileName, 'getOfflineInfo() result',data);
        resolve(data);
      }).catch((e)=>{
        _logger.error(_self._fileName, 'getOfflineInfo() error',e);
        reject(e);
      });
    });
  }

  getStoredProjectAlias(key){
    _logger.info(_self._fileName, 'getStoredProjectAlias',key);
    try{
      var pI = JSON.parse(_storage.getItem(key));
      return pI.alias;
    }catch(e){
      return "Not detected";
    }
  }

  deleteProject(item){
    _logger.info(_self._fileName, 'deleteProject',item);
    //fin project ID
    var id = item.split(' - ');
    for (var key in localStorage){
      if(key.includes(`bmaps_${id[1]}`)){
        _storage.removeItem(key);
      }
    }
  }

  getOfflineVisits(item){
    _logger.info(_self._fileName, 'getOfflineVisits',item);

    return _visitOffline.getOfflineVisits(item);
  }

  dumpOfflineVisits(data){
    _logger.info(_self._fileName, 'dumpOfflineVisits',data);
    return _visitOffline.dumpOfflineVisits(data);
  }

  //****************************************************************
  //*********************      END INFO        *********************
  //****************************************************************

  //****************************************************************
  //*****************      SERVICE WORKER      *********************
  //****************************************************************

  checkServiceWorker(){
    _logger.info(_self._fileName, 'checkServiceWorker()');
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
          console.log(registrations);
          for(let registration of registrations) {
            if(registration.scope===_self.getBaseUrl()){
              _self.emit('offline',{'evt': 'serviceWorker','msg':true});
              break;
            }
           }
      });
    }
  }

  removeServiceWorker(){
    _logger.info(_self._fileName, 'removeServiceWorker()');
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
      }
    });
    _storage.clearCacheStorage(_self.options.cacheVersion);
  }

  //****************************************************************
  //*****************    END SERVICE WORKER     *********************
  //****************************************************************

  //****************************************************************
  //***********************        RESET      **********************
  //****************************************************************

  offlineReset(){
    _logger.info(_self._fileName, 'offlineReset()');
    _storage.clearIndexedDb();
    _storage.clearLocalStorage();
    _storage.resetFileSystem();
    _storage.clearCacheStorage(_self.options.cacheVersion);
    _self.removeServiceWorker();
  }


  //****************************************************************
  //***********************        RESET      **********************
  //****************************************************************

  //****************************************************************
  //***********************     PROJECTS      **********************
  //****************************************************************

  getStoredProjects(user_id){
    _logger.info(_self._fileName, 'getStoredProjects',user_id);
    return _storage.getItem(`user_projects_${user_id}`);
  }

  setStoredProjects(user_id,projects){
    _logger.info(_self._fileName, 'setStoredProjects',{'user_id': user_id, 'projects': projects});
    return _storage.setItem(`user_projects_${user_id}`,projects);
  }

  //****************************************************************
  //********************      END PROJECTS      ********************
  //****************************************************************

  //****************************************************************
  //***********************     STRINGS      **********************
  //****************************************************************

  setStrings(strings){
    _logger.info(_self._fileName, 'setStrings()',strings);
    _strings = strings;
  }

  getStrings(project_id){
    _logger.info(_self._fileName, 'getStrings()',project_id);
    return {'strings':JSON.parse(_storage.getItem(`bmaps_${project_id}_strings`))};
  }

  //****************************************************************
  //********************      END STRINGS       ********************
  //****************************************************************

  //****************************************************************
  //********************          HELPERS      *********************
  //****************************************************************

  formatDate(stringDate){
    var newfecha   = new Date(Date.parse(stringDate));
    return newfecha.getDay()+"/"+newfecha.getMonth()+"/"+newfecha.getYear()+" "+newfecha.getHours()+":"+newfecha.getMinutes();
  }

  removeItem(item){
    _logger.info(_self._fileName, 'removeItem()',item);
    return _storage.removeItem(item);
  }

  storeItem(item,value){
    _logger.info(_self._fileName, 'storeItem()',{'item': item, 'value': value});
    return _storage.setItem(item,value);
  }

  closeLocalforage(){
    _logger.info(_self._fileName,"closeLocalforage()");
    return _storage.closeLocalforage();
  }

  initLocalForage(options){
    _logger.info(_self._fileName,"initLocalForage()",options);
    return _storage.initLocalForage(options);
  }

  getBaseUrl(){
    var getUrl = window.location;
    var path   =  getUrl.pathname.split('/');
    var pathForDirectives = "";
    for(var i=0;i<path.length-1;i++){
      if(path[i]!=""){
        pathForDirectives = pathForDirectives+'/'+path[i];
      }
    }
    return getUrl .protocol + "//" + getUrl.host + "" + pathForDirectives+'/';
  }
  //****************************************************************
  //***********************    END HELPERS    **********************
  //****************************************************************
}


window.Offline = Offline;
