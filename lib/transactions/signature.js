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
 * Signature module provides functions for creating second signature registration transactions.
 * @class signature
 */

const crypto    = require('./crypto.js');
const constants = require('../constants.js');
const slots     = require('../time/slots.js');

/**
 * @method newSignature
 * @param secondSecret
 *
 * @return {Object}
 */

function newSignature (secondSecret) {
	const {publicKey} = crypto.getKeys(secondSecret);

	const signature = {
		publicKey
	};

	return signature;
}

/**
 * @method createSignature
 * @param secret
 * @param secondSecret
 * @param timeOffset
 *
 * @return {Object}
 */

function createSignature (secret, secondSecret, timeOffset) {
	const now = new Date().getTime();
	const time = timeOffset ? now - timeOffset : now;
	const keys = crypto.getKeys(secret);

	const signature = newSignature(secondSecret);
	const transaction = {
		type: 1,
		amount: 0,
		fee: constants.fees.signature,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(time),
		asset: {
			signature: signature
		}
	};

	crypto.sign(transaction, keys);
	transaction.id = crypto.getId(transaction);

	return transaction;
}

module.exports = {
	createSignature
};
