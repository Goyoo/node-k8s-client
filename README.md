# Nodejs Kubernetes client


Node.js client library for Google's Kubernetes Kubectl And API


# build
``` 
    git clone https://github.com/Goyoo/node-k8s-client.git
    npm install
    npm run build
```
#test
 for test please install [minikube](https://github.com/kubernetes/minikube/releases)
```
    
    mocha test
```

# Install:
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
    , namespace: 'namespace'
    , binary: '/usr/local/bin/kubectl'
})

//use restful api
var kubeapi = K8s.api({
	endpoint: 'http://192.168.10.10:8080'
	, version: '/api/v1'
})

// Configure using kubeconfig
var kubeapi = K8s.api({
    kubeconfig: '/etc/cluster1.yaml'
    ,version: '/api/v1'
})

var kube = K8s.kubectl({
	binary: '/bin/kubectl'
	,kubeconfig: '/etc/cluster1.yaml'
	,version: '/api/v1'
});

```

### Options

endpoint
: URL for API

version
: API Version

binary
: Path to binary file

kubeconfig
: Path to kubeconfig

:auth
See below authentication section

:strictSSL
If set to false, use of the API will not validate SSL certificate. Defualt is true.

#### Authentication

Authentication to REST API is done via the `auth` option. Currently supported authentication method types are username/password, token and client certificate. Presence of authentication details is checked in this order so if a token is specified as well as a client certificate then a token will be used.

Username/password:

```
{
  "auth": {
    "username": "admin",
    "password": "123123"
  }
}
```

Token:

```
{
  "auth": {
    "token": "hcc927ndkcka12"
  }
}
```

Client certificate:

```
{
  "auth": {
    "clientKey": fs.readFileSync('k8s-client-key.pem'),
    "clientCert": fs.readFileSync('k8s-client-cert.pem'),
    "caCert": fs.readFileSync('k8s-ca-crt.pem')
  }
}
```

# kubeAPI

#### using callback
```js
// method GET
kubeapi.get('namespaces/default/replicationcontrollers', function(err, data){})

// method POST
kubeapi.post('namespaces/default/replicationcontrollers', require('./rc/nginx-rc.json'), function(err, data){})
// method PUT
kubeapi.put('namespaces/default/replicationcontrollers/nginx', require('./rc/nginx-rc.json'), function(err, data){})
// method PATCH
kubeapi.patch('namespaces/default/replicationcontrollers/nginx', [{ op: 'replace', path: '/spec/replicas', value: 2 }], function(err, data){})
// method DELETE
kubeapi.delete('namespaces/default/replicationcontrollers/nginx', function(err, data){})

```
#### using promise
```js
// method GET
kubeapi.get('namespaces/default/replicationcontrollers').then(function(data){}).catch(function(err){})
// method POST
kubeapi.post('namespaces/default/replicationcontrollers', require('./rc/nginx-rc.json')).then(function(data){}).catch(function(err){})
// method PUT
kubeapi.put('namespaces/default/replicationcontrollers/nginx', require('./rc/nginx-rc.json')).then(function(data){}).catch(function(err){})
// method PATCH
kubeapi.patch('namespaces/default/replicationcontrollers/nginx', [{ op: 'replace', path: '/spec/replicas', value: 2 }]).then(function(data){}).catch(function(err){})
// method DELETE
kubeapi.delete('namespaces/default/replicationcontrollers/nginx').then(function(data){}).catch(function(err){})

```
#### using async/await
```js

!async function()
{
    try
    {
        // method GET
        const data1 = await kubeapi.get('namespaces/default/replicationcontrollers')
        // method POST
        const data2 = await kubeapi.post('namespaces/default/replicationcontrollers', require('./rc/nginx-rc.json'))
        // method PUT
        const data3 = await kubeapi.put('namespaces/default/replicationcontrollers/nginx', require('./rc/nginx-rc.json'))
        // method PATCH
        const data4 = await kubeapi.patch('namespaces/default/replicationcontrollers/nginx', [{ op: 'replace', path: '/spec/replicas', value: 2 }])
        // method DELETE
        const data5 = await kubeapi.delete('namespaces/default/replicationcontrollers/nginx')
    }
    catch(err){
        console.log(err)
    }
}()

