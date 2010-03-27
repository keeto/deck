/*
---

script: base.js

description: Unifying class for Deck.

license: MIT-style license

authors:
- Mark Obcena

requires:
- /Runner
- /Dispatcher
- /Utils

provides: [Base]

...
*/

(function(){

var	Modules		= require('./modules').Modules,
	Router		= require('./router').Router,
	Runner		= require('./runner').Runner,
	Dispatcher	= require('./dispatcher').Dispatcher,
	Request 	= require('./request').Request,
	Response 	= require('./response').Response,
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
		Events
	],

	initialize: function(options){
		options = options || {};
		if (options.routes && typeOf(options.routes) == 'array') this.addRoutes(options.routes);
		else if (options.app) this.setApp(options.app);
		if (options.modules) this.setModules(options.modules);
		if (options.unrouted) this.setUnrouted(options.unrouted);

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