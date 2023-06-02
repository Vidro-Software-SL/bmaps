/*jshint esversion: 6 */
const sinonChai 			= require('sinon-chai');
const chai      			= require('chai');
const assert    			= require('chai').assert;
const should    			= chai.should();
const expect    			= chai.expect;
const sinon     			= require('sinon');
const Mincut   = require('../mincut');

chai.use(sinonChai);

var eventSpy      = sinon.spy();
var _min;
describe('Mincut sewernet', function(){

	describe('Constructor and initialization', function(){

		before(function(){
			_min	= new Mincut({baseHref:'http://wahetevr',token:"12345",device:3});
		});

		it('should return an object', function(){
			_min.should.be.a('object');
		});
		
		it('should have setToken method', function(){
			_min.setToken.should.be.a('function');
		});

		it('should have getMincut method', function(){
			_min.getMincut.should.be.a('function');
		});

		it('should have getInfoMincut method', function(){
			_min.getInfoMincut.should.be.a('function');
		});

		it('should have upsertMincut method', function(){
			_min.upsertMincut.should.be.a('function');
		});

		it('should have getMincutManager method', function(){
			_min.getMincutManager.should.be.a('function');
		});

		it('should have updateMincutManager method', function(){
			_min.updateMincutManager.should.be.a('function');
		});

		it('should have excludeFromMincut method', function(){
			_min.excludeFromMincut.should.be.a('function');
		});
		it('should have processGetMincut method', function(){
			_min.processGetMincut.should.be.a('function');
		});
		it('should have updateMincutAdd method', function(){
			_min.updateMincutAdd.should.be.a('function');
		});
		it('should have endMincut method', function(){
			_min.endMincut.should.be.a('function');
		});
		it('should have startMincut method', function(){
			_min.startMincut.should.be.a('function');
		});



		after(function(){
			_min	= null;
		});

	});

});
