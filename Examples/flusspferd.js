var Deck = require('./../Source/deck').setup(this, 'flusspferd');
var Zest = require('zest').Zest;

/* App */
var Application = function(request, response){
	response.setStatus(200);
	response.setHeader('content-type', 'text/html');
	if (request.params.name) response.puts(['Hello ', request.params.name, '!\n'].join(''));
	if (request.params.age) response.puts(['You are', request.params.age, 'years old.\n'].join(' '));
	response.puts('Have a nice Day!');
	response.finish();
};

/* Deck Instance */
var Serv = new Deck();
Serv.addRoute('/{:name{/:age}}', Application);

new Zest({
	handler: function(env){
		return Serv.dispatch(env);
	},
	port: 8081
}).start();