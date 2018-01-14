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

/**
 * LiskAPI module provides functions for interfacing with the Lisk network. Providing mechanisms for:
 *
 * - Retrieval of blockchain data: accounts, blocks, transactions.
 * - Enhancing Lisk security by local signing of transactions and immediate network transmission.
 * - Connecting to Lisk peers or to localhost instance of Lisk core.
 * - Configurable network settings to work in different Lisk environments.
 *
 *     var options = {
 *         ssl: false,
 *         node: '',
 *         randomPeer: true,
 *         testnet: true,
 *         port: '7000',
 *         bannedPeers: [],
 *         nethash: ''
 *     };
 *
 *     var lisk = require('lisk-js');
 *     var LSK = lisk.api(options);
 *
 * @class lisk.api()
 * @main lisk
 */
const popsicle = require('popsicle');
const LiskJS = {
	crypto: require('../transactions/crypto')
};
const parseOfflineRequest = require('./parseTransaction');

function parseResponse (requestType, options, requestSuccess) {
	var parser = parseOfflineRequest(requestType, options);
	return parser.requestMethod === 'GET'
		? requestSuccess.body
		: parser.transactionOutputAfter(requestSuccess.body);
}

function handleTimestampIsInFutureFailures (requestType, options, result) {
	const {success, message} = result;
	const {timeOffset = 0} = options;

	if (!success && message && message.match(/Timestamp is in the future/) && !(timeOffset > 40e3)) {
		var newOptions = {};

		Object.keys(options).forEach( key => {
			newOptions[key] = options[key];
		});
		newOptions.timeOffset = timeOffset + 10e3;

		return this.sendRequest(requestType, newOptions);
	}
	return Promise.resolve(result);
}

function handleSendRequestFailures (requestType, options, error) {
	const that = this;
	if (this.checkReDial()) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				that.banNode();
				that.setNode();
				that.sendRequest(requestType, options)
					.then(resolve, reject);
			}, 1000);
		});
	}
	return Promise.resolve({
		success: false,
		error,
		message: 'could not create http request to any of the given peers'
	});
}

function optionallyCallCallback (callback, result) {
	if (callback && (typeof callback === 'function')) {
		callback(result);
	}
	return result;
}

class LiskAPI {
	constructor(options = {ssl: false, testnet: false}) {
		this.defaultPeers = Array.from(Array(8).keys())
			.map(n => `node0${n + 1}.lisk.io`);
		
		this.defaultSSLPeers = this.defaultPeers;
		
		this.defaultTestnetPeers = [
			'testnet.lisk.io'
		];

		this.options = options;
		this.ssl = options.ssl;
		// Random peer can be set by settings with randomPeer: true | false
		// Random peer is automatically enabled when no options.node has been entered. Else will be set to false
		// If the desired behaviour is to have an own node and automatic peer discovery, randomPeer should be set to true explicitly
		this.randomPeer = (typeof options.randomPeer === 'boolean') ? options.randomPeer : !(options.node);
		this.testnet = options.testnet;
		this.bannedPeers = [];
		this.currentPeer = options.node || this.selectNode();
		this.port = (options.port === '' || options.port) ? options.port : (options.testnet ? 7000 : (options.ssl ? 443 : 8000));
		this.parseOfflineRequests = parseOfflineRequest;
		this.nethash = this.getNethash(options.nethash);
	}

	/**
	 * @method netHashOptions
	 * @return {object}
	 */
	netHashOptions() {
		const testHash = 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
		const mainHash = 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';

		const commonOptions = {
			'Content-Type': 'application/json',
			'os': 'lisk-js-api',
			'version': '1.0.0',
			'minVersion': '>=0.5.0',
			'port': this.port
		};

		return {
			testnet: Object.assign({}, commonOptions, {
				nethash: testHash,
				broadhash: testHash
			}),
			mainnet: Object.assign({}, commonOptions, {
				nethash: mainHash,
				broadhash: mainHash
			})
		};
	}

	/**
	 * @method getNethash
	 * @return {object}
	 */

	getNethash(providedNethash) {
		const NetHash = (this.testnet) ? this.netHashOptions().testnet : this.netHashOptions().mainnet;

		if (providedNethash) {
			NetHash.nethash = providedNethash;
			NetHash.version = '0.0.0a';
		}

		return NetHash;
	}

	/**
	 * @method listPeers
	 * @return {object}
	 */

	listPeers() {
		return {
			official: this.defaultPeers.map( node => ({node}) ),
			ssl: this.defaultSSLPeers.map( node => ({node, ssl: true}) ),
			testnet: this.defaultTestnetPeers.map( node => ({node, testnet: true}) ),
		};
	}
	
