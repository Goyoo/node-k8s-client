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

describe('kubectl nodes',function() 
{
	this.timeout(1000000)
	
	it('get node list', function(done)
	{
		kubectl.node.list(function(err, data){
			assert(!err && data)
			done()
		})
	})
	
	it('create a node', function(done){
		kubectl.node.create(path.join(__dirname, '/nodes/node3.json'), function(err, data){
			console.log(data)
			done()
		})
	})
	
	it('get a node', function(done){
		kubectl.node.get('192.168.10.13', function(err, data){
			console.log(data)
			done()
		})
	})
	
	it('delete a node', function(done){
		kubectl.node.delete('192.168.10.13', function(err, data){
			console.log(data)
			done()
		})
	})
})
