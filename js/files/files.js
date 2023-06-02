/* jshint esversion: 6 */
import {EventEmitter} from 'events';
import axios from 'axios';
import RichLogger from '../src/richLogger';
import Paginator from '../src/paginator';
import {version} from './package';
let _self = null,
  _events = null,
  _options = null,
  _paginator = null,
  _logger = null;

export default class Files extends EventEmitter{
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
    if (typeof options.limit == 'undefined') {
      options.limit = 10;
    }
    if (typeof options.env === 'undefined') {
      options.env = 'prod';
    }
    _self = this;
    _events = EventEmitter;
    _self._fileName = 'files.js';
    _options = options;
    _logger = new RichLogger(options.env, {});
    _paginator = new Paginator(options,_logger);
    _logger.info(_self._fileName, `Module loaded v.${version}`,options);
  }

  getProjectFiles(project_id,page){
    return new Promise((resolve, reject) => {
      const data2send = {};
      //calculate offset
      var offset = 0;
      if(page>0){
        offset = _paginator.getOffset(page);
      }
      data2send.what = "GET_PROJECT_FILES";
      data2send.project_id = project_id;
      data2send.offset = offset;
      data2send.limit = _options.limit;
      data2send.token = _options.token;
      data2send.to = _options.to;
      data2send.from = _options.from;
      _logger.info(_self._fileName, 'getProjectFiles',project_id);
      axios.post(`${_options.baseHref}/ajax.files.php`, data2send).then((response) => {
        _logger.success(_self._fileName, 'getProjectFiles', response.data);
        if(response.data.status==='Accepted'){
          response.data.message.numberOfPages = _paginator.numberOfPages(response.data.message.total,_options.limit);
          //response.data.message.numberOfPages = response.data.message.total;
          resolve(response.data.message);
        }else{
          reject(response.data.message);
        }
      }).catch((error) => {
        _logger.error(_self._fileName, 'getProjectFiles', error);
        reject({'status': 'Failed', 'message': error});
      });
    });
  }

  deleteFile(item,id){
    return new Promise((resolve, reject) => {
      const data2send = {};
      data2send.what = "DELETE_FILE";
      data2send.token = _options.token;
      data2send.attachedTo = item.attachedTo;
      data2send.id = id;
      data2send.hash = item._id.$oid;
      data2send.info_type = 100;
      data2send.device = 1;
      _logger.info(_self._fileName, 'deleteFile',{'item':item,'data2send':data2send});
      axios.post(`${_options.baseHref}/ajax.files.php`, data2send).then((response) => {
        _logger.success(_self._fileName, 'deleteFile', response.data);
        if(response.data.status==='Accepted'){
          resolve(response.data.message);
        }else{
          reject(response.data.message);
        }
      }).catch((error) => {
        _logger.error(_self._fileName, 'deleteFile', error);
        reject({'status': 'Failed', 'message': error});
      });
    });

  }
  //****************************************************************
  //************                HELPERS            *****************
  //****************************************************************

  setDates(from,to){
    _logger.info(_self._fileName, 'setDates',{'from':from,'to':to});
    _options.from = from;
    _options.to = to;
  }

  getFileType(string) {
  //  _logger.info(_self._fileName, 'getFileType');
    try{
      let type = string.split(';')[0].split('/')[1];
      switch (type) {
        case 'png':
        case 'jpg':
        case 'gif':
        case 'jpeg':
          return "image";
        default:
          return "file";
      }
    }catch(e){
      return null;
    }
  }

  fileToBase64(file){
    _logger.info(_self._fileName, 'fileToBase64',{'file': `${_options.baseHref}${file}`});
     return new Promise((resolve, reject) => {
        axios.get(`${_options.baseHref}${file}`,{responseType: 'blob'}).then(function(result) {
          var reader = new FileReader();
          reader.readAsDataURL(result.data);
          reader.onloadend = function() {
             var base64data = reader.result;
             resolve(base64data);
          };
       }).catch((e)=>{
         reject(e);
       });
     });
  }
  showThumb(hash){
    _logger.info(_self._fileName, 'showThumb',{'hash': hash});
    var noCache = Math.floor((Math.random() * 100) + 1);
    return axios.get(`${_baseHref}external.thumb.php?img=${hash}&noCache=${noCache}`).then(function(result) {
      return result.data;
    });
  }
  setLimit(limit){
    _options.limit = limit;
  }

  getLimit(){
    return _options.limit;
  }
  //****************************************************************
  //************            END HELPERS            *****************
  //****************************************************************

}
window.Files = Files;
