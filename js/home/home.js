/* jshint esversion: 6 */
import {EventEmitter} from 'events';
import axios from 'axios';
import VisitsOffline from '../offline/visits_offline';
import Offline from '../offline/offline';
import RichLogger from '../src/richLogger';
import {version} from './package';
let _self = null,
  _events = null,
  _options = null,
  _logger = null;

let _offline = null;
export default class Home extends EventEmitter{
  constructor(options) {
    super();
    if (typeof options === 'undefined') {
      throw new TypeError('no data');
    }
    if (typeof options.baseHref === 'undefined') {
      throw new TypeError('no options baseHref');
    }
    if (typeof options.user_id === 'undefined') {
      throw new TypeError('no options user_id');
    }
    if (typeof options.useOffline === 'undefined') {
      options.useOffline = 0;
    }
    if (typeof options.env === 'undefined') {
      options.env = 'prod';
    }
    _self = this;
    _events = EventEmitter;
    _self._fileName = 'home.js';
    _options = options;
    _logger = new RichLogger(options.env, {});
    _offline = new Offline(options,_self);
    options.visited_spots_layer = 0; //no visited spots layer!!
    _logger.info(_self._fileName, `Module loaded v.${version}`,options);
  }

  loadUserProjects(){
    return new Promise((resolve, reject) => {
      const dataToSend = {};
      dataToSend.what = 'GET_USER_PROJECTS';
      dataToSend.token = _options.token;
      if (navigator.onLine) {
        _logger.info(_self._fileName, 'try ONLINE loadUserProjects');
        axios.post(`${_options.baseHref}/ajax.home.php`, dataToSend).then((response) => {
          _logger.success(_self._fileName, 'loadUserProjects', response.data);
          let projects = _self._processUserProjects(response.data.message);
          resolve({'status': response.data.status, 'message': projects});
          if (response.data.status === 'Accepted' && _options.useOffline===1) {
            //store projects for offline use
            try {
              _offline.setStoredProjects(_options.user_id, JSON.stringify(response.data.message));
            } catch (er) {
              _logger.error(_self._fileName, 'loadUserProjects error storing user projects', er);
            }
          }
        }).catch((error) => {
          _logger.error(_self._fileName, 'loadUserProjects', error);
          reject({'status': 'Failed', 'message': error});
        });
      }else{
        var offlinePro = _offline.getStoredProjects(_options.user_id);
        _logger.info(_self._fileName, 'try OFFLINE loadUserProjects',`user_projects_${_options.user_id}`,offlinePro);
        if(offlinePro){
          resolve({'status': 'Accepted', 'message': JSON.parse(offlinePro)});
        }else{
          reject({'status': 'Failed', 'message': {'msg': 'No stored projects' }});
        }
      }
    });
  }

  _processUserProjects(projects){
    for(var i=0;i<projects.length;i++){
      //get offline visits
     if(_options.useOffline){
        projects[i].offlineVisits = _offline.getOfflineVisits(projects[i].project_id).length;
     }else{
        projects[i].offlineVisits = 0;
      }
    }
    return projects;
  }

  dumpOfflineVisits(item){
    _logger.info(_self._fileName, 'dumpOfflineVisits',item);
    return new Promise((resolve, reject) => {
      _offline.closeLocalforage();
      _offline.initLocalForage({'storeName':`bmaps_${item.project_id}`,'localForageVersion':_options.localForageVersion});
      var dataToSend = {};
      dataToSend.what	= 'SET_CURRENT_PROJECT';
      dataToSend.token = _options.token;
      dataToSend.project_id = item.project_id;
      axios.post(_options.baseHref+'/ajax.sewernet.php',   dataToSend).then(function (response) {
       _logger.success(_self._fileName, 'dumpOfflineVisits SET_CURRENT_PROJECT',response.data.message);
        return _offline.dumpOfflineVisits({'project_id':item.project_id}).then((msg)=>{
          resolve(msg);
        }).catch( (error) => {
          _logger.error(_self._fileName, 'dumpOfflineVisits error',error);
          reject(error);
        });
      })
      .catch( (error) => {
        _logger.error(_self._fileName, 'dumpOfflineVisits error',error);
        reject(error);
      });
    });
  }

  getLocalizedStrings(){
    return new Promise((resolve, reject) => {
      const dataToSend = {};
    	var localized_strings	= {};
      dataToSend.token = _options.token;
      if (navigator.onLine) {
        _logger.info(_self._fileName, 'try ONLINE getLocalizedStrings');
        axios.post(`${_options.baseHref}/ajax.strings.php`, dataToSend).then((response) => {
          _logger.success(_self._fileName, 'getLocalizedStrings', response.data);
          for(var i=0;i<response.data.message.length;i++){
            var key 	= Object.keys(response.data.message[i])[0];
            var value = Object.values(response.data.message[i])[0];
            localized_strings[key] = value;
          }
          resolve({'status': response.data.status, 'message': localized_strings});
        }).catch((error) => {
          _logger.error(_self._fileName, 'getLocalizedStrings', error);
          reject('projects', {'status': 'Failed', 'message': error});
        });
      }else{
        _logger.info(_self._fileName, 'try OFFLINE getLocalizedStrings');
        var offlinestrings = _offline.getStrings(117);
  			if(offlinestrings){
  				//send strings to controller
  				 //esolve({'status': response.data.status, 'message': projects});
  			}
      }
    });
  }
}
window.Home = Home;
