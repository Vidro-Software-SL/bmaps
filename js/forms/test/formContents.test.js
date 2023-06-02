/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const FormsContentsSewernet   = require('../formsContents');


var _forms;
describe('Forms Contents sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_forms	= new FormsContentsSewernet({});
		});

		it('should return an object', function(){
			_forms.should.be.a('object');
		});

		it('should have getTableFromLayer_id_name method', function(){
			_forms.getTableFromLayer_id_name.should.be.a('function');
		});

		it('should have getFormByFormId method', function(){
			_forms.getFormByFormId.should.be.a('function');
		});

		after(function(){
			_forms	= null;
		});

	});

	describe('Get Form and Tabs - UD project type', function(){

		before(function(){
			_forms	= new FormsContentsSewernet(
				{project_type:'ud'}
			);
		});



		it('getFormByFormId("F16") should return F16 - Info generic form', function(done){
			expect(_forms.getFormByFormId("F16"),"Not returning F16 form").
			to.deep.equal(
				{
					formId: 	'F16',
					formParent:	'formInfo',
					formName:		'INFO_GENERIC',
					formTabs: 	[ 'tabInfo' ]
				}
			);
			done();
		});

		it('getFormByFormId(n"F21") should return F21 - VISIT form', function(done){
			expect(_forms.getFormByFormId("F21"),"Not returning F21 form").
			to.deep.equal(
				{
					formId: 	'F21',
					formParent:	'formInfo',
					formName:		'VISIT',
					formTabs: 	[ ]
				}
			);
			done();
		});

		it('getFormByFormId("F22") should return F22 - Event standard form', function(done){
			expect(_forms.getFormByFormId("F22"),"Not returning F22 form").
			to.deep.equal(
				{
					formId: 	'F22',
					formParent:	'formInfo',
					formName:		'EVENT_FORM',
					formTabs: 	[ 'tabEvent_standard' ]
				}
			);
			done();
		});

		it('getFormByFormId("F23") should return F23 - event_ud_arc_standard form', function(done){
			expect(_forms.getFormByFormId("F23"),"Not returning F23 form").
			to.deep.equal(
				{
					formId: 	'F23',
					formParent:	'formInfo',
					formName:		'EVENT_FORM',
					formTabs: 	[ 'tabEvent_ud_arc_standard' ]
				}
			);
			done();
		});

		it('getFormByFormId("F24") should return F24 - event_ud_arc_standard form', function(done){
			expect(_forms.getFormByFormId("F24"),"Not returning F24 form").
			to.deep.equal(
				{
					formId: 	'F24',
					formParent:	'formInfo',
					formName:		'EVENT_FORM',
					formTabs: 	[ 'tabEvent_ud_arc_rehabit' ]
				}
			);
			done();
		});

		it('getFormByFormId("F25") should return F25 - Visit manager form', function(done){
			expect(_forms.getFormByFormId("F25"),"Not returning F25 form").
			to.deep.equal(
				{
					formId: 	'F25',
					formParent:	'formInfo',
					formName:		'VISIT_MANAGER',
					formTabs: 	[  ],
				}
			);

			done();
		});

		it('getFormByFormId("F27") should return F27 - Gallery', function(done){
			expect(_forms.getFormByFormId("F27"),"Not returning F27 Gallery").
			to.deep.equal(
				{
					formId: 	'F27',
					formParent:	'formInfo',
					formName:		'GALLERY',
					formTabs: 	[ 'tabGallery' ]
				}
			);
			done();
		});




		it('getFormByFormId("F27") should return F27 - Gallery', function(done){
			expect(_forms.getFormByFormId("F27"),"Not returning F27 Gallery").
			to.deep.equal(
				{
					formId: 	'F27',
					formParent:	'formInfo',
					formName:		'GALLERY',
					formTabs: 	[ 'tabGallery' ]
				}
			);
			done();
		});

		after(function(){
			_forms	= null;
		});

	});

	describe('Get table based un layer id name', function(){
		before(function(){
			_forms	= new FormsContentsSewernet({
				project_type:'ud'}
			);
		});
		it('getTableFromLayer_id_name("F25","nn") should return the right table name', function(done){
			expect(_forms.getTableFromLayer_id_name("F25","node_id"),"Not returning v_ui_om_visitman_x_node").
			to.equal("v_ui_om_visitman_x_node");
			expect(_forms.getTableFromLayer_id_name("F25","arc_id"),"Not returning v_ui_om_visitman_x_node").
			to.equal("v_ui_om_visitman_x_arc");
			expect(_forms.getTableFromLayer_id_name("F25","gully_id"),"Not returning v_ui_om_visitman_x_gully").
			to.equal("v_ui_om_visitman_x_gully");

			done();
		});
		after(function(){
			_forms	= null;
		});
	});


	describe('Get Form and Tabs - WS project type', function(){

		before(function(){
			_forms	= new FormsContentsSewernet({
				project_type:'ws'}
			);
		});




		after(function(){
			_forms	= null;
		});
	});
});
