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

const Buffer = require('buffer/').Buffer;
const {fromBuffer} = require('browserify-bignum');

const {getSha256Hash} = require('./hash');
const {bufferToHex, useFirstEightBufferEntriesReversed} = require('./convert');

function getPrivateAndPublicKeyFromSecret (secret) {
	const sha256Hash = getSha256Hash(secret, 'utf8');
	const {signSk, signPk} = naclInstance.crypto_sign_seed_keypair(sha256Hash);

	return {
		privateKey: bufferToHex(Buffer.from(signSk)),
		publicKey: bufferToHex(Buffer.from(signPk))
	};
}

function getRawPrivateAndPublicKeyFromSecret (secret) {
	const sha256Hash = getSha256Hash(secret, 'utf8');
	const {signSk, signPk} = naclInstance.crypto_sign_seed_keypair(sha256Hash);

	return {
		privateKey: signSk,
		publicKey: signPk
	};
}

function getAddressFromPublicKey (publicKey) {
	const publicKeyHash = getSha256Hash(publicKey, 'hex');

	const publicKeyTransform = useFirstEightBufferEntriesReversed(publicKeyHash);
	const address = fromBuffer(publicKeyTransform).toString() + 'L';

	return address;
}

module.exports = {
	getKeypair: getPrivateAndPublicKeyFromSecret,
	getPrivateAndPublicKeyFromSecret,
	getRawPrivateAndPublicKeyFromSecret,
	getAddressFromPublicKey
};
