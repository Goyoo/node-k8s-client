const spawn = require('child_process').spawn
const _ = require('underscore')

class Kubectl
{
    private type: any
    private binary: any
    private kubeconfig: any
    private namespace: any
    private endpoint: any
    private context: any

    constructor(type: any, conf: any)
    {
        this.type = type
        this.binary = conf.binary || 'kubectl'
        this.kubeconfig = conf.kubeconfig || ''
        this.namespace = conf.namespace || ''
        this.endpoint = conf.endpoint || ''
        this.context = conf.context || ''
    }

    private spawn(args: any, done: any)
    {
        const ops: any = new Array()

        if( this.kubeconfig ){
            ops.push('--kubeconfig='+this.kubeconfig)
        }
        else {
            ops.push('-s')
            ops.push(this.endpoint)
        }
        
        if (this.namespace) {
            ops.push('--namespace='+this.namespace)
        }

        if (this.context) {
            ops.push('--context='+this.context)
        }

        const kube: any = spawn(this.binary, ops.concat(args))
            , stdout: any[] = []
            , stderr: any[] = []
        
        kube.stdout.on('data', function (data: any) {
            stdout.push(data.toString())
        })
        
        kube.stderr.on('data', function (data: any) {
            stderr.push(data.toString())
        })
        
        kube.on('close', function () 
        {
            if( !stderr.length )
                return done(null, stdout.join(''))

            done(stderr.join(''))
        })
    }

    private callbackFunction(promise: any, callback: Function)
    {
        if( _.isFunction(callback) )
        {
            promise.then((data: any)=>{
                callback(null, data)
            }).catch((err: any)=>{
                callback(err)
            })
        }
    }

    public command(cmd: any, callback: Function): Promise<any>
    {
        if( _.isString(cmd) )
            cmd = cmd.split(' ')
            
        const promise = new Promise((resolve, reject) => 
        {
            this.spawn(cmd, function(err: any, data: any)
            {
                if( err )
                    return reject(err || data)
                
                resolve(cmd.join(' ').indexOf('--output=json') > -1 ? JSON.parse(data): data)
            })
        })
        
        this.callbackFunction(promise, callback)
        
        return promise
    }

    public list(selector: any, flags: any, done: any)
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( typeof selector === 'object')
        {
            var args: any = '--selector='
            
            for( var key in selector )
                args += (key + '=' + selector[key])
            
            selector = args + ''
        }
        else{
            done = selector
            selector = '--output=json'
        }

        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        
        const action: any = ['get', this.type , selector, '--output=json'].concat(flags)

        return this.command(action, done)
    }

    public get(name: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
         
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action = ['get', this.type, name, '--output=json'].concat(flags)

        return this.command(action, done)
        
    }

    public create(filepath: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action: any = ['create', '-f', filepath].concat(flags)

        return this.command(action, done)
    }

    public delete(id: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
            
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action: any = ['delete', this.type, id].concat(flags)

        return this.command(action, done)
    }

    public update(filepath: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action: any = ['update', '-f', filepath].concat(flags)

        return this.command(action, done)
    }

    public apply(name: string, json: Object, flags: any, done: (err: any, data: any)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action: any = ['update',  this.type, name, '--patch='+ JSON.stringify(json)].concat(flags)

        return this.command(action, done)
    }

    public rollingUpdateByFile(name: string, filepath: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( this.type !== 'replicationcontrollers' )
            throw new Error('not a function')

        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action: any = ['rolling-update',  name, '-f', filepath, '--update-period=0s'].concat(flags)

        return this.command(action, done)
    }


    public rollingUpdate(name: string, image: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( this.type !== 'replicationcontrollers' )
            throw new Error('not a function') 
        

        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        const action: any = ['rolling-update',  name, '--image=' + image, '--update-period=0s'].concat(flags)

        return this.command(action, done)
    }

    public scale(name: string, replicas: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( this.type !== 'replicationcontrollers' && this.type !== 'deployments' )
            throw new Error('not a function')
        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []
        const action: any = ['scale', '--replicas=' + replicas, 'replicationcontrollers', name].concat(flags)

        return this.command(action, done)
    }

    public logs(name: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( this.type !== 'pods' )
            throw new Error('not a function')

        var action: any = new Array('logs')

        if (name.indexOf(' ') > -1) {
            var names: any = name.split(/ /)
            action.push(names[0])
            action.push(names[1])
        } else {
            action.push(name)
        }

        
        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        return this.command(action.concat(flags), done)
    }

    public describe(name: string, flags: any, done: (err: any, data: any)=>void)
    {
        if( !this.type )
            throw new Error('not a function')

        var action: any = new Array('describe', this.type)

        if ( name === null ) {
            action.push(name)
        }

        if( _.isFunction(flags) ){
            done = flags
            flags = null
        }

        flags = flags || []

        return this.command(action.concat(flags), done)
    }

    public portForward(name: string, portString: string, done: (err: any, data: any)=>void)
    {
        if( this.type !== 'pods' )
            throw new Error('not a function')

        var action: any = new Array('port-forward', name, portString)

        return this.command(action, done)
    }

    public useContext(context: string, done: (err: any, data: any)=>void)
    {
        var action: any = new Array('config', 'use-context', context)
        
        return this.command(action, done)
    }

    public viewContext(done: (err: any, data: any)=>void)
    {
        var action: any = new Array('config', '--output=json', 'view')
        
        this.command(action, done)
    }
}

declare function require(name:string): any

export = (conf: any):any=>
{
	return {
    // short names are just aliases to longer names
		pod: new Kubectl('pods', conf)
		, po: new Kubectl('pods', conf)
		, replicationcontroller: new Kubectl('replicationcontrollers', conf)
		, rc: new Kubectl('replicationcontrollers', conf)
		, service: new Kubectl('services', conf)
		, svc: new Kubectl('services', conf)
		, node: new Kubectl('nodes', conf)
		, no: new Kubectl('nodes', conf)
		, namespace: new Kubectl('namespaces', conf)
		, ns: new Kubectl('namespaces', conf)
		, deployment: new Kubectl('deployments', conf)
		, daemonset: new Kubectl('daemonsets', conf)
		, ds: new Kubectl('daemonsets', conf)
		, secrets: new Kubectl('secrets', conf)
		, endpoint: new Kubectl('endpoints', conf)
		, ep: new Kubectl('endpoints', conf)
		, ingress: new Kubectl('ingress', conf)
		, ing: new Kubectl('ingress', conf)
        , job: new Kubectl('job', conf)
        , context: new Kubectl('context', conf)
        , command: function(){
            arguments[0] = arguments[0].split(' ')
            return this.pod.command.apply(this.pod, arguments)
        }
	}
}