	/**
	 * @method setNode
	 * @param node string
	 * @return {object}
	 */

	setNode(node) {
		this.currentPeer = node || this.selectNode();
		return this.currentPeer;
	}

	/**
	 * @method setTestnet
	 * @param testnet boolean
	 */

	setTestnet(testnet) {
		if (this.testnet !== testnet) {
			this.testnet = testnet;
			this.bannedPeers = [];
			this.port = 7000;
			this.selectNode();
		} else {
			this.testnet = false;
			this.bannedPeers = [];
			this.port = 8000;
			this.selectNode();
		}
	}

	/**
	 * @method setSSL
	 * @param ssl boolean
	 */

	setSSL(ssl) {
		if (this.ssl !== ssl) {
			this.ssl = ssl;
			this.bannedPeers = [];
			this.selectNode();
		}
	}

	/**
	 * @method getFullUrl
	 * @return url string
	 */
	
	getFullUrl() {
		let nodeUrl = this.currentPeer;

		if (this.port) {
			nodeUrl += ':' + this.port;
		}

		return this.getURLPrefix() + '://' + nodeUrl;
	}
	
	/**
	 * @method getURLPrefix
	 * @return prefix string
	 */
	
	getURLPrefix() {
		return this.ssl ? 'https' : 'http';
	}
	
	/**
	 * @method selectNode
	 * @return peer string
	 */
	
	selectNode() {
		let currentRandomPeer;
	
		if (this.options.node) {
			currentRandomPeer = this.currentPeer;
		}
	
		if (this.randomPeer) {
			currentRandomPeer = this.getRandomPeer();
			let peers = (this.ssl) ? this.defaultSSLPeers : this.defaultPeers;
			if (this.testnet) peers = this.defaultTestnetPeers;

			for (let x = 0; x< peers.length; x++) {
				if (this.bannedPeers.indexOf(currentRandomPeer) === -1) break;
				currentRandomPeer = this.getRandomPeer();
			}
		}
	
		return currentRandomPeer;
	}

	/**
	 * @method getRandomPeer
	 * @return peer string
	 */

	getRandomPeer() {
		let peers = (this.ssl) ? this.defaultSSLPeers : this.defaultPeers;
		if (this.testnet) peers = this.defaultTestnetPeers;
	
		const getRandomNumberForPeer = Math.floor((Math.random() * peers.length));
		return peers[getRandomNumberForPeer];
	}
	
	/**
	 * @method banNode
	 */
	
	banNode() {
		if (this.bannedPeers.indexOf(this.currentPeer) === -1) this.bannedPeers.push(this.currentPeer);
		this.selectNode();
	}

	/**
	 * @method checkReDial
	 * @return reDial boolean
	 */
	
	checkReDial() {
		let peers = (this.ssl) ? this.defaultSSLPeers : this.defaultPeers;
		if (this.testnet) peers = this.defaultTestnetPeers;
	
		let reconnect = true;
	
		// RandomPeer discovery explicitly set
		if (this.randomPeer === true) {
			// A nethash has been set by the user. This influences internal redirection
			if (this.options.nethash) {
				// Nethash is equal to testnet nethash, we can proceed to get testnet peers
				if (this.options.nethash === this.netHashOptions().testnet.nethash) {
					this.setTestnet(true);
					reconnect = true;
				// Nethash is equal to mainnet nethash, we can proceed to get mainnet peers
				} else if (this.options.nethash === this.netHashOptions().mainnet.nethash) {
					this.setTestnet(false);
					reconnect = true;
				// Nethash is neither mainnet nor testnet, do not proceed to get peers
				} else {
					reconnect = false;
				}
			// No nethash set, we can take the usual approach, just when there are not-banned peers, take one
			} else {
				reconnect = (peers.length !== this.bannedPeers.length);
			}
		// RandomPeer is not explicitly set, no peer discovery
		} else {
			reconnect = false;
		}
	
		return reconnect;
	}
	
	/**
	 * @method checkOptions
	 * @return options object
	 */
	
	checkOptions(options) {
		Object.keys(options).forEach( optionKey => {
			if (options[optionKey] === undefined || options[optionKey] !== options[optionKey]) {
				throw { message: `parameter value "${optionKey}" should not be ${options[optionKey]}` };
			}
		});

		return options;
	}
	
	/**
	 * @method sendRequest
	 * @param requestType
	 * @param options
	 * @param callback
	 *
	 * @return APIanswer Object
	 */
	
