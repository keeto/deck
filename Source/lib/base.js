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
		Runner,
		Dispatcher,
		Events
	],

	$app: null,

	initialize: function(options){
		options = options || {};
		if (options.app) this.setApp(options.app);
		if (options.modules) this.setModules(options.modules);
		this.autoFinish = options.autoFinish;
	},
	
	setApp: function(app, bind){
		if (app.dispatch instanceof Function) this.$app = app.dispatch.bind(bind || app);
		else if (app.run instanceof Function) this.$app = app.run.bind(bind || app);
		else if (app instanceof Function) this.$app = app.bind(bind || this);
		return this;
	},

	'protected setModules': function(modules){
		modules = Array.from(modules);
		var i = modules.reverse().length;
		while (i--) this.addModule(modules[i]);
	}

});

exports.Base = Base;

})();