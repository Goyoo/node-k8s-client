/// <reference path="../../../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, K8s = require('../lib/request.js')('http://localhost:8080/api/v1/')
	, fs = require('fs')
	, assert = require('chai').assert

describe('pods',function() 
{
	this.timeout(1000000)
	var length = 0
	
	it('should pods length equal 1', function(done)
	{
		K8s.get('namespaces/default/pods', function(err, data){
			length = data.items.length
			assert(length)
			done()
		})
	})
	
	it('create nginx pods', function(done){
		var pod = require('./pods/nginx.json')
		K8s.post('namespaces/default/pods', pod, function(err, data){
			done()
		})
	})
	
	it('should pods length equal 2', function(done)
	{
		K8s.get('namespaces/default/pods', function(err, data){
			assert(data.items.length === length + 1 )
			done()
		})
	})
	
	it('get a nginx pod', function(done){
		K8s.get('namespaces/default/pods/nginx', function(err, data){
			assert(data.metadata.name === 'nginx')
			done()
		})
	})
	
	it('delete nginx pod', function(done){
		K8s.delete('namespaces/default/pods/nginx', function(err, data){
			done()
		})
	})
	
	it('should pods length equal 1', function(done)
	{
		K8s.get('namespaces/default/pods', function(err, data){
			assert(data.items.length === length  )
			done()
		})
	})
})
