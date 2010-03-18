/*
---
script: suite.js
description: test-suite class
license: MIT-style license
authors:
- Mark Obcena
provides: [Suite]
...
*/

(function(){

var checkArg = require('./utils').checkArg,
	Case = require('./case').Case;

var Suite = function(name, body, callbacks){
	if (!checkArg('it', body))
		throw new Error('Suite function does not explicitly define an `it` argument.');

	this.name = name;
	this.$body = body;
	this.$tests = [];
	this.$results = [];
	this.$context = {x: 1};

	callbacks = callbacks || {};
	this.$callbacks = {
		before: callbacks.before,
		beforeEach: callbacks.beforeEach,
		after: callbacks.after,
		afterEach: callbacks.afterEach
	};

	this.$testCount = 0;
	this.$doneCount = 0;
	this.$passes = 0;
	this.$failures = 0;

	this.$before = function(){};
	this.$beforeEach = function(){};
	this.$after = function(){};
	this.$afterEach = function(){};
};

Suite.prototype.done = function(){
	return !(this.$testCount - this.$doneCount);
};

Suite.prototype.results = function(){
	if (!this.done()) return {};
	return {
		suite: this.name,
		allPassed: (this.$failures === 0),
		tests: {
			passes: this.$passes,
			failures: this.$failures,
			total: this.$testCount
		},
		results: this.$results
	};
};

var callNext = function(){
	var current = this.$tests.shift();
	if (current){
		this.$beforeEach.call(this.$context);
		current.run();
	} else {
		this.$after.call(this.$context);
		if (this.$callbacks.after instanceof Function)
			this.$callbacks.after.call(null, this.name, (this.$failures === 0), this.results());
	}
};

var itCallback = function(){
	var self = this;
	return function(results, success){
		self.$doneCount++;
		self.$results.push(results);
		self[success ? '$passes' : '$failures']++;
		self.$afterEach.call(self.$context);
		if (self.$callbacks.afterEach instanceof Function){
			self.$callbacks.afterEach.call(null, self.name, results.description, results);
		}
		callNext.call(self);
	};
};

Suite.prototype.$it = function(desc, fn){
	var self = this;
	this.$testCount++;
	var test = new Case(desc, fn, this.$context, {
		before: function(desc, count){
			if (self.$callbacks.beforeEach instanceof Function)
				self.$callbacks.beforeEach.call(null, self.name, desc, count);
		},
		after: itCallback.call(this)
	});
	this.$tests.push(test);
};

Suite.prototype.$setup = function(type, fn){
	if (fn instanceof Function) this['$' + type] = fn;
	return this;
};

Suite.prototype.prepare = function(){
	var self = this;
	this.$body.call(null, function(){
		return self.$it.apply(self, Array.prototype.slice.call(arguments));
	}, function(){
		return self.$setup.apply(self, Array.prototype.slice.call(arguments));
	});
	this.$prepared = true;
	if (this.$callbacks.before instanceof Function)
		this.$callbacks.before.call(null, this.name, this.$testCount);
	return this;
};

Suite.prototype.run = function(){
	if (!this.$prepared) this.prepare();
	this.$before.call(this.$context);
	callNext.call(this);
	return this;
};

exports.Suite = Suite;

})();