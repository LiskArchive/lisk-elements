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

const LiskJS = {};
LiskJS.crypto = require('../transactions/crypto');
LiskJS.dapp = require('../transactions/dapp');
LiskJS.multisignature = require('../transactions/multisignature');
LiskJS.signature = require('../transactions/signature');
LiskJS.delegate = require('../transactions/delegate');
LiskJS.transaction = require('../transactions/transaction');
LiskJS.transfer = require('../transactions/transfer');
LiskJS.vote = require('../transactions/vote');

/**
 * ParseOfflineRequest module provides automatic routing of new transaction requests which can be signed locally, and then broadcast without any passphrases being transmitted.
 *
 * @method ParseOfflineRequest
 * @param requestType
 * @param options
 * @main lisk
 */

class ParseOfflineRequest {
	constructor(requestType, options) {
		this.requestType = requestType;
		this.options = options;
		this.requestMethod = this.httpGETPUTorPOST(requestType);
		this.params = '';

		return this;
	}

	/**
	 * @method checkDoubleNamedAPI
	 * @param requestType string
	 * @param options
	 * @return string
	 */

	checkDoubleNamedAPI(requestType, options) {
		if (requestType === 'transactions' || requestType === 'accounts/delegates') {
			if (options && !options.hasOwnProperty('secret')) {
				requestType = 'getTransactions';
			}
		}

		return requestType;
	}

	/**
	 * @method httpGETPUTorPOST
	 * @param requestType string
	 * @return string
	 */

	httpGETPUTorPOST(requestType) {
		requestType = this.checkDoubleNamedAPI(requestType, this.options);

		let requestMethod;
		const requestIdentification = {
			'accounts/open': 'POST',
			'accounts/generatePublicKey': 'POST',
			'delegates/forging/enable': 'NOACTION',
			'delegates/forging/disable': 'NOACTION',
			'dapps/install': 'NOACTION',
			'dapps/uninstall': 'NOACTION',
			'dapps/launch': 'NOACTION',
			'dapps/stop': 'NOACTION',
			'multisignatures/sign': 'POST',
			'accounts/delegates': 'PUT',
			'transactions': 'PUT',
			'signatures': 'PUT',
			'delegates': 'PUT',
			'dapps': 'PUT',
			'multisignatures': 'POST'
		};

		if (!requestIdentification[requestType]) {
			requestMethod = 'GET';
		} else {
			requestMethod = requestIdentification[requestType];
		}

		return requestMethod;
	}

	/**
	 * @method checkOfflineRequestBefore
	 *
	 * @return {object}
	 */

	checkOfflineRequestBefore() {
		let accountKeys;
		let accountAddress;

		if (this.options && this.options.hasOwnProperty('secret')) {
			accountKeys = LiskJS.crypto.getKeys(this.options['secret']);
			accountAddress = LiskJS.crypto.getAddress(accountKeys.publicKey);
		}

		const OfflineRequestThis = this;
		const requestIdentification = {
			'accounts/open': () => ({
				requestMethod: 'GET',
				// What should happen if accountAddress is undefined?
				requestUrl: 'accounts?address='+accountAddress
			}),
			'accounts/generatePublicKey': () => ({
				requestMethod: 'GET',
				// What should happen if accountAddress is undefined?
				requestUrl: 'accounts?address='+accountAddress
			}),
			'delegates/forging/enable': 'POST',
			'delegates/forging/disable': 'POST',
			'dapps/install': 'POST',
			'dapps/uninstall': 'POST',
			'dapps/launch': 'POST',
			'dapps/stop': 'POST',
			'multisignatures/sign': function () {
				const { transaction, secret } = OfflineRequestThis.options;
				const signature = LiskJS.multisignature.signTransaction(transaction, secret);

				return {
					requestMethod: 'POST',
					requestUrl: 'signatures',
					params: { signature }
				};
			},
			'accounts/delegates': () => {
				const { secret, delegates, secondSecret, timeOffset } = OfflineRequestThis.options;
				const transaction = LiskJS.vote
					.createVote(secret, delegates, secondSecret, timeOffset);

				return {
					requestMethod: 'POST',
					requestUrl: 'transactions',
					params: { transaction }
				};
			},
			'transactions': () => {
				const {recipientId, amount, secret, secondSecret, timeOffset} = OfflineRequestThis.options;
				const transaction = LiskJS.transaction
					.createTransaction(recipientId, amount, secret, secondSecret, timeOffset);

				return {
					requestMethod: 'POST',
					requestUrl: 'transactions',
					params: { transaction }
				};
			},
			'signatures': () => {
				const {secret, secondSecret, timeOffset} = OfflineRequestThis.options;
				const transaction = LiskJS.signature.createSignature(secret, secondSecret, timeOffset);

				return {
					requestMethod: 'POST',
					requestUrl: 'transactions',
					params: { transaction }
				};
			},
			'delegates': () => {
				const {secret, username, secondSecret, timeOffset} = OfflineRequestThis.options;
				const transaction = LiskJS.delegate.createDelegate(secret, username, secondSecret, timeOffset);

				return {
					requestMethod: 'POST',
					requestUrl: 'transactions',
					params: { transaction }
				};
			},
			'dapps': () => {
				const options = OfflineRequestThis.options;
				const DappOptions = {
					category: options['category'],
					name: options['name'],
					description: options['description'],
					tags: options['tags'],
					type: options['type'],
					link: options['link'],
					icon: options['icon'],
					secret: options['secret'],
					secondSecret: options['secondSecret']
				};

				const transaction = LiskJS.dapp.createDapp(DappOptions);

				return {
					requestMethod: 'POST',
					requestUrl: 'transactions',
					params: { transaction }
				};
			},
			'multisignatures': () => {
				const {secret, secondSecret, keysgroup, lifetime, min} = OfflineRequestThis.options;
				const transaction = LiskJS.multisignature.createMultisignature(secret, secondSecret, keysgroup, lifetime, min);

				return {
					requestMethod: 'POST',
					requestUrl: 'transactions',
					params: { transaction }
				};
			}
		};

		return requestIdentification[this.requestType]();
	}

