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

	$disPre: [],
	$disPost: [],

	addPreHandler: function(handler){
		this.$pre.unshift(handler);
		return this;
	},

	removePreHandler: function(handler, all){
		if (all){
			this.$pre = this.$pre.filter(function(item){
				return (item !== handler);
			});
		} else {
			var index = this.$pre.indexOf(handler);
			if (index !== -1) this.$pre.splice(index, 1);
		}
		return this;
	},

	disablePreHandler: function(handler, all){
		var self = this;
		if (all){
			this.$pre = this.$pre.filter(function(item, index){
				if (item === handler) {
					self.$disPre.push({fn: item, index: index});
					return false;
				}
				return true;
			});
		} else {
			var index = this.$pre.indexOf(handler);
			if (index !== -1) {
				this.$disPre.push({fn: this.$pre.splice(index, 1)[0], index: index});
			}
		}
		return this;
	},

	enablePreHandler: function(handler, all){
		var i, self = this;
		i = this.$disPre.length;
		while(i--){
			var item = this.$disPre[i];
			if (item.fn == handler){
				this.$pre.splice(item.index, 0, item.fn);
				this.$disPre.splice(i, 1);
				if (!all) break;
			}
		}
		return this;
	},

	addPostHandler: function(handler){
		this.$post.push(handler);
		return this;
	},

	removePostHandler: function(handler, all){
		if (all){
			this.$post = this.$post.filter(function(item){
				return (item !== handler);
			});
		} else {
			var index = this.$post.indexOf(handler);
			if (index !== -1) this.$post.splice(index, 1);
		}
		return this;
	},

	disablePostHandler: function(handler, all){
		var self = this;
		if (all){
			this.$post = this.$post.filter(function(item, index){
				if (item === handler) {
					self.$disPost.push({fn: item, index: index});
					return false;
				}
				return true;
			});
		} else {
			var index = this.$post.indexOf(handler);
			if (index !== -1) {
				this.$disPost.push({fn: this.$post.splice(index, 1)[0], index: index});
			}
		}
		return this;
	},

	enablePostHandler: function(handler, all){
		var i, self = this;
		i = this.$disPost.length;
		while(i--){
			var item = this.$disPost[i];
			if (item.fn == handler){
				this.$post.splice(item.index, 0, item.fn);
				this.$disPost.splice(i, 1);
				if (!all) break;
			}
		}
		return this;
	},

	addModule: function(module){
		if (typeOf(module) === 'object'){
			if (module.preHandler) this.addPreHandler(module.preHandler);
			if (module.postHandler) this.addPostHandler(module.postHandler);
		}
		return this;
	},

	removeModule: function(module){
		if (typeOf(module) === 'object'){
			if (module.preHandler) this.removePreHandler(module.preHandler);
			if (module.postHandler) this.removePostHandler(module.postHandler);
		}
		return this;
	},

	disableModule: function(module){
		if (typeOf(module) === 'object'){
			if (module.preHandler) this.disablePreHandler(module.preHandler);
			if (module.postHandler) this.disablePostHandler(module.postHandler);
		}
		return this;
	},

	enableModule: function(module){
		if (typeOf(module) === 'object'){
			if (module.preHandler) this.enablePreHandler(module.preHandler);
			if (module.postHandler) this.enablePostHandler(module.postHandler);
		}
		return this;
	},

	disableAllModules: function(){
		if (this.$mods) return;
		this.$mods = {
			pre: this.$pre,
			post: this.$post
		};
		this.$pre = this.$post = [];
		return this;
	},

	enableAllModules: function(){
		if (!this.$mods) return;
		this.$pre = this.$mods.pre;
		this.$post = this.$mods.post;
		delete this.$mods;
		return this;
	}

});

exports.Modules = Modules;

})();