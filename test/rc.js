/// <reference path="../../../typings/mocha/mocha.d.ts"/>
var expect = require('chai').expect
	, K8s = require('../lib/request.js')('http://192.168.10.10:8080/api/v1/')
	, fs = require('fs')
	, assert = require('chai').assert

describe('replicationcontrollers',function() 
{
	this.timeout(1000000)
	var length = 0
	
	it('update rc', function(done){
		// K8s.get('namespaces/default/replicationcontrollers/nginx', function(err, data)
		// {
			K8s.watch('watch/namespaces/default/pods', function(err, data){
				
			})
		// })
	})
	
	return
	
	it('get and set rc length', function(done)
	{
		K8s.get('namespaces/default/replicationcontrollers', function(err, data){
			length = data.items.length
			done()
		})
	})
	
	it('create nginx rc. should rc length + 1', function(done){
		var rc = require('./rc/nginx-rc.json')
		K8s.post('namespaces/default/replicationcontrollers', rc, function(err, data){
			K8s.get('namespaces/default/replicationcontrollers', function(err, data){
				assert(data.items.length === length + 1 )
				done()
			})
		})
	})
	// return
	it('get a rc pod. should rc name equal nginx and replicas equal 3', function(done){
		K8s.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
			assert(data.spec.replicas=== 3)
			assert(data.metadata.name === 'nginx')
			
			setTimeout(function(){
				done()
			}, 2000)
		})
	})
	
	it('test replace', function(done){
		K8s.get('namespaces/default/replicationcontrollers/nginx', function(err, data)
		{
			data.spec.replicas = 10

			K8s.put('namespaces/default/replicationcontrollers/nginx', data, function(err, data)
			{
				K8s.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
					// console.log(data.spec.replicas)
					done()
				})
			})
		})
	})
	
	// it('delete rc pod. should rc length - 1', function(done){
	// 	K8s.delete('namespaces/default/replicationcontrollers/nginx', function(err, data){
	// 		K8s.get('namespaces/default/replicationcontrollers', function(err, data){
	// 			assert(data.items.length === 0 )
	// 			done()
	// 		})
	// 	})
	// })
	
})
