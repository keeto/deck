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

	autoFinish: false,

	dispatch: function(env, resp){
		var parsedEnv 	= Engine.parseRequest(env),
			request 	= new Request(parsedEnv),
			response 	= new Response(resp);
		this.start(request, response);
		return response.clean();
	},

	start: function(request, response){
		var self = this, next, modules = [].concat(this.$pre, [this.$app], this.$post);
		if (modules.length == 0) return;
		request.next = function(){
			if (request.stopped || response.finished) return;
			var deferred = function(){
				var current = modules.shift();
				if (current) current(request, response);
				else if (self.autoFinish && !response.finished) response.finish();
			};
			if (Engine.setTimeout instanceof Function) setTimeout(deferred, 0);
			else deferred();
		};
		request.next();
	}

});

exports.Dispatcher = Dispatcher;

})();