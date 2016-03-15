var request = require('request')
	, path = require('path')

function Request(conf){
	this.authtype = null;
	if (conf.hasOwnProperty("auth") && conf.auth.hasOwnProperty("type")) {
		this.authtype = conf.auth.type;
		if (this.authtype === 'password') {
			this.username = conf.auth.username;
			this.password = conf.auth.password;
		}
	}
	this.ignoreCerts = false;
	if (conf.hasOwnProperty("strictSSL") && conf.strictSSL === false) {
		this.ignoreCerts = true;
	}
	this.domain = conf.endpoint + '/api/' + conf.version + '/'
}

Request.prototype.getRequestOptions = function(path, opts){
	var options = opts || {};
	options.url = this.domain + path;
	options.headers = {
		"Content-Type": "application/json"
	};
	if (this.ignoreCerts) {
		options.strictSSL = false;
	}
	if (this.authtype === 'password') {
		var authstr = new Buffer(this.username + ':' + this.password).toString('base64');
		options.headers.Authorization = 'Basic ' + authstr;
	}
	return options;
}

Request.prototype.get = function(url, done)
{
	console.log("Performing request with ", this.getRequestOptions(url));
	request.get(this.getRequestOptions(url), function(err, response, data){
		if( err )
			return done(err)
		
		done(null, JSON.parse(data))
	})
}

Request.prototype.watch = function(url, message, exit, timeout)
{
	var _timeout = setTimeout(function(){
		exit()
	}, timeout + 1000)
	
	request.get(this.getRequestOptions(url), {timeout: timeout},function(e){ }).on('data', function(data)
	{
		var json
		
		clearTimeout(_timeout)
		
		_timeout = setTimeout(function(){
			exit()
		}, timeout + 1000)
		
		try{ 
			json = JSON.parse(data.toString())
		}
		catch(e){ 
			
		}
		
		if( json )
			message(json)
		
	}).on('error', function(err){
		clearTimeout(_timeout)
		exit && exit(err)
	})
}

Request.prototype.post = function(url, body, done){
	// console.log(url, body)
	request.post({ url: this.domain + url, json: body }, function(err, res, data){
		done(err, data)
	})
}

Request.prototype.put = function(url, body, done){
	// console.log(url, body)
	request.put(this.getRequestOptions(url, {json: body}), function(err, res, data){
		done(err, data)
	})
}

Request.prototype.patch = function(url, body, done){
	request.patch(this.getRequestOptions(url, {json: body}), function(err, res, data){
		done(err, data)
	})
}

Request.prototype.delete = function(url, done){
	request.del(this.getRequestOptions(url), function(err, res, data){
		done(err, data)
	})
}

module.exports = function(conf){
	return new Request(conf)
}
