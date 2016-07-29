var expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')

var kubectl = K8s.kubectl({
	endpoint: 'https://192.168.99.100:8443'
	, binary: 'kubectl'
})

describe('kubectl service',function() 
{
	this.timeout(1000000)
	
	it('get service list', function(done)
	{
		kubectl.service.list(function(err, data){
			done(err)
		})
	})
	
	it('create a service', function(done)
	{
		kubectl.service.create(path.join(__dirname, '/service/helloworld-service.yaml'), function(err, data){
			done(err)
		})
	})
	
	it('get service helloworld', function(done)
	{
		kubectl.service.get('helloworld', function(err, data){
			done(err)
		})
	})
	
	it('delete a service', function(done)
	{
		kubectl.service.delete('helloworld', function(err, data){
			done(err)
		})
	})
})
