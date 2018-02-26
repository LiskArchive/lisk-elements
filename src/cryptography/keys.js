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
 * @flow
 *
 */
import { bufferToHex, getAddress } from './convert';
import hash from './hash';

export type KeyPairBytes = {
	privateKey: Uint8Array;
	publicKey: Uint8Array;
}

export type KeyPair = {
	privateKey: string,
	publicKey: string,
}

export type AddressPublicKeyPair = {
	address: string,
	publicKey: string,
}

export const getPrivateAndPublicKeyBytesFromPassphrase = (passphrase: string): KeyPairBytes => {
	const hashed = hash(passphrase, 'utf8');

	const { signSk, signPk } = naclInstance.crypto_sign_seed_keypair(hashed);

	return {
		privateKey: signSk,
		publicKey: signPk,
	};
};

export const getPrivateAndPublicKeyFromPassphrase = (passphrase: string): KeyPair => {
	const { privateKey, publicKey } = getPrivateAndPublicKeyBytesFromPassphrase(
		passphrase,
	);

	return {
		privateKey: bufferToHex(privateKey),
		publicKey: bufferToHex(publicKey),
	};
};

export const getKeys = getPrivateAndPublicKeyFromPassphrase;

export const getAddressAndPublicKeyFromPassphrase = (passphrase: string): AddressPublicKeyPair => {
	const accountKeys = getKeys(passphrase);
	const accountAddress = getAddress(accountKeys.publicKey);

	return {
		address: accountAddress,
		publicKey: accountKeys.publicKey,
	};
};
