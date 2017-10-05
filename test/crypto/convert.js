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

import naclUtil from 'tweetnacl-util';
import {
	bufferToHex,
	hexToBuffer,
	getFirstEightBytesReversed,
	toAddress,
	getAddressFromPublicKey,
	getAddress,
	getId,
	convertPublicKeyEd2Curve,
	convertPrivateKeyEd2Curve,
} from '../../src/crypto/convert';

import { getRawPrivateAndPublicKeyFromSecret, getKeys } from '../../src/crypto/keys';

describe('convert', () => {
	const defaultSecret = 'secret';
	const defaultBuffer = naclUtil.decodeUTF8('\xe5\xe4\xf6');
	const defaultHex = 'c3a5c3a4c3b6';
	const defaultAddress = '18160565574430594874L';
	const expectedPublicKey = '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';

	describe('#bufferToHex', () => {
		it('should create Hex from Buffer type', () => {
			const hex = bufferToHex(defaultBuffer);
			hex.should.be.equal(defaultHex);
		});
	});

	describe('#hexToBuffer', () => {
		it('should create Buffer from Hex type', () => {
			const buffer = hexToBuffer(defaultHex);
			naclUtil.encodeUTF8(buffer).should.be.equal('åäö');
		});
	});

	describe('#getFirstEightBytesReversed', () => {
		it('should use a Buffer, cut after first 8 entries and reverse them', () => {
			const bufferEntry = Buffer.from('0123456789');
			const reversedAndCut = getFirstEightBytesReversed(bufferEntry);
			reversedAndCut.should.be.eql(Buffer.from('76543210'));
		});
	});

	describe('#toAddress', () => {
		const bufferInit = Buffer.from('Hello!');
		const address = toAddress(bufferInit);

		address.should.be.eql('79600447942433L');
	});

	describe('#getId', () => {
		it('should be ok', () => {
			getId.should.be.ok();
		});

		it('should be a function', () => {
			getId.should.be.type('function');
		});

		it('should return string id and be equal to 13987348420913138422', () => {
			const transaction = {
				type: 0,
				amount: 1000,
				recipientId: '58191285901858109L',
				timestamp: 141738,
				asset: {},
				senderPublicKey: '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
				signature:
					'618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
			};

			const id = getId(transaction);
			id.should.be.type('string').and.equal('13987348420913138422');
		});
	});

	describe('#getAddressFromPublicKey', () => {
		const address = getAddressFromPublicKey(expectedPublicKey);

		it('should generate address from publicKey', () => {
			address.should.be.equal(defaultAddress);
		});
	});

	describe('#getAddress', () => {
		it('should be ok', () => {
			getAddress.should.be.ok();
		});

		it('should be a function', () => {
			getAddress.should.be.type('function');
		});

		it('should generate address by publicKey', () => {
			const keys = getKeys(defaultSecret);
			const address = getAddress(keys.publicKey);

			address.should.be.ok();
			address.should.be.type('string');
			address.should.be.equal('18160565574430594874L');
		});
	});

	describe('#convertPublicKeyEd2Curve', () => {
		const keyPair = getRawPrivateAndPublicKeyFromSecret('123');

		it('should convert publicKey ED25519 to Curve25519 key', () => {
			let curveRepresentation = convertPublicKeyEd2Curve(keyPair.publicKey);
			curveRepresentation = bufferToHex(curveRepresentation);

			curveRepresentation.should.be.equal(
				'f65170b330e5ae94fe6372e0ff8b7c709eb8dfe78c816ffac94e7d3ed1729715',
			);
		});
	});

	describe('#convertPrivateKeyEd2Curve', () => {
		const keyPair = getRawPrivateAndPublicKeyFromSecret('123');

		it('should convert privateKey ED25519 to Curve25519 key', () => {
			let curveRepresentation = convertPrivateKeyEd2Curve(keyPair.privateKey);
			curveRepresentation = bufferToHex(curveRepresentation);

			curveRepresentation.should.be.equal(
				'a05621ba2d3f69f054abb1f3c155338bb44ec8b718928cf9d5b206bafd364356',
			);
		});
	});
});
