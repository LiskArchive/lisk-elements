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
import getTransactionBytes, {
	getAssetDataForTransferTransaction,
	getAssetDataForRegisterSecondSignatureTransaction,
	getAssetDataForRegisterDelegateTransaction,
	getAssetDataForCastVotesTransaction,
	getAssetDataForRegisterMultisignatureAccountTransaction,
	getAssetDataForCreateDappTransaction,
	getAssetDataForTransferIntoDappTransaction,
	getAssetDataForTransferOutOfDappTransaction,
	checkTransaction,
	checkRequiredFields,
	isValidValue,
} from 'transactions/utils/getTransactionBytes';

const fixedPoint = 10 ** 8;
const defaultRecipient = '58191285901858109L';
const defaultSenderPublicKey =
	'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
const defaultSenderId = '18160565574430594874L';
const defaultSenderSecondPublicKey =
	'0401c8ac9f29ded9e1e4d5b6b43051cb25b22f27c7b7b35092161e851946f82f';
const defaultAmount = (3 + 2 ** 62).toString();
const defaultNoAmount = 0;
const defaultTimestamp = 141738;
const defaultTransactionId = '13987348420913138422';
const defaultSignature =
	'618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a';
const defaultSecondSignature =
	'b00c4ad1988bca245d74435660a278bfe6bf2f5efa8bda96d927fabf8b4f6fcfdcb2953f6abacaa119d6880987a55dea0e6354bc8366052b45fa23145522020f';
const defaultAppId = '1234213';
const defaultDelegateUsername = 'MyDelegateUsername';

