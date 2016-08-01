var expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, path = require('path')


var kubectl = K8s.kubectl({
	endpoint: 'https://192.168.99.100:8443'
	, binary: 'kubectl'
})

describe('kubectl pod',function() 
{
	this.timeout(1000000)
	
	it('get pods list', function(done)
	{
		// kubectl.command('get pods --output=json').then(function(a){
		// 	console.log(a)
		// })
		kubectl.pod.list(function(err, data){
			done(err)
		})
	})
	
	it('create a pod', function(done)
	{
		kubectl.pod.create(path.join(__dirname, '/pods/nginx.yaml'), function(err, data){
			done(err)
		})
	})
	
	it('get a pod', function(done)
	{
		kubectl.pod.get('nginx', function(err, data){
			done(err)
		})
	})
	
	it('get pods by selector', function(done)
	{
		kubectl.pod.list({ app: 'nginx'}, function(err, data){
			done(err)
		})
	})
	
	it('delete a pod', function(done)
	{
		kubectl.pod.delete('nginx', function(err, data){
			done(err)
		})
	})
})
