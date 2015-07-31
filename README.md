# node-k8s-client

# Google Kubernetes client

Node.js client library for Google's Kubernetes Kubectl And API

Install:
    npm install k8s
	
Current includes:

* get
* create
* update 
* delete
* rolling-update
* scale


# Usage

## Create client

```js
var K8s = require('k8s')

var kubectl = K8s.kubectl({
    endpoint:  'http://192.168.10.10'
    , binary: '/usr/local/bin/kubectl'
})
```

# Pods

## get pods

```js
kubectl.pod.list(function(err, pods){
    console.log('pods:', pods);
})
```

## get a pod

```js
kubectl.pod.get('nginx', function(err, pod){
    console.log('nginx:', pod);
})
```

## create a pod

```js
kubectl.pod.create('/:path/pods/nginx.yaml'), function(err, data){
	
})
```

## delete a pod

```js
kubectl.pod.delete('nginx', function(err, data){
	assert(!err)
	done()
})

```


# ReplicationController

## get rc list

```js
kubectl.rc.list(function(err, pods){
    console.log('pods:', pods);
})
```

## get a rc

```js
kubectl.rc.get('nginx', function(err, pod){
    console.log('nginx:', pod);
})
```

## create a rc

```js
kubectl.rc.create('/:path/pods/nginx.yaml'), function(err, data){
	
})
```

## delete a pod

```js
kubectl.rc.delete('nginx', function(err, data){
	assert(!err)
	done()
})

```

## rolling-update from image

```js
kubectl.rc.rollingUpdate('nginx', 'nginx:vserion', function(err, data){
	console.log(data)
	done()
})

```

## rolling-update from file

```js
kubectl.rc.rollingUpdateByFile('nginx', '/:path/rc/nginx-v2.yaml', function(err, data){
	console.log(data)
	done()
})

```

