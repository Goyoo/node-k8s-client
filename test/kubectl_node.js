var expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')


var kubectl = K8s.kubectl({
	endpoint: 'https://192.168.99.100:8443'
	, binary: 'kubectl'
})

describe('kubectl nodes',function() 
{
	this.timeout(1000000)
	
	it('get node list', function(done)
	{
		kubectl.node.list(function(err, data){
			assert(!err && data)
			done(err)
		})
	})
	
	it('create a node', function(done){
		kubectl.node.create(path.join(__dirname, '/nodes/node3.json'), function(err, data){
			done(err)
		})
	})
	
	it('get a node', function(done){
		kubectl.node.get('192.168.10.13', function(err, data){
			done(err)
		})
	})
	
	it('delete a node', function(done){
		kubectl.node.delete('192.168.10.13', function(err, data){
			done(err)
		})
	})
})
