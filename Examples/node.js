require.paths.unshift(process.cwd() + './../Source/');
var Deck = require('deck').setup(GLOBAL, 'node');
var http = require('http');

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

http.createServer(function (req, res) {
  setTimeout(function(){
	Serv.dispatch(req, res);
  }, 0);
}).listen(8000);
