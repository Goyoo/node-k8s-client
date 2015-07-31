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

describe('kubectl rc',function() 
{
	this.timeout(1000000)
	
	// it('rc update', function(done){
	// 	Kubectl.rc.update(path.join(__dirname, '/rc/nginx-rc.yaml'), function(err, data){
	// 		console.log(err, data)
	// 		done()
	// 	})
	// })
	
	// return
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
	
	// return 
	it('get rc list', function(done)
	{
		kubectl.rc.list(function(err, data){
			assert(!err && data)
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
	
	it('get a rc', function(done)
	{
		kubectl.rc.get('helloworld', function(err, data){
			assert(!err && data.metadata.name === 'helloworld')
			done()
		})
	})
	
	it('update rc image', function(done){
		kubectl.rc.rollingUpdate('helloworld', 'dhub.yunpro.cn/junjun16818/hello-node', function(err, data){
			console.log(data)
			done()
		})
	})
	
	it('update rc image', function(done){
		kubectl.rc.rollingUpdateByFile('helloworld', 'dhub.yunpro.cn/junjun16818/hello-node', function(err, data){
			console.log(data)
			done()
		})
	})
	
	it('delete a rc', function(done)
	{
		kubectl.rc.delete('nginx', function(err, data){
			assert(!err)
			done()
		})
	})
})
