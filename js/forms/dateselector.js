/*jshint esversion: 6 */
(function() {
'use strict';
	const util						= require('util');
	const _events					= require('events').EventEmitter;
	const axios = require('axios');

	let _self;
	let _token;
	let _baseHref;
	let _device;
	let _expected_api_version;
	let _activeTab          = null;
	let _tabs               = null;
	let _use_tiled_background = false;
	let _currentFilters = null;

	util.inherits(DateSelector, _events);

	function DateSelector(options){
		_token                 = options.token;
		_baseHref              = options.baseHref;
		_device                = options.device;
		_expected_api_version  = options.expected_api_version;
		_use_tiled_background = options.use_tiled_background;
		_self                  = this;
		setTimeout(function(){
			_self.emit("log","DateSelector.js","DateSelector module loaded","success");
		},700);
		setTimeout(function(){
			 getDatesForm(_use_tiled_background,function(err,msg){
				if(err){
					_self.emit("log","DateSelector.js","getDatesForm error","error",msg);
					return false;
				}
				_self.emit("log","DateSelector.js","getDatesForm on start module","success",_currentFilters);
				if(_currentFilters){
					_self.emit("notifyToMap","DateFilters ready",_currentFilters);
				}
			});
		},910);
	}

	function setToken(token){
		_token = token;
	}
	//****************************************************************
	//*****************         GET DATES FORM         ***************
	//****************************************************************

	/***
		getDatesForm
			gets dateselector form

			@scope public
			@param cb<function>

	***/

	function getDatesForm(use_tiled_background,cb){
		_self.emit("log","DateSelector.js","getDatesForm()","info");
		var dataToSend 									= {};
		dataToSend.device								= _device;
		dataToSend.use_tiled_background = use_tiled_background;
		dataToSend.token								= _token;
		dataToSend.what									= 'GET_DATES_SELECTOR_FORM';
		dataToSend.expected_api_version = _expected_api_version;
		let retorno 										= {};
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			try{
				if(response.data.status==="Accepted"){
					_self.emit("log","DateSelector.js","getDatesForm","success",response.data.message);
					if(typeof response.data.message.formTabs!="undefined"){
						retorno = response.data.message.formTabs;
						_tabs 	= response.data.message.formTabs;
						//add a button
						retorno[0].buttons 	= [_createButton("Filtrar","dateSelector","filterDateAction",false)];
						//set active tab
						let activeTabIndex								= _getActiveTab(response.data.message.formTabs);
						retorno.activeTab 								= response.data.message.formTabs[activeTabIndex];
						retorno.activeTab.activeTabIndex	= activeTabIndex;
						retorno.formName 									= response.data.message.formInfo.formName;
						if(retorno.activeTab.fields[0].value){
							_currentFilters = {
								'date_from': retorno.activeTab.fields[0].value,
								'date_to': retorno.activeTab.fields[1].value
							}
						}
						cb(null,retorno);
					}
				}else{
					cb(body.status,body.message);
				}
			}catch(e){
				_self.emit("log","DateSelector.js","getDatesForm","error",e.message);
				cb("Error in getDatesForm: "+e.message,null);
			}
		})
		.catch( (error) => {
			_self.emit("log","DateSelector.js","getDatesForm","error",error);
		});
	}


	//****************************************************************
	//*************            END GET FILTERS         ***************
	//****************************************************************

	//****************************************************************
	//*****************        SET FILTER DATE         ***************
	//****************************************************************


	/***
		setFilterDate


			@scope public
			@param formData<object>
			@param extent<string>

			@param cb<function>

	***/

	function setFilterDate(formData,cb){
		_self.emit("log","DateSelector.js","setFilterDate()","info",formData);

		var dataToSend 									= {};
		dataToSend.device								= _device;
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
		dataToSend.token								= _token;
		dataToSend.what									= 'SET_FILTER_DATE';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			try{
				if(response.data.status==="Accepted"){
					_self.emit("log","DateSelector.js","setFilterDate","success",response.data.message);
					cb(null,response.data);
				}else{
					cb(response.data,response.data);
				}
			}catch(e){
				_self.emit("log","DateSelector.js","setFilterDate","error",e.message);
				cb("Error in setFilterDate: "+e.message,null);
			}
		})
		.catch( (error) => {
			_self.emit("log","DateSelector.js","setFilterDate","error",error);
		});
	}

	//****************************************************************
	//*****************       END SET FILTER DATE      ***************
	//****************************************************************

	//****************************************************************
	//*************            SETTERS/GETTERS         ***************
	//****************************************************************

	/***
		_createButton
			creates JSON for form button component

			@scope private
			@param label<string>
			@param name<string>
			@param action<string>
			@param disabled<boolean>

			@return <json>

	***/

	function _createButton(label,name,action,disabled){
		let retorno						= {};
		retorno.buttonAction	= action;
		retorno.disabled 			= disabled;
		retorno.label 				= label;
		retorno.name 					= name;
		retorno.type 					= "button";
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
	//****************************************************************
	//*************          END SETTERS/GETTERS       ***************
	//****************************************************************

	module.exports																			= DateSelector;
	DateSelector.prototype.getDatesForm									= getDatesForm;
	DateSelector.prototype.setFilterDate 								= setFilterDate;
	DateSelector.prototype.setToken 										= setToken;

})();
