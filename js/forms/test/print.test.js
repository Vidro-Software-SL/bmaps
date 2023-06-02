/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const Print   				= require('../print');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _pr;
describe('Exploitation sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_pr	= new Print({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_pr.should.be.a('object');
		});
		it('should have setToken method', function(){
			_pr.setToken.should.be.a('function');
		});
		it('should have getPrintForm method', function(){
			_pr.getPrintForm.should.be.a('function');
		});
		it('should have printComposer method', function(){
			_pr.printComposer.should.be.a('function');
		});
		it('should have updatePrint method', function(){
			_pr.updatePrint.should.be.a('function');
		});
		it('should have captureScreen method', function(){
			_pr.captureScreen.should.be.a('function');
		});




		after(function(){
			_pr	= null;
		});

	});

});
