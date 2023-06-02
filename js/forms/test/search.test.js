/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const Search   				= require('../search');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _fil;
describe('Exploitation sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_fil	= new Search({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_fil.should.be.a('object');
		});
		it('should have setToken method', function(){
			_fil.setToken.should.be.a('function');
		});
		it('should have getSearchForm method', function(){
			_fil.getSearchForm.should.be.a('function');
		});

		it('should have getDataForAddress method', function(){
			_fil.getDataForAddress.should.be.a('function');
		});

		it('should have updateSearch method', function(){
			_fil.updateSearch.should.be.a('function');
		});

		it('should have updateSearchAdd method', function(){
			_fil.updateSearchAdd.should.be.a('function');
		});

		after(function(){
			_events	= null;
		});

	});

});
