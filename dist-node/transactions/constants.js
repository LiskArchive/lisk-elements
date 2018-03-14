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

var FIXED_POINT = exports.FIXED_POINT = Math.pow(10, 8);

var TRANSFER_FEE = exports.TRANSFER_FEE = 0.1 * FIXED_POINT;
var DATA_FEE = exports.DATA_FEE = 0.1 * FIXED_POINT;
var IN_TRANSFER_FEE = exports.IN_TRANSFER_FEE = 0.1 * FIXED_POINT;
var OUT_TRANSFER_FEE = exports.OUT_TRANSFER_FEE = 0.1 * FIXED_POINT;
var SIGNATURE_FEE = exports.SIGNATURE_FEE = 5 * FIXED_POINT;
var DELEGATE_FEE = exports.DELEGATE_FEE = 25 * FIXED_POINT;
var VOTE_FEE = exports.VOTE_FEE = 1 * FIXED_POINT;
var MULTISIGNATURE_FEE = exports.MULTISIGNATURE_FEE = 5 * FIXED_POINT;
var DAPP_FEE = exports.DAPP_FEE = 25 * FIXED_POINT;