'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.validateAddress = exports.validateKeysgroup = exports.validatePublicKeys = exports.checkPublicKeysForDuplicates = exports.validatePublicKey = undefined;

var _browserifyBignum = require('browserify-bignum');

var _browserifyBignum2 = _interopRequireDefault(_browserifyBignum);

var _liskConstants = require('../../lisk-constants');

var _convert = require('../../cryptography/convert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validatePublicKey = exports.validatePublicKey = function validatePublicKey(publicKey) {
	var publicKeyBuffer = (0, _convert.hexToBuffer)(publicKey);
	if (publicKeyBuffer.length !== 32) {
		throw new Error('Public key ' + publicKey + ' length differs from the expected 32 bytes for a public key.');
	}
	return true;
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
var checkPublicKeysForDuplicates = exports.checkPublicKeysForDuplicates = function checkPublicKeysForDuplicates(publicKeys) {
	return publicKeys.every(function (element, index) {
		var elementFound = publicKeys.slice(index + 1).indexOf(element);
		if (elementFound > -1) {
			throw new Error('Duplicated public key: ' + publicKeys[index] + '.');
		}
		return true;
	});
};

var validatePublicKeys = exports.validatePublicKeys = function validatePublicKeys(publicKeys) {
	return publicKeys.every(validatePublicKey) && checkPublicKeysForDuplicates(publicKeys);
};

var validateKeysgroup = exports.validateKeysgroup = function validateKeysgroup(keysgroup) {
	if (keysgroup.length === 0 || keysgroup.length > 16) {
		throw new Error('Expected between 1 and 16 public keys in the keysgroup.');
	}
	return validatePublicKeys(keysgroup);
};

var validateAddress = exports.validateAddress = function validateAddress(address) {
	if (address.length < 2 || address.length > 22) {
		throw new Error('Address length does not match requirements. Expected between 2 and 22 characters.');
	}

	if (address[address.length - 1] !== 'L') {
		throw new Error('Address format does not match requirements. Expected "L" at the end.');
	}

	var addressAsBignum = (0, _browserifyBignum2.default)(address.slice(0, -1));

	if (addressAsBignum.cmp((0, _browserifyBignum2.default)(_liskConstants.MAX_ADDRESS_NUMBER)) > 0) {
		throw new Error('Address format does not match requirements. Address out of maximum range.');
	}

	return true;
};