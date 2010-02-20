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

	name: 'node',
	global: {},
	system: system,
	args: process.ARGV,
	deckPath: null,
	cwd: '',

	setTimeout: setTimeout,

	writeOut: function(str){
		return process.stdio.write(str + '\n');
	},

	writeErr: function(str){
		return process.stdio.writeError(str + '\n');
	},

	loadConfig: function(name, absolute){
		var local, deck;
		if (absolute) return require(name).config;
		local = this.cwd + '/config/' + name;
		deck = normalize(this.deckPath + './config/' + name);
		return Function.stab(function(){
			return require(local).config;
		}, function(){
			return require(deck).config;
		}) || {};
	},

	parseRequest: function(req){
		var sysenv = system.env,
			request = {},
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
		request.env = this.requestEnv || {};

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

Engine.__defineGetter__('cwd', function(){
	return process.cwd();
});

exports.engine = Engine;

})();