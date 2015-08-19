/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, path = require('path')
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')

var kubectl = K8s.kubectl({
	endpoint: 'http://192.168.10.10:8080'
	, binary: 'kubectl'
})

describe('kubectl',function() 
{
	this.timeout(1000000)
	
	it('get pods list', function(done)
	{
		kubectl.pod.list(function(err, data){
			done()
		})
	})
	
	it('create a pod', function(done)
	{
		kubectl.pod.create(path.join(__dirname, '/pods/nginx.yaml'), function(err, data){
			// assert(!err)
			done()
		})
	})
	
	it('get a pod', function(done)
	{
		kubectl.pod.get('nginx', function(err, data){
			assert(!err && data)
			done()
		})
	})
	
	it('get pods by selector', function(done)
	{
		kubectl.pod.get({ app: 'nginx'}, function(err, data){
			console.log(err, data)
			assert(!err && data)
			done()
		})
	})
	
	it('delete a pod', function(done)
	{
		kubectl.pod.delete('nginx', function(err, data){
			assert(!err)
			done()
		})
	})
})
