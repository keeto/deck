exports.setup = function(Tests){

var Modules = require('lib/modules').Modules;

Tests.describe('Modules', function(it, setup){

	setup('beforeEach', function(){
		this.modules = new Modules();
		this.modA = function(){};
		this.modB = function(){};
		this.modC = function(){};

		this.objModA = {
			preHandler: this.modA,
			postHandler: this.modB
		};
		this.objModB = {
			preHandler: this.modA,
			postHandler: this.modB
		};
	});

	it('should be a constructor', function(expect){
		expect(Modules).toBeAnInstanceOf(Function);
		expect(typeOf(Modules)).toBe('class');
	});

	it('should have methods getPre/PostHandlers that return arrays', function(expect){
		expect(this.modules.getPreHandlers).toBeAnInstanceOf(Function);
		expect(this.modules.getPostHandlers).toBeAnInstanceOf(Function);
		expect(this.modules.getPreHandlers()).toBeAnInstanceOf(Array);
		expect(this.modules.getPostHandlers()).toBeAnInstanceOf(Array);
	});

	it('should throw an error for addPreHandler if you don\' pass a function', function(expect){
		var error;
		try {
			new Modules().addPreHandler(null);
		} catch(e){
			error = e;
		} finally {
			expect(error).toBeAnInstanceOf(Error);
		}
	});

	it('should add modules to the pre stack from the top', function(expect){
		this.modules.addPreHandler(this.modA).addPreHandler(this.modB).addPreHandler(this.modC);
		var results = this.modules.getPreHandlers();
		expect(results.length).toBe(3);
		expect(results[0]).toBe(this.modC);
		expect(results[2]).toBe(this.modA);
	});

	it('should remove one module from the pre stack', function(expect){
		this.modules.addPreHandler(this.modA).addPreHandler(this.modB).addPreHandler(this.modC).addPreHandler(this.modA);
		this.modules.removePreHandler(this.modA);
		var results = this.modules.getPreHandlers();
		expect(results.length).toBe(3);
		expect(results[0]).toBe(this.modC);
		expect(results[2]).toBe(this.modA);
	});

	it('should remove all modules from the pre stack', function(expect){
		this.modules.addPreHandler(this.modA).addPreHandler(this.modB).addPreHandler(this.modC).addPreHandler(this.modA);
		this.modules.removePreHandler(this.modA, true);
		var results = this.modules.getPreHandlers();
		expect(results.length).toBe(2);
		expect(results[0]).toBe(this.modC);
		expect(results[1]).toBe(this.modB);
	});

	it('should throw an error for addPostHandler if you don\' pass a function', function(expect){
		var error;
		try {
			new Modules().addPostHandler(null);
		} catch(e){
			error = e;
		} finally {
			expect(error).toBeAnInstanceOf(Error);
		}
	});

	it('should add modules to the post stack from the bottom', function(expect){
		this.modules.addPostHandler(this.modA).addPostHandler(this.modB).addPostHandler(this.modC);
		var results = this.modules.getPostHandlers();
		expect(results.length).toBe(3);
		expect(results[0]).toBe(this.modA);
		expect(results[2]).toBe(this.modC);
	});

	it('should remove one module from the post stack', function(expect){
		this.modules.addPostHandler(this.modA).addPostHandler(this.modB);
		this.modules.addPostHandler(this.modC).addPostHandler(this.modA);
		this.modules.removePostHandler(this.modA);
		var results = this.modules.getPostHandlers();
		expect(results.length).toBe(3);
		expect(results[0]).toBe(this.modA);
		expect(results[2]).toBe(this.modC);
	});

	it('should remove all modules from the post stack', function(expect){
		this.modules.addPostHandler(this.modA).addPostHandler(this.modB);
		this.modules.addPostHandler(this.modC).addPostHandler(this.modA);
		this.modules.removePostHandler(this.modA, true);
		var results = this.modules.getPostHandlers();
		expect(results.length).toBe(2);
		expect(results[0]).toBe(this.modB);
		expect(results[1]).toBe(this.modC);
	});

	it('should add combined module objects', function(expect){
		var pre, post;

		this.modules.addModule(this.objModA);
		pre = this.modules.getPreHandlers();
		post = this.modules.getPostHandlers();
		expect(pre.length).toBe(1);
		expect(post.length).toBe(1);

		this.modules.addModule(this.objModB);
		pre = this.modules.getPreHandlers();
		post = this.modules.getPostHandlers();
		expect(pre.length).toBe(2);
		expect(post.length).toBe(2);
	});

	it('should remove combined module objects', function(expect){
		var pre, post;

		this.modules.addModule(this.objModA);
		this.modules.addModule(this.objModB);
		pre = this.modules.getPreHandlers();
		post = this.modules.getPostHandlers();
		expect(pre.length).toBe(2);
		expect(post.length).toBe(2);

		this.modules.removeModule(this.objModA);
		pre = this.modules.getPreHandlers();
		post = this.modules.getPostHandlers();
		expect(pre.length).toBe(1);
		expect(post.length).toBe(1);
	});

});

};