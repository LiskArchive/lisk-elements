'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _sign_and_verify = require('./sign_and_verify');

var _get_transaction_id = require('./get_transaction_id');

var _get_transaction_id2 = _interopRequireDefault(_get_transaction_id);

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
var secondSignTransaction = function secondSignTransaction(transactionObject, secondPassphrase) {
	return (0, _assign2.default)({}, transactionObject, {
		signSignature: (0, _sign_and_verify.signTransaction)(transactionObject, secondPassphrase)
	});
};

var prepareTransaction = function prepareTransaction(transaction, passphrase, secondPassphrase) {
	var singleSignedTransaction = (0, _assign2.default)({}, transaction, {
		signature: (0, _sign_and_verify.signTransaction)(transaction, passphrase)
	});

	var signedTransaction = typeof secondPassphrase === 'string' && transaction.type !== 1 ? secondSignTransaction(singleSignedTransaction, secondPassphrase) : singleSignedTransaction;

	var transactionWithId = (0, _assign2.default)({}, signedTransaction, {
		id: (0, _get_transaction_id2.default)(signedTransaction)
	});

	return transactionWithId;
};

exports.default = prepareTransaction;