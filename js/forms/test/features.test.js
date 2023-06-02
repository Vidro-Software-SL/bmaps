/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const FeaturesSewernet   = require('../features');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _features;
describe('Features sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_features	= new FeaturesSewernet({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_features.should.be.a('object');
		});
		it('should have setToken method', function(){
			_features.setToken.should.be.a('function');
		});
		it('should have getInsertFeatureForm method', function(){
			_features.getInsertFeatureForm.should.be.a('function');
		});
		it('should have insertFeature method', function(){
			_features.insertFeature.should.be.a('function');
		});
		it('should have deleteFeature method', function(){
			_features.deleteFeature.should.be.a('function');
		});
		it('should have updateFeature method', function(){
			_features.updateFeature.should.be.a('function');
		});
		it('should have updateFeatureGeometry method', function(){
			_features.updateFeatureGeometry.should.be.a('function');
		});
		it('should have getInfoForm method', function(){
			_features.getInfoForm.should.be.a('function');
		});
		it('should have getInfoFormFromCoordinates method', function(){
			_features.getInfoFormFromCoordinates.should.be.a('function');
		});

		after(function(){
			_features	= null;
		});

	});

});
