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

	App: null,

	initialize: function(options){
		options = options || {};
		if (options.app instanceof Function) this.App = options.app;
		if (options.modules) this.setModules(options.modules);
	},

	'protected setModules': function(modules){
		modules = Array.from(modules);
		var i = modules.reverse().length;
		while (i--) this.addModule(modules[i]);
	}

});

exports.Base = Base;

})();