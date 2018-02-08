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
import cryptoModule from 'cryptography';
import getTransactionBytes from './getTransactionBytes';

const getTransactionId = transaction => {
	const transactionBytes = getTransactionBytes(transaction);
	const transactionHash = cryptoModule.hash(transactionBytes);
	const bufferFromFirstEntriesReversed = cryptoModule.getFirstEightBytesReversed(
		transactionHash,
	);
	const firstEntriesToNumber = cryptoModule.bufferToBigNumberString(
		bufferFromFirstEntriesReversed,
	);

	return firstEntriesToNumber;
};

export default getTransactionId;
