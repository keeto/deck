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
	version: [0, 5, 0]
};

exports.setup = function(global, engineName, options){
	var Deck, path, loadModules, engine, 
		name, klass, module, manifest;

	// Default configurations
	options = options || {};
	path = options.path || '.';
	loadModules = (options.loadModules != undefined) ? options.loadModules : true;
	modulePath = options.modulePath || path + '/modules/';
	enginePath = options.enginePath || path + '/engines/';
	vendorPath = options.vendorPath || path + '/thirdparty/';

	// Hail MooTools!
	require(vendorPath + 'mootools').into(global);

	// The Engine Global
	if ((typeof engineName) === 'object'){
		engine = global.Engine = engineName;
	} else {
		engine = global.Engine = require(enginePath + engineName).engine;
	}

	engine.global = global;
	engine.deckPath = path;
	engine.requestEnv = {deck: deck};

	// Here comes Deck!
	Deck = require(path + '/lib/base').Base;
	Deck.Info = deck;

	manifest = (loadModules) ? require(modulePath + 'manifest').Modules : {};
	for (name in manifest){
		if (name == 'Classes') continue;
		module = Array.from(manifest[name]);
		manifest[name] = require(modulePath + module[0])[module[1] || name];
	}
	for (klass in manifest.Classes){
		module = Array.from(manifest.Classes[klass]);
		manifest[klass + 'Class'] = manifest.Classes[klass] = require(modulePath + module[0])[module[1] || klass];
	}
	Deck.Modules = manifest;

	return Deck;
};

})();