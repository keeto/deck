/*
---

script: modules.js

description: Module controller.

license: MIT-style license

authors:
- Mark Obcena

provides: [Modules]

...
*/

(function(){

var Modules = new Class({

	$pre: [],
	$post: [],

	getPreHandlers: function(){
		return [].concat(this.$pre);
	},

	getPostHandlers: function(){
		return [].concat(this.$post);
	},

	addPreHandler: function(handler){
		if (!(handler instanceof Function))
			throw new Error('Module.addPreHandler requires a function as an argument');
		this.$pre.unshift(handler);
		return this;
	},

	removePreHandler: function(handler, all){
		var result = [], found = false,
			len = this.$pre.reverse().length;
		while (len--){
			var item = this.$pre[len];
			if (item !== handler || (!all && found == true)) result.push(item);
			else found = true;
		}
		this.$pre = result;
		return this;
	},

	addPostHandler: function(handler){
		if (!(handler instanceof Function))
			throw new Error('Module.addPostHandler requires a function as an argument');
		this.$post.push(handler);
		return this;
	},

	removePostHandler: function(handler, all){
		var result = [], found = false,
			len = this.$post.length;
		while (len--){
			var item = this.$post[len];
			if (item !== handler || (!all && found == true)) result.unshift(item);
			else found = true;
		}
		this.$post = result;
		return this;
	},

	addModule: function(module){
		if (typeOf(module) === 'object'){
			if (module.preHandler){
				if (!(module.preHandler instanceof Function))
					throw new Error('Module.addModule: module.preHandler should be a function.');
				this.addPreHandler(module.preHandler);
			}
			if (module.postHandler){
				if (!(module.postHandler instanceof Function))
					throw new Error('Module.addModule: module.postHandler should be a function.');
				this.addPostHandler(module.postHandler);
			}
		}
		return this;
	},

	removeModule: function(module){
		if (typeOf(module) === 'object'){
			if (module.preHandler){
				if (!(module.preHandler instanceof Function))
					throw new Error('Module.removeModule: module.preHandler should be a function.');
				this.removePreHandler(module.preHandler);
			}
			if (module.postHandler){
				if (!(module.postHandler instanceof Function))
					throw new Error('Module.removeModule: module.postHandler should be a function.');
				this.removePostHandler(module.postHandler);
			}
		}
		return this;
	}

});

exports.Modules = Modules;

})();