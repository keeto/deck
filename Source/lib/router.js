/*
---

script: router.js

description: A basic URL and Method router.

license: MIT-style license

authors:
- Mark Obcena

provides: [Router]

...
*/

(function(){

var trim = function(path){
	var slash = path.lastIndexOf('/');
	if (path.length != 1 && slash == path.length - 1) return path.substring(0, slash);
	else return path;
};

var Router = new Class({

	$routes: {
		GET: [], POST: [], PUT: [], DELETE: [], HEAD: []
	},

	$cache: {},

	cacheRequest: true,

	$unrouted: function(request, response){
		response.setStatus(404);
		request.next();
	},

	setUnrouted: function(fn){
		this.$unrouted = fn;
	},

	addRoute: function(matcher, func, options){
		var type = typeOf(matcher), form = [], method, len, routes, current;
		if (!matcher) return this;
		options = options || {};
		if (typeof matcher == 'string'){
			var _ = this.prepareMatcher(matcher);
			matcher = _.matcher; form = _.form;
		}
		method = Array.from(options.method || ['GET']);
		len = method.length;
		while (len--){
			routes = this.$routes[method[len].toUpperCase()];
			if (!routes) continue;
			current = {
				key: matcher,
				action: func,
				type: type,
				form: form,
				conditions: options.conditions || {}
			};
			routes.push(current);
			if (method[len] == 'HEAD') this.$routes.HEAD.push(current);
		}
		return this;
	},

	'protected prepareMatcher': function(matcher){
		var params = matcher.match(/:([A-Za-z_][A-Za-z0-9_$]+)|\*/g), form = [];
		if (params){
			var i = params.length;
			while (i--){
				form.unshift(params[i] == '*' ? 'splat' : params[i].substring(1));
				form = form.filter(function(i){ return i.length; });
			}
			matcher = matcher.multiReplace(
				[(/:([A-Za-z_][A-Za-z0-9_$]+)|\*/g), '([^\\\/]+)'],
				[(/\{/g), '(?:'],
				[(/\}/g), ')?']
			);
		}
		return {matcher: new RegExp('^' + matcher + '$'), form: form};
	},

	addRoutes: function(items){
		var len, current;
		items = Array.from(items);
		len = items.reverse().length;
		while (len--){
			current = items[len];
			this.addRoute(current.path, current.action, current.options);
		}
		return this;
	},

	matchRoute: function(request){
		var path = trim(request.pathInfo),
			method = request.method,
			routes = this.$routes[method.toUpperCase()];
		if (this.isCached(path, request)) return this.getCached(path, request);
		if (!routes || routes.length == 0) return this.$unrouted;
		return this.getMatch(request, path, routes);
	},

	'protected getMatch': function(request, path, routes){
		var len, route, matches, captures;
		len = routes.length;
		while (len--){
			route = routes[len];
			matches = path.match(route.key);
			if (matches){
				if (!this.checkConditions(request, route.conditions)) continue;
				captures = this.getCaptures(request, route, matches);
				Object.append(request, captures);
				this.setCached(path, Object.append(captures, {
					conditions: route.conditions,
					action: route.action
				}));
				return route.action;
			}
		}
		return this.$unrouted;
	},

	'protected getCaptures': function(request, route, matches){
		var result = {captures: [], params: {}, splat: []};
		matches.shift();
		if (route.type == 'regexp'){
			result.captures = matches;
		} else {
			var i = route.form.length;
			while (i--){
				if (route.form[i] == 'splat') result.splat.push(matches[i]);
				else result.params[route.form[i]] = matches[i];
			}
		}
		return result;
	},

	'protected checkConditions': function(request, conditions){
		for (var key in conditions){
			var type = typeOf(conditions[key]);
			if ((type == 'string' && conditions[key] !== request[key])
				|| (type == 'regexp' && !request[key].test(conditions[key]))
				|| (type == 'function' && !Function.stab(function(){
						return conditions[key](request[key]);
				}))) return false;
		}
		return true;
	},

	'protected setCached': function(path, obj){
		if (this.cacheRequest) this.$cache[path] = obj;
		return this;
	},

	'protected getCached': function(path, request){
		request.captures = this.$cache[path].captures;
		request.params = this.$cache[path].params;
		request.splat = this.$cache[path].splat;
		return this.$cache[path].action;
	},

	isCached: function(path, request){
		return (this.cacheRequest && this.$cache[path])
				&& this.checkConditions(request, this.$cache[path].conditions);
	}

});

exports.Router = Router;

})();