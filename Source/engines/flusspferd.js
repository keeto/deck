/*
---

script: engines/flusspferd.js

description: flusspferd engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

var system = require('system'),
	fsbase = require('fs-base');

var Engine = {

	name: 'node',
	global: {},
	system: system,
	args: system.args,
	deckPath: null,
	cwd: '',

	isFile: function(name){
		return fsbase.isFile(name);
	},

	writeOut: function(str){
		system.stdout.write(str + '\n');
		return system.stdout.flush();
	},

	writeErr: function(str){
		system.stderr.write(str + '\n');
		return system.stderr.flush();
	},

	loadConfig: function(name, absolute){
		var local, deck;
		if (absolute) return require(name).config;
		local = this.cwd + '/config/' + name;
		deck = normalize(this.deckPath + './config/' + name);
		return Function.stab(function(){
			return require(local).config;
		}, function(){
			return require(deck).config;
		}) || {};
	},

	parseRequest: function(req){
		/* TODO: Zest Parser */
	}

};

Engine.__defineGetter__('cwd', function(){
	return fsbase.workingDirectory;
});

exports.engine = Engine;

})();