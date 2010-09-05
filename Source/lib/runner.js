/*
Script: lib/runner.js
	Loop-based deque dispatcher

Provides:
	- Runner : {}

Authors:
	- Mark Obcena

License:
	MIT-Style License

*/

(function(){

var	Request 	= require('./request').Request,
	Response 	= require('./response').Response,
	Runner;

Runner = new Class({

	autoFinish: true,

	run: function(env, resp){
		var parsedEnv 	= Engine.Request.parse(env),
			request 	= new Request(parsedEnv),
			response 	= new Response(resp);
		request.env.deck.method = 'run';
		this.iterate(request, response);
		return response.clean();
	},

	iterate: function(request, response){
		var modules = this.buildStack(request),
			i = modules.reverse().length;
		Object.append(request, this.env);
		request.next = function(){};
		while (i--){
			modules[i](request, response);
			if (request.stopped || response.finished) break;
		}
		if (this.autoFinish && !response.finished) response.finish();
	},

	'protected buildStack': function(){
		return [];
	}

});

exports.Runner = Runner;

})();
