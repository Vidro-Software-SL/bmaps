/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const FormsSewernet   = require('../events');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _events;
describe('Visits sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_events	= new FormsSewernet({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_events.should.be.a('object');
		});
		it('should have setToken method', function(){
			_events.setToken.should.be.a('function');
		});
		it('should have getEventFormTypeAndEvent method', function(){
			_events.getEventFormTypeAndEvent.should.be.a('function');
		});

		it('should have insertEvent method', function(){
			_events.insertEvent.should.be.a('function');
		});

		it('should have getEvent method', function(){
			_events.getEvent.should.be.a('function');
		});

		it('should have updateEvent method', function(){
			_events.updateEvent.should.be.a('function');
		});

		it('should have deleteEvent method', function(){
			_events.deleteEvent.should.be.a('function');
		});


		after(function(){
			_events	= null;
		});

	});

});
