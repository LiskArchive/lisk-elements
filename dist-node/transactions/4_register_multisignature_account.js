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
var registerMultisignatureAccount = function registerMultisignatureAccount(_ref) {
	var keysgroup = _ref.keysgroup,
	    lifetime = _ref.lifetime,
	    minimum = _ref.minimum;

	(0, _utils.validateKeysgroup)(keysgroup);

	var plusPrependedKeysgroup = (0, _utils.prependPlusToPublicKeys)(keysgroup);
	var keygroupFees = plusPrependedKeysgroup.length + 1;

	return {
		type: 4,
		fee: (_constants.MULTISIGNATURE_FEE * keygroupFees).toString(),
		asset: {
			multisignature: {
				min: minimum,
				lifetime: lifetime,
				keysgroup: plusPrependedKeysgroup
			}
		}
	};
};

exports.default = (0, _utils.wrapTransactionCreator)(registerMultisignatureAccount);