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
 * Vote module provides functions for creating vote transactions.
 * @class vote
 */
import cryptoModule from '../crypto';
import { VOTE_FEE } from '../constants';
import {
	prepareTransaction,
	getTimeWithOffset,
	prependMinusToPublicKeys,
	prependPlusToPublicKeys,
	validatePublicKeys,
} from './utils';

/**
 * @method castVotes
 * @param {Object} Object - Object
 * @param {String} Object.passphrase
 * @param {Array<String>} Object.votes
 * @param {Array<String>} Object.unvotes
 * @param {String} Object.secondPassphrase
 * @param {Number} Object.timeOffset
 *
 * @return {Object}
 */

const castVotes = ({
	passphrase,
	votes = [],
	unvotes = [],
	secondPassphrase,
	timeOffset,
	unsigned,
}) => {
	const senderPublicKey = unsigned
		? null
		: cryptoModule.getKeys(passphrase).publicKey;
	const recipientId = unsigned
		? null
		: cryptoModule.getAddress(senderPublicKey);

	validatePublicKeys([...votes, ...unvotes]);

	const plusPrependedVotes = prependPlusToPublicKeys(votes);
	const minusPrependedUnvotes = prependMinusToPublicKeys(unvotes);

	const allVotes = [...plusPrependedVotes, ...minusPrependedUnvotes];

	const transaction = {
		type: 3,
		amount: '0',
		fee: VOTE_FEE.toString(),
		recipientId,
		senderPublicKey,
		timestamp: getTimeWithOffset(timeOffset),
		asset: {
			votes: allVotes,
		},
	};

	return unsigned
		? transaction
		: prepareTransaction(transaction, passphrase, secondPassphrase);
};

export default castVotes;
