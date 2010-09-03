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

var engineer = function(eng){
	var parts = eng.split('#'),
		name = parts[0],
		version = parts[1],
		result;

	try {
		result = require(['./engines/', name, '/engine'].join('')).engine(version);
	} catch(e) {}

	return result;

};

exports.setup = function(global, engine, options){

	if (global == null || engine == null){
		throw new TypeError('Deck.setup requires 2 arguments, `global` and `engine`.');
	}

	options = options || {};
	var path = options.path || '.',
		loadModules = (options.loadModules != undefined) ? options.loadModules : true,
		modulePath = options.modulePath || path + '/modules/',
		enginePath = options.enginePath || path + '/engines/',
		vendorPath = options.vendorPath || path + '/thirdparty/';

	require(vendorPath + 'mootools').into(global);

	var Engine = (typeof engine === 'string') ? engineer(engine) : engine;
	if (!Engine) throw new TypeError('Deck.setup can\'t import engine adapter "' + engine + '". Check if you\'re importing the correct adapter.');
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
