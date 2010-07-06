// warnings: no
/*=
name: Core
description: The heart of MooTools.
credits:
  - Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  - Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)
=*/

(function(){

this.MooTools = {
	version: '1.99.0dev',
	build: ''
};

// nil

this.nil = function(item){
	return (item != null && item != nil) ? item : null;
};

Function.prototype.overloadSetter = function(){
	var self = this;
	return function(a, b){
		if (typeof a != 'string'){
			for (var k in a) self.call(this, k, a[k]);
		} else {
			self.call(this, a, b);
		}
		return this;
	};
};

Function.prototype.overloadGetter = function(){
	var self = this;
	return function(a){
		var args, result;
		if (typeof a != 'string') args = a;
		else if (arguments.length > 1) args = arguments;
		if (args){
			result = {};
			for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
		} else {
			result = self.call(this, a);
		}
		return result;
	};
};

Function.prototype.extend = function(key, value){
	this[key] = value;
}.overloadSetter();

Function.prototype.implement = function(key, value){
	this.prototype[key] = value;
}.overloadSetter();

// typeOf, instanceOf

this.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$typeOf) return item.$typeOf();

	if (item.nodeName){
		switch (item.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
		else if (item.item) return 'collection';
	}

	return typeof item;
};

this.instanceOf = function(item, object){
	if (item == null) return false;
	var constructor = item.constructor;
	while (constructor){
		if (constructor === object) return true;
		constructor = constructor.parent;
	}
	return item instanceof object;
};

// From

Function.from = function(item){
	return (typeOf(item) == 'function') ? item : function(){
		return item;
	};
};

Array.from = function(item){
	return (item == null) ? [] : (Type.isEnumerable(item)) ? Array.prototype.slice.call(item) : [item];
};

Number.from = function(item){
	var number = parseFloat(item);
	return isFinite(number) ? number : null;
};

String.from = function(item){
	return item + '';
};

// hide, protect

Function.implement({

	hide: function(){
		this.$hidden = true;
		return this;
	},

	protect: function(){
		this.$protected = true;
		return this;
	}

});

// Type

var Type = this.Type = function(name, object){

	var lower = (name || '').toLowerCase();

	if (name) Type['is' + name] = function(item){
		return (typeOf(item) == lower);
	};

	if (object == null) return null;

	if (name){
		object.prototype.$typeOf = Function.from(lower).hide();
		object.$name = lower;
	}

	object.extend(this);
	object.constructor = Type;
	object.prototype.constructor = object;

	return object;
};

Type.isEnumerable = function(item){
	return (typeof item == 'object' && typeof item.length == 'number');
};

var hooks = {};

var hooksOf = function(object){
	var type = typeOf(object.prototype);
	return hooks[type] || (hooks[type] = []);
};

var implement = function(name, method){
	if (method && method.$hidden) return this;

	var hooks = hooksOf(this);

	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
		if (typeOf(hook) == 'type') implement.call(hook, name, method);
		else hook.call(this, name, method);
	}

	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;

	if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item){
		return method.apply(item, Array.prototype.slice.call(arguments, 1));
	});

	return this;
};

var extend = function(name, method){
	if (method && method.$hidden) return this;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
	return this;
};

Type.implement({

	implement: implement.overloadSetter(),

	extend: extend.overloadSetter(),

	alias: function(key, value){
		implement.call(this, key, this.prototype[value]);
	}.overloadSetter(),

	mirror: function(hook){
		hooksOf(this).push(hook);
		return this;
	}

});

new Type('Type', Type);

// Default Types

var force = function(type, methods){
	var object = new Type(type, this[type]);

	var prototype = object.prototype;

	for (var i = 0, l = methods.length; i < l; i++){
		var name = methods[i];

		var generic = object[name];
		if (generic) generic.protect();

		var proto = prototype[name];
		if (proto){
			delete prototype[name];
			prototype[name] = proto.protect();
		}
	}

	return object.implement(object.prototype);
};

force('Array', [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
]);

force('String', [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
]);

