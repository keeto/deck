exports.setup = function(Tests){

var Router = require('lib/router').Router;

Tests.describe('Router', function(it, setup){

	setup('beforeEach', function(){
		this.router = new Router();
		this.mockGET = {method: 'GET', pathInfo: '/'};
		this.mockPOST = {method: 'POST', pathInfo: '/'};
	});

	it('should be a constructor', function(expect){
		expect(Router).toBeAnInstanceOf(Function);
		expect(typeOf(Router)).toBe('class');
	});

	it('should return the `unrouted` function if no routes are found', function(expect){
		var unrouted = function(){};
		this.router.setUnrouted(unrouted);
		var result = this.router.matchRoute(this.mockGET);
		expect(result).toEqual(unrouted);
	});

	it('should match optional paths', function(expect){
		var route = '/{:opt1{/:opt2}}';
		var expected = function(){};
		this.router.addRoute(route, expected);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '/'})).toEqual(expected);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '/abc'})).toEqual(expected);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '/ab/cd'})).toEqual(expected);

		var unrouted = function(){};
		this.router.setUnrouted(unrouted);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '//a'})).toEqual(this.router.$unrouted);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '//a/a'})).toEqual(this.router.$unrouted);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '///b'})).toEqual(this.router.$unrouted);
	});

	it('should cache routes', function(expect){
		this.router.addRoute('/', function(){});
		this.router.matchRoute(this.mockGET);
		expect(this.router.isCached(this.mockGET.pathInfo)).toBeTrue();
	});

	it('should check conditions', function(expect){
		var unrouted = function(){};
		var expected = function(){};
		var conditions = {
			name: 'mark'
		};
		this.router.setUnrouted(unrouted);
		this.router.addRoute('/', expected, {method: 'POST', conditions: conditions});
		expect(this.router.matchRoute(this.mockPOST)).toBe(unrouted);

		Object.append(this.mockPOST, conditions);
		expect(this.router.matchRoute(this.mockPOST)).toBe(expected);
	});

	it('should append capture members to the request object', function(expect){
		var path, request;
		path = '/{:opt1{/*{/:opt2}}}';
		this.router.addRoute(path, function(){});
		request = {method: 'GET', pathInfo: '/ab'};
		this.router.matchRoute(request);
		expect(request).toHaveProperty('captures');
		expect(request).toHaveProperty('params');
		expect(request).toHaveProperty('splat');
		expect(request.params).toHaveProperty('opt1');
		expect(request.params).not.toHaveProperty('opt2');
		expect(request.params.opt1).toBe('ab');

		request = {method: 'GET', pathInfo: '/ab/22'};
		this.router.matchRoute(request);
		expect(request.params).toHaveProperty('opt1');
		expect(request.params).not.toHaveProperty('opt2');
		expect(request.params.opt1).toBe('ab');
		expect(request.splat.length).toBe(1);
		expect(request.splat[0]).toBe('22');

		request = {method: 'GET', pathInfo: '/ab/22/cd/'};
		this.router.matchRoute(request);
		expect(request.params).toHaveProperty('opt1');
		expect(request.params).toHaveProperty('opt2');
		expect(request.params.opt1).toBe('ab');
		expect(request.params.opt2).toBe('cd');
		expect(request.splat.length).toBe(1);
		expect(request.splat[0]).toBe('22');
	});

	it('should properly find a route if multiple routes are defined', function(expect){
		var route1 = function(){};
		var route2 = function(){};
		var unrouted = function(){};
		this.router.setUnrouted(unrouted);
		this.router.addRoute('/:name{/:age}', route1);
		this.router.addRoute('/:name/:age', route2);

		expect(this.router.matchRoute({method: 'GET', pathInfo: '/'})).toBe(unrouted);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '/mark'})).toBe(route1);
		expect(this.router.matchRoute({method: 'GET', pathInfo: '/markus/22'})).toBe(route2);
	});

});

};