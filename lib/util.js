/*
 * ultrases
 * http://dev.paticon.com/module/ultrases
 *
 * Copyright (c) 2014 Yotam Tanay
 * Licensed under the MIT license.
 */

'use strict';

exports.checkRequiredParams = function checkRequiredParams(config) {
	if(!config.aws){
		throw new TypeError('you must pass an AWS configuration object like {accessKeyId, secretAccessKey, region} OR an intialized AWS SDK object {sdk} OR an intialized SES client object {client}');
	}
	var required = {'accessKeyId': 'string', 'secretAccessKey': 'string', 'region': 'string'};
	for(var prop in required){
		if(typeof config.aws[prop] !== required[prop]){
			throw new TypeError('\'' + prop + '\' must be of type ' + required[prop] + ' (currently ' + typeof config[prop] + ')');
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
					throw new TypeError('\'' + prop + '\' must be of type ' + type);
				}
			}
		}
	};
	console.dir(params);
	var required = {from: 'string', to: 'array', cc: 'array', bcc: 'array', subject: 'string', text: 'string', html: 'string'};
	var optional = {replyTo: 'array', returnPath: 'string'};
	for(var requiredProp in required){
		doCheck(requiredProp, required[requiredProp], params[requiredProp]);
	}
	for(var optionalProp in optional){
		doCheck(optionalProp, optional[optionalProp], params[optionalProp], true);
	}

};
