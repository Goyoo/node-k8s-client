/// <reference path="../../../typings/node/node.d.ts"/>
/// <reference path="../../../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, path = require('path')
	, Kubectl = require('../lib/kubectl.js')({
		cmd: path.join(__dirname, '../kubectl')
		, args: [ '-s', 'http://192.168.10.10:8080' ]
	})
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')

describe('kubectl',function() 
{
	this.timeout(1000000)
	
	it('get pods list', function(done)
	{
		Kubectl.pod.list(function(err, data){
			done()
		})
	})
	
	it('create a pod', function(done)
	{
		Kubectl.pod.create(path.join(__dirname, '/pods/nginx.yaml'), function(err, data){
			assert(!err)
			done()
		})
	})
	
	it('get a pod', function(done)
	{
		Kubectl.pod.get('nginx', function(err, data){
			assert(!err && data)
			done()
		})
	})
	
	it('delete a pod', function(done)
	{
		Kubectl.pod.delete('nginx', function(err, data){
			assert(!err)
			done()
		})
	})
})
