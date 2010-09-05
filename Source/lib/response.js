/*
Script: lib/response.js
	Deck Response class.

Provides:
	- Response : {}

Authors:
	- Mark Obcena

License:
	MIT-Style License

*/

(function(){

var Response = new Class({

	$headers: {},
	$body: [],
	$status: 200,
	original: {},

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

	write: function(data){
		this.$body.push(data);
		return this;
	},

	stream: function(data){
		this.write(data);
		this.flushHeaders().flushBody().resetBody();
		return this;
	},

	resetBody: function(){
		this.$body = [];
		return this;
	},

	setStatus: function(code){
		this.$status = (code * 1);
		return this;
	},

	getStatus: function(){
		return this.$status;
	},

	setEncoding: function(encoding){
		this.$encoding = encoding;
		return this;
	},

	getEncoding: function(){
		return this.$encoding || 'ascii';
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
		if (!this.finished){
			this.flushHeaders().flushBody().close();
			this.finished = true;
		}
		return this.clean();
	},

	'protected flushHeaders': function(){
		var original = this.original;
		if (!this.headerSent) {
			if (original.writeHead) original.writeHead(this.$status, this.$headers);
			this.headerSent = true;
		}
		return this;
	},

	'protected flushBody': function(){
		var original = this.original;
		if (original.writeHead && original.write) original.write(this.$body.join(''), this.getEncoding());
		return this;
	},

	'protected close': function(){
		var original = this.original;
		if (original.end) original.end();
		return this;
	}

});

exports.Response = Response;

})();
