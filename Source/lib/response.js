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
	origResp: {},

	finished: false,

	initialize: function(resp){
		if (resp) this.origResp = resp;
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
			headers: this.headers,
			body: Array.from(this.body),
			status: (this.status * 1)
		};
	},

	// for node
	sendHeader: function(status, headers){
		this.setStatus(status || this.$status).setHeaders(headers || {});
		if (this.origResp.sendHeader) this.origResp.sendHeader(this.$status, this.$headers);
		return this;
	},

	sendBody: function(data, encoding){
		this.puts(data);
		if (this.origResp.sendBody) {
			this.origResp.sendBody(this.$body.join(''), encoding);
			this.$body = [];
		}
		return this;
	},

	finish: function(){
		if (this.origResp.finish) this.origResp.finish();
		this.finished = true;
		return this.clean();
	}

});

exports.Response = Response;

})();