// warnings: no
/*
Script: deck.js
	The main deck importer script.

Provides:
	- setup : fn(global, engine)

Authors:
	- Mark Obcena

License:
	MIT-Style License

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

exports.setup = function(global, engine){

	if (global == null || engine == null){
		throw new TypeError('Deck.setup requires 2 arguments, `global` and `engine`.');
	}

	require('./thirdparty/mootools').into(global);

	var Engine = (typeof engine === 'string') ? engineer(engine) : engine;
	if (!Engine) throw new TypeError('Deck.setup can\'t import engine adapter "' + engine + '". Check if you\'re importing the correct adapter.');
	Engine.Base.global = global;
	Engine.Vars.Deck = {env: {deck: deck}};
	global.Engine = Engine;

	var Deck = Object.append(require('./lib/base').Base, {Info: deck});

	Deck.__defineGetter__('Modules', function Modules(){
		if (!Modules.cached){
			var cached, module;
			cached = require('./modules/manifest').Modules;
			for (var name in cached){
				if (name == 'Classes') continue;
				module = Array.from(cached[name]);
				cached[name] = require('./modules/' + module[0])[module[1] || name];
			}
			for (var klass in cached.Classes){
				module = Array.from(cached.Classes[klass]);
				cached[klass + 'Class'] = cached.Classes[klass] = require('./modules' + module[0])[module[1] || klass];
			}
			Modules.cached = cached;
		}
		return Modules.cached;
	});

	return Deck;
};

})();