force('Number', ['toExponential', 'toFixed', 'toLocaleString', 'toPrecision']);

force('Function', ['apply', 'call']);

force('RegExp', ['exec', 'test']);

force('Date', ['now']);

Date.extend('now', function(){
	return +(new Date);
});

new Type('Boolean', Boolean);

// fixes NaN returning as Number

Number.prototype.$typeOf = function(){
	return (isFinite(this)) ? 'number' : 'null';
}.hide();

// forEach, each

Object.extend('forEach', function(object, fn, bind){
	for (var key in object) fn.call(bind, object[key], key, object);
});

Object.each = Object.forEach;

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		}
	},

	each: function(fn, bind){
		this.forEach(fn, bind);
		return this;
	}

});

// Array & Object cloning

var cloneOf = function(item){
	switch (typeOf(item)){
		case 'array': return item.clone();
		case 'object': return Object.clone(item);
		default: return item;
	}
};

Array.implement('clone', function(){
	var clone = [];
	for (var i = 0; i < this.length; i++) clone[i] = cloneOf(this[i]);
	return clone;
});

Object.extend('clone', function(object){
	var clone = {};
	for (var key in object) clone[key] = cloneOf(object[key]);
	return clone;
});

// Object merging

var mergeOne = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};

Object.extend('merge', function(source, k, v){
	if (typeof k == 'string') return mergeOne(source, k, v);
	for (var i = 1, l = arguments.length; i < l; i++){
		var object = arguments[i];
		for (var key in object) mergeOne(source, key, object[key]);
	}
	return source;
});

// Object-less types

['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name){
	Type(name);
});

})();

/*=
name: Array
description: Array prototypes and generics.
requires: Core
=*/

Array.implement({

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	indexOf: function(item, from){
		for (var l = this.length, i = (from < 0) ? Math.max(0, l + from) : from || 0; i < l; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++) results.push(fn.call(bind, this[i], i, this));
		return results;
	},

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	clean: function(){
		return this.filter(function(item){
			return item != null;
		});
	},

	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] != null) return this[i];
		}
		return null;
	},

	call: function(name){
		var args = Array.slice(arguments, 1), results = [];
		for (var i = 0, j = this.length; i < j; i++){
			var item = this[i];
			results.push(item[name].apply(item, args));
		}
		return results;
	},

	append: function(array){
		this.push.apply(this, array);
		return this;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	last: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	random: function(){
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var item = this[i];
			if (item != null) array = array.concat((Type.isEnumerable(item)) ? Array.flatten(item) : item);
		}
		return array;
	},

	item: function(at){
		if (at < 0) at = (at % this.length) + this.length;
		return (at < 0 || at >= this.length || this[at] == null) ? null : this[at];
	}

});

/*=
name: Function
description: Function prototypes and generics.
requires: Core
=*/

Function.extend({

	clear: function(timer){
		clearInterval(timer);
		clearTimeout(timer);
		return null;
	},

	stab: function(){
		for (var i = 0, l = arguments.length; i < l; i++){
			try {
				return arguments[i]();
			} catch (e){}
		}
		return null;
	}

});

Function.implement({

	attempt: function(args, bind){
		try {
			return this.apply(bind, Array.from(args));
		} catch (e){
			return null;
		}
	},

	bind: function(bind, args){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	delay: function(delay, bind, args){
		return setTimeout(this.bind(bind, args), delay);
	},

	pass: function(args, bind){
		return this.bind(bind, args);
	},

	periodical: function(periodical, bind, args){
		return setInterval(this.bind(bind, args), periodical);
	},

	run: function(args, bind){
		return this.apply(bind, Array.from(args));
	}

});

/*=
name: Number
description: Number prototypes and generics.
requires: Core
=*/

Number.extend({

	random: function(min, max){
		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	toInt: function(number, base){
		return parseInt(number, base || 10);
	},

	toFloat: function(number){
		return parseFloat(number);
	}

});

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, null, this);
	}

});

