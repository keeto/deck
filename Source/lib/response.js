/*
---

script: response.js

description: JSGI+ response class.

license: MIT-style license

authors:
- Mark Obcena

provides: [Response]

...
*/

(function(){

var Response = new Class({

	$headers: {},
	$body: [],
	$status: 200,
	original: {},

	finished: false,

	initialize: function(resp){
		if (resp) this.original = resp;
	},

	setHeader: function(key, value){
		key = key.toLowerCase().replace(/[_-]+$/, '');
		this.$headers[key] = value;
		return this;
	},

	setHeaders: function(headers){
		for (var i in headers) this.setHeader(i, headers[i]);
		return this;
	},

	getHeader: function(key){
		key = key.toLowerCase().replace(/[_-]+$/, '');
		return this.$headers[key];
	},

	removeHeader: function(key){
		delete this.$headers[key];
		return this;
	},

	puts: function(data){
		this.$body.push(data);
		return this;
	},

	resetBody: function(data){
		this.$body = [];
		return this;
	},

	setStatus: function(code){
		this.$status = (code * 1);
		return this;
	},

	clean: function(){
		var headers = this.$headers,
			body = this.$body,
			status = (this.$status * 1);

		delete headers['status'];

		if (((status >= 100 && status <= 199) || status == 204 || status == 304)) {
			delete headers['content-type'];
			delete headers['content-length'];
		}

		return {
			headers: headers,
			body: Array.from(body),
			status: (status * 1)
		};
	},
	
	finish: function(){
		if (this.finished) return this.clean();
		if (!this.headerSent) this.writeHead();
		this.write();
		this.finished = true;
		if (this.original.close) this.original.close();
		return this.clean();
	},

	// for node
	writeHead: function(status, headers){
		this.setStatus(status || this.$status).setHeaders(headers || {});
		if (this.original.writeHead){
			this.original.writeHead(this.$status, this.$headers);
			this.headerSent = true;
		}
		return this;
	},

	write: function(data, encoding){
		if (data) this.puts(data);
		if (this.original.write && this.headerSent){
			this.original.write(this.$body.join(''), encoding);
			this.$body = [];
		}
		return this;
	}

});

Response.prototype.close = Response.prototype.finish;

exports.Response = Response;

})();