(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var K8s;
	(function (K8s) {
	    K8s.api = __webpack_require__(1);
	    K8s.kubectl = __webpack_require__(7);
	})(K8s || (K8s = {}));
	module.exports = K8s;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	const request = __webpack_require__(2);
	const Promise = __webpack_require__(3);
	const Rx = __webpack_require__(4);
	const _ = __webpack_require__(5);
	const jsonpatch = __webpack_require__(6);
	const Observable = Rx.Observable;
	class Request {
	    constructor(conf) {
	        if (conf.hasOwnProperty("auth") && conf.auth.hasOwnProperty("type")) {
	            this.authtype = conf.auth.type;
	            if (this.authtype === 'password') {
	                this.username = conf.auth.username;
	                this.password = conf.auth.password;
	            }
	        }
	        this.ignoreCerts = false;
	        if (conf.hasOwnProperty("strictSSL") && conf.strictSSL === false)
	            this.ignoreCerts = true;
	        this.domain = conf.endpoint + '/api/' + conf.version + '/';
	    }
	    callbackFunction(primise, callback) {
	        if (_.isFunction(callback)) {
	            primise.then(data => {
	                callback(null, data);
	            }).catch(err => {
	                callback(err);
	            });
	        }
	    }
	    getRequestOptions(path, opts) {
	        const options = opts || {};
	        options.url = this.domain + path;
	        options.headers = {
	            "Content-Type": "application/json"
	        };
	        if (this.ignoreCerts) {
	            options.strictSSL = false;
	        }
	        if (this.authtype === 'password') {
	            const authstr = new Buffer(this.username + ':' + this.password).toString('base64');
	            options.headers.Authorization = 'Basic ' + authstr;
	        }
	        return options;
	    }
	    get(url, done) {
	        return __awaiter(this, void 0, Promise, function* () {
	            const promise = new Promise((resolve, reject) => {
	                request.get(this.getRequestOptions(url), function (err, res, data) {
	                    if (err || res.statusCode < 200 || res.statusCode >= 300)
	                        return reject(err || data);
	                    resolve(JSON.parse(data));
	                });
	            });
	            this.callbackFunction(promise, done);
	            return promise;
	        });
	    }
	    post(url, body, done) {
	        const promise = new Promise((resolve, reject) => {
	            request.post(this.getRequestOptions(url, { json: body }), function (err, res, data) {
	                if (err || res.statusCode < 200 || res.statusCode >= 300)
	                    return reject(err || data);
	                resolve(data);
	            });
	        });
	        this.callbackFunction(promise, done);
	        return promise;
	    }
	    put(url, body, done) {
	        const promise = new Promise((resolve, reject) => {
	            request.put(this.getRequestOptions(url, { json: body }), function (err, res, data) {
	                if (err || res.statusCode < 200 || res.statusCode >= 300)
	                    return reject(err || data);
	                resolve(data);
	            });
	        });
	        this.callbackFunction(promise, done);
	        return promise;
	    }
	    patch(url, body, done) {
	        const promise = new Promise((resolve, reject) => {
	            const options = this.getRequestOptions(url, { json: body });
	            options.headers = {
	                "Content-Type": "application/json-patch+json"
	            };
	            request.patch(options, function (err, res, data) {
	                if (err || res.statusCode < 200 || res.statusCode >= 300)
	                    return reject(err || data);
	                resolve(data);
	            });
	        });
	        this.callbackFunction(promise, done);
	        return promise;
	    }
	    delete(url, done) {
	        const promise = new Promise((resolve, reject) => {
	            request.del(this.getRequestOptions(url), function (err, res, data) {
	                if (err || res.statusCode < 200 || res.statusCode >= 300)
	                    return reject(err || data);
	                resolve(data);
	            });
	        });
	        this.callbackFunction(promise, done);
	        return promise;
	    }
	    watch(url, message, exit, timeout) {
	        if (_.isNumber(message)) {
	            timeout = message;
	            message = undefined;
	        }
	        const source = Rx.Observable.create((observer) => {
	            request.get(this.domain + url, { timeout: timeout }, function (e) { }).on('data', function (data) {
	                try {
	                    const json = JSON.parse(data.toString());
	                    observer.onNext(json);
	                }
	                catch (err) {
	                    observer.onError(err);
	                }
	            }).on('error', function (err) {
	                observer.onError(err);
	            });
	        });
	        if (_.isFunction(message)) {
	            source.subscribe(data => {
	                message(data);
	            }, err => {
	                if (_.isFunction(exit))
	                    exit(err);
	            });
	        }
	        return source;
	    }
	}
	module.exports = (conf) => {
	    return new Request(conf);
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("promise");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("rx");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("underscore");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("fast-json-patch");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const spawn = __webpack_require__(8).spawn;
	const _ = __webpack_require__(5);
	class Kubectl {
	    constructor(type, conf) {
	        this.type = type;
	        this.binary = conf.binary || 'kubectl';
	        this.kubeconfig = conf.kubeconfig || '';
	        this.namespace = conf.namespace || '';
	        this.endpoint = conf.endpoint || '';
	    }
	    spawn(args, done) {
	        const ops = new Array();
	        if (this.kubeconfig) {
	            ops.push('--kubeconfig');
	            ops.push(this.kubeconfig);
	        }
	        else {
	            ops.push('-s');
	            ops.push(this.endpoint);
	        }
	        if (this.namespace) {
	            ops.push('--namespace');
	            ops.push(this.namespace);
	        }
	        const kube = spawn(this.binary, ops.concat(args)), stdout = [], stderr = [];
	        kube.stdout.on('data', function (data) {
	            stdout.push(data.toString());
	        });
	        kube.stderr.on('data', function (data) {
	            stderr.push(data.toString());
	        });
	        kube.on('close', function (code) {
	            if (!stderr.length)
	                return done(null, stdout.join(''));
	            done(stderr.join(''));
	        });
	    }
	    callbackFunction(primise, callback) {
	        if (_.isFunction(callback)) {
	            primise.then(data => {
	                callback(null, data);
	            }).catch(err => {
	                callback(err);
	            });
	        }
	    }
	    command(cmd, callback) {
	        const promise = new Promise((resolve, reject) => {
	            this.spawn(cmd, function (err, data) {
	                if (err)
	                    return reject(err || data);
	                resolve(cmd.join(' ').indexOf('--output=json') > -1 ? JSON.parse(data) : data);
	            });
	        });
	        this.callbackFunction(promise, callback);
	        return promise;
	    }
	    list(selector, done) {
	        if (!this.type)
	            throw new Error('not a function');
	        if (typeof selector === 'object') {
	            var args = '--selector=';
	            for (var key in selector)
	                args += (key + '=' + selector[key]);
	            selector = args + '';
	        }
	        else {
	            done = selector;
	            selector = '--output=json';
	        }
	        const action = ['get', this.type, selector, '--output=json'];
	        return this.command(action, done);
	    }
	    get(name, done) {
	        if (!this.type)
	            throw new Error('not a function');
	        const action = ['get', this.type, name, '--output=json'];
	        return this.command(action, done);
	    }
	    create(filepath, done) {
	        if (!this.type)
	            throw new Error('not a function');
	        const action = ['create', '-f', filepath];
	        return this.command(action, done);
	    }
	    delete(id, done) {
	        if (!this.type)
	            throw new Error('not a function');
	        const action = ['delete', this.type, id];
	        return this.command(action, done);
	    }
	    update(filepath, done) {
	        if (!this.type)
	            throw new Error('not a function');
	        const action = ['update', '-f', filepath];
	        return this.command(action, done);
	    }
	    apply(name, json, done) {
	        if (!this.type)
	            throw new Error('not a function');
	        const action = ['update', this.type, name, '--patch=' + JSON.stringify(json)];
	        return this.command(action, done);
	    }
	    rollingUpdateByFile(name, filepath, done) {
	        if (this.type !== 'rc')
	            throw new Error('not a function');
	        const action = ['rolling-update', name, '-f', filepath, '--update-period=0s'];
	        return this.command(action, done);
	    }
	    rollingUpdate(name, image, done) {
	        if (this.type !== 'rc')
	            throw new Error('not a function');
	        const action = ['rolling-update', name, '--image=' + image, '--update-period=0s'];
	        return this.command(action, done);
	    }
	    scale(name, replicas, done) {
	        if (this.type !== 'rc')
	            throw new Error('not a function');
	        const action = ['scale', '--replicas=' + replicas, 'replicationcontrollers', name];
	        return this.command(action, done);
	    }
	    logs(name, done) {
	        if (this.type !== 'pods')
	            throw new Error('not a function');
	        var action = new Array('logs');
	        if (name.indexOf(' ') > -1) {
	            var names = name.split(/ /);
	            action.push(names[0]);
	            action.push(names[1]);
	        }
	        else {
	            action.push(name);
	        }
	        return this.command(action, done);
	    }
	    portForward(name, portString, done) {
	        if (this.type !== 'pods')
	            throw new Error('not a function');
	        var action = new Array('port-forward', name, portString);
	        return this.command(action, done);
	    }
	    useContext(context, done) {
	        var action = new Array('config', 'use-context', context);
	        return this.command(action, done);
	    }
	    viewContext(done) {
	        var action = new Array('config', '--output=json', 'view');
	        this.command(action, done);
	    }
	}
	module.exports = (conf) => {
	    return {
	        pod: new Kubectl('pods', conf),
	        rc: new Kubectl('rc', conf),
	        service: new Kubectl('service', conf),
	        node: new Kubectl('node', conf)
	    };
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ }
/******/ ])));