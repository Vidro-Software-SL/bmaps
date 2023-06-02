/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const DateSelector   				= require('../dateselector');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _dates;
describe('Exploitation sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_dates	= new DateSelector({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_dates.should.be.a('object');
		});
		it('should have setToken method', function(){
			_dates.setToken.should.be.a('function');
		});
		it('should have getDatesForm method', function(){
			_dates.getDatesForm.should.be.a('function');
		});

		it('should have setFilterDate method', function(){
			_dates.setFilterDate.should.be.a('function');
		});

		after(function(){
			_events	= null;
		});

	});

});
