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
				Engine.writeOut(matcher.toString());
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
			routes = this.$routes[method],
			len, route, matches;
		if (!routes || routes.length == 0) return this.noRoute;
		len = routes.length;
		while (len--){
			route = routes[len];
			matches = path.match(route.key);
			if (matches){
				matches.shift();
				matches = matches.filter(function(i){ return i && i.indexOf('/') !== 0; })
				if (route.type == 'regexp'){
					request.captures = matches;
				} else {
					request.params = {};
					request.splat = [];
					var i = route.form.length;
					while (i--){
						if (route.form[i] == 'splat') request.splat.push(matches[i]);
						else request.params[route.form[i]] = matches[i];
					}
				}
				return route.action;
			}
		}
		return this.noRoute;
	}

});

exports.Router = Router;

})();