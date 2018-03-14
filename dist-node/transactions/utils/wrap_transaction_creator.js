'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _cryptography = require('../../cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _prepare_transaction = require('./prepare_transaction');

var _prepare_transaction2 = _interopRequireDefault(_prepare_transaction);

var _time = require('./time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wrapTransactionCreator = function wrapTransactionCreator(transactionCreator) {
	return function (transactionParameters) {
		var passphrase = transactionParameters.passphrase,
		    secondPassphrase = transactionParameters.secondPassphrase,
		    timeOffset = transactionParameters.timeOffset;


		var senderPublicKey = passphrase ? _cryptography2.default.getKeys(passphrase).publicKey : null;
		var timestamp = (0, _time.getTimeWithOffset)(timeOffset);

		var transaction = (0, _assign2.default)({
			amount: '0',
			recipientId: '',
			senderPublicKey: senderPublicKey,
			timestamp: timestamp
		}, transactionCreator(transactionParameters));

		return passphrase ? (0, _prepare_transaction2.default)(transaction, passphrase, secondPassphrase) : transaction;
	};
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
exports.default = wrapTransactionCreator;