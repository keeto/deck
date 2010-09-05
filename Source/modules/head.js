/*
Script: modules/head.js
	Ensures that requests with HEAD method has zero-length bodies.

Provides:
	- Head : {}

Authors:
	- Mark Obcena

License:
	MIT-Style License

*/

exports.Head = {
	postHandler: function(request, response){
		if (request.method === 'HEAD') response.resetBody();
		request.next();
	}
};
