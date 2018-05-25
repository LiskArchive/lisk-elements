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
import {
	signMessageWithPassphrase,
	signMessageWithTwoPassphrases,
	verifyMessageWithPublicKey,
	verifyMessageWithTwoPublicKeys,
	printSignedMessage,
	signAndPrintMessage,
	signData,
	signDataWithPassphrase,
	signDataWithPrivateKey,
	verifyData,
} from 'lisk-cryptography/src/sign';
// Require is used for stubbing
const keys = require('lisk-cryptography/src/keys');

const makeInvalid = str => {
	const char = str[0] === '0' ? '1' : '0';
	return `${char}${str.slice(1)}`;
};

const changeLength = str => `00${str}`;

describe('sign', () => {
	const defaultPassphrase =
		'minute omit local rare sword knee banner pair rib museum shadow juice';
	const defaultPrivateKey =
		'314852d7afb0d4c283692fef8a2cb40e30c7a5df2ed79994178c10ac168d6d977ef45cd525e95b7a86244bbd4eb4550914ad06301013958f4dd64d32ef7bc588';
	const defaultPublicKey =
		'7ef45cd525e95b7a86244bbd4eb4550914ad06301013958f4dd64d32ef7bc588';
	const defaultSecondPassphrase = 'second secret';
	const defaultSecondPrivateKey =
		'9ef4146f8166d32dc8051d3d9f3a0c4933e24aa8ccb439b5d9ad00078a89e2fc0401c8ac9f29ded9e1e4d5b6b43051cb25b22f27c7b7b35092161e851946f82f';
	const defaultSecondPublicKey =
		'0401c8ac9f29ded9e1e4d5b6b43051cb25b22f27c7b7b35092161e851946f82f';
	const defaultMessage = 'Some default text.';
	const defaultSignature =
		'974eeac2c7e7d9da42aa273c8caae8e6eb766fa29a31b37732f22e6d2e61e8402106849e61e3551ff70d7d359170a6198669e1061b6b4aa61997e26b87e3a704';
	const defaultSecondSignature =
		'fd938f69d33d70c940bb994579e11f4e5ee18e715634997ab9753305d5ec0d031aee03f6da8c1c259c1fdec34b4ef546e629c07bb3c77a4bcee9db017dac880d';
	const defaultPrintedMessage = `
-----BEGIN LISK SIGNED MESSAGE-----
-----MESSAGE-----
${defaultMessage}
-----PUBLIC KEY-----
${defaultPublicKey}
-----SIGNATURE-----
${defaultSignature}
-----END LISK SIGNED MESSAGE-----
`.trim();
	const defaultSecondSignedPrintedMessage = `
-----BEGIN LISK SIGNED MESSAGE-----
-----MESSAGE-----
${defaultMessage}
-----PUBLIC KEY-----
${defaultPublicKey}
-----SECOND PUBLIC KEY-----
${defaultSecondPublicKey}
-----SIGNATURE-----
${defaultSignature}
-----SECOND SIGNATURE-----
${defaultSecondSignature}
-----END LISK SIGNED MESSAGE-----
`.trim();
	const defaultData = Buffer.from('This is some data');
	const defaultDataSignature =
		'b8704e11c4d9fad9960c7b6a69dcf48c1bede5b74ed8974cd005d9a407deef618dd800fe69ceed1fd52bb1e0881e71aec137c35b90eda9afe93716a5652ee009';

	let defaultSignedMessage;
	let defaultDoubleSignedMessage;

	let getPrivateAndPublicKeyBytesFromPassphraseStub;

	beforeEach(() => {
		defaultSignedMessage = {
			message: defaultMessage,
			publicKey: defaultPublicKey,
			signature: defaultSignature,
		};
		defaultDoubleSignedMessage = {
			message: defaultMessage,
			publicKey: defaultPublicKey,
			secondPublicKey: defaultSecondPublicKey,
			signature: defaultSignature,
			secondSignature: defaultSecondSignature,
		};

		getPrivateAndPublicKeyBytesFromPassphraseStub = sandbox.stub(
			keys,
			'getPrivateAndPublicKeyBytesFromPassphrase',
		);
		getPrivateAndPublicKeyBytesFromPassphraseStub
			.withArgs(defaultPassphrase)
			.returns({
				privateKey: Buffer.from(defaultPrivateKey, 'hex'),
				publicKey: Buffer.from(defaultPublicKey, 'hex'),
			});
		return getPrivateAndPublicKeyBytesFromPassphraseStub
			.withArgs(defaultSecondPassphrase)
			.returns({
				privateKey: Buffer.from(defaultSecondPrivateKey, 'hex'),
				publicKey: Buffer.from(defaultSecondPublicKey, 'hex'),
			});
	});

	describe('#signMessageWithPassphrase', () => {
		it('should create a signed message using a secret passphrase', () => {
			const signedMessage = signMessageWithPassphrase(
				defaultMessage,
				defaultPassphrase,
			);
			return expect(signedMessage).to.be.eql(defaultSignedMessage);
		});
	});

	describe('#verifyMessageWithPublicKey', () => {
		it('should detect invalid publicKeys', () => {
			return expect(
				verifyMessageWithPublicKey.bind(null, {
					message: defaultMessage,
					signature: defaultSignature,
					publicKey: changeLength(defaultPublicKey),
				}),
			).to.throw('Invalid publicKey, expected 32-byte publicKey');
		});

		it('should detect invalid signatures', () => {
			return expect(
				verifyMessageWithPublicKey.bind(null, {
					message: defaultMessage,
					signature: changeLength(defaultSignature),
					publicKey: defaultPublicKey,
				}),
			).to.throw('Invalid signature length, expected 64-byte signature');
		});

		it('should return false if the signature is invalid', () => {
			const verification = verifyMessageWithPublicKey({
				message: defaultMessage,
				signature: makeInvalid(defaultSignature),
				publicKey: defaultPublicKey,
			});
			return expect(verification).to.be.false;
		});

		it('should return true if the signature is valid', () => {
			const verification = verifyMessageWithPublicKey(defaultSignedMessage);
			return expect(verification).to.be.true;
		});
	});

	describe('#signMessageWithTwoPassphrases', () => {
		it('should create a message signed by two secret passphrases', () => {
			const signature = signMessageWithTwoPassphrases(
				defaultMessage,
				defaultPassphrase,
				defaultSecondPassphrase,
			);

			return expect(signature).to.be.eql(defaultDoubleSignedMessage);
		});
	});

	describe('#verifyMessageWithTwoPublicKeys', () => {
		it('should throw on invalid first publicKey length', () => {
			return expect(
				verifyMessageWithTwoPublicKeys.bind(
					null,
					Object.assign({}, defaultDoubleSignedMessage, {
						publicKey: changeLength(defaultPublicKey),
					}),
				),
			).to.throw('Invalid first publicKey, expected 32-byte publicKey');
		});

		it('should throw on invalid second publicKey length', () => {
			return expect(
				verifyMessageWithTwoPublicKeys.bind(
					null,
					Object.assign({}, defaultDoubleSignedMessage, {
						secondPublicKey: changeLength(defaultSecondPublicKey),
					}),
				),
			).to.throw('Invalid second publicKey, expected 32-byte publicKey');
		});

		it('should throw on invalid primary signature length', () => {
			return expect(
				verifyMessageWithTwoPublicKeys.bind(
					null,
					Object.assign({}, defaultDoubleSignedMessage, {
						signature: changeLength(defaultSignature),
					}),
				),
			).to.throw('Invalid first signature length, expected 64-byte signature');
		});

		it('should throw on invalid secondary signature length', () => {
			return expect(
				verifyMessageWithTwoPublicKeys.bind(
					null,
					Object.assign({}, defaultDoubleSignedMessage, {
						secondSignature: changeLength(defaultSecondSignature),
					}),
				),
			).to.throw('Invalid second signature length, expected 64-byte signature');
		});

		it('should return false for incorrect first signature', () => {
			const verified = verifyMessageWithTwoPublicKeys(
				Object.assign({}, defaultDoubleSignedMessage, {
					signature: makeInvalid(defaultSignature),
				}),
			);
			return expect(verified).to.be.false;
		});

		it('should return false for incorrect second signature', () => {
			const verified = verifyMessageWithTwoPublicKeys(
				Object.assign({}, defaultDoubleSignedMessage, {
					secondSignature: makeInvalid(defaultSecondSignature),
				}),
			);
			return expect(verified).to.be.false;
		});

		it('should return true for two valid signatures', () => {
			const verified = verifyMessageWithTwoPublicKeys(
				defaultDoubleSignedMessage,
			);
			return expect(verified).to.be.true;
		});
	});

	describe('#printSignedMessage', () => {
		it('should wrap a single signed message into a printed Lisk template', () => {
			const printedMessage = printSignedMessage({
				message: defaultMessage,
				signature: defaultSignature,
				publicKey: defaultPublicKey,
			});
			return expect(printedMessage).to.be.equal(defaultPrintedMessage);
		});

		it('should wrap a second signed message into a printed Lisk template', () => {
			const printedMessage = printSignedMessage({
				message: defaultMessage,
				signature: defaultSignature,
				publicKey: defaultPublicKey,
				secondSignature: defaultSecondSignature,
				secondPublicKey: defaultSecondPublicKey,
			});
			return expect(printedMessage).to.be.equal(
				defaultSecondSignedPrintedMessage,
			);
		});
	});

	describe('#signAndPrintMessage', () => {
		it('should sign the message once and wrap it into a printed Lisk template', () => {
			const signedAndPrintedMessage = signAndPrintMessage(
				defaultMessage,
				defaultPassphrase,
			);
			return expect(signedAndPrintedMessage).to.be.equal(defaultPrintedMessage);
		});

		it('should sign the message twice and wrap it into a printed Lisk template', () => {
			const signedAndPrintedMessage = signAndPrintMessage(
				defaultMessage,
				defaultPassphrase,
				defaultSecondPassphrase,
			);
			return expect(signedAndPrintedMessage).to.be.equal(
				defaultSecondSignedPrintedMessage,
			);
		});
	});

	describe('#signData', () => {
		let signature;

		beforeEach(() => {
			signature = signData(defaultData, defaultPassphrase);
			return Promise.resolve();
		});

		it('should sign a transaction', () => {
			return expect(signature).to.be.equal(defaultDataSignature);
		});
	});

	describe('#signDataWithPassphrase', () => {
		let signature;

		beforeEach(() => {
			signature = signDataWithPassphrase(defaultData, defaultPassphrase);
			return Promise.resolve();
		});

		it('should sign a transaction', () => {
			return expect(signature).to.be.equal(defaultDataSignature);
		});
	});

	describe('#signDataWithPrivateKey', () => {
		let signature;

		beforeEach(() => {
			signature = signDataWithPrivateKey(
				defaultData,
				Buffer.from(defaultPrivateKey, 'hex'),
			);
			return Promise.resolve();
		});

		it('should sign a transaction', () => {
			return expect(signature).to.be.equal(defaultDataSignature);
		});
	});

	describe('#verifyData', () => {
		it('should return false for an invalid signature', () => {
			const verification = verifyData(
				defaultData,
				makeInvalid(defaultDataSignature),
				defaultPublicKey,
			);
			return expect(verification).to.be.false;
		});

		it('should return true for a valid signature', () => {
			const verification = verifyData(
				defaultData,
				defaultDataSignature,
				defaultPublicKey,
			);
			return expect(verification).to.be.true;
		});
	});
});
