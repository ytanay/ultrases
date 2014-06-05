/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * yotam@paticon.com | http://people.paticon.com/yotam
 * Licensed under the MIT license.
 */

'use strict'; // I just hate this thing

var util = require('./util');

function UltraSES(config){ // Let's start!

	if(!(this instanceof UltraSES)){ // Did you forget to use `new`?
		return new UltraSES(config); // Make sure they get an instance of UltraSES
	}

	if(config.client){
		this.ses = config.client; // Sometimes people pass in an initialized client
	}else if(config.sdk){ 
		this.ses = new config.sdk.SES(); // Other times they give as an instance of AWS
	}else{
		var AWS = require('aws-sdk'); // And sometimes they just pass in the keys
		util.checkRequiredParams(config); // Make sure we have the bare minimum for the SDK to initialize
		AWS.config.update(config.aws); // Update the access keys for the SDK
		this.ses = new AWS.SES(); // Expose the SES client 
	}
	
	this.config = { // Prepare our defaults. 
		defaults: this._merge(config.defaults, {cc: [], bcc: []})
	}; 
}

UltraSES.prototype.send = function(data, done) {
	// We get a bunch of parameters and a callback
	// TODO: add encoding options
	data = this._merge(data); // Merge the properties with our defaults
	util.checkRequiredParamsSend(data); //Verify we have enough to send an email
	var params = {
		Source: data.from, // `From` address
		Destination: {
			ToAddresses: (typeof data.to === 'string') ? [data.to] : data.to, // Wrap strings in an array if necessary
			CcAddresses: data.cc, // This is automatically set to an empty array
			BccAddresses: data.bcc // And so is this one
		},
		Message: {
			Subject: {
				Data: data.subject // The email's subject
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
	
	if(data.replyTo){ // ReplyTo is special, because I can't just dump an empty array
		params.ReplyToAddresses = data.replyTo; // So we get this mess instead
	}
	
	this.ses.sendEmail(params, done); // Call SES with our parameters
};

UltraSES.prototype.sendText = function(data, text, done) {
	if(!done){ 
		done = text;
	}
	data.html = data.text = ((typeof text === 'string') ? text : data.text); // If we're sending text, we'll assign that as HTML as well
	this.send(data, done); // Call our main sending method
};

UltraSES.prototype.sendHTML = function(data, html, done) {
	if(!done){ // Jumble around our arguments
		done = html;
	}
	if(typeof html === 'string'){
		data.html = html; // Bring in our HTMLl
	}
	data.text = require('html-to-text').fromString(data.html); // Create a textual representation from our HTMl
	this.send(data, done);
};

UltraSES.prototype.sendTemplate = function(data, template, done) {
	var top = this; // Keep a "closure'd" reference to this instance
	template.locals = template.locals || {}; // If we don't have any locals

	if(template.contents){ // We already have the Jade template itself
		top.sendHTML(data, require('jade').compile(template.contents)(template.locals), done); // Compile the template and send it as HTML
	}else if(template.file && /\.jade$/.test(template.file)){ // We have a file name, so test it to see if it looks like a Jade file
		require('fs').readFile(template.file, function(err, templateFile){ // Read the file
			top.sendHTML(data, require('jade').compile(templateFile)(template.locals), done); // Compile as HTML and send it as HTML
		});
	} else {
		done('ultrases.sendTemplate: you must supply a path or the contents of a jade template'); // This error message is way too long.
	}

};

UltraSES.prototype._merge = function(data, defaults) { // If only I brought in Underscore...
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