describe('#getTransactionBytes', () => {
	describe('transfer transaction, type 0', () => {
		let defaultTransaction;

		beforeEach(() => {
			defaultTransaction = {
				type: 0,
				fee: 0.1 * fixedPoint,
				amount: defaultAmount,
				recipientId: defaultRecipient,
				timestamp: defaultTimestamp,
				asset: {},
				senderPublicKey: defaultSenderPublicKey,
				senderId: defaultSenderId,
				signature: defaultSignature,
				id: defaultTransactionId,
			};
		});

		it('should return Buffer of type 0 (transfer LSK) transaction', () => {
			const expectedBuffer = Buffer.from(
				'00aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153d6000000000000040618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(defaultTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});

		it('should return Buffer of type 0 (transfer LSK) with data', () => {
			defaultTransaction.asset.data = 'Hello Lisk! Some data in here!...';
			const expectedBuffer = Buffer.from(
				'00aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153d600000000000004048656c6c6f204c69736b2120536f6d65206461746120696e2068657265212e2e2e618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(defaultTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});

		it('should throw on type 0 with too much data', () => {
			const maxDataLength = 64;
			defaultTransaction.asset.data = new Array(maxDataLength + 1)
				.fill('1')
				.join('');
			return getTransactionBytes
				.bind(null, defaultTransaction)
				.should.throw('Transaction asset data exceeds size of 64.');
		});

		it('should return Buffer of transaction with second signature', () => {
			defaultTransaction.signSignature = defaultSecondSignature;
			const expectedBuffer = Buffer.from(
				'00aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153d6000000000000040618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0ab00c4ad1988bca245d74435660a278bfe6bf2f5efa8bda96d927fabf8b4f6fcfdcb2953f6abacaa119d6880987a55dea0e6354bc8366052b45fa23145522020f',
				'hex',
			);
			const transactionBytes = getTransactionBytes(defaultTransaction);
			return transactionBytes.should.be.eql(expectedBuffer);
		});

		it('should return Buffer from multisignature type 0 (transfer LSK) transaction', () => {
			const multiSignatureTransaction = {
				type: 0,
				amount: 1000,
				fee: 1 * fixedPoint,
				recipientId: defaultRecipient,
				senderPublicKey: defaultSenderPublicKey,
				requesterPublicKey:
					'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
				timestamp: defaultTimestamp,
				asset: {},
				signatures: [],
				signature: defaultSignature,
				id: defaultTransactionId,
			};
			const expectedBuffer = Buffer.from(
				'00aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae095d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153de803000000000000618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(multiSignatureTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});

		it('should return Buffer of type 0 (transfer LSK) with additional properties', () => {
			defaultTransaction.skip = false;
			const expectedBuffer = Buffer.from(
				'00aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153d6000000000000040618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(defaultTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});

		it('should throw on missing required parameters', () => {
			const requiredProperties = [
				'type',
				'timestamp',
				'senderPublicKey',
				'amount',
			];

			return requiredProperties.forEach(parameter => {
				const defaultTransactionClone = Object.assign({}, defaultTransaction);
				delete defaultTransactionClone[parameter];
				getTransactionBytes
					.bind(null, defaultTransactionClone)
					.should.throw(`${parameter} is a required parameter.`);
			});
		});

		it('should throw on required parameters as undefined', () => {
			const requiredProperties = [
				'type',
				'timestamp',
				'senderPublicKey',
				'amount',
			];

			return requiredProperties.forEach(parameter => {
				const defaultTransactionClone = Object.assign({}, defaultTransaction);
				defaultTransactionClone[parameter] = undefined;
				getTransactionBytes
					.bind(null, defaultTransactionClone)
					.should.throw(`${parameter} is a required parameter.`);
			});
		});
	});

	describe('signature transaction, type 1', () => {
		const signatureTransaction = {
			type: 1,
			amount: defaultNoAmount,
			fee: 5 * fixedPoint,
			recipientId: null,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: { signature: { publicKey: defaultSenderSecondPublicKey } },
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer of type 1 (register second signature) transaction', () => {
			const expectedBuffer = Buffer.from(
				'01aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09000000000000000000000000000000000401c8ac9f29ded9e1e4d5b6b43051cb25b22f27c7b7b35092161e851946f82f618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(signatureTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});

	describe('delegate registration transaction, type 2', () => {
		const delegateRegistrationTransaction = {
			type: 2,
			amount: defaultNoAmount,
			fee: 25 * fixedPoint,
			recipientId: null,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: { delegate: { username: defaultDelegateUsername } },
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer of type 2 (register delegate) transaction', () => {
			const expectedBuffer = Buffer.from(
				'02aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09000000000000000000000000000000004d7944656c6567617465557365726e616d65618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(
				delegateRegistrationTransaction,
			);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});

	describe('vote transaction, type 3', () => {
		const voteTransaction = {
			type: 3,
			amount: 0,
			fee: 1 * fixedPoint,
			recipientId: defaultRecipient,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: {
				votes: [
					`+${defaultSenderPublicKey}`,
					`+${defaultSenderSecondPublicKey}`,
				],
			},
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer of type 3 (vote) transaction', () => {
			const expectedBuffer = Buffer.from(
				'03aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153d00000000000000002b356430333661383538636538396638343434393137363265623839653262666264353061346130613064613635386534623236323862323562313137616530392b30343031633861633966323964656439653165346435623662343330353163623235623232663237633762376233353039323136316538353139343666383266618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(voteTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});

	describe('multisignature transaction, type 4', () => {
		const createMultiSignatureTransaction = {
			type: 4,
			amount: 0,
			fee: 15 * fixedPoint,
			recipientId: null,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: {
				multisignature: {
					min: 2,
					lifetime: 5,
					keysgroup: [
						`+${defaultSenderPublicKey}`,
						`+${defaultSenderSecondPublicKey}`,
					],
				},
			},
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer from type 4 (register multisignature) transaction', () => {
			const expectedBuffer = Buffer.from(
				'04aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae090000000000000000000000000000000002052b356430333661383538636538396638343434393137363265623839653262666264353061346130613064613635386534623236323862323562313137616530392b30343031633861633966323964656439653165346435623662343330353163623235623232663237633762376233353039323136316538353139343666383266618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(
				createMultiSignatureTransaction,
			);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});

	describe('dapp transaction, type 5', () => {
		const dappTransaction = {
			type: 5,
			amount: 0,
			fee: 25 * fixedPoint,
			recipientId: null,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: {
				dapp: {
					category: 0,
					name: 'Lisk Guestbook',
					description: 'The official Lisk guestbook',
					tags: 'guestbook message sidechain',
					type: 0,
					link: 'https://github.com/MaxKK/guestbookDapp/archive/master.zip',
					icon:
						'https://raw.githubusercontent.com/MaxKK/guestbookDapp/master/icon.png',
				},
			},
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer of type 5 (register dapp) transaction', () => {
			const expectedBuffer = Buffer.from(
				'05aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09000000000000000000000000000000004c69736b204775657374626f6f6b546865206f6666696369616c204c69736b206775657374626f6f6b6775657374626f6f6b206d6573736167652073696465636861696e68747470733a2f2f6769746875622e636f6d2f4d61784b4b2f6775657374626f6f6b446170702f617263686976652f6d61737465722e7a697068747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f4d61784b4b2f6775657374626f6f6b446170702f6d61737465722f69636f6e2e706e670000000000000000618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(dappTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});

	describe('inTransfer transaction, type 6', () => {
		const inTransferTransction = {
			type: 6,
			amount: defaultAmount,
			fee: 1 * fixedPoint,
			recipientId: null,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: { inTransfer: { dappId: defaultAppId } },
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer of type 6 (dapp inTransfer) transaction', () => {
			const expectedBuffer = Buffer.from(
				'06aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae090000000000000000600000000000004031323334323133618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(inTransferTransction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});

	describe('outTransfer transaction, type 7', () => {
		const outTransferTransaction = {
			type: 7,
			amount: defaultAmount,
			fee: 1 * fixedPoint,
			recipientId: defaultRecipient,
			senderPublicKey: defaultSenderPublicKey,
			timestamp: defaultTimestamp,
			asset: {
				outTransfer: {
					dappId: defaultAppId,
					transactionId: defaultTransactionId,
				},
			},
			signature: defaultSignature,
			id: defaultTransactionId,
		};

		it('should return Buffer of type 7 (dapp outTransfer) transaction', () => {
			const expectedBuffer = Buffer.from(
				'07aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153d6000000000000040313233343231333133393837333438343230393133313338343232618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				'hex',
			);
			const transactionBytes = getTransactionBytes(outTransferTransaction);

			return transactionBytes.should.be.eql(expectedBuffer);
		});
	});
});

describe('getTransactionBytes functions', () => {
	describe('#checkRequiredFields', () => {
		const arrayToCheck = ['OneValue', 'SecondValue', 'ThirdValue', 1];
		it('should accept array and object to check for required fields', () => {
			const objectParameter = {
				OneValue: '1',
				SecondValue: '2',
				ThirdValue: '3',
				1: 10,
			};

			return checkRequiredFields(
				arrayToCheck,
				objectParameter,
			).should.be.true();
		});

		it('should throw on missing value', () => {
			const objectParameter = {
				OneValue: '1',
				SecondValue: '2',
				1: 10,
			};

			return checkRequiredFields
				.bind(null, arrayToCheck, objectParameter)
				.should.throw('ThirdValue is a required parameter.');
		});
	});

	describe('#getAssetDataForTransferTransaction', () => {
		const defaultEmptyBuffer = Buffer.alloc(0);
		it('should return Buffer for data asset', () => {
			const expectedBuffer = Buffer.from('my data input', 'utf8');
			const assetDataBuffer = getAssetDataForTransferTransaction({
				data: 'my data input',
			});

			return assetDataBuffer.should.be.eql(expectedBuffer);
		});

		it('should return empty Buffer for no asset data', () => {
			const assetDataBuffer = getAssetDataForTransferTransaction({});
			return assetDataBuffer.should.be.eql(defaultEmptyBuffer);
		});
	});

	describe('#getAssetDataForRegisterSecondSignatureTransaction', () => {
		it('should return Buffer for signature asset', () => {
			const expectedBuffer = Buffer.from(defaultSenderPublicKey, 'hex');
			const assetSignaturesPublicKeyBuffer = getAssetDataForRegisterSecondSignatureTransaction(
				{
					signature: {
						publicKey: defaultSenderPublicKey,
					},
				},
			);

			return assetSignaturesPublicKeyBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw on missing publicKey in the signature asset', () => {
			return getAssetDataForRegisterSecondSignatureTransaction
				.bind(null, { signature: {} })
				.should.throw('publicKey is a required parameter.');
		});
	});

	describe('#getAssetDataForRegisterDelegateTransaction', () => {
		it('should return Buffer for delegate asset', () => {
			const expectedBuffer = Buffer.from(defaultDelegateUsername, 'utf8');
			const assetDelegateUsernameBuffer = getAssetDataForRegisterDelegateTransaction(
				{
					delegate: {
						username: defaultDelegateUsername,
					},
				},
			);

			return assetDelegateUsernameBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw on missing username in the delegate asset', () => {
			return getAssetDataForRegisterDelegateTransaction
				.bind(null, { delegate: {} })
				.should.throw('username is a required parameter.');
		});
	});

	describe('#getAssetDataForCastVotesTransaction', () => {
		it('should return Buffer for votes asset', () => {
			const votesAsset = {
				votes: [
					`+${defaultSenderPublicKey}`,
					`+${defaultSenderSecondPublicKey}`,
				],
			};
			const expectedBuffer = Buffer.from(
				`+${defaultSenderPublicKey}+${defaultSenderSecondPublicKey}`,
				'utf8',
			);
			const assetVoteBuffer = getAssetDataForCastVotesTransaction(votesAsset);

			return assetVoteBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw on missing votes in the vote asset', () => {
			return getAssetDataForCastVotesTransaction
				.bind(null, { votes: {} })
				.should.throw('votes parameter must be an Array.');
		});
	});

	describe('#getAssetDataForRegisterMultisignatureAccountTransaction', () => {
		const min = 2;
		const lifetime = 5;
		const keysgroup = ['+123456789', '-987654321'];
		let multisignatureAsset;

		beforeEach(() => {
			multisignatureAsset = {
				multisignature: {
					min,
					lifetime,
					keysgroup,
				},
			};
		});

		it('should return Buffer for multisignature asset', () => {
			const minBuffer = Buffer.alloc(1, min);
			const lifetimeBuffer = Buffer.alloc(1, lifetime);
			const keysgroupBuffer = Buffer.from('+123456789-987654321', 'utf8');

			const expectedBuffer = Buffer.concat([
				minBuffer,
				lifetimeBuffer,
				keysgroupBuffer,
			]);
			const multisignatureBuffer = getAssetDataForRegisterMultisignatureAccountTransaction(
				multisignatureAsset,
			);

			return multisignatureBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw on missing required parameters', () => {
			const requiredProperties = ['min', 'lifetime', 'keysgroup'];

			return requiredProperties.forEach(parameter => {
				const multisigAsset = Object.assign(
					{},
					multisignatureAsset.multisignature,
				);
				delete multisigAsset[parameter];
				getAssetDataForRegisterMultisignatureAccountTransaction
					.bind(null, { multisignature: multisigAsset })
					.should.throw(`${parameter} is a required parameter.`);
			});
		});
	});

	describe('#getAssetDataForCreateDappTransaction', () => {
		const defaultCategory = 0;
		const defaultDappName = 'Lisk Guestbook';
		const defaultDescription = 'The official Lisk guestbook';
		const defaultTags = 'guestbook message sidechain';
		const defaultType = 0;
		const defaultLink =
			'https://github.com/MaxKK/guestbookDapp/archive/master.zip';
		const defaultIcon =
			'https://raw.githubusercontent.com/MaxKK/guestbookDapp/master/icon.png';
		const dappNameBuffer = Buffer.from('4c69736b204775657374626f6f6b', 'hex');
		const dappDescriptionBuffer = Buffer.from(
			'546865206f6666696369616c204c69736b206775657374626f6f6b',
			'hex',
		);
		const dappTagsBuffer = Buffer.from(
			'6775657374626f6f6b206d6573736167652073696465636861696e',
			'hex',
		);
		const dappLinkBuffer = Buffer.from(
			'68747470733a2f2f6769746875622e636f6d2f4d61784b4b2f6775657374626f6f6b446170702f617263686976652f6d61737465722e7a6970',
			'hex',
		);
		const dappIconBuffer = Buffer.from(
			'68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f4d61784b4b2f6775657374626f6f6b446170702f6d61737465722f69636f6e2e706e67',
			'hex',
		);
		const dappTypeBuffer = Buffer.alloc(4, defaultType);
		const dappCategoryBuffer = Buffer.alloc(4, defaultCategory);

		it('should return Buffer for create dapp asset', () => {
			const dappAsset = {
				dapp: {
					category: defaultCategory,
					name: defaultDappName,
					description: defaultDescription,
					tags: defaultTags,
					type: defaultType,
					link: defaultLink,
					icon: defaultIcon,
				},
			};

			const expectedBuffer = Buffer.concat([
				dappNameBuffer,
				dappDescriptionBuffer,
				dappTagsBuffer,
				dappLinkBuffer,
				dappIconBuffer,
				dappTypeBuffer,
				dappCategoryBuffer,
			]);
			const dappBuffer = getAssetDataForCreateDappTransaction(dappAsset);

			return dappBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw for create dapp asset without required fields', () => {
			const dapp = {
				category: defaultCategory,
				name: defaultDappName,
				description: defaultDescription,
				tags: defaultTags,
				type: defaultType,
				link: defaultLink,
				icon: defaultIcon,
			};
			const requiredProperties = ['name', 'link', 'type', 'category'];

			return requiredProperties.forEach(parameter => {
				const dappClone = Object.assign({}, dapp);
				delete dappClone[parameter];
				getAssetDataForCreateDappTransaction
					.bind(null, { dapp: dappClone })
					.should.throw(`${parameter} is a required parameter.`);
			});
		});
	});

	describe('#getAssetDataForTransferIntoDappTransaction', () => {
		it('should return Buffer for dappIn asset', () => {
			const dappInAsset = {
				inTransfer: {
					dappId: defaultAppId,
				},
			};
			const expectedBuffer = Buffer.from(defaultAppId, 'utf8');
			const dappInTransferBuffer = getAssetDataForTransferIntoDappTransaction(
				dappInAsset,
			);

			return dappInTransferBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw on missing votes in the vote asset', () => {
			return getAssetDataForTransferIntoDappTransaction
				.bind(null, { inTransfer: {} })
				.should.throw('dappId is a required parameter.');
		});
	});

	describe('#getAssetDataForTransferOutOfDappTransaction', () => {
		it('should return Buffer for dappOut asset', () => {
			const dappOutAsset = {
				outTransfer: {
					dappId: defaultAppId,
					transactionId: defaultTransactionId,
				},
			};
			const dappIdBuffer = Buffer.from(defaultAppId, 'utf8');
			const transactionIdBuffer = Buffer.from(defaultTransactionId);
			const expectedBuffer = Buffer.concat([dappIdBuffer, transactionIdBuffer]);
			const dappOutTransferBuffer = getAssetDataForTransferOutOfDappTransaction(
				dappOutAsset,
			);

			return dappOutTransferBuffer.should.be.eql(expectedBuffer);
		});

		it('should throw on missing votes in the vote asset', () => {
			return getAssetDataForTransferOutOfDappTransaction
				.bind(null, { outTransfer: {} })
				.should.throw('dappId is a required parameter.');
		});
	});

	describe('#checkTransaction', () => {
		const maxDataLength = 64;
		let defaultTransaction;
		beforeEach(() => {
			defaultTransaction = {
				type: 0,
				fee: 0.1 * fixedPoint,
				amount: defaultAmount,
				recipientId: defaultRecipient,
				timestamp: defaultTimestamp,
				asset: {},
				senderPublicKey: defaultSenderPublicKey,
				senderId: defaultSenderId,
				signature: defaultSignature,
				id: defaultTransactionId,
			};
		});

		it('should throw on too many data in transfer asset', () => {
			defaultTransaction.asset.data = new Array(maxDataLength + 1)
				.fill('1')
				.join('');
			return checkTransaction
				.bind(null, defaultTransaction)
				.should.throw('Transaction asset data exceeds size of 64.');
		});

		it('should return true on asset data exactly at max data length', () => {
			defaultTransaction.asset.data = new Array(maxDataLength)
				.fill('1')
				.join('');
			return checkTransaction(defaultTransaction).should.be.true();
		});
	});

	describe('#isInvalidValue', () => {
		it('should return false on invalid values', () => {
			const allInvalidValues = [NaN, false, undefined];
			return allInvalidValues.forEach(value => {
				const invalid = isValidValue(value);
				invalid.should.be.false();
			});
		});
		it('should return true on valid values', () => {
			const exampleValidValues = ['123', 123, { 1: 2, 3: 4 }, [1, 2, 3]];
			return exampleValidValues.forEach(value => {
				const valid = isValidValue(value);
				valid.should.be.true();
			});
		});
	});
});
