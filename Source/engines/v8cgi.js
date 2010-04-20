/*
---

script: engines/v8cgi.js

description: v8cgi engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

var Engine = {

	name: 'v8cgi',
	global: {},
	system: system,
	args: system.args,
	deckPath: null,
	cwd: '',

	setTimeout: null,

	writeOut: function(str){
		return system.stdout(str + '\n');
	},

	writeError: function(str){
		return system.stderr(str);
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
		var sysenv = system.env,
			request = {},
			matches = sysenv.SERVER_PROTOCOL.match(/([\D]*)\/(\d).(\d)/) || [];

		request.scheme = matches[1];
		request.version = (matches.length) ? [(matches[2]*1), (matches[3]*1)] : [0,0];

		request.method = sysenv.REQUEST_METHOD;
		request.scriptName = sysenv.SCRIPT_NAME;
		request.pathInfo = sysenv.REQUEST_URI;
		request.queryString = req.QUERY_STRING;
		request.host = sysenv.HTTP_HOST;
		request.port = sysenv.SERVER_PORT;
		request.env = Object.clone(this.requestEnv || {});

		request.headers = {};
		for (var i in req._headers) {
			request.headers[i.replace(/_/g, '-').toLowerCase()] = req._headers[i];
		}

		request.input = null;
		request.post = req.post;
		request.get = req.get;
		request.cookie = req.cookie;
		request.files = req.files;
		request.original = req;
		return request;
	}

};

Engine.__defineGetter__('cwd', function(){
	return system.getcwd();
});

exports.engine = Engine;

})();