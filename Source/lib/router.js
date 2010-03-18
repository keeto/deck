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

var Route = require('./route').Route;

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
		if (!matcher) return this;
		options = options || {};
		matcher = new Route(matcher, func, options.conditions);
		var methods = Array.from(options.method || ['GET']);
		var len = methods.length, routes;
		while (len--){
			routes = this.$routes[methods[len].toUpperCase()];
			if (!routes) continue;
			routes.push(matcher);
			if (methods[len] == 'HEAD') this.$routes.HEAD.push(current);
		}
		return this;
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
		var len = routes.length;
		while (len--){
			var route = routes[len];
			var matches = route.matches(path);
			if (matches){
				if (!route.conforms(request)) continue;
				var captures = route.getCaptures(path);
				Object.append(request, captures);
				this.setCached(path, route, captures);
				return route.action;
			}
		}
		return this.$unrouted;
	},

	'protected setCached': function(path, route, captures){
		if (this.cacheRequest) this.$cache[path] = {
			route: route,
			captures: captures
		};
		return this;
	},

	'protected getCached': function(path, request){
		request.captures = this.$cache[path].captures.captures;
		request.params = this.$cache[path].captures.params;
		request.splat = this.$cache[path].captures.splat;
		return this.$cache[path].route.action;
	},

	isCached: function(path, request){
		return this.cacheRequest && this.$cache[path] && this.$cache[path].route.conforms(request);
	}

});

exports.Router = Router;

})();