/*
---
script: case.js
description: test-case class
license: MIT-style license
authors:
- Mark Obcena
provides: [Case]
...
*/

(function(){

var checkArg = require('./utils').checkArg,
	Expectation = require('./expectation').Expectation;

var countExpect = function(fn){
	var str = fn.toString(),
		matches = str.match(/expect\(|expect.apply\(|expect.call\(/g);
	return (!matches) ? 0 : matches.length;
};

var Case = function(desc, test, context, callback){
	if (!checkArg('expect', test))
		throw new Error('Case function does not explicitly define an `expect` argument.');

	this.desc = desc;
	this.$test = test;
	this.$context = context || {};

	callback = callback || {};
	this.$callbacks = {
		before: callback.before,
		after: callback.after
	};

	this.$testCount = countExpect(test);
	this.$doneCount = 0;

	this.$passes = 0;
	this.$failures = 0;
	this.$results = [];
};

Case.prototype.count = function(){
	return this.$testCount;
};

Case.prototype.setCallback = function(type, fn){
	this.$callbacks[type] = fn;
	return this;
};

Case.prototype.done = function(){
	return (!(this.$testCount - this.$doneCount) || this.$finished);
};

Case.prototype.results = function(){
	if (!this.done()) return {};
	return {
		description: this.desc,
		allPassed: (this.$failures === 0),
		tests: {
			passes: this.$passes,
			failures: this.$failures,
			total: this.$testCount
		},
		results: this.$results
	};
};

var addResult = function(results, success, done){
	this.$results.push(results);
	this.$doneCount++;
	this[success ? '$passes' : '$failures']++;
	if (this.done() && this.$callbacks.after instanceof Function){
		this.$callbacks.after.call(this, this.results(), (this.$failures === 0));
	}
};

var expectCallback = function(){
	var self = this;
	return function(result, received, expected, matcher){
		addResult.call(self, {
			passed: result,
			received: received,
			expected: expected,
			matcher: matcher
		}, result);
	};
};

Case.prototype.$expect = function(received){
	var self = this;
	return new Expectation(received, expectCallback.call(this));
};

Case.prototype.run = function(){
	var self = this, error;
	if (this.$callbacks.before instanceof Function)
		this.$callbacks.before.call(self, this.desc, this.$testCount);
	try {
		this.$test.call(this.$context, function(){
			return self.$expect.apply(self, Array.prototype.slice.call(arguments));
		});
	} catch(e){
		error = e;
	} finally {
		this.$finished = true;
		if (error) addResult.call(this, {
			passed: false,
			received: null,
			expected: null,
			matcher: null,
			error: error
		}, false);
	}
};

exports.Case = Case;

})();