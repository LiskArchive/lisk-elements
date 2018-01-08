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
import cryptoModule from '../../crypto';
import prepareTransaction from './prepareTransaction';
import { getTimeWithOffset } from './time';

const wrapTransactionCreator = transactionCreator => transactionParameters => {
	const {
		passphrase,
		secondPassphrase,
		timeOffset,
		unsigned,
	} = transactionParameters;

	const senderPublicKey = unsigned
		? null
		: cryptoModule.getKeys(passphrase).publicKey;
	const timestamp = getTimeWithOffset(timeOffset);

	const transaction = Object.assign(
		{
			amount: '0',
			recipientId: null,
			senderPublicKey,
			timestamp,
		},
		transactionCreator(transactionParameters),
	);

	return unsigned
		? transaction
		: prepareTransaction(transaction, passphrase, secondPassphrase);
};

export default wrapTransactionCreator;