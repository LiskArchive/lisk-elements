"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var prependPlusToPublicKeys = exports.prependPlusToPublicKeys = function prependPlusToPublicKeys(publicKeys) {
  return publicKeys.map(function (publicKey) {
    return "+" + publicKey;
  });
};

var prependMinusToPublicKeys = exports.prependMinusToPublicKeys = function prependMinusToPublicKeys(publicKeys) {
  return publicKeys.map(function (publicKey) {
    return "-" + publicKey;
  });
};