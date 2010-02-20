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

Class.defineMutator('Static', function(items){
	this.extend(items);
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