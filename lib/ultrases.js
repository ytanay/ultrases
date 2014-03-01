/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * Licensed under the MIT license.
 */

'use strict';

var util = require('./util');

function UltraSES(config){

	if(!(this instanceof UltraSES))
		return new UltraSES(config);

	util.checkRequiredParams(config);

	var AWS = require('aws-sdk');
	AWS.config.update(config.aws);

	this.ses = new AWS.SES();
	this.config = {aws: config.aws, defaults: this._merge(config.defaults, {cc: [], bcc: []})};
}

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
	if(data.replyTo) params.ReplyToAddresses = data.replyTo;
	this.ses.sendEmail(params, done);
};

UltraSES.prototype.sendHTML = function(data, html, done) {
	data.html = html;
	data.text = require('html-to-text').fromString(html);
	this.send(data, done);
};

UltraSES.prototype.sendTemplate = function(data, template, done) {
	if(!/\.jade$/.test(template.file)){
		throw 'template file must be a jade template.';
		return;
	}

	require('fs').readFile(template.file, function(err, templateFile){
		var compiled = require('jade').compile(templateFile)(template.locals);
		data.html = compiled;
		data.text = require('html-to-text').fromString(compiled);
		this.send(data, done);
	})
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

UltraSES.prototype._typer = function(data) {
	var props = {'to': 'array', 'cc': 'array', 'bcc': 'array'};
	for(var prop in props){
		if(typeof data[prop] === 'string'){
			data[prop] = [(data[prop])];
		}else if(!Array.isArray(data[prop])){
			throw new TypeError('\'' + prop + '\' is required and must be of type array or string (did you set a default value?)');
		}
	}
};

UltraSES.hello = function __UltraSES_hello() {
	return 'awesome';
};

module.exports = UltraSES;