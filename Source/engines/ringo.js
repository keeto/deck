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
include('file');
include('io');
include("binary");

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

	writeErr: function(str){
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
			matches = req.HTTP_VERSION.match(/([\D]*)\/(\d).(\d)/) || [],
			jsgireq = req['jsgi.servlet_request'];

		request.scheme = req['jsgi.url_scheme'];
		request.version = (matches.length) ? [(matches[2]*1), (matches[3]*1)] : [0,0];

		request.method = req.REQUEST_METHOD;
		request.scriptName = req.SCRIPT_NAME;
		request.pathInfo = req.PATH_INFO;
		request.queryString = req.QUERY_STRING;
		request.host = req.REMOTE_HOST;
		request.port = req.SERVER_PORT;
		request.env = this.requestEnv || {};

		var headers = jsgireq.getHeaderNames();
		request.headers = {};
		while (headers.hasMoreElements()){
			var header = headers.nextElement();
			request.headers[header.replace(/_/g, '-').toLowerCase()] = jsgireq.getHeader(header);
		}

		request.input = req['jsgi.input'] || new Stream(jsgireq.getInputStream());
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