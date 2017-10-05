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
import crypto from 'crypto';
import getTransactionBytes from '../transactions/transactionBytes';
import {
	hexToBuffer,
	bufferToHex,
	convertPrivateKeyEd2Curve,
	convertPublicKeyEd2Curve,
} from './convert';
import { getRawPrivateAndPublicKeyFromSecret } from './keys';
import { getTransactionHash, getSha256Hash } from './hash';

nacl.util = naclUtil;

/**
 * @method signMessageWithSecret
 * @param message - utf8
 * @param secret - utf8
 *
 * @return {Object} - message, publicKey, signature
 */

export function signMessageWithSecret(message, secret) {
	const msgBytes = Buffer.from(message, 'utf8');
	const { privateKey, publicKey } = getRawPrivateAndPublicKeyFromSecret(secret);
	const signature = nacl.sign.detached(msgBytes, privateKey);

	return {
		message,
		publicKey: bufferToHex(publicKey),
		signature: Buffer.from(signature).toString('base64'),
	};
}

/**
 * @method signMessageWithTwoSecrets
 * @param message - utf8
 * @param secret - utf8
 * @param secondSecret - utf8
 *
 * @return {Object} - message, publicKey, secondPublicKey, signature, secondSignature
 */

export function signMessageWithTwoSecrets(message, secret, secondSecret) {
	const msgBytes = Buffer.from(message, 'utf8');
	const keypairBytes = getRawPrivateAndPublicKeyFromSecret(secret);
	const secondKeypairBytes = getRawPrivateAndPublicKeyFromSecret(secondSecret);

	const signature = nacl.sign.detached(msgBytes, keypairBytes.privateKey);
	const secondSignature = nacl.sign.detached(msgBytes, secondKeypairBytes.privateKey);

	return {
		message,
		publicKey: bufferToHex(keypairBytes.publicKey),
		secondPublicKey: bufferToHex(secondKeypairBytes.publicKey),
		signature: Buffer.from(signature).toString('base64'),
		secondSignature: Buffer.from(secondSignature).toString('base64'),
	};
}

/**
 * @method verifyMessageWithPublicKey
 * @param {Object} Object - Object
 * @param {String} Object.message - message in utf8
 * @param {String} Object.signature - signature in base64
 * @param {String} Object.publicKey - publicKey in hex
 *
 * @return {string}
 */

export function verifyMessageWithPublicKey({ message, signature, publicKey }) {
	const msgBytes = Buffer.from(message);
	const signatureBytes = Buffer.from(signature, 'base64');
	const publicKeyBytes = hexToBuffer(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	if (signatureBytes.length !== nacl.sign.signatureLength) {
		throw new Error('Invalid signature length, expected 64-byte signature');
	}

	return nacl.sign.detached.verify(msgBytes, signatureBytes, publicKeyBytes);
}

/**
 * @method verifyMessageWithTwoPublicKeys
 * @param signedMessage
 * @param publicKey
 * @param secondPublicKey
 *
 * @return {string}
 */

export function verifyMessageWithTwoPublicKeys({
	message,
	signature,
	secondSignature,
	publicKey,
	secondPublicKey,
}) {
	const messageBytes = Buffer.from(message);
	const signatureBytes = Buffer.from(signature, 'base64');
	const secondSignatureBytes = Buffer.from(secondSignature, 'base64');
	const publicKeyBytes = Buffer.from(hexToBuffer(publicKey));
	const secondPublicKeyBytes = Buffer.from(hexToBuffer(secondPublicKey));

	if (signatureBytes.length !== nacl.sign.signatureLength) {
		throw new Error('Invalid first signature length, expected 64-byte signature');
	}

	if (secondSignatureBytes.length !== nacl.sign.signatureLength) {
		throw new Error('Invalid second signature length, expected 64-byte signature');
	}
	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	const verifyFirstSignature = () =>
		nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
	const verifySecondSignature = () =>
		nacl.sign.detached.verify(messageBytes, secondSignatureBytes, secondPublicKeyBytes);

	return verifyFirstSignature() && verifySecondSignature();
}

/**
 * @method printSignedMessage
 * @param message
 * @param signedMessage
 * @param publicKey
 *
 * @return {string}
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
 * @return {string}
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
 * @return {object}
 */

export function encryptMessageWithSecret(message, secret, recipientPublicKey) {
	const senderPrivateKeyBytes = getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	const convertedPrivateKey = convertPrivateKeyEd2Curve(senderPrivateKeyBytes);
	const recipientPublicKeyBytes = hexToBuffer(recipientPublicKey);
	const convertedPublicKey = convertPublicKeyEd2Curve(recipientPublicKeyBytes);
	const messageInBytes = nacl.util.decodeUTF8(message);

	const nonce = nacl.randomBytes(24);

	const cipherBytes = nacl.box(messageInBytes, nonce, convertedPublicKey, convertedPrivateKey);

	const nonceHex = bufferToHex(nonce);
	const encryptedMessage = bufferToHex(cipherBytes);

	return {
		nonce: nonceHex,
		encryptedMessage,
	};
}

/**
 * @method decryptMessageWithSecret
 * @param cipherHex
 * @param nonce
 * @param secret
 * @param senderPublicKey
 *
 * @return {string}
 */

export function decryptMessageWithSecret(cipherHex, nonce, secret, senderPublicKey) {
	const recipientPrivateKeyBytes = getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	const convertedPrivateKey = convertPrivateKeyEd2Curve(recipientPrivateKeyBytes);
	const senderPublicKeyBytes = hexToBuffer(senderPublicKey);
	const convertedPublicKey = convertPublicKeyEd2Curve(senderPublicKeyBytes);
	const cipherBytes = hexToBuffer(cipherHex);
	const nonceBytes = hexToBuffer(nonce);

	const decoded = nacl.box.open(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
	return nacl.util.encodeUTF8(decoded);
}

/**
 * @method signTransaction
 * @param transaction Object
 * @param secret Object
 *
 * @return {string}
 */

export function signTransaction(transaction, secret) {
	const { privateKey } = getRawPrivateAndPublicKeyFromSecret(secret);
	const transactionHash = getTransactionHash(transaction);
	const signature = nacl.sign.detached(transactionHash, privateKey);
	return bufferToHex(signature);
}

/**
 * @method multiSignTransaction
 * @param transaction Object
 * @param secret Object
 *
 * @return {string}
 */

export function multiSignTransaction(transaction, secret) {
	const transactionToSign = Object.assign({}, transaction);
	delete transactionToSign.signature;
	delete transactionToSign.signSignature;
	const { privateKey } = getRawPrivateAndPublicKeyFromSecret(secret);
	const bytes = getTransactionBytes(transactionToSign);
	const transactionHash = getSha256Hash(bytes);
	const signature = nacl.sign.detached(transactionHash, privateKey);

	return bufferToHex(signature);
}

/**
 * @method verifyTransaction
 * @param transaction Object
 * @param secondPublicKey
 *
 * @return {boolean}
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

	const verified = nacl.sign.detached.verify(
		getSha256Hash(transactionBytes),
		hexToBuffer(signature),
		hexToBuffer(publicKey),
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
