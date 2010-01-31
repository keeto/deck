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

var Request = new Class({

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
	env: {},
	origReq: {},

	stopped: false,

	// JSGI+

	initialize: function(env){
		Object.append(this, env);
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

	setEnv: function(key, value){
		this.env[key] = value;
		return this;
	},

	setEnvs: function(envs){
		for (var i in envs) this.setEnv(i, envs[i]);
		return this;
	},

	getEnv: function(key){
		return this.env[key];
	},

	removeEnv: function(key){
		delete this.env[key];
		return this;
	},

	stop: function(){
		this.stopped = true;
		return this;
	},

	next: function(){},

	// for node
	setBodyEncoding: function(encoding){
		if (this.origReq.setBodyEncoding) this.origReq.setBodyEncoding(encoding);
		return this;
	},

	pause: function(encoding){
		if (this.origReq.pause) this.origReq.pause(encoding);
		return this;
	},

	resume: function(encoding){
		if (this.origReq.resume) this.origReq.resume(encoding);
		return this;
	}

});

exports.Request = Request;

})();