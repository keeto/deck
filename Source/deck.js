exports.setup = function(global, engineName, options){
	var Deck, path, loadModules, engine, 
		name, klass, module, manifest;

	options = options || {};
	path = options.path || '.';
	loadModules = (options.loadModules != undefined) ? options.loadModules : true;
	modulePath = options.modulePath || path + '/modules/';
	enginePath = options.enginePath || path + '/engines/';
	vendorPath = options.vendorPath || path + '/thirdparty/';

	require(vendorPath + 'mootools').into(global);

	if ((typeof engineName) === 'object') engine = global.Engine = engineName;
	else engine = global.Engine = require(enginePath + engineName).engine;
	engine.deckPath = path;
	engine.global = global;

	Deck = require(path + '/lib/base').Base;

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