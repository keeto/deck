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

var deck = {
	version: [0, 8, 3],
	versionText: '0.8.3'
};

exports.setup = function(global, engineName, options){
	options = options || {};
	var path = options.path || '.',
		loadModules = (options.loadModules != undefined) ? options.loadModules : true,
		modulePath = options.modulePath || path + '/modules/',
		enginePath = options.enginePath || path + '/engines/',
		vendorPath = options.vendorPath || path + '/thirdparty/';

	require(vendorPath + 'mootools').into(global);

	var Engine = require(enginePath + engineName).engine;
	Engine.Base.global = global;
	Engine.Vars.Deck = {path: path, env: {deck: deck}};
	global.Engine = Engine;

	var Deck = Object.append(require(path + '/lib/base').Base, {
		Info: deck,
		Modules: {}
	});

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
