/*
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

var LiskJS = {};
LiskJS.crypto = require('../transactions/crypto');
var parseOfflineRequest = require('./parseTransaction');

var popsicle = require('popsicle');

function LiskAPI (options) {
	if (!(this instanceof LiskAPI)) {
		return new LiskAPI(options);
	}

	options = options || {};

	this.defaultPeers = [
		'node01.lisk.io',
		'node02.lisk.io',
		'node03.lisk.io',
		'node04.lisk.io',
		'node05.lisk.io',
		'node06.lisk.io',
		'node07.lisk.io',
		'node08.lisk.io'
	];

	this.defaultSSLPeers = [
		'login.lisk.io'
	];

	this.defaultTestnetPeers = [
		'83.136.249.129'
	];

	this.options = options;
	this.ssl = options.ssl || false;
	this.randomPeer = (typeof options.randomPeer === 'boolean') ? options.randomPeer : true;
	this.testnet = options.testnet || false;
	this.bannedPeers = [];
	this.currentPeer = options.node || this.selectNode();
	if (options.port === '' || options.port) this.port = options.port;
	else                                    this.port = 8000;
	this.parseOfflineRequests = parseOfflineRequest;
	this.nethash = this.getNethash(options.nethash);
}

LiskAPI.prototype.getNethash = function (nethash) {
	var NetHash;

	if (this.testnet) {
		NetHash = {
			'Content-Type': 'application/json',
			'nethash': 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
			'broadhash': 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
			'os': 'lisk-js-api',
			'version': '1.0.0',
			'minVersion': '>=0.5.0',
			'port': this.port
		};
	} else {
		NetHash = {
			'Content-Type': 'application/json',
			'nethash': 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
			'broadhash': 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
			'os': 'lisk-js-api',
			'version': '1.0.0',
			'minVersion': '>=0.5.0',
			'port': this.port
		};
	}

	if(nethash) {
		NetHash.nethash = nethash;
		NetHash.version = '0.0.0a';
	}

	return NetHash;
};

LiskAPI.prototype.listPeers = function() {

	return {
		official: this.defaultPeers,
		ssl: this.defaultSSLPeers,
		testnet: this.defaultTestnetPeers,
		localhost: [ 'localhost' ]
	};

};

LiskAPI.prototype.setNode = function (node) {
	this.currentPeer = node || this.selectNode();
	return this.currentPeer;
};

LiskAPI.prototype.setTestnet = function (testnet) {
	if (this.testnet !== testnet) {
		this.testnet = testnet;
		this.port = 7000;
		this.selectNode();
	}
};

LiskAPI.prototype.setSSL = function (ssl) {
	if (this.ssl !== ssl) {
		this.ssl = ssl;
		this.selectNode();
	}
};

LiskAPI.prototype.getFullUrl = function () {
	var nodeUrl = this.currentPeer;

	if (this.port) {
		nodeUrl += ':'+this.port;
	}

	return this.getURLPrefix() + '://' + nodeUrl;
};

LiskAPI.prototype.getURLPrefix = function () {
	if (this.ssl) {
		return 'https';
	} else {
		return 'http';
	}
};

LiskAPI.prototype.selectNode = function () {
	var currentRandomPeer;

	if (this.options.node) {
		currentRandomPeer = this.currentPeer;
	}

	if (this.randomPeer) {
		currentRandomPeer = this.getRandomPeer();
		var peers = (this.ssl) ? this.defaultSSLPeers : this.defaultPeers;
		if (this.testnet) peers = this.defaultTestnetPeers;

		for (var x = 0; x< peers.length; x++) {
			if (this.bannedPeers.indexOf(currentRandomPeer) === -1) break;
			currentRandomPeer = this.getRandomPeer();
		}
	}

	return currentRandomPeer;
};

LiskAPI.prototype.getRandomPeer = function () {
	var peers = (this.ssl) ? this.defaultSSLPeers : this.defaultPeers;
	if (this.testnet) peers = this.defaultTestnetPeers;

	var getRandomNumberForPeer = Math.floor((Math.random() * peers.length));
	return peers[getRandomNumberForPeer];
};

LiskAPI.prototype.banNode = function () {
	if (this.bannedPeers.indexOf(this.currentPeer) === -1) this.bannedPeers.push(this.currentPeer);
	this.selectNode();
};

LiskAPI.prototype.sendRequest = function (requestType, options, callback) {
	callback = callback || options;
	options = typeof options !== 'function' && typeof options !== 'undefined' ? options : {};
	var toolBox = this;

	this.sendRequestPromise(requestType, options).then(function (requestSuccess) {
		var JSONAnswer = requestSuccess.body;
		var checkRequestContent = parseOfflineRequest(requestType, options);

		// Show offline Request if it is POST or PUT request
		if (checkRequestContent.requestMethod === 'GET') {
			return callback(requestSuccess.body);
		} else {
			var interpretAnswer = checkRequestContent.transactionOutputAfter(JSONAnswer);
			return callback(interpretAnswer);
		}
	}, function () {
		setTimeout(function () {
			toolBox.banNode();
			toolBox.setNode();
			toolBox.sendRequest(requestType, options, callback);
		}, 1000);
	});
};

LiskAPI.prototype.sendRequestPromise = function (requestType, options) {
	var that = this;

	if (that.checkRequest(requestType, options) !== 'NOACTION') {
		var requestValues = that.changeRequest(requestType, options);
		return this.doPopsicleRequest(requestValues);
	} else {
		return new Promise(function (resolve) {
			resolve({ done: 'done'});
		});
	}
};

LiskAPI.prototype.doPopsicleRequest = function (requestValue) {
	return popsicle.request({
		method: requestValue.requestMethod,
		url: requestValue.requestUrl,
		headers: requestValue.nethash,
		body: requestValue.requestMethod !== 'GET' ? requestValue.requestParams : ''
	}).use(popsicle.plugins.parse(['json', 'urlencoded']));
};

LiskAPI.prototype.changeRequest = function (requestType, options) {
	var returnValue = {
		requestMethod: '',
		requestUrl: '',
		nethash: '',
		requestParams: ''
	};

	var that = this;
	switch(this.checkRequest(requestType, options)) {
	case 'GET':
		returnValue.requestMethod = 'GET';
		returnValue.requestUrl = this.getFullUrl() + '/api/' + requestType;

		if (Object.keys(options).length > 0) {
			returnValue.requestUrl = returnValue.requestUrl + that.serialiseHttpData(options, returnValue.requestMethod);
		}

		returnValue.requestParams = options;
		break;
	case 'PUT':
	case 'POST':
		var transformRequest = parseOfflineRequest(requestType, options).checkOfflineRequestBefore();

		if (transformRequest.requestUrl === 'transactions') {
			returnValue.requestUrl = that.getFullUrl()  + '/peer/'+ transformRequest.requestUrl;

			returnValue.nethash = that.nethash;
			returnValue.requestMethod = 'POST';
			returnValue.requestParams = transformRequest.params;
		} else {
			returnValue.requestUrl = that.getFullUrl()  + '/api/'+ transformRequest.requestUrl;
			returnValue.requestMethod = transformRequest.requestMethod;
			returnValue.requestParams = options;
		}
		break;
	default:
		break;
	}

	return returnValue;
};

LiskAPI.prototype.checkRequest = function (requestType, options) {
	return parseOfflineRequest(requestType, options).requestMethod;
};

LiskAPI.prototype.serialiseHttpData = function (data) {
	var serialised;

	serialised = this.trimObj(data);
	serialised = this.toQueryString(serialised);
	serialised = encodeURI(serialised);

	return '?'+serialised;
};

LiskAPI.prototype.trimObj = function (obj) {
	if (!Array.isArray(obj) && typeof obj !== 'object') return obj;

	return Object.keys(obj).reduce(function (acc, key) {
		acc[key.trim()] = (typeof obj[key] === 'string') ? obj[key].trim() : (Number.isInteger(obj[key])) ? obj[key].toString() : this.trimObj(obj[key]);
		return acc;
	}, Array.isArray(obj)? []:{});
};

LiskAPI.prototype.toQueryString = function (obj) {
	var parts = [];

	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			parts.push(encodeURIComponent(i) + '=' + encodeURI(obj[i]));
		}
	}

	return parts.join('&');
};

LiskAPI.prototype.getAddressFromSecret = function (secret) {
	var accountKeys = LiskJS.crypto.getKeys(secret);
	var accountAddress = LiskJS.crypto.getAddress(accountKeys.publicKey);

	return {
		address: accountAddress,
		publicKey: accountKeys.publicKey
	};
};

LiskAPI.prototype.getAccount = function(address, callback) {
	this.sendRequest('accounts', { address: address }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listActiveDelegates = function (limit, callback) {
	this.sendRequest('delegates/', { limit: limit}, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listStandbyDelegates = function (limit, callback) {
	var standByOffset = +101 + +limit;

	this.sendRequest('delegates/', { limit: limit, orderBy: 'rate:asc', offset: standByOffset}, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.searchDelegateByUsername = function (username, callback) {
	this.sendRequest('delegates/search/', { q: username }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listBlocks = function (amount, callback) {
	this.sendRequest('blocks', { limit: amount }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listForgedBlocks = function (publicKey, callback) {
	this.sendRequest('blocks', { generatorPublicKey: publicKey }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.getBlock = function (block, callback) {
	this.sendRequest('blocks', { height: block }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listTransactions = function (address, limit, offset, callback) {
	offset = offset || '0';
	limit = limit || '20';
	this.sendRequest('transactions', { senderId: address, recipientId: address, limit: limit, offset: offset, orderBy: 'timestamp:desc' }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.getTransaction = function (transactionId, callback) {
	this.sendRequest('transactions/get', { id: transactionId }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listVotes = function (address, callback) {
	this.sendRequest('accounts/delegates', { address: address }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.listVoters = function (publicKey, callback) {
	this.sendRequest('delegates/voters', { publicKey: publicKey }, function (result) {
		return callback(result);
	});
};

LiskAPI.prototype.sendLSK = function (recipient, amount, secret, secondSecret, callback) {
	this.sendRequest('transactions', { recipientId: recipient, amount: amount, secret: secret, secondSecret: secondSecret }, function (response) {
		return callback(response);
	});
};

module.exports = LiskAPI;
