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
import cryptography from 'lisk-cryptography';

const getAddressAndPublicKeyFromRecipientData = ({
	recipientId,
	recipientPublicKey,
}) => {
	if (recipientPublicKey) {
		const addressFromPublicKey = cryptography.getAddressFromPublicKey(
			recipientPublicKey,
		);
		return { address: addressFromPublicKey, publicKey: recipientPublicKey };
	}

	return { address: recipientId, publicKey: null };
};

export default getAddressAndPublicKeyFromRecipientData;
