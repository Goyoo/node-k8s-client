var expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')


var kubectl = K8s.kubectl({
	endpoint: 'https://192.168.99.100:8443'
	, binary: 'kubectl'
})

describe('kubectl rc',function() 
{
	this.timeout(1000000)
	
	it('get rc list', function(done)
	{
		kubectl.rc.list(function(err, data){
			done()
		})
	})

	it('create a rc', function(done)
	{
		kubectl.rc.create(path.join(__dirname, '/rc/helloworld-v1.yaml'), function(err, data){
			assert(!err)
			done()
		})
	})
	
	it('get a rc helloworld-v1', function(done)
	{
		kubectl.rc.get('helloworld-v1', function(err, data){
			assert(!err && data.metadata.name === 'helloworld-v1')
			done()
		})
	})
	
	it('scale rc', function(done){
		kubectl.rc.scale('helloworld-v1', 1, function(err, data){
			done(err)
		})
	})
	
	it('rollingUpdate rc by file', function(done){
		kubectl.rc.rollingUpdateByFile('helloworld-v1', path.join(__dirname, '/rc/helloworld-v2.yaml'), function(err, data){
			assert(!err)
			done(err)
		})
	})
	
	it('get a rc helloworld-v2', function(done)
	{
		kubectl.rc.get('helloworld-v2', function(err, data){
			assert(!err && data.metadata.name === 'helloworld-v2')
			done(err)
		})
	})
	
	it('rollingUpdate rc by image', function(done)
	{
		kubectl.rc.rollingUpdate('helloworld-v2', 'junjun16818/hello-world:v1', function(err, data){
			assert(!err)
			done(err)
		})
	})
	
	it('delete a rc', function(done)
	{
		kubectl.rc.delete('helloworld-v2',['--grace-period=0'], function(err, data){
			assert(!err)
			done(err)
		})
	})
})
