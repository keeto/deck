/*
---

script: engines/narwhal.js

description: narwhal engine adapter.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

var Engine = {

	name: 'narwhal',
	global: global,
	system: null,
	args: null,
	deckPath: null,
	cwd: '',

	writeOut: function(str){},

	writeError: function(str){},

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
