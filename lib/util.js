/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * yotam@paticon.com | http://people.paticon.com/yotam
 * Licensed under the MIT license.
 */

'use strict';

exports.checkRequiredParams = function checkRequiredParams(config) {
	if(!config.aws){ // I feel bad for throwing errors like this...
		return new TypeError('you must pass an AWS configuration object as {aws: {accessKeyId, secretAccessKey, region}} OR an intialized AWS SDK object {sdk} OR an intialized SES client object {client}');
	}
	var required = {'accessKeyId': 'string', 'secretAccessKey': 'string', 'region': 'string'}; // This is the things we need to talk with AWS
	for(var prop in required){ // Iterate over them
		if(typeof config.aws[prop] !== required[prop]){ // Match the types
			return new TypeError('\'' + prop + '\' must be of type ' + required[prop] + ' (currently ' + typeof config[prop] + ')');
		}
	}
};

exports.checkRequiredParamsSend = function checkRequiredParamsSend(params) {
	var doCheck = function __UltraSES_util_checkRequiredParamsSend_doCheck(prop, type, value, isOptional){
		if(isOptional && typeof value === 'undefined') {
			return; 
		}
		if(type === 'array'){
			if(!Array.isArray(value)){ 
				params[prop] = [value];
			}
		} else {
			if(typeof value !== type){
				if(!isOptional) {
					return new TypeError('\'' + prop + '\' must be of type ' + type);
				}
			}
		}
	};
	var required = {from: 'string', to: 'array', cc: 'array', bcc: 'array', subject: 'string', text: 'string', html: 'string'};
	var optional = {replyTo: 'array', returnPath: 'string'};
	for(var requiredProp in required){
		doCheck(requiredProp, required[requiredProp], params[requiredProp]);
	}
	for(var optionalProp in optional){
		doCheck(optionalProp, optional[optionalProp], params[optionalProp], true);
	}

};
