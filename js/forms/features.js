/*jshint esversion: 6 */
(function() {
'use strict';
	const util						  = require('util');
	const _events					  = require('events').EventEmitter;
	const axios             = require('axios');

	let _project_type				= "ws";		//<string> ws or ud
	let _self;
	let _token;
	let _baseHref;
	let _device;
	let _version 						= "1.0.1";
	let _expected_api_version;

	util.inherits(FeaturesSewernet, _events);

	function FeaturesSewernet(options){
		if(typeof options.project_type!=="undefined"){
			_project_type 	= options.project_type.toLowerCase();
		}
		_token 								= options.token;
		_baseHref							= options.baseHref;
		_device								= options.device;
		_expected_api_version	= options.expected_api_version
		_self    							= this;

		setTimeout(function(){
			_self.emit("log","features.js","Module loaded v."+_version,"success");
		},500);
	}
  function setToken(token){
    _token = token;
  }

	function _setFieldValue(name,value,fields,disabled){
		for(let i=0;i<fields.length;i++){
			if(fields[i].name===name){
				fields[i].value 		= value;
				fields[i].disabled 	= disabled;
				break;
			}
		}
		return fields;
	}

	function _getAttributeValue(attributes,name){
		let retorno;
		for(let i=0;i<attributes.length;i++){
			if(attributes[i].name===name){
				retorno = attributes[i].value;
				break;
			}
		}
		return retorno;
	}

	function _assignValuesToCombo(object){
		let comboValues = Array();
		try{
			for(let i=0;i<object.comboIds.length;i++){
				comboValues.push({id:object.comboIds[i],name:object.comboNames[i]});
			}
			return comboValues;
		}catch(e){
			_self.emit("log","features.js","_assignValuesToCombo error formatting combo","error",e.message);
			return false;
		}
	}

	function _addInternalKeysToFields(fields,key,value){
		for(let i=0;i<fields.length;i++){
			if(fields[i]){
				fields[i][key] = value;
			}
		}
	}

	function getInsertFeatureForm(layer,db_table,cb){
		try{
			_self.emit("log","features.js","getInsertFeatureForm("+layer+","+db_table+")","info");
			let dataToSend 						= {};
			dataToSend.layer					= layer;
			dataToSend.db_table 			= db_table;
			dataToSend.token					= _token;
			dataToSend.what						= 'GET_INSERT_FEATURE_FORM';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","forms.js","getWebForms","success",response.data.message);
				if(response.data.status==="Accepted"){
					_self.emit("log","features.js","getInsertFeatureForm response","success",response.data.message);
					let retorno 					= {};
					retorno.formToDisplay = response.data.message.formToDisplay;
					retorno.fields 				= response.data.message.fields;
					for(let i=0;i<retorno.fields.length;i++){
						if(retorno.fields[i]){
							if(retorno.fields[i].type==="combo"){
								retorno.fields[i].comboValues 	= _assignValuesToCombo(retorno.fields[i]);
							}
						}
					}
					cb(null,retorno);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","form.js","getInsertFeatureForm","error",error);
			});
		}catch(e){
			_self.emit("log","features.js","getInsertFeatureForm error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//******************       INSERT FEATURE     ********************
	//****************************************************************

	function insertFeature(layer,db_table,epsg,formData,geometry,cb){
		_self.emit("log","features.js","insertFeature("+layer+","+db_table+","+epsg+")","info",formData);
		let dataToSend 						= {};
		dataToSend.layer					= layer;
		dataToSend.db_table 			= db_table;
		dataToSend.epsg 					= epsg;
		dataToSend.geometry				= geometry;
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
		dataToSend.token					= _token;
		dataToSend.what						= 'INSERT_FEATURE';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				_self.emit("log","features.js","insertFeature response","success",response.data.message);
				cb(null,response.data.message);
			}else{
				_self.emit("log","features.js","insertFeature error on request","error",response.data.message);
				cb(response.data.message,response.data.message);
			}
		})
		.catch( (error) => {
			_self.emit("log","form.js","insertFeature","error",error);
			cb(error,false);
			return false;
		});
	}
	//****************************************************************
	//******************     END INSERT FEATURE   ********************
	//****************************************************************

	//****************************************************************
	//******************      DELETE FEATURE      ********************
	//****************************************************************

	function deleteFeature(layer,db_table,id_name,id,cb){
		_self.emit("log","features.js","deleteReview("+layer+","+db_table+","+id_name+","+id+")","info");
		let dataToSend 						= {};
		dataToSend.layer					= layer;
		dataToSend.db_table 			= db_table;
		dataToSend.id_name 				= id_name;
		dataToSend.id 						= id;
		dataToSend.token					= _token;
		dataToSend.what						= 'DELETE_FEATURE';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				_self.emit("log","features.js","deleteFeature response","success",response.data.message);
				cb(null,response.data.message);
			}else{
				_self.emit("log","features.js","deleteFeature error on request","error",response.data.message);
				cb(response.data.message,response.data.message);
			}
		})
		.catch( (error) => {
			_self.emit("log","form.js","deleteFeature","error",error);
			cb(error,false);
			return false;
		});
	}

	//****************************************************************
	//*****************    END DELETE FEATURE      *******************
	//****************************************************************

	//****************************************************************
	//*****************        UPDATE FEATURE      *******************
	//****************************************************************
	function updateFeature(layer,db_table,key,value,pol_id,id_name,cb){
		try{
			if(value===0){
				value = "0";
			}
			_self.emit("log","features.js","updateFeature("+layer+","+db_table+","+key+","+value+","+pol_id+","+id_name+")","info");
			let dataToSend 						= {};
			dataToSend.layer					= layer;
			dataToSend.db_table 			= db_table;
			dataToSend.pol_id					= pol_id;
			dataToSend.id_name				= id_name;
			dataToSend.key						= key;
			dataToSend.value					= value;
			dataToSend.token					= _token;
			dataToSend.what						= 'UPDATE_FEATURE';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","features.js","updateFeature response","success",response.data.message);
					cb(null,response.data.message);
				}else{
					_self.emit("log","features.js","updateFeature error on request","error",response.data.message);
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","form.js","updateFeature","error",error);
			});
		}catch(e){
			_self.emit("log","features.js","updateFeature error","error",e);
			cb(e,false);
		}
	}
	//****************************************************************
	//*****************       END UPDATE FEATURE   *******************
	//****************************************************************

	//****************************************************************
	//****************     UPDATE FEATURE GEOMETRY     ***************
	//****************************************************************

	function updateFeatureGeometry(layer,db_table,epsg,pol_id,id_name,geometry,cb){
		_self.emit("log","features.js","updateFeatureGeometry("+layer+","+db_table+","+epsg+","+pol_id+","+id_name+","+geometry+")","info");
		let dataToSend 						= {};
		dataToSend.layer					= layer;
		dataToSend.db_table 			= db_table;
		dataToSend.id_name 				= id_name;
		dataToSend.pol_id 				= pol_id;
		dataToSend.epsg 					= epsg;
		dataToSend.geometry				= geometry;
		dataToSend.token					= _token;
		dataToSend.what						= 'UDPATE_FEATURE_GEOMETRY';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				_self.emit("log","features.js","updateFeatureGeometry response","success",response.data.message);
				cb(null,response.data.message);
			}else{
				_self.emit("log","features.js","updateFeatureGeometry error on request","error",response.data.message);
				cb(response.data.message,response.data.message);
			}
		})
		.catch( (error) => {
			_self.emit("log","form.js","updateFeatureGeometry","error",error);
			cb(error,false);
			return false;
		});
	}

	//****************************************************************
	//**************    END UPDATE FEATURE GEOMETRY   ****************
	//****************************************************************

	//****************************************************************
	//*************        GET INFO FORM FROM ID      ****************
	//****************************************************************

	function getInfoForm(layer,db_table,id_name,pol_id,edit,pointAttributtes,info_type,cb){
		_self.emit("log","features.js","getInfoForm("+layer+","+db_table+","+id_name+","+pol_id+","+edit+","+info_type+")","info",pointAttributtes);
		let dataToSend 						= {};
		dataToSend.layer					= layer
		dataToSend.db_table				= db_table;
		dataToSend.device					= _device;
		dataToSend.pol_id 				= pol_id;
		dataToSend.edit						= edit;
		dataToSend.id_name				= id_name;
		dataToSend.info_type			= info_type;
		dataToSend.token					= _token;
		dataToSend.what						= 'GET_INFO_FORM_FROM_ID';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				_self.emit("log","features.js","getInfoForm response","success",response.data.message);
				let retorno = response.data.message;
				if(retorno.formTabs.length===0){
					cb("Error on gw_fct_getformtabs or no available forms for this layer",retorno);
					return false;
				}
				if(edit){
					if(retorno.editData.status==="Accepted"){
						for(let i=0;i<retorno.editData.fields.length;i++){
							if(retorno.editData.fields[i]){
								if(retorno.editData.fields[i].type==="combo"){
									retorno.editData.fields[i].comboValues 	= _assignValuesToCombo(retorno.editData.fields[i]);
								}
							}
						}
						_addInternalKeysToFields(retorno.editData.fields,'changeAction','updateFeature');
					}else{
						cb(JSON.stringify(retorno.editData),retorno);
						return false;
					}
				}
				cb(null,retorno);
			}else{
				cb(response.data.code,response.data.message);
			}
		})
		.catch( (error) => {
			_self.emit("log","form.js","getInfoForm","error",error);
		});
	}

	//****************************************************************
	//************       END GET INFO FORM FROM ID      **************
	//****************************************************************

	//****************************************************************
	//**************   GET INFO FORM FROM COORDINATES    *************
	//****************************************************************

	function getInfoFormFromCoordinates(x,y,active_layer,visible_layers,editable_layers,epsg,zoomlevel,info_type,use_tiled_background,visitable,cb){
		_self.emit("log","features.js","getInfoFormFromCoordinates("+x+","+y+","+active_layer+","+visible_layers+","+editable_layers+","+epsg+","+zoomlevel+","+info_type+","+use_tiled_background+","+visitable+")","info");
		let dataToSend 									= {};
		dataToSend.x										= x;
		dataToSend.y										= y;
		dataToSend.active_layer					= active_layer;
		dataToSend.visible_layers 			= visible_layers;
		dataToSend.epsg									= epsg;
		dataToSend.device								= _device;
		dataToSend.info_type						= info_type;
		dataToSend.editable_layers			= editable_layers;
		dataToSend.zoomlevel 						= zoomlevel;
		dataToSend.use_tiled_background	= use_tiled_background;
		dataToSend.token								= _token;
		dataToSend.what									= 'GET_INFO_FORM_FROM_COORDINATES';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				_self.emit("log","features.js","getInfoFormFromCoordinates response","success",response.data.message);
				let retorno = response.data.message;
				if(parseInt(retorno.results)>0){
					if(retorno.formTabs.length===0){
						cb("No tabs found",retorno);
						return false;
					}
					if(typeof retorno.editData!="undefined"){
						if(retorno.editData.status==="Accepted"){
							for(let i=0;i<retorno.editData.fields.length;i++){
								if(retorno.editData.fields[i]){
									//find pol_id
									if(retorno.editData.fields[i].name===retorno.idName){
											_self.emit("log","features.js","getInfoFormFromCoordinates pol_id found","success",retorno.editData.fields[i].value);
											retorno.pol_id = retorno.editData.fields[i].value;
									}
									if(retorno.editData.fields[i].type==="combo"){
										retorno.editData.fields[i].comboValues 	= _assignValuesToCombo(retorno.editData.fields[i]);
									}
								}
							}
							_addInternalKeysToFields(retorno.editData.fields,'changeAction','updateFeature');
						}else{
							cb(JSON.stringify(retorno.editData),"Edit data is empty");
							return false;
						}
					}
					cb(null,retorno);
				}else{
					cb(null,{message:"no results",use_tiled_background:use_tiled_background});
				}
			}else{
				cb(response.data.code,response.data.message);
			}
		})
		.catch( (error) => {
			_self.emit("log","form.js","getInfoFormFromCoordinates","error",error);
		});

	}

	//****************************************************************
	//*************   END GET INFO FORM FROM COORDINATES    **********
	//****************************************************************

  //****************************************************************
	//*************          GET INFO FROM POLYGON          **********
	//****************************************************************

	function getInfoFromPolygon(data){
		_self.emit("log","features.js","getInfoFromPolygon()","info",data);
		return new Promise((resolve, reject) => {
			let dataToSend = data;
			dataToSend.token = _token;
			dataToSend.what = 'GET_INFO_FORM_FROM_POLYGON';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","features.js","getInfoFromPolygon response","success",response.data.message);
					resolve(response.data.message);
				}else{
					reject(response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","form.js","getInfoFromPolygon","error",error);
				reject(error)
			});
		});
	}
	//****************************************************************
	//*************        END GET INFO FROM POLYGON        **********
	//****************************************************************

  module.exports																				= FeaturesSewernet;
	FeaturesSewernet.prototype.insertFeature 							= insertFeature;
	FeaturesSewernet.prototype.getInsertFeatureForm 			= getInsertFeatureForm;
	FeaturesSewernet.prototype.deleteFeature 							= deleteFeature;
	FeaturesSewernet.prototype.updateFeature 							= updateFeature;
	FeaturesSewernet.prototype.updateFeatureGeometry 			= updateFeatureGeometry;
	FeaturesSewernet.prototype.getInfoForm 								= getInfoForm;
	FeaturesSewernet.prototype.getInfoFormFromCoordinates = getInfoFormFromCoordinates;
  FeaturesSewernet.prototype.getInfoFromPolygon = getInfoFromPolygon;
	FeaturesSewernet.prototype.setToken 									= setToken;
})();
