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
 * Dapp module provides functions used to create dapp registration transactions.
 * @class dapp
 */

const crypto    = require('./crypto.js');
const constants = require('../constants.js');
const slots     = require('../time/slots.js');

/**
 * @method createDapp
 * @param secret
 * @param secondSecret
 * @param options
 * @param timeOffset
 *
 * @return {Object}
 */

function createDapp (secret, secondSecret, options, timeOffset) {
	const now = new Date().getTime();
	const time = timeOffset ? now - timeOffset : now;
	const keys = crypto.getKeys(secret);

	const transaction = {
		type: 5,
		amount: 0,
		fee: constants.fees.dapp,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(time),
		asset: {
			dapp: {
				category: options.category,
				name: options.name,
				description: options.description,
				tags: options.tags,
				type: options.type,
				link: options.link,
				icon: options.icon
			}
		}
	};

	crypto.sign(transaction, keys);

	if (secondSecret) {
		const secondKeys = crypto.getKeys(secondSecret);
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);
	return transaction;
}

module.exports = {
	createDapp: createDapp
};
