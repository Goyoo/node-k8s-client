const expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, jsonpatch = require('fast-json-patch')




var kubeapi = K8s.api({
	endpoint: 'http://172.18.18.101:8080'
	, version: '/api/v1'
})

describe('kubeapi ',function() 
{
	this.timeout(1000000)
		
	it('test api GET -> get rc list', function(done)
	{
		kubeapi.get('namespaces/default/replicationcontrollers', function(err, data){
			// assert(data)
			done(err)
		})
	})
	
	it('test api GET by watch -> get rc list', function(done)
	{
		kubeapi.watch('watch/namespaces/default/pods', function(data){
			done(err)
		})
		
		done()
	})
	
	it('test api POST -> create rc', function(done){
		var rc = require('./rc/nginx-rc.json')
		kubeapi.post('namespaces/default/replicationcontrollers', rc, function(err, data){
			return done()
		})
	})
	
	it('test api PUT -> change rc replicas', function(done)
	{
		kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data)
		{
			data.spec.replicas = 1
            
			kubeapi.put('namespaces/default/replicationcontrollers/nginx', data, function(err, data)
			{
				kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
					// assert(data.spec.replicas === 1)
					done()
				})
			})
		})
	})
	
	it('test api PATCH -> update rc replicas', function(done)
	{

		var json = [{ op: 'replace', path: '/spec/replicas', value: 2 }]

		kubeapi.patch('namespaces/default/replicationcontrollers/nginx', json, function(err, data)
		{
			kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
				// assert(data.spec.replicas === 2)
				done()
			})
		})
	})
	
	it('test api DELETE -> delete rc', function(done){
		kubeapi.delete('namespaces/default/replicationcontrollers/nginx', function(err, data){
			done()
		})
	})
	
})


// curl --request PATCH --data '[ { "op": "add", "path": "/metadata/labels/hello", "value": "world" } ]' -H "Content-Type:application/json-patch+json" http://172.18.18.101:8080/api/v1/namespaces/default/replicationcontrollers/nginx