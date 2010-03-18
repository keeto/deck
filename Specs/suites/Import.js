exports.setup = function(Tests, global, type, source){

var Deck = require('deck').setup(global, type, {path: source});

Tests.describe('Import, MooTools', function(it, setup){

	it('should import MooTools into the global scope', function(expect){
		expect(MooTools).toBeAnInstanceOf(Object);
		expect(Class).toBeAnInstanceOf(Function);
		expect(typeOf).toBeAnInstanceOf(Function);
		expect(instanceOf).toBeAnInstanceOf(Function);
	});

});

Tests.describe('Import, Engine', function(it){

	it('should create an Engine object in the global scope', function(expect){
		expect(Engine).toBeType('object');
	});

});

Tests.describe('Import, Deck', function(it){

	it('should be a constructor', function(expect){
		expect(Deck).toBeAnInstanceOf(Function);
		var deck = new Deck();
		expect(deck).toBeAnInstanceOf(Deck);
	});

	it('should have an `Info` member', function(expect){
		expect(Deck.Info).toBeType('object');
		expect(Deck.Info.version).toBeType('array');
	});

	it('should have a `Modules` member', function(expect){
		expect(Deck.Modules).toBeType('object');
	});

});

};