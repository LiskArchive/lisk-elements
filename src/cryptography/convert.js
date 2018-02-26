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
import bignum from 'browserify-bignum';
import ed2curve from 'ed2curve';
import hash from './hash';

export const bigNumberToBuffer = (bignumber: string | number, size: number): Uint8Array =>
	bignum(bignumber).toBuffer({ size });

export const bufferToBigNumberString = (bigNumberBuffer: Uint8Array): string =>
	bignum.fromBuffer(bigNumberBuffer).toString();

export const bufferToHex = (buffer: Uint8Array): string => naclInstance.to_hex(buffer);

export const hexToBuffer = (hex: string): Buffer => Buffer.from(hex, 'hex');

export const getFirstEightBytesReversed = (publicKeyBytes: Uint8Array): Uint8Array =>
	Buffer.from(publicKeyBytes)
		.slice(0, 8)
		.reverse();

export const toAddress = (buffer: Uint8Array): string => `${bufferToBigNumberString(buffer)}L`;

export const getAddressFromPublicKey = (publicKey: string): string => {
	const publicKeyHash = hash(publicKey, 'hex');

	const publicKeyTransform = getFirstEightBytesReversed(publicKeyHash);
	const address = toAddress(publicKeyTransform);

	return address;
};

export const getAddress = getAddressFromPublicKey;

export const convertPublicKeyEd2Curve = ed2curve.convertPublicKey;

export const convertPrivateKeyEd2Curve = ed2curve.convertSecretKey;
