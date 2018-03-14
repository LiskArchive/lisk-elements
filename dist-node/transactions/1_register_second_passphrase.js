'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cryptography = require('../cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _constants = require('./constants');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registerSecondPassphrase = function registerSecondPassphrase(_ref) {
  var secondPassphrase = _ref.secondPassphrase;

  var _cryptography$getKeys = _cryptography2.default.getKeys(secondPassphrase),
      publicKey = _cryptography$getKeys.publicKey;

  return {
    type: 1,
    fee: _constants.SIGNATURE_FEE.toString(),
    asset: {
      signature: {
        publicKey: publicKey
      }
    }
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
exports.default = (0, _utils.wrapTransactionCreator)(registerSecondPassphrase);