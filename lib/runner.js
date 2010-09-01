/*
---

script: runner.js

description: The looping module runner.

license: MIT-style license

authors:
- Mark Obcena

requires:
- /Request
- /Response

provides: [Runner]

...
*/

(function(){

var	Request 	= require('./request').Request,
	Response 	= require('./response').Response,
	Runner;

Runner = new Class({

	autoFinish: true,

	run: function(env, resp){
		var parsedEnv 	= Engine.parseRequest(env),
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
