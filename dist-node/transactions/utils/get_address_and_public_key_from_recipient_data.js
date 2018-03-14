'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _cryptography = require('../../cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getAddressAndPublicKeyFromRecipientData = function getAddressAndPublicKeyFromRecipientData(_ref) {
	var recipientId = _ref.recipientId,
	    recipientPublicKey = _ref.recipientPublicKey;

	if (recipientId && recipientPublicKey) {
		var addressFromPublicKey = _cryptography2.default.getAddressFromPublicKey(recipientPublicKey);
		if (recipientId === addressFromPublicKey) {
			return { address: recipientId, publicKey: recipientPublicKey };
		}
		throw new Error('Could not create transaction: recipientId does not match recipientPublicKey.');
	}

	if (!recipientId && recipientPublicKey) {
		var _addressFromPublicKey = _cryptography2.default.getAddressFromPublicKey(recipientPublicKey);
		return { address: _addressFromPublicKey, publicKey: recipientPublicKey };
	}

	return { address: recipientId, publicKey: null };
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
exports.default = getAddressAndPublicKeyFromRecipientData;