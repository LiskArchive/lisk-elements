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
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import sha256 from 'js-sha256';
import getTransactionBytes from './../transactions/transactionBytes';
import { hexToBuffer } from './convert';

nacl.util = naclUtil;

function cryptoHashSha256(data) {
	const hash = sha256.create();
	hash.update(data);
	return new Uint8Array(hash.array());
}

/**
 * @method getSha256Hash
 * @param data
 * @param format
 *
 * @return {string}
 */
export function getSha256Hash(data, format) {
	if (Buffer.isBuffer(data)) {
		return cryptoHashSha256(data);
	}

	if (typeof data === 'string') {
		if (!['utf8', 'hex'].includes(format)) {
			throw new Error('Unsupported string format. Currently only `hex` and `utf8` are supported.');
		}
		const encoded = format === 'utf8' ? nacl.util.decodeUTF8(data) : hexToBuffer(data);
		return cryptoHashSha256(encoded);
	}

	throw new Error(
		'Unsupported data format. Currently only Buffers or `hex` and `utf8` strings are supported.',
	);
}

/**
 * @method getTransactionHash
 * @param transaction Object
 *
 * @return {string}
 */

export function getTransactionHash(transaction) {
	const bytes = getTransactionBytes(transaction);
	return getSha256Hash(bytes);
}
