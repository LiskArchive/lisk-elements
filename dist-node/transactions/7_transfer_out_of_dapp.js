'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./constants');

var _utils = require('./utils');

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
var transferOutOfDapp = function transferOutOfDapp(_ref) {
  var amount = _ref.amount,
      dappId = _ref.dappId,
      transactionId = _ref.transactionId,
      recipientId = _ref.recipientId;
  return {
    type: 7,
    amount: amount.toString(),
    fee: _constants.OUT_TRANSFER_FEE.toString(),
    recipientId: recipientId,
    asset: {
      outTransfer: {
        dappId: dappId,
        transactionId: transactionId
      }
    }
  };
};

exports.default = (0, _utils.wrapTransactionCreator)(transferOutOfDapp);