/*
---

script: dispatcher.js

description: The chaining module dispatcher.

license: MIT-style license

authors:
- Mark Obcena

requires:
- /Request
- /Response

provides: [Dispatcher]

...
*/

(function(){

var	Request 	= require('./request').Request,
	Response 	= require('./response').Response,
	Dispatcher;

Dispatcher = new Class({

	dispatch: function(env, resp){
		var parsedEnv 	= Engine.parseRequest(env),
			request 	= new Request(parsedEnv),
			response 	= new Response(resp);
		this.start(request, response);
		return response.clean();
	},

	start: function(request, response){
		var next, modules = [].concat(this.$pre, [this.App], this.$post);
		if (modules.length == 0) return;
		request.next = function(){
			if (request.stopped || response.finished) return;
			var deferred = function(){
				var current = modules.shift();
				if (current) current(request, response);
			};
			if (Engine.setTimeout instanceof Function) setTimeout(deferred, 0);
			else deferred();
		};
		request.next();
	}

});

exports.Dispatcher = Dispatcher;

})();