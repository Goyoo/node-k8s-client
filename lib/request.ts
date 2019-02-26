const request = require('request')
const Rx = require('rx')
const _ = require('underscore')
const Observable = Rx.Observable
const fs = require('fs')
const jsyaml = require('js-yaml')

declare var Buffer: any

export class Request
{
    private strictSSL: any
    private domain: any
    private auth: any

    constructor(conf: any)
    {
        if (conf.kubeconfig) {
            var kubeconfig: any = jsyaml.safeLoad(fs.readFileSync(conf.kubeconfig))
            var context: any = conf.context || this.readContext(kubeconfig)
            var cluster: any = this.readCluster(kubeconfig, context)
            var user: any = this.readUser(kubeconfig, context)
        }

        this.auth = conf.auth || {}

        this.auth.caCert = this.auth.caCert || this.readCaCert(cluster)
        this.auth.clientKey = this.auth.clientKey || this.readClientKey(user)
        this.auth.clientCert = this.auth.clientCert || this.readClientCert(user)
        this.auth.token = this.auth.token || this.readUserToken(user)
        this.auth.username = this.auth.username || this.readUsername(user)
        this.auth.password = this.auth.password || this.readPassword(user)

        // only set to false if explictly false in the config
        this.strictSSL = (conf.strictSSL !== false)

        var endpoint = conf.endpoint || this.readEndpoint(cluster)
        this.domain = `${endpoint}${conf.version}/`
    }

    // Returns Context JSON from kubeconfig
    private readContext(kubeconfig: any)
    {
        if (!kubeconfig) return
        return kubeconfig.contexts.find((x: any) => x.name === kubeconfig['current-context'])
    }

    // Returns Cluster JSON from context at kubeconfig
    private readCluster(kubeconfig: any, context: any)
    {
        if (!kubeconfig || !context) return
        return kubeconfig.clusters.find((x: any) => x.name === context.context.cluster)
    }

    // Returns Cluster JSON from context at kubeconfig
    private readUser(kubeconfig: any, context: any)
    {
        if (!kubeconfig) return
        return kubeconfig.users.find((x: any) => x.name === context.context.user)
    }

    // Returns CaCert from kubeconfig
    private readCaCert(cluster: any)
    {
        if (!cluster) return
        var certificate_authority: any = cluster.cluster['certificate-authority']
        if (certificate_authority) {
            return fs.readFileSync(certificate_authority).toString()
        }
        var certificate_authority_data: any = cluster.cluster['certificate-authority-data']
        if (certificate_authority_data) {
            return Buffer.from(certificate_authority_data, 'base64').toString("ascii")
        }
    }

    // Returns CaCert from kubeconfig
    private readClientKey(user: any)
    {
        if (!user) return
        var client_key: any = user.user['client-key']
        if (client_key) {
            return fs.readFileSync(client_key).toString()
        }
        var client_key_data: any = user.user['client-key-data']
        if (client_key_data) {
            return Buffer.from(client_key_data, 'base64').toString("ascii")
        }
    }

    // Returns CaCert from kubeconfig
    private readClientCert(user: any)
    {
        if (!user) return
        var client_certificate = user.user['client-certificate']
        if (client_certificate) {
            return fs.readFileSync(client_certificate).toString()
        }
        var client_certificate_data = user.user['client-certificate-data']
        if (client_certificate_data) {
            return Buffer.from(client_certificate_data, 'base64').toString("ascii")
        }
    }

    // Returns User token from kubeconfig
    private readUserToken(user: any)
    {
        if (!user) return
        return user.user['token']
    }

    // Returns User token from kubeconfig
    private readUsername(user: any)
    {
        if (!user) return
        return user.user['username']
    }

    private readPassword(user: any)
    {
        if (!user) return
        return user.user['password']
    }

    private readEndpoint(cluster: any)
    {
       if (!cluster) return
       return cluster.cluster['server']
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

    private getRequestOptions(path: string, opts?: any)
    {
        const options: any = opts || {}

        options.url = this.domain + path

        options.headers = {
            'Content-Type': 'application/json'
        }

        options.strictSSL = this.strictSSL

        if (this.auth) {
            if (this.auth.caCert) {
                options.ca = this.auth.caCert
            }

            if (this.auth.username && this.auth.password) {
                const authstr: string = new Buffer(this.auth.username + ':' + this.auth.password).toString('base64')
                options.headers.Authorization = `Basic ${authstr}`
            } else if (this.auth.token) {
                options.headers.Authorization = `Bearer ${this.auth.token}`
            } else if (this.auth.clientCert && this.auth.clientKey) {
                options.cert = this.auth.clientCert
                options.key = this.auth.clientKey
            }
        }

        return options
    }

    public async get(url: string, done?: any): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.get(this.getRequestOptions(url), function(err: any, res: any, data: any)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(JSON.parse(data))
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }


    public async log(url: string, done?: any): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.get(this.getRequestOptions(url), function(err: any, res: any, data: any)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public post(url: string, body: any, done?: any): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.post(this.getRequestOptions(url, {json: body}), function(err: any, res: any, data: any)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public put(url: string, body: any, done?: any): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.put(this.getRequestOptions(url, {json: body}), function(err: any, res: any, data: any)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public patch(url: string, body: any, _options?: any, done?: any): Promise<any>
    {
        if( typeof (_options) === 'function' ){
            done = _options
            _options = undefined
        }

        const promise = new Promise((resolve, reject) =>
        {
            const options = this.getRequestOptions(url, { json:  body })

            options.headers['Content-Type'] = 'application/json-patch+json'

            if( _options && _options.headers )
            {
                for( let key in _options.headers ){
                    options.headers[key] = _options.headers[key]
                }
            }

            request.patch(options, function(err: any, res: any, data: any)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public delete(url: string, json?: any, done?: any): Promise<any>
    {
        if( _.isFunction(json) ){
            done = json
            json = undefined
        }

        const promise = new Promise((resolve, reject) =>
        {
            request.del(this.getRequestOptions(url, json), function(err: any, res: any, data: any)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public watch(url: string, message?: any, exit?: any, timeout?: any)
    {
        if( _.isNumber(message) ){
            timeout = message
            message = undefined
        }
        var res: any

        const source = Observable.create((observer: any)=>
        {
            var jsonStr = ''
            res = request.get(this.getRequestOptions(url, { timeout: timeout }),function(){ }).on('data', function(data: any)
            {
                if (res.response.headers['content-type']==='text/plain') {
                    observer.onNext(data.toString())
                } else {
                    jsonStr += data.toString()

                    if (!/\n$/.test(jsonStr))
                        return
                    jsonStr = jsonStr.replace('\n$', '')
                    try {
                        jsonStr.split('\n').forEach(function(jsonStr){
                            if( !jsonStr )
                                return
                            const json = JSON.parse(jsonStr)
                            observer.onNext(json)
                        })
                        jsonStr = ''
                    }
                    catch(err){
                        observer.onError(err)
                    }
                }
            }).on('error', function(err: any){
                observer.onError(err)
            }).on('close', function(){
                observer.onError()
            })
        })

        if( _.isFunction(message) )
        {
            source.subscribe((data: any)=>{
                message(data)
            }, (err: any)=>{
                if( _.isFunction(exit) )
                    exit(err)
            })

            return res
        }

        return source
    }
}
