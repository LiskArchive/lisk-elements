'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTimeWithOffset = exports.getTimeFromBlockchainEpoch = undefined;

var _liskConstants = require('../../lisk-constants');

var getTimeFromBlockchainEpoch = exports.getTimeFromBlockchainEpoch = function getTimeFromBlockchainEpoch(givenTimestamp) {
  var startingPoint = givenTimestamp || new Date().getTime();
  var blockchainInitialTime = _liskConstants.EPOCH_TIME_MILLISECONDS;
  return Math.floor((startingPoint - blockchainInitialTime) / 1000);
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

var getTimeWithOffset = exports.getTimeWithOffset = function getTimeWithOffset(offset) {
  var now = new Date().getTime();
  var timeWithOffset = offset ? now + offset * 1000 : now;
  return getTimeFromBlockchainEpoch(timeWithOffset);
};