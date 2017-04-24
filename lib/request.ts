const request = require('request')
const Rx = require('rx')
const _ = require('underscore')
const Observable = Rx.Observable
const fs = require('fs')
const jsyaml = require('js-yaml')

declare var Buffer

export class Request
{
    private strictSSL
    private domain
    private auth

    constructor(conf: any)
    {
        if (conf.kubeconfig) {
            var kubeconfig = jsyaml.safeLoad(fs.readFileSync(conf.kubeconfig))
            var context = this.readContext(kubeconfig)
            var cluster = this.readCluster(kubeconfig, context)
            var user = this.readUser(kubeconfig, context)
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
    private readContext(kubeconfig)
    {
        if (!kubeconfig) return
        return kubeconfig.contexts.find(x => x.name === kubeconfig['current-context'])
    }

    // Returns Cluster JSON from context at kubeconfig
    private readCluster(kubeconfig, context)
    {
        if (!kubeconfig || !context) return
        return kubeconfig.clusters.find(x => x.name === context.context.cluster)
    }

    // Returns Cluster JSON from context at kubeconfig
    private readUser(kubeconfig, context)
    {
        if (!kubeconfig) return
        return kubeconfig.users.find(x => x.name === context.context.user)
    }

    // Returns CaCert from kubeconfig
    private readCaCert(cluster)
    {
        if (!cluster) return
        var certificate_authority = cluster.cluster['certificate-authority']
        if (certificate_authority) {
            return fs.readFileSync(certificate_authority).toString()
        }
        var certificate_authority_data = cluster.cluster['certificate-authority-data']
        if (certificate_authority_data) {
            return Buffer.from(certificate_authority_data, 'base64').toString("ascii")
        }
    }

    // Returns CaCert from kubeconfig
    private readClientKey(user)
    {
        if (!user) return
        var client_key = user.user['client-key']
        if (client_key) {
            return fs.readFileSync(client_key).toString()
        }
        var client_key_data = user.user['client-key-data']
        if (client_key_data) {
            return Buffer.from(client_key_data, 'base64').toString("ascii")
        }
    }

    // Returns CaCert from kubeconfig
    private readClientCert(user)
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
    private readUserToken(user)
    {
        if (!user) return
        return user.user['token']
    }

    // Returns User token from kubeconfig
    private readUsername(user)
    {
        if (!user) return
        return user.user['username']
    }

    private readPassword(user)
    {
        if (!user) return
        return user.user['password']
    }

    private readEndpoint(cluster)
    {
       if (!cluster) return
       return cluster.cluster['server']
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

    private getRequestOptions(path: string, opts?: any)
    {
        const options = opts || {}

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
                const authstr = new Buffer(this.auth.username + ':' + this.auth.password).toString('base64')
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

    public async get(url: string, done?): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.get(this.getRequestOptions(url), function(err, res, data)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(JSON.parse(data))
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }


    public async log(url: string, done?): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.get(this.getRequestOptions(url), function(err, res, data)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public post(url, body, done?): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.post(this.getRequestOptions(url, {json: body}), function(err, res, data)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public put(url, body, done?): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            request.put(this.getRequestOptions(url, {json: body}), function(err, res, data)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public patch(url, body, _options?, done?): Promise<any>
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

            request.patch(options, function(err, res, data)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public delete(url, json?, done?): Promise<any>
    {
        if( _.isFunction(json) ){
            done = json
            json = undefined
        }

        const promise = new Promise((resolve, reject) =>
        {
            request.del(this.getRequestOptions(url, json), function(err, res, data)
            {
                if( err || res.statusCode < 200 || res.statusCode >= 300 )
                    return reject(err || data)

                resolve(data)
            })
        })

        this.callbackFunction(promise, done)

        return promise
    }

	public watch(url, message?, exit?, timeout?)
    {
        if( _.isNumber(message) ){
            timeout = message
            message = undefined
        }
        var res

        const source = Rx.Observable.create((observer)=>
        {
            var jsonStr = ''
            res = request.get(this.getRequestOptions(url, { timeout: timeout }),function(e){ }).on('data', function(data)
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
            }).on('error', function(err){
                observer.onError(err)
            }).on('close', function(){
                observer.onError()
            })
        })

        if( _.isFunction(message) )
        {
            source.subscribe(data=>{
                message(data)
            }, err=>{
                if( _.isFunction(exit) )
                    exit(err)
            })

            return res
        }

        return source
    }
}