	sendRequest(requestType, options, callback) {
		callback = callback || options;
		options = typeof options !== 'function' && typeof options !== 'undefined' ? this.checkOptions(options) : {};
	
		return this.sendRequestPromise(requestType, options)
			.then(parseResponse.bind(this, requestType, options))
			.then(handleTimestampIsInFutureFailures.bind(this, requestType, options))
			.catch(handleSendRequestFailures.bind(this, requestType, options))
			.then(optionallyCallCallback.bind(this, callback));
	}
	
	/**
	 * @method sendRequestPromise
	 * @param requestType
	 * @param options
	 *
	 * @return APIcall Promise
	 */
	
	sendRequestPromise(requestType, options) {
		if (this.checkRequest(requestType, options) !== 'NOACTION') {
			const requestValues = this.changeRequest(requestType, options);
			return this.doPopsicleRequest(requestValues);
		} else {
			return new Promise((resolve) => {
				resolve({ done: 'done'});
			});
		}
	}

	/**
	 * @method doPopsicleRequest
	 * @param requestValue
	 *
	 * @return APIcall Promise
	 */
	
	doPopsicleRequest(requestValue) {
		return popsicle.request({
			method: requestValue.requestMethod,
			url: requestValue.requestUrl,
			headers: requestValue.nethash,
			body: requestValue.requestMethod !== 'GET' ? requestValue.requestParams : ''
		}).use(popsicle.plugins.parse(['json', 'urlencoded']));
	}
	
	/**
	 * @method doPopsicleRequest
	 * @param requestType
	 * @param options
	 *
	 * @return httpRequest object
	 */
	
	changeRequest(requestType, options) {
		const returnValue = {
			requestMethod: '',
			requestUrl: '',
			nethash: '',
			requestParams: ''
		};
	
		//const that = this;
		switch(this.checkRequest(requestType, options)) {
		case 'GET':
			returnValue.requestMethod = 'GET';
			returnValue.requestUrl = this.getFullUrl() + '/api/' + requestType;
	
			if (Object.keys(options).length > 0) {
				returnValue.requestUrl = returnValue.requestUrl + this.serialiseHttpData(options, returnValue.requestMethod);
			}
	
			returnValue.requestParams = options;
			break;
		case 'PUT':
		case 'POST':
			const transformRequest = parseOfflineRequest(requestType, options).checkOfflineRequestBefore();
	
			if (transformRequest.requestUrl === 'transactions' || transformRequest.requestUrl === 'signatures') {
				returnValue.requestUrl = this.getFullUrl()  + '/peer/'+ transformRequest.requestUrl;
	
				returnValue.nethash = this.nethash;
				returnValue.requestMethod = 'POST';
				returnValue.requestParams = transformRequest.params;
			} else {
				returnValue.requestUrl = this.getFullUrl()  + '/api/'+ transformRequest.requestUrl;
				returnValue.requestMethod = transformRequest.requestMethod;
				returnValue.requestParams = options;
			}
			break;
		default:
			break;
		}
	
		return returnValue;
	}
	
	/**
	 * @method checkRequest
	 * @param requestType
	 * @param options
	 *
	 * @return method string
	 */
	
	checkRequest(requestType, options) {
		return parseOfflineRequest(requestType, options).requestMethod;
	}
	
	/**
	 * @method serialiseHttpData
	 * @param data
	 *
	 * @return serialisedData string
	 */
	
	serialiseHttpData(data) {
		return '?' + [this.trimObj, this.toQueryString, encodeURI]
			.reduce((acc, fn) => fn(acc), data);
		// var serialised;
	
		// serialised = this.trimObj(data);
		// serialised = this.toQueryString(serialised);
		// serialised = encodeURI(serialised);
	
		// return '?'+serialised;
	}
	
	/**
	 * @method trimObj
	 * @param obj
	 *
	 * @return trimmed string
	 */
	
	trimObj(obj) {
		if (!Array.isArray(obj) && typeof obj !== 'object') return obj;
	
		return Object.keys(obj).reduce((acc, key) => {
			acc[key.trim()] = (typeof obj[key] === 'string') ? obj[key].trim() : (Number.isInteger(obj[key])) ? obj[key].toString() : this.trimObj(obj[key]);
			return acc;
		}, Array.isArray(obj)? []:{});
	}

	/**
	 * @method toQueryString
	 * @param obj
	 *
	 * @return query string
	 */
	
