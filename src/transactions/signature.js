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
import crypto from '../crypto';
import constants from '../constants';
import slots from '../time/slots';
import { prepareTransaction } from './utils';

/**
 * @method newSignature
 * @param secondSecret
 *
 * @return {Object}
 */

function newSignature(secondSecret) {
	const { publicKey } = crypto.getKeys(secondSecret);
	return { publicKey };
}

/**
 * @method createSignature
 * @param secret
 * @param secondSecret
 * @param timeOffset
 *
 * @return {Object}
 */

function createSignature(secret, secondSecret, timeOffset) {
	const keys = crypto.getKeys(secret);

	const signature = newSignature(secondSecret);
	const transaction = {
		type: 1,
		amount: 0,
		fee: constants.fees.signature,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTimeWithOffset(timeOffset),
		asset: {
			signature,
		},
	};

	return prepareTransaction(transaction, keys, secondSecret);
}

module.exports = {
	createSignature,
};
