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
import crypto from 'crypto';
import { getTransactionBytes } from '../transactions/transactionBytes';
import {
	hexToBuffer,
	bufferToHex,
	convertPrivateKeyEd2Curve,
	convertPublicKeyEd2Curve,
} from './convert';
import {
	getRawPrivateAndPublicKeyFromSecret,
	getPrivateAndPublicKeyFromSecret,
} from './keys';
import { getTransactionHash, getSha256Hash } from './hash';

/**
 * @method signMessageWithSecret
 * @param message
 * @param secret
 *
 * @return {Object} - message, signature and publicKey
 */

export function signMessageWithSecret(message, secret) {
	const msgBytes = naclInstance.encode_utf8(message);
	const { privateKey, publicKey } = getRawPrivateAndPublicKeyFromSecret(secret);

	const signedMessage = naclInstance.crypto_sign(msgBytes, privateKey);
	const signature = bufferToHex(signedMessage);

	return {
		message,
		signature,
		publicKey: bufferToHex(publicKey),
	};
}

/**
 * @method signMessageWithTwoSecrets
 * @param message
 * @param secret
 * @param secondSecret
 *
 * @return {Object} - message, signature, publicKey, secondPublicKey
 */

export function signMessageWithTwoSecrets(message, secret, secondSecret) {
	const msgBytes = naclInstance.encode_utf8(message);
	const keypairBytes = getRawPrivateAndPublicKeyFromSecret(secret);
	const secondKeypairBytes = getRawPrivateAndPublicKeyFromSecret(secondSecret);

	const signedMessage = naclInstance.crypto_sign(msgBytes, keypairBytes.privateKey);
	const doubleSignedMessage = naclInstance.crypto_sign(
		signedMessage, secondKeypairBytes.privateKey,
	);

	return {
		message,
		signature: bufferToHex(doubleSignedMessage),
		publicKey: bufferToHex(keypairBytes.publicKey),
		secondPublicKey: bufferToHex(secondKeypairBytes.publicKey),
	};
}

/**
 * @method verifyMessageWithPublicKey
 * @param Object - signedMessage, publicKey
 *
 * @return {Object} - containing message, signature, publicKey and boolean verification
 */

