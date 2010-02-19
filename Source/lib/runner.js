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

	autoFinish: false,

	run: function(env, resp){
		var parsedEnv 	= Engine.parseRequest(env),
			request 	= new Request(parsedEnv),
			response 	= new Response(resp);
		this.iterate(request, response);
		return response.clean();
	},

	iterate: function(request, response){
		var modules = [].concat(this.$pre, [this.$app], this.$post),
			i = modules.reverse().length;
		request.next = function(){};
		while (i--){
			modules[i](request, response);
			if (request.stopped || response.finished) break;
		}
		if (self.autoFinish && !response.finished) response.finish();
	}

});

exports.Runner = Runner;

})();