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
	let _use_tiled_background;
	let _filters 						= {};
	let _expected_api_version;
	let _activeTab					= null;
	let _tabs 							= null;
	let _strings 						= null;

	util.inherits(Filters, _events);

	function Filters(options){
		if(typeof options.project_type!=="undefined"){
			_project_type 	= options.project_type.toLowerCase();
		}
		_baseHref							= options.baseHref;
		_device								= options.device;
		_token 								= options.token;
		_use_tiled_background	= options.use_tiled_background;
		_expected_api_version	= options.expected_api_version;
		_strings 							= options.strings;

		_self    							= this;
		setTimeout(function(){
			_self.emit("log","Filters.js","Filters module loaded","success");
		},500);
		setTimeout(function(){
			getFormFilters(_use_tiled_background,function(err,msg){
				if(err){
					_self.emit("log","Filters.js","getFormFilters error","error",msg);
					return false;
				}
				_self.emit("notifyToMap","Filters ready",getFilters());
			});
		},1000);
	}
	function setToken(token){
		_token = token;
	}
	//****************************************************************
	//*****************           GET FILTERS          ***************
	//****************************************************************

	/***
		getFormFilters
			gets filters and forms

			@scope public
			@param cb<function>

	***/

	function getFormFilters(use_tiled_background,cb){
		_self.emit("log","Filters.js","getFormFilters("+use_tiled_background+")","info");
		var dataToSend 									= {};
		dataToSend.device								= _device;
		dataToSend.use_tiled_background = use_tiled_background;
		dataToSend.token								= _token;
		dataToSend.what									= 'GET_FILTERS';
		dataToSend.expected_api_version = _expected_api_version;
		let retorno 										= {};
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			try{
				if(response.data.status==="Accepted"){
					_self.emit("log","Filters.js","getFormFilters","success",response.data.message);
				//	response.body.message="Filters not implemented"
					if(response.data.message==="Filters not implemented"){
						cb(null,"Filters not implemented");
					}else{
						if(typeof response.data.message.formTabs!="undefined"){
							retorno = response.data.message.formTabs;
							_tabs 	= response.data.message.formTabs;
							//set filters
							setFilters(retorno);
							//sets activce tab
							let activeTabIndex								= _getActiveTab(response.data.message.formTabs);
							retorno.activeTab 								= response.data.message.formTabs[activeTabIndex];
							retorno.activeTab.activeTabIndex	= activeTabIndex;
							cb(null,retorno);
						}else{
							cb("no fields","no fields");
						}
					}
				}else{
					cb(response.data.status,response.data.message);
				}
			}catch(e){
				_self.emit("log","Filters.js","getFormFilters","error",e.message);
				cb("Error in getFormFilters: "+e.message,null);
			}
		})
		.catch( (error) => {
			_self.emit("log","form.js","getFormFilters","error",error);
		});

	}

	//****************************************************************
	//*************            END GET FILTERS         ***************
	//****************************************************************

	//****************************************************************
	//*************           UPDATE FILTERS           ***************
	//****************************************************************

	/***
		updateFilters
			update filters

			@scope public
			@param key<string>
			@param value<string>
			@param filterName<string>
			@param cb<function>

	***/

	function updateFilters(key,value,tabName,cb){
		try{
			if(value===0){
				value = "0";
			}
			let tabIinfo 										= _getTabData(tabName);
			_self.emit("log","Filters.js","updateFilters("+key+","+value+","+tabName+")","info",tabIinfo);
			let dataToSend 									= {};
			dataToSend.key									= key;
			dataToSend.value								= value;
			dataToSend.tabName							= tabIinfo.tabName;
			dataToSend.tabIdName						= tabIinfo.tabIdName;
			dataToSend.token								= _token;
			dataToSend.what									= 'UPDATE_FILTERS';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","Filters.js","updateFilters response","success",response.data.message);
					//updates filters object
					let index = _filters[tabIinfo.tabIdName].indexOf(key);
					if(value && index===-1){
						_filters[tabIinfo.tabIdName].push(key);
					}
					if((value==="false" || value===false || value===0 || value==="0") && index>-1){
						_filters[tabIinfo.tabIdName].splice(index,1);
					}
					cb(null,response.data.message);
				}else{
					cb(response.data.status,response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","form.js","updateFilters","error",error);
			});
		}catch(e){
			_self.emit("log","Filters.js","updateFilters error","error",e);
			cb(e,false);
		}
	}

	function updateAllFilters(tabs,selectedTab,value,tabName){
		_self.emit("log","Filters.js","updateAllFilters ","info",{tabs,selectedTab,value,tabName});
		return new Promise((resolve, reject) => {
			let activeTab = null;
			if(typeof selectedTab=="object"){
        selectedTab = selectedTab.tabName;
      }
			let tabIinfo = _getTabData(tabName);
			for(let t=0;t<tabs.length;t++){
				tabs[t].active = false;
				if(tabs[t].tabName===selectedTab){
					activeTab = tabs[t];
					tabs[t].active = true;
					activeTab.activeTabIndex = t;
					for(var i=0; i<tabs[t].fields.length; i++){
						if(tabs[t].fields[i].disabled==false){
							tabs[t].fields[i].value = value;
							if(tabs[t].fields[i].name!="select_all"){
								//updates filters object
								let index = _filters[tabIinfo.tabIdName].indexOf(tabs[t].fields[i].name);
								if(value && index===-1){
									_filters[tabIinfo.tabIdName].push(tabs[t].fields[i].name);
								}
								if((value==="false" || value===false || value===0 || value==="0") && index>-1){
									_filters[tabIinfo.tabIdName].splice(index,1);
								}
							}
						}
					}
				}
				tabs.activeTab 								= activeTab;
			}

			let dataToSend 									= {};
			dataToSend.fields								= JSON.stringify(tabs.activeTab.fields);
			dataToSend.tabName							= tabIinfo.tabName;
			dataToSend.tabIdName						= tabIinfo.tabIdName;
			dataToSend.token								= _token;
			dataToSend.what									= 'UPDATE_ALL_FILTERS';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				if(response.data.status==="Accepted"){
					_self.emit("log","Filters.js","updateFilters response","success",response.data.message);
					resolve(tabs);
				}else{
					reject(response.data.message);
				}
			})
			.catch( (error) => {
				_self.emit("log","form.js","updateFilters","error",error);
			});
		});
	}
	//****************************************************************
	//*************           END UPDATE FILTERS       ***************
	//****************************************************************

	//****************************************************************
	//*************           SETTERS/GETTERS          ***************
	//****************************************************************

	/***
		setFilters
			set filters

			@scope private
			@param filters<array>

	***/

	function setFilters(filters){
		_self.emit("log","Filters.js","setFilters()","info",filters);
		for(var i=0; i<filters.length; i++){
			_filters[filters[i].tabIdName] = Array();
			//adds updateAction property to each field

			_addInternalKeysToFields(filters[i].fields,'changeAction','updateFilters');
			filters[i].fields.unshift({'label':_strings.ALL,'name':'select_all','dataType':"boolean",'disabled':false,'type':'check','value':false});
			//sets activeTab for form
			if(filters[i].active){
				_activeTab = filters[i].tabIdName;
			}
			for(let f=0;f<filters[i].fields.length;f++){
				if(filters[i].fields[f].value){
					if(_filters[filters[i].tabIdName].indexOf(filters[i].fields[f].name)===-1){
						_filters[filters[i].tabIdName].push(filters[i].fields[f].name);
					}
				}
			}
		}
	}

	/***
		getFilters
			returns current filters

			@scope public
			@return <object>

	***/

	function getFilters(){
		return _filters;
	}

	/***
		_addInternalKeysToFields
			adds properties to json

			@scope private
			@return <object>

	***/

	function _addInternalKeysToFields(fields,key,value){
		for(let i=0;i<fields.length;i++){
			if(fields[i]){
				fields[i][key] = value;
			}
		}
	}

	/***
		_getTabData
			gets tabData needed on update

			@scope private
			@param tabName <string>
			@return <object>

	***/

	function _getTabData(tabName){
		_self.emit("log","Filters.js","_getTabData("+tabName+")","info",_tabs);
		let retorno	= {};
		for(let i=0;i<_tabs.length;i++){
			if(_tabs[i].tabName===tabName){
				retorno.tabName 	= _tabs[i].tabName;
				retorno.tabIdName = _tabs[i].tabIdName;
				break;
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

	function setLocalizedStrings(strings){
		_strings = strings;
	}
	//****************************************************************
	//*************          END SETTERS/GETTERS       ***************
	//****************************************************************

	module.exports 					           								= Filters;
	Filters.prototype.updateFilters 									= updateFilters;
	Filters.prototype.updateAllFilters								= updateAllFilters;
	Filters.prototype.getFilters 											= getFilters;
	Filters.prototype.getFormFilters									= getFormFilters;
	Filters.prototype.setToken 									     	= setToken;
	Filters.prototype.setLocalizedStrings 						= setLocalizedStrings;

})();
