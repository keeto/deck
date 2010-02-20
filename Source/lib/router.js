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
		var type = typeOf(matcher), params, form = [], method, len, routes, current;
		if (!matcher) return;
		options = options || {method: ['GET']};
		if (typeof matcher == 'string'){
			params = matcher.match(/:([A-Za-z0-9_$]*)|\*/g);
			if (params){
				var i = params.length;
				while (i--){
					form.unshift(params[i] == '*' ? 'splat' : params[i].substring(1));
					form = form.filter(function(i){ return i.length; });
				}
				matcher = matcher.replace(/:([A-Za-z0-9_$]*)|\*/g, '([^\\\/]*)').replace(/\{/g, '(').replace(/}/g, ')?');
			}
			matcher = new RegExp('^' + matcher + '$');
		}
		method = Array.from(options.method);
		len = method.length;
		while (len--){
			routes = this.$routes[method[len].toUpperCase()];
			if (!routes) continue;
			current = {key: matcher, action: func, type: type, form: form};
			routes.push(current);
			if (method[len] == 'HEAD') this.$routes.HEAD.push(current);
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
			routes = this.$routes[method.toUpperCase()],
			len, route, matches,
			captures, params, splat;
		if (this.isCached(path)) return this.getCached(path, request);
		if (!routes || routes.length == 0) return this.$unrouted;
		len = routes.length;
		while (len--){
			route = routes[len];
			matches = path.match(route.key);
			if (matches){
				matches.shift();
				matches = matches.filter(function(i){ return i && i.indexOf('/') !== 0; });
				if (route.type == 'regexp'){
					captures = request.captures = matches;
				} else {
					params = request.params = {};
					splat = request.splat = [];
					var i = route.form.length;
					while (i--){
						if (route.form[i] == 'splat') request.splat.push(matches[i]);
						else request.params[route.form[i]] = matches[i];
					}
				}
				if (this.cacheRequest) this.setCached(path, {
					action: route.action,
					captures: captures,
					params: params,
					splat: splat
				});
				return route.action;
			}
		}
		return this.$unrouted;
	},

	setCached: function(path, obj){
		this.$cache[path] = obj;
		return this;
	},

	getCached: function(path, request){
		request.captures = this.$cache[path].captures;
		request.params = this.$cache[path].params;
		request.splat = this.$cache[path].splat;
		return this.$cache[path].action;
	},

	isCached: function(path){
		return (this.cacheRequest && this.$cache[path]);
	}

});

exports.Router = Router;

})();