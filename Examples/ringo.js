require.paths.unshift('./../Source/');
var Deck = require('deck').setup(global, 'ringo');
var http = require('ringo/httpserver');

/* App */
var Application = function(request, response){
	response.setStatus(200);
	response.setHeader('content-type', 'text/html');
	if (request.params.name) response.write(['Hello ', request.params.name, '!\n'].join(''));
	if (request.params.age) response.write(['You are', request.params.age, 'years old.\n'].join(' '));
	response.write('Have a nice Day!');
	response.finish();
};

/* Deck Instance */
var Serv = new Deck();
Serv.addRoute('/{:name{/:age}}', Application);

var httpserv = new http.Server();
httpserv.addApplication('/', null, function(env){
	return Serv.dispatch(env);
});
httpserv.start();
