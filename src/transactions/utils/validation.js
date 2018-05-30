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
import {
	MAX_ADDRESS_NUMBER,
	MAX_TIMESTAMP,
	MAX_TRANSACTION_AMOUNT,
	MAX_TRANSACTION_ID,
} from 'lisk-constants';
import { hexToBuffer } from 'cryptography/convert';
import {
	TRANSFER_FEE,
	IN_TRANSFER_FEE,
	OUT_TRANSFER_FEE,
	SIGNATURE_FEE,
	DELEGATE_FEE,
	VOTE_FEE,
	MULTISIGNATURE_FEE,
	DAPP_FEE,
	MAX_TRANSACTION_DATA_BYTES,
} from '../constants';

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

export const validateSignature = signature => {
	const signatureBuffer = hexToBuffer(signature);
	if (signatureBuffer.length !== 64) {
		throw new Error(
			`Signature ${
				signature
			} length differs from the expected 64 bytes for a public key.`,
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

const FEES = [
	TRANSFER_FEE,
	// SIGNATURE_FEE,
	// DELEGATE_FEE,
	// VOTE_FEE,
	// MULTISIGNATURE_FEE,
	// DAPP_FEE,
];

export const validateTransactionSchema = transaction => {
	if (
		!(
			transaction &&
			typeof transaction === 'object' &&
			!Array.isArray(transaction)
		)
	) {
		throw new Error('Transaction must be an object');
	}
	const {
		type,
		amount,
		senderPublicKey,
		timestamp,
		signature,
		signSignature,
		id,
		fee,
		recipientId,
		recipientPublicKey,
		asset,
	} = transaction;
	if (![0, 1, 2, 3, 4, 5].includes(type)) {
		throw new Error('Transaction type must be an integer between 0 and 5');
	}
	if (
		typeof amount !== 'string' ||
		!amount.match(/^[0-9]+$/) ||
		bignum(amount).cmp(bignum(MAX_TRANSACTION_AMOUNT)) > 0
	) {
		throw new Error(
			'Transaction amount must be a string integer between 0 and 18446744073709551615',
		);
	}
	try {
		validatePublicKey(senderPublicKey);
	} catch (error) {
		throw new Error('Transaction must include a valid senderPublicKey');
	}
	if (
		typeof timestamp !== 'number' ||
		parseInt(timestamp, 10) !== timestamp ||
		timestamp < 0 ||
		timestamp > MAX_TIMESTAMP
	) {
		throw new Error('Transaction must include a valid timestamp');
	}
	try {
		validateSignature(signature);
	} catch (error) {
		throw new Error('Transaction must include a valid signature');
	}
	if (![null, undefined].includes(signSignature)) {
		try {
			validateSignature(signSignature);
		} catch (error) {
			throw new Error('Transaction has an invalid signSignature');
		}
	}
	if (
		typeof id !== 'string' ||
		!id.match(/^[0-9]+$/) ||
		bignum(id).cmp(bignum(MAX_TRANSACTION_ID)) > 0
	) {
		throw new Error('Transaction must include a valid id');
	}
	if (fee !== FEES[type].toString()) {
		throw new Error('Type 0 transactions must have a fee of 0.1 LSK');
	}
	try {
		validateAddress(recipientId);
	} catch (error) {
		throw new Error('Transaction must include a valid recipientId');
	}
	if (![null, undefined].includes(recipientPublicKey)) {
		try {
			validatePublicKey(recipientPublicKey);
		} catch (error) {
			throw new Error('Transaction has an invalid recipientPublicKey');
		}
	}
	if (typeof asset !== 'object' || asset === null || Array.isArray(asset)) {
		throw new Error('Transaction must include an asset object');
	}
	if (typeof asset.data !== 'undefined' && (typeof asset.data !== 'string' || asset.data.length > MAX_TRANSACTION_DATA_BYTES)) {
		throw new Error('Transaction has invalid asset.data');
	}
	return true;
};
