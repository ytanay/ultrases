/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * yotam@paticon.com | http://people.paticon.com/yotam
 * Licensed under the MIT license.
 */

'use strict';

var REQUIRED_INITIALIZE = { // Required paramaters to initialize client
	accessKeyId: 'string', 
	secretAccessKey: 'string', 
	region: 'string'
}

var REQUIRED_SEND = { // Required paramaters to send email
	from: 'string', 
	to: 'array', 
	cc: 'array', 
	bcc: 'array', 
	subject: 'string', 
	text: 'string', 
	html: 'string'
};

var OPTIONAL_SEND = { // If these are present, they must match the given type
	replyTo: 'array', 
	returnPath: 'string'
};

exports.checkParamsInitialize = function checkParamsInitialize(config) {
	if(!config.aws) {
		throw new TypeError('you must pass an AWS configuration object as {aws: {accessKeyId, secretAccessKey, region}} OR an intialized AWS SDK object {sdk} OR an intialized SES client object {client}');
	}
	for(var prop in REQUIRED_INITIALIZE) { // Iterate of props and match types
		if(typeof config.aws[prop] !== REQUIRED_INITIALIZE[prop]) {
			throw new TypeError('\'' + prop + '\' must be of type ' + required[prop] + ' (currently ' + typeof config[prop] + ')');
		}
	}
};

exports.checkParamsSend = function checkParamsSend(params) {
	var matchTypes = _matchTypes.bind(null, params);
	
	for(var requiredProp in REQUIRED_SEND) {
		matchTypes(requiredProp, REQUIRED_SEND[requiredProp], params[requiredProp]);
	}
	
	for(var optionalProp in OPTIONAL_SEND) {
		matchTypes(optionalProp, OPTIONAL_SEND[optionalProp], params[optionalProp], true);
	}

};

// Match a property field against a given type
function _matchTypes(params, prop, type, value, isOptional) {
	if(isOptional && typeof value === 'undefined') {
		return; 
	}
	
	if(type === 'array') {
		if(!Array.isArray(value)) { // If we require an array but did not recieve one
			params[prop] = [value]; // Wrap it in.
		}
	} else {
		if(typeof value !== type) {
			if(!isOptional) {
				throw new TypeError('\'' + prop + '\' must be of type ' + type);
			}
		}
	}
};
