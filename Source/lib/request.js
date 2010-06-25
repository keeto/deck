/*
---

script: request.js

description: JSGI+ request class.

license: MIT-style license

authors:
- Mark Obcena

provides: [Request]

...
*/

(function(){

var Env = require('./env').Env,
	Request;

Request = new Class({

	Implements: Env,

	// JSGI 3.0
	method: '',
	scriptName: '',
	pathInfo: '',
	queryString: '',
	host: '',
	port: '',
	scheme: '',
	input: null,
	headers: {},
	original: {},

	stopped: false,

	// JSGI+

	initialize: function(env){
		this.original = env;
		Object.append(this, Object.filter(env, function(item){
			return !(item instanceof Function);
		}));
	},

	setHeader: function(key, value){
		key = key.toLowerCase().replace(/[_-]+$/, '');
		this.headers[key] = value;
		return this;
	},

	setHeaders: function(headers){
		for (var i in headers) this.setHeader(i, headers[i]);
		return this;
	},

	getHeader: function(key){
		key = key.toLowerCase().replace(/[_-]+$/, '');
		return this.headers[key];
	},

	removeHeader: function(key){
		delete this.headers[key];
		return this;
	},

	stop: function(){
		this.stopped = true;
		return this;
	},

	next: function(){},

	// for node
	setBodyEncoding: function(encoding){
		if (this.original.setBodyEncoding) this.original.setBodyEncoding(encoding);
		return this;
	},

	pause: function(encoding){
		if (this.original.pause) this.original.pause(encoding);
		return this;
	},

	resume: function(encoding){
		if (this.original.resume) this.original.resume(encoding);
		return this;
	}

});

exports.Request = Request;

})();
