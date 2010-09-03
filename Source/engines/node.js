/*
---

script: engines/node.js

description: nodejs engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

var system = require('sys'),
	normalize = require('path').normalize,
	url = require('url');

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

	name: 'node',
	adapter: '0.2.0'
};

Engine.Base = {
	global: {},
	system: system,
	args: process.ARGV,
	env: process.env,
	cwd: '',
	setTimeout: setTimeout
};

Engine.__defineGetter__('cwd', function(){
	return process.cwd();
});


Engine.StdWrite = {

	out: function(str){
		return process.stdio.write(str + '\n');
	},

	err: function(str){
		return process.stdio.writeError(str + '\n');
	}

};

Engine.Request = {

	parse: function(req){
		var request = {},
			uri = url.parse(req.url),
			host_port = req.headers.host.split(':');

		request.scheme = 'http';
		request.version = [req.httpVersionMajor, req.httpVersionMinor];

		request.method = req.method;
		request.scriptName = process.ARGV[1];
		request.pathInfo = uri.pathname;
		request.queryString = uri.query;
		request.host = host_port[0];
		request.port = host_port[1];
		request.env = Object.clone(Engine.Vars.Deck.env || {});

		request.headers = {};
		for (var i in req.headers) {
			request.headers[i.replace(/_/g, '-').toLowerCase()] = req.headers[i];
		}

		request.input = null;
		request.post = {};
		request.get = {};
		request.cookie = {};
		request.files = {};
		request.original = req;
		return request;
	}

};

})();
