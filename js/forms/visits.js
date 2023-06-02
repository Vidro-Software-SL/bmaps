/*jshint esversion: 6 */
import MapStorage from '../offline/mapStorage';
import VisitsOffline from '../offline/visits_offline';
import RichLogger from '../src/richLogger';
import FormUtils from './form_utils';
(function() {
'use strict';
	const util						  = require('util');
	const _events					  = require('events').EventEmitter;
  const axios             = require('axios');
	const parser 						= require('xml-js');
	let _version 						= "1.2.0";
	let _self;
	let _token;
	let _baseHref;
	let _device;
	let _tabs               = null;
	let _expected_api_version;
	let _options 						= null;
	let _formUtils					= null;			//form utils module
	let _logger							= null;			//logger module
	let _storage						= null; 		//storage module
	let _visitOffline				= null;			//visits offline module

	util.inherits(Visits, _events);

	function Visits(options){
		_token 								= options.token;
		_baseHref							= options.baseHref;
		_device								= options.device;
		_expected_api_version	= options.expected_api_version
		_self    							= this;
		_options 							= options;
		_logger = new RichLogger(_options.env, {});
		_formUtils = new FormUtils(_options,_self,_logger);
		setTimeout(function(){
			_self.emit("log","visits.js","Visits v."+_version+" loaded","success",_options);
		},500);
	}

	function setToken(token){
		_token = token;
	}
	//****************************************************************
	//******************           VISIT         *********************
	//****************************************************************

	function getVisitsFromFeature(layer,pol_id,id_name,options,cb){
		_self.emit("log","visits.js","getVisitsFromFeature("+layer+","+pol_id+")","info",options);
		try{
			let dataToSend 				= {};
			dataToSend.layer			= layer
			dataToSend.device			= _device;
			dataToSend.pol_id			= pol_id;
			dataToSend.id_name		= id_name;
			//remove timezone from filters
			if(options){
				var date 							= options.visit_start;
				var utcDate 					= new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
				options.visit_start 	= utcDate;
				date 									= options.visit_end;
				utcDate 							= new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
				options.visit_end 		= utcDate;
				dataToSend.options		= JSON.stringify(options);
			}
			dataToSend.token			= _token;
			dataToSend.what				= 'VISITS_FROM_FEAUTURE';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","visits.js","getVisitsFromFeature","success",response.data.message.filters);
        if(typeof response.data.message.filters!=="undefined"){
        for(let i=0;i<response.data.message.filters.length;i++){
            response.data.message.filters[i].comboValues = _assignValuesToCombo(response.data.message.filters[i]);
						response.data.message.filters[i].changeAction = "applyVisitFilters"
          }
        }
				cb(null,response.data.message)
			})
			.catch( (error) => {
				_self.emit("log","visits.js","getVisitsFromFeature error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","getVisitsFromFeature error","error",e);
			cb(e,false);
		}
	}


	function getWebFormsForVisit(formIdentifier,pol_id,id_name,options,constants,cb){
		_self.emit("log","visits.js","getWebFormsForVisit("+formIdentifier+","+pol_id+")","info",options);
		try{
			let dataToSend 				= {};
			//dataToSend.layer			= layer
			dataToSend.device			= _device;
			dataToSend.form				= formIdentifier;
			dataToSend.pol_id			= pol_id;
			dataToSend.id_name		= id_name;
			//remove timezone from filters
			if(options){
				var date 							= options.visit_start;
				var utcDate 					= new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
				options.visit_start 	= utcDate;
				date 									= options.visit_end;
				utcDate 							= new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
				options.visit_end 		= utcDate;
				dataToSend.options		= JSON.stringify(options);
			}
			dataToSend.token			= _token;
			dataToSend.what				= 'VISITS';
			dataToSend.expected_api_version = _expected_api_version;

			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					var msg				= response.data.message;
					var retorn 		= {};
					_self.emit("log","visits.js","getWebFormsForVisit","success",msg);
					//parameter type select
					if(msg.parameter_type_options.length>0){
						//msg.parameter_type_options.unshift({'parameter_type':constants.get('SELECT')});
						retorn.parameter_type_options 	= msg.parameter_type_options;
						if(options.parameter_type===null){
							retorn.parameter_type 				= msg.parameter_type_options[0].id;
						}else{
							let obj 	= msg.parameter_type_options;
							let index = functionFindIndexByKeyValue(obj, "id", options.parameter_type);
							if(index>-1 && index!=null){
								retorn.parameter_type 					= msg.parameter_type_options[index].id;
							}else{
								retorn.parameter_type 					= msg.parameter_type_options[0].id;
							}
						}
					}
					//parameter_id select
					if(msg.parameter_id_options.length>0){
						//msg.parameter_id_options.unshift({'parameter_id':constants.get('SELECT')});
						retorn.parameter_id_options		= msg.parameter_id_options;
						if(options.parameter_id===null){
							retorn.parameter_id 				= msg.parameter_id_options[0].id;
						}else{
							let obj 	= msg.parameter_id_options;
							let index = functionFindIndexByKeyValue(obj, "id", options.parameter_id);
							if(index>-1 && index!=null){
								retorn.parameter_id 				= msg.parameter_id_options[index].id;
							}else{
								retorn.parameter_id 				= msg.parameter_id_options[0].id;
							}
						}
					}
					//events view
					if(msg.events.length>0){
						retorn.visitData_options 		= msg.events;
					}else{
						retorn.visitData_options 		= Array();
					}

					if(msg.parameter_id_options.length===0 || msg.parameter_type_options.length==="0"){
						retorn 	= {};
						cb("Error requesting visit form",retorn);
					}else{
						cb(null,retorn);
					}
				}else{
					cb(response.data,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","getWebFormsForVisit error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","getWebFormsForVisit error","error",e);
			cb(e,false);
		}
	}
	//****************************************************************
	//******************        END VISIT         ********************
	//****************************************************************

	//****************************************************************
	//*******************         VISIT DELETE        ****************
	//****************************************************************

	function deleteVisit(visit_id,layer,cb){
		try{
			_self.emit("log","visits.js","deleteVisit("+visit_id+","+layer+")","info");
			let dataToSend 						= {};
			dataToSend.layer					= layer
			dataToSend.visit_id				= visit_id;
			dataToSend.token					= _token;
			dataToSend.what						= 'DELETE_VISIT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","visits.js","deleteVisit","success",response.data.message);
				if(response.data.status==="Accepted"){
					cb(null,true);
				}else{
					cb(response.data.message,false);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","deleteVisit error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","deleteVisit error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*******************      END VISIT DELETE       ****************
	//****************************************************************

	//****************************************************************
	//*******************          INSERT VISIT       ****************
	//****************************************************************

	function upsertVisit(layer,coordinates,epsg,pol_id,id_name,cb){
		try{
			_self.emit("log","visits.js","upsertVisit("+layer+","+coordinates+","+epsg+","+pol_id+","+id_name+")","info");
			let dataToSend 						= {};
			dataToSend.layer					= layer;
			dataToSend.pol_id					= pol_id;
			dataToSend.id_name				= id_name;
			dataToSend.coordinates		= coordinates.toString();
			dataToSend.epsg						= epsg;
			dataToSend.device 				= _device;
			dataToSend.token					= _token;
			dataToSend.what						= 'UPSERT_VISIT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","visits.js","upsertVisit response","success",response.data.message);
					let retorno 										= {};
					retorno.visitcat_id_options 		= response.data.message.visicat_id_options;
					retorno.visitcat_id							= response.data.message.visicat_id[0];
					retorno.visit_id 								= response.data.message.visit_id;
					retorno.visit_isDone 						= response.data.message.visit_isDone;

					//parameter type
					if(response.data.message.parameter_type_options.length>0){
						retorno.parameter_type_options	= response.data.message.parameter_type_options;
					}
					retorno.parameter_type						= retorno.parameter_type_options[0].id;
					//parameter_id
					if(response.data.message.parameter_id_options.length>0){
						retorno.parameter_id_options		= response.data.message.parameter_id_options;
						retorno.parameter_id						= retorno.parameter_id_options[0].id;
					}else{
						_self.emit("log","visits.js","upsertVisit no parameter_id_options","warn");
					}

					retorno.code											= response.data.message.code;
					//Events
					if(typeof response.data.message.events=="undefined"){
						retorno.events 										= [];
					}else{
						retorno.events 										= response.data.message.events;
					}
					cb(null,retorno);
				}else{
					cb(response.data,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","upsertVisit error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","upsertVisit error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*******************       END INSERT VISIT      ****************
	//****************************************************************

	//****************************************************************
	//*******************          UPDATE VISIT       ****************
	//****************************************************************
	function updateVisit(layer,visit_id,key,value,pol_id,id_name,cb){
		try{
			_self.emit("log","visits.js","updateVisit("+layer+","+key+","+value+","+pol_id+","+id_name+")","info");
			let dataToSend 						= {};
			dataToSend.layer					= layer;
			dataToSend.pol_id					= pol_id;
			dataToSend.id_name				= id_name;
			dataToSend.visit_id				= visit_id;
			dataToSend.key						= key;
			dataToSend.value					= value;
			dataToSend.token					= _token;
			dataToSend.what						= 'UPDATE_VISIT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","visits.js","updateVisit","success",response.data.message);
				if(response.data.status==="Accepted"){
					cb(null,response.data.message);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","updateVisit error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","updateVisit error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*******************      END UPDATE VISIT       ****************
	//****************************************************************

	//****************************************************************
	//******     GET PARAMETER ID FOR A PARAMETER TYPE      **********
	//****************************************************************

	function getParameterIdFromParameterType(layer,parameterType,id_name,cb){
		try{
			_self.emit("log","visits.js","getParameterIdFromParameterType("+layer+","+parameterType+")","info");
			let dataToSend 						= {};
			dataToSend.layer					= layer;
			dataToSend.parameterType	= parameterType;
			dataToSend.id_name 				= id_name;
			dataToSend.token					= _token;
			dataToSend.what						= 'GET_PARAMETER_ID_FOR_PARAMETER_ID';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","visits.js","getParameterIdFromParameterType","success",response.data.message);
				if(response.data.status==="Accepted"){
					cb(null,response.data.message.parameter_id_options);
				}else{
					cb(response.data.message,false);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","getParameterIdFromParameterType error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","getParameterIdFromParameterType error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//******   END GET PARAMETER ID FOR A PARAMETER TYPE     *********
	//****************************************************************

	//****************************************************************
	//*************                                    ***************
	//*************     NEW VISITS IMPLEMENTATION      ***************
	//*************                                    ***************
	//****************************************************************

	//****************************************************************
	//*************              GET VISITS            ***************
	//****************************************************************

	/*
		gwGetVisit

		Chapuza, las requests que vengan del antiguo tab visits, llevan chapuza=true porque la query va harcoded....

	*/
	function gwGetVisit(data,cb){
		try{
			_self.emit("log","visits.js","gwGetVisit("+data.pol_id+","+data.id_name+","+data.tableName+','+data.visit_id+")","info",data);
			let action = null;
			let extraData = data.extraData;
			let extraDataToSend = extraData;
			if(extraData){
				if(extraData.action==="newFile"){
					action = extraData.action;
          let metaData = null;
          if(typeof data.metaData!='undefined'){
            metaData = data.metaData;
          }
					extraDataToSend = _formUtils.formatPhotoData(extraData.fileName,extraData.hash,data.visit_id,data.deviceTrace,metaData);
				}else if(extraData.action==="deleteFile"){
					action = extraData.action;
					extraDataToSend = {'deleteFile':{'feature':{'id':extraData.deleteFile.feature}}};
				}
				data.extraData = extraDataToSend;
			}
			if(_options.visit_offline && action===null && !data.isOffline){
				//get offline form
				if(!data.online){
					var form = _storage.getItem(`bmaps_${_options.project_id}_ov_${data.tableName}_${data.visitType}`);
					if(form){
						_self.emit("log","visits.js","gwGetVisit offline form","info",{'form':form,'formContent':JSON.parse(form)});
						cb(null,JSON.parse(form));
						return;
					}else{
						_self.emit("log","visits.js","gwGetVisit offline form not found","warning",JSON.parse(form));
						return;
					}
				}
				delete data.online;
				_dogwGetVisitRequest(data,cb);
			}else{
				_dogwGetVisitRequest(data,cb);
			}
		}catch(e){
			_self.emit("log","visits.js","gwGetVisit error","error",e);
			cb(e,false);
		}
	}

	function _dogwGetVisitRequest(data,cb){
		_self.emit("log","visits.js","_dogwGetVisitRequest","info",data);
		let dataToSend 							= {};
		dataToSend.pol_id 					= data.pol_id;
		dataToSend.id_name 					= data.id_name;
		dataToSend.device 					= data.device;
		dataToSend.info_type 				= data.info_type;
		dataToSend.visit_id 				= data.visit_id;
		dataToSend.visitType 				= data.visitType;
		dataToSend.tableName 				= data.tableName;
    dataToSend.isOffline        = data.isOffline;
		dataToSend.formParameters		= JSON.stringify(data.formParameters);
		dataToSend.formFeatureData 	= JSON.stringify(data.formFeatureData);
		dataToSend.formPagination 	= JSON.stringify(data.formPagination);
		dataToSend.extraData				= JSON.stringify(data.extraData);
		dataToSend.deviceTrace			= JSON.stringify(data.deviceTrace);
		dataToSend.token						= _options.token;
		//dynamic attributes
		for (var k in data.formData) {
			if (data.formData.hasOwnProperty(k)) {
				if(data.formData[k]!=""){
					dataToSend[k] = 	data.formData[k];
				}else if(data.formData[k]===0){
					dataToSend[k] = 	"0";
				}
			}
		}
		if(data.chapuza){
			dataToSend.what						= 'gwGetVisitChapuza';
		}else{
			dataToSend.what						= 'gwGetVisit';
		}
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			_processReponse(null,response.data,'gwGetVisit',cb);
		})
		.catch( (error) => {
			_self.emit("log","visits.js","gwGetVisit error","error",error);
			cb(error,false);
		});
	}

	function _prepareFormsToDonwload(){
		_self.emit("log","visits.js","_prepareFormsToDonwload()","info",_options);
		let formsWithLayers = Array();
		for(var i=0;i<_options.project_layers.names.length;i++){
			//check is layer is available offline
			if(_options.project_layers.offline.indexOf(_options.project_layers.names[i])>-1){
				//check is layer is visitable
				if(_options.project_layers.visitable.indexOf(_options.project_layers.names[i])>-1){
					formsWithLayers.push({'name': _options.project_layers.names[i],'table':_options.project_layers.tables[i],'visitType':'visit' });
          formsWithLayers.push({'name': _options.project_layers.names[i],'table':_options.project_layers.tables[i],'visitType':'incidence' });
				}
			}
		}
		return formsWithLayers;
	}
	//get offline visit form
	function storeVisitForms(){
		_self.emit("log","visits.js","storeVisitForms","info");
		var availableForms = _prepareFormsToDonwload();
		if(availableForms.length===0){
			_self.emit("log","visits.js","No available forms to donwload","warn",{'offline':_options.project_layers.offline,'visitibale':_options.project_layers.visitable});
			_self.emit("offlineEvent","dumpData",{"text":"noDownloadbaleForms"});
			return;
		}
		_self.emit("log","visits.js","storeVisitForms "+availableForms.length+ " available Forms","info",availableForms);
		_visitOffline.clearVisitedSpots();
		//get layer id name from WFS request
		for(var i=0;i<availableForms.length;i++){
			_self.emit("log","visits.js","trying to store ","info",availableForms[i]);
			let	visitType = availableForms[i].visitType;
			_getWfsLayerIdName(availableForms[i].name,availableForms[i].table).then((response) => {
					if(response){
						var dataToSend = {
							'pol_id': null,
							'id_name': response.id_name,
							'visitType': visitType,
							'tableName': response.table,
							'visit_id': null,
							'info_type': _options.info_type,
							'formParameters': {},
							'formFeatureData': null,
							'formPagination': null,
							'feature': null,
							'deviceTrace': null,
							'extraData': null,
							'chapuza': false,
							'device': _options.device,
							'isOffline': true
						}
						gwGetVisit(dataToSend,function(e,res){
							if(e){
								_self.emit("log","visits.js","storing offline visit error",'error',{'error':e,'response':res});
								_self.emit("offlineEvent","dumpData",{"text":"visitFormDownloadError"});
								return;
							}
							//store form here
							_self.emit("log","visits.js",`storing visit form as bmaps_${_options.project_id}_ov_${response.table}_${visitType}`,"success",res);
							_storage.setItem(`bmaps_${_options.project_id}_ov_${response.table}_${visitType}`,JSON.stringify(res));
							if(i===availableForms.length){
								_self.emit("log","visits.js","storing offline visit forms DONE","success",res);
								_self.emit("offlineEvent","dumpData",{"text":"visitFormDownloadDone"});
							}
						});
					}else{
						_self.emit("log","visits.js","storeVisitForms empty WFS response","error",response);
						_self.emit("offlineEvent","dumpData",{"text":"visitFormDownloadError"});
					}
			}).catch((e)=>{
				_self.emit("log","visits.js","storeVisitForms error requesting WFS","error",e);
				_self.emit("offlineEvent","dumpData",{"text":"visitFormDownloadError"});
			});
		}
	}

	//****************************************************************
	//************            END GET VISITS             *************
	//****************************************************************

	//****************************************************************
	//************                SET VISIT              *************
	//****************************************************************

	function gwSetVisit(data,cb){
		try{
			_self.emit("log","visits.js","gwSetVisit()","info",data);
			let retorno 							= {};
			let dataToSend 						= _formatDataForgwSetVisit(data);
			if (navigator.onLine){
				axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
					_self.emit("log","visits.js","gwSetVisit","success",response.data.message);
					if(response.data.status==="Accepted"){
						if(_options.visited_spots_layer) {
              if(_visitOffline!=null){
							  _visitOffline.storeVisitedSpot(_options.project_id,data.selectedGeomString);
              }
						}
						cb(null,response.data.message);
					}else{
						_self.emit("log","visits.js","gwSetVisit","error",response.data.message);
						cb(response.data.message,response.data.message);
					}
				}).catch( (error) => {
					_self.emit("log","visits.js","gwSetVisit error","error",error);
					cb(error,false);
				});
			}else{
        if(_visitOffline===null){
          cb("offline visit not supported",false);
          return;
        }
				if(_options.visit_offline) {
					//store here setVisit request
					_visitOffline.storeOfflineVisit(_options.project_id,{'pol_id':data.pol_id,'id_name':data.pol_id_name,'tableName':data.tableName,'dataToSend':dataToSend,'type':'data','selectedGeomString':data.selectedGeomString});
					cb(false,{'message':{'text':'offline visit stored'},'body': {'data':{}}});
				}else{
					cb("offline visit not supported",false);
				}
			}
		}catch(e){
			_self.emit("log","visits.js","gwSetVisit error","error",e);
			cb(e,false);
		}
	}

	function _formatDataForgwSetVisit(data){
		try{
			_self.emit("log","visits.js","_formatDataForgwSetVisit("+data.pol_id+","+data.id_name+","+data.device+","+data.idName+")","info",data);
			let dataToSend 						= {};
			dataToSend.pol_id 				= data.pol_id;
			dataToSend.id_name 				= data.pol_id_name;
			dataToSend.device 				= data.device;
			dataToSend.info_type 			= data.info_type;
			dataToSend.featureType		= data.featureType;
			dataToSend.tableName 			= data.tableName;
			dataToSend.idName					= data.idName;
			dataToSend.id							= data.id;
			dataToSend.token					= _token;
			dataToSend.deviceTrace		= JSON.stringify(data.deviceTrace);
			//dynamic attributes
			for (var k in data.formData) {
				if (data.formData.hasOwnProperty(k)) {
					if(data.formData[k]!=""){
						dataToSend[k] = 	data.formData[k];
					}else if(data.formData[k]===0){
						dataToSend[k] = 	"0";
					}
				}
			}
			let extraDataToSend = null;
			if(data.extraData){
        //TBR!!!
				if(data.extraData.action==="newFile"){
          let metaData = null;
					extraDataToSend = _formUtils.formatPhotoData(data.extraData.fileName,data.extraData.hash,data.id,data.deviceTrace,metaData);
				}else if(extraData.action==="deleteFile"){
					//extraDataToSend = {'deleteFile':{'feature':{'id':extraData.deleteFile.feature}}};
				}
				dataToSend.extradata = extraDataToSend;
			}
      if(data.photos.length>0){
        dataToSend.photos = JSON.stringify(data.photos);
      }
			dataToSend.what									= 'gwSetVisit';
			dataToSend.expected_api_version = _expected_api_version;
			return dataToSend;
		}catch(e){
			_self.emit("log","visits.js","_formatDataForgwSetVisit()","error",e);

			return false;
		}
	}

	//****************************************************************
	//************             END SET VISIT             *************
	//****************************************************************

	//****************************************************************
	//************                SET VISIT              *************
	//****************************************************************

	function gwSetDelete(pol_id,id_name,info_type,featureType,tableName,idName,id,formData,device,cb){
		try{
			_self.emit("log","visits.js","gwSetDelete("+pol_id+","+id_name+","+info_type+","+device+","+idName+")","info");
			let retorno 							= {};
			let dataToSend 						= {};
			dataToSend.pol_id 				= pol_id;
			dataToSend.id_name 				= id_name;
			dataToSend.device 				= device;
			dataToSend.info_type 			= info_type;
			dataToSend.featureType		= featureType;
			dataToSend.tableName 			= tableName;
			dataToSend.idName					= idName;
			dataToSend.id							= id;
			dataToSend.token					= _token;
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}

			dataToSend.what						= 'gwSetDelete';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","visits.js","gwSetDelete","success",response.data.message);
				cb(null,response.data.message);
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gwSetDelete error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gwSetDelete error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************             END DELETE VISIT          *************
	//****************************************************************

	//****************************************************************
	//************               VISIT MANAGER           *************
	//****************************************************************
	function gwGetVisitManager(pol_id,id_name,visit_id,info_type,formParameters,formFeatureData,formPagination,formData,deviceTrace,extraData,device,cb){
		try{
			_self.emit("log","visits.js","gwGetVisitManager("+pol_id+","+id_name+","+visit_id+","+info_type+","+device+")","info",{formParameters,formFeatureData,formData,deviceTrace,extraData,formPagination});
			let dataToSend 							= {};
			dataToSend.pol_id 					= pol_id;
			dataToSend.id_name 					= id_name;
			dataToSend.device 					= device;
			dataToSend.info_type 				= info_type;
			dataToSend.formParameters		= JSON.stringify(formParameters);
			dataToSend.formFeatureData 	= JSON.stringify(formFeatureData);
			dataToSend.formPagination 	= JSON.stringify(formPagination);
			dataToSend.deviceTrace			= JSON.stringify(deviceTrace);
		//	dataToSend.extraData				= JSON.stringify(extraDataToSend);
			dataToSend.token						= _token;
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}
			dataToSend.what						= 'gwGetVisitManager';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_processReponse(null,response.data,'gwGetVisitManager',cb);
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gwGetVisitManager error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gwGetVisitManager error","error",e);
			cb(e,false);
		}
	}

	function gw_api_setvisitmanagerend(pol_id,id_name,visit_id,info_type,formParameters,formFeatureData,formPagination,formData,deviceTrace,extraData,device,cb){
		try{
			_self.emit("log","visits.js","gw_api_setvisitmanagerend("+pol_id+","+id_name+","+visit_id+","+info_type+","+device+")","info",{formParameters,formFeatureData,formData,deviceTrace,extraData,formPagination});
			let dataToSend 							= {};
			dataToSend.pol_id 					= pol_id;
			dataToSend.id_name 					= id_name;
			dataToSend.device 					= device;
			dataToSend.info_type 				= info_type;
			dataToSend.formParameters		= JSON.stringify(formParameters);
			dataToSend.formFeatureData 	= JSON.stringify(formFeatureData);
			dataToSend.formPagination 	= JSON.stringify(formPagination);
		//	dataToSend.extraData				= JSON.stringify(extraDataToSend);
			dataToSend.token						= _token;
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}
			dataToSend.what						= 'gw_api_setvisitmanagerend';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_processReponse(null,response.data,'gw_api_setvisitmanagerend',cb);
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gw_api_setvisitmanagerend error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gw_api_setvisitmanagerend error","error",e);
			cb(e,false);
		}
	}

	function gw_api_setvisitmanagerstart(pol_id,id_name,visit_id,info_type,formParameters,formFeatureData,formPagination,formData,deviceTrace,extraData,device,cb){
		try{
			_self.emit("log","visits.js","gw_api_setvisitmanagerstart("+pol_id+","+id_name+","+visit_id+","+info_type+","+device+")","info",{formParameters,formFeatureData,formData,deviceTrace,extraData,formPagination});
			let dataToSend 							= {};
			dataToSend.pol_id 					= pol_id;
			dataToSend.id_name 					= id_name;
			dataToSend.device 					= device;
			dataToSend.info_type 				= info_type;
			dataToSend.formParameters		= JSON.stringify(formParameters);
			dataToSend.formFeatureData 	= JSON.stringify(formFeatureData);
			dataToSend.formPagination 	= JSON.stringify(formPagination);
		//	dataToSend.extraData				= JSON.stringify(extraDataToSend);
			dataToSend.token						= _token;
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}
			dataToSend.what						= 'gw_api_setvisitmanagerstart';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_processReponse(null,response.data,'gw_api_setvisitmanagerstart',cb);
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gw_api_setvisitmanagerstart error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gw_api_setvisitmanagerstart error","error",e);
			cb(e,false);
		}
	}

	function gwSetVisitManager(pol_id,id_name,visit_id,info_type,formParameters,formFeatureData,formPagination,formData,deviceTrace,extraData,device,cb){
		try{
			_self.emit("log","visits.js","gwSetVisitManager("+pol_id+","+id_name+","+visit_id+","+info_type+","+device+")","info",{formParameters,formFeatureData,formData,deviceTrace,extraData,formPagination});
			let dataToSend 							= {};
			dataToSend.pol_id 					= pol_id;
			dataToSend.id_name 					= id_name;
			dataToSend.device 					= device;
			dataToSend.info_type 				= info_type;
			dataToSend.formParameters		= JSON.stringify(formParameters);
			dataToSend.formFeatureData 	= JSON.stringify(formFeatureData);
			dataToSend.formPagination 	= JSON.stringify(formPagination);
			dataToSend.deviceTrace			= JSON.stringify(deviceTrace);
			dataToSend.token						= _token;
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}
			dataToSend.what									= 'gwSetVisitManager';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_processReponse(null,response.data,'gwSetVisitManager',cb);
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gwSetVisitManager error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gwSetVisitManager error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************           END VISIT MANAGER           *************
	//****************************************************************

	//****************************************************************
	//************               GET LOT                 *************
	//****************************************************************

	function gwGetLot(pol_id,id_name,info_type,featureType,tableName,idName,id,formData,device,cb){
		try{
			_self.emit("log","visits.js","gwGetLot("+pol_id+","+id_name+","+info_type+","+device+","+idName+")","info");
			let retorno 							= {};
			let dataToSend 						= {};
			dataToSend.pol_id 				= pol_id;
			dataToSend.id_name 				= id_name;
			dataToSend.device 				= device;
			dataToSend.info_type 			= info_type;
			dataToSend.featureType		= featureType;
			dataToSend.tableName 			= tableName;
			dataToSend.idName					= idName;
			dataToSend.id							= id;
			dataToSend.token					= _token;
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}
			dataToSend.what						= 'gwGetLot';
			dataToSend.expected_api_version = _expected_api_version;

			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","visits.js","gwGetLot","success",response.data.message);
					_processReponse(null,response.data,'gwGetLot',cb);
				}else{
					_self.emit("log","visits.js","gwGetLot","error",response.data.message);
					cb(response.data.status,body.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gwGetLot error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gwGetLot error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************              END GET LOT              *************
	//****************************************************************

	//****************************************************************
	//************                SET LOT                *************
	//****************************************************************

	function gwSetLot(pol_id,id_name,info_type,featureType,tableName,idName,id,formData,deviceTrace,device,cb){
		try{
			_self.emit("log","visits.js","gwSetLot("+pol_id+","+id_name+","+info_type+","+device+","+idName+")","info",deviceTrace);
			let retorno 							= {};
			let dataToSend 						= {};
			dataToSend.pol_id 				= pol_id;
			dataToSend.id_name 				= id_name;
			dataToSend.device 				= device;
			dataToSend.info_type 			= info_type;
			dataToSend.featureType		= featureType;
			dataToSend.tableName 			= tableName;
			dataToSend.idName					= idName;
			dataToSend.id							= id;
			dataToSend.token					= _token;
			dataToSend.deviceTrace		= JSON.stringify(deviceTrace);
			//dynamic attributes
			for (var k in formData) {
				if (formData.hasOwnProperty(k)) {
					if(formData[k]!=""){
						dataToSend[k] = 	formData[k];
					}else if(formData[k]===0){
							dataToSend[k] = 	"0";
					}
				}
			}
			dataToSend.what						= 'gwSetLot';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","visits.js","gwSetLot","success",response.data.message);
				cb(null,response.data.message)
			})
			.catch( (error) => {
				_self.emit("log","visits.js","gwSetLot error","error",error);
				cb(error,false);
			});
		}catch(e){
			_self.emit("log","visits.js","gwSetLot error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************               END SET LOT             *************
	//****************************************************************

	//****************************************************************
	//**********            SET VEHICLE PARAMETER        *************
	//****************************************************************

	function gwSetVehicleLoad(info_type,formData,deviceTrace,device,cb){
		return new Promise((resolve, reject) => {
			try{
				_self.emit("log","visits.js","gwSetVehicleLoad("+info_type+","+device+")","info",deviceTrace);
				let retorno 							= {};
				let dataToSend 						= {};
				dataToSend.device 				= device;
				dataToSend.info_type 			= info_type;
				dataToSend.token					= _token;
				dataToSend.deviceTrace		= JSON.stringify(deviceTrace);
				//dynamic attributes
				for (var k in formData) {
					if (formData.hasOwnProperty(k)) {
						if(formData[k]!=""){
							dataToSend[k] = 	formData[k];
						}else if(formData[k]===0){
								dataToSend[k] = 	"0";
						}
					}
				}
				dataToSend.what						= 'SET_VEHICLE_LOAD';
				dataToSend.expected_api_version = _expected_api_version;
				axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
					_self.emit("log","visits.js","gwSetVehicleLoad","success",response.data.message);
					if(response.data.status==="Accepted"){
            if(response.data.message.body.length===0){
							resolve({'form': false, 'content': response.data.message});
	          }else{
							_processReponse(null,response.data,'gwSetVehicleLoad',function(err,msg){
								if(err) reject(err);
									resolve({'form': true, 'content': msg});
							});
	          }
					}else{
						reject(response.data.message);
					}
				})
				.catch( (error) => {
					_self.emit("log","visits.js","gwSetVehicleLoad error","error",error);
					reject(error);
				});
			}catch(e){
				_self.emit("log","visits.js","gwSetVehicleLoad error","error",e);
				reject(e);
			}
		});
	}

	//****************************************************************
	//**********        END SET VEHICLE PARAMETER        *************
	//****************************************************************

  //****************************************************************
	//**********            SET UNIT INTERVAL            *************
	//****************************************************************

	function gw_fct_setunitinterval(info_type,formData,deviceTrace,device){
    console.log("gw_fct_setunitinterval",info_type,formData,deviceTrace,device)
		return new Promise((resolve, reject) => {
			try{
				_self.emit("log","visits.js","gw_fct_setunitinterval("+info_type+","+device+")","info",deviceTrace);
				let retorno 							= {};
				let dataToSend 						= {};
				dataToSend.device 				= device;
				dataToSend.info_type 			= info_type;
				dataToSend.token					= _token;
				dataToSend.deviceTrace		= JSON.stringify(deviceTrace);
				//dynamic attributes
				for (var k in formData) {
					if (formData.hasOwnProperty(k)) {
						if(formData[k]!=""){
							dataToSend[k] = 	formData[k];
						}else if(formData[k]===0){
								dataToSend[k] = 	"0";
						}
					}
				}
				dataToSend.what						= 'SET_UNIT_INTERVAL';
				dataToSend.expected_api_version = _expected_api_version;
				axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
					_self.emit("log","visits.js","gw_fct_setunitinterval","success",response.data.message);
					if(response.data.status==="Accepted"){
						_processReponse(null,response.data,'gwGetVisit',function(err,msg){
							if(err) reject(err);
        			resolve(msg);
            });

					}else{
						reject(response.data.message);
					}
				})
				.catch( (error) => {
					_self.emit("log","visits.js","gw_fct_setunitinterval error","error",error);
					reject(error);
				});
			}catch(e){
				_self.emit("log","visits.js","gw_fct_setunitinterval error","error",e);
				reject(e);
			}
		});
	}

	//****************************************************************
	//**********            END SET UNIT INTERVAL        *************
	//****************************************************************

	//****************************************************************
	//*************                                    ***************
	//*************   END NEW VISITS IMPLEMENTATION    ***************
	//*************                                    ***************
	//****************************************************************

	//****************************************************************
	//*************                                    ***************
	//*************          OFFLINE VISITS            ***************
	//*************                                    ***************
	//****************************************************************

	function setUpOfflineVisit(props){
		_self.emit("log","visits.js","setUpOfflineVisit","info",props);
		return new Promise((resolve, reject) => {
			for (var key in props) {
		  	_options[key] = props[key];
			}
			var response = {
				'mustDowloadData' : false,
				'pending': false,
			};
			if(_options.visit_offline){
				var wsData = {};
				_options.cacheVersion = document.getElementById('cacheVersion').value;
				_options.localForageVersion = document.getElementById('localForageVersion').value;
				_options.serverInstance = document.getElementById('serverInstance').value;
				_storage = new MapStorage(_options,_events,_logger);
				_visitOffline = new VisitsOffline(_options,_self,_logger);
				if(_options.off_download_data){
					var d1 = new Date();
					var d2 = new Date(_storage.getItem(`bmaps_${_options.project_id}_lastDownload`));
					if(d1.getTime()>d2.getTime()){
						response.mustDowloadData = true;
					}
				}
  			let id = _storage.getItem('bmaps_photo_id');
				if(id===null){
					_storage.setItem('bmaps_photo_id',1);
				}
				if(_visitOffline.getOfflineVisits(_options.project_id).length>0){
					response.pending = true;
					resolve(response);
				}else{
					resolve(response);
				}
			}else{
				reject("Project hasn't visit offline");
			}
		});
	}

	function clearOfflineVisits(data){
		return _visitOffline.clearOfflineVisits(data);
	}

	//****************************************************************
	//*************                                    ***************
	//*************         END OFFLINE VISITS         ***************
	//*************                                    ***************
	//****************************************************************

	//****************************************************************
	//*************               HELPERS              ***************
	//****************************************************************

	/***
		_getWfsLayerIdName
		gets layer id name from wfs

			@scope private
			@param layer_name <string>
			@param table_name <string>

			@return promise <json>

	***/
	function _getWfsLayerIdName(layer_name,table_name){
		return new Promise((resolve, reject) => {
			//Get from WFS layer data
			_self.emit("log","visits.js","_getWfsLayerIdName("+layer_name+","+table_name+")","info");
			var id_name = null;
			layer_name = layer_name.replace(/\s+/g, '_');
			axios.get(_options.urlWMS+'?service=WFS&request=DescribeFeatureType&version=1.0.0&typename='+layer_name).then(function (response) {
				var json = JSON.parse(parser.xml2json(response.data, {compact: true, spaces: 4}));
				//_self.emit("log","visits.js","_getWfsLayerIdName("+layer_name+","+table_name+"),"info",json);
				if(typeof json.schema!="undefined"){
					if(typeof json.schema.complexType!="undefined"){
            for(var l=0;l<json.schema.complexType.length;l++){
              if(json.schema.complexType[l].name===`${layer_name}Type`){
    						if(typeof json.schema.complexType[l].complexContent!="undefined"){
    							if(typeof json.schema.complexType[l].complexContent.extension!="undefined"){
    								if(typeof json.schema.complexType[l].complexContent.extension.sequence!="undefined"){
    									if(typeof json.schema.complexType[l].complexContent.extension.sequence.element!="undefined"){
    										//id_name MUST be first at position 1
    										id_name =json.schema.complexType[l].complexContent.extension.sequence.element[1]._attributes.name;
    									}
    								}
    							}
    						}
                break;
              }
            }
					}
				}
				if(id_name){
					resolve({'id_name':id_name,'table':table_name});
				}else{
					resolve(null);
				}
			})
			.catch( (error) => {
				_self.emit("log","visits.js","_getWfsLayerIdName error","error",error);
				reject(error);
			});
		});
	}

	function functionFindIndexByKeyValue(arraytosearch, key, valuetosearch) {
		for (var i = 0; i < arraytosearch.length; i++) {
			if (arraytosearch[i][key] == valuetosearch) {
				return i;
			}
		}
		return null;
	}

	/***
		_assignValuesToCombo
			formats data for form combo component

			@scope private
			@param object<object>

			@return <json>

	***/

	function _assignValuesToCombo(object){
		let comboValues = Array();
		try{
			for(let i=0;i<object.comboIds.length;i++){
				comboValues.push({id:object.comboIds[i],name:object.comboNames[i]});
			}
			return comboValues;
		}catch(e){
			_self.emit("log","visits.js","_assignValuesToCombo error formatting combo","error",e.message);
			return false;
		}
	}

	function _getActiveTab(tabs){
		if(tabs.length>0){
			for(let i=0;i<tabs.length;i++){
				if(tabs[i].active){
					return i;
					break;
				}
			}
		}
	}

	function _processReponse(err,response,caller,cb){
		let retorno 								= {};
		if(err){
			_self.emit("log","visits.js",caller+" error on request","error",err);
			cb(err,response);
		}
		if(response.status==="Accepted"){
			_self.emit("log","visits.js",caller,"success",response);
			if(typeof response.message.body.form.formTabs!="undefined"){
				retorno.feature		= response.message.body.feature;
				retorno.formName	= response.message.body.form.formName;
				retorno.formId 		= response.message.body.form.formId;
				retorno.data 			= response.message.body.data;
				for(let i=0;i<response.message.body.form.formTabs.length;i++){
					if(typeof response.message.body.form.formTabs[i].fields!="undefined"){
						for(let f=0;f<response.message.body.form.formTabs[i].fields.length;f++){
							if(response.message.body.form.formTabs[i].fields[f]){
								if(response.message.body.form.formTabs[i].fields[f].type==="combo"){
									response.message.body.form.formTabs[i].fields[f].comboValues   = _assignValuesToCombo(response.message.body.form.formTabs[i].fields[f]);
								}
							}
						}
					}
				}
				retorno.msgToDisplay = response.message.message;
				retorno.formTabs 		= response.message.body.form.formTabs;
				//sets active tab
				let activeTabIndex								= _getActiveTab(response.message.body.form.formTabs);
				if(typeof activeTabIndex=="undefined"){
					_self.emit("log","visits.js",caller+" NO ACTIVE TAB","warn",response.message.body.form.formTabs);
					var dataToSend =
					{
						"evt": "JS ERROR",
						"msg": "FORM NO ACTIVE TAB on gwGetVisit",
						"status": "KO",
						"response": JSON.stringify(response),
						"bucket": "LOG_FR_"
					};
					axios.post(_baseHref+'/error.logger.php', dataToSend).then(function (response) {
						_self.emit("log","visits.js","logging error","success",response.data.message);

					})
					.catch( (error) => {
						_self.emit("log","visits.js","logging error","error",error);
					});
					activeTabIndex = 0;
					response.message.body.form.formTabs[activeTabIndex].active = true;
				}
				retorno.activeTab 								= response.message.body.form.formTabs[activeTabIndex];
				retorno.activeTab.activeTabIndex	= activeTabIndex;
				_tabs							= retorno;
				cb(null,retorno);
			}else{
				cb("no fields","no fields");
			}
		}else{
			cb(response,response.message);
		}
	}

	//****************************************************************
	//*************                END HELPERS         ***************
	//****************************************************************
	module.exports 					           				= Visits;
	Visits.prototype.deleteVisit							= deleteVisit;
	Visits.prototype.upsertVisit							= upsertVisit;
	Visits.prototype.updateVisit 							= updateVisit;
	Visits.prototype.getVisitsFromFeature 		= getVisitsFromFeature;
	Visits.prototype.getWebFormsForVisit 			= getWebFormsForVisit;
	Visits.prototype.getParameterIdFromParameterType = getParameterIdFromParameterType;
	//new implementation
	Visits.prototype.gwGetVisit 									= gwGetVisit;
	Visits.prototype.gwSetVisit 									= gwSetVisit;
	Visits.prototype.gwSetDelete 									= gwSetDelete;
	Visits.prototype.gwGetVisitManager 						= gwGetVisitManager;
	Visits.prototype.gwSetVisitManager 						= gwSetVisitManager;
	Visits.prototype.gw_api_setvisitmanagerstart 	= gw_api_setvisitmanagerstart;
	Visits.prototype.gw_api_setvisitmanagerend 		= gw_api_setvisitmanagerend;
	Visits.prototype.gwGetLot 										= gwGetLot;
	Visits.prototype.gwSetLot 										= gwSetLot;
	Visits.prototype.setToken 										= setToken;
  Visits.prototype.gwSetVehicleLoad        			= gwSetVehicleLoad;
  Visits.prototype.gw_fct_setunitinterval = gw_fct_setunitinterval;
	Visits.prototype.setUpOfflineVisit 						= setUpOfflineVisit;
	Visits.prototype.storeVisitForms              = storeVisitForms;
	Visits.prototype.clearOfflineVisits 					= clearOfflineVisits;
	Visits.prototype.storeDownloadDate = () => {
    if(_visitOffline){
      return _visitOffline.storeDownloadDate();
    }
  };
	Visits.prototype.dumpOfflineVisits = (data) => {
    if(_visitOffline){
      return _visitOffline.dumpOfflineVisits(data);
		}
  };
	Visits.prototype.saveVisitPicture = (data, preview, fileName, metaData) => {
    if(_visitOffline){
      return _visitOffline.saveVisitPicture(_formatDataForgwSetVisit(data), preview, fileName, metaData);
    }
  };
  Visits.prototype.renderVisitedSpotsLayer = (options) => {
    if(_visitOffline){
      return _visitOffline.renderVisitedSpotsLayer(options);
    }
  };
	Visits.prototype.toggleVisitedSpots = (options) => {
    if(_visitOffline){
      return _visitOffline.toggleVisitedSpots(options);
    }
  };
	Visits.prototype.clearVisitedSpots = () => {
    if(_visitOffline){
      return _visitOffline.clearVisitedSpots();
    }
  };
})();
