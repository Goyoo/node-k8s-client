/// <reference path="../../../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, K8s = require('k8s')
	, fs = require('fs')
	, assert = require('chai').assert

var kubeapi = K8s.api({
	endpoint: 'http://192.168.10.10:8080'
	, version: 'v1'
})

describe('replicationcontrollers',function() 
{
	this.timeout(1000000)
		
	it('test api GET -> get rc list', function(done)
	{
		kubeapi.get('namespaces/default/replicationcontrollers', function(err, data){
			assert(data)
			done(err)
		})
	})
	
	it('test api GET by watch -> get rc list', function(done)
	{
		kubeapi.watch('watch/namespaces/default/pods', function(data){
			console.log(data.type, data.object.status.conditions, '\n', data.object.status.containerStatuses && data.object.status.containerStatuses[0].state)
			// done(err)
		})
		
		done()
	})
	
	it('test api POST -> create rc', function(done){
		var rc = require('./rc/nginx-rc.json')
		kubeapi.post('namespaces/default/replicationcontrollers', rc, function(err, data){
			done(err)
		})
	})
	
	it('test api PUT -> change rc replicas', function(done){
		kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data)
		{
			data.spec.replicas = 1

			kubeapi.put('namespaces/default/replicationcontrollers/nginx', data, function(err, data)
			{
				kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
					assert(data.spec.replicas === 1)
					done()
				})
			})
		})
	})
	
	// it('test api PATCH -> update rc replicas', function(done)
	// {
	// 	var json = { 
	// 		apiVersion: 'v1'
	// 		, spec: { replicas: 2 }
	// 	}
		
	// 	kubeapi.patch('namespaces/default/replicationcontrollers/nginx', json, function(err, data)
	// 	{
	// 		kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
	// 			console.log(err, data)
	// 			assert(data.spec.replicas === 2)
	// 			done()
	// 		})
	// 	})
	// })
	
	it('test api DELETE -> delete rc', function(done){
		kubeapi.delete('namespaces/default/replicationcontrollers/nginx', function(err, data){
			done()
		})
	})
	
})
