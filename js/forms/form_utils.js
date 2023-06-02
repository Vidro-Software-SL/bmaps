/* jshint esversion: 6 */

import RichLogger from '../src/richLogger';
let _self = null,
  _version = '1.0.0',
  _events = null,
  _logger = null;


export default class FormUtils {

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

    _self = this;
    _self._fileName = 'form_utils.js';
    _self.options = options;
    _logger.info(_self._fileName, `Module loaded v.${_version}`,options);
  }

  /*
    formatPhotoData
      used in visits v.2, creates json for api insertion

    @param fileName
    @param photo_id
    @param visit_id
    @param deviceTrace

    @return JSON
   */
  formatPhotoData(fileName,photo_id,visit_id,deviceTrace,metaData){
    _logger.info(_self._fileName, 'formatPhotoData()',{'fileName': fileName,'photo_id':photo_id,'visit_id':visit_id,'deviceTrace':deviceTrace,'metaData': metaData});
    let processedName = fileName.split('\\').pop();
    let idval 				= processedName.replace(/^.*[\\\/]/, '');
    idval 						= idval.split('.');
    let fextension		= processedName.substr(processedName.lastIndexOf('.') + 1);
    let link 					=	`${_self.options.baseHref}external.image.php?img=${photo_id}`;
    return {
        'photo_url':`${_self.options.baseHref}external.image.php?img=`,
        'hash': photo_id,
        'visit_id': visit_id,
        'fextension': fextension,
        'metaData': metaData
    };
  }

  /***
    assignValuesToCombo
      formats data for form combo component

      @param object<object>

      @return <json>

  ***/

  assignValuesToCombo(object){
    let comboValues = Array();
    try{
      for(let i=0;i<object.comboIds.length;i++){
        comboValues.push({id:object.comboIds[i],name:object.comboNames[i]});
      }
      return comboValues;
    }catch(e){
      _logger.error(_self._fileName, '_assignValuesToCombo error formatting combo',e.message);
      return false;
    }
  }

  getActiveTab(tabs){
    if(tabs.length>0){
      for(let i=0;i<tabs.length;i++){
        if(tabs[i].active){
          return i;
        }
      }
    }
  }
}
