exports.setup = function(Tests){

var Route = require('lib/route').Route;

Tests.describe('Route', function(it, setup){

	it('should be a constructor', function(expect){
		expect(Route).toBeAnInstanceOf(Function);
		expect(typeOf(Route)).toBe('class');
	});

	it('should return the action if route matches and null otherwise', function(expect){
		var action = function(){};
		var route = new Route('/', action);

		expect(route.matches('/')).toBe(action);
		expect(route.matches('/markee')).toBeNull();
	});

	it('should match optional paths', function(expect){
		var path = '/{:opt1{/:opt2}}';
		var expected = function(){};
		var route = new Route(path, expected);

		expect(route.matches('/')).toEqual(expected);
		expect(route.matches('/abc')).toEqual(expected);
		expect(route.matches('/ab/123')).toEqual(expected);

		expect(route.matches('/.')).toEqual(expected);
		expect(route.matches('/./.')).toEqual(expected);

		expect(route.matches('//a')).toBeNull();
		expect(route.matches('//a/a')).toBeNull();
		expect(route.matches('///123')).toBeNull();
	});

	it('should match check conditions', function(expect){
		var conditions, route;

		conditions = {name: 'mark'};
		route = new Route('/', function(){}, {conditions: conditions});
		expect(route.conforms({name: 'mark'})).toBeTrue();
		expect(route.conforms({name: 'joseph'})).not.toBeTrue();

		conditions = {
			name: function(received){
				return received == 'mark';
			}
		};
		route = new Route('/', function(){}, {conditions: conditions});
		expect(route.conforms({name: 'mark'})).toBeTrue();
		expect(route.conforms({name: 'joseph'})).not.toBeTrue();

		conditions = {name: /^m/};
		route = new Route('/', function(){}, {conditions: conditions});
		expect(route.conforms({name: 'mark'})).toBeTrue();
		expect(route.conforms({name: 'joseph'})).not.toBeTrue();

		conditions = {
			name: /^m/,
			length: function(received, request){
				return request.name.length > 3;
			},
			type: 'public'
		};
		route = new Route('/', function(){}, {conditions: conditions});
		expect(route.conforms({name: 'mark', type: 'public'})).toBeTrue();
		expect(route.conforms({name: 'markus', type: 'public'})).toBeTrue();
		expect(route.conforms({name: 'mark'})).not.toBeTrue();
		expect(route.conforms({name: 'mar', type: 'public'})).not.toBeTrue();
		expect(route.conforms({name: 'joseph', type: 'public'})).not.toBeTrue();
	});

	it('should return a captures object', function(expect){
		var route = new Route('/{:name{/:age}}', function(){});
		var captures = route.getCaptures('/');
		expect(captures).toBeAnInstanceOf(Object);
		expect(captures).toHaveProperty('captures');
		expect(captures).toHaveProperty('params');
		expect(captures).toHaveProperty('splat');
	});


	it('should capture named matches from string routes', function(expect){
		var path, route, result;
		path = '/{:name{/:age{/:color}}}';
		route = new Route(path, function(){});

		result = route.getCaptures('/');
		expect(result.params).not.toHaveProperty('name');
		expect(result.params).not.toHaveProperty('age');
		expect(result.params).not.toHaveProperty('color');

		result = route.getCaptures('/mark');
		expect(result.params).toHaveProperty('name');
		expect(result.params.name).toBe('mark');

		result = route.getCaptures('/mark/22');
		expect(result.params).toHaveProperty('name');
		expect(result.params).toHaveProperty('age');
		expect(result.params.name).toBe('mark');
		expect(result.params.age).toBe('22');

		result = route.getCaptures('/mark/22/$green');
		expect(result.params).toHaveProperty('name');
		expect(result.params).toHaveProperty('age');
		expect(result.params).toHaveProperty('color');
		expect(result.params.name).toBe('mark');
		expect(result.params.age).toBe('22');
		expect(result.params.color).toBe('$green');
	});

	it('should capture splats from string routes', function(expect){
		var path, route, result;
		path = '/{*}';
		route = new Route(path, function(){});
		result = route.getCaptures('/mark');
		expect(result.splat).toBeAnInstanceOf(Array);
		expect(result.splat.length).toBe(1);
		expect(result.splat[0]).toBe('mark');

		path = '/{:name{/*}}';
		route = new Route(path, function(){});
		result = route.getCaptures('/mark/yes');
		expect(result.params).toHaveProperty('name');
		expect(result.params.name).toBe('mark');
		expect(result.splat.length).toBe(1);
		expect(result.splat[0]).toBe('yes');

		path = '/{:name{/*{/:age}}}';
		route = new Route(path, function(){});
		result = route.getCaptures('/mark/yes/22');
		expect(result.params).toHaveProperty('name');
		expect(result.params).toHaveProperty('age');
		expect(result.params.name).toBe('mark');
		expect(result.params.age).toBe('22');
		expect(result.splat.length).toBe(1);
		expect(result.splat[0]).toBe('yes');
	});

	it('should capture matches from regexp routes', function(expect){
		var path, route, result;
		path = /\/([^\/]*)\/?/;
		route = new Route(path, function(){});
		result = route.getCaptures('/mark/');
		expect(result.captures).toBeAnInstanceOf(Array);
		expect(result.captures.length).toBe(1);
		expect(result.captures[0]).toBe('mark');
	});

});

};