	toQueryString(obj) {
		const parts = [];

		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				parts.push(encodeURIComponent(i) + '=' + encodeURI(obj[i]));
			}
		}
	
		return parts.join('&');
	}
	
	/**
	 * @method getAddressFromSecret
	 * @param secret
	 *
	 * @return keys object
	 */
	
	getAddressFromSecret(secret) {
		const accountKeys = LiskJS.crypto.getKeys(secret);
		const accountAddress = LiskJS.crypto.getAddress(accountKeys.publicKey);
	
		return {
			address: accountAddress,
			publicKey: accountKeys.publicKey
		};
	}

	/**
	 * @method getAccount
	 * @param address
	 * @param callback
	 *
	 * @return API object
	 */
	
	getAccount(address, callback) {
		return this.sendRequest('accounts', { address }, callback);
	}
	
	/**
	 * @method listActiveDelegates
	 * @param limit
	 * @param callback
	 *
	 * @return API object
	 */
	
	listActiveDelegates(limit, callback) {
		this.sendRequest('delegates/', { limit }, callback);
	}
	
	/**
	 * @method listStandbyDelegates
	 * @param limit
	 * @param callback
	 *
	 * @return API object
	 */
	
	listStandbyDelegates(limit, callback) {
		const standByOffset = 101;
	
		this.sendRequest(
			'delegates/',
			{ limit, orderBy: 'rate:asc', offset: standByOffset },
			callback
		);
	}
	
	/**
	 * @method searchDelegateByUsername
	 * @param username
	 * @param callback
	 *
	 * @return API object
	 */
	
	searchDelegateByUsername(username, callback) {
		this.sendRequest('delegates/search/', { q: username }, callback);
	}
	
	/**
	 * @method listBlocks
	 * @param amount
	 * @param callback
	 *
	 * @return API object
	 */
	
	listBlocks(amount, callback) {
		this.sendRequest('blocks', { limit: amount }, callback);
	}
	
	/**
	 * @method listForgedBlocks
	 * @param publicKey
	 * @param callback
	 *
	 * @return API object
	 */
	
	listForgedBlocks(publicKey, callback) {
		this.sendRequest('blocks', { generatorPublicKey: publicKey }, callback);
	}
	
	/**
	 * @method getBlock
	 * @param block
	 * @param callback
	 *
	 * @return API object
	 */
	
	getBlock(block, callback) {
		this.sendRequest('blocks', { height: block }, callback);
	}
	
	/**
	 * @method listTransactions
	 * @param address
	 * @param limit
	 * @param offset
	 * @param callback
	 *
	 * @return API object
	 */
	
	listTransactions(address, limit = '20', offset = '0', callback) {
		this.sendRequest(
			'transactions', 
			{ senderId: address, recipientId: address, limit, offset, orderBy: 'timestamp:desc' },
			callback
		);
	}
	
	/**
	 * @method getTransaction
	 * @param transactionId
	 * @param callback
	 *
	 * @return API object
	 */
	
	getTransaction(transactionId, callback) {
		this.sendRequest('transactions/get', { id: transactionId }, callback);
	}
	
	/**
	 * @method listVotes
	 * @param address
	 * @param callback
	 *
	 * @return API object
	 */
	
	listVotes(address, callback) {
		this.sendRequest('accounts/delegates', { address }, callback);
	}
	
	/**
	 * @method listVoters
	 * @param publicKey
	 * @param callback
	 *
	 * @return API object
	 */
	
	listVoters(publicKey, callback) {
		this.sendRequest('delegates/voters', { publicKey }, callback);
	}
	
	/**
	 * @method sendLSK
	 * @param recipient
	 * @param amount
	 * @param secret
	 * @param secondSecret
	 * @param callback
	 *
	 * @return API object
	 */
	
	sendLSK(recipient, amount, secret, secondSecret, callback) {
		this.sendRequest(
			'transactions',
			{ recipientId: recipient, amount, secret, secondSecret },
			callback
		);
	}
	
	/**
	 * @method listMultisignatureTransactions
	 * @param callback
	 *
	 * @return API object
	 */
	
	listMultisignatureTransactions(callback) {
		this.sendRequest('transactions/multisignatures', callback);
	}
	
	/**
	 * @method getMultisignatureTransaction
	 * @param transactionId
	 * @param callback
	 *
	 * @return API object
	 */
	
	getMultisignatureTransaction(transactionId, callback) {
		this.sendRequest('transactions/multisignatures/get', { id: transactionId }, callback);
	}
}

// TODO: Fix after updating introduce bracking changes.
// temporary workaround to not introduce bracking changes.
// LiskAPI is expected to be called without new keyword. But it throws in ES2015.
module.exports = function LiskAPIFactory(options) {
	if (!(this instanceof LiskAPIFactory)) {
		return new LiskAPI(options);
	}
	return new LiskAPI(options);
};
