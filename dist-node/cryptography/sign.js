'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.verifyData = exports.signData = exports.signAndPrintMessage = exports.printSignedMessage = exports.verifyMessageWithTwoPublicKeys = exports.signMessageWithTwoPassphrases = exports.verifyMessageWithPublicKey = exports.signMessageWithPassphrase = undefined;

var _convert = require('./convert');

var _keys = require('./keys');

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
var createHeader = function createHeader(text) {
	return '-----' + text + '-----';
};
var signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
var messageHeader = createHeader('MESSAGE');
var publicKeyHeader = createHeader('PUBLIC KEY');
var secondPublicKeyHeader = createHeader('SECOND PUBLIC KEY');
var signatureHeader = createHeader('SIGNATURE');
var secondSignatureHeader = createHeader('SECOND SIGNATURE');
var signatureFooter = createHeader('END LISK SIGNED MESSAGE');

var signMessageWithPassphrase = exports.signMessageWithPassphrase = function signMessageWithPassphrase(message, passphrase) {
	var msgBytes = Buffer.from(message, 'utf8');

	var _getPrivateAndPublicK = (0, _keys.getPrivateAndPublicKeyBytesFromPassphrase)(passphrase),
	    privateKey = _getPrivateAndPublicK.privateKey,
	    publicKey = _getPrivateAndPublicK.publicKey;

	var signature = naclInstance.crypto_sign_detached(msgBytes, privateKey);

	return {
		message: message,
		publicKey: (0, _convert.bufferToHex)(publicKey),
		signature: (0, _convert.bufferToHex)(signature)
	};
};

var verifyMessageWithPublicKey = exports.verifyMessageWithPublicKey = function verifyMessageWithPublicKey(_ref) {
	var message = _ref.message,
	    signature = _ref.signature,
	    publicKey = _ref.publicKey;

	var msgBytes = Buffer.from(message, 'utf8');
	var signatureBytes = (0, _convert.hexToBuffer)(signature);
	var publicKeyBytes = (0, _convert.hexToBuffer)(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid signature length, expected 64-byte signature');
	}

	return naclInstance.crypto_sign_verify_detached(signatureBytes, msgBytes, publicKeyBytes);
};

var signMessageWithTwoPassphrases = exports.signMessageWithTwoPassphrases = function signMessageWithTwoPassphrases(message, passphrase, secondPassphrase) {
	var msgBytes = Buffer.from(message, 'utf8');
	var keypairBytes = (0, _keys.getPrivateAndPublicKeyBytesFromPassphrase)(passphrase);
	var secondKeypairBytes = (0, _keys.getPrivateAndPublicKeyBytesFromPassphrase)(secondPassphrase);

	var signature = naclInstance.crypto_sign_detached(msgBytes, keypairBytes.privateKey);
	var secondSignature = naclInstance.crypto_sign_detached(msgBytes, secondKeypairBytes.privateKey);

	return {
		message: message,
		publicKey: (0, _convert.bufferToHex)(keypairBytes.publicKey),
		secondPublicKey: (0, _convert.bufferToHex)(secondKeypairBytes.publicKey),
		signature: (0, _convert.bufferToHex)(signature),
		secondSignature: (0, _convert.bufferToHex)(secondSignature)
	};
};

var verifyMessageWithTwoPublicKeys = exports.verifyMessageWithTwoPublicKeys = function verifyMessageWithTwoPublicKeys(_ref2) {
	var message = _ref2.message,
	    signature = _ref2.signature,
	    secondSignature = _ref2.secondSignature,
	    publicKey = _ref2.publicKey,
	    secondPublicKey = _ref2.secondPublicKey;

	var messageBytes = Buffer.from(message, 'utf8');
	var signatureBytes = (0, _convert.hexToBuffer)(signature);
	var secondSignatureBytes = (0, _convert.hexToBuffer)(secondSignature);
	var publicKeyBytes = (0, _convert.hexToBuffer)(publicKey);
	var secondPublicKeyBytes = (0, _convert.hexToBuffer)(secondPublicKey);

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid first signature length, expected 64-byte signature');
	}

	if (secondSignatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid second signature length, expected 64-byte signature');
	}

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	var verifyFirstSignature = function verifyFirstSignature() {
		return naclInstance.crypto_sign_verify_detached(signatureBytes, messageBytes, publicKeyBytes);
	};
	var verifySecondSignature = function verifySecondSignature() {
		return naclInstance.crypto_sign_verify_detached(secondSignatureBytes, messageBytes, secondPublicKeyBytes);
	};

	return verifyFirstSignature() && verifySecondSignature();
};

var printSignedMessage = exports.printSignedMessage = function printSignedMessage(_ref3) {
	var message = _ref3.message,
	    signature = _ref3.signature,
	    publicKey = _ref3.publicKey,
	    secondSignature = _ref3.secondSignature,
	    secondPublicKey = _ref3.secondPublicKey;
	return [signedMessageHeader, messageHeader, message, publicKeyHeader, publicKey, secondPublicKey ? secondPublicKeyHeader : null, secondPublicKey, signatureHeader, signature, secondSignature ? secondSignatureHeader : null, secondSignature, signatureFooter].filter(Boolean).join('\n');
};

var signAndPrintMessage = exports.signAndPrintMessage = function signAndPrintMessage(message, passphrase, secondPassphrase) {
	var signedMessage = secondPassphrase ? signMessageWithTwoPassphrases(message, passphrase, secondPassphrase) : signMessageWithPassphrase(message, passphrase);

	return printSignedMessage(signedMessage);
};

var signData = exports.signData = function signData(data, passphrase) {
	var _getPrivateAndPublicK2 = (0, _keys.getPrivateAndPublicKeyBytesFromPassphrase)(passphrase),
	    privateKey = _getPrivateAndPublicK2.privateKey;

	var signature = naclInstance.crypto_sign_detached(data, privateKey);
	return (0, _convert.bufferToHex)(signature);
};

var verifyData = exports.verifyData = function verifyData(data, signature, publicKey) {
	return naclInstance.crypto_sign_verify_detached((0, _convert.hexToBuffer)(signature), data, (0, _convert.hexToBuffer)(publicKey));
};