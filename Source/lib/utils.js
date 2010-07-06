/*
---

script: utils.js

description: Utility functions and extensions for MooTools.

license: MIT-style license

authors:
- Mark Obcena

provides: [Engine]

...
*/

(function(){

Class.defineMutator('Static', function(items){
	this.extend(items);
});

Options.extend({

	pick: function(){
		for (var i = 0, l = arguments.length; i < l; i++){
			if (arguments[i] != undefined) return arguments[i];
		}
		return null;
	},

	defaults: function(options, defaults){
		if (!options) return defaults;
		var keys = Object.keys(options),
			len = keys.length;
		while (len--) (function(key){
			if (options[key] !== undefined) defaults[key] == options[key];
		})(keys[len]);
		return defaults;
	}

});

String.implement({

	multiReplace: function(){
		var rules = Array.from(arguments),
			len = rules.reverse().length,
			result = this.toString();
		while (len--) result = result.replace.apply(result, rules[len]);
		return result;
	}

});

})();
