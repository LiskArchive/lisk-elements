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
import cryptography from 'cryptography';
import {
	checkPublicKeysForDuplicates,
	validateAddress,
	validateKeysgroup,
	validatePublicKey,
	validatePublicKeys,
	validateTransactionSchema,
} from 'transactions/utils/validation';

describe('validation', () => {
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

	describe.only('#validateTransactionSchema', () => {
		const defaultValidTransaction = {
			type: 0,
			amount: '100',
			senderPublicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
			timestamp: 54196080,
			signature: 'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0f',
			id: '6263613751669009115',
			fee: '10000000',
			recipientId: '1859190791819301L',
			asset: {},
		};
		describe('defaults', () => {
			it('should throw an error if transaction is not an object', () => {
				const invalidObjects = [
					null,
					undefined,
					3,
					'',
					'transaction',
					'{"type":0,"amount":"5061165300000000","fee":"10000000","recipientId":"1859190791819301L","timestamp":54196079,"asset":{},"senderPublicKey":"c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f","signature":"b2cef4445fc63d3100bfe4b8c5a3988962378d5f05f3f31a874545341d1421f40f6bede8195fb41de4998454510a578490dcbc5a646bcea75fe459b8be1c6002","id":"17133129148236935159"}',
					[0, '5061165300000000'],
				];
				const error = 'Transaction must be an object';
				return invalidObjects.forEach(transaction => {
					expect(validateTransactionSchema.bind(null, transaction)).to.throw(
						error,
					);
				});
			});
			it('should throw an error if type is not a number between 0 and 5', () => {
				const invalidTypes = [null, undefined, -1, 0.2, 6, '', '0', {}, []];
				const error = 'Transaction type must be an integer between 0 and 5';
				return invalidTypes.forEach(type => {
					const transaction = Object.assign({}, defaultValidTransaction, { type });
					expect(validateTransactionSchema.bind(null, transaction)).to.throw(
						error,
					);
				});
			});
			it('should throw an error if amount is not a valid string', () => {
				const invalidAmounts = [
					null,
					undefined,
					0,
					10,
					10e8,
					{},
					[],
					'',
					'amount',
					'100.1',
					'-1',
					'18446744073709551616',
				];
				const error =
					'Transaction amount must be a string integer between 0 and 18446744073709551615';
				return invalidAmounts.forEach(amount => {
					const transaction = Object.assign({}, defaultValidTransaction, { amount });
					expect(
						validateTransactionSchema.bind(null, transaction),
					).to.throw(error);
				});
			});
			it('should throw an error if senderPublicKey is not a valid public key', () => {
				const invalidPublicKeys = [
					null,
					undefined,
					0,
					500,
					{},
					[],
					'',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6fa',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6fab',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6g',
				];
				const error = 'Transaction must include a valid senderPublicKey';
				return invalidPublicKeys.forEach(senderPublicKey => {
					const transaction = Object.assign({}, defaultValidTransaction, { senderPublicKey });
					expect(
						validateTransactionSchema.bind(null, transaction),
					).to.throw(error);
				});
			});
			it('should throw an error if timestamp is not a valid number', () => {
				const invalidTimestamps = [
					null,
					undefined,
					{},
					[],
					'',
					'54196080',
					54196080.1,
					-1,
					4294967297,
				];
				const error = 'Transaction must include a valid timestamp';
				return invalidTimestamps.forEach(timestamp => {
					const transaction = Object.assign({}, defaultValidTransaction, { timestamp });
					expect(
						validateTransactionSchema.bind(null, transaction),
					).to.throw(error);
				});
			});
			it('should throw an error if signature is not a valid signature', () => {
				const invalidSignatures = [
					null,
					undefined,
					{},
					[],
					0,
					-1,
					54196080,
					'',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0fa',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0fab',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0g',
				];
				const error = 'Transaction must include a valid signature';
				return invalidSignatures.forEach(signature => {
					const transaction = Object.assign({}, defaultValidTransaction, { signature });
					expect(
						validateTransactionSchema.bind(null, transaction),
					).to.throw(error);
				});
			});
			it('should throw an error if signSignature is not a valid signature', () => {
				const invalidSecondSignatures = [
					{},
					[],
					0,
					-1,
					54196080,
					'',
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0fa',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0fab',
					'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0g',
				];
				const error = 'Transaction has an invalid signSignature';
				return invalidSecondSignatures.forEach(signSignature => {
					const transaction = Object.assign({}, defaultValidTransaction, { signSignature });
					expect(
						validateTransactionSchema.bind(null, transaction),
					).to.throw(error);
				});
			});
			it('should throw an error if id is not a valid id', () => {
				const invalidIDs = [
					null,
					undefined,
					{},
					[],
					0,
					-1,
					54196080,
					6263613751669009115,
					'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
					'',
					'id',
					'100.1',
					'-1',
					'18446744073709551616',
				];
				const error = 'Transaction must include a valid id';
				return invalidIDs.forEach(id => {
					const transaction = Object.assign({}, defaultValidTransaction, { id });
					expect(
						validateTransactionSchema.bind(null, transaction),
					).to.throw(error);
				});
			});
			describe('type 0', () => {
				it('should throw an error if fee is not 0.1 LSK', () => {
					const invalidFees = [
						null,
						undefined,
						{},
						[],
						0,
						-1,
						0.1,
						'',
						'0.1',
						'0.10',
						'1',
						'0',
						'fee',
					];
					const error = 'Type 0 transactions must have a fee of 0.1 LSK';
					return invalidFees.forEach(fee => {
						const transaction = Object.assign({}, defaultValidTransaction, { fee });
						expect(validateTransactionSchema.bind(null, transaction)).to.throw(error);
					});
				});
				it('should throw an error if recipientId is not a valid address', () => {
					const invalidAddresses = [
						null,
						undefined,
						{},
						[],
						0,
						-1,
						1859190791819301,
						'',
						'address',
						'1859190791819301',
						'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
					];
					const error = 'Transaction must include a valid recipientId';
					return invalidAddresses.forEach(recipientId => {
						const transaction = Object.assign({}, defaultValidTransaction, { recipientId });
						expect(validateTransactionSchema.bind(null, transaction)).to.throw(error);
					});
				});
				it(
					'should throw an error if recipientPublicKey is not a valid public key or void', () => {
						const invalidRecipientPublicKeys = [
							{},
							[],
							0,
							-1,
							0.1,
							'',
							'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6',
							'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab',
							'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6fa',
							'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6fab',
							'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6g',
						];
						const error = 'Transaction has an invalid recipientPublicKey';
						return invalidRecipientPublicKeys.forEach(recipientPublicKey => {
							const transaction = Object.assign({}, defaultValidTransaction, { recipientPublicKey });
							expect(validateTransactionSchema.bind(null, transaction)).to.throw(error);
						});
					},
				);
				it('should throw an error if asset is not an object', () => {
					const invalidAssets = [
						null,
						undefined,
						[],
						0,
						-1,
						1859190791819301,
						'',
						'asset',
						'{}',
					];
					const error = 'Transaction must include an asset object';
					return invalidAssets.forEach(asset => {
						const transaction = Object.assign({}, defaultValidTransaction, { asset });
						expect(validateTransactionSchema.bind(null, transaction)).to.throw(error);
					});
				});
				it('should throw an error if asset data is invalid', () => {
					const invalidAssetDatas = [
						null,
						{},
						[],
						0,
						-1,
						'This string is 65 utf-8 characters long 0123456789012345678901234',
					];
					const error = 'Transaction has invalid asset.data';
					return invalidAssetDatas.forEach(data => {
						const transaction = Object.assign({}, defaultValidTransaction, { asset: { data } });
						expect(validateTransactionSchema.bind(null, transaction)).to.throw(error);
					});
				});
				it('should return true for a valid transaction', () => {
					const validTransactions = [
						Object.assign({}, defaultValidTransaction),
						Object.assign({ signSignature: 'ce60ee3b844d3bbd8030b842ba9568c857e6de41aa2e19322ab6314b8e66afa419752816fd17ad88a75dc8ef763de782be68cc27d3d47e0b5cd63f38de6a2d0f' }, defaultValidTransaction),
						Object.assign({ recipientPublicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f' }, defaultValidTransaction),
					];
					return validTransactions.forEach(transaction => {
						expect(validateTransactionSchema(transaction)).to.be.true;
					});
				});
			});
			describe('type 1', () => {
				it('should throw an error if fee is not 5 LSK');
				it(
					'should throw an error if asset.signature.publicKey is not a valid publicKey',
				);
				it('should return true for a valid transaction');
			});
			describe('type 2', () => {
				it('should throw an error if fee is not 25 LSK');
				it(
					'should throw an error if asset.delegate.username is not a valid username',
				);
				it('should return true for a valid transaction');
			});
			describe('type 3', () => {
				it('should throw an error if fee is not 1 LSK');
				it('should throw an error if recipientId is not the sender’s address');
				it(
					'should throw an error if asset.votes is not an array of plus/minus-prepended public keys',
				);
				it('should return true for a valid transaction');
			});
			describe('type 4', () => {
				it('should throw an error if fee is not a positive multiple of 5 LSK');
				it(
					'should throw an error if asset.multisignature.min is not a valid number',
				);
				it(
					'should throw an error if asset.multisignature.lifetime is not a valid number',
				);
				it(
					'should throw an error if asset.multisignature.keysgroup is not an array of plus-prepended public keys',
				);
				it('should return true for a valid transaction');
			});
			describe('type 5', () => {
				it('should throw an error if fee is not 25 LSK');
				it(
					'should throw an error if asset.dapp.category is not a valid integer',
				);
				it('should throw an error if asset.dapp.name is not a valid string');
				// it('should throw an error if asset.dapp.description is not a valid string');
				// it('should throw an error if asset.dapp.tags is not a valid string');
				it('should throw an error if asset.dapp.type is not a valid integer');
				it('should throw an error if asset.dapp.link is not a valid string');
				// it('should throw an error if asset.dapp.icon is not a valid string');
				it('should return true for a valid transaction');
			});
		});
		describe('legacy option', () => {
			it('should have tests');
		});
		describe('unsigned option', () => {
			it('should have tests');
		});
	});
});
