/// <reference path="../../../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, Kubectl = require('../lib/kubectl.js')(path.join(__dirname, '/../../kubectl'), { '-s': 'http://192.168.10.10:8080' })
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')

describe('kubectl rc',function() 
{
	this.timeout(1000000)
	
	it('rc update', function(done){
		Kubectl.rc.update(path.join(__dirname, '/rc/nginx-rc.yaml'), function(err, data){
			console.log(err, data)
			done()
		})
	})
	
	return
	// it('rc rolling-update file', function(done){
	// 	Kubectl.rc.rollingUpdateByFile('nginx', path.join(__dirname, '/rc/nginx-rc.yaml'), function(err, data){
	// 		console.log(err, data)
	// 		done()
	// 	})
	// })
	
	// it('rc rolling-update', function(done){
	// 	Kubectl.rc.rollingUpdate('nginx2', 'image:v2', function(err, data){
	// 		console.log(err, data)
	// 		done()
	// 	})
	// })
	
	return 
	it('get rc list', function(done)
	{
		Kubectl.rc.list(function(err, data){
			assert(!err && data)
			done()
		})
	})
	
	it('create a rc', function(done)
	{
		Kubectl.rc.create(path.join(__dirname, '/rc/nginx-rc.yaml'), function(err, data){
			assert(!err)
			done()
		})
	})

	it('get a rc', function(done)
	{
		Kubectl.rc.get('nginx', function(err, data){
			assert(!err && data.metadata.name === 'nginx')
			done()
		})
	})
	
	// it('delete a rc', function(done)
	// {
	// 	Kubectl.rc.delete('nginx', function(err, data){
	// 		assert(!err)
	// 		done()
	// 	})
	// })
})
