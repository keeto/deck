/*
---

script: engines/helma.js

description: helma engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

var Engine = {

	name: 'helma',
	global: global,
	system: null,
	args: null,
	deckPath: null,
	cwd: '',

	isFile: function(name){},

	writeOut: function(str){},

	writeErr: function(str){},

	loadConfig: function(name, absolute){
		var local, deck;
		if (absolute) return require(name).config;
		local = this.cwd + '/config/' + name;
		deck = this.deckPath + '/config/' + name;
		return Function.stab(function(){
			return require(local).config;
		}, function(){
			return require(deck).config;
		}) || {};
	},

	parseRequest: function(req){
	}

};

Engine.__defineGetter__('cwd', function(){});

exports.engine = Engine;

})();