['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan'].each(function(name){
	Number.extend(name, Math[name]).implement(name, function(){
		return Math[name].apply(null, [this].concat(Array.slice(arguments)));
	});
});

/*=
name: Object
description: Object generics.
requires: Core
=*/

Object.extend({

	length: function(object){
		var length = 0;
		for (var key in object) length++;
		return length;
	},

	from: function(keys, values){
		var object = {};
		for (var i = 0; i < keys.length; i++) object[keys[i]] = nil(values[i]);
		return object;
	},

	append: function(original){
		for (var i = 1; i < arguments.length; i++){
			var extended = arguments[i] || {};
			for (var key in extended) original[key] = extended[key];
		}
		return original;
	},

	subset: function(object, keys, nuke){
		var results = {};
		for (var i = 0, l = keys.length; i < l; i++){
			var k = keys[i], value = object[k];
			results[k] = nil(value);
			if (nuke) delete object[k];
		}
		return results;
	},

	map: function(object, fn, bind){
		var results = {};
		for (var key in object) results[key] = fn.call(bind, object[key], key, object);
		return results;
	},

	filter: function(object, fn, bind){
		var results = {};
		for (var key in object){
			if (fn.call(bind, object[key], key, object)) results[key] = object[key];
		}
		return results;
	},

	every: function(object, fn, bind){
		for (var key in object){
			if (!fn.call(bind, object[key], key)) return false;
		}
		return true;
	},

	some: function(object, fn, bind){
		for (var key in object){
			if (fn.call(bind, object[key], key)) return true;
		}
		return false;
	},

	keys: function(object){
		var keys = [];
		for (var key in object) keys.push(key);
		return keys;
	},

	values: function(object){
		var values = [];
		for (var key in object) values.push(object[key]);
		return values;
	}

});

/*=
name: String
description: String prototypes and generics.
requires: Core
=*/

