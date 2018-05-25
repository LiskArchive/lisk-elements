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
import {
	checkPublicKeysForDuplicates,
	validatePublicKey,
	validatePublicKeys,
	validateKeysgroup,
	validateAddress,
} from 'lisk-transactions/utils/validation';

describe('public key validation', () => {
	describe('#validatePublicKey', () => {
		describe('Given a hex string with odd length', () => {
			const invalidHexPublicKey =
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bc';
			it('should throw an error', () => {
				return expect(
					validatePublicKey.bind(null, invalidHexPublicKey),
				).to.throw('Argument must have a valid length of hex string.');
			});
		});

		describe('Given a hex string with additional non-hex characters', () => {
			const invalidHexPublicKey =
				'12345678123456781234567812345678123456781234567812345678123456gg';
			it('should throw an error', () => {
				return expect(
					validatePublicKey.bind(null, invalidHexPublicKey),
				).to.throw('Argument must be a valid hex string.');
			});
		});

		describe('Given a too long public key', () => {
			const tooLongPublicKey =
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca12';
			it('should throw an error', () => {
				return expect(validatePublicKey.bind(null, tooLongPublicKey)).to.throw(
					'Public key 215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca12 length differs from the expected 32 bytes for a public key.',
				);
			});
		});

		describe('Given a too short public key', () => {
			const tooShortPublicKey =
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452b';
			it('should throw an error', () => {
				return expect(validatePublicKey.bind(null, tooShortPublicKey)).to.throw(
					'Public key 215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452b length differs from the expected 32 bytes for a public key.',
				);
			});
		});

		describe('Given a valid public key', () => {
			const publicKey =
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca';
			it('should return true', () => {
				return expect(validatePublicKey(publicKey)).to.be.true;
			});
		});

		describe('Given a valid public key with only numeric characters', () => {
			const publicKey =
				'1234567812345678123456781234567812345678123456781234567812345678';
			it('should return true', () => {
				return expect(validatePublicKey(publicKey)).to.be.true;
			});
		});
	});

	describe('#validatePublicKeys', () => {
		describe('Given an array of public keys with one invalid public key', () => {
			const publicKeys = [
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bc',
			];
			it('should throw an error', () => {
				return expect(validatePublicKeys.bind(null, publicKeys)).to.throw(
					'Argument must have a valid length of hex string.',
				);
			});
		});

		describe('Given an array of valid public keys', () => {
			const publicKeys = [
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
				'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
				'1234567812345678123456781234567812345678123456781234567812345678',
			];
			it('should return true', () => {
				return expect(validatePublicKeys(publicKeys)).to.be.true;
			});
		});
	});

	describe('#validateKeysgroup', () => {
		let keysgroup;
		describe('Given a keysgroup with three public keys', () => {
			beforeEach(() => {
				keysgroup = [
					'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
					'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
					'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
				];
				return Promise.resolve();
			});
			it('the validated keysgroup should return true', () => {
				return expect(validateKeysgroup(keysgroup)).to.be.true;
			});
		});

		describe('Given an empty keysgroup', () => {
			beforeEach(() => {
				keysgroup = [];
				return Promise.resolve();
			});
			it('should throw the error', () => {
				return expect(validateKeysgroup.bind(null, keysgroup)).to.throw(
					'Expected between 1 and 16 public keys in the keysgroup.',
				);
			});
		});

		describe('Given a keysgroup with 17 public keys', () => {
			beforeEach(() => {
				keysgroup = Array(17)
					.fill()
					.map(
						(_, index) =>
							cryptography.getPrivateAndPublicKeyFromPassphrase(
								index.toString(),
							).publicKey,
					);
				return Promise.resolve();
			});
			it('should throw the error', () => {
				return expect(validateKeysgroup.bind(null, keysgroup)).to.throw(
					'Expected between 1 and 16 public keys in the keysgroup.',
				);
			});
		});
	});

	describe('#checkPublicKeysForDuplicates', () => {
		describe('Given an array of public keys without duplication', () => {
			const publicKeys = [
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
				'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
				'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
			];
			it('should return true', () => {
				return expect(checkPublicKeysForDuplicates(publicKeys)).to.be.true;
			});
		});

		describe('Given an array of public keys with duplication', () => {
			const publicKeys = [
				'215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca',
				'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
				'922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
			];
			it('should throw', () => {
				return expect(
					checkPublicKeysForDuplicates.bind(null, publicKeys),
				).to.throw(
					'Duplicated public key: 922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa.',
				);
			});
		});
	});

	describe('#validateAddress', () => {
		describe('Given valid addresses', () => {
			const addresses = [
				'13133549779353512613L',
				'18446744073709551615L',
				'1L',
			];

			it('should return true', () => {
				return addresses.forEach(address => {
					return expect(validateAddress(address)).to.be.true;
				});
			});
		});

		describe('Given an address that is too short', () => {
			const address = 'L';
			const error =
				'Address length does not match requirements. Expected between 2 and 22 characters.';

			it('should throw', () => {
				return expect(validateAddress.bind(null, address)).to.throw(error);
			});
		});

		describe('Given an address that is too long', () => {
			const address = '12345678901234567890123L';
			const error =
				'Address length does not match requirements. Expected between 2 and 22 characters.';

			it('should throw', () => {
				return expect(validateAddress.bind(null, address)).to.throw(error);
			});
		});

		describe('Given an address without L at the end', () => {
			const address = '1234567890';
			const error =
				'Address format does not match requirements. Expected "L" at the end.';

			it('should throw', () => {
				return expect(validateAddress.bind(null, address)).to.throw(error);
			});
		});

		describe('Given an address that is out of range', () => {
			const address = '18446744073709551616L';
			const error =
				'Address format does not match requirements. Address out of maximum range.';

			it('should throw', () => {
				return expect(validateAddress.bind(null, address)).to.throw(error);
			});
		});
	});
});
