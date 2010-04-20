// warnings: no
/*
---

script: deck.js

description: the main deck importer script.

license: MIT-style license

authors:
- Mark Obcena

provides: [setup]

...
*/

(function() {

var deck = 	{
	version: [0, 8, 2, 99],
	versionText: '0.8.2dev'
};

exports.setup = function(global, engineName, options){
	options = options || {};
	var path = options.path || '.',
		loadModules = (options.loadModules != undefined) ? options.loadModules : true,
		modulePath = options.modulePath || path + '/modules/',
		enginePath = options.enginePath || path + '/engines/',
		vendorPath = options.vendorPath || path + '/thirdparty/';

	require(vendorPath + 'mootools').into(global);

	var engine = global.Engine = require(enginePath + engineName).engine;
	engine.global = global;
	engine.deckPath = path;
	engine.requestEnv = {deck: deck};

	var Deck = require(path + '/lib/base').Base;
	Deck.Info = deck;
	Deck.Modules = {};

	if (loadModules){
		var module;
		Deck.Modules = require(modulePath + 'manifest').Modules;
		for (var name in Deck.Modules){
			if (name == 'Classes') continue;
			module = Array.from(Deck.Modules[name]);
			Deck.Modules[name] = require(modulePath + module[0])[module[1] || name];
		}
		for (var klass in Deck.Modules.Classes){
			module = Array.from(Deck.Modules.Classes[klass]);
			Deck.Modules[klass + 'Class'] = Deck.Modules.Classes[klass] = require(modulePath + module[0])[module[1] || klass];
		}
	}

	return Deck;
};

})();