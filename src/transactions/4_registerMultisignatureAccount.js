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
import cryptoModule from '../crypto';
import { MULTISIGNATURE_FEE } from '../constants';
import {
	prepareTransaction,
	getTimeWithOffset,
	prependPlusToPublicKeys,
	validateKeysgroup,
} from './utils';
/**
 * @method registerMultisignatureAccount
 * @param {Object} Object - Object
 * @param {String} Object.passphrase
 * @param {String} Object.secondPassphrase
 * @param {Array<String>} Object.keysgroup
 * @param {Number} Object.lifetime
 * @param {Number} Object.minimum
 * @param {Number} Object.timeOffset
 *
 * @return {Object}
 */

const registerMultisignatureAccount = ({
	passphrase,
	secondPassphrase,
	keysgroup,
	lifetime,
	minimum,
	timeOffset,
	unsigned,
}) => {
	const senderPublicKey = unsigned
		? null
		: cryptoModule.getKeys(passphrase).publicKey;

	validateKeysgroup(keysgroup);

	const plusPrependedKeysgroup = prependPlusToPublicKeys(keysgroup);

	const keygroupFees = plusPrependedKeysgroup.length + 1;

	const transaction = {
		type: 4,
		amount: '0',
		fee: (MULTISIGNATURE_FEE * keygroupFees).toString(),
		recipientId: null,
		senderPublicKey,
		timestamp: getTimeWithOffset(timeOffset),
		asset: {
			multisignature: {
				min: minimum,
				lifetime,
				keysgroup: plusPrependedKeysgroup,
			},
		},
	};

	return unsigned
		? transaction
		: prepareTransaction(transaction, passphrase, secondPassphrase);
};

export default registerMultisignatureAccount;
