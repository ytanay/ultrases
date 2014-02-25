/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * Licensed under the MIT license.
 */

'use strict';

function UltraSES(config){

	checkRequiredParams(config);

	var AWS = require('aws-sdk');
	AWS.config.update(config.aws);

	this.ses = new AWS.SES();
	this.config = {aws: config.aws, defaults: this._merge(config.defaults, {cc: [], bcc: []})};
}

UltraSES.prototype.send = function(data, done) {
	var data = this._typer(this._merge(data));
	checkRequiredParamsSend(data);
	console.dir(data);
	console.dir(this.config)
	return;
	this.ses.sendEmail({
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
		ReplyToAddresses: data.replyTo,
		ReturnPath: data.returnPath
	}, done);
};

UltraSES.prototype.sendHTML = function(data, html, done) {
	var data = this._merge(data);
	data.html = html;
	data.text = require('html-to-text').fromString(html);
	this.send(data, done);
};

UltraSES.prototype.sendTemplate = function(data, template, done) {
	var compiled = require('jade').compile(template.template)(template.locals);
	data.html = compiled;
	data.text = require('html-to-text').fromString(compiled);
	this.send(data, done);
};

UltraSES.prototype._prep = function(data) {
	data = this._merge(data);
	data = this._typer(data);
};

UltraSES.prototype._merge = function(data, defaults) {
	if(!data) data = {};
	if(!defaults) defaults = this.config.defaults;
	for(var prop in defaults){
		if(!data[prop])
			data[prop] = defaults[prop];
	}
	return data;
};

UltraSES.prototype._typer = function(data) {
	var props = {'to': 'array', 'cc': 'array', 'bcc': 'array'};
	for(var prop in props){
		if(typeof data[prop] === 'string') data[prop] = [(data[prop])];
		else if(!Array.isArray(data[prop])) throw new TypeError('\'' + prop + '\' is required and must be of type array or string (did you set a default value?)');
	}
};

function checkRequiredParams(config) {
	if(!config.aws) throw new TypeError('you must pass an AWS config object to the constructor in the form of {accessKeyId, secretAccessKey, region}')
	var required = {'accessKeyId': 'string', 'secretAccessKey': 'string'};
	for(var prop in required)
		if(typeof config.aws[prop] !== required[prop]) throw new TypeError('\'' + prop + '\' must be of type ' + required[prop] + ' (currently ' + typeof config[prop] + ')');
};

function checkRequiredParamsSend(params) {
	var props = {from: 'string', to: 'array', cc: 'array', bcc: 'array', subject: 'string', text: 'string', html: 'string', replyTo: 'array', returnPath: 'string'};
	for(var prop in props){
		if(props[prop] === 'array'){
			if(!Array.isArray(params[prop])) throw new TypeError('\'' + prop + '\' must be of array');
		} else {
			if(typeof params[prop] !== props[prop]) throw new TypeError('\'' + prop + '\' must be of ' + props[prop]);
		}
	}
}

module.exports = UltraSES;