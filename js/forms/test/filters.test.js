/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const Filters   = require('../filters');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _fil;
describe('Exploitation sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_fil	= new Filters({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_fil.should.be.a('object');
		});
		it('should have setToken method', function(){
			_fil.setToken.should.be.a('function');
		});
		it('should have getExploitation method', function(){
			_fil.getExploitation.should.be.a('function');
		});

		it('should have updateExploitation method', function(){
			_fil.updateExploitation.should.be.a('function');
		});

		it('should have getFilters method', function(){
			_fil.getFilters.should.be.a('function');
		});


		after(function(){
			_events	= null;
		});

	});

});
