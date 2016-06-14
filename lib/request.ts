const request = require('request')
const Promise = require('promise')
const Rx = require('rx')
const _ = require('underscore')
const jsonpatch = require('fast-json-patch')
const Observable = Rx.Observable

class Request 
{
    private authtype
    private username
    private password
    private ignoreCerts
    private domain

    constructor(conf: any)
    {
        if( conf.hasOwnProperty("auth") && conf.auth.hasOwnProperty("type") ) 
        {
            this.authtype = conf.auth.type

            if (this.authtype === 'password') {
                this.username = conf.auth.username
                this.password = conf.auth.password
            }
        }
        
        this.ignoreCerts = false

        if (conf.hasOwnProperty("strictSSL") && conf.strictSSL === false)
            this.ignoreCerts = true;

        this.domain = conf.endpoint + '/api/' + conf.version + '/'
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
            "Content-Type": "application/json"
        }

        if( this.ignoreCerts ){
            options.strictSSL = false;
        }

        if (this.authtype === 'password') {
            const authstr = new Buffer(this.username + ':' + this.password).toString('base64')
            options.headers.Authorization = 'Basic ' + authstr
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
                "Content-Type": "application/json-patch+json"
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

	public delete(url, done?): Promise<any>
    {
        const promise = new Promise((resolve, reject) => 
        {
            request.del(this.getRequestOptions(url), function(err, res, data)
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

        const source = Rx.Observable.create((observer)=>
        {
            request.get(this.domain + url, { timeout: timeout },function(e){ }).on('data', function(data)
            {
                try{ 
                    const json = JSON.parse(data.toString())
                    observer.onNext(json)
                }
                catch(err){ 
                    observer.onError(err)
                }
            }).on('error', function(err){
                observer.onError(err)  
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
        }

        return source
    }
}

declare function require(name:string)

export = (conf)=>{
    return new Request(conf)
}
