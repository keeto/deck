/*
Script: lib/dispatcher.js
	Chaining deque dispatcher.

Provides:
	- Dispatcher : {}

Authors:
	- Mark Obcena

License:
	MIT-Style License

*/

(function(){

var	Request 	= require('./request').Request,
	Response 	= require('./response').Response,
	Dispatcher;

Dispatcher = new Class({

	autoFinish: true,
	dispatchAsync: true,
	dispatchWait: 10,

	dispatch: function(env, resp){
		var parsedEnv 	= Engine.Request.parse(env),
			request 	= new Request(parsedEnv),
			response 	= new Response(resp);
		request.env.deck.method = 'dispatch';
		this.start(request, response);
		return response.clean();
	},

	start: function(request, response){
		var self = this, next, modules = this.buildStack(request);
		Object.append(request, this.env);
		if (modules.length == 0) return;
		request.next = function(){
			if (request.stopped || response.finished) return;
			var deferred = function(){
				var current = modules.shift();
				if (current) current(request, response);
				else if (self.autoFinish && !response.finished) response.finish();
			};
			if (self.dispatchAsync && Engine.Base.setTimeout instanceof Function){
				Engine.Base.setTimeout(deferred, self.dispatchWait || 0);
			}
			else deferred();
		};
		request.next();
	},

	'protected buildStack': function(){
		return [];
	}

});

exports.Dispatcher = Dispatcher;

})();
