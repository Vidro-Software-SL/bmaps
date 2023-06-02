/* jshint esversion: 6 */
import RichLogger from '../src/richLogger';
import axios from 'axios';
import FormUtils from './form_utils';
let _self = null,
  _version = '1.0.0',
  _token = null,
  _events = null,
  _device = null,
  _logger = null;
let _tabs = null;
let _formUtils = null;//form utils module

export default class MultiUpdate {
  constructor(options) {
    if (typeof options === 'undefined') {
      throw new TypeError('no data');
    }
    if (typeof options.baseHref === 'undefined') {
      throw new TypeError('no options baseHref');
    }
    if (typeof options.token === 'undefined') {
      throw new TypeError('no token');
    }
    if (typeof options.device === 'undefined') {
      throw new TypeError('no device');
    }
    _token = options.token;
    _device = options.device;
    _logger = new RichLogger(options.env);
    _self = this;
    _self._fileName = 'multiupdate.js';
    _self.options = options;
    _formUtils = new FormUtils(options,_self,_logger);
    _logger.info(_self._fileName, `Module loaded v.${_version}`,options);
  }

	/**
    getmultiupdate


      @param  <int>
      @param  <string> geom string

   **/

   getmultiupdate(ids,info_type,db_table){
     _logger.info(_self._fileName, `getmultiupdate()`,{'ids':ids,'device':_device,'info_type':info_type,'db_table':db_table});
     return new Promise((resolve, reject) => {
       let dataToSend = {};
       dataToSend.token = _token;
       dataToSend.device = _device;
       dataToSend.ids = ids;
       dataToSend.info_type = info_type;
       dataToSend.db_table = db_table;
       dataToSend.what = 'GET_MULTI_UPDATE';
       let retorno = {};

       _self._sendRequest(dataToSend,'getmultiupdate').then((response)=>{


         _tabs = response.formTabs;
         //sets activce tab
         let activeTabIndex	= _formUtils.getActiveTab(response.formTabs);
         retorno.activeTab = response.formTabs[activeTabIndex];
         retorno.activeTab.activeTabIndex	= activeTabIndex;
         for(let i=0;i<response.formTabs.length;i++){
           if(typeof response.formTabs[i].fields!="undefined"){
             for(let f=0;f<response.formTabs[i].fields.length;f++){
               if(response.formTabs[i].fields[f]){
                 if(response.formTabs[i].fields[f].type==="combo"){
                   response.formTabs[i].fields[f].comboValues   = _formUtils.assignValuesToCombo(response.formTabs[i].fields[f]);
                 }
               }
             }
           }
         }
         retorno = response.formTabs;
         resolve(retorno);
       }).catch((e)=>{
         reject(e);
       });
     });
  }

   /**
     setmultiupdate
       @param  <int>
       @param  <string> geom string

    **/

    setmultiupdate(ids,db_table,idName,formData,info_type){
      _logger.info(_self._fileName, `setmultiupdate()`,{'formData':formData,'ids':ids,'info_type':info_type,'db_table':db_table,'idName':idName});
      let dataToSend = {};
      dataToSend.token = _token;
      dataToSend.device = _device;
      dataToSend.ids = ids;
      dataToSend.info_type = info_type;
      dataToSend.db_table = db_table;
      //dynamic attributes
  		for (var k in formData) {
  			if(k){
  				if (formData.hasOwnProperty(k)) {
  					if(formData[k]!=""){
  						dataToSend[k] = formData[k];
  					}else if(formData[k]===0){
  						dataToSend[k] = "0";
  					}
  				}
  			}
  		}
      dataToSend.idName = idName;
      dataToSend.what = 'SET_MULTI_UPDATE';
      return _self._sendRequest(dataToSend,'setmultiupdate');
    }

   //****************************************************************
   //********************          HELPERS      *********************
   //****************************************************************

   _sendRequest(dataToSend,action){
     _logger.info(_self._fileName, `_sendRequest(${action})`,dataToSend);
     return new Promise((resolve, reject) => {
       axios.post(_self.options.baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
         _logger.success(_self._fileName, `_sendRequest(${action})`,response.data);
         if(response.data.status==="Accepted"){
           resolve(response.data.message);
         }else{
           reject(response.data.message);
         }
       })
       .catch( (error) => {
         _logger.error(_self._fileName, `_sendRequest(${action})`,error);
         reject(error);
       });
     });
   }

   //****************************************************************
   //***********************    END HELPERS    **********************
   //****************************************************************
}
