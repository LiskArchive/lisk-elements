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
import bignum from 'browserify-bignum';
import { MAX_ADDRESS_NUMBER } from 'lisk-constants/src';
import { hexToBuffer } from 'lisk-cryptography/src/convert';

export const validatePublicKey = publicKey => {
	const publicKeyBuffer = hexToBuffer(publicKey);
	if (publicKeyBuffer.length !== 32) {
		throw new Error(
			`Public key ${
				publicKey
			} length differs from the expected 32 bytes for a public key.`,
		);
	}
	return true;
};

export const checkPublicKeysForDuplicates = publicKeys =>
	publicKeys.every((element, index) => {
		const elementFound = publicKeys.slice(index + 1).indexOf(element);
		if (elementFound > -1) {
			throw new Error(`Duplicated public key: ${publicKeys[index]}.`);
		}
		return true;
	});

export const validatePublicKeys = publicKeys =>
	publicKeys.every(validatePublicKey) &&
	checkPublicKeysForDuplicates(publicKeys);

export const validateKeysgroup = keysgroup => {
	if (keysgroup.length === 0 || keysgroup.length > 16) {
		throw new Error('Expected between 1 and 16 public keys in the keysgroup.');
	}
	return validatePublicKeys(keysgroup);
};

export const validateAddress = address => {
	if (address.length < 2 || address.length > 22) {
		throw new Error(
			'Address length does not match requirements. Expected between 2 and 22 characters.',
		);
	}

	if (address[address.length - 1] !== 'L') {
		throw new Error(
			'Address format does not match requirements. Expected "L" at the end.',
		);
	}

	const addressAsBignum = bignum(address.slice(0, -1));

	if (addressAsBignum.cmp(bignum(MAX_ADDRESS_NUMBER)) > 0) {
		throw new Error(
			'Address format does not match requirements. Address out of maximum range.',
		);
	}

	return true;
};
