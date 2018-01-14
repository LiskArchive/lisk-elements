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
const {
	randomBytes,
	createCipheriv,
	createDecipheriv
} = require('crypto');
const ed2curve = require('ed2curve');
const {bufferToHex, hexToBuffer} = require('./convert');
const {
	getRawPrivateAndPublicKeyFromSecret,
	getPrivateAndPublicKeyFromSecret
} = require('./keys');
const {getSha256Hash} = require('./hash');

/**
 * @method wrapWithSymbols
 * @param {String} str - string to wrap
 * @param {Number} signsNum int - number of symbols from each side
 * @param {String} symbol - wrapper symbol to repeat
 *
 * @return {String} wrapped string
 */

function wrapWithSymbols(str, signsNum = 5, symbol = '-') {
	const wrapPart = symbol.repeat(signsNum);
	return wrapPart + str + wrapPart;
}

function signMessageWithSecret (message, secret) {
	const msg = naclInstance.encode_utf8(message);
	const {privateKey} = getRawPrivateAndPublicKeyFromSecret(secret);

	const signedMessage = naclInstance.crypto_sign(msg, privateKey);
	const hexSignedMessage = bufferToHex(signedMessage);

	return hexSignedMessage;
}

function signAndPrintMessage (message, secret) {
	const signedMessageHeader = wrapWithSymbols('BEGIN LISK SIGNED MESSAGE');
	const messageHeader = wrapWithSymbols('MESSAGE');
	const plainMessage = message;
	const pubklicKeyHeader = wrapWithSymbols('PUBLIC KEY');
	const publicKey = getPrivateAndPublicKeyFromSecret(secret).publicKey;
	const signatureHeader = wrapWithSymbols('SIGNATURE');
	const signedMessage = signMessageWithSecret(message, secret);
	const signatureFooter = wrapWithSymbols('END LISK SIGNED MESSAGE');

	const outputArray = [
		signedMessageHeader, messageHeader, plainMessage, pubklicKeyHeader,
		publicKey, signatureHeader, signedMessage, signatureFooter
	];

	return outputArray.join('\n');
}

function printSignedMessage (message, signedMessage, publicKey) {
	const signedMessageHeader = wrapWithSymbols('BEGIN LISK SIGNED MESSAGE');
	const messageHeader = wrapWithSymbols('MESSAGE');
	const plainMessage = message;
	const publicKeyHeader = wrapWithSymbols('PUBLIC KEY');
	const printPublicKey = publicKey;
	const signatureHeader = wrapWithSymbols('SIGNATURE');
	const printSignedMessage = signedMessage;
	const signatureFooter = wrapWithSymbols('END LISK SIGNED MESSAGE');

	const outputArray = [
		signedMessageHeader, messageHeader, plainMessage, publicKeyHeader, 
		printPublicKey, signatureHeader, printSignedMessage, signatureFooter
	];

	return outputArray.join('\n');
}

function verifyMessageWithPublicKey (signedMessage, publicKey) {
	const signedMessageBytes = hexToBuffer(signedMessage);
	const publicKeyBytes = hexToBuffer(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	// Give appropriate error messages from crypto_sign_open
	const openSignature = naclInstance.crypto_sign_open(signedMessageBytes, publicKeyBytes);

	if (openSignature) {
		// Returns original message
		return naclInstance.decode_utf8(openSignature);
	} else {
		throw new Error('Invalid signature publicKey combination, cannot verify message');
	}
}

function convertPublicKeyEd2Curve (publicKey) {
	return ed2curve.convertPublicKey(publicKey);
}

function convertPrivateKeyEd2Curve (privateKey) {
	return ed2curve.convertSecretKey(privateKey);
}

function encryptMessageWithSecret (message, secret, recipientPublicKey) {
	const senderPrivateKey = getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	const recipientPublicKeyBytes = hexToBuffer(recipientPublicKey);
	message = naclInstance.encode_utf8(message);

	const nonce = naclInstance.crypto_box_random_nonce();
	const packet = naclInstance.crypto_box(
		message, nonce, convertPublicKeyEd2Curve(recipientPublicKeyBytes), convertPrivateKeyEd2Curve(senderPrivateKey)
	);

	const nonceHex = bufferToHex(nonce);
	const encryptedMessage = bufferToHex(packet);

	return {
		nonce: nonceHex,
		encryptedMessage: encryptedMessage
	};
}

function decryptMessageWithSecret (packet, nonce, secret, senderPublicKey) {
	const recipientPrivateKey = getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	const senderPublicKeyBytes = hexToBuffer(senderPublicKey);
	const packetBytes = hexToBuffer(packet);
	const nonceBytes = hexToBuffer(nonce);

	const decoded = naclInstance.crypto_box_open(
		packetBytes, nonceBytes, convertPublicKeyEd2Curve(senderPublicKeyBytes), convertPrivateKeyEd2Curve(recipientPrivateKey)
	);

	return naclInstance.decode_utf8(decoded);
}


/**
 * @method encryptAES256CBCWithPassword
 * @param {String} plainText utf8 - any utf8 string
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {Object} - { cipher: '...', iv: '...' }
 */

function encryptAES256CBCWithPassword(plainText, password) {
	const iv = randomBytes(16);
	const passwordHash = getSha256Hash(password, 'utf8');
	const cipher = createCipheriv('aes-256-cbc', passwordHash, iv);
	const firstBlock = cipher.update(plainText, 'utf8');
	const encrypted = Buffer.concat([firstBlock, cipher.final()]);
	
	return {
		cipher: encrypted.toString('hex'),
		iv: iv.toString('hex'),
	};
}

/**
 * @method decryptAES256CBCWithPassword
 * @param {Object} cipherAndIv - Object with cipher and iv as hex strings
 * The cipher text resulting from the AES-256-CBC encryption,
 * including the nonce { cipher: ..., nonce: ..., }
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {String} utf8
 */

function decryptAES256CBCWithPassword(cipherAndIv, password) {
	const cipher = cipherAndIv.cipher;
	const iv = cipherAndIv.iv;
	const passwordHash = getSha256Hash(password, 'utf8');
	const decipherInit = createDecipheriv('aes-256-cbc', passwordHash, hexToBuffer(iv));
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

function encryptPassphraseWithPassword(passphrase, password) {
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
 
function decryptPassphraseWithPassword(cipherAndIv, password) {
	return decryptAES256CBCWithPassword(cipherAndIv, password);
}

module.exports = {
	verifyMessageWithPublicKey,
	signMessageWithSecret,
	printSignedMessage,
	signAndPrintMessage,
	encryptMessageWithSecret,
	decryptMessageWithSecret,
	convertPublicKeyEd2Curve,
	convertPrivateKeyEd2Curve,
	decryptPassphraseWithPassword,
	encryptPassphraseWithPassword,
};
