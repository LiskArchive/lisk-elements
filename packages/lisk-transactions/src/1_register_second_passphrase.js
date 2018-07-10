/*
 * Copyright © 2018 Lisk Foundation
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
import cryptography from 'lisk-cryptography/src';
import { SIGNATURE_FEE } from './constants';
import { wrapTransactionCreator } from './utils';

const registerSecondPassphrase = ({ secondPassphrase }) => {
	const { publicKey } = cryptography.getKeys(secondPassphrase);

	return {
		type: 1,
		fee: SIGNATURE_FEE.toString(),
		asset: {
			signature: {
				publicKey,
			},
		},
	};
};

export default wrapTransactionCreator(registerSecondPassphrase);
