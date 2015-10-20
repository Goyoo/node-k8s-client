# Nodejs Kubernetes client

Node.js client library for Google's Kubernetes Kubectl And API

Install:
```
    npm install k8s
```
# Usage

## Create client

```js
var K8s = require('k8s')

// use kubectl

var kubectl = K8s.kubectl({
    endpoint:  'http://192.168.10.10:8080'
    , binary: '/usr/local/bin/kubectl'
})

//use restful api
var kubeapi = K8s.api({
	endpoint: 'http://192.168.10.10:8080'
	, version: 'v1'
})
```

# kubeAPI

```js
// method GET
kubeapi.get('namespaces/default/replicationcontrollers', function(err, data){})
// method POST
kubeapi.post('namespaces/default/replicationcontrollers', require('./rc/nginx-rc.json'), function(err, data){})
// method PUT
kubeapi.put('namespaces/default/replicationcontrollers/nginx', require('./rc/nginx-rc.json'), function(err, data){})
// method PATCH
kubeapi.patch('namespaces/default/replicationcontrollers/nginx', { apiVersion: 'v1' , spec: { replicas: 2 } }, function(err, data){})
// method DELETE
kubeapi.delete('namespaces/default/replicationcontrollers/nginx', function(err, data){})
// method GET -> watch
kubeapi.watch('watch/namespaces/default/pods', function(data){
	// message
}, function(err){
	// exit
}, [timeout])

```

# Pods

## get pod list

```js
kubectl.pod.list(function(err, pods){})
var label = { name: nginx }
kubectl.pod.list(label, function(err, pods){})
```

## get  pod

```js
kubectl.pod.get('nginx', function(err, pod){})

// label selector
kubectl.pod.list({ app: 'nginx' }, function(err, pods){}) 
```

## create a pod

```js
kubectl.pod.create('/:path/pods/nginx.yaml'), function(err, data){})
```

## delete a pod

```js
kubectl.pod.delete('nginx', function(err, data){})
```

## log

```js
kubectl.pod.log('pod_id1 pod_id2 pod_id3', function(err, log){})
```

# ReplicationController

## get rc list

```js
kubectl.rc.list(function(err, pods){})
```

## get a rc

```js
kubectl.rc.get('nginx', function(err, pod){})
```

## create a rc

```js
kubectl.rc.create('/:path/pods/nginx.yaml'), function(err, data){})
```

## delete a rc

```js
kubectl.rc.delete('nginx', function(err, data){})

```

## rolling-update by image name

```js
kubectl.rc.rollingUpdate('nginx', 'nginx:vserion', function(err, data){})
```

## rolling-update by file

```js
kubectl.rc.rollingUpdateByFile('nginx', '/:path/rc/nginx-v2.yaml', function(err, data){})
```

## change replicas

```js
kubectl.rc.scale('nginx', 3, function(err, data){})
```

# Service

## get service list

```js
kubectl.service.list(function(err, pods){})
```

## get a service

```js
kubectl.service.get('nginx', function(err, pod){})
```

## create a service

```js
kubectl.service.create('/:path/service/nginx.yaml'), function(err, data){})
```

## delete a service

```js
kubectl.service.delete('nginx', function(err, data){})
```


# Node

## get node list

```js
kubectl.node.list(function(err, pods){})
```

## get a node

```js
kubectl.node.get('nginx', function(err, pod){})
```

## create a node

```js
kubectl.node.create('/:path/nodes/node1.yaml'), function(err, data){})
```

## delete a node

```js
kubectl.node.delete('nginx', function(err, data){})
```
