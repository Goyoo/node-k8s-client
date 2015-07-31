/// <reference path="../../../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')


var kubectl = K8s.kubectl({
	endpoint: 'http://192.168.10.10:8080'
	, binary: path.join(__dirname, '../kubectl')
})

describe('kubectl service',function() 
{
	this.timeout(1000000)
	
	it('get service list', function(done)
	{
		kubectl.service.list(function(err, data){
			assert(!err && data)
			done()
		})
	})
	
	it('create a service', function(done)
	{
		kubectl.service.create(path.join(__dirname, '/service/helloworld-service.yaml'), function(err, data){
			assert(!err)
			done()
		})
	})
	
	it('get service helloworld', function(done)
	{
		kubectl.service.get('helloworld', function(err, data){
			assert(!err && data.metadata.name === 'helloworld')
			done()
		})
	})
	
	it('delete a service', function(done)
	{
		kubectl.service.delete('helloworld', function(err, data){
			assert(!err)
			done(err)
		})
	})
})
