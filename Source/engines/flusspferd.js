/*
---

script: engines/flusspferd.js

description: flusspferd engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

var system = require('system'),
	fsbase = require('fs-base');

var Engine = {
	Info: {},
	Base: {},
	StdWrite: {},
	Request: {},
	Response: {},
	Vars: {}
};

exports.engine = Engine;

Engine.__defineGetter__('cwd', function(){
	return fsbase.workingDirectory;
});

Engine.Info = {
	name: 'flusspferd',
	adapter: '0.9'
};

Engine.Base = {
	global: {},
	system: system,
	args: system.args,
	env: system.env,
	cwd: '',
	setTimeout: null
};

Engine.StdWrite = {

	out: function(str){
		system.stdout.write(str + '\n');
		return system.stdout.flush();
	},

	error: function(str){
		system.stderr.write(str + '\n');
		return system.stderr.flush();
	}

};

Engine.Request = {

	parse: function(req){
		var request = {};

		request.scheme = req.scheme;
		request.version = req.version;

		request.method = req.method;
		request.scriptName = req.scriptName;
		request.pathInfo = req.pathInfo;
		request.queryString = req.queryString;
		request.host = req.host;
		request.port = req.port;
		request.env = Object.clone(Engine.Vars.Deck.env || {});

		request.headers = Object.clone(req.headers);

		request.input = req.input;
		request.post = {};
		request.get = {};
		request.cookie = {};
		request.files = {};
		request.original = req;
		return request;
	}

};

})();
