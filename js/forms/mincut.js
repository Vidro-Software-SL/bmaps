/*jshint esversion: 6 */
(function() {
'use strict';
	const util						  = require('util');
	const _events					  = require('events').EventEmitter;
	const axios             = require('axios');
	let _self;
	let _token;
	let _baseHref;
	let _device;
	let _expected_api_version;
	let _tabs;

	util.inherits(Mincut, _events);

	function Mincut(options){
		_token 								= options.token;
		_baseHref							= options.baseHref;
		_device								= options.device;
		_expected_api_version	= options.expected_api_version
		_self    							= this;
		setTimeout(function(){
			_self.emit("log","mincut.js","Mincut module loaded","success");
		},500);
	}

	function setToken(token){
		_token = token;
	}
	//****************************************************************
	//*************              GET MINCUT            ***************
	//****************************************************************

	/*
		method getMincut
			obtains form for mincut

			@scope private
			@param x <float> - x coordinate
			@param y <float> - y coordinate
			@param epsg <string> - SRID
			@param mincut_id_arg <int> - mincut ID
			@param cb <function> - callback

	*/
	function getMincut(x,y,epsg,mincut_id_arg,id_name,cb){
		try{
			_self.emit("log","mincut.js","getMincut("+x+","+y+","+epsg+","+mincut_id_arg+","+id_name+")","info");
			let dataToSend 						= {};
			dataToSend.x							= x;
			dataToSend.y							= y;
			dataToSend.epsg						= epsg;
			dataToSend.mincut_id_arg	= mincut_id_arg;
			dataToSend.id_name				= id_name;
			dataToSend.device 				= _device;
			dataToSend.token					= _token;
			dataToSend.what						= 'GET_MINCUT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","getMincut response","success",response.data.message);
					processGetMincut(response.data.message,cb);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","getMincut","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","getMincut error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*************            END GET MINCUT          ***************
	//****************************************************************

	//****************************************************************
	//*************              GET INFO MINCUT       ***************
	//****************************************************************

	/*
		getInfoMincut
			gets mincut data for Mincut tab on info form

	*/
	function getInfoMincut(id_name,pol_id,fromDate,toDate,cb){
		try{
			_self.emit("log","mincut.js","getInfoMincut("+id_name+","+pol_id+","+fromDate+","+toDate+")","info");
			let dataToSend 						= {};
			dataToSend.id_name				= id_name;
			dataToSend.pol_id					= pol_id;
			dataToSend.toDate					= toDate;
			dataToSend.fromDate				= fromDate;
			dataToSend.device 				= _device;
			dataToSend.token					= _token;
			dataToSend.what						= 'GET_INFO_MINCUT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","getInfoMincut response","success",response.data.message);
					cb(null,response.data.message);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","getInfoMincut","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","getInfoMincut error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*************         END GET INFO MINCUT         **************
	//****************************************************************

	//****************************************************************
	//*************             UPSERT MINCUT           **************
	//****************************************************************

	/***
		upsertMincut


			@param mincut_id <string>
			@param x <float>
			@param y <float>
			@param srid <string> - epsg
			@param device <int>
			@param id_name <string>
			@param pol_id <array>
			@param formData <string>

			@return callback

	***/

	function upsertMincut(mincut_id,x,y,srid,device,id_name,pol_id,formData,cb){

		_self.emit("log","mincut.js","upsertMincut("+mincut_id+","+x+","+y+","+srid+","+device+","+id_name+","+pol_id+")","info",formData);
		let dataToSend 						= {};
		dataToSend.mincut_id			= mincut_id;
		dataToSend.x 							= x;
		dataToSend.y 							= y;
		dataToSend.device 				= device;
		dataToSend.id_name 				= id_name;
		dataToSend.pol_id 				= pol_id;
		dataToSend.srid 					= srid;
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
		dataToSend.token					= _token;
		dataToSend.what						= 'UPSERT_MINCUT';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				_self.emit("log","mincut.js","upsertMincut response","success",response.data.message);
				cb(null,response.data.message);
			}else{
				_self.emit("log","mincut.js","upsertMincut","error",response.data.message);
				cb(response.data.message,response.data.message);
			}
		})
		.catch( (error) => {
			_self.emit("log","mincut.js","upsertMincut","error",error);
			cb(error,false);
			return false;
		});
	}

	//****************************************************************
	//*************         END UPSERT MINCUT           **************
	//****************************************************************

	//****************************************************************
	//*************          GET  MINCUT MANAGER       ***************
	//****************************************************************

	/*
		getMincutManager
			gets mincut data for Mincut tab on info form

	*/
	function getMincutManager(device,cb){
		try{
			_self.emit("log","mincut.js","getMincutManager("+device+")","info");
			let dataToSend 						= {};
			dataToSend.device 				= _device;
			dataToSend.token					= _token;
			dataToSend.what						= 'GET_MINCUT_MANAGER';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","getMincutManager response","success",response.data.message);
					var retorno;
					if(typeof response.data.message.formTabs!="undefined"){
						retorno = response.data.message.formTabs;
						for(let i=0;i<retorno.length;i++){
							retorno[i].fields = _processMincutManagerFields(retorno[i].fields,retorno[i].tabName);
						}
					}
					let activeTabIndex								= _getActiveTab(response.data.message.formTabs);
					retorno.activeTab 								= response.data.message.formTabs[activeTabIndex];
					retorno.activeTab.activeTabIndex	= activeTabIndex;
					retorno.formName 									= response.data.message.formInfo.formName;
					_tabs															= retorno;
					cb(null,retorno);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","getMincutManager","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","getMincutManager error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*************         END GET INFO MINCUT         **************
	//****************************************************************

	//****************************************************************
	//*************         UPDATE MINCUT MANAGER      ***************
	//****************************************************************

	/*
		updateMincutManager
			updates mincut manager

	*/
	function updateMincutManager(formData,tabName,device,cb){
		try{
			_self.emit("log","mincut.js","updateMincutManager("+tabName+","+device+")","info",formData);
			let dataToSend 						= {};
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
			dataToSend.device 				= _device;
			dataToSend.token					= _token;
			dataToSend.tab 						= tabName;
			dataToSend.what						= 'GET_MINCUT_MANAGER';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","updateMincutManager response","success",response.data.message);
					var retorno;
					if(typeof response.data.message.formTabs!="undefined"){
						retorno = response.data.message.formTabs;
						for(let i=0;i<retorno.length;i++){
							retorno[i].fields = _processMincutManagerFields(retorno[i].fields,retorno[i].tabName);
						}
					}
					let activeTabIndex								= _getActiveTab(response.data.message.formTabs);
					retorno.activeTab 								= response.data.message.formTabs[activeTabIndex];
					retorno.activeTab.activeTabIndex	= activeTabIndex;
					_tabs							= retorno;
					cb(null,retorno);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","updateMincutManager","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","updateMincutManager","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//*************       END UPDATE MINCUT MANAGER    ***************
	//****************************************************************

	//****************************************************************
	//**********    UPDATE MINCUT ADD (typeahead field)  *************
	//****************************************************************

	function updateMincutAdd(fields,tabName,fieldName,val){
		_self.emit("log","mincut.js","updateMincutAdd("+tabName+","+fieldName+","+val+")","info",fields);
		let _processedFields 						= _processDataToSend(tabName,fields);
		var dataToSend									= {};
		dataToSend.device								= _device;
		dataToSend.token								= _token;
		dataToSend.what									= 'UPDATE_MINCUT_ADD';
		dataToSend.expected_api_version	= _expected_api_version;
		dataToSend.searchData						= JSON.stringify(_processedFields);
		dataToSend.json 								= 1;
		return axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			if(response.data.status==="Accepted"){
				return response.data.message.data.map(function(item){
					return item;
				});
			}else{
				return response;
			}
		})
		.catch( (error) => {
			return error;
		});

	/*	var options = {
				method: 'POST',
				uri: _baseHref+"/ajax.sewernet.php",
				body: dataToSend,
				headers: {
						'User-Agent': 'Request-Promise'
				},
				json: true
		};
		return rp(options).then(function (response) {
			if(response.status==="Accepted"){
				return response.message.data.map(function(item){
					return item;
				});
			}else{
				return response;
			}
		}).catch(function (err) {
			return err;
		});*/
	}

	//****************************************************************
	//****************      END UPDATE MINCUT ADD      ***************
	//****************************************************************

	//****************************************************************
	//*************          EXCLUDE FROM MINCUT       ***************
	//****************************************************************

	/*
		excludeFromMincut
			excludes a valve from mincut

	*/
	function excludeFromMincut(valve_id,mincut_id,device,cb){
		try{
			_self.emit("log","mincut.js","excludeFromMincut("+valve_id+","+mincut_id+","+device+")","info");
			let dataToSend 						= {};
			dataToSend.valve_id				= valve_id;
			dataToSend.mincut_id			= mincut_id;
			dataToSend.device 				= device;
			dataToSend.token					= _token;
			dataToSend.what						= 'EXCLUDE_FROM_MINCUT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","excludeFromMincut response","success",response.data.message);
					cb(null,response.data.message);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","excludeFromMincut","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","excludeFromMincut","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************       END EXCLUDE FROM MINCUT         *************
	//****************************************************************

	//****************************************************************
	//*************             START MINCUT           ***************
	//****************************************************************

	/*
		startMincut


	*/
	function startMincut(mincut_id,device,cb){
		try{
			_self.emit("log","mincut.js","startMincut("+mincut_id+","+device+")","info");
			let dataToSend 						= {};
			dataToSend.mincut_id			= mincut_id;
			dataToSend.device 				= device;
			dataToSend.token					= _token;
			dataToSend.what						= 'START_MINCUT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","startMincut response","success",response.data.message);
					cb(null,response.data.message);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","startMincut","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","startMincut error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************            END END MINCUT             *************
	//****************************************************************

	//****************************************************************
	//*************               END MINCUT           ***************
	//****************************************************************

	/*
		endMincut


	*/
	function endMincut(mincut_id,device,id_name,pol_id,formData,cb){
		try{
			_self.emit("log","mincut.js","endMincut("+mincut_id+","+device+","+id_name+","+pol_id+")","info",formData);
			let dataToSend 						= {};
			dataToSend.mincut_id			= mincut_id;
			dataToSend.device 				= device;
			dataToSend.token					= _token;
			dataToSend.id_name 				= id_name;
			dataToSend.pol_id					= pol_id;

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
			dataToSend.what						= 'END_MINCUT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","mincut.js","endMincut response","success",response.data.message);
					cb(null,response.data.message);
				}else{
					cb(response.data.message,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","mincut.js","endMincut","error",error);
			});
		}catch(e){
			_self.emit("log","mincut.js","endMincut error","error",e);
			cb(e,false);
		}
	}

	//****************************************************************
	//************            END END MINCUT             *************
	//****************************************************************

	//****************************************************************
	//************          PROCESS MINCUT FORM          *************
	//****************************************************************

	/*
		processGetMincut
			formats combos and buttons for getMincut

			@param obj <json> getMincut response
			@param cb <function> callback
	*/

	function processGetMincut(obj,cb){
		_self.emit("log","mincut.js","processGetMincut response","info",obj);
		let retorno                = {};
		if(typeof obj.formTabs!="undefined"){
			retorno = obj.formTabs;
			for(let i=0;i<retorno.length;i++){
				for(let f=0;f<retorno[i].fields.length;f++){
					if(retorno[i].fields[f]){
						if(retorno[i].fields[f].type==="combo"){
							retorno[i].fields[f].comboValues   = _assignValuesToCombo(retorno[i].fields[f]);
						}else if(retorno[i].fields[f].type==="button"){
							retorno[i].fields[f].buttonAction   = _assignActionsToButton(retorno[i].fields[f]);
						}
					}
				}
			}
			let activeTabIndex						= _getActiveTab(obj.formTabs);
			obj.activeTab 								= obj.formTabs[activeTabIndex];
			obj.activeTab.activeTabIndex	= activeTabIndex;
			obj.formTabs 	= retorno;
			cb(null,obj);
		}else{
			cb("no fields","no fields");
		}
	}

	//****************************************************************
	//************       END PROCESS MINCUT FORM         *************
	//****************************************************************

	//****************************************************************
	//*************           SETTERS/GETTERS          ***************
	//****************************************************************

	function _processMincutManagerFields(fields,tabName){

		for(let f=0;f<fields.length;f++){
			if(fields[f]){
				if(fields[f].type==="combo"){
					fields[f].comboValues   = _assignValuesToCombo(fields[f]);
					fields[f].changeAction   = "updateMincutManager";
				}
				if(fields[f].type==="list"){
					fields[f].changeAction   = "getMincut";
				}else if(fields[f].type==="typeahead"){
					fields[f].getDataAction 	= "updatemincut_add";
					fields[f].selectAction 		= 'select_updatemincut_add';
					fields[f].tabName 		= tabName;
					fields[f].searchService 	= null;
				}
			}
		}
		return fields;
	}

	//****************************************************************
	//*************          END SETTERS/GETTERS       ***************
	//****************************************************************

	//****************************************************************
	//*************               HELPERS              ***************
	//****************************************************************

	function _assignValuesToCombo(object){
		let comboValues = Array();
		try{
			for(let i=0;i<object.comboIds.length;i++){
				comboValues.push({id:object.comboIds[i],name:object.comboNames[i]});
			}
			return comboValues;
		}catch(e){
			_self.emit("log","mincut.js","_assignValuesToCombo error formatting combo","error",e.message);
			return false;
		}
	}

	function _assignActionsToButton(object){
		try{
			if(object.name==="gw_fct_setcoordinates"){
				return "mincutLocation";
			}else if(object.name==="gw_fct_setmincut_start"){
				return "mincutStartMincut";
			}else if(object.name==="gw_fct_setmincut_end"){
				return "mincutEndMincut";
			}
		}catch(e){
			_self.emit("log","mincut.js","_assignActionsToButton error formatting button","error",e.message);
			return false;
		}
	}

	/***
		_processDataToSend
			gets the fields&values from a tab

			@scope private
			@param tabName<string>
			@param fields<json>

			@return <json>
	***/

	function _processDataToSend(tabName,fields){
		let retorno = [];
		for(let i=0;i<_tabs.length;i++){
			if(_tabs[i].tabName===tabName){
				let item 				= {};
				item['tabName']	= _tabs[i].tabName.toLowerCase();
				for (let key in fields) {
					for(let f=0;f<_tabs[i].fields.length;f++){
						if(_tabs[i].fields[f].name===key){
							if(_tabs[i].fields[f].type==="combo"){
								//find comboName
								let name 		= _tabs[i].fields[f].comboNames[_tabs[i].fields[f].comboIds.indexOf(fields[key])];
								item[key]		= {"id":fields[key],"name":name};
							}else if(_tabs[i].fields[f].type==="typeahead"){
								item[key]		= {"text":fields[key]};
							}
						}
					}
				}
				retorno.push(item);
			}
		}
		return retorno;
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

	function _arrayToObj(array) {
		var output = {};
		for (var k in array){
			if (array.hasOwnProperty(k)) {
				output[k] = array[k];
			}
		}
		return output;
	}

	//****************************************************************
	//*************                END HELPERS         ***************
	//****************************************************************
	module.exports 															= Mincut;
	Mincut.prototype.getMincut 									= getMincut;
	Mincut.prototype.getInfoMincut 							= getInfoMincut;
	Mincut.prototype.upsertMincut 							= upsertMincut;
	Mincut.prototype.getMincutManager 					= getMincutManager;
	Mincut.prototype.updateMincutManager 				= updateMincutManager;
	Mincut.prototype.excludeFromMincut 					= excludeFromMincut;
	Mincut.prototype.processGetMincut 					= processGetMincut;
	Mincut.prototype.updateMincutAdd 						= updateMincutAdd;
	Mincut.prototype.endMincut 									= endMincut;
	Mincut.prototype.startMincut 								= startMincut;
	Mincut.prototype.setToken 									= setToken;
})();
