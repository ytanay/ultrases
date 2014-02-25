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
		throw new TypeError('you must pass an AWS config object to the constructor in the form of {accessKeyId, secretAccessKey, region}');
	}
	var required = {'accessKeyId': 'string', 'secretAccessKey': 'string'};
	for(var prop in required){
		if(typeof config.aws[prop] !== required[prop]){
			throw new TypeError('\'' + prop + '\' must be of type ' + required[prop] + ' (currently ' + typeof config[prop] + ')');
		}
	}
};

exports.checkRequiredParamsSend = function checkRequiredParamsSend(params) {
	var props = {from: 'string', to: 'array', cc: 'array', bcc: 'array', subject: 'string', text: 'string', html: 'string', replyTo: 'array', returnPath: 'string'};
	for(var prop in props){
		if(props[prop] === 'array'){
			if(!Array.isArray(params[prop])){ 
				throw new TypeError('\'' + prop + '\' must be of array');
			}
		} else {
			if(typeof params[prop] !== props[prop]){
				throw new TypeError('\'' + prop + '\' must be of ' + props[prop]);
			}
		}
	}
};
