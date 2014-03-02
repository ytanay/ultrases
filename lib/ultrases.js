/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * Licensed under the MIT license.
 */

'use strict'; // I just hate this thing

var util = require('./util'); // Our utilites

function UltraSES(config){ // Let's start!

	if(!(this instanceof UltraSES)){ // If someone forgot to use new
		return new UltraSES(config); // Make sure they get an instance of UltraSES
	}

	if(config.client){
		this.ses = config.client;
	}else if(config.sdk){
		this.ses = new config.sdk.SES();
	}else {
		var AWS = require('aws-sdk');
		util.checkRequiredParams(config); // Make sure we have the bare minimum for the SDK to initialize
		AWS.config.update(config.aws); // Update the access keys for the SDK
		this.ses = new AWS.SES(); // Expose the SES client 
	}
	
	this.config = {defaults: this._merge(config.defaults, {cc: [], bcc: []})}; // Prepare our defaults. 
}

// Document the rest of this code some other time, even though it's quite self evident.

UltraSES.prototype.send = function(data, done) {
	console.dir(data);
	data = this._merge(data);
	console.dir(data);
	util.checkRequiredParamsSend(data);
	var params = {
		Source: data.from,
		Destination: {
			ToAddresses: (typeof data.to === 'string') ? [data.to] : data.to,
			CcAddresses: data.cc,
			BccAddresses: data.bcc
		},
		Message: {
			Subject: {
				Data: data.subject
			},
			Body: {
				Text: {
					Data: data.text
				},
				Html: {
					Data: data.html
				}
			}
		},
	};
	if(data.replyTo){
		params.ReplyToAddresses = data.replyTo;
	}
	this.ses.sendEmail(params, done);
};

UltraSES.prototype.sendText = function(data, text, done) {
	if(!done){ 
		done = text;
	}
	data.html = data.text = ((typeof text === 'string') ? text : data.text);
	this.send(data, done);
};

UltraSES.prototype.sendHTML = function(data, html, done) {
	if(!done){ 
		done = html;
	}
	if(typeof html === 'string'){
		data.html = html;
	}
	data.text = require('html-to-text').fromString(data.html);
	this.send(data, done);
};

UltraSES.prototype.sendTemplate = function(data, template, done) {
	var top = this;
	template.locals = template.locals || {};

	if(template.contents){
		top.sendHTML(data, require('jade').compile(template.contents)(template.locals), done);
	}else if(template.file && /\.jade$/.test(template.file)){
		require('fs').readFile(template.file, function(err, templateFile){
			top.sendHTML(data, require('jade').compile(templateFile)(template.locals), done);
		});
	} else {
		throw 'you must supply a jade template path or the contents of a jade template';
	}

};

UltraSES.prototype._merge = function(data, defaults) {
	if(!data){
		data = {};
	}
	if(!defaults){ 
		defaults = this.config.defaults;
	}
	for(var prop in defaults){
		if(!data[prop]){
			data[prop] = defaults[prop];
		}
	}
	return data;
};

module.exports = UltraSES;