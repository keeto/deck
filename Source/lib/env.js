/*
---

script: env.js

description: Env mixin

license: MIT-style license

authors:
- Mark Obcena

provides: [Env]

...
*/

(function(){

var Env = new Class({

	env: {},

	setEnv: function(key, value){
		this.env[key] = value;
		return this;
	},

	setEnvs: function(envs){
		for (var i in envs) this.setEnv(i, envs[i]);
		return this;
	},

	getEnv: function(key, def){
		var env = this.env[key];
		return env !== 'undefined' ? env : def;
	},

	removeEnv: function(key){
		delete this.env[key];
		return this;
	}

});

exports.Env = Env;

})();