String.implement({

	test: function(regex, params){
		return ((typeOf(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return ((separator) ? (separator + this + separator).indexOf(separator + string + separator) : this.indexOf(string)) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return '-' + match.toLowerCase();
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	}

});

/*=
name: Table
description: LUA-Style table implementation.
requires: Core
=*/

(function(){

this.Table = new Type('Table', function(){
	this.table = {};
});

var index = 0, items = {'null': null}, primitives = {'string': {}, 'number': {}};

var valueOf = function(item){
	return (item == null) ? null : (item.valueOf) ? item.valueOf() : item;
};

var uidOf = function(item){
	var type = typeOf((item = valueOf(item)));
	if (type == 'null') return 'null';
	if ((type = primitives[type])) item = type[item] || (type[item] = {valueOf: Function.from(item)});
	var uid = item.uid || (item.uid = (index++).toString(16));
	if (!items[uid]) items[uid] = item;
	return uid;
};

var itemOf = function(uid){
	return valueOf(items[uid]);
};

Table.implement({

	set: function(key, value){
		this.table[uidOf(key)] = value;
		return this;
	},

	get: function(key){
		var value = this.table[uidOf(key)];
		return nil(value);
	},

	erase: function(key){
		var uid = uidOf(key), value = this.table[uid];
		delete this.table[uid];
		return nil(value);
	},

	forEach: function(fn, bind){
		for (var uid in this.table) fn.call(bind, this.table[uid], itemOf(uid), this);
	},

	length: function(){
		var length = 0;
		for (var uid in this.table) length++;
		return length;
	}

});

Table.alias('each', 'forEach');

})();

/*=
name: Accessor
description: yo!
requires:
  - Array
  - Function
  - Number
  - String
  - Object
  - Table
=*/

(function(global){

/* Accessor */

this.Accessor = function(singular, plural){

	if (this === global) return function(){
		return new Accessor(singular, plural);
	};

	singular = (singular || '').capitalize();
	if (!plural) plural = singular + 's';

	var accessor = {}, matchers = [];

	this['define' + singular] = function(key, value){
		if (typeOf(key) == 'regexp') matchers.push({'regexp': key, 'action': value});
		else accessor[key] = value;
		return this;
	};

	this['define' + plural] = function(object){
		for (var key in object) accessor[key] = object[key];
		return this;
	};

	this['match' + singular] = function(name){
		for (var l = matchers.length; l--; l){
			var matcher = matchers[l], match = name.match(matcher.regexp);
			if (match && (match = match.slice(1))) return function(){
				return matcher.action.apply(this, Array.slice(arguments).append(match));
			};
		}
		return null;
	};

	this['lookup' + singular] = function(key){
		return accessor[key] || null;
	};

	this['lookup' + plural] = function(keys){
		return Object.subset(accessor, keys);
	};

	return this;

};

})(this);

/*=
name: Storage
description: yo!
requires:
  - Array
  - Function
  - Number
  - String
  - Object
  - Table
=*/

this.Storage = function(){

	var storage = {};

	this.store = function(object){
		for (var key in object) storage[key] = object[key];
		return this;
	}.overload(Function.overloadPair);

	this.retrieve = function(object){
		var keys = [];
		for (var key in object){
			keys.push(key);
			var dflt = object[key], value = storage[key];
			if (dflt != null && value == null) storage[key] = Function.from(dflt)();
		}
		return Object.subset(storage, keys);
	}.overload(Function.overloadPair);

	this.dump = function(){
		return Object.subset(storage, arguments, true);
	}.overload(Function.overloadList);

	return this;

};

/*=
name: JSON
description: JSON encoder and decoder.
requires:
  - Array
  - Function
  - Number
  - String
  - Object
  - Table
=*/

this.JSON = (typeof JSON !== 'undefined') ? JSON : {};

(function(){

var special = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

var escape = function(chr){
	return special[chr] || '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
};

var isSecure = function(string){
	string = string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, '');

	return (/^[\],:{}\s]*$/).test(string);
};

JSON.encode = JSON.stringify || function(obj){
	if (obj && obj.toJSON) obj = obj.toJSON();

	switch (typeOf(obj)){
		case 'string':
			return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';
		case 'array':
			return '[' + obj.map(JSON.encode).clean() + ']';
		case 'object':
			var string = [];
			for (var key in obj){
				var json = JSON.encode(obj[key]);
				if (json) string.push(JSON.encode(key) + ':' + json);
			}
			return '{' + string + '}';
		case 'number': case 'boolean': return '' + obj;
		case 'null': return 'null';
	}

	return null;
};

JSON.decode = function(string, secure){
	if (!string || typeOf(string) != 'string') return null;

	if (secure || JSON.secure){
		if (JSON.parse) return JSON.parse(string);
		if (!isSecure(string)) throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
	}

	return eval('(' + string + ')');
};

})();

/*=
name: Class
description: Code with Class
requires: Accessor
=*/

(function(){

var Class = this.Class = new Type('Class', function(params){

	if (instanceOf(params, Function)) params = {'initialize': params};

	var newClass = function(){
		reset(this);
		if (newClass.$prototyping) return this;
		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;
		return value;
	}.extend(this);

	newClass.implement(params);

	newClass.constructor = Class;
	newClass.prototype.constructor = newClass;
	newClass.prototype.parent = parent;

	return newClass;

});

var parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');
	var name = this.$caller.$name, parent = this.$caller.$owner.parent;
	var previous = (parent) ? parent.prototype[name] : null;
	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

var reset = function(object){
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
			case 'object':
				var F = function(){};
				F.prototype = value;
				var instance = new F;
				object[key] = reset(instance);
			break;
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

var wrap = function(self, key, method){
	if (method.$origin) method = method.$origin;

	return function(){
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
		var caller = this.caller, current = this.$caller;
		this.caller = current; this.$caller = arguments.callee;
		var result = method.apply(this, arguments);
		this.$caller = current; this.caller = caller;
		return result;
	}.extend({$owner: self, $origin: method, $name: key});
};

Class.extend(new Accessor('Mutator'));

var implement = function(key, value, retain){

	var mutator = Class.matchMutator(key) || Class.lookupMutator(key);

	if (mutator){
		value = mutator.call(this, value);
		if (value == null) return this;
	}

	if (typeOf(value) == 'function'){
		if (value.$hidden) return this;
		this.prototype[key] = (retain) ? value : wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}

	return this;

};

var getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};

Class.implement('implement', (function(name, fn){
	implement.call(this, name, fn);
	return this;
}).overloadSetter());

Class.defineMutators({

	Extends: function(parent){
		this.parent = parent;
		this.prototype = getInstance(parent);
	},

	Implements: function(items){
		Array.from(items).each(function(item){
			var instance = new item;
			for (var key in instance) implement.call(this, key, instance[key], true);
		}, this);
	}

});

Class.defineMutator(/^protected\s(\w+)$/, function(fn, name){
	implement.call(this, name, fn.protect());
});

Class.defineMutator(/^linked\s(\w+)$/, function(value, name){
	this.prototype[name] = value;
});

})();

/*=
name: Mixins
description: Utility classes Storage, Accessor, Events, Options and Chain.
requires:
  - Array
  - Function
  - Number
  - String
  - Object
  - Table
=*/

(function(){

/* Events */

var eventsOf = function(object, type){
	type = type.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
	var events = object.$events;
	return events[type] || (events[type] = []);
};

var removeEventsOfType = function(object, type){
	eventsOf(object, type).each(function(fn){
		object.removeEvent(type, fn);
	});
};

this.Events = new Class({

	$events: {},

	addEvent: function(type, fn){
		eventsOf(this, type).include(fn);
		return this;
	},

	addEvents: function(events){
		for (var name in events) this.addEvent(name, events[name]);
		return this;
	},

	fireEvent: function(type, args){
		args = Array.from(args);
		eventsOf(this, type).each(function(fn){
			fn.apply(this, args);
		}, this);
		return this;
	},

	fireEvents: function(){
		for (var i = 0; i < arguments.length; i++) this.fireEvent(arguments[i]);
		return this;
	},

	removeEvent: function(type, fn){
		if (!fn.$protected){
			var events = eventsOf(this, type), index = events.indexOf(fn);
			if (index != -1) delete events[index];
		}

		return this;
	},

	removeEvents: function(option){
		switch (typeOf(option)){
			case 'string': removeEventsOfType(this, option); break;
			case 'object': for (var name in option) this.removeEvent(name, option[name]); break;
			case 'null':
				var events = this.$events;
				for (var type in events) removeEventsOfType(this, type);
		}
		return this;
	}

});

/* Options */

this.Options = new Class({

	options: {},

	setOption: function(key, value){
		Object.merge(this.options, key, value);
		return this;
	},

	setOptions: function(options){
		for (var key in options) this.setOption(key, options[key]);
		if (this.addEvent) Object.each(this.options, function(value, key){
			if (!(/^on[A-Z]/).test(key) || typeOf(value) != 'function') return;
			this.addEvent(key, value);
			this.options[key] = null;
		}, this);
		return this;
	},

	getOption: function(key){
		return nil(this.options[key]);
	},

	getOptions: function(keys){
		return Object.subset(this.options, keys);
	}

});

/* Chain */

this.Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.append(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : null;
	},

	clearChain: function(){
		this.$chain = [];
		return this;
	}

});

})();

/*=
name: Export
description: Turns MooTools into the best CommonJS module
requires:
  - Array
  - Table
  - Storage
  - Class
  - Mixins
=*/

(function(){

var $top = this, $exports = (typeof exports === 'object') ? exports : {};

Array.each([
	"MooTools",
	"nil", "typeOf", "instanceOf",
	"Type", "Table", "Accessor", "Storage", "Class",
	"Events", "Options", "Chain"
], function(item){ $exports[item] = $top[item]; });

$exports.into = function into(globalObj){
	if (globalObj && globalObj !== $top){
		for (var i in $exports) {
			if ($exports[i] !== into) globalObj[i] = $exports[i];
		}
	}
	return $exports;
};

})();
