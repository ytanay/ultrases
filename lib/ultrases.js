/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * Licensed under the MIT license.
 */

'use strict'; 

var util = require('./util');

function UltraSES(config) {

	if(!(this instanceof UltraSES)) { // In case we weren't intialized with `new`
		return new UltraSES(config);
	}

	if(config.client) { // In case we get a SES client
		this.ses = config.client;
	} else if(config.sdk) { // Or a reference to the SDK
		this.ses = new config.sdk.SES();
	} else { // Or just the access keys
		var AWS = require('aws-sdk');
		util.checkRequiredParams(config); // Make sure we have the bare minimum for the SDK to initialize
		AWS.config.update(config.aws); 
		this.ses = new AWS.SES(); 
	}
	
	this.config = {
		defaults: this._merge(config.defaults, {cc: [], bcc: []})
	}; 
}

UltraSES.prototype.send = function(data, done) {
	data = this._merge(data); // Merge this request with our defaults
	var err = util.checkRequiredParamsSend(data)
	if(err){
		return done(err);
	}
	
	var params = {
		Source: data.from, // i.e. `From` address
		Destination: {
			ToAddresses: (typeof data.to === 'string') ? [data.to] : data.to, // Wrap strings in an array if necessary
			CcAddresses: data.cc, // Undefined is acceptable
			BccAddresses: data.bcc 
		},
		Message: {
			Subject: {
				Data: data.subject 
			},
			Body: {
				Text: {
					Data: data.text // A textual representation of the content
				},
				Html: {
					Data: data.html // The HTML version of the content
				}
			}
		},
	};
	
	if(data.replyTo){ // ReplyTo is special, because you can't just give it an empty array and it doesn't accept undefined
		params.ReplyToAddresses = data.replyTo;
	}
	
	this.ses.sendEmail(params, done); // Call SES with our parameters
};

UltraSES.prototype.sendText = function(data, text, done) {
	if(!done) { 
		done = text;
	}
	data.html = data.text = ((typeof text === 'string') ? text : data.text); // If we're sending text, we'll assign that as HTML as well
	this.send(data, done);
};

UltraSES.prototype.sendHTML = function(data, html, done) {
	if(!done) { // Argument mangling
		done = html;
	}
	
	if(typeof html === 'string') {
		data.html = html;
	}
	
	data.text = require('html-to-text').fromString(data.html); // Create a textual representation from our HTMl
	this.send(data, done);
};

UltraSES.prototype.sendTemplate = function(data, template, done) {
	template.locals = template.locals || {}; // If we don't have any locals

	if(template.contents) { // In case we have the Jade template itself
		this.sendHTML(data, require('jade').compile(template.contents)(template.locals), done); // Compile the template and send it as HTML
	} else if(template.file && /\.jade$/.test(template.file)) { // In case we have a filename
		require('fs').readFile(template.file, (err, templateFile) => {
			this.sendHTML(data, require('jade').compile(templateFile)(template.locals), done);
		});
	} else {
		done('ultrases.sendTemplate: you must supply a path or the contents of a jade template');
	}

};

// Merges a property object with given defaults
// ...before underscore was cool
UltraSES.prototype._merge = function(data, defaults) { 
	if(!data){
		data = {};
	}
	if(!defaults){ 
		defaults = this.config.defaults;
	}
	for(var prop in defaults){
		if(defaults.hasOwnProperty(prop)) && !data[prop]){
			data[prop] = defaults[prop];
		}
	}
	return data;
};

module.exports = UltraSES;
