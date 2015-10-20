var request = require('request')
	, path = require('path')

function Request(conf){
	this.domain = conf.endpoint + '/api/' + conf.version + '/'
	
}

Request.prototype.get = function(url, done)
{
	request.get(this.domain + url, function(err, response, data){
		if( err )
			return done(err)
		
		done(null, JSON.parse(data))
	})
}

Request.prototype.watch = function(url, message, exit, timeout)
{
	request.get(this.domain + url, {timeout: timeout},function(){}).on('data', function(data)
	{
		var json
		
		try{ json = JSON.parse(data.toString())}
		catch(e){ }
		
		if( json )
			message(json)
	}).on('error', function(err){
		exit && exit(err)
	}))
}

Request.prototype.post = function(url, body, done){
	// console.log(url, body)
	request.post({ url: this.domain + url, json: body }, function(err, res, data){
		done(err, data)
	})
}

Request.prototype.put = function(url, body, done){
	// console.log(url, body)
	request.put({ url: this.domain + url, json: body }, function(err, res, data){
		done(err, data)
	})
}

Request.prototype.patch = function(url, body, done){
	request.patch({ url: this.domain + url, json: body }, function(err, res, data){
		done(err, data)
	})
}

Request.prototype.delete = function(url, done){
	request.del(this.domain + url, function(err, res, data){
		done(err, data)
	})
}

module.exports = function(conf){
	return new Request(conf)
}
