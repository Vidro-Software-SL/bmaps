/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const FormsSewernet   = require('../visits');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _visits;
describe('Visits sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_visits	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_visits.should.be.a('object');
		});
		it('should have setToken method', function(){
			_visits.setToken.should.be.a('function');
		});
		it('should have getWebFormsForVisit method', function(){
			_visits.getWebFormsForVisit.should.be.a('function');
		});

		it('should have deleteVisit method', function(){
			_visits.deleteVisit.should.be.a('function');
		});

		it('should have upsertVisit method', function(){
			_visits.upsertVisit.should.be.a('function');
		});

		it('should have updateVisit method', function(){
			_visits.updateVisit.should.be.a('function');
		});

		it('should have getParameterIdFromParameterType method', function(){
			_visits.getParameterIdFromParameterType.should.be.a('function');
		});

		it('should have getVisitsFromFeature method', function(){
			_visits.getVisitsFromFeature.should.be.a('function');
		});
		//new implementation
		it('should have gwGetVisit method', function(){
			_visits.gwGetVisit.should.be.a('function');
		});

		it('should have gwSetDelete method', function(){
			_visits.gwSetDelete.should.be.a('function');
		});

		it('should have gwSetVisit method', function(){
			_visits.gwSetVisit.should.be.a('function');
		});
		it('should have gwGetVisitManager method', function(){
			_visits.gwGetVisitManager.should.be.a('function');
		});
		it('should have gw_api_setvisitmanagerstart method', function(){
			_visits.gw_api_setvisitmanagerstart.should.be.a('function');
		});
		it('should have gw_api_setvisitmanagerend method', function(){
			_visits.gw_api_setvisitmanagerend.should.be.a('function');
		});

		it('should have gwSetVisitManager method', function(){
			_visits.gwSetVisitManager.should.be.a('function');
		});

		it('should have gwGetLot method', function(){
			_visits.gwGetLot.should.be.a('function');
		});

		it('should have gwSetLot method', function(){
			_visits.gwSetLot.should.be.a('function');
		});


		after(function(){
			_visits	= null;
		});

	});

});
