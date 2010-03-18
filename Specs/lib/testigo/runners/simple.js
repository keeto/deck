/*
---
script: simple.js
description: a simple runner
license: MIT-style license
authors:
- Mark Obcena
provides: [SimpleRunner]
...
*/

(function(){

var sys, printer = function(type){
	switch(type){
		case 'node': return require('sys').print;
		case 'flusspferd':
			sys = require('system');
			return function(str){
				sys.stdout.write(str);
				sys.stdout.flush();
			};
		case 'v8cgi': return system.stdout;
	}
	return function(){};
};

var SimpleRunner = function(type, testigo, colors, stack){
	this.$testigo = testigo;
	this.$print = printer(type);
	this.$colors = (colors !== undefined) ? colors : true;
	this.$stack = (stack !== undefined) ? stack : true;
	this.addCallbacks();
};

var callbacks = {

	before: function(){
		this.$print('Starting Tests..\n');
	},

	after: function(success, results){
		this.$print('\nTests Finished: ');
		if (success){
			this.$setColor('green');
			this.$print('Passed');
		} else {
			this.$setColor('red');
			this.$print('Failed');
		}
		this.$setColor();
		this.$print([
			' (Passed: ', results.tests.passes, ', Failed: ', results.tests.failures, ')\n'
		].join(''));
	},

	beforeSuite: function(suite, count){
		this.$setColor('yellow');
		this.$print('\n' + suite);
		this.$setColor();
		this.$print([' (', count, ' Tests):', '\n'].join(''));
	},

	afterSuite: function(suite, success, results){
		this.$print(['End ', suite, ': '].join(''));
		if (success){
			this.$setColor('green');
			this.$print('Passed');
		} else {
			this.$setColor('red');
			this.$print('Failed');
		}
		this.$setColor();
		this.$print([' (Passes: ', results.tests.passes, ', Failures: ', results.tests.failures,').\n'].join(''));
	},

	beforeTest: function(suite, test, count){
		this.$print(' - ');
		this.$setColor('yellow');
		this.$print(test);
		this.$setColor();
		this.$print('... ');
	},

	afterTest: function(suite, test, results){
		if (results.allPassed) {
			this.$setColor('green');
			this.$print('Passed');
		} else {
			this.$setColor('red');
			this.$print('Failed');
		}
		this.$setColor();
		this.$print([' (', results.tests.passes, '/', results.tests.total, ').\n'].join(''));

		for (var i = 0, y = results.results.length; i < y; i++){
			var result = results.results[i];
			if (result.passed) continue;
			this.$setColor('red');
			this.$print(['     ', i + 1, ': '].join(''));
			this.$setColor();
			if (result.error){
				this.$print([
					'Error thrown: "', result.error,'"\n'
				].join(''));
				if (this.$stack) {
					this.$print('       --- Error Details ---\n');
					this.$print('         Name: ' + result.error.name + '\n');
					this.$print('         Stack --- \n');
					this.$print('         ' + result.error.stack.split('\n').join('\n         ') + '\n');
					this.$print('         --------- \n');
					this.$print('       ---------------------\n');
				}
			} else {
				this.$print([
					'Expected ', result.matcher, ' ', (result.expected) ? result.expected : '',
					', got ', result.received, '\n'
				].join(''));
			}
		}
	}
};

SimpleRunner.prototype.addCallbacks = function(){
	var self = this;
	for (var key in callbacks) (function(type, fn){
		self.$testigo.setCallback(type, function(){
			return fn.apply(self, Array.prototype.slice.call(arguments));
		});
	})(key, callbacks[key]);
};

SimpleRunner.prototype.$setColor = function(color){
	if (!this.$colors) return this;
	var colors = {green: "32", red: "31", yellow: "33"};
	if(color) this.$print("\u001B[" + colors[color] + "m");
	else this.$print("\u001B[0m");
	return this;
};

SimpleRunner.prototype.run = function(){
	this.$testigo.run();
};

exports.SimpleRunner = SimpleRunner;

})();