export function verifyMessageWithPublicKey({ signature, publicKey }) {
	const signatureBytes = hexToBuffer(signature);
	const publicKeyBytes = hexToBuffer(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	const signatureVerified = naclInstance.crypto_sign_open(signatureBytes, publicKeyBytes);

	if (signatureVerified) {
		return {
			message: naclInstance.decode_utf8(signatureVerified),
			signature,
			publicKey,
			verification: true,
		};
	}
	return {
		message: signatureVerified,
		signature,
		publicKey,
		verification: false,
	};
}

/**
 * @method verifyMessageWithTwoPublicKeys
 * @param {Object} - message, signature, publicKey, secondPublicKey
 *
 * @return {Object}
 */

export function verifyMessageWithTwoPublicKeys({ message, signature, publicKey, secondPublicKey }) {
	const signedMessageBytes = hexToBuffer(signature);
	const publicKeyBytes = hexToBuffer(publicKey);
	const secondPublicKeyBytes = hexToBuffer(secondPublicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	const secondSignatureVerified = naclInstance.crypto_sign_open(
		signedMessageBytes, secondPublicKeyBytes,
	);

	if (!secondSignatureVerified) {
		return {
			message,
			signature,
			publicKey,
			secondPublicKey,
			verification: false,
		};
	}

	const firstSignatureVerified = naclInstance.crypto_sign_open(
		secondSignatureVerified, publicKeyBytes,
	);

	if (!firstSignatureVerified) {
		return {
			message,
			signature,
			publicKey,
			secondPublicKey,
			verification: false,
		};
	}
	return {
		message,
		signature,
		publicKey,
		secondPublicKey,
		verification: true,
	};
}

/**
 * @method printSignedMessage
 * @param Object - message, signature, publicKey
 *
 * @return {String}
 */

export function printSignedMessage({ message, signature, publicKey }) {
	const signedMessageHeader = '-----BEGIN LISK SIGNED MESSAGE-----';
	const messageHeader = '-----MESSAGE-----';
	const publicKeyHeader = '-----PUBLIC KEY-----';
	const signatureHeader = '-----SIGNATURE-----';
	const signatureFooter = '-----END LISK SIGNED MESSAGE-----';

	const outputArray = [
		signedMessageHeader,
		messageHeader,
		message,
		publicKeyHeader,
		publicKey,
		signatureHeader,
		signature,
		signatureFooter,
	];

	return outputArray.join('\n');
}

/**
 * @method signAndPrintMessage
 * @param message
 * @param secret
 *
 * @return {String}
 */

export function signAndPrintMessage(message, secret) {
	const signedMessage = signMessageWithSecret(message, secret);
	return printSignedMessage(signedMessage);
}

/**
 * @method encryptMessageWithSecret
 * @param message
 * @param secret
 * @param recipientPublicKey
 *
 * @return {Object}
 */

export function encryptMessageWithSecret(message, secret, recipientPublicKey) {
	const senderPrivateKeyBytes = getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	const convertedPrivateKey = convertPrivateKeyEd2Curve(senderPrivateKeyBytes);
	const recipientPublicKeyBytes = hexToBuffer(recipientPublicKey);
	const convertedPublicKey = convertPublicKeyEd2Curve(recipientPublicKeyBytes);
	const messageInBytes = naclInstance.encode_utf8(message);

	const nonce = naclInstance.crypto_box_random_nonce();
	const cipherBytes = naclInstance.crypto_box(
		messageInBytes, nonce, convertedPublicKey, convertedPrivateKey,
	);

	const nonceHex = bufferToHex(nonce);
	const encryptedMessage = bufferToHex(cipherBytes);

	return {
		nonce: nonceHex,
		encryptedMessage,
		senderPublicKey: getPrivateAndPublicKeyFromSecret(secret).publicKey,
		recipientPublicKey,
	};
}

/**
 * @method decryptMessageWithSecret
 * @param {Object} - encryptedMessage, nonce, senderPublicKey, secret
 *
 * @return {String}
 */

export function decryptMessageWithSecret({ encryptedMessage, nonce, senderPublicKey, secret }) {
	const { privateKey, publicKey } = getRawPrivateAndPublicKeyFromSecret(secret);
	const convertedPrivateKey = convertPrivateKeyEd2Curve(privateKey);
	const senderPublicKeyBytes = hexToBuffer(senderPublicKey);
	const convertedPublicKey = convertPublicKeyEd2Curve(senderPublicKeyBytes);
	const cipherBytes = hexToBuffer(encryptedMessage);
	const nonceBytes = hexToBuffer(nonce);
	let decoded;
	try {
		decoded = naclInstance.crypto_box_open(
			cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey,
		);
	} catch (e) {
		if (e.message === 'nacl_raw._crypto_box_open signalled an error') {
			return {
				message: null,
				encryptedMessage,
				nonce,
				senderPublicKey,
				error: 'Could not open message, secret passphrase does not match',
			};
		}
	}

	return {
		message: naclInstance.decode_utf8(decoded),
		encryptedMessage,
		nonce,
		senderPublicKey,
		recipientPublicKey: bufferToHex(publicKey),
	};
}

/**
 * @method signTransaction
 * @param transaction Object
 * @param secret Object
 *
 * @return {String}
 */

export function signTransaction(transaction, secret) {
	const { privateKey } = getRawPrivateAndPublicKeyFromSecret(secret);
	const transactionHash = getTransactionHash(transaction);
	const signature = naclInstance.crypto_sign_detached(transactionHash, privateKey);
	return bufferToHex(signature);
}

/**
 * @method multiSignTransaction
 * @param transaction Object
 * @param secret Object
 *
 * @return {String}
 */

export function multiSignTransaction(transaction, secret) {
	const transactionToSign = Object.assign({}, transaction);
	delete transactionToSign.signature;
	delete transactionToSign.signSignature;
	const { privateKey } = getRawPrivateAndPublicKeyFromSecret(secret);
	const bytes = getTransactionBytes(transactionToSign);
	const transactionHash = getSha256Hash(bytes);
	const signature = naclInstance.crypto_sign_detached(
		transactionHash, privateKey,
	);

	return bufferToHex(signature);
}

/**
 * @method verifyTransaction
 * @param transaction Object
 * @param secondPublicKey
 *
 * @return {Boolean}
 */

export function verifyTransaction(transaction, secondPublicKey) {
	const secondSignaturePresent = !!transaction.signSignature;
	if (secondSignaturePresent && !secondPublicKey) {
		throw new Error('Cannot verify signSignature without secondPublicKey.');
	}

	const transactionWithoutSignature = Object.assign({}, transaction);

	if (secondSignaturePresent) {
		delete transactionWithoutSignature.signSignature;
	} else {
		delete transactionWithoutSignature.signature;
	}

	const transactionBytes = getTransactionBytes(transactionWithoutSignature);

	const publicKey = secondSignaturePresent ? secondPublicKey : transaction.senderPublicKey;
	const signature = secondSignaturePresent ? transaction.signSignature : transaction.signature;

	const verified = naclInstance.crypto_sign_verify_detached(
		hexToBuffer(signature), getSha256Hash(transactionBytes), hexToBuffer(publicKey),
	);

	return secondSignaturePresent ? verifyTransaction(transactionWithoutSignature) : verified;
}

/**
 * @method encryptAES256CBCWithPassword
 * @param {String} plainText utf8 - any utf8 string
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {Object} - { cipher: '...', iv: '...' }
 */

function encryptAES256CBCWithPassword(plainText, password) {
	const iv = crypto.randomBytes(16);
	const passwordHash = getSha256Hash(password, 'utf8');
	const cipher = crypto.createCipheriv('aes-256-cbc', passwordHash, iv);
	const firstBlock = cipher.update(plainText, 'utf8');
	const encrypted = Buffer.concat([firstBlock, cipher.final()]);

	return {
		cipher: encrypted.toString('hex'),
		iv: iv.toString('hex'),
	};
}

/**
 * @method decryptAES256CBCWithPassword
 * @param {Object} Object - Object with cipher and iv as hex strings
 * @param {String} Object.cipher - hex string AES-256-CBC cipher
 * @param {String} Object.iv - hex string for the initialisation vector
 * The cipher text resulting from the AES-256-CBC encryption,
 * including the nonce { cipher: ..., nonce: ..., }
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {String} utf8
 */

function decryptAES256CBCWithPassword({ cipher, iv }, password) {
	const passwordHash = getSha256Hash(password, 'utf8');
	const decipherInit = crypto.createDecipheriv('aes-256-cbc', passwordHash, hexToBuffer(iv));
	const firstBlock = decipherInit.update(hexToBuffer(cipher));
	const decrypted = Buffer.concat([firstBlock, decipherInit.final()]);

	return decrypted.toString();
}

/**
 * @method encryptPassphraseWithPassword
 * @param {String} passphrase utf8 - twelve word secret passphrase
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {Object} - { cipher: '...', iv: '...' }
 */

export function encryptPassphraseWithPassword(passphrase, password) {
	return encryptAES256CBCWithPassword(passphrase, password);
}

/**
 * @method decryptPassphraseWithPassword
 * @param {Object} cipherAndIv - Object containing the encryption cipher and the iv
 * The cipher text resulting from the AES-256-CBC encryption,
 * including the nonce { cipher: ..., nonce: ..., }
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {String}
 */

export function decryptPassphraseWithPassword(cipherAndIv, password) {
	return decryptAES256CBCWithPassword(cipherAndIv, password);
}
