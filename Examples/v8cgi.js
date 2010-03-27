var Deck = require('./../Source/deck').setup(global, 'v8cgi');

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

(function(request, response){
	var result = Serv.dispatch(request, response);
	response.header(result.headers);
	response.status(result.status);
	response.write(result.body.join(''));
})(request, response);