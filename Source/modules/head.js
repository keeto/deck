/*
---

script: modules/head.js

description: Makes sure that HEAD requests don't return body content.

license: MIT-style license

authors:
- Mark Obcena

provides: [Head]

...
*/

exports.Head = {
	postHandler: function(request, response){
		if (request.method === 'HEAD') response.resetBody();
		request.next();
	}
};
