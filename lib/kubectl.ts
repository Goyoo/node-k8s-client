const spawn = require('child_process').spawn
const _ = require('underscore')

class Kubectl
{
    private type
    private binary
    private kubeconfig
    private namespace
    private endpoint

    constructor(type, conf)
    {
        this.type = type
        this.binary = conf.binary || 'kubectl'
        this.kubeconfig = conf.kubeconfig || ''
        this.namespace = conf.namespace || ''
        this.endpoint = conf.endpoint || ''
    }

    private spawn(args, done)
    {
        const ops = new Array()

        if( this.kubeconfig ){
            ops.push('--kubeconfig')
            ops.push(this.kubeconfig)
        } 
        else {
            ops.push('-s')
            ops.push(this.endpoint)
        }
        
        if (this.namespace) {
            ops.push('--namespace')
            ops.push(this.namespace)
        }

        const kube = spawn(this.binary, ops.concat(args))
            , stdout = []
            , stderr = []
        
        kube.stdout.on('data', function (data) {
            stdout.push(data.toString())
        })
        
        kube.stderr.on('data', function (data) {
            stderr.push(data.toString())
        })
        
        kube.on('close', function (code) 
        {
            if( !stderr.length )
                return done(null, stdout.join(''))

            done(stderr.join(''))
        })
    }

    private callbackFunction(primise, callback)
    {
        if( _.isFunction(callback) )
        {
            primise.then(data=>{
                callback(null, data)
            }).catch(err=>{
                callback(err)
            })
        }
    }

    public command(cmd, callback): Promise<any>
    {
        const promise = new Promise((resolve, reject) => 
        {
            this.spawn(cmd, function(err, data)
            {
                if( err )
                    return reject(err || data)
                
                resolve(cmd.join(' ').indexOf('--output=json') > -1 ? JSON.parse(data): data)
            })
        })
        
        this.callbackFunction(promise, callback)
        
        return promise
    }

    public list(selector, done?)
    {
        if( !this.type )
            throw new Error('not a function')
        
        if( typeof selector === 'object')
        {
            var args = '--selector='
            
            for( var key in selector )
                args += (key + '=' + selector[key])
            
            selector = args + ''
        }
        else{
            done = selector
            selector = '--output=json'
        }
        
        const action = ['get', this.type , selector, '--output=json']

        return this.command(action, done)
    }

    public get(name: string, done?: (err, data)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
         
        const action = ['get', this.type, name, '--output=json']

        return this.command(action, done)
        
    }

    public create(filepath: string, done?: (err, data)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
        
        const action = ['create', '-f', filepath]

        return this.command(action, done)
    }

    public delete(id: string, done?: (err, data)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
            
        const action = ['delete', this.type, id]

        return this.command(action, done)
    }

    public update(filepath: string, done?: (err, data)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
        
        const action = ['update', '-f', filepath]

        return this.command(action, done)
    }

    public apply(name: string, json: Object, done?: (err, data)=>void)
    {
        if( !this.type )
            throw new Error('not a function')
        
        const action = ['update',  this.type, name, '--patch='+ JSON.stringify(json)]

        return this.command(action, done)
    }

    public rollingUpdateByFile(name: string, filepath: string, done?: (err, data)=>void)
    {
        if( this.type !== 'rc' )
            throw new Error('not a function')
        
        const action = ['rolling-update',  name, '-f', filepath, '--update-period=0s']

        return this.command(action, done)
    }


    public rollingUpdate(name: string, image: string, done?: (err, data)=>void)
    {
        if( this.type !== 'rc' )
            throw new Error('not a function')
        
        const action = ['rolling-update',  name, '--image=' + image, '--update-period=0s']

        return this.command(action, done)
    }

    public scale(name: string, replicas: string, done?: (err, data)=>void)
    {
        if( this.type !== 'rc' )
            throw new Error('not a function')
        
        const action = ['scale', '--replicas=' + replicas, 'replicationcontrollers', name]

        return this.command(action, done)
    }

    public logs(name: string, done?: (err, data)=>void)
    {
        if( this.type !== 'pods' )
            throw new Error('not a function')

        var action = new Array('logs');

        if (name.indexOf(' ') > -1) {
            var names = name.split(/ /);
            action.push(names[0]);
            action.push(names[1]);
        } else {
            action.push(name);
        }

        return this.command(action, done)
    }
    
    public portForward(name: string, portString: string, done?: (err, data)=>void)
    {
        if( this.type !== 'pods' )
            throw new Error('not a function')

        var action = new Array('port-forward', name, portString);

        return this.command(action, done)
    }

    public useContext(context: string, done?: (err, data)=>void)
    {
        var action = new Array('config', 'use-context', context);
        
        return this.command(action, done)
    }

    public viewContext(done?: (err, data)=>void)
    {
        var action = new Array('config', '--output=json', 'view');
        
        this.command(action, done)
    }
}

declare function require(name:string)

export = (conf)=>
{
	return {
		pod: new Kubectl('pods', conf)
		, rc: new Kubectl('rc', conf)
		, service: new Kubectl('service', conf)
		, node: new Kubectl('node', conf)
	}
}
