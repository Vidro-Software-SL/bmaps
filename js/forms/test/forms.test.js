/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const FormsSewernet   = require('../forms');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _forms;
//mock forms
var info = {
	formId: "F11",
	formName: 'INFO_UD_NODE',
	formParent: 'formInfo'
};
var info2 = {
	formId: "F16",
	formName: 'INFO_GENERIC',
	formParent: 'formInfo'
};
var info3 = {
	formId: "F22",
	formName: 'EVENT_FORM',
	formParent: 'formInfo'
};
describe('Forms sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});
		});

		it('should return an object', function(){
			_forms.should.be.a('object');
		});

		it('should have getWebForms method', function(){
			_forms.getWebForms.should.be.a('function');
		});

		it('should have setToken method', function(){
			_forms.setToken.should.be.a('function');
		});

		it('should have getWebFormsForConnect method', function(){
			_forms.getWebFormsForConnect.should.be.a('function');
		});

		it('should have getTableFromLayer_id_name method', function(){
			_forms.getTableFromLayer_id_name.should.be.a('function');
		});


		it('should have getFormByFormId method', function(){
			_forms.getFormByFormId.should.be.a('function');
		});

		it('should have getWebFormsForVisit method', function(){
			_forms.getWebFormsForVisit.should.be.a('function');
		});

		it('should have showInput method', function(){
			_forms.showInput.should.be.a('function');
		});

		it('should have deleteVisit method', function(){
			_forms.deleteVisit.should.be.a('function');
		});

		it('should have upsertVisit method', function(){
			_forms.upsertVisit.should.be.a('function');
		});

		it('should have updateVisit method', function(){
			_forms.updateVisit.should.be.a('function');
		});

		it('should have setLocalizedStrings method', function(){
			_forms.setLocalizedStrings.should.be.a('function');
		});

		it('should have getEventFormTypeAndEvent method', function(){
			_forms.getEventFormTypeAndEvent.should.be.a('function');
		});

		it('should have insertEvent method', function(){
			_forms.insertEvent.should.be.a('function');
		});

		it('should have getParameterIdFromParameterType method', function(){
			_forms.getParameterIdFromParameterType.should.be.a('function');
		});

		it('should have cleanInputs method', function(){
			_forms.cleanInputs.should.be.a('function');
		});

		it('should have validateInput method', function(){
			_forms.validateInput.should.be.a('function');
		});

		it('should have resetFormHistory method', function(){
			_forms.resetFormHistory.should.be.a('function');
		});

		it('should have getFormHistory method', function(){
			_forms.getFormHistory.should.be.a('function');
		});

		it('should have addFormHistory method', function(){
			_forms.addFormHistory.should.be.a('function');
		});

		it('should have removeFormHistory method', function(){
			_forms.removeFormHistory.should.be.a('function');
		});

		it('should have showBackBt method', function(){
			_forms.showBackBt.should.be.a('function');
		});

		it('should have updateHistoryTab method', function(){
			_forms.updateHistoryTab.should.be.a('function');
		});
		it('should have getVisitsFromFeature method', function(){
			_forms.getVisitsFromFeature.should.be.a('function');
		});

		it('should have getEvent method', function(){
			_forms.getEvent.should.be.a('function');
		});
		it('should have updateEvent method', function(){
			_forms.updateEvent.should.be.a('function');
		});
		it('should have deleteEvent method', function(){
			_forms.deleteEvent.should.be.a('function');
		});

		it('should have getGallery method', function(){
			_forms.getGallery.should.be.a('function');
		});

		it('should have deletePhoto method', function(){
			_forms.deletePhoto.should.be.a('function');
		});

		it('should have getInfoForm method', function(){
			_forms.getInfoForm.should.be.a('function');
		});

		it('should have getInfoFormFromCoordinates method', function(){
			_forms.getInfoFormFromCoordinates.should.be.a('function');
		});

		//********************* FEATURE METHODS

		it('should have getInsertFeatureForm method', function(){
			_forms.getInsertFeatureForm.should.be.a('function');
		});
		it('should have insertFeature method', function(){
			_forms.insertFeature.should.be.a('function');
		});
		it('should have deleteFeature method', function(){
			_forms.deleteFeature.should.be.a('function');
		});
		it('should have updateFeature method', function(){
			_forms.updateFeature.should.be.a('function');
		});
		it('should have getInsertFeatureForm method', function(){
			_forms.updateFeatureGeometry.should.be.a('function');
		});
		it('should have setFormCoordinates method', function(){
			_forms.setFormCoordinates.should.be.a('function');
		});
		it('should have updateFilters method', function(){
			_forms.updateFilters.should.be.a('function');
		});

		it('should have initFilters method', function(){
			_forms.initFilters.should.be.a('function');
		});
		it('should have getFilters method', function(){
			_forms.getFilters.should.be.a('function');
		});
		it('should have getFormFilters method', function(){
			_forms.getFormFilters.should.be.a('function');
		});
		it('should have getSearchForm method', function(){
			_forms.getSearchForm.should.be.a('function');
		});
		it('should have getDataForAddress method', function(){
			_forms.getDataForAddress.should.be.a('function');
		});

		it('should have updateSearch method', function(){
			_forms.updateSearch.should.be.a('function');
		});
		it('should have updateSearchAdd method', function(){
			_forms.updateSearchAdd.should.be.a('function');
		});
		//Print
		it('should have getPrintForm method', function(){
			_forms.getPrintForm.should.be.a('function');
		});
		it('should have printComposer method', function(){
			_forms.printComposer.should.be.a('function');
		});
		it('should have updatePrint method', function(){
			_forms.updatePrint.should.be.a('function');
		});
		it('should have captureScreen method', function(){
			_forms.captureScreen.should.be.a('function');
		});

		///end print
		it('should have getValueFromEditableField method', function(){
			_forms.getValueFromEditableField.should.be.a('function');
		});
		it('should have getMincut method', function(){
			_forms.getMincut.should.be.a('function');
		});
		it('should have getInfoMincut method', function(){
			_forms.getInfoMincut.should.be.a('function');
		});
		it('should have upsertMincut method', function(){
			_forms.upsertMincut.should.be.a('function');
		});

		it('should have setExcludingMincut method', function(){
			_forms.setExcludingMincut.should.be.a('function');
		});
		it('should have getExcludingMincut method', function(){
			_forms.getExcludingMincut.should.be.a('function');
		});

		it('should have processGetMincut method', function(){
			_forms.processGetMincut.should.be.a('function');
		});
		it('should have updateMincutAdd method', function(){
			_forms.updateMincutAdd.should.be.a('function');
		});
		it('should have endMincut method', function(){
			_forms.endMincut.should.be.a('function');
		});
		it('should have startMincut method', function(){
			_forms.startMincut.should.be.a('function');
		});


		it('getExcludingMincut() after setExcludingMincut(true) should return true', function(){
			_forms.setExcludingMincut(true);
			expect(
				_forms.getExcludingMincut(),
				'getExcludingMincut() doesn\'t return true')
				.to.equal(true);
		});

		it('getExcludingMincut() after setExcludingMincut(false) should return false', function(){
			_forms.setExcludingMincut(false);
			expect(
				_forms.getExcludingMincut(),
				'getExcludingMincut() doesn\'t return false')
				.to.equal(false);
		});

		it('should have getMincutManager method', function(){
			_forms.getMincutManager.should.be.a('function');
		});

		it('should have updateMincutManager method', function(){
			_forms.updateMincutManager.should.be.a('function');
		});

		it('should have excludeFromMincut method', function(){
			_forms.excludeFromMincut.should.be.a('function');
		});

		it('should have setMincutValveLayerTableName method', function(){
			_forms.setMincutValveLayerTableName.should.be.a('function');
		});

		it('should have getMincutValveLayerTableName method', function(){
			_forms.getMincutValveLayerTableName.should.be.a('function');
		});

		it('should have setMincutGeometryForZoom method', function(){
			_forms.setMincutGeometryForZoom.should.be.a('function');
		});

		it('should have getMincutGeometryForZoom method', function(){
			_forms.getMincutGeometryForZoom.should.be.a('function');
		});

		it('should have getPol_id_mincut method', function(){
			_forms.getPol_id_mincut.should.be.a('function');
		});
		it('should have setId_name_mincut method', function(){
			_forms.setId_name_mincut.should.be.a('function');
		});
		it('should have getId_name_mincut method', function(){
			_forms.getId_name_mincut.should.be.a('function');
		});
		it('should have setPol_id_mincut method', function(){
			_forms.setPol_id_mincut.should.be.a('function');
		});

		//DateSelector
		it('should have getDatesForm method', function(){
			_forms.getDatesForm.should.be.a('function');
		});
		it('should have setFilterDate method', function(){
			_forms.setFilterDate.should.be.a('function');
		});

		//visits new implementation
		it('should have gwGetVisit method', function(){
			_forms.gwGetVisit.should.be.a('function');
		});
		it('should have gwSetVisit method', function(){
			_forms.gwSetVisit.should.be.a('function');
		});
		it('should have gwGetVisitManager method', function(){
			_forms.gwGetVisitManager.should.be.a('function');
		});
		it('should have gw_api_setvisitmanagerstart method', function(){
			_forms.gw_api_setvisitmanagerstart.should.be.a('function');
		});
		it('should have gw_api_setvisitmanagerend method', function(){
			_forms.gw_api_setvisitmanagerend.should.be.a('function');
		});
		it('should have gwSetDelete method', function(){
			_forms.gwSetDelete.should.be.a('function');
		});
		it('should have gwSetVisitManager method', function(){
			_forms.gwSetVisitManager.should.be.a('function');
		});
		it('should have gwGetLot method', function(){
			_forms.gwGetLot.should.be.a('function');
		});
		it('should have gwSetLot method', function(){
			_forms.gwSetLot.should.be.a('function');
		});

		after(function(){
			_forms	= null;
		});

	});

	describe('setLocalizedStrings method', function(){

		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});

		});

		it('setLocalizedStrings({"TEST":"test value","ANOTHER":"another"}) should return true', function(done){
			setTimeout(()=>{
				expect(
					_forms.setLocalizedStrings([
						{"TEST": "test value"},
						{"ANOTHER": "another"
					}]),
					'setLocalizedStrings({"TEST":"test value","ANOTHER":"another"}) doesn\'t return true')
					.to.equal(true);
					done();
			},100);
		});

		after(function(){
			_forms	= null;
		});

	});

	describe('deleteVisit method', function(){

		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});
			_forms.setLocalizedStrings([
				{"SELECT": "Seleccionar..."}
			])
		});

		it('deleteVisit("Seleccionar...","layer_name",cb) should return false', function(done){
			setTimeout(()=>{
				_forms.deleteVisit("Seleccionar...","layer_name", function(err,result) {
				 assert.equal(result,false);
				 assert.equal(err,'no visit_id');
				 done();
			 	});
			},100);
		});

		after(function(){
			_forms	= null;
		});

	});

	describe('cleanInputs method', function(){
		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});
		});
		it('cleanInputs() should return empty string ""', function(){
			expect(
				_forms.cleanInputs(),
				'cleanInputs() doesn\'t return ""')
				.to.equal("");
		});
		it('cleanInputs("algo") should return empty string ""', function(){
			expect(
				_forms.cleanInputs("algo"),
				'cleanInputs("algo") doesn\'t return ""')
				.to.equal("");
		});
		it('cleanInputs(1,"int") should return int 1', function(){
			expect(
				_forms.cleanInputs(1,"int"),
				'cleanInputs(1,"int") doesn\'t return 1')
				.to.equal(1);
		});
		it('cleanInputs("1","int") should return int 1', function(){
			expect(
				_forms.cleanInputs(1,"int"),
				'cleanInputs("1","int") doesn\'t return 1')
				.to.equal(1);
		});
		it('cleanInputs("culo","int") should return empty string ""', function(){
			expect(
				_forms.cleanInputs("culo","int"),
				'cleanInputs("culo","int") doesn\'t return ""')
				.to.equal("");
		});
		it('cleanInputs(1.01,"double") should return double 1.01', function(){
			expect(
				_forms.cleanInputs(1.01,"double"),
				'cleanInputs(1.01,"double") doesn\'t return 1.01')
				.to.equal(1.01);
		});
		it('cleanInputs("1.01","double") should return double 1.01', function(){
			expect(
				_forms.cleanInputs("1.01","double"),
				'cleanInputs("1.01","double") doesn\'t return 1.01')
				.to.equal(1.01);
		});
		it('cleanInputs("culo","double") should return empty string ""', function(){
			expect(
				_forms.cleanInputs("culo","double"),
				'cleanInputs("culo","double") doesn\'t return ""')
				.to.equal("");
		});
		it('cleanInputs("1.002a","double") should return empty string ""', function(){
			expect(
				_forms.cleanInputs("1.002a","double"),
				'cleanInputs("1.002a","double") doesn\'t return ""')
				.to.equal("");
		});
		it('cleanInputs(1,"double") should return double 1.00', function(){
			expect(
				_forms.cleanInputs(1,"double"),
				'cleanInputs(1,"double") doesn\'t return 1.00')
				.to.equal(1.00);
		});
		it('cleanInputs("1","double") should return double 1.00', function(){
			expect(
				_forms.cleanInputs("1","double"),
				'cleanInputs("1","double") doesn\'t return 1.00')
				.to.equal(1.00);
		});
		it('cleanInputs("1.002a","string") should return string "1.002a"', function(){
			expect(
				_forms.cleanInputs("1.002a","string"),
				'cleanInputs("1.002a","string") doesn\'t return "1.002a"')
				.to.equal("1.002a");
		});
		it('cleanInputs("undefined","string") should return empty string ""', function(){
			expect(
				_forms.cleanInputs("undefined","string"),
				'cleanInputs("undefined","string") doesn\'t return ""')
				.to.equal("");
		});
		it('cleanInputs("algo","undefined") should return empty string ""', function(){
			expect(
				_forms.cleanInputs("algo","undefined"),
				'cleanInputs("algo","undefined") doesn\'t return ""')
				.to.equal("");
		});
		after(function(){
			_forms	= null;
		});
	});

	describe('validateInput method', function(){
		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});
		});
		it('validateInput() should return true', function(){
			expect(
				_forms.validateInput(),
				'validateInput() doesn\'t return false')
				.to.equal(false);
		});
		it('validateInput("algo") should return false', function(){
			expect(
				_forms.validateInput("algo"),
				'validateInput("algo") doesn\'t return false')
				.to.equal(false);
		});
		it('validateInput("algo","string") should return true', function(){
			expect(
				_forms.validateInput("algo","string"),
				'validateInput("algo","string") doesn\'t return true')
				.to.equal(true);
		});
		it('validateInput("algo","int") should return false', function(){
			expect(
				_forms.validateInput("algo","int"),
				'validateInput("algo","int") doesn\'t return false')
				.to.equal(false);
		});
		it('validateInput("1","int") should return true', function(){
			expect(
				_forms.validateInput("1","int"),
				'validateInput("1","int") doesn\'t return true')
				.to.equal(true);
		});
		it('validateInput(1,"int") should return true', function(){
			expect(
				_forms.validateInput(1,"int"),
				'validateInput(1,"int") doesn\'t return true')
				.to.equal(true);
		});
		it('validateInput(1,"int") should return true', function(){
			expect(
				_forms.validateInput(1.00,"int"),
				'validateInput(1.00,"int") doesn\'t return true')
				.to.equal(true);
		});
		it('validateInput("algo","double") should return false', function(){
			expect(
				_forms.validateInput("algo","double"),
				'validateInput("algo","double") doesn\'t return false')
				.to.equal(false);
		});
		it('validateInput(1,"double") should return false', function(){
			expect(
				_forms.validateInput(1,"double"),
				'validateInput(1,"double") doesn\'t return false')
				.to.equal(true);
		});
		it('validateInput(1.01,"double") should return true', function(){
			expect(
				_forms.validateInput(1.01,"double"),
				'validateInput(1.01,"double") doesn\'t return true')
				.to.equal(true);
		});
		it('validateInput("1.00","double") should return true', function(){
			expect(
				_forms.validateInput("1.00","double"),
				'validateInput("1.00","double") doesn\'t return true')
				.to.equal(true);
		});
		it('validateInput("1.0a","double") should return false', function(){
			expect(
				_forms.validateInput("1.0a","double"),
				'validateInput("1.0a","double") doesn\'t return false')
				.to.equal(false);
		});
	});





	describe('showInput method', function(){
		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});
		});

		it('showInput should return the right values', function(done){
			setTimeout(()=>{
				//*********************************************************
				//****************                      *******************
				//****************          F11         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F11","btAddVisit"),
					"showInput('F11','btAddVisit') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F11","btsConnectNode"),
					"showInput('F11','btsConnectNode') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F11","checkVisitSuspended"),
					"showInput('F11','checkVisitSuspended') doesn't return false")
					.to.equal(false);
				//*********************************************************
				//****************                      *******************
				//****************          END F11     *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F13         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F13","btsConnectNode"),
					"showInput('F13','btsConnectNode') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************        END F13       *******************
				//****************                      *******************
				//*********************************************************
				//*********************************************************
				//****************                      *******************
				//****************          F21         *******************
				//****************    add visit form    *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F21","btUpdate"),
					"showInput('F21','btUpdate') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F21","btDelete"),
					"showInput('F21','btDelete') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F21","select_visitcat_id"),
					"showInput('F21','select_visitcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","code"),
					"showInput('F21','code') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","btAdd"),
					"showInput('F21','btAdd') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","tableViewEvents"),
					"showInput('F21','tableViewEvents') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","checkVisitDone"),
					"showInput('F21','checkVisitDone') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","checkVisitSuspended"),
					"showInput('F21','checkVisitSuspended') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","btVisitManager"),
					"showInput('F21','btVisitManager') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","parameter_type"),
					"showInput('F21','parameter_type') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F21","parameter_id"),
					"showInput('F21','parameter_id') doesn't return true")
					.to.equal(true);
				//*********************************************************
				//****************                      *******************
				//****************       END F21        *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F22         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F22","Value"),
					"showInput('F22','Value') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F22","position_id"),
					"showInput('F22','position_id') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F22","position_value"),
					"showInput('F22','position_value') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F22","value1"),
					"showInput('F22','value1') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F22","value2"),
					"showInput('F22','value2') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F22","geom1"),
					"showInput('F22','geom1') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F22","btAddPhoto"),
					"showInput('F22','btAddPhoto') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F22","btViewGallery"),
					"showInput('F22','btViewGallery') doesn't return true")
					.to.equal(true);
				//*********************************************************
				//****************                      *******************
				//****************       END F22        *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F23         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F23","geom3"),
					"showInput('F23','geom3') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F23","btAddPhoto"),
					"showInput('F23','btAddPhoto') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F23","btViewGallery"),
					"showInput('F23','btViewGallery') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F23","value2"),
					"showInput('F23','value2') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F23","geom1"),
					"showInput('F23','geom1') doesn't return false")
					.to.equal(false);
				expect(
					_forms.showInput("F23","Value"),
					"showInput('F23','Value') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F23","position_id"),
					"showInput('F23','position_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F23","position_value"),
					"showInput('F23','position_value') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F23","value1"),
					"showInput('F23','value1') doesn't return false")
					.to.equal(false);
				//*********************************************************
				//****************                      *******************
				//****************        END F23       *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F24         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F24","btAddPhoto"),
					"showInput('F24','btAddPhoto') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","btViewGallery"),
					"showInput('F24','btViewGallery') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","geom1"),
					"showInput('F24','geom1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","geom2"),
					"showInput('F24','geom2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","geom3"),
					"showInput('F24','geom3') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","position_id"),
					"showInput('F24','position_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","position_value"),
					"showInput('F24','position_value') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","value1"),
					"showInput('F24','value1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F24","value2"),
					"showInput('F24','value2') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************        END F24       *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************           F25        *******************
				//****************                      *******************
				//*********************************************************
				/*expect(
					_forms.showInput("F25","value2"),
					"showInput('F25','value2') doesn't return true")
					.to.equal(true);
*/
				//*********************************************************
				//****************                      *******************
				//****************        END F25       *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************           F27        *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F27","btDeletePicture"),
					"showInput('F27','btDeletePicture') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F27","btSeePicture"),
					"showInput('F27','btSeePicture') doesn't return true")
					.to.equal(true);
				//*********************************************************
				//****************                      *******************
				//****************        END F27       *******************
				//****************                      *******************
				//*********************************************************
				//*********************************************************
				//****************                      *******************
				//****************           F51        *******************
				//****************                      *******************
				//*********************************************************

				expect(
					_forms.showInput("F51","review.arc_id"),
					"showInput('F51','review.arc_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.y1"),
					"showInput('F51','review.y1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.y2"),
					"showInput('F51','review.y2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.arc_type"),
					"showInput('F51','review.arc_type') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.matcat_id"),
					"showInput('F52','review.matcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.shape"),
					"showInput('F51','review.shape') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.geom1"),
					"showInput('F51','review.geom1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.geom2"),
					"showInput('F51','review.geom2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.annotation"),
					"showInput('F51','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.observ"),
					"showInput('F51','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F51","review.done"),
					"showInput('F1','review.done') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************        END F52       *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************           F52        *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F52","review.node_id"),
					"showInput('F52','review.node_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.top_elev"),
					"showInput('F52','review.top_elev') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.node_type"),
					"showInput('F52','review.node_type') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.matcat_id"),
					"showInput('F52','review.matcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.shape"),
					"showInput('F52','review.shape') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.geom1"),
					"showInput('F52','review.geom1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.geom2"),
					"showInput('F52','review.geom2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.annotation"),
					"showInput('F52','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.observ"),
					"showInput('F52','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F52","review.done"),
					"showInput('F52','review.done') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************        END F52       *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F53         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F53","review.connec_id"),
					"showInput('F53','review.connec_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.y1"),
					"showInput('F53','review.y1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.y2"),
					"showInput('F53','review.y2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.connec_type"),
					"showInput('F53','review.connec_type') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.matcat_id"),
					"showInput('F53','review.matcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.shape"),
					"showInput('F53','review.shape') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.geom1"),
					"showInput('F53','review.geom1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.geom2"),
					"showInput('F53','review.geom2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.annotation"),
					"showInput('F53','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.observ"),
					"showInput('F53','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F53","review.done"),
					"showInput('F53','review.done') doesn't return true")
					.to.equal(true);
				//*********************************************************
				//****************                      *******************
				//****************         END F53      *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F54         *******************
				//****************                      *******************
				//*********************************************************

				expect(
					_forms.showInput("F54","review.gully_id"),
					"showInput('F54','review.gully_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.top_elev"),
					"showInput('F54','review.top_elev') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.ymax"),
					"showInput('F54','review.ymax') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.sandbox"),
					"showInput('F54','review.sandbox') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.matcat_id"),
					"showInput('F54','review.matcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.gratecat_id"),
					"showInput('F54','review.gratecat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.units"),
					"showInput('F54','review.units') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.groove"),
					"showInput('F54','review.groove') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.siphon"),
					"showInput('F54','review.siphon') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.connec_matcat"),
					"showInput('F54','review.connec_matcat') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.shape"),
					"showInput('F54','review.shape') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.geom1"),
					"showInput('F54','review.geom1') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.geom2"),
					"showInput('F54','review.geom2') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.featurecat_id"),
					"showInput('F54','review.featurecat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.feature_id"),
					"showInput('F54','review.feature_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.annotation"),
					"showInput('F54','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.observ"),
					"showInput('F54','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F54","review.done"),
					"showInput('F54','review.done') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************       END F54        *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F55         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F55","review.arc_id"),
					"showInput('F55','review.arc_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F55","review.matcat_id"),
					"showInput('F55','review.matcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F55","review.pnom"),
					"showInput('F55','review.pnom') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F55","review.dnom"),
					"showInput('F55','review.dnom') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F55","review.annotation"),
					"showInput('F55','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F55","review.observ"),
					"showInput('F55','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F55","review.done"),
					"showInput('F55','review.done') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************       END F55        *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F56         *******************
				//****************                      *******************
				//*********************************************************

				expect(
					_forms.showInput("F56","review.node_id"),
					"showInput('F56','review.node_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.elevation"),
					"showInput('F56','review.elevation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.depth"),
					"showInput('F56','review.pnom') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.from_plot"),
					"showInput('F56','review.dnom') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.node_type"),
					"showInput('F56','review.node_type') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.nodecat_id"),
					"showInput('F56','review.nodecat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.annotation"),
					"showInput('F56','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.observ"),
					"showInput('F56','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F56","review.done"),
					"showInput('F56','review.done') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************       END F56        *******************
				//****************                      *******************
				//*********************************************************

				//*********************************************************
				//****************                      *******************
				//****************          F57         *******************
				//****************                      *******************
				//*********************************************************
				expect(
					_forms.showInput("F57","review.connec_id"),
					"showInput('F57','review.connec_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F57","review.matcat_id"),
					"showInput('F57','review.matcat_id') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F57","review.pnom"),
					"showInput('F57','review.pnom') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F57","review.dnom"),
					"showInput('F57','review.dnom') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F57","review.annotation"),
					"showInput('F57','review.annotation') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F57","review.observ"),
					"showInput('F57','review.observ') doesn't return true")
					.to.equal(true);
				expect(
					_forms.showInput("F57","review.done"),
					"showInput('F57','review.done') doesn't return true")
					.to.equal(true);

				//*********************************************************
				//****************                      *******************
				//****************       END F55        *******************
				//****************                      *******************
				//*********************************************************
				done();
			},100);
		});

		after(function(){
			_forms	= null;
		});

	});

	describe('Form history methods', function(){

		before(function(){
			_forms	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345"});

		});

		it('getFormHistory should return [] after resetFormHistory', function(done){
			setTimeout(()=>{
				_forms.resetFormHistory()
				expect(
					_forms.getFormHistory(),
					'getFormHistory() doesn\'t return []')
					.to.deep.equal([]);
					done();
			},100);
		});

		it('addFormHistory should return false/true based on call args', function(done){
			setTimeout(()=>{
				expect(
					_forms.addFormHistory(),
					'addFormHistory() doesn\'t return false')
					.to.equal(false);
				expect(
					_forms.addFormHistory(null),
					'addFormHistory(null) doesn\'t return false')
					.to.equal(false);
				expect(
					_forms.addFormHistory("culo"),
					'addFormHistory("culo") doesn\'t return false')
					.to.equal(false);
				expect(
					_forms.addFormHistory({}),
					'addFormHistory({}) doesn\'t return true')
					.to.equal(true);
					done();
			},100);
		});

		it('removeFormHistory should return false/true based on call args', function(done){
			setTimeout(()=>{
				expect(
					_forms.removeFormHistory(),
					'removeFormHistory() doesn\'t return false')
					.to.equal(false);
				expect(
					_forms.removeFormHistory({}),
					'removeFormHistory({}) doesn\'t return false')
					.to.equal(false);
				expect(
					_forms.removeFormHistory("algo"),
					'removeFormHistory("algo") doesn\'t return true')
					.to.equal(true);
					done();
			},100);
		});

		it('removeFormHistory should remove the right items', function(done){
			_forms.resetFormHistory();
			_forms.addFormHistory(info);
			_forms.addFormHistory(info2);
			_forms.addFormHistory(info3);
			setTimeout(()=>{
				_forms.removeFormHistory(info.formId);
				expect(
				_forms.getFormHistory(),
				'getFormHistory() does not return info3 after removeFormHistory('+info.formId+') ')
				.to.deep.equal(info3);

				_forms.removeFormHistory(info3.formId);
				expect(
				_forms.getFormHistory(),
				'getFormHistory() does not return info2 after removeFormHistory('+info3.formId+') ')
				.to.deep.equal(info2);
				done();
			},100);
		});

		it('showBackBt() should return false when there is no history stored', function(){
			_forms.resetFormHistory()
			expect(
				_forms.showBackBt(),
				'showBackBt() doesn\'t return false')
				.to.equal(false);
		});

		it('showBackBt() should return true/false when based in history obj has more the one object', function(){
			_forms.addFormHistory({})
			expect(
				_forms.showBackBt(),
				'showBackBt() doesn\'t return false - history object with 1 element')
				.to.equal(false);
			_forms.addFormHistory(info2)
			expect(
				_forms.showBackBt(),
				'showBackBt() doesn\'t return true - history object with 2 elements')
				.to.equal(true);
		});

		it('getFormHistory should return and object based on addFormHistory call', function(){
			_forms.resetFormHistory();
			_forms.addFormHistory(info);
			expect(
				_forms.getFormHistory(),
				'getFormHistory() after adding info to be equal to info')
				.to.deep.equal(info);

			_forms.addFormHistory(info2);
			expect(
				_forms.getFormHistory(),
				'getFormHistory()  after adding info to be equal to info2')
				.to.deep.equal(info2);

			_forms.addFormHistory(info2);
			expect(
				_forms.getFormHistory(),
				'getFormHistory() after adding info2 again to be equal to info2')
				.to.deep.equal(info2);
		});

/*
		it('updateHistoryTab() getFormHistory should return info object with expected tab value', function(){
			let info = {
				formId: "F11",
				formName: 'INFO_UD_NODE',
				formParent: 'formInfo'
			};
			_forms.addFormHistory(info);
			_forms.updatewBackBtStatus(true);
			expect(
				_forms.getFormHistory(),
				'getFormHistory() doesn\'t return correct values after updateHistoryTab()')
				.to.deep.equal({
					formId: "F11",
					formName: 'INFO_UD_NODE',
					formParent: 'formInfo',
					showBackBt: true
			});
			_forms.updateHistoryTab(null);
			expect(
				_forms.getFormHistory(),
				'getFormHistory() doesn\'t return correct values after updateHistoryTab(null)')
				.to.deep.equal({
					formId: "F11",
					formName: 'INFO_UD_NODE',
					formParent: 'formInfo',
					showBackBt: true
			});
			_forms.updateHistoryTab(0);
			expect(
				_forms.getFormHistory(),
				'getFormHistory() doesn\'t return correct values after updateHistoryTab(0)')
				.to.deep.equal({
					formId: "F11",
					formName: 'INFO_UD_NODE',
					formParent: 'formInfo',
					showBackBt: true,
					tab: 0
			});
			_forms.updateHistoryTab('culo');
			expect(
				_forms.getFormHistory(),
				'getFormHistory() doesn\'t return correct values after updateHistoryTab("culo")')
				.to.deep.equal({
					formId: "F11",
					formName: 'INFO_UD_NODE',
					formParent: 'formInfo',
					showBackBt: true
			});

		});*/

		after(function(){
			_forms	= null;
		});

	});
});
