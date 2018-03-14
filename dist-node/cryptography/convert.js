'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.convertPrivateKeyEd2Curve = exports.convertPublicKeyEd2Curve = exports.getAddress = exports.getAddressFromPublicKey = exports.toAddress = exports.getFirstEightBytesReversed = exports.hexToBuffer = exports.bufferToHex = exports.bufferToBigNumberString = exports.bigNumberToBuffer = undefined;

var _browserifyBignum = require('browserify-bignum');

var _browserifyBignum2 = _interopRequireDefault(_browserifyBignum);

var _ed2curve = require('ed2curve');

var _ed2curve2 = _interopRequireDefault(_ed2curve);

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bigNumberToBuffer = exports.bigNumberToBuffer = function bigNumberToBuffer(bignumber, size) {
	return (0, _browserifyBignum2.default)(bignumber).toBuffer({ size: size });
}; /*
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
var bufferToBigNumberString = exports.bufferToBigNumberString = function bufferToBigNumberString(bigNumberBuffer) {
	return _browserifyBignum2.default.fromBuffer(bigNumberBuffer).toString();
};

var bufferToHex = exports.bufferToHex = function bufferToHex(buffer) {
	return naclInstance.to_hex(buffer);
};

var hexRegex = /^[0-9a-f]+/i;
var hexToBuffer = exports.hexToBuffer = function hexToBuffer(hex) {
	if (typeof hex !== 'string') {
		throw new TypeError('Argument must be a string.');
	}
	var matchedHex = (hex.match(hexRegex) || [])[0];
	if (!matchedHex || matchedHex.length !== hex.length) {
		throw new TypeError('Argument must be a valid hex string.');
	}
	if (matchedHex.length % 2 !== 0) {
		throw new TypeError('Argument must have a valid length of hex string.');
	}
	return Buffer.from(matchedHex, 'hex');
};

var getFirstEightBytesReversed = exports.getFirstEightBytesReversed = function getFirstEightBytesReversed(publicKeyBytes) {
	return Buffer.from(publicKeyBytes).slice(0, 8).reverse();
};

var toAddress = exports.toAddress = function toAddress(buffer) {
	if (!Buffer.from(buffer).slice(0, 8).equals(buffer)) throw new Error('The buffer for Lisk addresses must not have more than 8 bytes');
	return bufferToBigNumberString(buffer) + 'L';
};

var getAddressFromPublicKey = exports.getAddressFromPublicKey = function getAddressFromPublicKey(publicKey) {
	var publicKeyHash = (0, _hash2.default)(publicKey, 'hex');

	var publicKeyTransform = getFirstEightBytesReversed(publicKeyHash);
	var address = toAddress(publicKeyTransform);

	return address;
};

var getAddress = exports.getAddress = getAddressFromPublicKey;

var convertPublicKeyEd2Curve = exports.convertPublicKeyEd2Curve = _ed2curve2.default.convertPublicKey;

var convertPrivateKeyEd2Curve = exports.convertPrivateKeyEd2Curve = _ed2curve2.default.convertSecretKey;