```

#### method GET -> watch
###### using callback
```js
var res = kubeapi.watch('watch/namespaces/default/pods', function(data){
	// message
}, function(err){
	// exit
}, [timeout])

```

###### using rxjs
```js
kubeapi.watch('watch/namespaces/default/pods', [timeout]).subscribe(data=>{
    // message
}, err=>{
    // exit
})
```

# kubectl (callback, promise, async/await)

### example
```js
    //kubectl['type']['action]([arguments], [flags], [callback]): Promise

    //callback
    kubect.pod.delete('pod_name', function(err, data){})
    kubect.pod.delete('pod_name', ['--grace-period=0'], function(err, data){})
    //promise
    kubect.pod.delete('pod_name').then()
    kubect.pod.delete('pod_name', ['--grace-period=0']).then()
    //async/await
    const data = await kubect.pod.delete('pod_name')
    const data = await kubect.pod.delete('pod_name',['--grace-period=0'])
```

### excute command
```js
    kubectl.command('get pod pod_name --output=json', function(err, data){})
    kubectl.command('get pod pod_name --output=json').then()
    const data = await kubectl.command('get pod pod_name --output=json')
```

## Pods

### get pod list

```js
kubectl.pod.list(function(err, pods){})

//selector
var label = { name: nginx }
kubectl.pod.list(label, function(err, pods){})
```

### get  pod

```js
kubectl.pod.get('nginx', function(err, pod){})

// label selector
kubectl.pod.list({ app: 'nginx' }, function(err, pods){}) 
```

### create a pod

```js
kubectl.pod.create('/:path/pods/nginx.yaml'), function(err, data){})
```

### delete a pod

```js
kubectl.pod.delete('nginx', function(err, data){})
```

### log

```js
kubectl.pod.log('pod_id1 pod_id2 pod_id3', function(err, log){})
```

## ReplicationController

### get rc list

```js
kubectl.rc.list(function(err, pods){})
```

### get a rc

```js
kubectl.rc.get('nginx', function(err, pod){})
```

### create a rc

```js
kubectl.rc.create('/:path/pods/nginx.yaml'), function(err, data){})
```

### delete a rc

```js
kubectl.rc.delete('nginx', function(err, data){})

```

### rolling-update by image name

```js
kubectl.rc.rollingUpdate('nginx', 'nginx:vserion', function(err, data){})
```

### rolling-update by file

```js
kubectl.rc.rollingUpdateByFile('nginx', '/:path/rc/nginx-v2.yaml', function(err, data){})
```

### change replicas

```js
kubectl.rc.scale('nginx', 3, function(err, data){})
```

## Service

### get service list

```js
kubectl.service.list(function(err, pods){})
```

### get a service

```js
kubectl.service.get('nginx', function(err, pod){})
```

### create a service

```js
kubectl.service.create('/:path/service/nginx.yaml'), function(err, data){})
```

### delete a service

```js
kubectl.service.delete('nginx', function(err, data){})
```


## Node

### get node list

```js
kubectl.node.list(function(err, nodes){})
```

### get a node

```js
kubectl.node.get('node1', function(err, node){})
```

### create a node

```js
kubectl.node.create('/:path/nodes/node1.yaml'), function(err, node){})
```

### delete a node

```js
kubectl.node.delete('node1', function(err, node){})


```

## Namespace

```js
    kubectl.namespace['fn']

```
## Daemonset

```js
    kubectl.daemonset['fn']

```
## Deployment

```js
    kubectl.deployment['fn']

```
## Secrets

```js
    kubectl.secrets['fn']

```
## endpoint

```js
    kubectl.endpoint['fn']

```
## ingress

```js
    kubectl.ingress['fn']

```
