/*
---

script: engines/ringo.js

description: ringojs/helma-ng engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

include('system');
include('fs');
include('io');
include('binary');

var Engine = {
	Info: {},
	Base: {},
	StdWrite: {},
	Request: {},
	Response: {},
	Vars: {}
};

exports.engine = Engine;


Engine.Info = {
	name: 'ringo',
	adapter: '0.5'
};

Engine.Base = {
	global: global,
	system: system,
	args: system.args,
	env: system.env,
	cwd: '',
	setTimeout: null
};

Engine.__defineGetter__('cwd', function(){
	return file.cwd();
});

Engine.StdWrite = {

	out: function(str){
		return system.stdout.write(str + '\n');
	},

	error: function(str){
		return system.stderr.write(str + '\n');
	}

};

Engine.Request = {

	parse: function(req){
		var request = {},
			matches = [];

		request.scheme = request.scheme;
		request.version = (matches.length) ? [(matches[2]*1), (matches[3]*1)] : [0,0];
		request.method = req.method;
		request.scriptName = req.scriptName;
		request.pathInfo = req.pathInfo;
		request.queryString = req.queryString;
		request.host = req.host;
		request.port = req.port;
		request.env = Object.clone(Engine.Vars.Deck.env || {});
		request.headers = Object.clone(req.headers || {});
		request.input = {};
		request.post = {};
		request.get = {};
		request.cookie = {};
		request.files = {};
		request.original = req;
		return request;
	}

};

})();
