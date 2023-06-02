/*jshint esversion: 6 */
(function() {
'use strict';
	const util							= require('util');
	const _events						= require('events').EventEmitter;
	const axios             = require('axios');
	const jsPDF 						= require('jsPDF');
	let _self;
	let _token;
	let _baseHref;
	let _device;
	let _expected_api_version;
	let _composers;
	let _composerData;

	util.inherits(Print, _events);

	function Print(options){
		_token                 = options.token;
		_baseHref              = options.baseHref;
		_device                = options.device;
		_expected_api_version  = options.expected_api_version;
		_self                  = this;
		setTimeout(function(){
			_self.emit("log","Print.js","Search module loaded","success");
		},500);
	}
	function setToken(token){
		_token = token;
	}
	//****************************************************************
	//*****************         GET PRINT FORM         ***************
	//****************************************************************

	/***
		getPrintForm
			builds print form

			@scope public
			@param composers<object>
			@param cb<function>

	***/

	function getPrintForm(composers,cb){
		_self.emit("log","Print.js","getPrintForm("+composers+")","info",composers);
		let retorno 										= Array();
		let composerNames								= Array();
		_composerData 									= Array();
		_composerData.ComposerTemplates	= Array();

		if(typeof composers=="object"){
			for(let i=0;i<composers.length;i++){
				if(composers[i].getAttribute('name')){
					let item 								= {};
					item.ComposerTemplate 	= composers[i].getAttribute('name');
					item.ComposerMap				= Array();
					var x 									= composers[i].childNodes;
					x.forEach(function(node){
						if(node.nodeName==="ComposerMap"){
							let ComposerMap = {
								'width': node.getAttribute('width'),
								'height': node.getAttribute('height'),
								'name': node.getAttribute('name')
							}
							item.ComposerMap.push(ComposerMap);
						}
					});
					_composerData.ComposerTemplates.push(item);
					composerNames.push(composers[i].getAttribute('name'));
				}
			}
		}
		if(composerNames.length>0){
			var dataToSend 									= {};
			dataToSend.device								= _device;
			dataToSend.composers 						= JSON.stringify(composerNames);
			dataToSend.token								= _token;
			dataToSend.what									= 'GET_PRINT';
			dataToSend.expected_api_version = _expected_api_version;
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				try{
					if(response.data.status==="Accepted"){
						_self.emit("log","Print.js","getPrintForm","success",response.data.message);
						if(typeof response.data.message.formTabs!="undefined"){
							retorno = response.data.message.formTabs;
							for(let i=0;i<retorno.length;i++){
								for(let f=0;f<retorno[i].fields.length;f++){
									if(retorno[i].fields[f]){
										if(retorno[i].fields[f].type==="combo"){
											retorno[i].fields[f].comboValues   = _assignValuesToCombo(retorno[i].fields[f]);
										}
									}
								}
								//add a button
								retorno[i].buttons 	= [_createButton("Print","print","printAction",false),_createButton("Screenshot","screenshot","captureScreenAction",false)];
								//set active tab
								let activeTabIndex								= _getActiveTab(response.data.message.formTabs);
								retorno.activeTab 								= response.data.message.formTabs[activeTabIndex];
								retorno.activeTab.activeTabIndex	= activeTabIndex;
								retorno.formName 									= response.data.message.formInfo.formName;
							}
							cb(null,retorno);
						}else{
							cb("no fields","no fields");
						}
					}else{
						cb(response.data,response.data);
					}
				}catch(e){
					_self.emit("log","Print.js","getPrintForm","error",e.message);
					cb("Error in getPrintForm: "+e.message,null);
				}
			})
			.catch( (error) => {
				_self.emit("log","Print.js","getPrintForm","error",error);
			});
		}else{
			cb("no composers","no composers");
		}
	}

	//****************************************************************
	//*****************      END GET PRINT FORM        ***************
	//****************************************************************

	//****************************************************************
	//*****************           UPDATE PRINT         ***************
	//****************************************************************

	/***
		updatePrint


			@scope public
			@param formData<object>
			@param extent<string>

			@param cb<function>

	***/

	function updatePrint(formData,extent,use_tiled_background,cb){
		_self.emit("log","Print.js","updatePrint("+extent+","+use_tiled_background+")","info",formData);

		var dataToSend 									= {};
		dataToSend.device								= _device;
		//"ComposerTemplates":[{"ComposerTemplate":"mincutA4","ComposerMap":[{"width":"179.414","height":"140.826","name":"map0"},{"width":"77.729","height":"55.9066","name":"map7"}]},{"ComposerTemplate":"mincutA3","ComposerMap":[{"width":"53.44","height":"55.9066","name":"map7"},{"width":"337.865","height":"275.914","name":"map6"}]}]
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
		//Add composer templates
		for (var k in _composerData) {
			if (_composerData.hasOwnProperty(k)) {
				if(_composerData[k]!=""){
					dataToSend[k] = 	_composerData[k];
				}else if(_composerData[k]===0){
						dataToSend[k] = 	"0";
				}
			}
		}
		dataToSend.extent								= extent;
		dataToSend.use_tiled_background	= use_tiled_background;
		dataToSend.token								= _token;
		dataToSend.what									= 'UPDATE_PRINT';
		dataToSend.expected_api_version = _expected_api_version;
		axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
			try{
				if(response.data.status==="Accepted"){
					_self.emit("log","Print.js","updatePrint","success",response.data.message);
					let retorno						= {};
					let composerName 			= formData['composer'];
					retorno.composerName	= composerName;
					retorno.extent 				= response.data.message.data.extent;
					retorno.map 					= response.data.message.data.map;
					retorno.geometry 			= response.data.message.data.geometry;
					if(typeof response.data.message.tiledLayers!="undefined"){
						let tiledLayers				= Array();
						for(let i=0;i<response.data.message.tiledLayers.length;i++){
							tiledLayers.push(response.data.message.tiledLayers[i].layer_id);
						}
						retorno.tiledLayers 	= tiledLayers;
					}else{
						retorno.tiledLayers		= null;
					}
					if(composerName){
						cb(null,retorno);
					}else{
						cb("composer not found","composer not found");
					}
				}else{
					cb(response.data,response.data);
				}
			}catch(e){
				_self.emit("log","Print.js","updatePrint","error",e.message);
				cb("Error in updatePrint: "+e.message,null);
			}
		})
		.catch( (error) => {
			_self.emit("log","Print.js","updatePrint","error",error);
		});
	}

	//****************************************************************
	//*****************       END UPDATE PRINT         ***************
	//****************************************************************

	//****************************************************************
	//*****************          PRINT COMPOSER        ***************
	//****************************************************************

	/***
		printComposer
			prints a composer

			@scope public
			@param composer<string>
			@param extent<string>
			@param cb<function>

	***/

	function printComposer(composer,extent,map,tiledLayers,filters,cb){
		_self.emit("log","Print.js","printComposer("+composer+","+extent+","+map+")","info",_baseHref+'print.php?composer='+composer+'&extent='+extent.slice(1, -1)+"&map="+map+"&tiledLayers="+tiledLayers+"&filters="+filters);
		window.open(_baseHref+'print.php?composer='+composer+'&extent='+extent.slice(1, -1)+"&map="+map+"&tiledLayers="+tiledLayers+"&filters="+filters);
		//delete generated pdf from server after N seconds
		setTimeout(()=>{
			var dataToSend					= {};
			dataToSend.token				= _token;
			dataToSend.composer			= composer;
			dataToSend.what					= 'CLEAN_PRINT';
			axios.post(_baseHref+'/ajax.sewernet.php', dataToSend).then(function (response) {
				_self.emit("log","forms.js","getWebForms","success",response.data.message);
				cb(null,response.data);
			})
			.catch( (error) => {
				_self.emit("log","Print.js","printComposer","error",error);
			});
		},5000);
	}

	//****************************************************************
	//*****************       END PRINT COMPOSER       ***************
	//****************************************************************

	//****************************************************************
	//*****************          CAPTURE SCREEN        ***************
	//****************************************************************

	function captureScreen(map,cb){
		_self.emit("log","Print.js","captureScreen()","info");
		var format 			= 'a4';
		var resolution 	= 150;
		var dim 				= [297, 210];
		var width 			= Math.round(dim[0] * resolution / 25.4);
		var height 			= Math.round(dim[1] * resolution / 25.4);
		var size 				= /** @type {module:ol/size~Size} */ (map.getSize());
		let totalLayers = map.getLayers().getLength();
		let currentRendered = 0;
		let tiledStarted 		= 0;
		let tiledEnd 				= 0;
		let pdfGenerated		= false;
		var extent 					= map.getView().calculateExtent(size);
		var erroTo 					= setTimeout(()=>{
			_self.emit("log","Print.js","captureScreen() error","warn");
			map.setSize(size);
			map.getView().fit(extent, {size: size});
			cb(true,"Uncacatched print error");
		},60000);
		map.setSize(size);
		map.getView().fit(extent, {size: size});
		map.once('postcompose', function(event) {
			try{
				var canvas = event.context.canvas;
				map.getLayers().forEach(function(layer) {
					layer.once('postcompose', function(evt2) {
						let sc = layer.getSource();
						var listenerKey = sc.on('tileloadstart', function(){
							tiledStarted++;
						});
						var listenerKey2 = sc.on('tileloadend',function(kk){
							tiledEnd++;
							if(tiledStarted==tiledEnd){

								if(!pdfGenerated){
									pdfGenerated = true;
									setTimeout(()=>{
										var data = canvas.toDataURL('image/png');
										var pdf = new jsPDF('landscape', undefined, format);
										pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
										pdf.save('map.pdf');
										_self.emit("log","Print.js","captureScreen() PDF generated","success");
										map.setSize(size);
										map.getView().fit(extent, {size: size});
										ol.Observable.unByKey(listenerKey);
										ol.Observable.unByKey(listenerKey2);
										cb(null,null);
										clearTimeout(erroTo);
										erroTo = null;
									},10000);
								}
							}
						});
					});
				});
			}catch(e){
				_self.emit("log","Print.js","captureScreen() CORS error","warn",e);
				map.setSize(size);
				map.getView().fit(extent, {size: size});
				cb(true,"One of the backgrounds is not exportable");
			}

		});
		// Set print size
		var printSize = [width, height];
		map.setSize(printSize);
		map.getView().fit(extent, {size: printSize});
		map.renderSync();
	}


	//****************************************************************
	//*****************       END CAPTURE SCREEN       ***************
	//****************************************************************

	//****************************************************************
	//*************           SETTERS/GETTERS          ***************
	//****************************************************************

	/***
		_createCombo
			creates JSON for form combo component

			@scope private
			@param data<json>

			@return <json>

	***/

	function _createCombo(data){
		let retorno					= {};
		retorno.comboIds		= data;
		retorno.comboNames	= data;
		let comboValues			= Array();
		for(let i=0;i<data.length;i++){
			comboValues.push({id:data[i],name:data[i]});
		}
		retorno.comboValues = comboValues;
		retorno.dataType 		=  "string";
		retorno.disabled 		= false;
		retorno.label 			= "Composer";
		retorno.name 				= "Composer";
		retorno.selectedId 	= data[0];
		retorno.type 				= "combo";
		return retorno;
	}

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
				if(object.name==="composer"){
					for(let c=0;c<_composerData.length;c++){
						if(_composerData[i]===object.comboNames[i]){
							_composerData[i].id = object.comboIds[i];
						}
					}
				}
			}
			if(object.name==="composer"){
				_composers = comboValues;
			}
			return comboValues;
		}catch(e){
			_self.emit("log","print.js","_assignValuesToCombo error formatting combo","error",e.message);
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
	//****************************************************************
	//*************          END SETTERS/GETTERS       ***************
	//****************************************************************

	module.exports																			= Print;
	Print.prototype.getPrintForm												= getPrintForm;
	Print.prototype.printComposer 											= printComposer;
	Print.prototype.updatePrint 												= updatePrint;
	Print.prototype.captureScreen 											= captureScreen;
	Print.prototype.setToken 														= setToken;
})();
