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

	noRoute: function(request, response){
		response.setStatus(404);
		request.next(); 
	},

	addRoute: function(matcher, func, options){
		var method, len, routes, current;
		if (!matcher) return;
		options = options || {method: ['GET']};
		if (typeof matcher == 'string') matcher = new RegExp('^' + matcher + '$');
		method = Array.from(options.method);
		len = method.length;
		while (len--){
			routes = this.$routes[method[len].toUpperCase()];
			if (!routes) continue;
			current = {key: matcher, action: func};
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
			routes = this.$routes[method],
			len, route;
		if (!routes || routes.length == 0) return this.noRoute;
		len = routes.length;
		while (len--){
			route = routes[len];
			if (path.test(route.key)) {
				return route.action;
			}
		}
		return this.noRoute;
	}

});

exports.Router = Router;

})();