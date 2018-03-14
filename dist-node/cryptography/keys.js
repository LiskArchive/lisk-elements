'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getAddressAndPublicKeyFromPassphrase = exports.getKeys = exports.getPrivateAndPublicKeyFromPassphrase = exports.getPrivateAndPublicKeyBytesFromPassphrase = undefined;

var _convert = require('./convert');

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

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
var getPrivateAndPublicKeyBytesFromPassphrase = exports.getPrivateAndPublicKeyBytesFromPassphrase = function getPrivateAndPublicKeyBytesFromPassphrase(passphrase) {
	var hashed = (0, _hash2.default)(passphrase, 'utf8');

	var _naclInstance$crypto_ = naclInstance.crypto_sign_seed_keypair(hashed),
	    signSk = _naclInstance$crypto_.signSk,
	    signPk = _naclInstance$crypto_.signPk;

	return {
		privateKey: signSk,
		publicKey: signPk
	};
};

var getPrivateAndPublicKeyFromPassphrase = exports.getPrivateAndPublicKeyFromPassphrase = function getPrivateAndPublicKeyFromPassphrase(passphrase) {
	var _getPrivateAndPublicK = getPrivateAndPublicKeyBytesFromPassphrase(passphrase),
	    privateKey = _getPrivateAndPublicK.privateKey,
	    publicKey = _getPrivateAndPublicK.publicKey;

	return {
		privateKey: (0, _convert.bufferToHex)(privateKey),
		publicKey: (0, _convert.bufferToHex)(publicKey)
	};
};

var getKeys = exports.getKeys = getPrivateAndPublicKeyFromPassphrase;

var getAddressAndPublicKeyFromPassphrase = exports.getAddressAndPublicKeyFromPassphrase = function getAddressAndPublicKeyFromPassphrase(passphrase) {
	var accountKeys = getKeys(passphrase);
	var accountAddress = (0, _convert.getAddress)(accountKeys.publicKey);

	return {
		address: accountAddress,
		publicKey: accountKeys.publicKey
	};
};