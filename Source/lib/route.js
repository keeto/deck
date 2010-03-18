/*
---

script: route.js

description: A single route object.

license: MIT-style license

authors:
- Mark Obcena

provides: [Router]

...
*/

(function(){

var Route = new Class({

	initialize: function(matcher, action, conditions){
		this.matcher = matcher;
		this.action = action;
		this.named = [];
		this.type = typeOf(this.matcher);
		this.conditions = conditions || {};
		this.prepare();
	},

	'protected prepare': function(){
		if (this.type !== 'string') return;
		var params = this.matcher.match(/:([A-Za-z_][A-Za-z0-9_$]+)|\*/g), named = [];
		if (params){
			var i = params.length;
			while (i--){
				named.unshift(params[i] == '*' ? 'splat' : params[i].substring(1));
				named = named.filter(function(i){ return i.length; });
			}
			this.matcher = this.matcher.multiReplace(
				[(/:([A-Za-z_][A-Za-z0-9_$]+)|\*/g), '([^\\\/]+)'],
				[(/\{/g), '(?:'],
				[(/\}/g), ')?']
			);
		}
		this.matcher = new RegExp('^' + this.matcher + '$');
		this.named = named;
		return this;
	},

	matches: function(path){
		var check = path.test(this.matcher);
		return (check) ? this.action : null;
	},

	getCaptures: function(path){
		var result = {captures: [], params: {}, splat: []};
		var matches = path.match(this.matcher);
		if (matches){
			matches.shift();
			if (this.type == 'regexp'){
				result.captures = matches;
			} else {
				var i = this.named.length;
				while (i--){
					if (this.named[i] == 'splat') result.splat.push(matches[i]);
					else result.params[this.named[i]] = matches[i];
				}
			}
		}
		return result;
	},

	conforms: function(params){
		var conditions = this.conditions;
		for (var key in conditions){
			var type = typeOf(conditions[key]);
			if (type == 'string' && (!params[key] || conditions[key] !== params[key])) return false;
			if (type == 'regexp' && (!params[key] || !params[key].test(conditions[key]))) return false;
			if (type == 'function' && !Function.stab(function(){
					return conditions[key](params[key] || null, params);
				})) return false;
		}
		return true;
	}

});

exports.Route = Route;

})();