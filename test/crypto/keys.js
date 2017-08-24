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
import cryptoModule from '../../src/crypto/index';

describe('keys', () => {
	const defaultSecret = 'secret';
	const defaultAddress = '18160565574430594874L';
	const expectedPublicKey = '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const expectedPrivateKey = '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	describe('#getPrivateAndPublicKeyFromSecret', () => {
		const keypair = cryptoModule.getPrivateAndPublicKeyFromSecret(defaultSecret);

		it('should generate the correct publicKey from a secret', () => {
			(keypair.publicKey).should.be.equal(expectedPublicKey);
		});

		it('should generate the correct privateKey from a secret', () => {
			(keypair.privateKey).should.be.equal(expectedPrivateKey);
		});
	});

	describe('#getRawPrivateAndPublicKeyFromSecret', () => {
		const keypair = cryptoModule.getRawPrivateAndPublicKeyFromSecret(defaultSecret);

		it('should create buffer publicKey', () => {
			(cryptoModule.bufferToHex(
				Buffer.from(keypair.publicKey))
			).should.be.equal(expectedPublicKey);
		});

		it('should create buffer privateKey', () => {
			(cryptoModule.bufferToHex(Buffer.from(keypair.privateKey)))
				.should.be.equal(expectedPrivateKey);
		});
	});

	describe('#getAddressFromPublicKey', () => {
		const address = cryptoModule.getAddressFromPublicKey(expectedPublicKey);

		it('should generate address from publicKey', () => {
			(address).should.be.equal(defaultAddress);
		});
	});

	describe('#getKeys', () => {
		const getKeys = cryptoModule.getKeys;

		it('should return two keys in hex', () => {
			const keys = getKeys('secret');

			(keys).should.have.property('publicKey').and.be.type('string').and.be.hexString();
			(keys).should.have.property('privateKey').and.be.type('string').and.be.hexString();
			(keys).should.be.eql({
				publicKey: expectedPublicKey,
				privateKey: expectedPrivateKey,
			});
		});
	});
});
