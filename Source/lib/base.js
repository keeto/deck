/*
Script: lib/base.js
	Deck's main unifying-class.

Provides:
	- Base : {}

Authors:
	- Mark Obcena

License:
	MIT-Style License

*/

(function(){

var	Modules		= require('./modules').Modules,
	Router		= require('./router').Router,
	Runner		= require('./runner').Runner,
	Dispatcher	= require('./dispatcher').Dispatcher,
	Request 	= require('./request').Request,
	Response 	= require('./response').Response,
	Env			= require('./env').Env,
	Utils		= require('./utils'),
	Base;

Base = new Class({

	Static: {
		Request: Request,
		Response: Response,
		Utils: Utils
	},

	Implements: [
		Modules,
		Router,
		Runner,
		Dispatcher,
		Events,
		Env
	],

	initialize: function(options){
		options = options || {};
		if (options.routes && typeOf(options.routes) == 'array') this.addRoutes(options.routes);
		else if (options.app) this.setApp(options.app);
		if (options.modules) this.setModules(options.modules);
		if (options.unrouted) this.setUnrouted(options.unrouted);
		if (options.env) Object.append(this.env, options.env);

		this.cacheRequest = Options.pick(options.cacheRequest, true);
		this.autoFinish = Options.pick(options.autoFinish, true);
		this.dispatchAsync = Options.pick(options.dispatchAsync, true);
		this.dispatchWait = !isNaN(options.dispatchWait * 1) ? options.dispatchWait : 10;
	},

	setApp: function(app){
		this.matchRoute = function(){ return app; };
		return this;
	},

	'protected buildStack': function(request){
		return [].concat(this.getPreHandlers(), [this.matchRoute(request)], this.getPostHandlers());
	},

	'protected setModules': function(modules){
		modules = Array.from(modules);
		var i = modules.reverse().length;
		while (i--) this.addModule(modules[i]);
	}

});

exports.Base = Base;

})();