	/**
	 * @method transactionOutputAfter
	 * @param requestAnswer
	 *
	 * @return {object}
	 */

	transactionOutputAfter(requestAnswer) {
		let accountKeys;
		let accountAddress;

		if (this.options['secret']) {
			accountKeys = LiskJS.crypto.getKeys(this.options['secret']);
			accountAddress = LiskJS.crypto.getAddress(accountKeys.publicKey);
		}
		// TODO: Get better name for it
		const unsuccessful = msg => () => ({
			'success': 'false',
			'error': msg
		});

		let transformAnswer;
		const requestIdentification =  {
			'accounts/open': () => {
				if (requestAnswer.error === 'Account not found') {
					transformAnswer = {
						success: 'true',
						'account': {
							// what if it's undefined?
							'address': accountAddress,
							'unconfirmedBalance': '0',
							'balance': '0',
							'publicKey': accountKeys.publicKey,
							'unconfirmedSignature': '0',
							'secondSignature': '0',
							'secondPublicKey': null,
							'multisignatures': null,
							'u_multisignatures': null
						}
					};
				} else {
					transformAnswer = requestAnswer;
				}

				return transformAnswer;
			},
			'accounts/generatePublicKey': () => ({
				'success': 'true',
				'publicKey': accountKeys.publicKey
			}),
			'delegates/forging/enable': unsuccessful('Forging not available via offlineRequest'),
			'delegates/forging/disable': unsuccessful('Forging not available via offlineRequest'),
			'dapps/install': unsuccessful('Install dapp not available via offlineRequest'),
			'dapps/uninstall': unsuccessful('Uninstall dapp not available via offlineRequest'),
			'dapps/launch': unsuccessful('Launch dapp not available via offlineRequest'),
			'dapps/stop': unsuccessful('Stop dapp not available via offlineRequest'),
			'multisignatures/sign': () => requestAnswer,
			'accounts/delegates': () => requestAnswer,
			'transactions': () => requestAnswer,
			'signatures': () => requestAnswer,
			'delegates': () => requestAnswer,
			'dapps': () => requestAnswer,
			'multisignatures': () => requestAnswer,
		};

		return requestIdentification[this.requestType]();
	}
}

// TODO: Fix after updating introduce bracking changes.
// temporary workaround to not introduce bracking changes.
// ParseOfflineRequest is expected to be called without new keyword. But it throws in ES2015.
module.exports = function ParseOfflineRequestFactory(requestType, options) {
	if (!(this instanceof ParseOfflineRequestFactory)) {
		return new ParseOfflineRequest(requestType, options);
	}
	return new ParseOfflineRequest(requestType, options);
};
