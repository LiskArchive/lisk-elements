'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.verifyTransaction = exports.multiSignTransaction = exports.signTransaction = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _cryptography = require('../../cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _get_transaction_hash = require('./get_transaction_hash');

var _get_transaction_hash2 = _interopRequireDefault(_get_transaction_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var signTransaction = exports.signTransaction = function signTransaction(transaction, passphrase) {
	var transactionHash = (0, _get_transaction_hash2.default)(transaction);
	return _cryptography2.default.signData(transactionHash, passphrase);
};

var multiSignTransaction = exports.multiSignTransaction = function multiSignTransaction(transaction, passphrase) {
	var transactionToSign = (0, _assign2.default)({}, transaction);
	delete transactionToSign.signature;
	delete transactionToSign.signSignature;

	var transactionHash = (0, _get_transaction_hash2.default)(transactionToSign);

	return _cryptography2.default.signData(transactionHash, passphrase);
};

var verifyTransaction = exports.verifyTransaction = function verifyTransaction(transaction, secondPublicKey) {
	var secondSignaturePresent = !!transaction.signSignature;
	if (secondSignaturePresent && !secondPublicKey) {
		throw new Error('Cannot verify signSignature without secondPublicKey.');
	}

	var transactionWithoutSignature = (0, _assign2.default)({}, transaction);

	if (secondSignaturePresent) {
		delete transactionWithoutSignature.signSignature;
	} else {
		delete transactionWithoutSignature.signature;
	}

	var transactionHash = (0, _get_transaction_hash2.default)(transactionWithoutSignature);

	var publicKey = secondSignaturePresent ? secondPublicKey : transaction.senderPublicKey;
	var signature = secondSignaturePresent ? transaction.signSignature : transaction.signature;

	var verified = _cryptography2.default.verifyData(transactionHash, signature, publicKey);

	return secondSignaturePresent ? verified && verifyTransaction(transactionWithoutSignature) : verified;
};