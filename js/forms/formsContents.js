/*jshint esversion: 6 */
(function() {
'use strict';
	const util						  = require('util');
	const _events					  = require('events').EventEmitter;

	let _project_type				= "ws";		//<string> ws or ud
	let _expected_api_version;
	let _self;

	util.inherits(FormsContentsSewernet, _events);

	function FormsContentsSewernet(options){
		if(typeof options.project_type!=="undefined"){
			_project_type 	= options.project_type.toLowerCase();
		}
		_expected_api_version	= options.expected_api_version
		_self    							= this;
		setTimeout(function(){
			_self.emit("log","form.js","FormsContentsSewernet loaded","success");
		},500);
	}

	//****************************************************************
	//********************    FORM AND TABS      *********************
	//****************************************************************

	/***
		getFormByFormId
			obtains form based on formID

			@param formId <string>

			@return <JSON>

	***/

	function getFormByFormId(id){
		let formId;
		let formName;
		let formParent;
		let availableTabs;
		let docSelectorForWebForms;
		if(id==="F16"){
			formId 				= 'F16';
			formName			= 'INFO_GENERIC';
			formParent		=	'formInfo';
		}else if(id==="F21"){
			formId 				= id;
			formName			= 'VISIT';
			formParent		=	'formInfo';
		}else if(id==="F22" || id==="F23" || id==="F24"){
			formId 				= id;
			formName			= 'EVENT_FORM';
			formParent		=	'formInfo';
		}else if(id==="F25"){
			formId 				= id;
			formName			= 'VISIT_MANAGER';
			formParent		=	'formInfo';
		}else if(id==="F27"){
			formId 				= id;
			formName			= 'GALLERY';
			formParent		=	'formInfo';
		}else if(id==="F51"){
			formId 				= id;
			formName			= 'REVIEW_UD_ARC';
			formParent		=	'formReview';
		}else if(id==="F52"){
			formId 				= id;
			formName			= 'REVIEW_UD_NODE';
			formParent		=	'formReview';
		}else if(id==="F53"){
			formId 				= id;
			formName			= 'REVIEW_UD_CONNEC';
			formParent		=	'formReview';
		}else if(id==="F54"){
			formId 				= id;
			formName			= 'REVIEW_UD_GULLY';
			formParent		=	'formReview';
		}else if(id==="F55"){
			formId 				= id;
			formName			= 'REVIEW_WS_ARC';
			formParent		=	'formReview';
		}else if(id==="F56"){
			formId 				= id;
			formName			= 'REVIEW_WS_NODE';
			formParent		=	'formReview';
		}else if(id==="F57"){
			formId 				= id;
			formName			= 'REVIEW_WS_CONNEC';
			formParent		=	'formReview';
		}else{
			formId 											= 'F11';
			formName										= 'INFO_UD_NODE';
			formParent									=	'formInfo';
			elementSelectorForWebForms 	= 'v_ui_element_x_node';
			docSelectorForWebForms			= 'v_ui_doc_x_node';
		}

		let retorn 				= {};
		retorn.formId			= formId;
		retorn.formName		= formName;
		retorn.formParent	= formParent;
		retorn.formTabs 		= _getTabsForFormID(formId);
		return retorn;
	}


	/***
		getTabsForFormID
			obtains an array with available tabs for an specific form

			@param formId <string>

			@return <ARRAY>

	***/

	function _getTabsForFormID(formId){
		let retorno;
		if(formId==="F21"){
			retorno = [];
		}else if(formId==="F22"){
			retorno = [ 'tabEvent_standard' ];
		}else if(formId==="F23"){
			retorno = [ 'tabEvent_ud_arc_standard' ];
		}else if(formId==="F24"){
			retorno = [ 'tabEvent_ud_arc_rehabit' ];
		}else if(formId==="F25"){
			retorno = [];
		}else if(formId==="F27"){
			retorno = ['tabGallery'];
		}else if(formId==="F51" || formId==="F52" || formId==="F53" || formId==="F54" || formId==="F55" || formId==="F56" || formId==="F57"){
			retorno = [];
		}else{
			retorno = ['tabInfo'];
		}
		return retorno;
	}

	//****************************************************************
	//*******************    END FORM AND TABS   *********************
	//****************************************************************
	function getTableFromLayer_id_name(formId,layer_id_name){
		if(formId==="F25"){
			if(layer_id_name==="node_id"){
				return "v_ui_om_visitman_x_node";
			}else if(layer_id_name==="arc_id"){
				return "v_ui_om_visitman_x_arc";
			}else if(layer_id_name==="gully_id"){
				return "v_ui_om_visitman_x_gully";
			}
		}
	}

	module.exports 					           								= FormsContentsSewernet;
	//FormsContentsSewernet.prototype.getFormAndTabs 		= getFormAndTabs;
	FormsContentsSewernet.prototype.getFormByFormId 	= getFormByFormId;
	FormsContentsSewernet.prototype.getTableFromLayer_id_name = getTableFromLayer_id_name;
})();
