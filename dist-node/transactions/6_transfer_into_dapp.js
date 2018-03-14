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
var transferIntoDapp = function transferIntoDapp(_ref) {
  var amount = _ref.amount,
      dappId = _ref.dappId;
  return {
    type: 6,
    amount: amount.toString(),
    fee: _constants.IN_TRANSFER_FEE.toString(),
    asset: {
      inTransfer: {
        dappId: dappId
      }
    }
  };
};

exports.default = (0, _utils.wrapTransactionCreator)(transferIntoDapp);