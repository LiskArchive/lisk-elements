'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cryptography = require('../../cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _get_transaction_bytes = require('./get_transaction_bytes');

var _get_transaction_bytes2 = _interopRequireDefault(_get_transaction_bytes);

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
var getTransactionHash = function getTransactionHash(transaction) {
  var bytes = (0, _get_transaction_bytes2.default)(transaction);
  return _cryptography2.default.hash(bytes);
};

exports.default = getTransactionHash;