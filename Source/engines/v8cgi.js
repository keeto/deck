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
	Info: {},
	Base: {},
	StdWrite: {},
	Request: {},
	Response: {},
	Vars: {}
};

exports.engine = Engine;

Engine.Info = {
	name: 'v8cgi',
	adapter: '0.8.2'
};

Engine.Base = {
	global: {},
	system: system,
	args: system.args,
	env: system.env,
	cwd: '',
	setTimeout: null
};

Engine.Base.__defineGetter__('cwd', function(){
	return system.getcwd();
});

Engine.StdWrite = {

	out: function(str){
		return system.stdout(str + '\n');
	},

	error: function(str){
		return system.stderr(str);
	}

};


Engine.Request = {

	parse: function(req){
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
		request.env = Object.clone(Engine.Vars.Deck.env || {});

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

})();
