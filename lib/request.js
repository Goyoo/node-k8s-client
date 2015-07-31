var request = require('request')
	, path = require('path')
	, http = require('http')

function Request(domain){
	this.domain = domain
}

Request.prototype.get = function(url, done){
	
	request.get(this.domain + url, function(err, response, data){
		if( err )
			return done(err)
		
		done(null, JSON.parse(data))
	})
}

Request.prototype.watch = function(url, done)
{
	var jsonstr = ''
	
	request.get(this.domain + url, function(){}).on('data', function(data)
	{
		var json
		
		try{
			jsonstr += data.toString()
			json = JSON.parse(jsonstr)
			jsonstr = ''
		}catch(e){
			
		}
		
		if( json )
			console.log(json.object.status.conditions, '\n', json.object.status.containerStatuses && json.object.status.containerStatuses[0].state)
			
		
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

module.exports = function(url){
	return new Request(url)
}