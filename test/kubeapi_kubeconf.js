const expect = require('chai').expect
	, K8s = require('../index.js')
	, fs = require('fs')
	, assert = require('chai').assert
	, _ = require('underscore')
	, jsyaml = require('js-yaml')
    , temp = require("temp")

temp.track() // Cleanup files

// https://kubernetes.io/docs/concepts/cluster-administration/authenticate-across-clusters-kubeconfig/

// Use embedded base64-data inside kubeconfig
var kubeconfigEmbedded = {
	'current-context': 'minikube',
	contexts: [{
		name: 'minikube',
		context:{
			cluster: 'minikube',
			user: 'minikube'
		}
	}],
	clusters: [{
		name: 'minikube',
		cluster: {
	    	'certificate-authority-data': fs.readFileSync(`${process.env.HOME}/.minikube/ca.crt`).toString('base64'),
	    	server: 'https://192.168.99.100:8443'
		}
	}],
	users: [{
		name: 'minikube',
		user: {
			'client-certificate-data': fs.readFileSync(`${process.env.HOME}/.minikube/apiserver.crt`).toString('base64'),
			'client-key-data': fs.readFileSync(`${process.env.HOME}/.minikube/apiserver.key`).toString('base64'),
		}
	}]
}

// Use file-references inside kubeconfig
var kubeconfigKeyReference = {
		'current-context': 'minikube',
		contexts: [{
			name: 'minikube',
			context:{
				cluster: 'minikube',
				user: 'minikube'
			}
		}],
		clusters: [{
			name: 'minikube',
			cluster: {
		    	'certificate-authority': `${process.env.HOME}/.minikube/ca.crt`,
		    	server: 'https://192.168.99.100:8443'
			}
		}],
		users: [{
			name: 'minikube',
			user: {
				'client-certificate': `${process.env.HOME}/.minikube/apiserver.crt`,
				'client-key': `${process.env.HOME}/.minikube/apiserver.key`
			}
		}]
}

// Use Insecure connection inside kubeconfig
var kubeconfigInsecure = {
		'current-context': 'minikube',
		contexts: [{
			name: 'minikube',
			context:{
				cluster: 'minikube',
				user: 'minikube'
			}
		}],
		clusters: [{
			name: 'minikube',
			cluster: {
		    	'certificate-authority': `${process.env.HOME}/.minikube/ca.crt`,
		    	server: 'https://192.168.99.100:8443',
		    	'insecure-skip-tls-verify': false
			}
		}],
		users: [{
			name: 'minikube',
			user: {
				'client-certificate': `${process.env.HOME}/.minikube/apiserver.crt`,
				'client-key': `${process.env.HOME}/.minikube/apiserver.key`
			}
		}]
}

var kubeconfigToken = {
		'current-context': 'minikube',
		contexts: [{
			name: 'minikube',
			context:{
				cluster: 'minikube',
				user: 'minikube'
			}
		}],
		clusters: [{
			name: 'minikube',
			cluster: {
		    	'certificate-authority-data': fs.readFileSync(`${process.env.HOME}/.minikube/ca.crt`).toString('base64'),
		    	server: 'https://192.168.99.100:8443'
			}
		}],
		users: [{
			name: 'minikube',
			user: {
				token: 'replaced_by_actual_token'
			}
		}]
}

var kubeconfigUserPassword = {
	version: '/api/v1',
	kubeconfig: {
		'current-context': 'minikube',
		contexts: [{
			name: 'minikube',
			context:{
				cluster: 'minikube',
				user: 'minikube'
			}
		}],
		clusters: [{
			name: 'minikube',
			cluster: {
		    	'certificate-authority-data': fs.readFileSync(`${process.env.HOME}/.minikube/ca.crt`).toString('base64'),
		    	server: 'https://192.168.99.100:8443'
			}
		}],
		users: [{
			name: 'minikube',
			user: {
				username: 'admin',
				password: 'some_password'
			}
		}]
	}
}

describe.only('kubeapi read kubeconfig',function() 
{
	this.timeout(1000)

	it('test kubeconfig with embedded data', function(done)
	{
		var api = K8s.api({version: '/api/v1', kubeconfig: createTmpFS(kubeconfigEmbedded)})
		api.get('namespaces/default/replicationcontrollers', function(err, data){
			done(err)
		})
	})

	it('test Kubeconfig with file references', function(done)
	{
		var api = K8s.api({version: '/api/v1', kubeconfig: createTmpFS(kubeconfigKeyReference)})
		api.get('namespaces/default/replicationcontrollers', function(err, data){
			done(err)
		})
	})

	it('test Kubeconfig with strictSSL set to false', function(done)
	{
		var api = K8s.api({version: '/api/v1', kubeconfig: createTmpFS(kubeconfigInsecure)})
		api.get('namespaces/default/replicationcontrollers', function(err, data){
			done(err)
		})
	})

	it('test Kubeconfig with User token', function(done)
	{
		// Get a real token for minikube to authenticate
		K8s.api({version: '/api/v1', kubeconfig: createTmpFS(kubeconfigKeyReference)}).get('namespaces/default/secrets', function(err, data){
			secret = data.items[0].data.token

			var config = kubeconfigToken
			config.users = [{
					name: 'minikube',
					user: {
						token: Buffer.from(secret, 'base64').toString("ascii")
					}
				}]
			var api = K8s.api({version: '/api/v1', kubeconfig: createTmpFS(config)})
			api.get('namespaces/default/replicationcontrollers', function(err, data){
				done(err)
			})
		});
	})

	// it('test Kubeconfig with username/password', function(done)
	// {
	// 	// Read real kube config (No way to use minikube)
	// 	var api = K8s.api({
	// 		version: '/api/v1',
	// 		kubeconfig: `${process.env.HOME}/.kube/config`
	// 	})
	// 	api.get('namespaces/default/replicationcontrollers', function(err, data){
	// 		done(err)
	// 	})
	// })

	// Puts data in a temporal file
	createTmpFS = function(data) {
		var stream = temp.createWriteStream()
		fs.writeFileSync(stream.path, jsyaml.safeDump(data))
		return stream.path
	}

	after(function() {
		temp.cleanup() // Cleanup files
	})
})
