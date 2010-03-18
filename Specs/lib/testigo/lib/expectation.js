/*
---
script: expectation.js
description: expectation class
license: MIT-style license
authors:
- Mark Obcena
provides: [Expectation]
...
*/

(function(){

var utils = require('./utils'),
	typeOf = utils.typeOf,
	instanceOf = utils.instanceOf;

var prepareNot = function(exp){
	exp.not = {};
	for (var matcher in Expectation.Matchers) (function(matcher){
		exp.not[matcher] = function(expected){
			var result = !Expectation.Matchers[matcher].call(null, exp._received, expected);
			exp._callback.call(exp._bound, result, exp._received, expected, 'not.' + matcher);
			return result;
		};
	})(matcher);
};

var Expectation = function(value, callback, bound){
	this._received = value;
	this._callback = callback || function(){};
	this._bound = bound || this;
	prepareNot(this);
};

Expectation.Matchers = {

	toBe: function(received, expected){
		return expected === received;
	},

	toEqual: function(received, expected){
		return expected == received;
	},

	toBeType: function(received, expected){
		return expected == typeOf(received);
	},

	toBeAnInstanceOf: function(received, expected){
		return instanceOf(received, expected);
	},

	toBeNull: function(received){
		return received === null;
	},

	toBeUndefined: function(received){
		return received === undefined;
	},

	toBeTrue: function(received){
		return received === true;
	},

	toBeTruthy: function(received){
		return (!!received) === true;
	},

	toBeFalse: function(received){
		return received === false;
	},

	toBeFalsy: function(received){
		return (!!received) === false;
	},

	toHaveMember: function(received, expected){
		try {
			return (expected in received);
		} catch(e){
			return false;
		}
	},

	toHaveProperty: function(received, expected){
		try {
			return (expected in received) && received[expected] !== undefined && !(received[expected] instanceof Function);
		} catch(e){
			return false;
		}
	},

	toHaveMethod: function(received, expected){
		try {
			return (expected in received) && received[expected] !== undefined && (received[expected] instanceof Function);
		} catch(e){
			return false;
		}
	},

	toBeLike: function(received, expected){
		var type = typeOf(expected);
		if (type !== typeOf(received)) return null;
		if (type == 'object'){
			for (var key in expected){
				if (received[key] === undefined || received[key] !== expected[key]) return false;
			}
		} else if (type == 'array'){
			var len = expected.length;
			while (len--){
				if (received.indexOf(expected[len]) === -1) return false;
			}
		} else {
			return expected === received;
		}
		return true;
	},

	toBeSimilar: function(received, expected){
		return JSON.stringify(received) === JSON.stringify(expected);
	},

	toMatch: function(received, expected){
		return expected.test(received);
	}

};

for (var matcher in Expectation.Matchers) (function(matcher){

	Expectation.prototype[matcher] = function(expected){
		var result = Expectation.Matchers[matcher].call(null, this._received, expected);
		this._callback.call(this._bound, result, this._received, expected, matcher);
		return result;
	};

})(matcher);

exports.Expectation = Expectation;

})();