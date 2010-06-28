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

	name: 'helma',
	global: global,
	system: system,
	args: system.args,
	deckPath: null,
	cwd: '',

	writeOut: function(str){
		return system.stdout.write(str + '\n');
	},

	writeError: function(str){
		return system.stderr.write(str + '\n');
	},

	loadConfig: function(name, absolute){
		var local, deck;
		if (absolute) return require(name).config;
		local = this.cwd + '/config/' + name;
		deck = this.deckPath + '/config/' + name;
		return Function.stab(function(){
			return require(local).config;
		}, function(){
			return require(deck).config;
		}) || {};
	},

	parseRequest: function(req){
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
		request.env = Object.clone(this.requestEnv || {});
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

Engine.__defineGetter__('cwd', function(){
	return file.cwd();
});

exports.engine = Engine;

})();
