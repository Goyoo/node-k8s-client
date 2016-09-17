const expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, jsonpatch = require('fast-json-patch')

var kubeapi = K8s.api({
	endpoint: 'https://192.168.99.100:8443',
	version: '/api/v1',
	auth: {
		clientCert: fs.readFileSync(`${process.env.HOME}/.minikube/apiserver.crt`).toString(),
		clientKey: fs.readFileSync(`${process.env.HOME}/.minikube/apiserver.key`).toString() ,
		caCert: fs.readFileSync(`${process.env.HOME}/.minikube/ca.crt`).toString()
	}
})

var res = kubeapi.watch('watch/namespaces/default/pods', function(data){
	console.log('watch pod  log: ' + data.type)
}, function(err){
	console.log(err)
})
 

describe('kubeapi ',function() 
{
	this.timeout(1000000)
		
	it('test api GET -> get rc list', function(done)
	{
		kubeapi.get('namespaces/default/replicationcontrollers', function(err, data){
			assert(data.items.length===0)
			done(err)
		})
	}) 

	// it('test api log -> get pod log', function(done)
	// {
	// 	kubeapi.log('namespaces/default/pods/helloworld-v1-6q0cr/log', function(err, data){
	// 		console.log(data)
	// 		done(err)
	// 	})
	// })  
	// return
	// it('test api GET by watch -> get rc list', function(done)
	// {
	// 	var res = kubeapi.watch('watch/namespaces/default/pods', function(data)
	// 	{
	// 		console.log('watch pod  log: ' + data.type)
	// 		res.emit('close')
			
	// 	}, function(err){
	// 		console.log('exit',err)
	// 	}, 20000)

	// })

	it('test api POST -> create rc', function(done){
		var rc = require('./rc/nginx-rc.json')
		kubeapi.post('namespaces/default/replicationcontrollers', rc, function(err, data){
			assert(data.spec.replicas === 3)
			// console.log(data)
			return done()
		})
	})

	it('test api PATCH -> update rc replicas', function(done)
	{

		var json = [{ op: 'replace', path: '/spec/replicas', value: 2 }]

		kubeapi.patch('namespaces/default/replicationcontrollers/nginx', json, function(err, data)
		{
			kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
				assert(data.spec.replicas === 2)
				done()
			})
		})
	})
	
	it('test api PATCH -> update rc replicas', function(done)
	{

		var json = [{ op: 'replace', path: '/spec/replicas', value: 0 }]

		kubeapi.patch('namespaces/default/replicationcontrollers/nginx', json, function(err, data)
		{
			kubeapi.get('namespaces/default/replicationcontrollers/nginx', function(err, data){
				assert(data.spec.replicas === 0)
				done()
			})
		})
	})

	it('test api DELETE -> delete rc', function(done)
	{
		kubeapi.delete('namespaces/default/replicationcontrollers/nginx', {gracePeriodSeconds: 1}, function(err, data){
			done()
		})
	})
})
