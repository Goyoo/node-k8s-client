const request = require('request')
const Rx = require('rx')
const _ = require('underscore')
const Observable = Rx.Observable

declare var Buffer

export class Request
{
    private strictSSL
    private domain
    private auth

    constructor(conf: any)
    {
        this.auth = conf.auth
        // only set to false if explictly false in the config
        this.strictSSL = (conf.strictSSL !== false)
        this.domain = `${conf.endpoint}${conf.version}/`
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
            if (this.auth.username && this.auth.password) {
                const authstr = new Buffer(this.auth.username + ':' + this.auth.password).toString('base64')
                options.headers.Authorization = `Basic ${authstr}`
            } else if (this.auth.token) {
                options.headers.Authorization = `Bearer ${this.auth.token}`
            } else if (this.auth.clientCert && this.auth.clientKey && this.auth.caCert) {
                options.cert = this.auth.clientCert
                options.key = this.auth.clientKey
                options.ca = this.auth.caCert
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

	public patch(url, body, done?): Promise<any>
    {
        const promise = new Promise((resolve, reject) =>
        {
            const options = this.getRequestOptions(url, { json:  body })

            options.headers = {
                'Content-Type': 'application/json-patch+json'
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
