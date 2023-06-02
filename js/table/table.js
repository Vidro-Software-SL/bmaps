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

export default class Table extends EventEmitter{
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
    _self._fileName = 'table.js';
    _options = options;
    _logger = new RichLogger(options.env, {});
    _paginator = new Paginator(options,_logger);
    _logger.info(_self._fileName, `Module loaded v.${version}`,options);
    var db_table = _self.getParameterByName('table');
    var pol_id = _self.getParameterByName('pol_id');
    var id_name = _self.getParameterByName('id_name');
    if(db_table){
      setTimeout(()=>{
        _self.emit('table',{'evt': 'tableOnQuery','db_table':db_table,'pol_id':pol_id,'id_name':id_name});
      },100);
    }
  }

  getProjectInfo(project_id){
    return new Promise((resolve, reject) => {
      const data2send = {};
      data2send.what = "GET_PROJECT_INFO";
      data2send.project_id	= project_id;
      data2send.token = _options.token;
      _logger.info(_self._fileName, 'getProjectInfo',project_id);
      axios.post(`${_options.baseHref}/ajax.projects.php`, data2send).then((response) => {
        _logger.success(_self._fileName, 'getProjectInfo', response.data);
        if(response.data.status==='Accepted'){
          resolve(response.data.message);
        }else{
          reject(response.data.message);
        }
      }).catch((error) => {
        _logger.error(_self._fileName, 'getProjectInfo', error);
        reject('projects', {'status': 'Failed', 'message': error});
      });
    });
  }

  getUserProjectPermissions(project_id){
    return new Promise((resolve, reject) => {
      const data2send = {};
      data2send.what			= "GET_USER_PERMISSIONS";
      data2send.project_id	= project_id;
      data2send.token = _options.token;
      _logger.info(_self._fileName, 'getUserProjectPermissions',project_id);
      axios.post(`${_options.baseHref}/ajax.projects.php`, data2send).then((response) => {
        _logger.success(_self._fileName, 'getUserProjectPermissions', response.data);
        if(response.data.status==='Accepted'){
          resolve(response.data.message);
        }else{
          reject(response.data.message);
        }
      }).catch((error) => {
        _logger.error(_self._fileName, 'getUserProjectPermissions', error);
        reject({'status': 'Failed', 'message': error});
      });
    });
  }

  getTable(db_table,project_id, page,filters,order){
    return new Promise((resolve, reject) => {
      //calculate offset
      var offset = 0;
      if(page>0){
        offset = _paginator.getOffset(page);
      }
      const data2send = {};
      data2send.what = "GET_TABLE";
      data2send.db_table = db_table;
      data2send.project_id = project_id;
      data2send.offset = offset;
      data2send.field = filters.field;
      data2send.value = filters.value;
      if(order){
        data2send.order = order.key;
        data2send.sort = order.sort;
      }
      data2send.limit = _options.limit;
      data2send.token = _options.token;
      _logger.info(_self._fileName, 'getTable',{'project_id': project_id,'db_table': db_table, 'page': page, 'filters': filters,'order':order});
      axios.post(`${_options.baseHref}/ajax.table.php`, data2send).then((response) => {
        _logger.success(_self._fileName, 'getTable', response.data);
        if(response.data.status==='Accepted'){
          response.data.message.numberOfPages = response.data.message.totalPages;
          resolve(response.data.message);
        }else{
          reject(response.data.message);
        }
      }).catch((error) => {
        _logger.error(_self._fileName, 'getTable', error);
        reject({'status': 'Failed', 'message': error});
      });
    });
  }

  //****************************************************************
  //************              EXPORT TO CSV        *****************
  //****************************************************************

  convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ',';
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }

  exportCSVFile(headers, items, fileTitle) {
    return new Promise((resolve, reject) => {
      //add headers
      if (headers) {
        items.unshift(headers);
      }
      // Convert Object to JSON
      var jsonObject = JSON.stringify(items);
      var csv = this.convertToCSV(jsonObject);
      var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        }
      }
    });
  }

  //****************************************************************
  //************           END EXPORT TO CSV       *****************
  //****************************************************************

  //****************************************************************
  //************                HELPERS            *****************
  //****************************************************************

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
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
window.Table = Table;
